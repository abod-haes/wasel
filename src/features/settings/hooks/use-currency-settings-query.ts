import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { queryKeys } from '@/constants/query-keys';
import { currencySettingsApi } from '@/features/settings/api/currency-settings-api';
import type { UpdateCurrencySettingsInput } from '@/features/settings/types/settings-types';

export const useCurrencySettingsQuery = () => {
  return useQuery({
    queryKey: queryKeys.settings.currency(),
    queryFn: () => currencySettingsApi.getCurrencySettings(),
  });
};

export const useUpdateCurrencySettingsMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (payload: UpdateCurrencySettingsInput) =>
      currencySettingsApi.updateCurrencySettings(payload),
    onSuccess: (settings) => {
      queryClient.setQueryData(queryKeys.settings.currency(), settings);
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.root });
      toast.success(t('settings.messages.saved'));
    },
  });
};
