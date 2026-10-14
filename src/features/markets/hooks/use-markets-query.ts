import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/query-keys';
import { marketsApi } from '@/features/markets/api/markets-api';

export const useMarketOptionsQuery = (enabled = true, search = '') =>
  useQuery({
    queryKey: [...queryKeys.users.markets(), search.trim()] as const,
    queryFn: ({ signal }) => marketsApi.getOptions(search, signal),
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled,
  });

export const useMarketByIdQuery = (marketUserId?: string, enabled = true) =>
  useQuery({
    queryKey: ['users', 'market-details', marketUserId] as const,
    queryFn: () => marketsApi.getById(marketUserId!),
    enabled: enabled && Boolean(marketUserId),
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    retry: 1,
  });
