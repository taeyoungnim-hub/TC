import robotsParser from 'robots-parser';
import fetch from 'node-fetch';
import logger from './logger';

const robotsCache = new Map<string, { robot: ReturnType<typeof robotsParser>; fetchedAt: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export async function isUrlAllowed(url: string, userAgent = 'ReviewHubBot/1.0'): Promise<boolean> {
  try {
    const parsed = new URL(url);
    const robotsUrl = `${parsed.protocol}//${parsed.host}/robots.txt`;

    const cached = robotsCache.get(parsed.host);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
      return cached.robot.isAllowed(url, userAgent) ?? true;
    }

    const res = await fetch(robotsUrl, {
      headers: { 'User-Agent': userAgent },
      signal: AbortSignal.timeout(5000),
    });

    const txt = res.ok ? await res.text() : '';
    const robot = robotsParser(robotsUrl, txt);
    robotsCache.set(parsed.host, { robot, fetchedAt: Date.now() });

    return robot.isAllowed(url, userAgent) ?? true;
  } catch (err) {
    logger.warn({ err, url }, 'robots.txt check failed, allowing by default');
    return true;
  }
}
