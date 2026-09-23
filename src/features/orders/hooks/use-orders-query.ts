import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { queryKeys } from '@/constants/query-keys';
import { ordersApi } from '@/features/orders/api/orders-api';
import { isAdminRole, isMarketRole } from '@/services/auth/auth-roles';
import { useAuthStore } from '@/store/use-auth-store';
import type { OrdersFilter } from '@/features/orders/types/order-types';
import type { PaginationParams } from '@/types/api';

export const useOrdersQuery = (filters: OrdersFilter, pagination: PaginationParams) => {
  const user = useAuthStore((state) => state.user);
  const isMarket = isMarketRole(user?.roles ?? []) && !isAdminRole(user?.roles ?? []);
  const marketUserId = isMarket ? user?.id : undefined;

  return useQuery({
    queryKey: queryKeys.orders.list({ filters, pagination, marketUserId }),
    queryFn: () => ordersApi.getOrders(filters, pagination, marketUserId),
    placeholderData: keepPreviousData,
    refetchInterval: 7_000,
    refetchIntervalInBackground: false,
  });
};

export const useAcceptOrderMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (orderId: string) => ordersApi.acceptOrder(orderId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.root });
      toast.success(t('orders.messages.accepted'));
    },
  });
};

export const useRejectOrderMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (orderId: string) => ordersApi.rejectOrder(orderId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.root });
      toast.success(t('orders.messages.rejected'));
    },
  });
};
