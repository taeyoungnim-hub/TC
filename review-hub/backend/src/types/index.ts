// ─── Core Domain Types ───────────────────────────────────────────────────────

export type EntityCategory = 'RESTAURANT' | 'PRODUCT' | 'TRAVEL' | 'UNKNOWN';
export type SourceType = 'BLOG' | 'COMMUNITY' | 'MAP' | 'SHOPPING' | 'VIDEO' | 'NEWS' | 'OTHER';
export type Sentiment = 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'MIXED';

export interface RawSearchResult {
  url: string;
  title: string;
  snippet: string;
  domain: string;
  publishedAt?: Date;
  sourceType: SourceType;
}

export interface ReviewItem {
  url: string;
  urlHash: string;
  title?: string;
  snippet?: string;         // 200~300자 이내 발췌
  authorName?: string;
  publishedAt?: Date;
  rating?: number;
  ratingScale?: number;
  isReview: boolean;
  reviewScore: number;      // 0~1
  sentiment?: Sentiment;
  keywords: string[];
  pros: string[];
  cons: string[];
  domain: string;
  sourceType: SourceType;
}

export interface SummaryResult {
  conclusion: string;
  pros: string[];
  cons: string[];
  keywords: string[];
  recommendFor: string[];
  notFor: string[];
  trustScore: number;       // 0~100
  reviewCount: number;
  sourceDiversity: number;
}

export interface SearchRequest {
  query: string;
  region?: string;
  dateRange?: { from: Date; to: Date };
  category?: EntityCategory;
  page?: number;
  limit?: number;
  sortBy?: 'latest' | 'rating' | 'positive' | 'negative';
  sourceTypes?: SourceType[];
}

export interface SearchResponse {
  entityId: string;
  query: string;
  category: EntityCategory;
  summary?: SummaryResult;
  reviews: ReviewItem[];
  totalCount: number;
  hasMore: boolean;
  trustScore: number;
  status: 'complete' | 'partial' | 'processing';
  cachedAt?: Date;
}

// ─── Connector Interface ─────────────────────────────────────────────────────

export interface ConnectorMeta {
  id: string;               // 고유 식별자 (예: 'naver-blog', 'google-cse')
  name: string;             // 표시 이름
  domain: string;           // 주 도메인
  sourceType: SourceType;
  rateLimit: number;        // req/min
  isEnabled: boolean;
}

export interface ConnectorSearchOptions {
  query: string;
  region?: string;
  dateFrom?: Date;
  limit?: number;
}

export interface IConnector {
  meta: ConnectorMeta;

  /**
   * 검색어로 후보 URL 목록을 가져온다.
   * robots.txt / ToS 준수 여부를 커넥터 내부에서 확인한다.
   */
  search(options: ConnectorSearchOptions): Promise<RawSearchResult[]>;

  /**
   * URL에서 리뷰 데이터를 추출한다.
   * 원문 전체 저장 금지 - snippet 200~300자만 반환
   */
  fetchReview(url: string): Promise<Partial<ReviewItem> | null>;

  /**
   * robots.txt 기준으로 해당 URL 크롤링 허용 여부 확인
   */
  isAllowed(url: string): Promise<boolean>;
}

// ─── Queue Job Types ─────────────────────────────────────────────────────────

export interface CrawlJob {
  entityId: string;
  url: string;
  sourceType: SourceType;
  domain: string;
  priority: number;
}

export interface SummarizeJob {
  entityId: string;
  reviewItemIds: string[];
}

// ─── LLM Service Types ───────────────────────────────────────────────────────

export interface ClassifyReviewInput {
  title: string;
  text: string;
  url: string;
}

export interface ClassifyReviewOutput {
  isReview: boolean;
  reviewScore: number;  // 0~1
  reason: string;
}

export interface ExtractReviewDataInput {
  title: string;
  bodyText: string;       // 원문의 일부 (최대 2000자)
  url: string;
}

export interface ExtractReviewDataOutput {
  snippet: string;        // 200~300자 발췌
  sentiment: Sentiment;
  keywords: string[];
  pros: string[];
  cons: string[];
  rating?: number;
}

export interface GenerateSummaryInput {
  query: string;
  category: EntityCategory;
  reviews: Array<{
    snippet: string;
    sentiment?: Sentiment;
    pros: string[];
    cons: string[];
    keywords: string[];
    rating?: number;
    publishedAt?: Date;
  }>;
}

export interface GenerateSummaryOutput {
  conclusion: string;
  pros: string[];
  cons: string[];
  keywords: string[];
  recommendFor: string[];
  notFor: string[];
}
