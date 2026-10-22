import { useEffect } from 'react';
import { toast } from 'sonner';

import {
  browserPushSetupStatus,
  restoreBrowserPush,
  revokeBrowserPush,
  subscribeToBrowserPush,
} from '@/features/push/browser-push';
import { usePushInboxStore } from '@/features/push/push-inbox-store';
import { queryKeys } from '@/constants/query-keys';
import { queryClient } from '@/lib/query-client';
import { isAdminRole, isMarketRole } from '@/services/auth/auth-roles';
import { useAuthStore } from '@/store/use-auth-store';

/**
 * Installed once in the private app shell; never mounted on the login page.
 * Only Admin/SuperAdmin/Market may subscribe, and the backend MUST enforce
 * actual per-user device ownership and order targeting using the JWT.
 */
export function PushNotificationsBridge(): null {
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const roles = useAuthStore((s) => s.user?.roles ?? []);
  const recipient = isAdminRole(roles) || isMarketRole(roles);

  useEffect(() => {
    const reset = () => {
      // Begin revocation while the authenticated API request still has a JWT.
      void revokeBrowserPush();
      usePushInboxStore.getState().bindUser(null);
    };
    window.addEventListener('rodo:logout', reset);
    return () => window.removeEventListener('rodo:logout', reset);
  }, []);

  useEffect(() => {
    const store = usePushInboxStore.getState();
    store.bindUser(recipient ? userId : null);
    if (!recipient || !userId) return;

    const status = browserPushSetupStatus();
    if (status !== 'ready') {
      store.setConnection('unavailable', status);
      return;
    }

    if (Notification.permission === 'denied') {
      store.setConnection('denied', 'permission-denied');
      return;
    }

    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    if (Notification.permission === 'granted') {
      store.setConnection('connecting');
      // Do not re-prompt on each navigation. A previously allowed browser
      // should silently re-register and refresh the token-to-JWT binding.
      void restoreBrowserPush(userId)
        .then(() => {
          if (!cancelled && useAuthStore.getState().user?.id === userId) {
            usePushInboxStore.getState().setConnection('active');
          }
        })
        .catch(() => {
          if (!cancelled) usePushInboxStore.getState().setConnection('error', 'backend-unavailable');
        });
    }

    void subscribeToBrowserPush((alert) => {
      if (cancelled || useAuthStore.getState().user?.id !== userId) return;
      usePushInboxStore.getState().receive(alert);
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.root });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.root });
      // Notification events do not bypass any authorization checks: the target
      // order page will always re-fetch scoped data from the backend.
      toast(alert.title, {
        id: alert.id,
        description: alert.body,
        action: {
          label: 'عرض الطلب',
          onClick: () => window.location.assign(alert.url),
        },
      });
    }).then((off) => {
      if (cancelled) off();
      else unsubscribe = off;
    }).catch(() => {
      if (!cancelled) usePushInboxStore.getState().setConnection('error', 'sdk-unavailable');
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [recipient, userId]);

  return null;
}
