export interface AppNotification {
  id: string;
  title: string;
  body: string;
  imageUrl?: string;
  data?: Record<string, string>;
  isBroadcast: boolean;
  targetUserIds: string[];
  createdAt: string;
}

export interface NotificationsFilter {
  search: string;
}

export interface SendNotificationInput {
  title: string;
  body: string;
  imageUrl?: string;
  userIds?: string[];
}
