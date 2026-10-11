import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { SidebarToggleButton } from '@/app/layouts/app-sidebar';
import { RodoBrandLogo } from '@/components/shared';
import {
  ApiEnvironmentSwitcher,
  LanguageSwitcher,
  NotificationsButton,
  ThemeSwitcher,
  UserMenu,
} from '@/components/shared';
import { SUPPORTED_LANGUAGES } from '@/constants/app';
import { isAdminRole } from '@/services/auth/auth-roles';
import { useAuthStore } from '@/store/use-auth-store';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui';
import { useBreadcrumbs } from '@/hooks/use-breadcrumbs';

export function AppHeader(): React.JSX.Element {
  const { t } = useTranslation();
  const breadcrumbs = useBreadcrumbs();
  const user = useAuthStore((state) => state.user);

  return (
    <header className="sticky top-0 z-20 border-b border-brand-border bg-card/95 shadow-[0_3px_20px_-15px_rgba(20,47,125,0.35)] backdrop-blur">
      <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <SidebarToggleButton />
            <RodoBrandLogo compact className="h-8 w-8 lg:hidden" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((item, index) => {
                  const isLast = index === breadcrumbs.length - 1;

                  return (
                    <BreadcrumbItem key={item.key}>
                      {isLast ? (
                        <BreadcrumbPage>{t(item.key)}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link to={item.path}>{t(item.key)}</Link>
                        </BreadcrumbLink>
                      )}
                      {isLast ? null : <BreadcrumbSeparator />}
                    </BreadcrumbItem>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {isAdminRole(user?.roles ?? []) ? <ApiEnvironmentSwitcher compact /> : null}
          <NotificationsButton />
          <ThemeSwitcher />
          {SUPPORTED_LANGUAGES.length > 1 ? <LanguageSwitcher compact /> : null}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
