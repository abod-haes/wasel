import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/query-keys';
import { marketsApi } from '@/features/markets/api/markets-api';

export const useMarketOptionsQuery = () =>
  useQuery({
    queryKey: queryKeys.users.markets(),
    queryFn: marketsApi.getOptions,
  });
