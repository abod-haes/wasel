import { apiClient } from '@/services/api/client';
import { toPaginatedData } from '@/services/api/pagination';
import type { PaginationParams } from '@/types/api';
import type {
  MarketFinanceSummary,
  MarketFinanceSummaries,
  MarketFinanceOrders,
  MarketFinanceOrderDetail,
  MarketFinanceTransactions,
  MarketSettlement,
} from '@/features/market-finance/types/market-finance-types';

const marketPath = (id: string) => `/api/MarketFinance/markets/${encodeURIComponent(id)}`;

export const marketFinanceApi = {
  // Admin/SuperAdmin only
  async listMarkets(pagination: PaginationParams): Promise<MarketFinanceSummaries> {
    const { data } = await apiClient.get('/api/MarketFinance/markets', { params: pagination });
    return toPaginatedData(data, pagination);
  },
  async getMarket(id: string): Promise<MarketFinanceSummary> {
    const { data } = await apiClient.get<MarketFinanceSummary>(marketPath(id));
    return data;
  },
  async getMarketOrders(id: string, pagination: PaginationParams): Promise<MarketFinanceOrders> {
    const { data } = await apiClient.get(`${marketPath(id)}/orders`, { params: pagination });
    return toPaginatedData(data, pagination);
  },
  async getMarketOrder(id: string, orderId: string): Promise<MarketFinanceOrderDetail> {
    const { data } = await apiClient.get<MarketFinanceOrderDetail>(
      `${marketPath(id)}/orders/${encodeURIComponent(orderId)}`,
    );
    return data;
  },
  async getMarketTransactions(id: string, pagination: PaginationParams): Promise<MarketFinanceTransactions> {
    const { data } = await apiClient.get(`${marketPath(id)}/transactions`, { params: pagination });
    return toPaginatedData(data, pagination);
  },
  // Full settlement only: amount is deliberately not accepted.
  async settleMarket(id: string, note?: string): Promise<MarketSettlement> {
    const trimmed = note?.trim();
    if (trimmed && trimmed.length > 500) throw new Error('Settlement note must be at most 500 characters');
    const { data } = await apiClient.post<MarketSettlement>(
      `${marketPath(id)}/settle`, trimmed ? { note: trimmed } : {},
    );
    return data;
  },
  // Market role: JWT determines scope; no caller-supplied market ID.
  async getMine(): Promise<MarketFinanceSummary> {
    const { data } = await apiClient.get<MarketFinanceSummary>('/api/MarketFinance/me');
    return data;
  },
  async getMyOrders(pagination: PaginationParams): Promise<MarketFinanceOrders> {
    const { data } = await apiClient.get('/api/MarketFinance/me/orders', { params: pagination });
    return toPaginatedData(data, pagination);
  },
  async getMyOrder(orderId: string): Promise<MarketFinanceOrderDetail> {
    const { data } = await apiClient.get<MarketFinanceOrderDetail>(
      `/api/MarketFinance/me/orders/${encodeURIComponent(orderId)}`,
    );
    return data;
  },
  async getMyTransactions(pagination: PaginationParams): Promise<MarketFinanceTransactions> {
    const { data } = await apiClient.get('/api/MarketFinance/me/transactions', { params: pagination });
    return toPaginatedData(data, pagination);
  },
};
