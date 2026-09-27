import type { PaginatedData } from '@/types/api';

export type DeliveryPricingMode = 0 | 1;
export type DeliveryCashTransactionType = 0 | 1;

export interface DeliveryFinanceSummary {
  deliveryPersonId: string;
  deliveryPersonName: string;
  phoneNumber: string;
  deliveredOrdersCount: number;
  currentCashHeld: number;
  cashLimitEnabled: boolean;
  cashLimitAmount: number;
  isCashLimitReached: boolean;
  cashLimitRemaining: number | null;
  lastSettlementAt: string | null;
}

export interface DeliveryFinanceOrder {
  orderId: string;
  status: number;
  paymentWay: 0 | 1;
  createdAt: string;
  deliveredAt: string | null;
  itemsTotal: number;
  distanceKm: number;
  pricePerKilometer: number;
  distanceBasedDeliveryFee: number;
  fixedDeliveryFee: number;
  appliedDeliveryPricingMode: DeliveryPricingMode;
  chargedDeliveryFee: number;
  chargedAmount: number;
  cashCollectedAmount: number;
}

export interface DeliveryFinanceOrderItem {
  productId: string;
  productName: string;
  productImagePath: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  variantId: string | null;
  variantName: string | null;
  variantImagePath: string | null;
}

export interface DeliveryFinanceOrderDetails {
  deliveryPersonId: string;
  deliveryPersonName: string;
  order: DeliveryFinanceOrder;
  items: DeliveryFinanceOrderItem[];
}

export interface DeliveryCashTransaction {
  id: string;
  deliveryPersonId: string;
  type: DeliveryCashTransactionType;
  amount: number;
  orderId: string | null;
  settledByAdminId: string | null;
  note: string | null;
  createdAt: string;
}

export interface DeliveryUnsettledBreakdown {
  currentCashHeld: number;
  unsettledInvoicesTotal: number;
  unsettledDeliveryFeesTotal: number;
  unsettledOrdersCount: number;
  reconciledAmount: number;
  reconciliationDifference: number;
  isReconciled: boolean;
}

export interface DeliverySettlementResult {
  transactionId: string;
  deliveryPersonId: string;
  settledAmount: number;
  currentCashHeld: number;
  settledByAdminId: string;
  note: string | null;
  settledAt: string;
}

export type DeliveryFinanceList = PaginatedData<DeliveryFinanceSummary>;
export type DeliveryFinanceOrders = PaginatedData<DeliveryFinanceOrder>;
export type DeliveryFinanceTransactions = PaginatedData<DeliveryCashTransaction>;
