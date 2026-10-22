import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { Send } from 'lucide-react';
import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
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
import { usersApi } from '@/features/users/api/users-api';
import { queryKeys } from '@/constants/query-keys';
import { useDebouncedSelectSearch } from '@/features/products/hooks/use-debounced-select-search';
import type { UsersFilter } from '@/features/users/types/user-types';
import type { PaginationParams } from '@/types/api';

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
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [recipientSearch, setRecipientSearch] = useState('');
  const debouncedRecipientSearch = useDebouncedSelectSearch(recipientSearch);

  const debouncedListSearch = useDebouncedValue(filters.search);
  const notificationsQuery = useNotificationsQuery({ ...filters, search: debouncedListSearch }, pagination);
  const usersQuery = useUsersQuery(usersFilters, { page: 1, pageSize: 100 });
  const recipientFilters: UsersFilter = { ...usersFilters, search: debouncedRecipientSearch };
  const recipientPagination = { page: 1, pageSize: 100 };
  const recipientQuery = useQuery({
    queryKey: queryKeys.users.list({ filters: recipientFilters, pagination: recipientPagination }),
    queryFn: ({ signal }) => usersApi.getUsers(recipientFilters, recipientPagination, signal),
    enabled: isDialogOpen,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    refetchOnMount: false,
    retry: 1,
  });
  const sendNotificationMutation = useSendNotificationMutation();

  if (notificationsQuery.isError) {
    return <ErrorState onRetry={() => void notificationsQuery.refetch()} />;
  }

  const sendNotification = (payload: SendNotificationInput): void => {
    sendNotificationMutation.mutate(payload, {
      onSuccess: () => {
        setIsDialogOpen(false);
      },
    });
  };

  return (
    <PageContainer fixedTableLayout>
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
        onChange={(nextFilters) => {
          setFilters(nextFilters);
          setPagination((current) => ({ ...current, page: 1 }));
        }}
        onReset={() => {
          setFilters(defaultFilters);
          setPagination((current) => ({ ...current, page: 1 }));
        }}
      />

      <NotificationsTable
        notifications={notificationsQuery.data?.items ?? []}
        users={usersQuery.data?.items ?? []}
        isLoading={notificationsQuery.isLoading || notificationsQuery.isFetching}
        pagination={notificationsQuery.data}
        onPageChange={(page) => setPagination((current) => ({ ...current, page }))}
        onPageSizeChange={(pageSize) => setPagination({ page: 1, pageSize })}
      />

      <SendNotificationDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setRecipientSearch('');
        }}
        isSubmitting={sendNotificationMutation.isPending}
        users={recipientQuery.data?.items ?? []}
        userSearch={recipientSearch}
        onUserSearchChange={setRecipientSearch}
        isUsersLoading={recipientQuery.isFetching}
        isUsersError={recipientQuery.isError}
        onSubmit={sendNotification}
      />
    </PageContainer>
  );
}
