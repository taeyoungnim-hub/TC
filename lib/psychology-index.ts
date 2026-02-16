import { prisma } from "./prisma";
import { TrendMetrics, TrendFilter, calculateTrendMetrics } from "./trends";

// 심리 지수 가중치
export interface PsychologyWeights {
  competitionWeight: number;    // 열기(경쟁) 가중치
  aggressionWeight: number;     // 공격성 가중치
  liquidityWeight: number;      // 유동성 가중치
  riskAversionWeight: number;   // 리스크회피 가중치
}

export const DEFAULT_PSYCHOLOGY_WEIGHTS: PsychologyWeights = {
  competitionWeight: 0.30,
  aggressionWeight: 0.30,
  liquidityWeight: 0.25,
  riskAversionWeight: 0.15,
};

// 심리 지수 구성 요소
export interface PsychologyComponents {
  competition: number;      // 열기 (0-100)
  aggression: number;       // 공격성 (0-100)
  liquidity: number;        // 유동성 (0-100)
  riskAversion: number;     // 리스크회피 (0-100)
}

// 심리 지수 결과
export interface PsychologyIndexResult {
  indexValue: number;                  // 심리 지수 (0-100)
  components: PsychologyComponents;    // 구성 요소
  interpretation: string;               // 해석
  signal: "과열" | "적정" | "관망" | "침체"; // 시장 신호
}

/**
 * 열기(Competition) 계산
 * 최근 평균 입찰자 수 vs 과거 평균 입찰자 수
 */
async function calculateCompetitionScore(
  regionKey: string,
  propertyType: string
): Promise<number> {
  // 최근 4주 데이터
  const recent4Weeks = await calculateTrendMetrics({
    regionKey,
    propertyType,
    startDate: getDateBefore(28), // 4주
    endDate: new Date(),
  });

  // 과거 12개월 데이터
  const past12Months = await calculateTrendMetrics({
    regionKey,
    propertyType,
    startDate: getDateBefore(365), // 12개월
    endDate: new Date(),
  });

  const recentCompetition = recent4Weeks.avgCompetition;
  const pastCompetition = past12Months.avgCompetition;

  if (pastCompetition === 0) {
    return 50; // 기준 데이터 없음
  }

  // 변화율 계산
  const changeRate = ((recentCompetition - pastCompetition) / pastCompetition) * 100;

  // 점수 변환 (-50% ~ +50% 변화를 0 ~ 100 점수로)
  let score = 50 + changeRate; // 변화율을 점수에 반영
  score = Math.max(0, Math.min(100, score));

  return score;
}

/**
 * 공격성(Aggression) 계산
 * 최근 평균 낙찰가율 vs 과거 평균 낙찰가율
 */
async function calculateAggressionScore(
  regionKey: string,
  propertyType: string
): Promise<number> {
  const recent4Weeks = await calculateTrendMetrics({
    regionKey,
    propertyType,
    startDate: getDateBefore(28),
    endDate: new Date(),
  });

  const past12Months = await calculateTrendMetrics({
    regionKey,
    propertyType,
    startDate: getDateBefore(365),
    endDate: new Date(),
  });

  const recentWinningRate = recent4Weeks.avgWinningRate;
  const pastWinningRate = past12Months.avgWinningRate;

  if (pastWinningRate === 0) {
    return 50;
  }

  // 낙찰가율 변화 (높을수록 공격적)
  const changeRate = ((recentWinningRate - pastWinningRate) / pastWinningRate) * 100;

  // 점수 변환
  let score = 50 + changeRate * 2; // 변화를 증폭해서 점수 반영
  score = Math.max(0, Math.min(100, score));

  return score;
}

/**
 * 유동성(Liquidity) 계산
 * 낙찰률과 평균 유찰 횟수 기반
 */
async function calculateLiquidityScore(
  regionKey: string,
  propertyType: string
): Promise<number> {
  const recentMetrics = await calculateTrendMetrics({
    regionKey,
    propertyType,
    startDate: getDateBefore(28),
    endDate: new Date(),
  });

  const successRate = recentMetrics.successRate;
  const avgAuctionRound = recentMetrics.avgAuctionRound;

  // 낙찰률이 높을수록 높은 점수
  let score = successRate;

  // 평균 유찰 횟수가 낮을수록 추가 점수
  if (avgAuctionRound <= 1.5) {
    score += 10;
  } else if (avgAuctionRound > 3) {
    score -= 20;
  }

  score = Math.max(0, Math.min(100, score));

  return score;
}

/**
 * 리스크회피(Risk Aversion) 계산
 * 평균 할인율 변화 (할인율이 높아지면 안전지향)
 */
async function calculateRiskAversionScore(
  regionKey: string,
  propertyType: string
): Promise<number> {
  const recent4Weeks = await calculateTrendMetrics({
    regionKey,
    propertyType,
    startDate: getDateBefore(28),
    endDate: new Date(),
  });

  const past12Months = await calculateTrendMetrics({
    regionKey,
    propertyType,
    startDate: getDateBefore(365),
    endDate: new Date(),
  });

  const recentDiscount = recent4Weeks.avgDiscountRate;
  const pastDiscount = past12Months.avgDiscountRate;

  if (pastDiscount === 0) {
    return 50;
  }

  // 할인율이 높아지면 리스크 회피 성향 (낮은 점수)
  // 할인율이 낮아지면 공격적 성향 (높은 점수)
  const changeRate = ((recentDiscount - pastDiscount) / pastDiscount) * 100;

  let score = 50 - changeRate; // 할인율 증가 = 리스크 회피 = 낮은 점수
  score = Math.max(0, Math.min(100, score));

  return score;
}

/**
 * 심리 지수 계산 (메인 함수)
 */
export async function calculatePsychologyIndex(
  regionKey: string,
  propertyType: string,
  weights: PsychologyWeights = DEFAULT_PSYCHOLOGY_WEIGHTS
): Promise<PsychologyIndexResult> {
  // 각 구성 요소 계산
  const components: PsychologyComponents = {
    competition: await calculateCompetitionScore(regionKey, propertyType),
    aggression: await calculateAggressionScore(regionKey, propertyType),
    liquidity: await calculateLiquidityScore(regionKey, propertyType),
    riskAversion: await calculateRiskAversionScore(regionKey, propertyType),
  };

  // 가중 평균으로 최종 지수 계산
  const indexValue =
    components.competition * weights.competitionWeight +
    components.aggression * weights.aggressionWeight +
    components.liquidity * weights.liquidityWeight +
    components.riskAversion * weights.riskAversionWeight;

  const roundedIndex = Math.round(indexValue * 100) / 100;

  // 해석 및 신호 생성
  const { interpretation, signal } = interpretIndex(roundedIndex);

  return {
    indexValue: roundedIndex,
    components: {
      competition: Math.round(components.competition * 100) / 100,
      aggression: Math.round(components.aggression * 100) / 100,
      liquidity: Math.round(components.liquidity * 100) / 100,
      riskAversion: Math.round(components.riskAversion * 100) / 100,
    },
    interpretation,
    signal,
  };
}

/**
 * 심리 지수 해석
 */
function interpretIndex(indexValue: number): {
  interpretation: string;
  signal: "과열" | "적정" | "관망" | "침체";
} {
  if (indexValue >= 70) {
    return {
      interpretation:
        "경매 시장이 과열 상태입니다. 높은 경쟁과 공격적인 입찰로 낙찰가가 상승하고 있습니다. 신중한 접근이 필요합니다.",
      signal: "과열",
    };
  } else if (indexValue >= 50) {
    return {
      interpretation:
        "경매 시장이 적정 수준입니다. 건강한 경쟁과 합리적인 낙찰가가 형성되고 있습니다. 투자 기회를 찾기 좋은 시기입니다.",
      signal: "적정",
    };
  } else if (indexValue >= 30) {
    return {
      interpretation:
        "경매 시장이 관망세입니다. 낙찰률이 낮고 입찰자가 감소하고 있습니다. 좋은 물건을 신중하게 선별할 시기입니다.",
      signal: "관망",
    };
  } else {
    return {
      interpretation:
        "경매 시장이 침체 상태입니다. 매우 낮은 경쟁과 유동성으로 거래가 부진합니다. 시장 회복을 기다리거나 저가 기회를 찾을 수 있습니다.",
      signal: "침체",
    };
  }
}

/**
 * 심리 지수 스냅샷 저장
 */
export async function savePsychologyIndexSnapshot(
  date: Date,
  regionKey: string,
  propertyType: string,
  result: PsychologyIndexResult
): Promise<void> {
  await prisma.psychologyIndexSnapshot.upsert({
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
      indexValue: result.indexValue,
      components: result.components as any,
    },
    update: {
      indexValue: result.indexValue,
      components: result.components as any,
    },
  });
}

/**
 * 시계열 심리 지수 데이터 조회
 */
export async function getTimeSeriesPsychologyIndex(
  regionKey: string,
  propertyType: string,
  months: number = 6
): Promise<
  Array<{ date: Date; indexValue: number; components: PsychologyComponents }>
> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const snapshots = await prisma.psychologyIndexSnapshot.findMany({
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
    indexValue: s.indexValue,
    components: s.components as PsychologyComponents,
  }));
}

/**
 * 유틸: N일 전 날짜 가져오기
 */
function getDateBefore(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}
