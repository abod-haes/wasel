import { Eye, EyeOff, KeyRound, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
} from '@/components/ui';
import type { User } from '@/features/users/types/user-types';

interface ResetUserPasswordDialogProps {
  open: boolean;
  user: User | null;
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (newPassword: string) => void;
}

const getSecureRandomIndex = (max: number): number => {
  const value = new Uint32Array(1);
  crypto.getRandomValues(value);
  return value[0] % max;
};

const generateStrongPassword = (length = 14): string => {
  const groups = [
    'ABCDEFGHJKLMNPQRSTUVWXYZ',
    'abcdefghijkmnopqrstuvwxyz',
    '23456789',
    '!@#$%&*?',
  ];
  const result = groups.map((group) => group[getSecureRandomIndex(group.length)]);
  const all = groups.join('');

  while (result.length < length) {
    result.push(all[getSecureRandomIndex(all.length)]);
  }

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = getSecureRandomIndex(index + 1);
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }

  return result.join('');
};

export function ResetUserPasswordDialog({
  open,
  user,
  isSubmitting = false,
  onOpenChange,
  onSubmit,
}: ResetUserPasswordDialogProps): React.JSX.Element {
  const { t } = useTranslation();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setNewPassword('');
    setConfirmPassword('');
    setVisible(false);
    setError('');
  }, [open, user?.id]);

  const submit = (): void => {
    if (newPassword.length < 6) {
      setError(t('users.resetPassword.minLength'));
      return;
    }

    if (newPassword.length > 256) {
      setError(t('users.resetPassword.maxLength'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('users.resetPassword.mismatch'));
      return;
    }

    setError('');
    onSubmit(newPassword);
  };

  const generate = (): void => {
    const password = generateStrongPassword();
    setNewPassword(password);
    setConfirmPassword(password);
    setVisible(true);
    setError('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <KeyRound className="h-5 w-5" />
          </div>
          <DialogTitle>{t('users.resetPassword.title', { name: user?.name ?? '' })}</DialogTitle>
          <DialogDescription>{t('users.resetPassword.description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="admin-new-password" className="text-sm font-semibold">
              {t('users.resetPassword.newPassword')}
            </label>
            <div className="flex gap-2">
              <div className="relative min-w-0 flex-1">
                <Input
                  id="admin-new-password"
                  type={visible ? 'text' : 'password'}
                  value={newPassword}
                  maxLength={256}
                  className="pe-11"
                  autoComplete="new-password"
                  onChange={(event) => {
                    setNewPassword(event.target.value);
                    setError('');
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute end-0 top-0 h-11 w-11"
                  onClick={() => setVisible((value) => !value)}
                  aria-label={visible ? t('users.form.hidePassword') : t('users.form.showPassword')}
                >
                  {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Button type="button" variant="outline" className="shrink-0" onClick={generate}>
                <Sparkles className="h-4 w-4" />
                {t('users.form.generatePassword')}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="admin-confirm-password" className="text-sm font-semibold">
              {t('users.resetPassword.confirmPassword')}
            </label>
            <Input
              id="admin-confirm-password"
              type={visible ? 'text' : 'password'}
              value={confirmPassword}
              maxLength={256}
              autoComplete="new-password"
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                setError('');
              }}
            />
          </div>

          {error ? (
            <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            {t('common.cancel')}
          </Button>
          <Button type="button" onClick={submit} disabled={isSubmitting || !user}>
            {t('users.actions.resetPassword')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
