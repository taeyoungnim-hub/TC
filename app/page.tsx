'use client';

import { useMemo, useState } from 'react';
import Layout from '../features/layout/Layout';
import ItemList from '../features/items/ItemList';
import ItemEditor from '../features/items/ItemEditor';
import { ITEM_TYPE_LABELS, Item, ItemType } from '../features/items/itemTypes';
import { useItems } from '../features/items/useItems';

const SORT_OPTIONS = [
  { value: 'updatedAt', label: '최근 수정' },
  { value: 'createdAt', label: '최근 생성' }
] as const;

type SortKey = (typeof SORT_OPTIONS)[number]['value'];

export default function HomePage() {
  const {
    items,
    loading,
    createItem,
    updateItem,
    removeItem,
    duplicateItem,
    seedItems
  } = useItems();
  const [currentType, setCurrentType] = useState<ItemType>('writing');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('updatedAt');
  const [tagFilter, setTagFilter] = useState('');
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const filteredItems = useMemo(() => {
    const tags = tagFilter
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
    return items
      .filter((item) => item.type === currentType)
      .filter((item) => (favoritesOnly ? item.favorite : true))
      .filter((item) => (tags.length ? tags.every((tag) => item.tags.includes(tag)) : true))
      .sort((a, b) => b[sortKey] - a[sortKey]);
  }, [currentType, favoritesOnly, items, sortKey, tagFilter]);

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId]
  );

  const favorites = useMemo(
    () => items.filter((item) => item.favorite).sort((a, b) => b.updatedAt - a.updatedAt),
    [items]
  );

  const recent = useMemo(
    () => items.slice().sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 5),
    [items]
  );

  const handleCreate = async (payload: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => {
    const created = await createItem(payload);
    setSelectedId(created.id);
  };

  const handleQuickAdd = async () => {
    const created = await createItem({
      type: currentType,
      title: `${ITEM_TYPE_LABELS[currentType]} 새 항목`,
      content: '',
      tags: [],
      favorite: false,
      extra: undefined
    });
    setSelectedId(created.id);
  };

  const handleSelectItem = (id: string) => {
    setSelectedId(id);
    const target = items.find((item) => item.id === id);
    if (target) {
      setCurrentType(target.type);
    }
  };

  return (
    <Layout
      currentType={currentType}
      onSelectType={(type) => {
        setCurrentType(type);
        setSelectedId(null);
      }}
      items={items}
      favorites={favorites}
      recent={recent}
      onSelectItem={handleSelectItem}
      onQuickAdd={handleQuickAdd}
      onSearchSelect={handleSelectItem}
    >
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-100">
                {ITEM_TYPE_LABELS[currentType]}
              </h2>
              <p className="text-xs text-slate-400">MVP CRUD 리스트</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-xs text-slate-400" htmlFor="sort">
                정렬
              </label>
              <select
                id="sort"
                value={sortKey}
                onChange={(event) => setSortKey(event.target.value as SortKey)}
                className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <label className="text-xs text-slate-400" htmlFor="tag-filter">
                태그 필터
              </label>
              <input
                id="tag-filter"
                value={tagFilter}
                onChange={(event) => setTagFilter(event.target.value)}
                placeholder="tag1, tag2"
                className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
              />
              <label className="flex items-center gap-2 text-xs text-slate-400" htmlFor="favorites-only">
                <input
                  id="favorites-only"
                  type="checkbox"
                  checked={favoritesOnly}
                  onChange={(event) => setFavoritesOnly(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-950"
                />
                즐겨찾기만
              </label>
              <button
                type="button"
                onClick={() => handleQuickAdd()}
                className="rounded-full bg-emerald-500 px-4 py-1 text-xs font-semibold text-slate-950"
              >
                새 항목
              </button>
              <button
                type="button"
                onClick={() => seedItems()}
                className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-200"
              >
                더미 데이터 seed
              </button>
            </div>
          </div>
        </section>

        {loading ? (
          <p className="text-sm text-slate-400">불러오는 중...</p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            <ItemList items={filteredItems} selectedId={selectedId} onSelect={handleSelectItem} />
            <ItemEditor
              item={selectedItem}
              type={currentType}
              onSave={handleCreate}
              onUpdate={updateItem}
              onDelete={(id) => {
                removeItem(id);
                setSelectedId(null);
              }}
              onDuplicate={duplicateItem}
              onToggleFavorite={(id, favorite) => updateItem(id, { favorite })}
            />
          </div>
        )}
      </div>
    </Layout>
  );
}
