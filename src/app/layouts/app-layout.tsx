import { Outlet } from 'react-router-dom';

import { AppHeader } from '@/app/layouts/app-header';
import { DesktopSidebar, MobileSidebar } from '@/app/layouts/app-sidebar';
import { cn } from '@/lib/utils';
import { getApiEnvironment } from '@/config/api-environment';
import { useUiStore } from '@/store/use-ui-store';

export function AppLayout(): React.JSX.Element {
  const isCollapsed = useUiStore((state) => state.isSidebarCollapsed);

  return (
    <div className="min-h-screen">
      <DesktopSidebar />
      <MobileSidebar />

      <div className={cn('transition-all duration-200 lg:ps-72', isCollapsed && 'lg:ps-20')}>
        <AppHeader />
        {getApiEnvironment() === 'development' ? (
          <div role="status" className="border-b border-amber-300 bg-amber-100 px-4 py-2 text-center text-xs font-semibold text-amber-950">
            بيئة تجريبية Development — البيانات والتعديلات ليست على سيرفر الإنتاج
          </div>
        ) : null}
        <main className="pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
