import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { SidebarToggleButton } from '@/app/layouts/app-sidebar';
import {
  LanguageSwitcher,
  NotificationsButton,
  ThemeSwitcher,
  UserMenu,
} from '@/components/shared';
import { SUPPORTED_LANGUAGES } from '@/constants/app';
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

  return (
    <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
      <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <SidebarToggleButton />
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
          <NotificationsButton />
          <ThemeSwitcher />
          {SUPPORTED_LANGUAGES.length > 1 ? <LanguageSwitcher compact /> : null}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
