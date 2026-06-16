'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Item, ItemType } from './itemTypes';
import { localStorageAdapter } from '../storage/localStorageAdapter';
import { buildSeedItems } from '../storage/seed';

const SEED_KEY = 'tc_seeded';

const isSeeded = () =>
  typeof window !== 'undefined' && window.localStorage.getItem(SEED_KEY) === 'true';

const markSeeded = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SEED_KEY, 'true');
};

export const useItems = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await localStorageAdapter.list();
    setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      if (!isSeeded()) {
        const seeds = buildSeedItems();
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('tc_items', JSON.stringify(seeds));
        }
        markSeeded();
      }
      await refresh();
    };
    bootstrap();
  }, [refresh]);

  const createItem = useCallback(async (item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => {
    const created = await localStorageAdapter.create(item);
    setItems((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateItem = useCallback(async (id: string, patch: Partial<Item>) => {
    const updated = await localStorageAdapter.update(id, patch);
    setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
    return updated;
  }, []);

  const removeItem = useCallback(async (id: string) => {
    await localStorageAdapter.remove(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const duplicateItem = useCallback(
    async (item: Item) => {
      const { id, createdAt, updatedAt, ...rest } = item;
      return createItem({
        ...rest,
        title: `${item.title} (복제)`
      });
    },
    [createItem]
  );

  const seedItems = useCallback(async () => {
    const seeds = buildSeedItems();
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('tc_items', JSON.stringify(seeds));
    }
    markSeeded();
    await refresh();
  }, [refresh]);

  const groupedByType = useMemo(() => {
    return items.reduce<Record<ItemType, Item[]>>((acc, item) => {
      if (!acc[item.type]) {
        acc[item.type] = [];
      }
      acc[item.type].push(item);
      return acc;
    }, {} as Record<ItemType, Item[]>);
  }, [items]);

  return {
    items,
    groupedByType,
    loading,
    refresh,
    createItem,
    updateItem,
    removeItem,
    duplicateItem,
    seedItems
  };
};
