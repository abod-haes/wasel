import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, MapPin, Sparkles } from 'lucide-react';

import { FormField } from '@/components/shared/FormField';
import {
  DEFAULT_COUNTRY_CALLING_CODE,
  PHONE_COUNTRY_CODES,
  normalizeNationalPhoneNumber,
} from '@/constants/phone';
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
  phoneNumber?: string;
  password?: string;
  location?: string;
  latitude?: string;
  longitude?: string;
  roleId?: string;
}

const EMPTY_ROLE_VALUE = 'none';
const getSecureRandomIndex = (max: number): number => {
  const value = new Uint32Array(1);
  crypto.getRandomValues(value);
  return value[0] % max;
};

const generateStrongPassword = (length = 14): string => {
  const characterGroups = [
    'ABCDEFGHJKLMNPQRSTUVWXYZ',
    'abcdefghijkmnopqrstuvwxyz',
    '23456789',
    '!@#$%&*?',
  ];
  const passwordCharacters = characterGroups.map(
    (group) => group[getSecureRandomIndex(group.length)]
  );
  const allCharacters = characterGroups.join('');

  while (passwordCharacters.length < length) {
    passwordCharacters.push(allCharacters[getSecureRandomIndex(allCharacters.length)]);
  }

  for (let index = passwordCharacters.length - 1; index > 0; index -= 1) {
    const swapIndex = getSecureRandomIndex(index + 1);
    [passwordCharacters[index], passwordCharacters[swapIndex]] = [
      passwordCharacters[swapIndex],
      passwordCharacters[index],
    ];
  }

  return passwordCharacters.join('');
};


const buildDefaultFormValues = (roleId = EMPTY_ROLE_VALUE): FormValues => ({
  firstName: '',
  lastName: '',
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
  const [phoneCountryCode, setPhoneCountryCode] = useState(DEFAULT_COUNTRY_CALLING_CODE);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const defaultRoleId = useMemo(() => roleOptions[0]?.id ?? EMPTY_ROLE_VALUE, [roleOptions]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setErrors({});
    setIsPasswordVisible(false);

    if (mode === 'edit' && defaultUser) {
      setPhoneCountryCode(defaultUser.countryCallingCode || DEFAULT_COUNTRY_CALLING_CODE);
      setFormValues({
        firstName: defaultUser.firstName,
        lastName: defaultUser.lastName,
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

    setPhoneCountryCode(DEFAULT_COUNTRY_CALLING_CODE);
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

  const openGoogleMaps = (): void => {
    const latitude = formValues.latitude.trim();
    const longitude = formValues.longitude.trim();
    const hasCoordinates =
      latitude.length > 0 &&
      longitude.length > 0 &&
      Number.isFinite(Number(latitude)) &&
      Number.isFinite(Number(longitude));
    const query = hasCoordinates
      ? `${latitude},${longitude}`
      : formValues.location.trim();
    const mapsUrl = query
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
      : 'https://www.google.com/maps';

    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  };

  const generatePassword = (): void => {
    setFormValues((previous) => ({
      ...previous,
      password: generateStrongPassword(),
    }));
    setIsPasswordVisible(true);
    setErrors((previous) => ({
      ...previous,
      password: undefined,
    }));
  };

  const submitHandler = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const normalizedPassword = formValues.password.trim();
    const normalizedPhoneNumber = normalizeNationalPhoneNumber(formValues.phoneNumber);
    const normalizedLatitude = formValues.latitude.trim();
    const normalizedLongitude = formValues.longitude.trim();
    const parsedLatitude = normalizedLatitude.length > 0 ? Number(normalizedLatitude) : undefined;
    const parsedLongitude = normalizedLongitude.length > 0 ? Number(normalizedLongitude) : undefined;

    const candidatePayload = {
      firstName: formValues.firstName,
      lastName: formValues.lastName,
      countryCallingCode: phoneCountryCode,
      phoneNumber: normalizedPhoneNumber,
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
        phoneNumber: fieldErrors.phoneNumber?.[0],
        password: fieldErrors.password?.[0],
        location: fieldErrors.location?.[0],
        latitude: fieldErrors.latitude?.[0],
        longitude: fieldErrors.longitude?.[0],
        roleId: fieldErrors.roleIds?.[0],
      });
      return;
    }

    const selectedRole = roleOptions.find((role) => role.id === formValues.roleId);
    const isMarketRole = selectedRole?.key === 'market' || selectedRole?.name.toLowerCase() === 'market';

    if (isMarketRole) {
      const marketErrors: FormErrors = {};

      if (!formValues.location.trim()) {
        marketErrors.location = 'موقع السوق مطلوب.';
      }
      if (parsedLatitude == null || !Number.isFinite(parsedLatitude)) {
        marketErrors.latitude = 'خط العرض مطلوب للسوق.';
      }
      if (parsedLongitude == null || !Number.isFinite(parsedLongitude)) {
        marketErrors.longitude = 'خط الطول مطلوب للسوق.';
      }

      if (Object.keys(marketErrors).length > 0) {
        setErrors(marketErrors);
        return;
      }
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
            <FormField
              labelKey="users.form.phoneNumber"
              htmlFor="user-phone-number"
              required
              error={errors.phoneNumber}
            >
              <div className="flex gap-2" dir="ltr">
                <Select
                  value={phoneCountryCode}
                  onValueChange={setPhoneCountryCode}
                >
                  <SelectTrigger
                    className="w-[118px] shrink-0 rounded-2xl"
                    aria-label={t('users.form.phoneCountryCode')}
                  >
                    <SelectValue placeholder={t('users.form.countryCodePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {PHONE_COUNTRY_CODES.map((country) => (
                      <SelectItem key={country.value} value={country.value}>
                        {country.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  id="user-phone-number"
                  type="text"
                  inputMode="numeric"
                  dir="ltr"
                  className="min-w-0 text-left"
                  value={formValues.phoneNumber}
                  placeholder={t('users.form.phoneNumberPlaceholder')}
                  onChange={(event) =>
                    setFormValues((previous) => ({
                      ...previous,
                      phoneNumber: event.target.value.replace(/\D/g, ''),
                    }))
                  }
                />
              </div>
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
              <div className="flex gap-2">
                <div className="relative min-w-0 flex-1">
                  <Input
                    id="user-password"
                    type={isPasswordVisible ? 'text' : 'password'}
                    className="pe-11"
                    value={formValues.password}
                    placeholder={t('users.form.passwordPlaceholder')}
                    onChange={(event) =>
                      setFormValues((previous) => ({
                        ...previous,
                        password: event.target.value,
                      }))
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute end-0 top-0 h-11 w-11 rounded-2xl"
                    onClick={() => setIsPasswordVisible((visible) => !visible)}
                    aria-label={
                      isPasswordVisible
                        ? t('users.form.hidePassword')
                        : t('users.form.showPassword')
                    }
                    title={
                      isPasswordVisible
                        ? t('users.form.hidePassword')
                        : t('users.form.showPassword')
                    }
                  >
                    {isPasswordVisible ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="h-11 shrink-0 px-3"
                  onClick={generatePassword}
                  title={t('users.form.generatePassword')}
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{t('users.form.generatePassword')}</span>
                </Button>
              </div>
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

          {roleOptions.find((role) => role.id === formValues.roleId)?.key === 'market' ? (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm text-muted-foreground">
              حساب Market يحتاج موقعًا واضحًا وخط عرض وخط طول لأن هذه الإحداثيات تُستخدم في مسار الاستلام والتوصيل.
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-3">
            <FormField labelKey="users.form.location" htmlFor="user-location" error={errors.location}>
              <div className="flex gap-2">
                <Input
                  id="user-location"
                  className="min-w-0"
                  value={formValues.location}
                  placeholder={t('users.form.locationPlaceholder')}
                  onChange={(event) =>
                    setFormValues((previous) => ({
                      ...previous,
                      location: event.target.value,
                    }))
                  }
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  onClick={openGoogleMaps}
                  aria-label={t('users.form.openGoogleMaps')}
                  title={t('users.form.openGoogleMaps')}
                >
                  <MapPin className="h-4 w-4" />
                </Button>
              </div>
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
