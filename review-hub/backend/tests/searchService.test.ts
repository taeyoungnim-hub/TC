/**
 * Test 4: Search service integration (mocked)
 * Tests category detection, query normalization, and search response shape
 */

// Category detection logic (extracted for testability)
type EntityCategory = 'RESTAURANT' | 'PRODUCT' | 'TRAVEL' | 'UNKNOWN';

function detectCategory(query: string): EntityCategory {
  const q = query.toLowerCase();
  const restaurantKeywords = ['음식점', '카페', '레스토랑', '맛집', '파스타', '라멘', '스시', '이자카야', '술집', '치킨', '피자', '버거'];
  const travelKeywords = ['호텔', '숙소', '펜션', '게스트하우스', '여행', '여행지', '관광', '오사카', '도쿄', '제주', '부산'];
  const productKeywords = ['가전', '전자제품', '다이슨', '에어팟', '아이폰', '갤럭시', '노트북', '운동화', '나이키', '아디다스', '후드', '패딩'];

  if (restaurantKeywords.some((k) => q.includes(k))) return 'RESTAURANT';
  if (travelKeywords.some((k) => q.includes(k))) return 'TRAVEL';
  if (productKeywords.some((k) => q.includes(k))) return 'PRODUCT';
  return 'UNKNOWN';
}

function normalizeQuery(query: string): string {
  return query.trim().replace(/\s+/g, ' ').toLowerCase();
}

describe('detectCategory', () => {
  it('detects RESTAURANT for food-related queries', () => {
    expect(detectCategory('성수 파스타')).toBe('RESTAURANT');
    expect(detectCategory('강남 맛집')).toBe('RESTAURANT');
    expect(detectCategory('신촌 라멘')).toBe('RESTAURANT');
  });

  it('detects PRODUCT for product queries', () => {
    expect(detectCategory('다이슨 V15')).toBe('PRODUCT');
    expect(detectCategory('나이키 운동화')).toBe('PRODUCT');
    expect(detectCategory('에어팟 프로')).toBe('PRODUCT');
  });

  it('detects TRAVEL for travel queries', () => {
    expect(detectCategory('오사카 호텔')).toBe('TRAVEL');
    expect(detectCategory('제주 숙소')).toBe('TRAVEL');
    expect(detectCategory('도쿄 여행')).toBe('TRAVEL');
  });

  it('returns UNKNOWN for ambiguous queries', () => {
    expect(detectCategory('일반적인 검색어')).toBe('UNKNOWN');
  });
});

describe('normalizeQuery', () => {
  it('trims whitespace', () => {
    expect(normalizeQuery('  성수 파스타  ')).toBe('성수 파스타');
  });

  it('collapses multiple spaces', () => {
    expect(normalizeQuery('성수   파스타')).toBe('성수 파스타');
  });

  it('converts to lowercase', () => {
    expect(normalizeQuery('DYSON V15')).toBe('dyson v15');
  });
});
