/**
 * Crawl Worker
 * BullMQ Worker for background URL crawling + review extraction
 *
 * 파이프라인:
 * 1. URL fetch (robots.txt + rate limit 준수)
 * 2. HTML 파싱 → 본문 추출
 * 3. LLM 분류 (리뷰성 여부)
 * 4. LLM 추출 (발췌/장단점/감성)
 * 5. DB 저장 (snippet만, 원문 전체 저장 금지)
 */

import { Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { getConnectorById, getEnabledConnectors } from '../connectors';
import { BaseConnector } from '../connectors/BaseConnector';
import { classifyReview, extractReviewData } from '../services/llmService';
import { getCachedUrl, setCachedUrl } from '../services/redisService';
import { hashUrl } from '../utils/hash';
import logger from '../utils/logger';
import { CrawlJob } from '../types';
import { summarizeQueue } from './queue';

const prisma = new PrismaClient();

const connection = {
  host: process.env.REDIS_HOST ?? 'localhost',
  port: parseInt(process.env.REDIS_PORT ?? '6379'),
  password: process.env.REDIS_PASSWORD,
};

async function processJob(job: Job<CrawlJob>): Promise<void> {
  const { entityId, url, sourceType, domain } = job.data;
  const urlHash = hashUrl(url);

  logger.info({ url, entityId }, 'CrawlWorker: processing job');

  // Check if already processed
  const existing = await prisma.reviewItem.findUnique({ where: { urlHash } });
  if (existing?.processedAt) {
    logger.debug({ url }, 'URL already processed, skipping');
    return;
  }

  // Check URL cache
  const cachedData = await getCachedUrl(urlHash);
  let reviewPartial: Record<string, unknown> | null = null;

  if (cachedData) {
    reviewPartial = JSON.parse(cachedData);
  } else {
    // Find or use a connector to fetch
    let connector = getConnectorById(sourceType.toLowerCase()) as BaseConnector | undefined;
    if (!connector) {
      // Use first available connector as generic fetcher
      const connectors = getEnabledConnectors() as BaseConnector[];
      connector = connectors[0] as BaseConnector;
    }

    if (!connector) {
      logger.warn({ url }, 'No connector available for fetching');
      return;
    }

    reviewPartial = await connector.fetchReview(url) as Record<string, unknown> | null;
    if (reviewPartial) {
      await setCachedUrl(urlHash, JSON.stringify(reviewPartial));
    }
  }

  if (!reviewPartial) {
    logger.warn({ url }, 'Failed to fetch review data');
    return;
  }

  const title = String(reviewPartial.title ?? '');
  const snippet = String(reviewPartial.snippet ?? '');

  // LLM Step 1: Classify as review or not
  const classification = await classifyReview({
    title,
    text: snippet,
    url,
  });

  if (!classification.isReview && classification.reviewScore < 0.3) {
    logger.debug({ url, score: classification.reviewScore }, 'Not a review, skipping DB save');
    return;
  }

  // LLM Step 2: Extract review data (only if it looks like a review)
  const extracted = await extractReviewData({
    title,
    bodyText: snippet,
    url,
  });

  // Ensure source exists
  let source = await prisma.source.findUnique({ where: { domain } });
  if (!source) {
    source = await prisma.source.create({
      data: {
        id: uuidv4(),
        domain,
        name: domain,
        type: sourceType as any,
        isAllowed: true,
        rateLimit: 5,
      },
    });
  }

  // Save to DB (snippet only, no full text)
  await prisma.reviewItem.upsert({
    where: { urlHash },
    create: {
      id: uuidv4(),
      entityId,
      sourceId: source.id,
      url,
      urlHash,
      title: title.substring(0, 200),
      snippet: extracted.snippet?.substring(0, 350) ?? snippet.substring(0, 350),
      authorName: String(reviewPartial.authorName ?? '').substring(0, 100) || null,
      publishedAt: reviewPartial.publishedAt ? new Date(String(reviewPartial.publishedAt)) : null,
      rating: reviewPartial.rating ? Number(reviewPartial.rating) : null,
      ratingScale: 5,
      isReview: classification.isReview,
      reviewScore: classification.reviewScore,
      sentiment: extracted.sentiment as any,
      keywords: extracted.keywords.slice(0, 10),
      pros: extracted.pros.slice(0, 5),
      cons: extracted.cons.slice(0, 5),
      processedAt: new Date(),
    },
    update: {
      isReview: classification.isReview,
      reviewScore: classification.reviewScore,
      sentiment: extracted.sentiment as any,
      keywords: extracted.keywords.slice(0, 10),
      pros: extracted.pros.slice(0, 5),
      cons: extracted.cons.slice(0, 5),
      snippet: extracted.snippet?.substring(0, 350) ?? snippet.substring(0, 350),
      processedAt: new Date(),
    },
  });

  logger.info({ url, isReview: classification.isReview }, 'CrawlWorker: saved review item');

  // Check if we have enough reviews to trigger summarization
  const reviewCount = await prisma.reviewItem.count({
    where: { entityId, isReview: true, processedAt: { not: null } },
  });

  if (reviewCount > 0 && reviewCount % 5 === 0) {
    const items = await prisma.reviewItem.findMany({
      where: { entityId, isReview: true },
      select: { id: true },
      orderBy: { fetchedAt: 'desc' },
      take: 20,
    });

    await summarizeQueue.add('summarize', {
      entityId,
      reviewItemIds: items.map((i) => i.id),
    }, { jobId: `summarize:${entityId}`, removeOnComplete: true }).catch(() => {});
  }
}

export function createCrawlWorker() {
  const worker = new Worker<CrawlJob>('crawl', processJob, {
    connection,
    concurrency: parseInt(process.env.CRAWL_CONCURRENCY ?? '3'),
  });

  worker.on('completed', (job) => {
    logger.debug({ jobId: job.id }, 'Crawl job completed');
  });

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err }, 'Crawl job failed');
  });

  return worker;
}
