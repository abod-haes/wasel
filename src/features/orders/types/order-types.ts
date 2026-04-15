export const ORDER_STATUSES = [0, 1, 2, 3, 4, 5] as const;
export const PAYMENT_WAYS = [0, 1] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type PaymentWay = (typeof PAYMENT_WAYS)[number];

export const ORDER_STATUS_VALUES = {
  pending: 0 as OrderStatus,
  waitingForDelivery: 1 as OrderStatus,
  accepted: 2 as OrderStatus,
  outForDelivery: 3 as OrderStatus,
  delivered: 4 as OrderStatus,
  cancelled: 5 as OrderStatus,
};

export interface OrderItem {
  productId: string;
  productName: string;
  productImagePath?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  totalAmount: number;
  journeyPrice?: number;
  pricePerKilometer?: number;
  distanceKm?: number;
  status: OrderStatus;
  paymentWay: PaymentWay;
  createdAt: string;
  items: OrderItem[];
  userId: string;
  userLocation?: string;
  userLatitude?: number;
  userLongitude?: number;
  userFirstName?: string;
  userLastName?: string;
  userPhoneNumber?: string;
  deliveryPersonId?: string;
  deliveryPersonName?: string;
  acceptedAt?: string;
  deliveredAt?: string;
  invoiceImagePath?: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  deliveryLocationUpdatedAt?: string;
}

export interface OrdersFilter {
  search: string;
  status: OrderStatus | 'all';
}
