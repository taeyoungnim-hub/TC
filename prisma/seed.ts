import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 한국 지역 데이터
const REGIONS = [
  { siDo: "서울", siGunGu: ["강남구", "서초구", "송파구", "강동구", "마포구", "영등포구", "강서구", "양천구", "구로구", "관악구"] },
  { siDo: "경기", siGunGu: ["성남시", "고양시", "용인시", "수원시", "부천시", "안산시", "남양주시", "화성시", "평택시", "의정부시"] },
  { siDo: "인천", siGunGu: ["남동구", "부평구", "서구", "계양구", "연수구"] },
  { siDo: "부산", siGunGu: ["해운대구", "부산진구", "동래구", "남구", "북구"] },
  { siDo: "대구", siGunGu: ["수성구", "달서구", "북구", "동구"] },
  { siDo: "대전", siGunGu: ["서구", "유성구", "중구", "대덕구"] },
  { siDo: "광주", siGunGu: ["서구", "남구", "북구", "광산구"] },
  { siDo: "울산", siGunGu: ["남구", "중구", "동구"] },
  { siDo: "세종", siGunGu: ["세종시"] },
  { siDo: "강원", siGunGu: ["춘천시", "원주시", "강릉시"] },
  { siDo: "충북", siGunGu: ["청주시", "충주시"] },
  { siDo: "충남", siGunGu: ["천안시", "아산시"] },
  { siDo: "전북", siGunGu: ["전주시", "익산시"] },
  { siDo: "전남", siGunGu: ["목포시", "여수시", "순천시"] },
  { siDo: "경북", siGunGu: ["포항시", "경주시", "구미시"] },
  { siDo: "경남", siGunGu: ["창원시", "김해시", "진주시"] },
  { siDo: "제주", siGunGu: ["제주시", "서귀포시"] },
];

// 물건 종류
const PROPERTY_TYPES = [
  "아파트",
  "오피스텔",
  "다세대",
  "다가구",
  "단독주택",
  "상가",
  "근린생활시설",
  "토지",
  "임야",
  "공장",
  "창고",
  "빌딩",
];

// 법원
const COURTS = [
  "서울중앙지방법원",
  "서울동부지방법원",
  "서울남부지방법원",
  "서울북부지방법원",
  "서울서부지방법원",
  "의정부지방법원",
  "인천지방법원",
  "수원지방법원",
  "부산지방법원",
  "대구지방법원",
  "대전지방법원",
  "광주지방법원",
  "울산지방법원",
  "춘천지방법원",
  "청주지방법원",
  "전주지방법원",
  "창원지방법원",
  "제주지방법원",
];

// 상태
const STATUSES = ["진행", "낙찰", "유찰", "취하"];

// 점유 상태
const OCCUPANCY_STATUSES = ["공실", "점유", "불명"];

// 리스크 플래그
const RISK_FLAGS = [
  "유치권",
  "법정지상권",
  "분묘기지권",
  "점유자",
  "공유지분",
  "가압류",
  "근저당",
  "전세권",
  "임차권",
];

// 이색 태그
const UNUSUAL_TAGS = [
  "지분경매",
  "섬/오지",
  "도로인접",
  "하천인접",
  "분묘리스크",
  "법정지상권가능성",
  "개발예정지역",
  "용도지역변경가능",
  "대규모토지",
  "공장/창고",
  "특수권리관계",
  "구거/도로",
  "공유지분",
];

// 랜덤 유틸리티 함수
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomChoices<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function randomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// 경매 물건 생성
async function createAuctionItems(count: number) {
  console.log(`Creating ${count} auction items...`);
  const items = [];

  for (let i = 0; i < count; i++) {
    const region = randomChoice(REGIONS);
    const siDo = region.siDo;
    const siGunGu = randomChoice(region.siGunGu);
    const propertyType = randomChoice(PROPERTY_TYPES);
    const court = randomChoice(COURTS);
    const eventRound = randomInt(1, 6);
    const status = randomChoice(STATUSES);

    // 감정가 (물건 종류에 따라)
    let basePrice: bigint;
    if (propertyType === "아파트") {
      basePrice = BigInt(randomInt(200_000_000, 1_500_000_000));
    } else if (propertyType === "오피스텔") {
      basePrice = BigInt(randomInt(150_000_000, 800_000_000));
    } else if (propertyType === "다세대" || propertyType === "다가구") {
      basePrice = BigInt(randomInt(100_000_000, 500_000_000));
    } else if (propertyType === "단독주택") {
      basePrice = BigInt(randomInt(200_000_000, 1_000_000_000));
    } else if (propertyType === "상가" || propertyType === "근린생활시설") {
      basePrice = BigInt(randomInt(300_000_000, 2_000_000_000));
    } else if (propertyType === "토지") {
      basePrice = BigInt(randomInt(100_000_000, 5_000_000_000));
    } else if (propertyType === "임야") {
      basePrice = BigInt(randomInt(50_000_000, 500_000_000));
    } else if (propertyType === "공장" || propertyType === "창고") {
      basePrice = BigInt(randomInt(500_000_000, 3_000_000_000));
    } else if (propertyType === "빌딩") {
      basePrice = BigInt(randomInt(2_000_000_000, 10_000_000_000));
    } else {
      basePrice = BigInt(randomInt(100_000_000, 1_000_000_000));
    }

    // 최저입찰가 (감정가의 70-80% 정도, 회차에 따라 감소)
    const discountFactor = 0.8 - (eventRound - 1) * 0.1;
    const minimumBidPrice = BigInt(
      Math.floor(Number(basePrice) * Math.max(0.3, discountFactor))
    );

    // 입찰일 (과거 3개월 ~ 미래 2개월)
    const createdAt = randomDate(
      new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      new Date()
    );
    const bidDate = randomDate(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
    );

    // 리스크 플래그 (0-3개)
    const riskFlagCount = Math.random() < 0.3 ? randomInt(1, 3) : 0;
    const riskFlags =
      riskFlagCount > 0 ? randomChoices(RISK_FLAGS, riskFlagCount) : [];

    // 이색 태그 (0-2개, 10% 확률)
    const unusualTagCount = Math.random() < 0.1 ? randomInt(1, 2) : 0;
    const unusualTags =
      unusualTagCount > 0 ? randomChoices(UNUSUAL_TAGS, unusualTagCount) : [];

    // 주소 생성
    const address = `${siDo} ${siGunGu} ${randomChoice(["상계동", "중계동", "하계동", "월계동", "공릉동", "태릉동"])} ${randomInt(1, 999)}-${randomInt(1, 99)}`;

    const item = {
      sourceName: randomChoice(["테라경매", "지지옥션", "굿옥션", "온비드"]),
      sourceUrl: `https://example.com/auction/${randomInt(10000, 99999)}`,
      caseNumber: `${new Date().getFullYear()}타경${randomInt(10000, 99999)}`,
      court,
      eventRound,
      propertyType,
      address,
      regionSiDo: siDo,
      regionSiGunGu: siGunGu,
      regionEupMyeonDong: null,
      lat: null,
      lng: null,
      appraisalPrice: basePrice,
      minimumBidPrice,
      bidDate,
      status,
      photoUrls: [],
      occupancyStatus: Math.random() < 0.7 ? randomChoice(OCCUPANCY_STATUSES) : null,
      tenantNotes: Math.random() < 0.2 ? "임차인 1명 거주 중 (보증금 5천만원)" : null,
      rightsNotes:
        riskFlags.length > 0
          ? `${riskFlags.join(", ")} 등의 권리관계 존재`
          : "특이사항 없음",
      riskFlags,
      unusualTags,
      editorNote:
        Math.random() < 0.05
          ? "주변 개발 호재로 가격 상승 가능성 있음"
          : null,
      createdAt,
      updatedAt: createdAt,
    };

    items.push(item);
  }

  // 배치 삽입
  await prisma.auctionItem.createMany({
    data: items,
  });

  console.log(`Created ${items.length} auction items`);
  return items.length;
}

// 경매 결과 생성 (낙찰된 물건에 대해)
async function createAuctionResults() {
  console.log("Creating auction results...");

  const wonItems = await prisma.auctionItem.findMany({
    where: { status: "낙찰" },
  });

  const results = [];

  for (const item of wonItems) {
    // 낙찰가 (최저입찰가의 100-150%)
    const winningBidPrice = BigInt(
      Math.floor(Number(item.minimumBidPrice) * (1 + Math.random() * 0.5))
    );

    // 입찰자 수 (1-10명)
    const bidderCount = randomInt(1, 10);

    const result = {
      itemId: item.id,
      winningBidPrice,
      bidderCount,
      resultDate: addDays(new Date(item.bidDate), randomInt(1, 3)),
    };

    results.push(result);
  }

  if (results.length > 0) {
    await prisma.auctionResult.createMany({
      data: results,
    });
  }

  console.log(`Created ${results.length} auction results`);
}

// 추천 설정 초기화
async function createRecommendationConfig() {
  console.log("Creating recommendation config...");

  await prisma.recommendationConfig.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      discountWeight: 0.30,
      competitionWeight: 0.25,
      auctionRoundWeight: 0.20,
      riskWeight: 0.15,
      urgencyWeight: 0.10,
    },
  });

  console.log("Recommendation config created");
}

// 심리 지수 설정 초기화
async function createPsychologyIndexConfig() {
  console.log("Creating psychology index config...");

  await prisma.psychologyIndexConfig.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      competitionWeight: 0.30,
      aggressionWeight: 0.30,
      liquidityWeight: 0.25,
      riskAversionWeight: 0.15,
    },
  });

  console.log("Psychology index config created");
}

// 관리자 계정 생성
async function createAdminUser() {
  console.log("Creating admin user...");

  await prisma.user.upsert({
    where: { email: "admin@auction.com" },
    update: {},
    create: {
      email: "admin@auction.com",
      name: "관리자",
      role: "admin",
      password: "$2a$10$YourHashedPasswordHere", // 실제로는 bcrypt로 해시해야 함
    },
  });

  console.log("Admin user created (email: admin@auction.com)");
}

// 메인 시드 함수
async function main() {
  console.log("🌱 Seeding database...");

  // 기존 데이터 삭제
  console.log("Cleaning up existing data...");
  await prisma.auctionResult.deleteMany({});
  await prisma.recommendationSnapshot.deleteMany({});
  await prisma.trendSnapshot.deleteMany({});
  await prisma.psychologyIndexSnapshot.deleteMany({});
  await prisma.watchlist.deleteMany({});
  await prisma.savedSearch.deleteMany({});
  await prisma.auctionItem.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.recommendationConfig.deleteMany({});
  await prisma.psychologyIndexConfig.deleteMany({});

  // 새 데이터 생성
  await createAuctionItems(300); // 300개의 경매 물건
  await createAuctionResults();
  await createRecommendationConfig();
  await createPsychologyIndexConfig();
  await createAdminUser();

  console.log("✅ Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
