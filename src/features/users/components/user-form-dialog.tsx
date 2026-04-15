import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FormField } from '@/components/shared/FormField';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from '@/components/ui';
import {
  createUserSchema,
  updateUserPayloadSchema,
} from '@/features/users/schemas/user-form-schema';
import type {
  User,
  UserFormInput,
  UserRoleAssignment,
} from '@/features/users/types/user-types';

interface UserFormDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  defaultUser?: User;
  roleOptions: UserRoleAssignment[];
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: UserFormInput) => void;
}

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  location: string;
  latitude: string;
  longitude: string;
  phoneNumberVerified: boolean;
  roleId: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  location?: string;
  latitude?: string;
  longitude?: string;
  roleId?: string;
}

const EMPTY_ROLE_VALUE = 'none';

const buildDefaultFormValues = (roleId = EMPTY_ROLE_VALUE): FormValues => ({
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  password: '',
  location: '',
  latitude: '',
  longitude: '',
  phoneNumberVerified: false,
  roleId,
});

const getRoleLabel = (
  t: (key: string, options?: Record<string, unknown>) => string,
  role: UserRoleAssignment
): string => {
  const roleKey = `users.role.${role.key}`;
  const translatedRole = t(roleKey);
  return translatedRole === roleKey ? role.name : translatedRole;
};

export function UserFormDialog({
  open,
  mode,
  defaultUser,
  roleOptions,
  isSubmitting = false,
  onOpenChange,
  onSubmit,
}: UserFormDialogProps): React.JSX.Element {
  const { t } = useTranslation();

  const [formValues, setFormValues] = useState<FormValues>(buildDefaultFormValues());
  const [errors, setErrors] = useState<FormErrors>({});

  const defaultRoleId = useMemo(() => roleOptions[0]?.id ?? EMPTY_ROLE_VALUE, [roleOptions]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setErrors({});

    if (mode === 'edit' && defaultUser) {
      setFormValues({
        firstName: defaultUser.firstName,
        lastName: defaultUser.lastName,
        email: defaultUser.email,
        phoneNumber: defaultUser.phoneNumber,
        password: '',
        location: defaultUser.location ?? '',
        latitude: defaultUser.latitude != null ? String(defaultUser.latitude) : '',
        longitude: defaultUser.longitude != null ? String(defaultUser.longitude) : '',
        phoneNumberVerified: defaultUser.phoneNumberVerified,
        roleId: defaultUser.roles[0]?.id ?? defaultRoleId,
      });
      return;
    }

    setFormValues(buildDefaultFormValues(defaultRoleId));
  }, [defaultRoleId, defaultUser, mode, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setFormValues((previous) => {
      if (previous.roleId === EMPTY_ROLE_VALUE || roleOptions.some((role) => role.id === previous.roleId)) {
        return previous;
      }

      return {
        ...previous,
        roleId: defaultRoleId,
      };
    });
  }, [defaultRoleId, open, roleOptions]);

  const dialogTitleKey = useMemo(() => {
    return mode === 'create' ? 'users.createUser' : 'users.editUser';
  }, [mode]);

  const submitHandler = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const normalizedPassword = formValues.password.trim();
    const normalizedLatitude = formValues.latitude.trim();
    const normalizedLongitude = formValues.longitude.trim();
    const parsedLatitude = normalizedLatitude.length > 0 ? Number(normalizedLatitude) : undefined;
    const parsedLongitude = normalizedLongitude.length > 0 ? Number(normalizedLongitude) : undefined;

    const candidatePayload = {
      firstName: formValues.firstName,
      lastName: formValues.lastName,
      email: formValues.email,
      phoneNumber: formValues.phoneNumber,
      password: normalizedPassword || undefined,
      location: formValues.location,
      latitude: parsedLatitude,
      longitude: parsedLongitude,
      phoneNumberVerified: formValues.phoneNumberVerified,
      roleIds: formValues.roleId === EMPTY_ROLE_VALUE ? [] : [formValues.roleId],
    };

    const parsed =
      mode === 'create'
        ? createUserSchema.safeParse({
            ...candidatePayload,
            password: normalizedPassword,
          })
        : updateUserPayloadSchema.safeParse(candidatePayload);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;

      setErrors({
        firstName: fieldErrors.firstName?.[0],
        lastName: fieldErrors.lastName?.[0],
        email: fieldErrors.email?.[0],
        phoneNumber: fieldErrors.phoneNumber?.[0],
        password: fieldErrors.password?.[0],
        location: fieldErrors.location?.[0],
        latitude: fieldErrors.latitude?.[0],
        longitude: fieldErrors.longitude?.[0],
        roleId: fieldErrors.roleIds?.[0],
      });
      return;
    }

    setErrors({});
    onSubmit(parsed.data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t(dialogTitleKey)}</DialogTitle>
        </DialogHeader>

        <form onSubmit={submitHandler} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              labelKey="users.form.firstName"
              htmlFor="user-first-name"
              required
              error={errors.firstName}
            >
              <Input
                id="user-first-name"
                value={formValues.firstName}
                placeholder={t('users.form.firstNamePlaceholder')}
                onChange={(event) =>
                  setFormValues((previous) => ({
                    ...previous,
                    firstName: event.target.value,
                  }))
                }
              />
            </FormField>

            <FormField
              labelKey="users.form.lastName"
              htmlFor="user-last-name"
              required
              error={errors.lastName}
            >
              <Input
                id="user-last-name"
                value={formValues.lastName}
                placeholder={t('users.form.lastNamePlaceholder')}
                onChange={(event) =>
                  setFormValues((previous) => ({
                    ...previous,
                    lastName: event.target.value,
                  }))
                }
              />
            </FormField>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField labelKey="common.email" htmlFor="user-email" required error={errors.email}>
              <Input
                id="user-email"
                type="email"
                value={formValues.email}
                placeholder={t('users.form.emailPlaceholder')}
                onChange={(event) =>
                  setFormValues((previous) => ({
                    ...previous,
                    email: event.target.value,
                  }))
                }
              />
            </FormField>

            <FormField
              labelKey="users.form.phoneNumber"
              htmlFor="user-phone-number"
              required
              error={errors.phoneNumber}
            >
              <Input
                id="user-phone-number"
                value={formValues.phoneNumber}
                placeholder={t('users.form.phoneNumberPlaceholder')}
                onChange={(event) =>
                  setFormValues((previous) => ({
                    ...previous,
                    phoneNumber: event.target.value,
                  }))
                }
              />
            </FormField>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              labelKey="users.form.password"
              htmlFor="user-password"
              required={mode === 'create'}
              descriptionKey={mode === 'edit' ? 'users.form.passwordEditHint' : undefined}
              error={errors.password}
            >
              <Input
                id="user-password"
                type="password"
                value={formValues.password}
                placeholder={t('users.form.passwordPlaceholder')}
                onChange={(event) =>
                  setFormValues((previous) => ({
                    ...previous,
                    password: event.target.value,
                  }))
                }
              />
            </FormField>

            <FormField labelKey="common.role" error={errors.roleId}>
              <Select
                value={formValues.roleId}
                onValueChange={(value) =>
                  setFormValues((previous) => ({
                    ...previous,
                    roleId: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('users.form.rolePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EMPTY_ROLE_VALUE}>{t('users.form.noRole')}</SelectItem>
                  {roleOptions.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {getRoleLabel(t, role)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <FormField labelKey="users.form.location" htmlFor="user-location" error={errors.location}>
              <Input
                id="user-location"
                value={formValues.location}
                placeholder={t('users.form.locationPlaceholder')}
                onChange={(event) =>
                  setFormValues((previous) => ({
                    ...previous,
                    location: event.target.value,
                  }))
                }
              />
            </FormField>

            <FormField labelKey="users.form.latitude" htmlFor="user-latitude" error={errors.latitude}>
              <Input
                id="user-latitude"
                type="number"
                step="0.000001"
                value={formValues.latitude}
                placeholder={t('users.form.latitudePlaceholder')}
                onChange={(event) =>
                  setFormValues((previous) => ({
                    ...previous,
                    latitude: event.target.value,
                  }))
                }
              />
            </FormField>

            <FormField labelKey="users.form.longitude" htmlFor="user-longitude" error={errors.longitude}>
              <Input
                id="user-longitude"
                type="number"
                step="0.000001"
                value={formValues.longitude}
                placeholder={t('users.form.longitudePlaceholder')}
                onChange={(event) =>
                  setFormValues((previous) => ({
                    ...previous,
                    longitude: event.target.value,
                  }))
                }
              />
            </FormField>
          </div>

          <div className="flex items-center justify-between rounded-lg border px-3 py-2">
            <p className="text-sm font-medium">{t('users.form.phoneNumberVerified')}</p>
            <Switch
              checked={formValues.phoneNumberVerified}
              onCheckedChange={(checked) =>
                setFormValues((previous) => ({
                  ...previous,
                  phoneNumberVerified: checked,
                }))
              }
            />
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {mode === 'create' ? t('common.create') : t('common.update')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
