import { apiClient } from '@/services/api/client';
import { toPaginatedData } from '@/services/api/pagination';
import type { PaginationParams } from '@/types/api';

import type {
  DeliveryFinanceList,
  DeliveryFinanceOrderDetails,
  DeliveryFinanceOrders,
  DeliveryFinanceSummary,
  DeliveryFinanceTransactions,
  DeliverySettlementResult,
} from '@/features/delivery-finance/types/delivery-finance-types';

export const deliveryFinanceApi = {
  async getDeliveries(pagination: PaginationParams): Promise<DeliveryFinanceList> {
    const { data } = await apiClient.get('/api/DeliveryFinance/deliveries', {
      params: pagination,
    });
    return toPaginatedData(data, pagination);
  },

  async getDelivery(deliveryPersonId: string): Promise<DeliveryFinanceSummary> {
    const { data } = await apiClient.get<DeliveryFinanceSummary>(
      `/api/DeliveryFinance/deliveries/${deliveryPersonId}`,
    );
    return data;
  },

  async getOrders(
    deliveryPersonId: string,
    pagination: PaginationParams,
  ): Promise<DeliveryFinanceOrders> {
    const { data } = await apiClient.get(
      `/api/DeliveryFinance/deliveries/${deliveryPersonId}/orders`,
      { params: pagination },
    );
    return toPaginatedData(data, pagination);
  },

  async getOrder(orderId: string): Promise<DeliveryFinanceOrderDetails> {
    const { data } = await apiClient.get<DeliveryFinanceOrderDetails>(
      `/api/DeliveryFinance/orders/${orderId}`,
    );
    return data;
  },

  async getTransactions(
    deliveryPersonId: string,
    pagination: PaginationParams,
  ): Promise<DeliveryFinanceTransactions> {
    const { data } = await apiClient.get(
      `/api/DeliveryFinance/deliveries/${deliveryPersonId}/transactions`,
      { params: pagination },
    );
    return toPaginatedData(data, pagination);
  },

  async settle(deliveryPersonId: string, note?: string): Promise<DeliverySettlementResult> {
    const { data } = await apiClient.post<DeliverySettlementResult>(
      `/api/DeliveryFinance/deliveries/${deliveryPersonId}/settle`,
      note?.trim() ? { note: note.trim() } : {},
    );
    return data;
  },
};
