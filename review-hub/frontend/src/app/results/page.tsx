'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, useCallback } from 'react';
import { useSearch, useSearchStatus } from '@/hooks/useSearch';
import { SearchBar } from '@/components/search/SearchBar';
import { SummaryCard } from '@/components/results/SummaryCard';
import { ReviewList } from '@/components/results/ReviewList';
import { FilterBar } from '@/components/results/FilterBar';
import { ResultsSkeleton } from '@/components/results/ResultsSkeleton';
import { TrustScoreBadge } from '@/components/results/TrustScoreBadge';
import type { SearchParams, SourceType } from '@/types';

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const q = searchParams.get('q') ?? '';
  const region = searchParams.get('region') ?? undefined;
  const sortBy = (searchParams.get('sortBy') ?? undefined) as SearchParams['sortBy'];
  const sourceTypes = searchParams.get('sourceTypes') ?? undefined;
  const page = parseInt(searchParams.get('page') ?? '1');

  const params: SearchParams = { q, region, sortBy, sourceTypes, page, limit: 20 };
  const { data, isLoading, error } = useSearch(params, !!q);

  // Poll for background processing updates
  const { data: status } = useSearchStatus(
    data?.entityId,
    data?.status === 'partial' || data?.status === 'processing'
  );

  const handleSearch = useCallback((newQuery: string, newRegion?: string) => {
    const p = new URLSearchParams({ q: newQuery });
    if (newRegion) p.set('region', newRegion);
    router.push(`/results?${p.toString()}`);
  }, [router]);

  const handleFilterChange = useCallback((filter: { sortBy?: string; sourceTypes?: string[] }) => {
    const p = new URLSearchParams(searchParams.toString());
    if (filter.sortBy) p.set('sortBy', filter.sortBy);
    else p.delete('sortBy');
    if (filter.sourceTypes?.length) p.set('sourceTypes', filter.sourceTypes.join(','));
    else p.delete('sourceTypes');
    p.set('page', '1');
    router.push(`/results?${p.toString()}`);
  }, [router, searchParams]);

  if (!q) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top search bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <SearchBar
            initialQuery={q}
            initialRegion={region}
            onSearch={handleSearch}
            compact
          />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Status bar */}
        {data && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-gray-900">
                <span className="text-primary-600">"{q}"</span> 리뷰 검색 결과
              </h1>
              {data.status === 'partial' || data.status === 'processing' ? (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full animate-pulse">
                  분석 중...
                </span>
              ) : (
                <span className="text-sm text-gray-500">{data.totalCount}개 리뷰</span>
              )}
            </div>
            <TrustScoreBadge score={status?.summary?.trustScore ?? data.trustScore} />
          </div>
        )}

        {isLoading && <ResultsSkeleton />}

        {error && (
          <div className="card text-center py-12">
            <p className="text-red-500 font-medium">검색 중 오류가 발생했습니다.</p>
            <p className="text-sm text-gray-500 mt-2">{error.message}</p>
          </div>
        )}

        {data && !isLoading && (
          <>
            {/* Summary Card */}
            {(data.summary || status?.summary) && (
              <SummaryCard
                summary={status?.summary ?? data.summary!}
                query={q}
                category={data.category}
              />
            )}

            {/* Filter Bar */}
            <FilterBar
              currentSort={sortBy}
              currentSources={sourceTypes?.split(',') as SourceType[] | undefined}
              onChange={handleFilterChange}
            />

            {/* Review List */}
            <ReviewList
              reviews={data.reviews}
              isProcessing={data.status !== 'complete'}
            />

            {/* Load More */}
            {data.hasMore && (
              <div className="text-center pt-4">
                <button
                  onClick={() => {
                    const p = new URLSearchParams(searchParams.toString());
                    p.set('page', String(page + 1));
                    router.push(`/results?${p.toString()}`);
                  }}
                  className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  더 보기
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<ResultsSkeleton />}>
      <ResultsContent />
    </Suspense>
  );
}
