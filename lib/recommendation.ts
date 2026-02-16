import { AuctionItem, AuctionResult } from "@prisma/client";
import { calculateDiscountRate } from "./utils";

// 추천 설정 타입
export interface RecommendationWeights {
  discountWeight: number;      // 할인매력 가중치
  competitionWeight: number;    // 경쟁도 가중치
  auctionRoundWeight: number;   // 유찰상태 가중치
  riskWeight: number;           // 리스크 가중치
  urgencyWeight: number;        // 입찰 임박성 가중치
}

export const DEFAULT_WEIGHTS: RecommendationWeights = {
  discountWeight: 0.30,
  competitionWeight: 0.25,
  auctionRoundWeight: 0.20,
  riskWeight: 0.15,
  urgencyWeight: 0.10,
};

// 추천 점수 구성 요소
export interface ScoreComponents {
  discountScore: number;      // 할인 점수 (0-100)
  competitionScore: number;   // 경쟁도 점수 (0-100)
  auctionRoundScore: number;  // 유찰상태 점수 (0-100)
  riskScore: number;          // 리스크 점수 (0-100)
  urgencyScore: number;       // 입찰 임박성 점수 (0-100)
}

// 추천 결과
export interface RecommendationResult {
  score: number;                // 최종 점수 (0-100)
  components: ScoreComponents;  // 점수 구성 요소
  reasons: string[];            // 추천 사유
  warnings: string[];           // 리스크 경고
}

/**
 * 할인 점수 계산
 * 할인율이 높을수록 높은 점수
 */
function calculateDiscountScore(item: AuctionItem): number {
  const discountRate = calculateDiscountRate(item.appraisalPrice, item.minimumBidPrice);

  // 할인율에 따른 점수 (0-100)
  // 0% 할인: 0점, 50% 할인: 100점
  const score = Math.min(100, (discountRate / 50) * 100);

  return Math.max(0, Math.min(100, score));
}

/**
 * 경쟁도 점수 계산 (평균 입찰자 수 기반)
 * 너무 경쟁이 없으면 문제가 있을 수 있고, 너무 과열되면 낙찰 어려움
 */
function calculateCompetitionScore(
  item: AuctionItem,
  results: AuctionResult[]
): number {
  if (results.length === 0) {
    // 결과가 없으면 중간 점수
    return 50;
  }

  const avgBidderCount =
    results.reduce((sum, r) => sum + r.bidderCount, 0) / results.length;

  // 이상적인 입찰자 수: 2-4명 (적당한 경쟁)
  let score = 0;
  if (avgBidderCount === 0) {
    score = 20; // 경쟁 없음 (문제가 있을 수 있음)
  } else if (avgBidderCount >= 1 && avgBidderCount <= 2) {
    score = 70; // 적당한 경쟁
  } else if (avgBidderCount > 2 && avgBidderCount <= 4) {
    score = 90; // 건강한 경쟁
  } else if (avgBidderCount > 4 && avgBidderCount <= 6) {
    score = 70; // 약간 과열
  } else {
    score = 40; // 과열 (낙찰 어려움)
  }

  return score;
}

/**
 * 유찰 상태 점수 계산
 * 적당한 유찰(1-2회)은 가격 하락으로 기회, 너무 많으면 문제
 */
function calculateAuctionRoundScore(item: AuctionItem): number {
  const round = item.eventRound;

  if (round === 1) {
    return 60; // 첫 입찰 (기준 점수)
  } else if (round === 2) {
    return 85; // 1회 유찰 (좋은 기회)
  } else if (round === 3) {
    return 95; // 2회 유찰 (최적 기회)
  } else if (round === 4) {
    return 75; // 3회 유찰 (주의 필요)
  } else if (round === 5) {
    return 50; // 4회 유찰 (문제 가능성)
  } else {
    return 25; // 5회 이상 (심각한 문제 가능성)
  }
}

/**
 * 리스크 점수 계산
 * 리스크 플래그가 적을수록 높은 점수
 */
function calculateRiskScore(item: AuctionItem): number {
  const riskCount = item.riskFlags.length;

  if (riskCount === 0) {
    return 100; // 리스크 없음
  } else if (riskCount === 1) {
    return 70; // 경미한 리스크
  } else if (riskCount === 2) {
    return 45; // 중간 리스크
  } else if (riskCount === 3) {
    return 25; // 높은 리스크
  } else {
    return 10; // 매우 높은 리스크
  }
}

/**
 * 입찰 임박성 점수 계산
 * 준비 기간이 충분할수록 높은 점수
 */
function calculateUrgencyScore(item: AuctionItem): number {
  const now = new Date();
  const bidDate = new Date(item.bidDate);
  const daysUntilBid = Math.ceil(
    (bidDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilBid < 0) {
    return 0; // 이미 지남
  } else if (daysUntilBid <= 3) {
    return 30; // 너무 임박 (준비 부족 우려)
  } else if (daysUntilBid <= 7) {
    return 70; // 1주일 이내
  } else if (daysUntilBid <= 14) {
    return 95; // 2주일 이내 (적당한 준비 기간)
  } else if (daysUntilBid <= 30) {
    return 85; // 1개월 이내
  } else {
    return 60; // 너무 먼 미래
  }
}

/**
 * 추천 사유 생성
 */
function generateReasons(
  item: AuctionItem,
  components: ScoreComponents,
  results: AuctionResult[]
): string[] {
  const reasons: string[] = [];
  const discountRate = calculateDiscountRate(item.appraisalPrice, item.minimumBidPrice);

  // 할인 매력
  if (components.discountScore >= 70) {
    reasons.push(`높은 할인율 (${discountRate.toFixed(1)}%)`);
  }

  // 유찰 기회
  if (item.eventRound >= 2 && item.eventRound <= 3) {
    reasons.push(`${item.eventRound - 1}회 유찰로 가격 하락 기회`);
  }

  // 경쟁 상태
  if (results.length > 0) {
    const avgBidderCount =
      results.reduce((sum, r) => sum + r.bidderCount, 0) / results.length;
    if (avgBidderCount >= 2 && avgBidderCount <= 4) {
      reasons.push("적정 경쟁률 (건강한 시장)");
    }
  }

  // 리스크 낮음
  if (item.riskFlags.length === 0) {
    reasons.push("권리관계 리스크 낮음");
  }

  // 입찰일까지 준비 기간
  const daysUntilBid = Math.ceil(
    (new Date(item.bidDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysUntilBid >= 7 && daysUntilBid <= 21) {
    reasons.push("충분한 준비 기간 확보");
  }

  return reasons.slice(0, 5); // 최대 5개
}

/**
 * 리스크 경고 생성
 */
function generateWarnings(item: AuctionItem): string[] {
  const warnings: string[] = [];

  // 리스크 플래그
  if (item.riskFlags.includes("유치권")) {
    warnings.push("⚠️ 유치권 가능성 - 전문가 상담 필수");
  }
  if (item.riskFlags.includes("법정지상권")) {
    warnings.push("⚠️ 법정지상권 발생 가능 - 권리분석 필요");
  }
  if (item.riskFlags.includes("분묘기지권")) {
    warnings.push("⚠️ 분묘기지권 리스크 - 현장 확인 필수");
  }
  if (item.riskFlags.includes("점유자")) {
    warnings.push("⚠️ 점유자 존재 - 명도 절차 필요");
  }
  if (item.riskFlags.includes("공유지분")) {
    warnings.push("⚠️ 공유지분 - 공유자와의 협의 필요");
  }

  // 과도한 유찰
  if (item.eventRound >= 5) {
    warnings.push("⚠️ 과도한 유찰 횟수 - 숨겨진 문제 가능성");
  }

  // 권리관계 복잡
  if (item.riskFlags.length >= 3) {
    warnings.push("⚠️ 복잡한 권리관계 - 전문가 검토 필수");
  }

  return warnings;
}

/**
 * 추천 점수 계산 (메인 함수)
 */
export function calculateRecommendationScore(
  item: AuctionItem,
  results: AuctionResult[] = [],
  weights: RecommendationWeights = DEFAULT_WEIGHTS
): RecommendationResult {
  // 각 구성 요소 점수 계산
  const components: ScoreComponents = {
    discountScore: calculateDiscountScore(item),
    competitionScore: calculateCompetitionScore(item, results),
    auctionRoundScore: calculateAuctionRoundScore(item),
    riskScore: calculateRiskScore(item),
    urgencyScore: calculateUrgencyScore(item),
  };

  // 가중 평균으로 최종 점수 계산
  const score =
    components.discountScore * weights.discountWeight +
    components.competitionScore * weights.competitionWeight +
    components.auctionRoundScore * weights.auctionRoundWeight +
    components.riskScore * weights.riskWeight +
    components.urgencyScore * weights.urgencyWeight;

  // 추천 사유 및 경고 생성
  const reasons = generateReasons(item, components, results);
  const warnings = generateWarnings(item);

  return {
    score: Math.round(score * 100) / 100, // 소수점 2자리
    components,
    reasons,
    warnings,
  };
}
