'use client';

import { Item, ItemType } from '../items/itemTypes';
import SidebarNav from './SidebarNav';
import RightFavorites from './RightFavorites';
import SearchBar from './SearchBar';

type LayoutProps = {
  currentType: ItemType;
  onSelectType: (type: ItemType) => void;
  items: Item[];
  favorites: Item[];
  recent: Item[];
  onSelectItem: (id: string) => void;
  onQuickAdd: () => void;
  onSearchSelect: (id: string) => void;
  children: React.ReactNode;
};

export default function Layout({
  currentType,
  onSelectType,
  items,
  favorites,
  recent,
  onSelectItem,
  onQuickAdd,
  onSearchSelect,
  children
}: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-4">
          <h1 className="text-lg font-semibold text-emerald-300">TC MVP</h1>
          <SearchBar items={items} onSelectItem={onSearchSelect} />
          <button
            type="button"
            className="ml-auto rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300 hover:border-emerald-400 hover:text-emerald-200"
            aria-label="다크모드 토글"
          >
            다크모드
          </button>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl grid-cols-[220px_1fr_260px] gap-6 px-6 py-8">
        <SidebarNav currentType={currentType} onSelectType={onSelectType} />
        <main className="min-w-0">{children}</main>
        <RightFavorites
          favorites={favorites}
          recent={recent}
          onSelectItem={onSelectItem}
          onQuickAdd={onQuickAdd}
        />
      </div>
    </div>
  );
}
