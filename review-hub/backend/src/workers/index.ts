import dotenv from 'dotenv';
dotenv.config();

import { createCrawlWorker } from './crawlWorker';
import { createSummarizeWorker } from './summarizeWorker';
import logger from '../utils/logger';

logger.info('Starting workers...');

const crawlWorker = createCrawlWorker();
const summarizeWorker = createSummarizeWorker();

logger.info('✅ Workers started: crawl + summarize');

// Graceful shutdown
const shutdown = async () => {
  logger.info('Shutting down workers...');
  await crawlWorker.close();
  await summarizeWorker.close();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
