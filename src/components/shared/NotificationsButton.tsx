import { Bell, BellRing, CheckCheck, ExternalLink, Settings2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { browserPushSetupStatus, enableBrowserPush } from '@/features/push/browser-push';
import { usePushInboxStore } from '@/features/push/push-inbox-store';
import { formatDateTime } from '@/lib/date-time';
import { isAdminRole, isMarketRole } from '@/services/auth/auth-roles';
import { useAuthStore } from '@/store/use-auth-store';

export function NotificationsButton(): React.JSX.Element | null {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const recipient = isAdminRole(user?.roles ?? []) || isMarketRole(user?.roles ?? []);
  const admin = isAdminRole(user?.roles ?? []);
  const items = usePushInboxStore((s) => s.items);
  const connection = usePushInboxStore((s) => s.connection);
  const error = usePushInboxStore((s) => s.error);
  const markAllRead = usePushInboxStore((s) => s.markAllRead);
  const markRead = usePushInboxStore((s) => s.markRead);
  const setConnection = usePushInboxStore((s) => s.setConnection);
  const [enabling, setEnabling] = useState(false);

  if (!user || !recipient) return null;

  const unread = items.filter((item) => !item.read).length;
  const setup = browserPushSetupStatus();
  const permission = typeof Notification !== 'undefined' ? Notification.permission : 'default';

  const enable = async () => {
    if (enabling) return;
    setEnabling(true);
    setConnection('connecting');
    try {
      await enableBrowserPush(user.id);
      setConnection('active');
    } catch (reason) {
      const code = reason instanceof Error ? reason.message : 'activation-failed';
      setConnection(code === 'permission-denied' ? 'denied' : 'error', code);
    } finally {
      setEnabling(false);
    }
  };

  const setupMessage = setup === 'missing-vapid'
    ? 'يلزم إضافة مفتاح Web Push العام (VAPID) إلى إعدادات النشر.'
    : setup === 'missing-backend'
      ? 'يلزم تفعيل API تسجيل الجهاز بالباك وإضافة مساره في إعدادات النشر.'
      : setup === 'unsupported'
        ? 'متصفحك لا يدعم إشعارات الويب، أو الصفحة ليست على HTTPS.'
        : connection === 'denied' || permission === 'denied'
          ? 'تم حظر الإشعارات من المتصفح. اسمح بها من إعدادات الموقع.'
          : connection === 'error'
            ? 'تعذّر الاتصال بخدمة الإشعارات. جرّب التفعيل مرة ثانية بعد التحقق من السيرفر.'
            : 'فعّل إشعارات المتصفح لتوصلك تنبيهات الطلبات أثناء عمل الداشبورد أو بالخلفية.';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon" className="relative" aria-label={t('layout.notifications')}>
          {unread > 0 ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
          {unread > 0 ? (
            <span className="absolute -end-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-secondary px-1 text-[10px] font-bold text-brand-primary-dark">
              {unread > 99 ? '99+' : unread}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} dir={i18n.dir()} className="w-[min(92vw,370px)] border-border bg-popover p-2 text-popover-foreground">
        <div className="flex items-center justify-between gap-2 px-2 py-2">
          <p className="font-semibold">{i18n.language.startsWith('ar') ? 'إشعارات الطلبات' : 'Order notifications'}</p>
          {unread > 0 ? (
            <Button size="sm" variant="ghost" className="gap-1 text-xs" onClick={markAllRead}>
              <CheckCheck className="h-3.5 w-3.5" /> تحديد الكل كمقروء
            </Button>
          ) : null}
        </div>
        <DropdownMenuSeparator />

        {setup !== 'ready' || permission !== 'granted' || connection === 'error' ? (
          <div className="space-y-3 rounded-lg bg-muted/50 p-3">
            <p className="text-start text-xs leading-5 text-muted-foreground">{setupMessage}</p>
            {setup === 'ready' && permission !== 'denied' && (
              <Button onClick={(event) => { event.preventDefault(); void enable(); }} disabled={enabling} className="w-full gap-2" size="sm">
                <Bell className="h-4 w-4" /> {enabling ? 'جاري التفعيل...' : 'تفعيل إشعارات الطلبات'}
              </Button>
            )}
          </div>
        ) : (
          <p className="px-2 py-1 text-xs text-emerald-600 dark:text-emerald-400">
            <span className="inline-block size-2 rounded-full bg-current align-middle" /> إشعارات المتصفح مفعّلة
          </p>
        )}

        <div className="mt-2 max-h-[min(52dvh,420px)] space-y-1 overflow-y-auto overscroll-contain">
          {items.length === 0 ? (
            <div className="px-3 py-7 text-center text-sm text-muted-foreground">
              ما في تنبيهات طلبات مستلمة بهالجلسة.
            </div>
          ) : items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`block w-full rounded-lg border p-3 text-start transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${item.read ? 'border-transparent' : 'border-primary/30 bg-primary/5'}`}
              onClick={() => {
                markRead(item.id);
                navigate(item.url);
              }}
            >
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.body}</p>
              <span dir="ltr" className="mt-2 inline-block text-[11px] text-muted-foreground">{formatDateTime(item.receivedAt)}</span>
            </button>
          ))}
        </div>

        {admin && (
          <>
            <DropdownMenuSeparator />
            <Button
              size="sm"
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={() => navigate(ROUTES.notifications)}
            >
              <Settings2 className="h-4 w-4" /> إدارة الإشعارات المرسلة
              <ExternalLink className="ms-auto h-3.5 w-3.5" />
            </Button>
          </>
        )}
        {error && <span className="sr-only">{error}</span>}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
