import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(path, 'utf8');

test('web push is opt-in with public VAPID and authenticated backend binding', () => {
  const service = read('src/features/push/browser-push.ts');
  const env = read('.env.example');
  assert.match(service, /Notification\.requestPermission\(\)/);
  assert.match(service, /VITE_FIREBASE_VAPID_KEY/);
  assert.match(service, /VITE_FCM_DEVICE_REGISTER_PATH/);
  assert.match(service, /getToken\(instance\.messaging/);
  assert.match(service, /apiClient\.post\(configuredRegistrationPath/);
  assert.match(service, /registerWithBackend\(token, userId\)/);
  assert.match(service, /window\.isSecureContext/);
  assert.match(env, /VITE_FCM_DEVICE_UNREGISTER_PATH/);
  assert.doesNotMatch(service, /private_key|serviceAccount|client_secret/);
});

test('only authenticated admin and market receive orders, with safe links', () => {
  const bridge = read('src/features/push/push-notifications-bridge.tsx');
  const normalization = read('src/features/push/push-notification-utils.ts');
  const orders = read('src/features/orders/pages/orders-page.tsx');
  assert.match(bridge, /isAdminRole\(roles\) \|\| isMarketRole\(roles\)/);
  assert.match(bridge, /subscribeToBrowserPush/);
  assert.match(bridge, /invalidateQueries\(\{ queryKey: queryKeys\.orders\.root \}\)/);
  assert.match(normalization, /orderId\.length > 128/);
  assert.match(normalization, /\/orders\?search=/);
  assert.match(orders, /searchParams\.get\('search'\)/);
  assert.match(bridge, /rodo:logout/);
});

test('service worker shows only data-only background messages and uses same origin', () => {
  const worker = read('public/firebase-messaging-sw.js');
  assert.match(worker, /messaging\.onBackgroundMessage/);
  assert.match(worker, /if \(payload\.notification\) return/);
  assert.match(worker, /url\.origin !== RODO_ORIGIN/);
  assert.match(worker, /notificationclick/);
  assert.match(worker, /firebase-messaging-compat\.js/);
  assert.doesNotMatch(worker, /serverKey|private_key/);
});

test('notifications bell does not display fake unread counts and has a market inbox', () => {
  const bell = read('src/components/shared/NotificationsButton.tsx');
  const uiStore = read('src/store/use-ui-store.ts');
  assert.match(bell, /usePushInboxStore/);
  assert.match(bell, /تفعيل إشعارات الطلبات/);
  assert.match(bell, /markRead\(item\.id\)/);
  assert.match(bell, /navigate\(item\.url\)/);
  assert.match(uiStore, /unreadNotificationsCount: 0/);
  assert.doesNotMatch(bell, /markNotificationsAsRead/);
});
