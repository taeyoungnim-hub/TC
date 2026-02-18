/**
 * LLM Service - Anthropic Claude API 사용
 * 사용 목적만:
 *  (a) 리뷰성 여부 분류
 *  (b) 발췌 생성 (200~300자)
 *  (c) 장단점/키워드/감성 분석
 *  (d) 전체 요약 생성
 *
 * 절대 금지: 원문 전체 재현, 존재하지 않는 리뷰 생성
 */

import Anthropic from '@anthropic-ai/sdk';
import {
  ClassifyReviewInput,
  ClassifyReviewOutput,
  ExtractReviewDataInput,
  ExtractReviewDataOutput,
  GenerateSummaryInput,
  GenerateSummaryOutput,
  Sentiment,
} from '../types';
import logger from '../utils/logger';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = 'claude-3-haiku-20240307'; // 비용 효율적 모델

function safeJsonParse<T>(text: string, fallback: T): T {
  const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) ?? text.match(/({[\s\S]*})/);
  const raw = jsonMatch ? jsonMatch[1] : text;
  try {
    return JSON.parse(raw.trim()) as T;
  } catch {
    return fallback;
  }
}

/**
 * (a) 리뷰성 여부 분류
 */
export async function classifyReview(input: ClassifyReviewInput): Promise<ClassifyReviewOutput> {
  const fallback: ClassifyReviewOutput = { isReview: false, reviewScore: 0, reason: 'LLM unavailable' };

  if (!process.env.ANTHROPIC_API_KEY) {
    return heuristicClassify(input);
  }

  try {
    const prompt = `당신은 웹 페이지 콘텐츠가 "실제 사용/방문 경험 후기"인지 판단하는 분류기입니다.

아래 기준으로 분류하세요:
✅ 리뷰/후기 = 1인칭 경험, 실제 사용/방문, 장단점 언급, 평점/별점, 구체적 상품/장소 경험
❌ 제외 = 광고, 판매 페이지, 뉴스 기사, 단순 소개, 가격표, 쿠폰 홍보

URL: ${input.url}
제목: ${input.title.substring(0, 100)}
텍스트 (앞 500자): ${input.text.substring(0, 500)}

JSON으로만 응답하세요:
{
  "isReview": true/false,
  "reviewScore": 0.0~1.0,
  "reason": "한 줄 이유"
}`;

    const msg = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = msg.content[0].type === 'text' ? msg.content[0].text : '';
    return safeJsonParse(text, fallback);
  } catch (err) {
    logger.error({ err }, 'classifyReview LLM error, using heuristic');
    return heuristicClassify(input);
  }
}

/**
 * 휴리스틱 분류기 (LLM 없을 때 폴백)
 */
function heuristicClassify(input: ClassifyReviewInput): ClassifyReviewOutput {
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

/**
 * (b+c) 발췌 생성 + 장단점/키워드/감성 분석
 */
export async function extractReviewData(input: ExtractReviewDataInput): Promise<ExtractReviewDataOutput> {
  const fallback: ExtractReviewDataOutput = {
    snippet: input.bodyText.substring(0, 300),
    sentiment: 'NEUTRAL',
    keywords: [],
    pros: [],
    cons: [],
  };

  if (!process.env.ANTHROPIC_API_KEY) {
    return fallback;
  }

  try {
    const prompt = `당신은 리뷰 분석 전문가입니다. 아래 리뷰 원문의 일부를 분석하세요.

⚠️ 중요: 원문을 그대로 복사하지 말고, 핵심을 200~300자로 재서술하세요.

제목: ${input.title.substring(0, 100)}
원문 (최대 2000자): ${input.bodyText.substring(0, 2000)}

JSON으로만 응답하세요:
{
  "snippet": "200~300자 핵심 발췌/재서술",
  "sentiment": "POSITIVE|NEGATIVE|NEUTRAL|MIXED",
  "keywords": ["키워드1", "키워드2", "키워드3"],
  "pros": ["장점1", "장점2"],
  "cons": ["단점1", "단점2"],
  "rating": null 또는 숫자(평점 언급 시 0~5로 환산)
}`;

    const msg = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = msg.content[0].type === 'text' ? msg.content[0].text : '';
    const parsed = safeJsonParse<ExtractReviewDataOutput & { rating?: number }>(text, fallback);

    // Ensure snippet is within limit
    if (parsed.snippet && parsed.snippet.length > 350) {
      parsed.snippet = parsed.snippet.substring(0, 300) + '…';
    }

    return parsed;
  } catch (err) {
    logger.error({ err }, 'extractReviewData LLM error');
    return fallback;
  }
}

/**
 * (d) 전체 요약 생성
 */
export async function generateSummary(input: GenerateSummaryInput): Promise<GenerateSummaryOutput> {
  const fallback: GenerateSummaryOutput = {
    conclusion: `${input.query}에 대한 ${input.reviews.length}개의 리뷰를 수집했습니다.`,
    pros: [],
    cons: [],
    keywords: [],
    recommendFor: [],
    notFor: [],
  };

  if (!process.env.ANTHROPIC_API_KEY || input.reviews.length === 0) {
    return fallback;
  }

  const reviewText = input.reviews
    .slice(0, 20) // 최대 20개
    .map((r, i) => `[${i + 1}] ${r.snippet} (감성: ${r.sentiment ?? 'UNKNOWN'}, 장점: ${r.pros.join(', ')}, 단점: ${r.cons.join(', ')})`)
    .join('\n');

  try {
    const prompt = `당신은 리뷰 요약 전문가입니다. 아래는 "${input.query}"에 대한 실제 리뷰 발췌 모음입니다.

⚠️ 중요:
- 수집된 리뷰들을 종합해서 요약하세요
- 존재하지 않는 내용을 추가하거나 과장하지 마세요
- 리뷰가 언급한 내용만 포함하세요

카테고리: ${input.category}
리뷰 수: ${input.reviews.length}개

리뷰 발췌:
${reviewText}

JSON으로만 응답하세요:
{
  "conclusion": "한 줄 핵심 결론 (50자 이내)",
  "pros": ["장점1", "장점2", "장점3"],
  "cons": ["단점1", "단점2", "단점3"],
  "keywords": ["주요키워드1", "주요키워드2", "주요키워드3", "주요키워드4", "주요키워드5"],
  "recommendFor": ["추천대상1", "추천대상2"],
  "notFor": ["비추천대상1", "비추천대상2"]
}`;

    const msg = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = msg.content[0].type === 'text' ? msg.content[0].text : '';
    return safeJsonParse(text, fallback);
  } catch (err) {
    logger.error({ err }, 'generateSummary LLM error');
    return fallback;
  }
}
