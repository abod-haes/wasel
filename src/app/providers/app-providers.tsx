import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect, type PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { Toaster } from 'sonner';

import { DirectionProvider } from '@/app/providers/direction-provider';
import { API_ENVIRONMENT_STORAGE_KEY } from '@/config/api-environment';
import { ROUTES } from '@/constants/routes';
import { ThemeProvider } from '@/app/providers/theme-provider';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { TooltipProvider } from '@/components/ui';
import { queryClient } from '@/lib/query-client';

export function AppProviders({ children }: PropsWithChildren): React.JSX.Element {
  const { i18n } = useTranslation();
  const direction = i18n.dir();
  const toasterPosition = direction === 'rtl' ? 'top-left' : 'top-right';

  useEffect(() => {
    const onStorage = (event: StorageEvent): void => {
      if (event.key === API_ENVIRONMENT_STORAGE_KEY) {
        // Other open tabs must not keep stale auth state or a production data cache.
        window.location.replace(ROUTES.login);
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <DirectionProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider delayDuration={100}>{children}</TooltipProvider>
            <Toaster richColors dir={direction} position={toasterPosition} />
          </QueryClientProvider>
        </DirectionProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
