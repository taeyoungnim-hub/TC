import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import { IConnector, ConnectorMeta, ReviewItem, RawSearchResult, ConnectorSearchOptions } from '../types';
import { isUrlAllowed } from '../utils/robots';
import { checkRateLimit, sleep } from '../utils/rateLimiter';
import { hashUrl } from '../utils/hash';
import logger from '../utils/logger';

const USER_AGENT = 'ReviewHubBot/1.0 (+https://reviewhub.app/bot)';
const SNIPPET_MAX = 300;

export abstract class BaseConnector implements IConnector {
  abstract meta: ConnectorMeta;

  abstract search(options: ConnectorSearchOptions): Promise<RawSearchResult[]>;

  async isAllowed(url: string): Promise<boolean> {
    return isUrlAllowed(url, USER_AGENT);
  }

  async fetchReview(url: string): Promise<Partial<ReviewItem> | null> {
    if (!this.meta.isEnabled) return null;

    const allowed = await this.isAllowed(url);
    if (!allowed) {
      logger.info({ url }, 'robots.txt disallows crawling');
      return null;
    }

    if (!checkRateLimit(this.meta.domain, this.meta.rateLimit)) {
      logger.warn({ url, domain: this.meta.domain }, 'Rate limit hit, skipping');
      await sleep(1000);
      return null;
    }

    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'text/html,application/xhtml+xml',
          'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
        },
        signal: AbortSignal.timeout(10_000),
        redirect: 'follow',
      });

      if (!res.ok) {
        logger.warn({ url, status: res.status }, 'Fetch failed');
        return null;
      }

      const html = await res.text();
      return this.parseHtml(url, html);
    } catch (err) {
      logger.error({ err, url }, 'fetchReview error');
      return null;
    }
  }

  protected parseHtml(url: string, html: string): Partial<ReviewItem> {
    const $ = cheerio.load(html);

    // Remove noise elements
    $('script, style, nav, header, footer, .ad, .advertisement, [class*="banner"]').remove();

    const title = $('meta[property="og:title"]').attr('content') ??
      $('title').text().trim() ??
      '';

    // Extract main text content
    const bodyText = this.extractMainText($);
    const snippet = this.createSnippet(bodyText);

    // Try to extract author
    const authorName =
      $('meta[name="author"]').attr('content') ??
      $('[class*="author"], [class*="writer"], [itemprop="author"]').first().text().trim() ||
      undefined;

    // Try to extract date
    const dateStr =
      $('meta[property="article:published_time"]').attr('content') ??
      $('time').first().attr('datetime') ??
      $('[class*="date"], [class*="time"]').first().text().trim();
    const publishedAt = dateStr ? new Date(dateStr) : undefined;

    // Try to extract rating
    const ratingStr =
      $('[itemprop="ratingValue"]').attr('content') ??
      $('[class*="rating"], [class*="score"], [class*="star"]').first().attr('content') ??
      $('[class*="rating"], [class*="score"]').first().text().trim();
    const rating = ratingStr ? parseFloat(ratingStr) : undefined;

    return {
      url,
      urlHash: hashUrl(url),
      title: title.substring(0, 200),
      snippet,
      authorName,
      publishedAt: publishedAt && !isNaN(publishedAt.getTime()) ? publishedAt : undefined,
      rating: rating && !isNaN(rating) && rating > 0 ? rating : undefined,
      domain: new URL(url).hostname,
      sourceType: this.meta.sourceType,
      isReview: false,    // LLM이 판정
      reviewScore: 0,
      keywords: [],
      pros: [],
      cons: [],
    };
  }

  private extractMainText($: ReturnType<typeof cheerio.load>): string {
    // Priority: article > main > [class*="content"] > body
    const candidates = [
      'article',
      'main',
      '[class*="content"]:not([class*="footer"]):not([class*="nav"])',
      '[class*="post-body"]',
      '[class*="entry-content"]',
      '[class*="review"]',
      'body',
    ];

    for (const sel of candidates) {
      const el = $(sel).first();
      if (el.length) {
        const text = el.text().replace(/\s+/g, ' ').trim();
        if (text.length > 100) return text;
      }
    }

    return $('body').text().replace(/\s+/g, ' ').trim();
  }

  private createSnippet(text: string): string {
    // Clean and truncate to SNIPPET_MAX characters
    const cleaned = text.replace(/\s+/g, ' ').trim();
    if (cleaned.length <= SNIPPET_MAX) return cleaned;
    // Try to cut at sentence boundary
    const cut = cleaned.substring(0, SNIPPET_MAX);
    const lastPeriod = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('。'), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
    if (lastPeriod > SNIPPET_MAX * 0.6) {
      return cut.substring(0, lastPeriod + 1).trim();
    }
    return cut.trim() + '…';
  }
}
