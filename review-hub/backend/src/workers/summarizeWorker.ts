/**
 * Summarize Worker
 * BullMQ Worker for generating entity-level summary from collected reviews
 */

import { Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { generateSummary } from '../services/llmService';
import logger from '../utils/logger';
import { SummarizeJob, EntityCategory } from '../types';

const prisma = new PrismaClient();

const connection = {
  host: process.env.REDIS_HOST ?? 'localhost',
  port: parseInt(process.env.REDIS_PORT ?? '6379'),
  password: process.env.REDIS_PASSWORD,
};

function calculateTrustScore(reviewCount: number, sourceDiversity: number, avgReviewScore: number): number {
  const countScore = Math.min(30, (reviewCount / 20) * 30);
  const diversityScore = Math.min(40, (sourceDiversity / 5) * 40);
  const qualityScore = avgReviewScore * 10;
  return Math.round(countScore + diversityScore + qualityScore * 2);
}

async function processJob(job: Job<SummarizeJob>): Promise<void> {
  const { entityId, reviewItemIds } = job.data;
  logger.info({ entityId, count: reviewItemIds.length }, 'SummarizeWorker: processing');

  const entity = await prisma.entity.findUnique({ where: { id: entityId } });
  if (!entity) {
    logger.warn({ entityId }, 'Entity not found');
    return;
  }

  const reviews = await prisma.reviewItem.findMany({
    where: { entityId, isReview: true, processedAt: { not: null } },
    orderBy: { publishedAt: 'desc' },
    take: 20,
  });

  if (reviews.length === 0) {
    logger.info({ entityId }, 'No reviews to summarize');
    return;
  }

  const summaryInput = {
    query: entity.rawQuery,
    category: entity.category as EntityCategory,
    reviews: reviews.map((r) => ({
      snippet: r.snippet ?? '',
      sentiment: r.sentiment as any,
      pros: r.pros,
      cons: r.cons,
      keywords: r.keywords,
      rating: r.rating ?? undefined,
      publishedAt: r.publishedAt ?? undefined,
    })),
  };

  const summaryOutput = await generateSummary(summaryInput);

  const sources = new Set(reviews.map((r) => r.sourceId));
  const avgReviewScore = reviews.reduce((s, r) => s + (r.reviewScore ?? 0), 0) / reviews.length;
  const trustScore = calculateTrustScore(reviews.length, sources.size, avgReviewScore);

  // Upsert summary (expires in 1 hour)
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.summary.upsert({
    where: {
      id: (await prisma.summary.findFirst({ where: { entityId, sourceId: null } }))?.id ?? uuidv4(),
    },
    create: {
      id: uuidv4(),
      entityId,
      sourceId: null,
      conclusion: summaryOutput.conclusion,
      pros: summaryOutput.pros,
      cons: summaryOutput.cons,
      keywords: summaryOutput.keywords,
      recommendFor: summaryOutput.recommendFor,
      notFor: summaryOutput.notFor,
      trustScore,
      reviewCount: reviews.length,
      sourceDiversity: sources.size,
      expiresAt,
    },
    update: {
      conclusion: summaryOutput.conclusion,
      pros: summaryOutput.pros,
      cons: summaryOutput.cons,
      keywords: summaryOutput.keywords,
      recommendFor: summaryOutput.recommendFor,
      notFor: summaryOutput.notFor,
      trustScore,
      reviewCount: reviews.length,
      sourceDiversity: sources.size,
      expiresAt,
    },
  });

  logger.info({ entityId, trustScore }, 'SummarizeWorker: summary generated');
}

export function createSummarizeWorker() {
  const worker = new Worker<SummarizeJob>('summarize', processJob, {
    connection,
    concurrency: 2,
  });

  worker.on('completed', (job) => logger.debug({ jobId: job.id }, 'Summarize job completed'));
  worker.on('failed', (job, err) => logger.error({ jobId: job?.id, err }, 'Summarize job failed'));

  return worker;
}
