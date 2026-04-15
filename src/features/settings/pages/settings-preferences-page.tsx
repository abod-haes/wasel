import { useTranslation } from 'react-i18next';

import {
  ErrorState,
  LanguageSwitcher,
  LoadingScreen,
  PageContainer,
  SectionHeader,
  ThemeSwitcher,
} from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle, Switch } from '@/components/ui';
import { SUPPORTED_LANGUAGES } from '@/constants/app';
import {
  useSettingsQuery,
  useUpdateSettingsMutation,
} from '@/features/settings/hooks/use-settings-query';

export default function SettingsPreferencesPage(): React.JSX.Element {
  const { t, i18n } = useTranslation();
  const settingsQuery = useSettingsQuery();
  const updateSettingsMutation = useUpdateSettingsMutation();

  if (settingsQuery.isLoading) {
    return <LoadingScreen />;
  }

  if (settingsQuery.isError || !settingsQuery.data) {
    return <ErrorState onRetry={() => void settingsQuery.refetch()} />;
  }

  return (
    <PageContainer>
      <SectionHeader titleKey="settings.preferencesTitle" descriptionKey="settings.preferencesDescription" />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('theme.label')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ThemeSwitcher />
          </CardContent>
        </Card>

        {SUPPORTED_LANGUAGES.length > 1 ? (
          <Card>
            <CardHeader>
              <CardTitle>{t('language.label')}</CardTitle>
            </CardHeader>
            <CardContent>
              <LanguageSwitcher />
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>{t('settings.form.compactSidebar')}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{t('settings.form.compactSidebar')}</p>
            <Switch
              checked={settingsQuery.data.compactSidebar}
              onCheckedChange={(checked) =>
                updateSettingsMutation.mutate({
                  compactSidebar: checked,
                })
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('settings.form.emailNotifications')}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{t('settings.form.emailNotifications')}</p>
            <Switch
              checked={settingsQuery.data.emailNotifications}
              onCheckedChange={(checked) =>
                updateSettingsMutation.mutate({
                  emailNotifications: checked,
                  language: i18n.language === 'ar' ? 'ar' : 'en',
                })
              }
            />
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
