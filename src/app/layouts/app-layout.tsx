import { Outlet } from 'react-router-dom';

import { AppHeader } from '@/app/layouts/app-header';
import { DesktopSidebar, MobileSidebar } from '@/app/layouts/app-sidebar';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/store/use-ui-store';

export function AppLayout(): React.JSX.Element {
  const isCollapsed = useUiStore((state) => state.isSidebarCollapsed);

  return (
    <div className="min-h-screen">
      <DesktopSidebar />
      <MobileSidebar />

      <div className={cn('transition-all duration-200 lg:ps-72', isCollapsed && 'lg:ps-20')}>
        <AppHeader />
        <main className="pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
