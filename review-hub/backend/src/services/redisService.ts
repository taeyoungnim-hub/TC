import { Redis } from 'ioredis';
import logger from '../utils/logger';

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis({
      host: process.env.REDIS_HOST ?? 'localhost',
      port: parseInt(process.env.REDIS_PORT ?? '6379'),
      password: process.env.REDIS_PASSWORD,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      enableReadyCheck: false,
    });

    redis.on('error', (err) => {
      logger.error({ err }, 'Redis connection error');
    });
  }
  return redis;
}

const SEARCH_CACHE_TTL = 60 * 5; // 5 minutes
const URL_CACHE_TTL = 60 * 60 * 24; // 24 hours
const TRENDING_TTL = 60 * 60; // 1 hour

export async function getCachedSearch(key: string): Promise<string | null> {
  try {
    return await getRedis().get(`search:${key}`);
  } catch {
    return null;
  }
}

export async function setCachedSearch(key: string, value: string): Promise<void> {
  try {
    await getRedis().setex(`search:${key}`, SEARCH_CACHE_TTL, value);
  } catch (err) {
    logger.warn({ err }, 'Redis setCachedSearch failed');
  }
}

export async function getCachedUrl(urlHash: string): Promise<string | null> {
  try {
    return await getRedis().get(`url:${urlHash}`);
  } catch {
    return null;
  }
}

export async function setCachedUrl(urlHash: string, value: string): Promise<void> {
  try {
    await getRedis().setex(`url:${urlHash}`, URL_CACHE_TTL, value);
  } catch (err) {
    logger.warn({ err }, 'Redis setCachedUrl failed');
  }
}

export async function incrementSearchCount(query: string): Promise<void> {
  try {
    const key = `trending:${query.toLowerCase().trim()}`;
    await getRedis().incr(key);
    await getRedis().expire(key, TRENDING_TTL);
  } catch {
    // non-critical
  }
}

export async function getTrendingKeywords(limit = 10): Promise<string[]> {
  try {
    const keys = await getRedis().keys('trending:*');
    if (keys.length === 0) return [];

    const pipeline = getRedis().pipeline();
    keys.forEach((k) => pipeline.get(k));
    const results = await pipeline.exec();

    const counts: Array<{ keyword: string; count: number }> = keys.map((k, i) => ({
      keyword: k.replace('trending:', ''),
      count: parseInt(String(results?.[i]?.[1] ?? '0')),
    }));

    return counts
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map((c) => c.keyword);
  } catch {
    return [];
  }
}
