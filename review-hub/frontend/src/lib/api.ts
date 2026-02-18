import { SearchResponse, SearchParams, TrendingResponse, StatusResponse } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error ?? `API error: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  search: (params: SearchParams): Promise<SearchResponse> => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
    });
    return apiFetch<SearchResponse>(`/api/search?${qs.toString()}`);
  },

  trending: (): Promise<TrendingResponse> =>
    apiFetch<TrendingResponse>('/api/search/trending'),

  status: (entityId: string): Promise<StatusResponse> =>
    apiFetch<StatusResponse>(`/api/search/status/${entityId}`),
};
