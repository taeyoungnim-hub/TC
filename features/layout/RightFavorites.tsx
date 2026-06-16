'use client';

import { Item, ITEM_TYPE_LABELS } from '../items/itemTypes';

type RightFavoritesProps = {
  favorites: Item[];
  recent: Item[];
  onSelectItem: (id: string) => void;
  onQuickAdd: () => void;
};

const typeIcon = (type: string) => {
  switch (type) {
    case 'writing':
      return '✍️';
    case 'reading-summary':
      return '📚';
    case 'youtube-summary':
      return '▶️';
    case 'prompt':
      return '🧩';
    case 'vibe-coding':
      return '🛠️';
    case 'real-estate':
      return '🏠';
    case 'stock':
      return '📈';
    case 'self-care':
      return '🧘';
    default:
      return '📌';
  }
};

export default function RightFavorites({
  favorites,
  recent,
  onSelectItem,
  onQuickAdd
}: RightFavoritesProps) {
  return (
    <aside className="sticky top-24 flex h-fit flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-100">즐겨찾기</h2>
        <button
          type="button"
          onClick={onQuickAdd}
          className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-slate-950"
        >
          빠른 추가
        </button>
      </div>
      <div className="space-y-3">
        {favorites.length === 0 ? (
          <p className="text-xs text-slate-400">즐겨찾기 항목이 없습니다.</p>
        ) : (
          <ul className="space-y-2">
            {favorites.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelectItem(item.id)}
                  className="flex w-full items-center gap-2 rounded-lg border border-transparent px-2 py-1 text-left text-sm text-slate-200 hover:border-emerald-400"
                >
                  <span aria-hidden="true">{typeIcon(item.type)}</span>
                  <span className="truncate">{item.title}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="border-t border-slate-800 pt-3">
        <h3 className="text-xs uppercase tracking-widest text-slate-400">최근 항목 5개</h3>
        <ul className="mt-2 space-y-2">
          {recent.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelectItem(item.id)}
                className="flex w-full items-center justify-between rounded-lg px-2 py-1 text-left text-xs text-slate-300 hover:bg-slate-800/60"
              >
                <span className="truncate">{item.title}</span>
                <span className="text-[10px] text-slate-500">
                  {ITEM_TYPE_LABELS[item.type]}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
