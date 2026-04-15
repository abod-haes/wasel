import { env } from '@/env';
import {
  ORDER_STATUS_VALUES,
  type Order,
  type OrderStatus,
  type OrdersFilter,
} from '@/features/orders/types/order-types';
import { apiClient } from '@/services/api/client';
import { delay } from '@/services/mock/mock-utils';
import type { ApiPaginatedResult } from '@/types/api';

interface OrderItemApiResponse {
  ProductId?: string;
  productId?: string;
  ProductName?: string;
  productName?: string;
  ProductImagePath?: string;
  productImagePath?: string;
  UnitPrice?: number;
  unitPrice?: number;
  Quantity?: number;
  quantity?: number;
  LineTotal?: number;
  lineTotal?: number;
}

interface OrderApiResponse {
  Id?: string;
  id?: string;
  TotalAmount?: number;
  totalAmount?: number;
  JourneyPrice?: number;
  journeyPrice?: number;
  PricePerKilometer?: number;
  pricePerKilometer?: number;
  DistanceKm?: number;
  distanceKm?: number;
  Status?: OrderStatus;
  status?: OrderStatus;
  PaymentWay?: 0 | 1;
  paymentWay?: 0 | 1;
  CreatedAt?: string;
  createdAt?: string;
  Items?: OrderItemApiResponse[];
  items?: OrderItemApiResponse[];
  UserId?: string;
  userId?: string;
  UserLocation?: string;
  userLocation?: string;
  UserLatitude?: number;
  userLatitude?: number;
  UserLongitude?: number;
  userLongitude?: number;
  UserFirstName?: string;
  userFirstName?: string;
  UserLastName?: string;
  userLastName?: string;
  UserPhoneNumber?: string;
  userPhoneNumber?: string;
  DeliveryPersonId?: string;
  deliveryPersonId?: string;
  DeliveryPersonName?: string;
  deliveryPersonName?: string;
  AcceptedAt?: string;
  acceptedAt?: string;
  DeliveredAt?: string;
  deliveredAt?: string;
  InvoiceImagePath?: string;
  invoiceImagePath?: string;
  DeliveryLatitude?: number;
  deliveryLatitude?: number;
  DeliveryLongitude?: number;
  deliveryLongitude?: number;
  DeliveryLocationUpdatedAt?: string;
  deliveryLocationUpdatedAt?: string;
}

interface UpdateOrderStatusRequest {
  Status: OrderStatus;
}

type OrderPaginatedResponse = Partial<ApiPaginatedResult<OrderApiResponse>> & {
  items?: OrderApiResponse[];
};

let ordersDb: Order[] = [
  {
    id: 'ord-1001',
    totalAmount: 30,
    journeyPrice: 5,
    pricePerKilometer: 1,
    distanceKm: 5,
    status: ORDER_STATUS_VALUES.pending,
    paymentWay: 0,
    createdAt: '2026-04-09T10:20:00.000Z',
    items: [
      {
        productId: 'prd-1',
        productName: 'عصير تفاح',
        productImagePath: 'storage/products/apple-juice.jpg',
        unitPrice: 12.5,
        quantity: 2,
        lineTotal: 25,
      },
    ],
    userId: 'usr-1',
    userLocation: 'دمشق',
    userLatitude: 33.5138,
    userLongitude: 36.2765,
    userFirstName: 'سارة',
    userLastName: 'خالد',
    userPhoneNumber: '+963912345678',
    invoiceImagePath: 'storage/invoices/inv-1.jpg',
  },
  {
    id: 'ord-1002',
    totalAmount: 18,
    journeyPrice: 3,
    pricePerKilometer: 1,
    distanceKm: 3,
    status: ORDER_STATUS_VALUES.accepted,
    paymentWay: 1,
    createdAt: '2026-04-09T09:10:00.000Z',
    items: [
      {
        productId: 'prd-3',
        productName: 'شيبس بطاطا',
        productImagePath: 'storage/products/chips.jpg',
        unitPrice: 8,
        quantity: 1,
        lineTotal: 8,
      },
      {
        productId: 'prd-4',
        productName: 'حليب طازج',
        productImagePath: 'storage/products/milk.jpg',
        unitPrice: 9.75,
        quantity: 1,
        lineTotal: 9.75,
      },
    ],
    userId: 'usr-2',
    userLocation: 'دمشق - المزة',
    userLatitude: 33.515,
    userLongitude: 36.27,
    userFirstName: 'أحمد',
    userLastName: 'علي',
    userPhoneNumber: '+963987654321',
    deliveryPersonId: 'drv-1',
    deliveryPersonName: 'عمر السائق',
    acceptedAt: '2026-04-09T09:15:00.000Z',
    invoiceImagePath: 'storage/invoices/inv-2.jpg',
  },
  {
    id: 'ord-1003',
    totalAmount: 9.75,
    status: ORDER_STATUS_VALUES.cancelled,
    paymentWay: 0,
    createdAt: '2026-04-08T19:00:00.000Z',
    items: [
      {
        productId: 'prd-4',
        productName: 'حليب طازج',
        productImagePath: 'storage/products/milk.jpg',
        unitPrice: 9.75,
        quantity: 1,
        lineTotal: 9.75,
      },
    ],
    userId: 'usr-3',
    userLocation: 'دمشق - الميدان',
    userFirstName: 'لينا',
    userLastName: 'جورج',
    userPhoneNumber: '+963955111222',
  },
];

const mapOrderResponse = (order: OrderApiResponse): Order => {
  const items = order.Items ?? order.items ?? [];

  return {
    id: order.Id ?? order.id ?? '',
    totalAmount: order.TotalAmount ?? order.totalAmount ?? 0,
    journeyPrice: order.JourneyPrice ?? order.journeyPrice,
    pricePerKilometer: order.PricePerKilometer ?? order.pricePerKilometer,
    distanceKm: order.DistanceKm ?? order.distanceKm,
    status: order.Status ?? order.status ?? ORDER_STATUS_VALUES.pending,
    paymentWay: order.PaymentWay ?? order.paymentWay ?? 0,
    createdAt: order.CreatedAt ?? order.createdAt ?? '',
    items: items.map((item) => ({
      productId: item.ProductId ?? item.productId ?? '',
      productName: item.ProductName ?? item.productName ?? '',
      productImagePath: item.ProductImagePath ?? item.productImagePath,
      unitPrice: item.UnitPrice ?? item.unitPrice ?? 0,
      quantity: item.Quantity ?? item.quantity ?? 0,
      lineTotal: item.LineTotal ?? item.lineTotal ?? 0,
    })),
    userId: order.UserId ?? order.userId ?? '',
    userLocation: order.UserLocation ?? order.userLocation,
    userLatitude: order.UserLatitude ?? order.userLatitude,
    userLongitude: order.UserLongitude ?? order.userLongitude,
    userFirstName: order.UserFirstName ?? order.userFirstName,
    userLastName: order.UserLastName ?? order.userLastName,
    userPhoneNumber: order.UserPhoneNumber ?? order.userPhoneNumber,
    deliveryPersonId: order.DeliveryPersonId ?? order.deliveryPersonId,
    deliveryPersonName: order.DeliveryPersonName ?? order.deliveryPersonName,
    acceptedAt: order.AcceptedAt ?? order.acceptedAt,
    deliveredAt: order.DeliveredAt ?? order.deliveredAt,
    invoiceImagePath: order.InvoiceImagePath ?? order.invoiceImagePath,
    deliveryLatitude: order.DeliveryLatitude ?? order.deliveryLatitude,
    deliveryLongitude: order.DeliveryLongitude ?? order.deliveryLongitude,
    deliveryLocationUpdatedAt: order.DeliveryLocationUpdatedAt ?? order.deliveryLocationUpdatedAt,
  };
};

const getPaginatedItems = <T>(
  data: Partial<ApiPaginatedResult<T>> & { items?: T[] }
): T[] => {
  const items = data.Items ?? data.items;
  return Array.isArray(items) ? items : [];
};

const cloneOrder = (order: Order): Order => {
  return {
    ...order,
    items: order.items.map((item) => ({ ...item })),
  };
};

const applyFilters = (orders: Order[], filters: OrdersFilter): Order[] => {
  const normalizedSearch = filters.search.trim().toLowerCase();

  return orders.filter((order) => {
    const customerName = `${order.userFirstName ?? ''} ${order.userLastName ?? ''}`.trim().toLowerCase();

    const matchesSearch =
      !normalizedSearch ||
      order.id.toLowerCase().includes(normalizedSearch) ||
      customerName.includes(normalizedSearch) ||
      (order.userPhoneNumber ?? '').toLowerCase().includes(normalizedSearch);

    const matchesStatus = filters.status === 'all' || order.status === filters.status;

    return matchesSearch && matchesStatus;
  });
};

const updateOrderStatusInDb = (orderId: string, status: OrderStatus): Order => {
  let updatedOrder: Order | undefined;

  ordersDb = ordersDb.map((order) => {
    if (order.id !== orderId) {
      return order;
    }

    updatedOrder = {
      ...order,
      status,
      acceptedAt: status === ORDER_STATUS_VALUES.accepted ? new Date().toISOString() : order.acceptedAt,
    };

    return updatedOrder;
  });

  if (!updatedOrder) {
    throw new Error('Order not found');
  }

  return cloneOrder(updatedOrder);
};

export const ordersApi = {
  async getOrders(filters: OrdersFilter): Promise<Order[]> {
    if (env.enableMockApi) {
      await delay(400);
      return applyFilters(ordersDb.map(cloneOrder), filters);
    }

    const { data } = await apiClient.get<OrderPaginatedResponse>('/api/Orders', {
      params: {
        page: 1,
        pageSize: 100,
        status: filters.status === 'all' ? undefined : filters.status,
      },
    });

    const mappedOrders = getPaginatedItems(data).map(mapOrderResponse);
    return applyFilters(mappedOrders, filters);
  },

  async acceptOrder(orderId: string): Promise<Order> {
    if (env.enableMockApi) {
      await delay(350);
      return updateOrderStatusInDb(orderId, ORDER_STATUS_VALUES.accepted);
    }

    const request: UpdateOrderStatusRequest = {
      Status: ORDER_STATUS_VALUES.accepted,
    };

    const { data } = await apiClient.put<OrderApiResponse>(`/api/Orders/${orderId}/status`, request);
    return mapOrderResponse(data);
  },

  async rejectOrder(orderId: string): Promise<Order> {
    if (env.enableMockApi) {
      await delay(350);
      return updateOrderStatusInDb(orderId, ORDER_STATUS_VALUES.cancelled);
    }

    const request: UpdateOrderStatusRequest = {
      Status: ORDER_STATUS_VALUES.cancelled,
    };

    const { data } = await apiClient.put<OrderApiResponse>(`/api/Orders/${orderId}/status`, request);
    return mapOrderResponse(data);
  },
};
