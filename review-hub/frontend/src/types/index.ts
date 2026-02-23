export type EntityCategory = 'RESTAURANT' | 'PRODUCT' | 'TRAVEL' | 'UNKNOWN';
export type SourceType = 'BLOG' | 'COMMUNITY' | 'MAP' | 'SHOPPING' | 'VIDEO' | 'NEWS' | 'OTHER';
export type Sentiment = 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'MIXED';

export interface ReviewItem {
  url: string;
  urlHash: string;
  title?: string;
  snippet?: string;
  authorName?: string;
  publishedAt?: string;
  rating?: number;
  ratingScale?: number;
  isReview: boolean;
  reviewScore: number;
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
  trustScore: number;
  reviewCount: number;
  sourceDiversity: number;
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
  cachedAt?: string;
}

export interface SearchParams {
  q: string;
  region?: string;
  from?: string;
  to?: string;
  category?: EntityCategory;
  page?: number;
  limit?: number;
  sortBy?: 'latest' | 'rating' | 'positive' | 'negative';
  sourceTypes?: string;
}

export interface TrendingResponse {
  keywords: string[];
}

export interface StatusResponse {
  entityId: string;
  reviewCount: number;
  hasSummary: boolean;
  status: 'pending' | 'processing' | 'complete';
  summary: SummaryResult | null;
}
