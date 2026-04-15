import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { APP_NAME } from '@/constants/app';
import { SIDEBAR_NAV_ITEMS } from '@/constants/navigation';
import type { Permission } from '@/constants/permissions';
import { Button, ScrollArea, Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui';
import { SidebarNav } from '@/components/shared';
import { cn } from '@/lib/utils';
import { hasPermission } from '@/services/permissions/mock-permissions';
import { useAuthStore } from '@/store/use-auth-store';
import { useUiStore } from '@/store/use-ui-store';
import type { SidebarNavItem } from '@/types/navigation';

const filterNavByPermission = (
  navItems: SidebarNavItem[],
  grantedPermissions: Permission[]
): SidebarNavItem[] => {
  return navItems
    .map((item) => {
      if (item.permission && !hasPermission(grantedPermissions, item.permission)) {
        return null;
      }

      if (item.children && item.children.length > 0) {
        return {
          ...item,
          children: filterNavByPermission(item.children, grantedPermissions),
        };
      }

      return item;
    })
    .filter((item): item is SidebarNavItem => item !== null)
    .filter((item) => !item.children || item.children.length > 0 || Boolean(item.to));
};

function SidebarInner({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
}): React.JSX.Element {
  const { i18n } = useTranslation();
  const userPermissions = useAuthStore((state) => state.user?.permissions ?? []);
  const direction = i18n.dir();

  const items = useMemo(() => {
    return filterNavByPermission(SIDEBAR_NAV_ITEMS, userPermissions);
  }, [userPermissions]);

  return (
    <>
      <div className="flex h-14 items-center border-b px-4">
        <span className={cn('font-bold tracking-tight transition-all', collapsed ? 'hidden' : 'inline')}>{APP_NAME}</span>
      </div>
      <ScrollArea dir={direction} className="h-[calc(100vh-56px)] px-2 py-4">
        <SidebarNav items={items} collapsed={collapsed} onNavigate={onNavigate} />
      </ScrollArea>
    </>
  );
}

export function DesktopSidebar(): React.JSX.Element {
  const { t } = useTranslation();

  const isCollapsed = useUiStore((state) => state.isSidebarCollapsed);
  const toggleSidebarCollapse = useUiStore((state) => state.toggleSidebarCollapse);

  return (
    <aside
      className={cn(
        'fixed inset-y-0 start-0 z-30 hidden border-e bg-card/90 backdrop-blur lg:block',
        isCollapsed ? 'w-20' : 'w-72'
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute end-2 top-2 z-10"
        onClick={toggleSidebarCollapse}
        aria-label={isCollapsed ? t('layout.expand') : t('layout.collapse')}
      >
        {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
      </Button>

      <SidebarInner collapsed={isCollapsed} />
    </aside>
  );
}

export function MobileSidebar(): React.JSX.Element {
  const { t, i18n } = useTranslation();

  const isOpen = useUiStore((state) => state.isMobileSidebarOpen);
  const setOpen = useUiStore((state) => state.setMobileSidebarOpen);

  const side = i18n.dir() === 'rtl' ? 'right' : 'left';

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent side={side} className="w-[85vw] p-0 sm:max-w-sm">
        <SheetHeader className="sr-only">
          <SheetTitle>{t('app.title')}</SheetTitle>
        </SheetHeader>
        <SidebarInner collapsed={false} onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}

export function SidebarToggleButton(): React.JSX.Element {
  const { t } = useTranslation();

  const setOpen = useUiStore((state) => state.setMobileSidebarOpen);

  return (
    <Button
      variant="ghost"
      size="icon"
      className="lg:hidden"
      onClick={() => setOpen(true)}
      aria-label={t('layout.openSidebar')}
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
}
