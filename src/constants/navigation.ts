import { Bell, ClipboardList, LayoutDashboard, Package, Settings, SlidersHorizontal, Tags, Users } from 'lucide-react';

import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import type { SidebarNavItem } from '@/types/navigation';

export const SIDEBAR_NAV_ITEMS: SidebarNavItem[] = [
  {
    key: 'dashboard',
    labelKey: 'nav.dashboard',
    to: ROUTES.dashboard,
    icon: LayoutDashboard,
    permission: PERMISSIONS.dashboardView,
  },
  {
    key: 'users',
    labelKey: 'nav.users',
    to: ROUTES.users,
    icon: Users,
    permission: PERMISSIONS.usersView,
  },
  {
    key: 'products',
    labelKey: 'nav.products',
    to: ROUTES.products,
    icon: Package,
    permission: PERMISSIONS.productsView,
  },
  {
    key: 'categories',
    labelKey: 'nav.categories',
    to: ROUTES.categories,
    icon: Tags,
    permission: PERMISSIONS.categoriesView,
  },
  {
    key: 'orders',
    labelKey: 'nav.orders',
    to: ROUTES.orders,
    icon: ClipboardList,
    permission: PERMISSIONS.ordersView,
  },
  {
    key: 'notifications',
    labelKey: 'nav.notifications',
    to: ROUTES.notifications,
    icon: Bell,
    permission: PERMISSIONS.notificationsView,
  },
  {
    key: 'settings',
    labelKey: 'nav.settings',
    icon: Settings,
    permission: PERMISSIONS.settingsView,
    children: [
      {
        key: 'settings-general',
        labelKey: 'nav.settingsGeneral',
        to: ROUTES.settings,
        icon: Settings,
        permission: PERMISSIONS.settingsView,
      },
      {
        key: 'settings-preferences',
        labelKey: 'nav.settingsPreferences',
        to: ROUTES.settingsPreferences,
        icon: SlidersHorizontal,
        permission: PERMISSIONS.settingsView,
      },
    ],
  },
];
