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
  DeliveryUnsettledBreakdown,
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

  async getUnsettledBreakdown(
    deliveryPersonId: string,
    lastSettlementAt: string | null,
    currentCashHeld: number,
  ): Promise<DeliveryUnsettledBreakdown> {
    if (currentCashHeld <= 0) {
      return {
        currentCashHeld: 0,
        unsettledInvoicesTotal: 0,
        unsettledDeliveryFeesTotal: 0,
        unsettledOrdersCount: 0,
        reconciledAmount: 0,
        reconciliationDifference: 0,
        isReconciled: true,
      };
    }

    const pageSize = 100;
    let page = 1;
    const orders: DeliveryFinanceOrders['items'] = [];

    while (true) {
      const result = await deliveryFinanceApi.getOrders(deliveryPersonId, { page, pageSize });
      orders.push(...result.items);

      if (page >= result.totalPages || result.items.length === 0) break;
      page += 1;
    }

    const lastSettlementTime = lastSettlementAt
      ? new Date(lastSettlementAt).getTime()
      : Number.NEGATIVE_INFINITY;

    const unsettledOrders = orders.filter((order) => {
      const deliveredTime = order.deliveredAt ? new Date(order.deliveredAt).getTime() : 0;
      return (
        order.status === 4 &&
        order.paymentWay === 0 &&
        order.cashCollectedAmount > 0 &&
        deliveredTime > lastSettlementTime
      );
    });

    const reconciledAmount = unsettledOrders.reduce(
      (sum, order) => sum + order.cashCollectedAmount,
      0,
    );
    const unsettledDeliveryFeesTotal = unsettledOrders.reduce(
      (sum, order) => sum + order.chargedDeliveryFee,
      0,
    );
    const unsettledInvoicesTotal = unsettledOrders.reduce(
      (sum, order) => sum + Math.max(0, order.chargedAmount - order.chargedDeliveryFee),
      0,
    );
    const reconciliationDifference = currentCashHeld - reconciledAmount;

    return {
      currentCashHeld,
      unsettledInvoicesTotal,
      unsettledDeliveryFeesTotal,
      unsettledOrdersCount: unsettledOrders.length,
      reconciledAmount,
      reconciliationDifference,
      isReconciled: Math.abs(reconciliationDifference) < 0.01,
    };
  },

  async settle(deliveryPersonId: string, note?: string): Promise<DeliverySettlementResult> {
    const { data } = await apiClient.post<DeliverySettlementResult>(
      `/api/DeliveryFinance/deliveries/${deliveryPersonId}/settle`,
      note?.trim() ? { note: note.trim() } : {},
    );
    return data;
  },
};
