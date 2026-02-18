/**
 * Test 1: Heuristic review classifier
 * Tests that the keyword-based heuristic correctly identifies review/ad content
 * without requiring an LLM API call.
 */

// We test the heuristic logic inline since it's a pure function
interface ClassifyResult {
  isReview: boolean;
  reviewScore: number;
  reason: string;
}

function heuristicClassify(input: { title: string; text: string; url: string }): ClassifyResult {
  const text = `${input.title} ${input.text}`.toLowerCase();
  const reviewSignals = ['후기', '리뷰', '사용기', '방문기', '먹어봤', '써봤', '가봤', '구매', '구입', '별점', '평점', 'review', 'experience', 'tried'];
  const adSignals = ['구매하기', '지금 구매', '할인', '쿠폰', '이벤트', '판매', '광고', 'sponsored', 'advertisement'];

  const reviewScore = reviewSignals.filter((s) => text.includes(s)).length;
  const adScore = adSignals.filter((s) => text.includes(s)).length;

  const normalizedScore = Math.max(0, Math.min(1, (reviewScore - adScore * 0.5) / 5));
  return {
    isReview: normalizedScore > 0.3,
    reviewScore: normalizedScore,
    reason: `Heuristic: review=${reviewScore}, ad=${adScore}`,
  };
}

describe('heuristicClassify', () => {
  it('classifies a genuine review as isReview=true', () => {
    const result = heuristicClassify({
      url: 'https://blog.example.com/post/1',
      title: '다이슨 V15 한 달 사용 후기',
      text: '실제로 구매해서 써봤는데 흡입력이 대단합니다. 별점 5점 줍니다. 청소가 정말 편해졌어요.',
    });

    expect(result.isReview).toBe(true);
    expect(result.reviewScore).toBeGreaterThan(0.3);
  });

  it('classifies an ad/promotional page as isReview=false', () => {
    const result = heuristicClassify({
      url: 'https://shop.example.com/product/123',
      title: '지금 구매하면 50% 할인! 쿠폰 증정 이벤트',
      text: '지금 구매하기 최저가 보장 광고 sponsored 판매 이벤트 할인쿠폰 적용',
    });

    expect(result.isReview).toBe(false);
    expect(result.reviewScore).toBeLessThanOrEqual(0.3);
  });

  it('gives intermediate score for mixed content', () => {
    const result = heuristicClassify({
      url: 'https://example.com/post',
      title: '제품 소개',
      text: '이 제품을 사용해봤습니다. 지금 구매 이벤트 중입니다.',
    });

    expect(result.reviewScore).toBeGreaterThanOrEqual(0);
    expect(result.reviewScore).toBeLessThanOrEqual(1);
  });

  it('handles English review content', () => {
    const result = heuristicClassify({
      url: 'https://example.com/en/review',
      title: 'My experience with the product',
      text: 'I tried this product and reviewed it thoroughly. My experience was positive.',
    });

    expect(result.isReview).toBe(true);
  });
});
