'use client';

import { ITEM_TYPE_LABELS, ITEM_TYPES, ItemType } from '../items/itemTypes';

type SidebarNavProps = {
  currentType: ItemType;
  onSelectType: (type: ItemType) => void;
};

export default function SidebarNav({ currentType, onSelectType }: SidebarNavProps) {
  return (
    <nav className="sticky top-24 h-fit rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
      <p className="mb-3 text-xs uppercase tracking-widest text-slate-400">메뉴</p>
      <ul className="space-y-2">
        {ITEM_TYPES.map((type) => (
          <li key={type}>
            <button
              type="button"
              onClick={() => onSelectType(type)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                currentType === type
                  ? 'bg-emerald-500/20 text-emerald-200'
                  : 'text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {ITEM_TYPE_LABELS[type]}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
