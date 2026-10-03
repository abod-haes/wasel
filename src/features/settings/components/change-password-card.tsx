import { Eye, EyeOff, KeyRound } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';

import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@/components/ui';
import { authApi } from '@/services/auth/auth-api';

export function ChangePasswordCard(): React.JSX.Element {
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = async (): Promise<void> => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError(t('settings.security.required'));
      return;
    }

    if (newPassword.length < 6) {
      setError(t('settings.security.minLength'));
      return;
    }

    if (newPassword === currentPassword) {
      setError(t('settings.security.mustDiffer'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('settings.security.mismatch'));
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await authApi.changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success(t('settings.security.success'));
    } catch (value) {
      if (isAxiosError(value)) {
        const message = (value.response?.data as { message?: unknown } | undefined)?.message;
        if (typeof message === 'string' && message.trim()) {
          if (message.toLowerCase().includes('current password is incorrect')) {
            setError(t('settings.security.incorrectCurrent'));
          } else if (message.toLowerCase().includes('must differ')) {
            setError(t('settings.security.mustDiffer'));
          } else {
            setError(message);
          }
        } else {
          setError(t('settings.security.failed'));
        }
      } else {
        setError(t('settings.security.failed'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border/60 bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>{t('settings.security.title')}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('settings.security.description')}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-6">
        <div className="grid gap-4 lg:grid-cols-3">
          <PasswordInput
            id="settings-current-password"
            label={t('settings.security.currentPassword')}
            value={currentPassword}
            visible={visible}
            autoComplete="current-password"
            onChange={setCurrentPassword}
          />
          <PasswordInput
            id="settings-new-password"
            label={t('settings.security.newPassword')}
            value={newPassword}
            visible={visible}
            autoComplete="new-password"
            onChange={setNewPassword}
          />
          <PasswordInput
            id="settings-confirm-password"
            label={t('settings.security.confirmPassword')}
            value={confirmPassword}
            visible={visible}
            autoComplete="new-password"
            onChange={setConfirmPassword}
          />
        </div>

        {error ? (
          <p className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button type="button" variant="ghost" onClick={() => setVisible((value) => !value)}>
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {visible ? t('users.form.hidePassword') : t('users.form.showPassword')}
          </Button>

          <Button type="button" onClick={() => void submit()} disabled={isSubmitting}>
            <KeyRound className="h-4 w-4" />
            {isSubmitting ? t('settings.security.saving') : t('settings.security.action')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PasswordInput({
  id,
  label,
  value,
  visible,
  autoComplete,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  visible: boolean;
  autoComplete: string;
  onChange: (value: string) => void;
}): React.JSX.Element {
  return (
    <label htmlFor={id} className="space-y-2">
      <span className="text-sm font-semibold">{label}</span>
      <Input
        id={id}
        type={visible ? 'text' : 'password'}
        value={value}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
