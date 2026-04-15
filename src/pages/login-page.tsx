import { useState, type FormEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router-dom';

import { FormField } from '@/components/shared';
import { ROUTES } from '@/constants/routes';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from '@/components/ui';
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
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('auth.loginTitle')}</CardTitle>
          <CardDescription>{t('auth.loginDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={submitLogin}>
            <FormField
              labelKey="auth.phoneNumberLabel"
              htmlFor="phone-number"
              error={errors.phoneNumber}
              required
            >
              <Input
                id="phone-number"
                type="tel"
                value={credentials.phoneNumber}
                autoComplete="tel"
                onChange={(event) => setFieldValue('phoneNumber', event.target.value)}
                placeholder={t('auth.phoneNumberPlaceholder')}
              />
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
                  className="absolute end-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  aria-label={isPasswordVisible ? t('auth.hidePassword') : t('auth.showPassword')}
                  aria-pressed={isPasswordVisible}
                  onClick={() => setIsPasswordVisible((current) => !current)}
                >
                  {isPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </FormField>

            {errors.submit ? <p className="text-sm text-destructive">{errors.submit}</p> : null}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? t('auth.loggingIn') : t('auth.loginAction')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
