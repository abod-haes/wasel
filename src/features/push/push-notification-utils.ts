/** Shared between the dashboard and the service worker's payload contract. */
export type PushNotificationData = Readonly<Record<string, string | undefined>>;

export interface IncomingPushNotification {
  id: string;
  title: string;
  body: string;
  orderId?: string;
  url: string;
  receivedAt: string;
  read: boolean;
  type?: string;
}

/** Never navigate to a URL supplied by a remote notification directly. */
export function safeOrderLink(data: PushNotificationData): string {
  const rawOrderId = data.orderId ?? data.OrderId;
  const orderId = typeof rawOrderId === 'string' ? rawOrderId.trim() : '';
  if (!orderId || orderId.length > 128 || !/^[\p{L}\p{N}_.-]+$/u.test(orderId)) {
    return '/orders';
  }
  return `/orders?search=${encodeURIComponent(orderId)}`;
}

export function normalizePushMessage(
  payload: {
    messageId?: string;
    notification?: { title?: string; body?: string };
    data?: Record<string, string>;
  },
  now = new Date(),
): IncomingPushNotification | null {
  const data = payload.data ?? {};
  const rawId = payload.messageId ?? data.notificationId ?? data.NotificationId;
  const id = typeof rawId === 'string' && rawId.trim().length > 0 && rawId.length < 200
    ? rawId
    : null;
  // Do not turn arbitrary FCM messages or analytics traffic into order alerts.
  const type = (data.type ?? data.Type ?? '').trim().toLowerCase();
  const knownTypes = [
    'order_created', 'order_assigned', 'order_ready', 'market_order_created',
    'market_order_assigned', 'market_order_ready', 'new_order',
    'order-status', 'order_status_changed',
  ];
  if (!id || (!knownTypes.includes(type) && !data.orderId && !data.OrderId)) return null;

  const title = (payload.notification?.title ?? data.title ?? data.Title ?? 'تحديث على الطلب').trim().slice(0, 120);
  const body = (payload.notification?.body ?? data.body ?? data.Body ?? 'في تحديث جديد على أحد الطلبات.').trim().slice(0, 420);

  return {
    id,
    title,
    body,
    orderId: data.orderId ?? data.OrderId,
    type,
    url: safeOrderLink(data),
    read: false,
    receivedAt: now.toISOString(),
  };
}
