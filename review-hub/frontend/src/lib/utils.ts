import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(dateStr));
  } catch {
    return '';
  }
}

export function formatRelativeDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    const diffMs = Date.now() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '어제';
    if (diffDays < 7) return `${diffDays}일 전`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 전`;
    return `${Math.floor(diffDays / 365)}년 전`;
  } catch {
    return '';
  }
}

export function getDomainFavicon(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
}

export const SOURCE_TYPE_LABELS: Record<string, string> = {
  BLOG: '블로그',
  COMMUNITY: '커뮤니티',
  MAP: '지도/지역',
  SHOPPING: '쇼핑',
  VIDEO: '동영상',
  NEWS: '뉴스',
  OTHER: '기타',
};

export const SENTIMENT_LABELS: Record<string, { label: string; color: string }> = {
  POSITIVE: { label: '긍정', color: 'text-green-600 bg-green-50' },
  NEGATIVE: { label: '부정', color: 'text-red-600 bg-red-50' },
  NEUTRAL: { label: '중립', color: 'text-gray-600 bg-gray-50' },
  MIXED: { label: '혼합', color: 'text-yellow-600 bg-yellow-50' },
};

export function getTrustScoreColor(score: number): string {
  if (score >= 70) return 'text-green-600';
  if (score >= 40) return 'text-yellow-600';
  return 'text-red-500';
}
