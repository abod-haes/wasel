import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { queryKeys } from '@/constants/query-keys';
import { settingsApi } from '@/features/settings/api/settings-api';
import type { UpdateWorkspaceSettingsInput } from '@/features/settings/types/settings-types';

export const useSettingsQuery = () => {
  return useQuery({
    queryKey: queryKeys.settings.profile(),
    queryFn: () => settingsApi.getSettings(),
  });
};

export const useUpdateSettingsMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (payload: UpdateWorkspaceSettingsInput) => settingsApi.updateSettings(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings.root });
      toast.success(t('settings.messages.saved'));
    },
  });
};
