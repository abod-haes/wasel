import { Send } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ErrorState, PageContainer, SectionHeader } from '@/components/shared';
import { Button } from '@/components/ui';
import { NotificationsFilters } from '@/features/notifications/components/notifications-filters';
import { NotificationsTable } from '@/features/notifications/components/notifications-table';
import { SendNotificationDialog } from '@/features/notifications/components/send-notification-dialog';
import {
  useNotificationsQuery,
  useSendNotificationMutation,
} from '@/features/notifications/hooks/use-notifications-query';
import type {
  NotificationsFilter,
  SendNotificationInput,
} from '@/features/notifications/types/notification-types';
import { useUsersQuery } from '@/features/users/hooks/use-users-query';
import type { UsersFilter } from '@/features/users/types/user-types';
import { useUiStore } from '@/store/use-ui-store';

const defaultFilters: NotificationsFilter = {
  search: '',
};

const usersFilters: UsersFilter = {
  search: '',
  role: 'all',
  status: 'all',
};

export default function NotificationsPage(): React.JSX.Element {
  const { t } = useTranslation();

  const [filters, setFilters] = useState<NotificationsFilter>(defaultFilters);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const notificationsQuery = useNotificationsQuery(filters);
  const usersQuery = useUsersQuery(usersFilters);
  const sendNotificationMutation = useSendNotificationMutation();
  const markNotificationsAsRead = useUiStore((state) => state.markNotificationsAsRead);

  if (notificationsQuery.isError) {
    return <ErrorState onRetry={() => void notificationsQuery.refetch()} />;
  }

  const sendNotification = (payload: SendNotificationInput): void => {
    sendNotificationMutation.mutate(payload, {
      onSuccess: () => {
        setIsDialogOpen(false);
        markNotificationsAsRead();
      },
    });
  };

  return (
    <PageContainer>
      <SectionHeader
        titleKey="notifications.title"
        descriptionKey="notifications.description"
        actions={
          <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
            <Send className="h-4 w-4" />
            {t('notifications.send')}
          </Button>
        }
      />

      <NotificationsFilters
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(defaultFilters)}
      />

      <NotificationsTable
        notifications={notificationsQuery.data ?? []}
        users={usersQuery.data ?? []}
        isLoading={notificationsQuery.isLoading || notificationsQuery.isFetching}
      />

      <SendNotificationDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        isSubmitting={sendNotificationMutation.isPending}
        users={usersQuery.data ?? []}
        isUsersLoading={usersQuery.isLoading || usersQuery.isFetching}
        isUsersError={usersQuery.isError}
        onSubmit={sendNotification}
      />
    </PageContainer>
  );
}
