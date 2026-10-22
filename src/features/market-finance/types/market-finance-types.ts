import type { PaginatedData } from '@/types/api';

export interface MarketFinanceSummary {
  marketUserId: string;
  marketName: string;
  phoneNumber: string | null;
  deliveredOrdersCount: number;
  currentAmountDue: number;
  lastSettlementAt: string | null;
}

export interface MarketFinanceOrder {
  orderId: string;
  createdAt: string;
  deliveredAt: string | null;
  productsAmount: number;
  orderDiscountAmount: number;
}

export interface MarketFinanceItem {
  productId: string;
  productName: string;
  variantId: string | null;
  variantName: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface MarketFinanceOrderDetail {
  marketUserId: string;
  marketName: string;
  order: MarketFinanceOrder;
  items: MarketFinanceItem[];
}

export interface MarketPayableTransaction {
  id: string;
  marketUserId: string;
  type: 0 | 1;
  amount: number;
  orderId: string | null;
  settledByAdminId: string | null;
  note: string | null;
  createdAt: string;
}

export interface MarketSettlement {
  transactionId: string;
  marketUserId: string;
  settledAmount: number;
  currentAmountDue: number;
  settledByAdminId: string;
  note: string | null;
  settledAt: string;
}

export type MarketFinanceSummaries = PaginatedData<MarketFinanceSummary>;
export type MarketFinanceOrders = PaginatedData<MarketFinanceOrder>;
export type MarketFinanceTransactions = PaginatedData<MarketPayableTransaction>;
