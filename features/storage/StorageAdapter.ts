import { Item, ItemType } from '../items/itemTypes';

export type ItemCreateInput = Omit<Item, 'id' | 'createdAt' | 'updatedAt'>;
export type ItemUpdateInput = Partial<Omit<Item, 'id' | 'createdAt' | 'updatedAt'>>;

export interface StorageAdapter {
  list: (type?: ItemType) => Promise<Item[]>;
  get: (id: string) => Promise<Item | null>;
  create: (item: ItemCreateInput) => Promise<Item>;
  update: (id: string, patch: ItemUpdateInput) => Promise<Item>;
  remove: (id: string) => Promise<void>;
}
