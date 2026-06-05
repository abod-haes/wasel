import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { queryKeys } from '@/constants/query-keys';
import { ordersApi } from '@/features/orders/api/orders-api';
import type { OrdersFilter } from '@/features/orders/types/order-types';
import type { PaginationParams } from '@/types/api';

export const useOrdersQuery = (filters: OrdersFilter, pagination: PaginationParams) => {
  return useQuery({
    queryKey: queryKeys.orders.list({ filters, pagination }),
    queryFn: () => ordersApi.getOrders(filters, pagination),
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
