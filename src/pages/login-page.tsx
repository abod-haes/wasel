import { useState, type FormEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router-dom';

import { FormField, WaselBrandLogo } from '@/components/shared';
import { DEFAULT_COUNTRY_CALLING_CODE, PHONE_COUNTRY_CODES } from '@/constants/phone';
import { ROUTES } from '@/constants/routes';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { getErrorMessage } from '@/services/api/api-error';
import { useAuthStore } from '@/store/use-auth-store';
import type { LoginPayload } from '@/types/auth';

interface LoginFormErrors {
  phoneNumber: string;
  password: string;
  submit: string;
}

const emptyErrors: LoginFormErrors = {
  phoneNumber: '',
  password: '',
  submit: '',
};

export default function LoginPage(): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const login = useAuthStore((state) => state.login);
  const [credentials, setCredentials] = useState<LoginPayload>({
    countryCallingCode: DEFAULT_COUNTRY_CALLING_CODE,
    phoneNumber: '',
    password: '',
  });
  const [errors, setErrors] = useState<LoginFormErrors>(emptyErrors);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={ROUTES.dashboard} replace />;
  }

  const validateForm = (): boolean => {
    const nextErrors: LoginFormErrors = {
      ...emptyErrors,
    };

    if (credentials.phoneNumber.trim().length === 0) {
      nextErrors.phoneNumber = t('auth.errors.phoneNumberRequired');
    }

    if (credentials.password.trim().length === 0) {
      nextErrors.password = t('auth.errors.passwordRequired');
    }

    setErrors(nextErrors);
    return !nextErrors.phoneNumber && !nextErrors.password;
  };

  const setFieldValue = (field: keyof LoginPayload, value: string): void => {
    setCredentials((current) => ({
      ...current,
      [field]: value,
    }));
    setErrors((current) => ({
      ...current,
      [field]: '',
      submit: '',
    }));
  };

  const submitLogin = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await login(credentials);
      navigate(ROUTES.dashboard, { replace: true });
    } catch (error) {
      setErrors((current) => ({
        ...current,
        submit: getErrorMessage(error),
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-surface p-4 dark:bg-background">
      <div className="pointer-events-none absolute -start-24 -top-24 h-72 w-72 rounded-full bg-brand-green/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -end-20 h-72 w-72 rounded-full bg-brand-red/10 blur-3xl" />

      <Card className="relative w-full max-w-md overflow-hidden rounded-wasel-lg border-brand-border/90 bg-card/95 shadow-floating dark:border-border">
        <div className="h-1.5 w-full bg-gradient-to-l from-brand-green via-brand-green to-brand-red" />
        <CardHeader className="items-center px-7 pb-3 pt-7 text-center">
          <WaselBrandLogo className="mb-2 h-16 w-48" />
          <CardTitle className="text-2xl">{t('auth.loginTitle')}</CardTitle>
          <CardDescription className="max-w-sm">{t('auth.loginDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="px-7 pb-7">
          <form className="space-y-4" onSubmit={submitLogin}>
            <FormField
              labelKey="auth.phoneNumberLabel"
              htmlFor="phone-number"
              error={errors.phoneNumber}
              required
            >
              <div className="flex gap-2" dir="ltr">
                <Select
                  value={credentials.countryCallingCode}
                  onValueChange={(value) => setFieldValue('countryCallingCode', value)}
                >
                  <SelectTrigger
                    className="w-[118px] shrink-0 rounded-2xl"
                    aria-label={t('auth.countryCallingCodeLabel')}
                  >
                    <SelectValue />
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
                  id="phone-number"
                  type="text"
                  inputMode="numeric"
                  dir="ltr"
                  className="min-w-0 text-left"
                  value={credentials.phoneNumber}
                  autoComplete="tel-national"
                  onChange={(event) =>
                    setFieldValue('phoneNumber', event.target.value.replace(/\D/g, ''))
                  }
                  placeholder={t('auth.phoneNumberPlaceholder')}
                />
              </div>
            </FormField>

            <FormField labelKey="auth.passwordLabel" htmlFor="password" error={errors.password} required>
              <div className="relative">
                <Input
                  id="password"
                  type={isPasswordVisible ? 'text' : 'password'}
                  value={credentials.password}
                  autoComplete="current-password"
                  onChange={(event) => setFieldValue('password', event.target.value)}
                  placeholder={t('auth.passwordPlaceholder')}
                  className="pe-11"
                />

                <button
                  type="button"
                  className="absolute end-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  aria-label={isPasswordVisible ? t('auth.hidePassword') : t('auth.showPassword')}
                  aria-pressed={isPasswordVisible}
                  onClick={() => setIsPasswordVisible((current) => !current)}
                >
                  {isPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </FormField>

            {errors.submit ? (
              <p className="rounded-xl bg-brand-red-soft px-3 py-2 text-sm text-brand-red-dark dark:bg-destructive/10 dark:text-destructive">
                {errors.submit}
              </p>
            ) : null}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? t('auth.loggingIn') : t('auth.loginAction')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
