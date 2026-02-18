'use client';

import { SourceType } from '@/types';
import { SOURCE_TYPE_LABELS } from '@/lib/utils';
import { cn } from '@/lib/utils';

const SORT_OPTIONS = [
  { value: '', label: '관련순' },
  { value: 'latest', label: '최신순' },
  { value: 'rating', label: '평점순' },
  { value: 'positive', label: '긍정만' },
  { value: 'negative', label: '부정만' },
];

const SOURCE_FILTERS: SourceType[] = ['BLOG', 'COMMUNITY', 'MAP', 'SHOPPING', 'VIDEO'];

interface FilterBarProps {
  currentSort?: string;
  currentSources?: SourceType[];
  onChange: (filter: { sortBy?: string; sourceTypes?: SourceType[] }) => void;
}

export function FilterBar({ currentSort, currentSources, onChange }: FilterBarProps) {
  const toggleSource = (type: SourceType) => {
    const current = currentSources ?? [];
    const updated = current.includes(type)
      ? current.filter((s) => s !== type)
      : [...current, type];
    onChange({ sortBy: currentSort, sourceTypes: updated.length > 0 ? updated : undefined });
  };

  const setSort = (sort: string) => {
    onChange({ sortBy: sort || undefined, sourceTypes: currentSources });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Sort */}
      <div className="flex items-center gap-1.5 bg-white rounded-xl border border-gray-200 p-1">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setSort(opt.value)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              (currentSort ?? '') === opt.value
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Source type filters */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-gray-400 font-medium">출처:</span>
        {SOURCE_FILTERS.map((type) => (
          <button
            key={type}
            onClick={() => toggleSource(type)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
              currentSources?.includes(type)
                ? 'bg-primary-100 text-primary-700 border-primary-300'
                : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
            )}
          >
            {SOURCE_TYPE_LABELS[type]}
          </button>
        ))}
      </div>
    </div>
  );
}
