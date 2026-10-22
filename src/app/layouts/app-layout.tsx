import { Outlet, useLocation } from 'react-router-dom';

import { AppHeader } from '@/app/layouts/app-header';
import { PushNotificationsBridge } from '@/features/push/push-notifications-bridge';
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
    <div
      className={cn(
        'bg-background',
        fixedTableWorkspace
          // Keep table-only scrolling on desktop; smaller touch screens must
          // scroll the full page so filters and pagination remain reachable.
          ? 'min-h-dvh lg:fixed lg:inset-0 lg:flex lg:min-h-0 lg:flex-col lg:overflow-hidden'
          : 'min-h-screen',
      )}
    >
      <PushNotificationsBridge />
      <DesktopSidebar />
      <MobileSidebar />

      <div
        className={cn(
          'transition-all duration-200 lg:ps-72',
          isCollapsed && 'lg:ps-20',
          fixedTableWorkspace && 'lg:flex lg:min-h-0 lg:flex-1 lg:flex-col lg:overflow-hidden',
        )}
      >
        <AppHeader />
        <main
          className={cn(
            'min-w-0',
            fixedTableWorkspace ? 'pb-8 lg:min-h-0 lg:flex-1 lg:overflow-hidden lg:pb-0' : 'pb-8',
          )}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
