/**
 * Search Service - 핵심 검색 파이프라인
 * 1. 입력 정규화 + 카테고리 감지
 * 2. 커넥터 병렬 검색
 * 3. 중복 제거 + 스코어링
 * 4. DB 저장 + 큐 적재
 */

import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { getEnabledConnectors } from '../connectors';
import { classifyReview, extractReviewData, generateSummary } from './llmService';
import { getCachedSearch, setCachedSearch, incrementSearchCount } from './redisService';
import { hashUrl } from '../utils/hash';
import { crawlQueue, summarizeQueue } from '../workers/queue';
import logger from '../utils/logger';
import {
  SearchRequest,
  SearchResponse,
  RawSearchResult,
  ReviewItem,
  EntityCategory,
  SummaryResult,
} from '../types';

const prisma = new PrismaClient();

// ─── Category Detection ───────────────────────────────────────────────────────

function detectCategory(query: string): EntityCategory {
  const q = query.toLowerCase();
  const restaurantKeywords = ['음식점', '카페', '레스토랑', '맛집', '파스타', '라멘', '스시', '이자카야', '술집', '치킨', '피자', '버거'];
  const travelKeywords = ['호텔', '숙소', '펜션', '게스트하우스', '여행', '여행지', '관광', '오사카', '도쿄', '제주', '부산', '서울'];
  const productKeywords = ['가전', '전자제품', '다이슨', '에어팟', '아이폰', '갤럭시', '노트북', '운동화', '나이키', '아디다스', '후드', '패딩', 'v15', 'v11'];

  if (restaurantKeywords.some((k) => q.includes(k))) return 'RESTAURANT';
  if (travelKeywords.some((k) => q.includes(k))) return 'TRAVEL';
  if (productKeywords.some((k) => q.includes(k))) return 'PRODUCT';
  return 'UNKNOWN';
}

function normalizeQuery(query: string): string {
  return query.trim().replace(/\s+/g, ' ').toLowerCase();
}

// ─── Trust Score Calculation ─────────────────────────────────────────────────

function calculateTrustScore(items: ReviewItem[]): number {
  if (items.length === 0) return 0;

  const reviewItems = items.filter((r) => r.isReview);
  if (reviewItems.length === 0) return 0;

  // Source diversity (unique domains)
  const domains = new Set(reviewItems.map((r) => r.domain));
  const diversityScore = Math.min(100, (domains.size / 5) * 40); // max 40 pts for 5+ sources

  // Review count score
  const countScore = Math.min(100, (reviewItems.length / 20) * 30); // max 30 pts for 20+ reviews

  // Recency score
  const now = Date.now();
  const recentCount = reviewItems.filter((r) => {
    if (!r.publishedAt) return false;
    return now - r.publishedAt.getTime() < 90 * 24 * 60 * 60 * 1000; // 90 days
  }).length;
  const recencyScore = Math.min(100, (recentCount / reviewItems.length) * 20); // max 20 pts

  // Review quality score (avg reviewScore)
  const avgReviewScore = reviewItems.reduce((sum, r) => sum + r.reviewScore, 0) / reviewItems.length;
  const qualityScore = avgReviewScore * 10; // max 10 pts

  return Math.round(diversityScore + countScore + recencyScore + qualityScore);
}

// ─── Main Search Function ────────────────────────────────────────────────────

export async function performSearch(req: SearchRequest): Promise<SearchResponse> {
  const normalizedQuery = normalizeQuery(req.query);
  const cacheKey = `${normalizedQuery}:${req.region ?? ''}:${req.category ?? ''}`;

  // 1. Check cache first (5 min TTL)
  const cached = await getCachedSearch(cacheKey);
  if (cached) {
    logger.info({ query: req.query }, 'Cache hit for search');
    const result = JSON.parse(cached) as SearchResponse;
    result.cachedAt = new Date(result.cachedAt!);
    return result;
  }

  // 2. Detect category
  const category = req.category ?? detectCategory(normalizedQuery);

  // 3. Find or create entity
  let entity = await prisma.entity.findFirst({
    where: { name: normalizedQuery },
  });

  if (!entity) {
    entity = await prisma.entity.create({
      data: {
        id: uuidv4(),
        name: normalizedQuery,
        rawQuery: req.query,
        category,
        region: req.region,
        language: /[\uAC00-\uD7A3]/.test(req.query) ? 'ko' : 'en',
      },
    });
  }

  // 4. Log search
  await prisma.searchLog.create({
    data: { id: uuidv4(), query: req.query, entityId: entity.id },
  }).catch(() => {});

  await incrementSearchCount(normalizedQuery);

  // 5. Parallel connector search
  const connectors = getEnabledConnectors();
  logger.info({ query: req.query, connectors: connectors.map((c) => c.meta.id) }, 'Starting parallel search');

  const searchPromises = connectors.map((connector) =>
    connector
      .search({
        query: req.query,
        region: req.region,
        limit: 10,
        dateFrom: req.dateRange?.from,
      })
      .catch((err) => {
        logger.error({ err, connector: connector.meta.id }, 'Connector search failed');
        return [] as RawSearchResult[];
      })
  );

  const rawResults = (await Promise.all(searchPromises)).flat();

  // 6. Deduplicate by URL
  const seen = new Set<string>();
  const deduped = rawResults.filter((r) => {
    const hash = hashUrl(r.url);
    if (seen.has(hash)) return false;
    seen.add(hash);
    return true;
  });

  logger.info({ total: rawResults.length, deduped: deduped.length }, 'Deduplication complete');

  // 7. Quick heuristic classify (returns partial results immediately)
  const partialReviews: ReviewItem[] = deduped.slice(0, 10).map((raw) => ({
    url: raw.url,
    urlHash: hashUrl(raw.url),
    title: raw.title,
    snippet: raw.snippet,
    publishedAt: raw.publishedAt,
    domain: raw.domain,
    sourceType: raw.sourceType,
    isReview: raw.snippet.length > 50, // basic check
    reviewScore: 0.5,
    keywords: [],
    pros: [],
    cons: [],
  }));

  // 8. Enqueue deep crawl jobs for background processing
  const crawlJobs = deduped.map((raw) => ({
    entityId: entity!.id,
    url: raw.url,
    sourceType: raw.sourceType,
    domain: raw.domain,
    priority: 1,
  }));

  await crawlQueue.addBulk(
    crawlJobs.map((job, i) => ({
      name: 'crawl',
      data: job,
      opts: { priority: i, delay: i * 200 }, // stagger to respect rate limits
    }))
  ).catch((err) => logger.warn({ err }, 'Failed to add crawl jobs'));

  // 9. Check for existing processed reviews in DB
  const existingReviews = await prisma.reviewItem.findMany({
    where: { entityId: entity.id, isReview: true },
    orderBy: { publishedAt: 'desc' },
    take: 50,
  });

  const allReviews: ReviewItem[] = existingReviews.map((r) => ({
    url: r.url,
    urlHash: r.urlHash,
    title: r.title ?? undefined,
    snippet: r.snippet ?? undefined,
    authorName: r.authorName ?? undefined,
    publishedAt: r.publishedAt ?? undefined,
    rating: r.rating ?? undefined,
    ratingScale: r.ratingScale ?? undefined,
    isReview: r.isReview,
    reviewScore: r.reviewScore ?? 0,
    sentiment: r.sentiment as ReviewItem['sentiment'],
    keywords: r.keywords,
    pros: r.pros,
    cons: r.cons,
    domain: '',
    sourceType: 'BLOG',
  }));

  const reviewsToReturn = allReviews.length > 0 ? allReviews : partialReviews;

  // 10. Check for existing summary
  const existingSummary = await prisma.summary.findFirst({
    where: {
      entityId: entity.id,
      sourceId: null,
      expiresAt: { gt: new Date() },
    },
  });

  let summary: SummaryResult | undefined;
  if (existingSummary) {
    summary = {
      conclusion: existingSummary.conclusion,
      pros: existingSummary.pros,
      cons: existingSummary.cons,
      keywords: existingSummary.keywords,
      recommendFor: existingSummary.recommendFor,
      notFor: existingSummary.notFor,
      trustScore: existingSummary.trustScore,
      reviewCount: existingSummary.reviewCount,
      sourceDiversity: existingSummary.sourceDiversity,
    };
  } else if (allReviews.length >= 3) {
    // Enqueue summarization
    await summarizeQueue.add('summarize', {
      entityId: entity.id,
      reviewItemIds: allReviews.map((r) => r.urlHash).slice(0, 20),
    }).catch(() => {});
  }

  const trustScore = calculateTrustScore(reviewsToReturn);

  const response: SearchResponse = {
    entityId: entity.id,
    query: req.query,
    category,
    summary,
    reviews: applyFilters(reviewsToReturn, req),
    totalCount: reviewsToReturn.length,
    hasMore: deduped.length > 10,
    trustScore,
    status: allReviews.length > 0 ? 'complete' : 'partial',
    cachedAt: new Date(),
  };

  // Cache the response
  await setCachedSearch(cacheKey, JSON.stringify(response));

  return response;
}

function applyFilters(reviews: ReviewItem[], req: SearchRequest): ReviewItem[] {
  let filtered = [...reviews];

  if (req.sourceTypes && req.sourceTypes.length > 0) {
    filtered = filtered.filter((r) => req.sourceTypes!.includes(r.sourceType));
  }

  switch (req.sortBy) {
    case 'latest':
      filtered.sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0));
      break;
    case 'rating':
      filtered.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      break;
    case 'positive':
      filtered = filtered.filter((r) => r.sentiment === 'POSITIVE');
      break;
    case 'negative':
      filtered = filtered.filter((r) => r.sentiment === 'NEGATIVE');
      break;
  }

  const page = req.page ?? 1;
  const limit = req.limit ?? 20;
  return filtered.slice((page - 1) * limit, page * limit);
}
