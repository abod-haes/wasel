import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { queryKeys } from '@/constants/query-keys';
import { ordersApi } from '@/features/orders/api/orders-api';
import type { OrdersFilter } from '@/features/orders/types/order-types';

export const useOrdersQuery = (filters: OrdersFilter) => {
  return useQuery({
    queryKey: queryKeys.orders.list(filters),
    queryFn: () => ordersApi.getOrders(filters),
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
