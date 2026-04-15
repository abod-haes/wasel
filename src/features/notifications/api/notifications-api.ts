import { env } from '@/env';
import type {
  AppNotification,
  NotificationsFilter,
  SendNotificationInput,
} from '@/features/notifications/types/notification-types';
import { apiClient } from '@/services/api/client';
import { delay } from '@/services/mock/mock-utils';
import type { ApiPaginatedResult } from '@/types/api';

interface NotificationApiResponse {
  Id?: string;
  id?: string;
  Title?: string;
  title?: string;
  Body?: string;
  body?: string;
  ImageUrl?: string;
  imageUrl?: string;
  Data?: Record<string, string>;
  data?: Record<string, string>;
  IsBroadcast: boolean;
  isBroadcast?: boolean;
  TargetUserIds?: string[];
  targetUserIds?: string[];
  CreatedAt?: string;
  createdAt?: string;
}

interface PushNotificationRequest {
  Title: string;
  Body: string;
  ImageUrl?: string;
  UserIds?: string[];
}

type NotificationPaginatedResponse = Partial<ApiPaginatedResult<NotificationApiResponse>> & {
  items?: NotificationApiResponse[];
};

let notificationsDb: AppNotification[] = [
  {
    id: 'not-1',
    title: 'تحديث التوصيل',
    body: 'تم إسناد الطلب ord-1001 إلى سائق.',
    imageUrl: 'https://example.com/notify-1.jpg',
    data: {
      orderId: 'ord-1001',
      type: 'order-status',
    },
    isBroadcast: false,
    targetUserIds: ['u-1001'],
    createdAt: '2026-04-09T11:20:00.000Z',
  },
  {
    id: 'not-2',
    title: 'نافذة صيانة',
    body: 'يوجد صيانة مجدولة اليوم الساعة 11 مساءً.',
    isBroadcast: true,
    targetUserIds: [],
    createdAt: '2026-04-09T08:00:00.000Z',
  },
  {
    id: 'not-3',
    title: 'تنبيه عروض',
    body: 'تخفيضات جديدة متاحة ضمن تصنيف المشروبات.',
    isBroadcast: false,
    targetUserIds: ['u-1002', 'u-1003'],
    createdAt: '2026-04-08T14:00:00.000Z',
  },
];

const mapNotificationResponse = (notification: NotificationApiResponse): AppNotification => {
  return {
    id: notification.Id ?? notification.id ?? '',
    title: notification.Title ?? notification.title ?? '',
    body: notification.Body ?? notification.body ?? '',
    imageUrl: notification.ImageUrl ?? notification.imageUrl,
    data: notification.Data ?? notification.data,
    isBroadcast: notification.IsBroadcast ?? notification.isBroadcast ?? false,
    targetUserIds: notification.TargetUserIds ?? notification.targetUserIds ?? [],
    createdAt: notification.CreatedAt ?? notification.createdAt ?? '',
  };
};

const getPaginatedItems = <T>(
  data: Partial<ApiPaginatedResult<T>> & { items?: T[] }
): T[] => {
  const items = data.Items ?? data.items;
  return Array.isArray(items) ? items : [];
};

const cloneNotification = (notification: AppNotification): AppNotification => {
  return {
    ...notification,
    data: notification.data ? { ...notification.data } : undefined,
    targetUserIds: [...notification.targetUserIds],
  };
};

const applySearchFilter = (notifications: AppNotification[], search: string): AppNotification[] => {
  const normalizedSearch = search.trim().toLowerCase();

  if (!normalizedSearch) {
    return notifications;
  }

  return notifications.filter((notification) => {
    return (
      notification.title.toLowerCase().includes(normalizedSearch) ||
      notification.body.toLowerCase().includes(normalizedSearch)
    );
  });
};

const buildNotificationId = (): string => {
  return 'not-' + String(Math.floor(Math.random() * 9000) + 1000);
};

export const notificationsApi = {
  async getNotifications(filters: NotificationsFilter): Promise<AppNotification[]> {
    if (env.enableMockApi) {
      await delay(350);
      return applySearchFilter(notificationsDb.map(cloneNotification), filters.search);
    }

    const { data } = await apiClient.get<NotificationPaginatedResponse>('/api/Notifications', {
      params: {
        Page: 1,
        PerPage: 100,
      },
    });

    const mappedNotifications = getPaginatedItems(data).map(mapNotificationResponse);
    return applySearchFilter(mappedNotifications, filters.search);
  },

  async pushNotification(payload: SendNotificationInput): Promise<AppNotification> {
    if (env.enableMockApi) {
      await delay(450);

      const createdNotification: AppNotification = {
        id: buildNotificationId(),
        title: payload.title,
        body: payload.body,
        imageUrl: payload.imageUrl,
        isBroadcast: !payload.userIds || payload.userIds.length === 0,
        targetUserIds: payload.userIds ?? [],
        createdAt: new Date().toISOString(),
      };

      notificationsDb = [createdNotification, ...notificationsDb];

      return cloneNotification(createdNotification);
    }

    const requestPayload: PushNotificationRequest = {
      Title: payload.title,
      Body: payload.body,
      ImageUrl: payload.imageUrl,
      UserIds: payload.userIds,
    };

    const { data } = await apiClient.post<NotificationApiResponse>('/api/Notifications/push', requestPayload);
    return mapNotificationResponse(data);
  },
};
