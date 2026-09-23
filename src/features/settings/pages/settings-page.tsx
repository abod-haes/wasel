import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ErrorState, LoadingScreen, PageContainer, SectionHeader } from '@/components/shared';
import { Button } from '@/components/ui';
import { SettingsForm } from '@/features/settings/components/settings-form';
import {
  useSettingsQuery,
  useUpdateSettingsMutation,
} from '@/features/settings/hooks/use-settings-query';
import type { WorkspaceSettings } from '@/features/settings/types/settings-types';

export default function SettingsPage(): React.JSX.Element {
  const { t } = useTranslation();
  const settingsQuery = useSettingsQuery();
  const updateSettingsMutation = useUpdateSettingsMutation();

  const [formValues, setFormValues] = useState<WorkspaceSettings | null>(null);

  useEffect(() => {
    if (settingsQuery.data) {
      setFormValues(settingsQuery.data);
    }
  }, [settingsQuery.data]);

  if (settingsQuery.isLoading || !formValues) {
    return <LoadingScreen />;
  }

  if (settingsQuery.isError) {
    return <ErrorState onRetry={() => void settingsQuery.refetch()} />;
  }

  const saveChanges = (): void => {
    updateSettingsMutation.mutate(formValues);
  };

  return (
    <PageContainer>
      <SectionHeader
        titleKey="settings.title"
        descriptionKey="settings.description"
        actions={
          <Button onClick={saveChanges} className="gap-2" disabled={updateSettingsMutation.isPending}>
            <Save className="h-4 w-4" />
            {t('common.save')}
          </Button>
        }
      />

      <SettingsForm values={formValues} onChange={setFormValues} />
    </PageContainer>
  );
}
