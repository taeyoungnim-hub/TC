'use client';

import { useRouter } from 'next/navigation';
import { SearchBar } from './SearchBar';
import { useTrending } from '@/hooks/useSearch';
import { Search } from 'lucide-react';

const EXAMPLE_QUERIES = [
  '성수 파스타',
  '다이슨 V15 디텍트',
  '오사카 도톤보리 호텔',
  '나이키 페가수스 41',
  '오프화이트 후드',
];

export function SearchHero() {
  const router = useRouter();
  const { data: trending } = useTrending();

  const handleSearch = (query: string, region?: string) => {
    const params = new URLSearchParams({ q: query });
    if (region) params.set('region', region);
    router.push(`/results?${params.toString()}`);
  };

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-4 py-20 bg-gradient-to-b from-blue-50 to-gray-50">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Search className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">모두의 리뷰</h1>
          <p className="text-sm text-gray-500">All Reviews Hub</p>
        </div>
      </div>

      <p className="text-lg text-gray-600 mb-10 text-center max-w-md">
        검색어 하나로 여러 곳에 흩어진 리뷰를 한 번에 모아보세요
      </p>

      {/* Main Search */}
      <div className="w-full max-w-2xl">
        <SearchBar onSearch={handleSearch} autoFocus />
      </div>

      {/* Category Examples */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-400 mb-3">예시 검색어</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {EXAMPLE_QUERIES.map((q) => (
            <button
              key={q}
              onClick={() => handleSearch(q)}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:border-primary-500 hover:text-primary-600 transition-colors shadow-sm"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Trending */}
      {trending?.keywords && trending.keywords.length > 0 && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400 mb-3">지금 인기 검색어</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {trending.keywords.slice(0, 8).map((keyword, i) => (
              <button
                key={keyword}
                onClick={() => handleSearch(keyword)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm hover:border-primary-500 transition-colors shadow-sm"
              >
                <span className="text-primary-500 font-medium text-xs">{i + 1}</span>
                <span className="text-gray-700">{keyword}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Legal notice */}
      <p className="mt-12 text-xs text-gray-400 text-center max-w-md">
        공식 API 및 허용된 공개 데이터만 수집합니다. 모든 결과에 출처 링크를 제공하며, 원문 발췌(200~300자)만 표시합니다.
      </p>
    </div>
  );
}
