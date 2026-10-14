import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/query-keys';
import { marketsApi } from '@/features/markets/api/markets-api';

export const useMarketOptionsQuery = (enabled = true, search = '') =>
  useQuery({
    queryKey: [...queryKeys.users.markets(), search.trim()] as const,
    queryFn: () => marketsApi.getOptions(search),
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled,
  });
