import { Item } from '../items/itemTypes';
import { ItemCreateInput, ItemUpdateInput, StorageAdapter } from './StorageAdapter';

// Supabase optional adapter scaffold.
// 1) Install dependencies:
//    npm install @supabase/supabase-js
// 2) Create env vars in .env.local:
//    NEXT_PUBLIC_SUPABASE_URL=...
//    NEXT_PUBLIC_SUPABASE_ANON_KEY=...
// 3) Replace the placeholder implementations below.
//
// Suggested table schema: items
// - id (uuid, primary key)
// - type (text)
// - title (text)
// - content (text)
// - tags (text[])
// - favorite (boolean)
// - created_at (timestamptz)
// - updated_at (timestamptz)
// - extra (jsonb)

export const supabaseAdapter: StorageAdapter = {
  async list() {
    throw new Error('Supabase adapter not configured');
  },
  async get() {
    throw new Error('Supabase adapter not configured');
  },
  async create(_item: ItemCreateInput): Promise<Item> {
    throw new Error('Supabase adapter not configured');
  },
  async update(_id: string, _patch: ItemUpdateInput): Promise<Item> {
    throw new Error('Supabase adapter not configured');
  },
  async remove() {
    throw new Error('Supabase adapter not configured');
  }
};
