import axios from 'axios';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';

import { queryKeys } from '@/constants/query-keys';
import { deliveryFinanceApi } from '@/features/delivery-finance/api/delivery-finance-api';
import type { PaginationParams } from '@/types/api';

function apiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    if (typeof data?.message === 'string' && data.message.trim()) return data.message;
  }

  return error instanceof Error ? error.message : 'تعذر تنفيذ العملية.';
}

export const useDeliveryFinanceListQuery = (pagination: PaginationParams) =>
  useQuery({
    queryKey: queryKeys.deliveryFinance.list(pagination),
    queryFn: () => deliveryFinanceApi.getDeliveries(pagination),
    placeholderData: keepPreviousData,
  });

export const useDeliveryFinanceSummaryQuery = (deliveryPersonId?: string) =>
  useQuery({
    queryKey: queryKeys.deliveryFinance.detail(deliveryPersonId ?? ''),
    queryFn: () => deliveryFinanceApi.getDelivery(deliveryPersonId ?? ''),
    enabled: Boolean(deliveryPersonId),
  });

export const useDeliveryFinanceOrdersQuery = (
  deliveryPersonId: string | undefined,
  pagination: PaginationParams,
) =>
  useQuery({
    queryKey: queryKeys.deliveryFinance.orders(deliveryPersonId ?? '', pagination),
    queryFn: () => deliveryFinanceApi.getOrders(deliveryPersonId ?? '', pagination),
    enabled: Boolean(deliveryPersonId),
    placeholderData: keepPreviousData,
  });

export const useDeliveryFinanceTransactionsQuery = (
  deliveryPersonId: string | undefined,
  pagination: PaginationParams,
) =>
  useQuery({
    queryKey: queryKeys.deliveryFinance.transactions(deliveryPersonId ?? '', pagination),
    queryFn: () => deliveryFinanceApi.getTransactions(deliveryPersonId ?? '', pagination),
    enabled: Boolean(deliveryPersonId),
    placeholderData: keepPreviousData,
  });

export const useDeliveryFinanceOrderQuery = (orderId?: string) =>
  useQuery({
    queryKey: queryKeys.deliveryFinance.order(orderId ?? ''),
    queryFn: () => deliveryFinanceApi.getOrder(orderId ?? ''),
    enabled: Boolean(orderId),
  });

export const useSettleDeliveryCashMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ deliveryPersonId, note }: { deliveryPersonId: string; note?: string }) =>
      deliveryFinanceApi.settle(deliveryPersonId, note),
    onSuccess: async (_, variables) => {
      toast.success('تمت تسوية رصيد المندوب');
      await queryClient.invalidateQueries({
        queryKey: queryKeys.deliveryFinance.root,
      });
    },
    onError: (error) => {
      toast.error(apiErrorMessage(error));
    },
  });
};
