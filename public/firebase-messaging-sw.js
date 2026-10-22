/* RODO production dashboard push worker.
 * Firebase browser configuration is public; never put server keys here.
 * Backend must send to the authenticated recipient's registered device only.
 */
const RODO_ORIGIN = self.location.origin;

function orderTarget(data) {
  const raw = data && (data.orderId || data.OrderId);
  if (typeof raw !== 'string' || raw.length > 128 || !/^[\p{L}\p{N}_.-]+$/u.test(raw)) {
    return '/orders';
  }
  return '/orders?search=' + encodeURIComponent(raw);
}

function safeTarget(raw) {
  if (typeof raw !== 'string' || !raw.trim()) return '/orders';
  try {
    const url = new URL(raw, RODO_ORIGIN);
    if (url.origin !== RODO_ORIGIN) return '/orders';
    if (!/^\/(orders|market-finance)(?:\/|$)/.test(url.pathname)) return '/orders';
    return url.pathname + url.search;
  } catch {
    return '/orders';
  }
}

// Register before Firebase handlers, so a notification click opens an allowed
// dashboard route instead of an arbitrary URL coming from untrusted push data.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  const target = safeTarget(data.url || orderTarget(data));
  event.waitUntil((async () => {
    const windows = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of windows) {
      if (new URL(client.url).origin === RODO_ORIGIN) {
        await client.focus();
        client.navigate(target);
        return;
      }
    }
    await clients.openWindow(target);
  })());
});

importScripts('https://www.gstatic.com/firebasejs/12.5.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.5.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyCCCzvH8D_idPYlbLQijF07id-KBRYm-Cs',
  authDomain: 'wasel-prod.firebaseapp.com',
  projectId: 'wasel-prod',
  storageBucket: 'wasel-prod.firebasestorage.app',
  messagingSenderId: '422788970454',
  appId: '1:422788970454:web:c31c7dcf204d94da805677',
  measurementId: 'G-HC4J4584SK',
});

const messaging = firebase.messaging();
messaging.onBackgroundMessage((payload) => {
  // Firebase automatically shows background notification payloads. Only show
  // a custom toast for data-only messages to avoid two system notifications.
  if (payload.notification) return;
  const data = payload.data || {};
  const type = (data.type || data.Type || '').toLowerCase();
  if (!/order|market/.test(type) && !data.orderId && !data.OrderId) return;
  const title = (data.title || data.Title || 'طلب جديد في RODO').slice(0, 120);
  const body = (data.body || data.Body || 'افتح الداشبورد لمتابعة الطلب.').slice(0, 420);
  return self.registration.showNotification(title, {
    body,
    icon: '/branding/rodo-icon.png',
    badge: '/branding/rodo-icon.png',
    tag: 'rodo-order-' + String(data.orderId || data.notificationId || type).slice(0, 80),
    data: { url: orderTarget(data) },
  });
});
