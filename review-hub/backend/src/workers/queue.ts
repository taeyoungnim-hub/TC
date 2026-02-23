import { Queue } from 'bullmq';
import { getRedis } from '../services/redisService';
import { CrawlJob, SummarizeJob } from '../types';

const connection = { host: process.env.REDIS_HOST ?? 'localhost', port: parseInt(process.env.REDIS_PORT ?? '6379'), password: process.env.REDIS_PASSWORD };

export const crawlQueue = new Queue<CrawlJob>('crawl', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
});

export const summarizeQueue = new Queue<SummarizeJob>('summarize', {
  connection,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'fixed', delay: 5000 },
    removeOnComplete: { count: 50 },
    removeOnFail: { count: 20 },
  },
});
