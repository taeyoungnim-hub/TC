'use client';

import { ThumbsUp, ThumbsDown, Tag, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { SummaryResult, EntityCategory } from '@/types';
import { TrustScoreBadge } from './TrustScoreBadge';

interface SummaryCardProps {
  summary: SummaryResult;
  query: string;
  category: EntityCategory;
}

const CATEGORY_ICONS: Record<EntityCategory, string> = {
  RESTAURANT: '🍽️',
  PRODUCT: '📦',
  TRAVEL: '✈️',
  UNKNOWN: '🔍',
};

export function SummaryCard({ summary, query, category }: SummaryCardProps) {
  return (
    <div className="card animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{CATEGORY_ICONS[category]}</span>
          <div>
            <h2 className="font-semibold text-gray-900">AI 종합 요약</h2>
            <p className="text-xs text-gray-400">
              {summary.reviewCount}개 리뷰 · 출처 {summary.sourceDiversity}곳 기반
            </p>
          </div>
        </div>
        <TrustScoreBadge score={summary.trustScore} showLabel />
      </div>

      {/* One-line conclusion */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5">
        <p className="text-gray-800 font-medium leading-relaxed">
          <span className="text-primary-600 font-semibold">{query}</span> — {summary.conclusion}
        </p>
      </div>

      {/* Pros & Cons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {/* Pros */}
        <div className="bg-green-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <ThumbsUp className="w-4 h-4 text-green-600" />
            <h3 className="text-sm font-semibold text-green-700">장점</h3>
          </div>
          {summary.pros.length > 0 ? (
            <ul className="space-y-1.5">
              {summary.pros.map((pro, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-green-800">
                  <CheckCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-green-500" />
                  {pro}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">분석 중...</p>
          )}
        </div>

        {/* Cons */}
        <div className="bg-red-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <ThumbsDown className="w-4 h-4 text-red-600" />
            <h3 className="text-sm font-semibold text-red-700">단점</h3>
          </div>
          {summary.cons.length > 0 ? (
            <ul className="space-y-1.5">
              {summary.cons.map((con, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-red-800">
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-red-400" />
                  {con}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">분석 중...</p>
          )}
        </div>
      </div>

      {/* Keywords */}
      {summary.keywords.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-600">주요 키워드</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {summary.keywords.map((kw) => (
              <span
                key={kw}
                className="badge bg-gray-100 text-gray-700 hover:bg-primary-100 hover:text-primary-700 cursor-default transition-colors"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recommend for / Not for */}
      {(summary.recommendFor.length > 0 || summary.notFor.length > 0) && (
        <div className="border-t border-gray-100 pt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {summary.recommendFor.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Users className="w-3.5 h-3.5 text-primary-500" />
                <span className="text-xs font-medium text-primary-600">추천 대상</span>
              </div>
              <ul className="space-y-1">
                {summary.recommendFor.map((r, i) => (
                  <li key={i} className="text-xs text-gray-600">• {r}</li>
                ))}
              </ul>
            </div>
          )}
          {summary.notFor.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Users className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs font-medium text-gray-500">비추천 대상</span>
              </div>
              <ul className="space-y-1">
                {summary.notFor.map((r, i) => (
                  <li key={i} className="text-xs text-gray-600">• {r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
