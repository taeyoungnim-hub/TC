'use client';

import { useMemo, useState } from 'react';
import { Item, ITEM_TYPE_LABELS } from '../items/itemTypes';

type SearchBarProps = {
  items: Item[];
  onSelectItem: (id: string) => void;
};

export default function SearchBar({ items, onSelectItem }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const lowered = query.toLowerCase();
    return items.filter((item) => {
      const tagMatch = item.tags.some((tag) => tag.toLowerCase().includes(lowered));
      return (
        item.title.toLowerCase().includes(lowered) ||
        item.content.toLowerCase().includes(lowered) ||
        tagMatch
      );
    });
  }, [items, query]);

  return (
    <div className="relative w-full max-w-xl">
      <label className="sr-only" htmlFor="global-search">
        전역 검색
      </label>
      <input
        id="global-search"
        type="search"
        placeholder="제목/본문/태그 검색"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="w-full rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500"
      />
      {query.trim() && (
        <div className="absolute left-0 right-0 top-12 z-30 max-h-80 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950 p-2 shadow-xl">
          {results.length === 0 ? (
            <p className="px-3 py-2 text-xs text-slate-400">검색 결과가 없습니다.</p>
          ) : (
            <ul className="space-y-1">
              {results.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectItem(item.id);
                      setQuery('');
                    }}
                    className="flex w-full flex-col gap-1 rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800/60"
                  >
                    <span className="font-medium">{item.title}</span>
                    <span className="text-xs text-slate-500">
                      {ITEM_TYPE_LABELS[item.type]}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
