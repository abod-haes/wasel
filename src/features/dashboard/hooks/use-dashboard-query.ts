import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/query-keys';
import { dashboardApi } from '@/features/dashboard/api/dashboard-api';

export const useDashboardSummaryQuery = () => {
  return useQuery({
    queryKey: queryKeys.dashboard.summary(),
    queryFn: () => dashboardApi.getSummary(),
  });
};
