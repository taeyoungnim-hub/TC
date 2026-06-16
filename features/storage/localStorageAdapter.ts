import { Item, ItemType } from '../items/itemTypes';
import { ItemCreateInput, ItemUpdateInput, StorageAdapter } from './StorageAdapter';

const STORAGE_KEY = 'tc_items';

const safeParse = (value: string | null): Item[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as Item[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to parse storage', error);
    return [];
  }
};

const readAll = (): Item[] => {
  if (typeof window === 'undefined') return [];
  return safeParse(window.localStorage.getItem(STORAGE_KEY));
};

const writeAll = (items: Item[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

const generateId = () =>
  `item_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export const localStorageAdapter: StorageAdapter = {
  async list(type?: ItemType) {
    const items = readAll();
    return type ? items.filter((item) => item.type === type) : items;
  },
  async get(id: string) {
    const items = readAll();
    return items.find((item) => item.id === id) ?? null;
  },
  async create(item: ItemCreateInput) {
    const items = readAll();
    const now = Date.now();
    const newItem: Item = {
      ...item,
      id: generateId(),
      createdAt: now,
      updatedAt: now
    };
    const next = [newItem, ...items];
    writeAll(next);
    return newItem;
  },
  async update(id: string, patch: ItemUpdateInput) {
    const items = readAll();
    const next = items.map((item) =>
      item.id === id
        ? {
            ...item,
            ...patch,
            updatedAt: Date.now()
          }
        : item
    );
    writeAll(next);
    const updated = next.find((item) => item.id === id);
    if (!updated) {
      throw new Error('Item not found');
    }
    return updated;
  },
  async remove(id: string) {
    const items = readAll();
    writeAll(items.filter((item) => item.id !== id));
  }
};
