/**
 * Naver Search API Connector
 * - 공식 Naver Search API 사용 (https://developers.naver.com/docs/serviceapi/search/)
 * - 블로그/카페/지역 검색 지원
 * - robots.txt + rate limit 준수
 */

import fetch from 'node-fetch';
import { BaseConnector } from './BaseConnector';
import { ConnectorMeta, ConnectorSearchOptions, RawSearchResult, SourceType } from '../types';
import logger from '../utils/logger';

const NAVER_API_BASE = 'https://openapi.naver.com/v1/search';

interface NaverBlogItem {
  title: string;
  link: string;
  description: string;
  bloggername: string;
  postdate: string;
}

interface NaverBlogResponse {
  lastBuildDate: string;
  total: number;
  start: number;
  display: number;
  items: NaverBlogItem[];
}

interface NaverLocalItem {
  title: string;
  link: string;
  description: string;
  address: string;
  roadAddress: string;
  category: string;
}

export class NaverSearchConnector extends BaseConnector {
  meta: ConnectorMeta = {
    id: 'naver-search',
    name: '네이버 블로그/지역',
    domain: 'naver.com',
    sourceType: 'BLOG' as SourceType,
    rateLimit: 10,
    isEnabled: !!process.env.NAVER_CLIENT_ID,
  };

  private get headers() {
    return {
      'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID ?? '',
      'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET ?? '',
      'Content-Type': 'application/json',
    };
  }

  async search(options: ConnectorSearchOptions): Promise<RawSearchResult[]> {
    if (!this.meta.isEnabled) {
      logger.info('NaverSearchConnector disabled (no API key)');
      return [];
    }

    const results: RawSearchResult[] = [];
    const limit = Math.min(options.limit ?? 10, 10); // Naver API max = 100

    // Search blogs
    try {
      const blogResults = await this.searchBlogs(options.query, limit);
      results.push(...blogResults);
    } catch (err) {
      logger.error({ err }, 'Naver blog search failed');
    }

    // Search local (for restaurant/travel queries)
    try {
      const localResults = await this.searchLocal(options.query, Math.ceil(limit / 2));
      results.push(...localResults);
    } catch (err) {
      logger.debug({ err }, 'Naver local search failed (may not be applicable)');
    }

    return results;
  }

  private async searchBlogs(query: string, display: number): Promise<RawSearchResult[]> {
    const url = new URL(`${NAVER_API_BASE}/blog.json`);
    url.searchParams.set('query', `${query} 후기`);
    url.searchParams.set('display', String(display));
    url.searchParams.set('sort', 'date');

    const res = await fetch(url.toString(), {
      headers: this.headers,
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      logger.warn({ status: res.status }, 'Naver blog API error');
      return [];
    }

    const data = (await res.json()) as NaverBlogResponse;
    return data.items.map((item) => ({
      url: item.link,
      title: this.stripHtml(item.title),
      snippet: this.stripHtml(item.description).substring(0, 300),
      domain: this.extractDomain(item.link),
      publishedAt: this.parseNaverDate(item.postdate),
      sourceType: 'BLOG' as SourceType,
    }));
  }

  private async searchLocal(query: string, display: number): Promise<RawSearchResult[]> {
    const url = new URL(`${NAVER_API_BASE}/local.json`);
    url.searchParams.set('query', query);
    url.searchParams.set('display', String(display));

    const res = await fetch(url.toString(), {
      headers: this.headers,
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return [];

    const data = (await res.json()) as { items: NaverLocalItem[] };
    return data.items.map((item) => ({
      url: item.link || `https://map.naver.com/search?query=${encodeURIComponent(item.title)}`,
      title: this.stripHtml(item.title),
      snippet: this.stripHtml(item.description).substring(0, 300),
      domain: 'map.naver.com',
      sourceType: 'MAP' as SourceType,
    }));
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').trim();
  }

  private parseNaverDate(dateStr: string): Date | undefined {
    // Naver date format: YYYYMMDD
    if (!dateStr || dateStr.length !== 8) return undefined;
    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6)) - 1;
    const day = parseInt(dateStr.substring(6, 8));
    const d = new Date(year, month, day);
    return isNaN(d.getTime()) ? undefined : d;
  }

  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return 'naver.com';
    }
  }
}
