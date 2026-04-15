import { Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { useUiStore } from '@/store/use-ui-store';

export function NotificationsButton(): React.JSX.Element {
  const { t } = useTranslation();
  const unreadCount = useUiStore((state) => state.unreadNotificationsCount);
  const markNotificationsAsRead = useUiStore((state) => state.markNotificationsAsRead);

  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      className="relative"
      aria-label={t('layout.notifications')}
    >
      <Link to={ROUTES.notifications} onClick={markNotificationsAsRead}>
        <Bell className="h-4 w-4" />
        {unreadCount > 0 ? (
          <span className="absolute -end-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
            {unreadCount}
          </span>
        ) : null}
      </Link>
    </Button>
  );
}
