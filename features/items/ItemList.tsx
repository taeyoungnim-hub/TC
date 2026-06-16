'use client';

import { Item } from './itemTypes';

type ItemListProps = {
  items: Item[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
};

export default function ItemList({ items, selectedId, onSelect }: ItemListProps) {
  return (
    <div className="space-y-2">
      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-700 p-6 text-sm text-slate-400">
          항목이 없습니다. 새 항목을 추가하세요.
        </p>
      ) : (
        items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={`w-full rounded-xl border px-4 py-3 text-left transition ${
              selectedId === item.id
                ? 'border-emerald-400 bg-emerald-500/10'
                : 'border-slate-800 bg-slate-900/40 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-100">{item.title}</h3>
              <span className="text-xs text-slate-500">
                {new Date(item.updatedAt).toLocaleDateString()}
              </span>
            </div>
            <p className="mt-2 line-clamp-2 text-xs text-slate-400">{item.content}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-slate-500">
              {item.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-slate-700 px-2 py-0.5">
                  #{tag}
                </span>
              ))}
            </div>
          </button>
        ))
      )}
    </div>
  );
}
