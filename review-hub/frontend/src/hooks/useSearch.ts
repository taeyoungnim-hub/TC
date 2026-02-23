'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { SearchParams } from '@/types';

export function useSearch(params: SearchParams, enabled = true) {
  return useQuery({
    queryKey: ['search', params],
    queryFn: () => api.search(params),
    enabled: enabled && !!params.q,
    staleTime: 5 * 60 * 1000, // 5 min
    retry: 1,
  });
}

export function useTrending() {
  return useQuery({
    queryKey: ['trending'],
    queryFn: api.trending,
    staleTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
  });
}

export function useSearchStatus(entityId: string | undefined, enabled = false) {
  return useQuery({
    queryKey: ['status', entityId],
    queryFn: () => api.status(entityId!),
    enabled: enabled && !!entityId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data || data.status === 'processing' || data.status === 'pending') return 3000;
      return false;
    },
  });
}
