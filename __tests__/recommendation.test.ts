import { calculateRecommendationScore, DEFAULT_WEIGHTS } from "@/lib/recommendation";
import { AuctionItem, AuctionResult } from "@prisma/client";

describe("Recommendation Logic", () => {
  const baseItem: AuctionItem = {
    id: "test-1",
    sourceName: "테스트",
    sourceUrl: null,
    caseNumber: "2024타경12345",
    court: "서울중앙지방법원",
    eventRound: 1,
    propertyType: "아파트",
    address: "서울 강남구 테스트동 123",
    regionSiDo: "서울",
    regionSiGunGu: "강남구",
    regionEupMyeonDong: null,
    lat: null,
    lng: null,
    appraisalPrice: BigInt(500000000),
    minimumBidPrice: BigInt(350000000),
    bidDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14일 후
    status: "진행",
    photoUrls: [],
    occupancyStatus: "공실",
    tenantNotes: null,
    rightsNotes: "특이사항 없음",
    riskFlags: [],
    unusualTags: [],
    editorNote: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  test("할인율이 높을수록 높은 점수", () => {
    const item1 = {
      ...baseItem,
      minimumBidPrice: BigInt(400000000), // 20% 할인
    };

    const item2 = {
      ...baseItem,
      minimumBidPrice: BigInt(250000000), // 50% 할인
    };

    const result1 = calculateRecommendationScore(item1);
    const result2 = calculateRecommendationScore(item2);

    expect(result2.components.discountScore).toBeGreaterThan(result1.components.discountScore);
  });

  test("리스크 플래그가 많을수록 낮은 점수", () => {
    const item1 = {
      ...baseItem,
      riskFlags: [],
    };

    const item2 = {
      ...baseItem,
      riskFlags: ["유치권", "법정지상권", "점유자"],
    };

    const result1 = calculateRecommendationScore(item1);
    const result2 = calculateRecommendationScore(item2);

    expect(result1.components.riskScore).toBeGreaterThan(result2.components.riskScore);
  });

  test("2-3회차 유찰이 가장 높은 점수", () => {
    const item1 = { ...baseItem, eventRound: 1 };
    const item2 = { ...baseItem, eventRound: 2 };
    const item3 = { ...baseItem, eventRound: 3 };
    const item4 = { ...baseItem, eventRound: 6 };

    const result1 = calculateRecommendationScore(item1);
    const result2 = calculateRecommendationScore(item2);
    const result3 = calculateRecommendationScore(item3);
    const result4 = calculateRecommendationScore(item4);

    expect(result3.components.auctionRoundScore).toBeGreaterThan(result1.components.auctionRoundScore);
    expect(result3.components.auctionRoundScore).toBeGreaterThan(result4.components.auctionRoundScore);
  });

  test("입찰일이 7-21일 사이일 때 높은 점수", () => {
    const item1 = {
      ...baseItem,
      bidDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2일 후
    };

    const item2 = {
      ...baseItem,
      bidDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14일 후
    };

    const item3 = {
      ...baseItem,
      bidDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60일 후
    };

    const result1 = calculateRecommendationScore(item1);
    const result2 = calculateRecommendationScore(item2);
    const result3 = calculateRecommendationScore(item3);

    expect(result2.components.urgencyScore).toBeGreaterThan(result1.components.urgencyScore);
    expect(result2.components.urgencyScore).toBeGreaterThan(result3.components.urgencyScore);
  });

  test("최종 점수는 0-100 사이", () => {
    const item = {
      ...baseItem,
      minimumBidPrice: BigInt(100000000), // 80% 할인
      eventRound: 3,
      riskFlags: [],
    };

    const result = calculateRecommendationScore(item);

    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  test("추천 사유가 생성됨", () => {
    const item = {
      ...baseItem,
      minimumBidPrice: BigInt(200000000), // 60% 할인
      eventRound: 2,
      riskFlags: [],
    };

    const result = calculateRecommendationScore(item);

    expect(result.reasons.length).toBeGreaterThan(0);
    expect(result.reasons.some(r => r.includes("할인"))).toBe(true);
  });

  test("리스크 경고가 생성됨", () => {
    const item = {
      ...baseItem,
      riskFlags: ["유치권", "법정지상권"],
      eventRound: 6,
    };

    const result = calculateRecommendationScore(item);

    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings.some(w => w.includes("유치권"))).toBe(true);
  });
});
