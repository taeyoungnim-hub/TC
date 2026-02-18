/**
 * Google Custom Search Engine (CSE) Connector
 * - 공식 Google Custom Search API 사용
 * - https://developers.google.com/custom-search/v1/overview
 * - 후기성 키워드를 query에 추가해 리뷰 페이지를 우선 수집
 */

import fetch from 'node-fetch';
import { BaseConnector } from './BaseConnector';
import { ConnectorMeta, ConnectorSearchOptions, RawSearchResult, SourceType } from '../types';
import logger from '../utils/logger';

const GOOGLE_CSE_BASE = 'https://www.googleapis.com/customsearch/v1';

interface CseItem {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
  pagemap?: {
    metatags?: Array<Record<string, string>>;
    article?: Array<{ datepublished?: string; datemodified?: string }>;
  };
}

interface CseResponse {
  items?: CseItem[];
  searchInformation: { totalResults: string; formattedTotalResults: string };
  error?: { code: number; message: string };
}

export class GoogleCSEConnector extends BaseConnector {
  meta: ConnectorMeta = {
    id: 'google-cse',
    name: 'Google 검색',
    domain: 'google.com',
    sourceType: 'OTHER' as SourceType,
    rateLimit: 10,
    isEnabled: !!(process.env.GOOGLE_CSE_API_KEY && process.env.GOOGLE_CSE_ID),
  };

  async search(options: ConnectorSearchOptions): Promise<RawSearchResult[]> {
    if (!this.meta.isEnabled) {
      logger.info('GoogleCSEConnector disabled (no API key)');
      return this.mockSearch(options);
    }

    // Add review-related terms to improve result quality
    const reviewQuery = this.buildReviewQuery(options.query);

    const url = new URL(GOOGLE_CSE_BASE);
    url.searchParams.set('key', process.env.GOOGLE_CSE_API_KEY!);
    url.searchParams.set('cx', process.env.GOOGLE_CSE_ID!);
    url.searchParams.set('q', reviewQuery);
    url.searchParams.set('num', String(Math.min(options.limit ?? 10, 10)));
    url.searchParams.set('hl', 'ko');
    url.searchParams.set('gl', 'kr');

    if (options.dateFrom) {
      const d = options.dateFrom;
      url.searchParams.set('sort', `date:r:${this.formatDate(d)}:${this.formatDate(new Date())}`);
    }

    try {
      const res = await fetch(url.toString(), {
        signal: AbortSignal.timeout(10_000),
      });

      if (!res.ok) {
        logger.warn({ status: res.status }, 'Google CSE API error');
        return [];
      }

      const data = (await res.json()) as CseResponse;

      if (data.error) {
        logger.error({ error: data.error }, 'Google CSE API error response');
        return [];
      }

      return (data.items ?? []).map((item) => ({
        url: item.link,
        title: item.title,
        snippet: item.snippet.substring(0, 300),
        domain: item.displayLink,
        publishedAt: this.extractDate(item),
        sourceType: this.guessSourceType(item.displayLink),
      }));
    } catch (err) {
      logger.error({ err }, 'Google CSE search failed');
      return [];
    }
  }

  private buildReviewQuery(query: string): string {
    // Detect language
    const isKorean = /[\uAC00-\uD7A3]/.test(query);
    const reviewTerms = isKorean ? '후기 리뷰 사용기 방문기' : 'review experience';
    return `${query} ${reviewTerms}`;
  }

  private guessSourceType(domain: string): SourceType {
    if (domain.includes('blog') || domain.includes('tistory') || domain.includes('brunch')) return 'BLOG';
    if (domain.includes('dcinside') || domain.includes('clien') || domain.includes('ppomppu')) return 'COMMUNITY';
    if (domain.includes('map') || domain.includes('place')) return 'MAP';
    if (domain.includes('shop') || domain.includes('coupang') || domain.includes('11st')) return 'SHOPPING';
    if (domain.includes('youtube') || domain.includes('youtu.be')) return 'VIDEO';
    return 'OTHER';
  }

  private extractDate(item: CseItem): Date | undefined {
    const dateStr =
      item.pagemap?.article?.[0]?.datepublished ??
      item.pagemap?.metatags?.[0]?.['article:published_time'];
    if (!dateStr) return undefined;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? undefined : d;
  }

  private formatDate(d: Date): string {
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  }

  /**
   * API 키 없을 때 목업 데이터 반환 (개발/테스트용)
   */
  private mockSearch(options: ConnectorSearchOptions): RawSearchResult[] {
    logger.info({ query: options.query }, '[MOCK] GoogleCSE returning mock results');
    return [
      {
        url: `https://example-blog.com/review/${encodeURIComponent(options.query)}`,
        title: `${options.query} 솔직 후기`,
        snippet: `${options.query}를 직접 사용해보고 남기는 리뷰입니다. 전반적으로 만족스러웠으며 특히 품질이 우수했습니다.`,
        domain: 'example-blog.com',
        publishedAt: new Date(),
        sourceType: 'BLOG',
      },
      {
        url: `https://example-community.com/post/12345`,
        title: `[사용기] ${options.query} 한 달 써본 후기`,
        snippet: `한 달 동안 사용해봤는데 장단점이 확실합니다. 디자인은 좋은데 내구성이 아쉽네요.`,
        domain: 'example-community.com',
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        sourceType: 'COMMUNITY',
      },
    ];
  }
}
