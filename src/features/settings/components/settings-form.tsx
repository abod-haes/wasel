import { useTranslation } from 'react-i18next';

import { FormField } from '@/components/shared';
import { Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch } from '@/components/ui';
import type { WorkspaceSettings } from '@/features/settings/types/settings-types';

interface SettingsFormProps {
  values: WorkspaceSettings;
  onChange: (nextValues: WorkspaceSettings) => void;
}

export function SettingsForm({ values, onChange }: SettingsFormProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <div className="grid gap-4 rounded-xl border bg-card p-5 md:grid-cols-2">
      <FormField labelKey="settings.form.displayName" htmlFor="settings-display-name" required>
        <Input
          id="settings-display-name"
          value={values.displayName}
          onChange={(event) =>
            onChange({
              ...values,
              displayName: event.target.value,
            })
          }
        />
      </FormField>

      <FormField labelKey="settings.form.email" htmlFor="settings-email" required>
        <Input
          id="settings-email"
          type="email"
          value={values.email}
          onChange={(event) =>
            onChange({
              ...values,
              email: event.target.value,
            })
          }
        />
      </FormField>

      <FormField labelKey="language.label">
        <Select
          value={values.language}
          onValueChange={(value) =>
            onChange({
              ...values,
              language: value as WorkspaceSettings['language'],
            })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">{t('language.english')}</SelectItem>
            <SelectItem value="ar">{t('language.arabic')}</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      <div className="space-y-4 rounded-lg border p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium">{t('settings.form.compactSidebar')}</p>
          <Switch
            checked={values.compactSidebar}
            onCheckedChange={(checked) =>
              onChange({
                ...values,
                compactSidebar: checked,
              })
            }
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium">{t('settings.form.emailNotifications')}</p>
          <Switch
            checked={values.emailNotifications}
            onCheckedChange={(checked) =>
              onChange({
                ...values,
                emailNotifications: checked,
              })
            }
          />
        </div>
      </div>
    </div>
  );
}
