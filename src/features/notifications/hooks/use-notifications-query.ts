import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { queryKeys } from '@/constants/query-keys';
import { notificationsApi } from '@/features/notifications/api/notifications-api';
import type {
  NotificationsFilter,
  SendNotificationInput,
} from '@/features/notifications/types/notification-types';

export const useNotificationsQuery = (filters: NotificationsFilter) => {
  return useQuery({
    queryKey: queryKeys.notifications.list(filters),
    queryFn: () => notificationsApi.getNotifications(filters),
  });
};

export const useSendNotificationMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (payload: SendNotificationInput) => notificationsApi.pushNotification(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.root });
      toast.success(t('notifications.messages.sent'));
    },
  });
};
