'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { Search, MapPin, X, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const RECENT_KEY = 'review_hub_recent';
const MAX_RECENT = 8;

interface SearchBarProps {
  onSearch: (query: string, region?: string) => void;
  initialQuery?: string;
  initialRegion?: string;
  compact?: boolean;
  autoFocus?: boolean;
}

export function SearchBar({ onSearch, initialQuery = '', initialRegion = '', compact = false, autoFocus = false }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [region, setRegion] = useState(initialRegion);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]') as string[];
      setRecentSearches(stored);
    } catch {
      setRecentSearches([]);
    }
  }, []);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const saveRecent = (q: string) => {
    const updated = [q, ...recentSearches.filter((r) => r !== q)].slice(0, MAX_RECENT);
    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    } catch {}
  };

  const handleSubmit = (q = query) => {
    if (!q.trim()) return;
    saveRecent(q.trim());
    setShowSuggestions(false);
    onSearch(q.trim(), region.trim() || undefined);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const suggestions = recentSearches;
    if (e.key === 'ArrowDown') {
      setHighlightIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      setHighlightIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      if (highlightIndex >= 0) {
        setQuery(suggestions[highlightIndex]);
        handleSubmit(suggestions[highlightIndex]);
      } else {
        handleSubmit();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const clearQuery = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className={cn(
        'flex items-center bg-white border-2 rounded-2xl shadow-sm transition-all',
        compact ? 'border-gray-200 hover:border-primary-400' : 'border-gray-200 hover:border-primary-400',
        showSuggestions && 'border-primary-500 shadow-md'
      )}>
        <Search className={cn('flex-shrink-0 text-gray-400 ml-4', compact ? 'w-4 h-4' : 'w-5 h-5')} />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); setHighlightIndex(-1); }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={compact ? '검색어를 입력하세요...' : '제품명, 음식점, 여행지 등 검색어를 입력하세요'}
          className={cn(
            'flex-1 bg-transparent outline-none text-gray-900 placeholder:text-gray-400',
            compact ? 'px-3 py-2.5 text-sm' : 'px-4 py-4 text-base'
          )}
        />

        {query && (
          <button onClick={clearQuery} className="p-2 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Region input */}
        <div className="flex items-center border-l border-gray-200 px-3">
          <MapPin className="w-4 h-4 text-gray-400 mr-1.5" />
          <input
            type="text"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="지역 (선택)"
            className={cn(
              'bg-transparent outline-none text-gray-700 placeholder:text-gray-400',
              compact ? 'w-20 py-2 text-xs' : 'w-24 py-4 text-sm'
            )}
          />
        </div>

        <button
          onClick={() => handleSubmit()}
          className={cn(
            'bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors flex-shrink-0',
            compact ? 'px-4 py-2 m-1.5 text-sm' : 'px-6 py-3 m-2 text-base'
          )}
        >
          검색
        </button>
      </div>

      {/* Autocomplete suggestions */}
      {showSuggestions && recentSearches.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden animate-fade-in">
          <div className="p-2">
            <p className="text-xs text-gray-400 px-3 py-1.5 font-medium">최근 검색어</p>
            {recentSearches.map((term, i) => (
              <button
                key={term}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-colors',
                  highlightIndex === i ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50 text-gray-700'
                )}
                onMouseDown={(e) => { e.preventDefault(); setQuery(term); handleSubmit(term); }}
              >
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                {term}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
