import { apiClient } from '@/services/api/client';
import { normalizePushMessage } from '@/features/push/push-notification-utils';
import type { IncomingPushNotification } from '@/features/push/push-notification-utils';
import { useAuthStore } from '@/store/use-auth-store';

/**
 * Firebase client config is intentionally public. Do NOT put service-account
 * JSON, OAuth private keys or FCM server credentials in frontend code.
 *
 * Firebase's official browser ES modules are loaded on demand, so the
 * existing npm lockfile/build remains unchanged.
 */
const firebaseConfig = {
  apiKey: 'AIzaSyCCCzvH8D_idPYlbLQijF07id-KBRYm-Cs',
  authDomain: 'wasel-prod.firebaseapp.com',
  projectId: 'wasel-prod',
  storageBucket: 'wasel-prod.firebasestorage.app',
  messagingSenderId: '422788970454',
  appId: '1:422788970454:web:c31c7dcf204d94da805677',
  measurementId: 'G-HC4J4584SK',
} as const;

// Pin the official hosted SDK used by the matching public service worker.
// No Analytics SDK: push alerts must not depend on tracking consent.
const firebaseVersion = '12.5.0';
const firebaseAppUrl = `https://www.gstatic.com/firebasejs/${firebaseVersion}/firebase-app.js`;
const firebaseMessagingUrl = `https://www.gstatic.com/firebasejs/${firebaseVersion}/firebase-messaging.js`;

interface FirebaseAppApi {
  getApps: () => unknown[];
  getApp: () => unknown;
  initializeApp: (config: typeof firebaseConfig) => unknown;
}
interface FirebaseMessage {
  messageId?: string;
  notification?: { title?: string; body?: string };
  data?: Record<string, string>;
}
interface FirebaseMessagingApi {
  isSupported: () => Promise<boolean>;
  getMessaging: (app: unknown) => unknown;
  getToken: (
    messaging: unknown,
    options: { vapidKey: string; serviceWorkerRegistration: ServiceWorkerRegistration },
  ) => Promise<string>;
  deleteToken: (messaging: unknown) => Promise<boolean>;
  onMessage: (messaging: unknown, callback: (payload: FirebaseMessage) => void) => () => void;
}
type FcmInstance = { sdk: FirebaseMessagingApi; messaging: unknown };
let fcmPromise: Promise<FcmInstance | null> | undefined;
let currentToken: string | null = null;

/** A public VAPID key from Firebase > Project Settings > Cloud Messaging. */
export const browserPushVapidKey = (import.meta.env.VITE_FIREBASE_VAPID_KEY ?? '').trim();

/**
 * Must be a backend-owned authenticated endpoint, explicitly configured after
 * backend implementation. We never fabricate an endpoint or send tokens to
 * unrelated origins.
 */
const configuredRegistrationPath = (import.meta.env.VITE_FCM_DEVICE_REGISTER_PATH ?? '').trim();
const configuredUnregisterPath = (import.meta.env.VITE_FCM_DEVICE_UNREGISTER_PATH ?? '').trim();
const trustedApiPath = (path: string): boolean =>
  /^\/api\/[a-z0-9/_-]+$/i.test(path) && !path.includes('//') && path.length <= 200;

export function browserPushSetupStatus(): 'unsupported' | 'missing-vapid' | 'missing-backend' | 'ready' {
  if (typeof window === 'undefined' || !window.isSecureContext ||
      !('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    return 'unsupported';
  }
  if (!browserPushVapidKey) return 'missing-vapid';
  if (!trustedApiPath(configuredRegistrationPath)) return 'missing-backend';
  return 'ready';
}

async function loadFirebase(): Promise<FcmInstance | null> {
  if (browserPushSetupStatus() !== 'ready') return null;
  if (!fcmPromise) {
    fcmPromise = (async () => {
      // Vite dynamic-import ignores these official URLs and loads the SDK on
      // demand from Firebase CDN at runtime. No dependency is introduced into
      // the dashboard's npm lockfile or JS startup chunk.
      const [appSdk, messagingSdk] = await Promise.all([
        import(/* @vite-ignore */ firebaseAppUrl) as Promise<FirebaseAppApi>,
        import(/* @vite-ignore */ firebaseMessagingUrl) as Promise<FirebaseMessagingApi>,
      ]);
      if (!(await messagingSdk.isSupported())) return null;
      const app = appSdk.getApps().length ? appSdk.getApp() : appSdk.initializeApp(firebaseConfig);
      return { sdk: messagingSdk, messaging: messagingSdk.getMessaging(app) };
    })().catch((error: unknown) => {
      fcmPromise = undefined;
      throw error;
    });
  }
  return fcmPromise;
}

async function workerRegistration(): Promise<ServiceWorkerRegistration> {
  // The file exists as a standalone public asset in production, under HTTPS.
  return navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' });
}

async function registerWithBackend(token: string, userId: string): Promise<void> {
  if (!trustedApiPath(configuredRegistrationPath)) throw new Error('FCM registration endpoint missing');
  // Bind by authenticated JWT on the server, NOT by trusting a user-supplied
  // role or user id in the body. Never use a cross-user broadcast topic.
  if (useAuthStore.getState().user?.id !== userId) return;
  await apiClient.post(configuredRegistrationPath, {
    token, provider: 'FCM', platform: 'Web',
  });
}

async function obtainToken(userId: string): Promise<string | null> {
  const instance = await loadFirebase();
  if (!instance || window.Notification.permission !== 'granted') return null;
  const registration = await workerRegistration();
  const token = await instance.sdk.getToken(instance.messaging, {
    vapidKey: browserPushVapidKey,
    serviceWorkerRegistration: registration,
  });
  if (!token) return null;
  await registerWithBackend(token, userId);
  currentToken = token;
  return token;
}

/**
 * Opt-in must come from a direct button click; never surprise the user with
 * an OS permission prompt immediately after logging in.
 */
export async function enableBrowserPush(userId: string): Promise<void> {
  const status = browserPushSetupStatus();
  if (status !== 'ready') throw new Error(status);
  if (window.Notification.permission === 'denied') throw new Error('permission-denied');
  const permission =
    window.Notification.permission === 'granted'
      ? 'granted'
      : await window.Notification.requestPermission();
  if (permission !== 'granted') throw new Error('permission-denied');
  const token = await obtainToken(userId);
  if (!token) throw new Error('token-unavailable');
}

/** Retry token binding when a previously opted-in user logs back in. */
export async function restoreBrowserPush(userId: string): Promise<void> {
  if (browserPushSetupStatus() !== 'ready' || window.Notification.permission !== 'granted') return;
  await obtainToken(userId);
}

export async function subscribeToBrowserPush(
  onAlert: (alert: IncomingPushNotification) => void,
): Promise<() => void> {
  const instance = await loadFirebase();
  if (!instance) return () => undefined;
  return instance.sdk.onMessage(instance.messaging, (message) => {
    const alert = normalizePushMessage(message);
    if (alert) onAlert(alert);
  });
}

/** Client cleanup. Backend must independently revoke tokens on logout. */
export async function revokeBrowserPush(): Promise<void> {
  const token = currentToken;
  currentToken = null;
  if (token && trustedApiPath(configuredUnregisterPath)) {
    // Best effort while auth token is still available. Server must authorize
    // removal by JWT, and bind token ownership to its active user.
    await apiClient.delete(configuredUnregisterPath, { data: { token } }).catch(() => undefined);
  }
  if (!fcmPromise) return;
  const instance = await fcmPromise.catch(() => null);
  if (instance) await instance.sdk.deleteToken(instance.messaging).catch(() => undefined);
}
