import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/query-keys';
import { dashboardApi } from '@/features/dashboard/api/dashboard-api';
import { isAdminRole, isMarketRole } from '@/services/auth/auth-roles';
import { useAuthStore } from '@/store/use-auth-store';

export const useDashboardSummaryQuery = () => {
  const user = useAuthStore((state) => state.user);
  const isMarket = isMarketRole(user?.roles ?? []) && !isAdminRole(user?.roles ?? []);

  return useQuery({
    queryKey: isMarket && user
      ? queryKeys.dashboard.marketSummary(user.id)
      : queryKeys.dashboard.summary(),
    queryFn: () =>
      isMarket && user
        ? dashboardApi.getMarketSummary(user.id)
        : dashboardApi.getSummary(),
    enabled: Boolean(user),
  });
};
