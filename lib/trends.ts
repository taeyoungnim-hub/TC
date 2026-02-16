import { AuctionItem, AuctionResult } from "@prisma/client";
import { prisma } from "./prisma";

// 트렌드 지표 타입
export interface TrendMetrics {
  totalItems: number;           // 총 물건 수
  newItems: number;             // 신규 물건 수
  ongoingItems: number;         // 진행 중 물건 수
  wonItems: number;             // 낙찰 물건 수
  failedItems: number;          // 유찰 물건 수

  failureRate: number;          // 유찰률 (%)
  successRate: number;          // 낙찰률 (%)

  avgWinningRate: number;       // 평균 낙찰가율 (낙찰가 ÷ 감정가)
  medianWinningRate: number;    // 중위 낙찰가율

  avgDiscountRate: number;      // 평균 할인율 (1 - 최저가 ÷ 감정가)
  avgCompetition: number;       // 평균 경쟁률 (입찰자 수)
  avgAuctionRound: number;      // 평균 유찰 횟수
}

// 트렌드 필터 조건
export interface TrendFilter {
  regionKey?: string;           // 지역 (예: "서울-강남구", "전국")
  propertyType?: string;        // 물건종류 (또는 "전체")
  startDate: Date;              // 시작일
  endDate: Date;                // 종료일
}

/**
 * 트렌드 지표 계산
 */
export async function calculateTrendMetrics(
  filter: TrendFilter
): Promise<TrendMetrics> {
  // 물건 조회 조건 생성
  const where: any = {
    createdAt: {
      gte: filter.startDate,
      lte: filter.endDate,
    },
  };

  if (filter.regionKey && filter.regionKey !== "전국") {
    const [siDo, siGunGu] = filter.regionKey.split("-");
    if (siGunGu) {
      where.regionSiDo = siDo;
      where.regionSiGunGu = siGunGu;
    } else {
      where.regionSiDo = siDo;
    }
  }

  if (filter.propertyType && filter.propertyType !== "전체") {
    where.propertyType = filter.propertyType;
  }

  // 물건 데이터 조회
  const items = await prisma.auctionItem.findMany({
    where,
    include: {
      results: true,
    },
  });

  const totalItems = items.length;
  if (totalItems === 0) {
    return {
      totalItems: 0,
      newItems: 0,
      ongoingItems: 0,
      wonItems: 0,
      failedItems: 0,
      failureRate: 0,
      successRate: 0,
      avgWinningRate: 0,
      medianWinningRate: 0,
      avgDiscountRate: 0,
      avgCompetition: 0,
      avgAuctionRound: 0,
    };
  }

  // 상태별 집계
  const ongoingItems = items.filter((i) => i.status === "진행").length;
  const wonItems = items.filter((i) => i.status === "낙찰").length;
  const failedItems = items.filter((i) => i.status === "유찰").length;

  // 비율 계산
  const completedItems = wonItems + failedItems;
  const failureRate = completedItems > 0 ? (failedItems / completedItems) * 100 : 0;
  const successRate = completedItems > 0 ? (wonItems / completedItems) * 100 : 0;

  // 낙찰가율 계산 (낙찰된 물건만)
  const wonItemsWithResults = items.filter(
    (i) => i.status === "낙찰" && i.results.length > 0
  );
  const winningRates = wonItemsWithResults.map((item) => {
    const result = item.results[item.results.length - 1]; // 최신 결과
    return (Number(result.winningBidPrice) / Number(item.appraisalPrice)) * 100;
  });

  const avgWinningRate =
    winningRates.length > 0
      ? winningRates.reduce((sum, rate) => sum + rate, 0) / winningRates.length
      : 0;

  const medianWinningRate =
    winningRates.length > 0
      ? calculateMedian(winningRates)
      : 0;

  // 할인율 계산
  const discountRates = items.map(
    (item) =>
      (1 - Number(item.minimumBidPrice) / Number(item.appraisalPrice)) * 100
  );
  const avgDiscountRate =
    discountRates.reduce((sum, rate) => sum + rate, 0) / discountRates.length;

  // 경쟁률 계산 (결과가 있는 물건만)
  const itemsWithResults = items.filter((i) => i.results.length > 0);
  const bidderCounts = itemsWithResults.flatMap((item) =>
    item.results.map((r) => r.bidderCount)
  );
  const avgCompetition =
    bidderCounts.length > 0
      ? bidderCounts.reduce((sum, count) => sum + count, 0) / bidderCounts.length
      : 0;

  // 평균 유찰 횟수
  const avgAuctionRound =
    items.reduce((sum, item) => sum + item.eventRound, 0) / items.length;

  // 신규 물건 (eventRound === 1)
  const newItems = items.filter((i) => i.eventRound === 1).length;

  return {
    totalItems,
    newItems,
    ongoingItems,
    wonItems,
    failedItems,
    failureRate: Math.round(failureRate * 100) / 100,
    successRate: Math.round(successRate * 100) / 100,
    avgWinningRate: Math.round(avgWinningRate * 100) / 100,
    medianWinningRate: Math.round(medianWinningRate * 100) / 100,
    avgDiscountRate: Math.round(avgDiscountRate * 100) / 100,
    avgCompetition: Math.round(avgCompetition * 100) / 100,
    avgAuctionRound: Math.round(avgAuctionRound * 100) / 100,
  };
}

/**
 * 중위값 계산
 */
function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  } else {
    return sorted[mid];
  }
}

/**
 * 트렌드 스냅샷 저장
 */
export async function saveTrendSnapshot(
  date: Date,
  regionKey: string,
  propertyType: string,
  metrics: TrendMetrics
): Promise<void> {
  await prisma.trendSnapshot.upsert({
    where: {
      date_regionKey_propertyType: {
        date,
        regionKey,
        propertyType,
      },
    },
    create: {
      date,
      regionKey,
      propertyType,
      metrics: metrics as any,
    },
    update: {
      metrics: metrics as any,
    },
  });
}

/**
 * 시계열 트렌드 데이터 조회
 */
export async function getTimeSeriesTrends(
  regionKey: string,
  propertyType: string,
  months: number = 6
): Promise<Array<{ date: Date; metrics: TrendMetrics }>> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const snapshots = await prisma.trendSnapshot.findMany({
    where: {
      regionKey,
      propertyType,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: {
      date: "asc",
    },
  });

  return snapshots.map((s) => ({
    date: s.date,
    metrics: s.metrics as TrendMetrics,
  }));
}
