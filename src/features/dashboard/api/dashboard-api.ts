import { ORDER_STATUS_VALUES } from '@/features/orders/types/order-types';
import type { DashboardSummary } from '@/features/dashboard/types/dashboard-types';
import { apiClient } from '@/services/api/client';
import type { ApiPaginatedResult } from '@/types/api';

interface UserApiResponse {
  Id?: string;
  id?: string;
  FirstName?: string;
  firstName?: string;
  LastName?: string;
  lastName?: string;
  PhoneNumber?: string;
  phoneNumber?: string;
  PhoneNumberVerified?: boolean;
  phoneNumberVerified?: boolean;
}

interface OrderApiResponse {
  Id?: string;
  id?: string;
  TotalAmount?: number;
  totalAmount?: number;
  Status?: number;
  status?: number;
  CreatedAt?: string;
  createdAt?: string;
  UserFirstName?: string;
  userFirstName?: string;
  UserLastName?: string;
  userLastName?: string;
}

interface NotificationApiResponse {
  Id?: string;
  id?: string;
  CreatedAt?: string;
  createdAt?: string;
}

type PaginatedApiResponse<T> = Partial<ApiPaginatedResult<T>> & {
  items?: T[];
  page?: number;
  pageSize?: number;
  totalCount?: number;
};

const getPaginatedItems = <T>(data: PaginatedApiResponse<T>): T[] => {
  const items = data.Items ?? data.items;
  return Array.isArray(items) ? items : [];
};

const getPaginatedTotalCount = <T>(data: PaginatedApiResponse<T>): number => {
  return data.TotalCount ?? data.totalCount ?? getPaginatedItems(data).length;
};

const normalizeOrderActor = (order: OrderApiResponse): string => {
  const firstName = order.UserFirstName ?? order.userFirstName ?? '';
  const lastName = order.UserLastName ?? order.userLastName ?? '';
  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || '-';
};

const resolveOrderStatus = (order: OrderApiResponse): number => {
  return order.Status ?? order.status ?? ORDER_STATUS_VALUES.pending;
};

const resolveOrderActionKey = (orderStatus: number): string => {
  if (orderStatus === ORDER_STATUS_VALUES.accepted) {
    return 'dashboard.activity.orderAccepted';
  }

  if (orderStatus === ORDER_STATUS_VALUES.cancelled) {
    return 'dashboard.activity.orderCancelled';
  }

  if (orderStatus === ORDER_STATUS_VALUES.pending) {
    return 'dashboard.activity.orderPlaced';
  }

  return 'dashboard.activity.orderUpdated';
};

const resolveCreatedAt = (value?: string): string | null => {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate.toISOString();
};

const buildDashboardActivityId = (prefix: string): string => {
  return `${prefix}-${Math.floor(Math.random() * 900000) + 100000}`;
};

export const dashboardApi = {
  async getSummary(): Promise<DashboardSummary> {
    const [usersResponse, ordersResponse, notificationsResponse] = await Promise.all([
      apiClient.get<PaginatedApiResponse<UserApiResponse>>('/api/Users', {
        params: {
          page: 1,
          pageSize: 100,
          includeRoles: true,
        },
      }),
      apiClient.get<PaginatedApiResponse<OrderApiResponse>>('/api/Orders', {
        params: {
          page: 1,
          pageSize: 100,
        },
      }),
      apiClient.get<PaginatedApiResponse<NotificationApiResponse>>('/api/Notifications', {
        params: {
          Page: 1,
          PerPage: 100,
        },
      }),
    ]);

    const users = getPaginatedItems(usersResponse.data);
    const orders = getPaginatedItems(ordersResponse.data);
    const notifications = getPaginatedItems(notificationsResponse.data);

    const activeUsers = getPaginatedTotalCount(usersResponse.data);
    const newUsers = users.filter((user) => !(user.PhoneNumberVerified ?? user.phoneNumberVerified ?? false)).length;
    const nonCancelledOrders = orders.filter((order) => resolveOrderStatus(order) !== ORDER_STATUS_VALUES.cancelled);
    const revenue = nonCancelledOrders.reduce((sum, order) => {
      return sum + (order.TotalAmount ?? order.totalAmount ?? 0);
    }, 0);

    const completedOrdersCount = orders.filter((order) => {
      const orderStatus = resolveOrderStatus(order);
      return orderStatus === ORDER_STATUS_VALUES.accepted || orderStatus === ORDER_STATUS_VALUES.delivered;
    }).length;
    const conversion = orders.length > 0 ? Math.round((completedOrdersCount / orders.length) * 100) : 0;

    const activityFromOrders = orders
      .map((order) => {
        const createdAt = resolveCreatedAt(order.CreatedAt ?? order.createdAt);

        if (!createdAt) {
          return null;
        }

        const orderId = order.Id ?? order.id ?? buildDashboardActivityId('order');
        const orderStatus = resolveOrderStatus(order);

        return {
          id: `order-${orderId}`,
          actor: normalizeOrderActor(order),
          actionKey: resolveOrderActionKey(orderStatus),
          createdAt,
        };
      })
      .filter((activity): activity is NonNullable<typeof activity> => activity !== null);

    const activityFromNotifications = notifications
      .map((notification) => {
        const createdAt = resolveCreatedAt(notification.CreatedAt ?? notification.createdAt);

        if (!createdAt) {
          return null;
        }

        return {
          id: `notification-${notification.Id ?? notification.id ?? buildDashboardActivityId('notification')}`,
          actor: 'System',
          actionKey: 'dashboard.activity.notificationSent',
          createdAt,
        };
      })
      .filter((activity): activity is NonNullable<typeof activity> => activity !== null);

    const activity = [...activityFromOrders, ...activityFromNotifications]
      .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime())
      .slice(0, 10);

    return {
      kpis: [
        {
          id: 'kpi-active-users',
          labelKey: 'dashboard.cards.activeUsers',
          value: activeUsers,
          delta: 0,
        },
        {
          id: 'kpi-new-users',
          labelKey: 'dashboard.cards.newUsers',
          value: newUsers,
          delta: 0,
        },
        {
          id: 'kpi-conversion',
          labelKey: 'dashboard.cards.conversion',
          value: conversion,
          delta: 0,
        },
        {
          id: 'kpi-revenue',
          labelKey: 'dashboard.cards.revenue',
          value: revenue,
          delta: 0,
        },
      ],
      activity,
    };
  },
};
