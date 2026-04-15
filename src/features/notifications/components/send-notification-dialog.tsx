import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FormField } from '@/components/shared';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Textarea,
} from '@/components/ui';
import { NotificationUsersMultiSelect } from '@/features/notifications/components/notification-users-multi-select';
import type { SendNotificationInput } from '@/features/notifications/types/notification-types';
import type { User } from '@/features/users/types/user-types';

interface SendNotificationDialogProps {
  open: boolean;
  isSubmitting?: boolean;
  users: User[];
  isUsersLoading?: boolean;
  isUsersError?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: SendNotificationInput) => void;
}

interface FormValues {
  title: string;
  body: string;
  imageUrl: string;
  userIds: string[];
}

const defaultValues: FormValues = {
  title: '',
  body: '',
  imageUrl: '',
  userIds: [],
};

export function SendNotificationDialog({
  open,
  isSubmitting = false,
  users,
  isUsersLoading = false,
  isUsersError = false,
  onOpenChange,
  onSubmit,
}: SendNotificationDialogProps): React.JSX.Element {
  const { t } = useTranslation();

  const [values, setValues] = useState<FormValues>(defaultValues);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});

  useEffect(() => {
    if (!open) {
      return;
    }

    setValues(defaultValues);
    setErrors({});
  }, [open]);

  const submitForm = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const nextErrors: Partial<Record<keyof FormValues, string>> = {};

    if (!values.title.trim()) {
      nextErrors.title = t('notifications.form.errors.titleRequired');
    }

    if (!values.body.trim()) {
      nextErrors.body = t('notifications.form.errors.bodyRequired');
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSubmit({
      title: values.title.trim(),
      body: values.body.trim(),
      imageUrl: values.imageUrl.trim() || undefined,
      userIds: values.userIds.length > 0 ? values.userIds : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('notifications.send')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={submitForm} className="space-y-4">
          <FormField labelKey="notifications.form.title" required error={errors.title}>
            <Input
              value={values.title}
              onChange={(event) =>
                setValues((previous) => ({
                  ...previous,
                  title: event.target.value,
                }))
              }
              placeholder={t('notifications.form.titlePlaceholder')}
            />
          </FormField>

          <FormField labelKey="notifications.form.body" required error={errors.body}>
            <Textarea
              value={values.body}
              onChange={(event) =>
                setValues((previous) => ({
                  ...previous,
                  body: event.target.value,
                }))
              }
              placeholder={t('notifications.form.bodyPlaceholder')}
              rows={3}
            />
          </FormField>

          <FormField labelKey="notifications.form.imageUrl" error={errors.imageUrl}>
            <Input
              value={values.imageUrl}
              onChange={(event) =>
                setValues((previous) => ({
                  ...previous,
                  imageUrl: event.target.value,
                }))
              }
              placeholder="https://example.com/image.jpg"
            />
          </FormField>

          <FormField labelKey="notifications.form.userIds">
            <NotificationUsersMultiSelect
              users={users}
              selectedUserIds={values.userIds}
              isLoading={isUsersLoading}
              isError={isUsersError}
              disabled={isSubmitting}
              onChange={(userIds) =>
                setValues((previous) => ({
                  ...previous,
                  userIds,
                }))
              }
            />
          </FormField>

          <DialogFooter className="gap-2">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {t('notifications.send')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
