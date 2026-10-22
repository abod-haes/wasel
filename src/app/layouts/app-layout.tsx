import { Outlet, useLocation } from 'react-router-dom';

import { AppHeader } from '@/app/layouts/app-header';
import { DesktopSidebar, MobileSidebar } from '@/app/layouts/app-sidebar';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/store/use-ui-store';

// Only actual tabular list pages use the viewport-locked workspace.
// Forms, dashboards, finance account details and long reports retain normal page scrolling.
const fixedTableRoutes = new Set<string>([
  ROUTES.products,
  ROUTES.orders,
  ROUTES.users,
  ROUTES.brands,
  ROUTES.categories,
  ROUTES.ads,
  ROUTES.discountCodes,
  ROUTES.notifications,
]);

export function AppLayout(): React.JSX.Element {
  const isCollapsed = useUiStore((state) => state.isSidebarCollapsed);
  const { pathname } = useLocation();
  const fixedTableWorkspace = fixedTableRoutes.has(pathname);

  return (
    <div className={cn('min-h-screen bg-background', fixedTableWorkspace && 'h-dvh overflow-hidden')}>
      <DesktopSidebar />
      <MobileSidebar />

      <div className={cn('transition-all duration-200 lg:ps-72', isCollapsed && 'lg:ps-20')}>
        <AppHeader />
        <main
          className={cn(
            'min-w-0',
            fixedTableWorkspace
              ? 'h-[calc(100dvh-3.5rem)] min-h-0 overflow-hidden'
              : 'pb-8',
          )}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
