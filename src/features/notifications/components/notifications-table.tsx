import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { DataTable } from '@/components/shared';
import { Badge, Button } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import type { AppNotification } from '@/features/notifications/types/notification-types';
import type { User } from '@/features/users/types/user-types';
import type { PaginatedData } from '@/types/api';

interface NotificationsTableProps {
  notifications: AppNotification[];
  users?: User[];
  isLoading?: boolean;
  pagination?: Pick<PaginatedData<AppNotification>, 'page' | 'pageSize' | 'totalCount' | 'totalPages'>;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export function NotificationsTable({
  notifications,
  users = [],
  isLoading = false,
  pagination,
  onPageChange,
  onPageSizeChange,
}: NotificationsTableProps): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const usersById = useMemo(() => new Map(users.map((user) => [user.id, user])), [users]);

  const columns = useMemo(
    () => [
      {
        key: 'title',
        header: t('notifications.table.title'),
        renderCell: (notification: AppNotification) => (
          <div>
            <p className="font-medium">{notification.title}</p>
            <p className="text-xs text-muted-foreground">{notification.body}</p>
          </div>
        ),
      },
      {
        key: 'target',
        header: t('notifications.table.target'),
        renderCell: (notification: AppNotification) => {
          if (notification.isBroadcast) {
            return <Badge variant="secondary">{t('notifications.broadcast')}</Badge>;
          }

          const targetNames = notification.targetUserIds.map((userId) => {
            return usersById.get(userId)?.name ?? userId;
          });
          const visibleTargets = targetNames.slice(0, 2);
          const hiddenTargetsCount = targetNames.length - visibleTargets.length;

          return (
            <div className="flex flex-wrap gap-1.5">
              {visibleTargets.map((targetName) => (
                <Badge key={targetName} variant="outline" className="rounded-lg">
                  {targetName}
                </Badge>
              ))}
              {hiddenTargetsCount > 0 ? (
                <Badge variant="secondary" className="rounded-lg">
                  {t('notifications.moreUsers', { count: hiddenTargetsCount })}
                </Badge>
              ) : null}
              {targetNames.length === 0 ? (
                <Badge variant="outline" className="rounded-lg">
                  {t('notifications.usersCount', { count: 0 })}
                </Badge>
              ) : null}
            </div>
          );
        },
      },
      {
        key: 'createdAt',
        header: t('notifications.table.createdAt'),
        renderCell: (notification: AppNotification) => (
          <span className="text-sm text-muted-foreground">
            {new Date(notification.createdAt).toLocaleString()}
          </span>
        ),
      },
      {
        key: 'data',
        header: t('notifications.table.data'),
        renderCell: (notification: AppNotification) => {
          if (!notification.data) {
            return <span className="text-xs text-muted-foreground">-</span>;
          }

          if (
            notification.data.type === 'delivery.cash-limit.reached' &&
            notification.data.deliveryPersonId
          ) {
            return (
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  navigate(
                    `${ROUTES.deliveryFinance}?deliveryPersonId=${encodeURIComponent(
                      notification.data?.deliveryPersonId ?? '',
                    )}`,
                  )
                }
              >
                {t('deliveryFinance.openFinance')}
              </Button>
            );
          }

          return (
            <span className="text-xs text-muted-foreground">
              {Object.entries(notification.data)
                .slice(0, 2)
                .map(([key, value]) => `${key}: ${value}`)
                .join(' | ')}
            </span>
          );
        },
      },
    ],
    [navigate, t, usersById]
  );

  return (
    <DataTable
      data={notifications}
      columns={columns}
      getRowKey={(notification) => notification.id}
      isLoading={isLoading}
      emptyTitleKey="notifications.empty.title"
      emptyDescriptionKey="notifications.empty.description"
      pagination={pagination}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
    />
  );
}
