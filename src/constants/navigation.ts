import {
  BadgeDollarSign,
  Bell,
  Bookmark,
  ClipboardList,
  HandCoins,
  LayoutDashboard,
  Megaphone,
  MessageCircleMore,
  Package,
  Images,
  Settings,
  Smartphone,
  SlidersHorizontal,
  Tags,
  TicketPercent,
  Users,
  Wallet,
} from 'lucide-react';

import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import type { SidebarNavItem } from '@/types/navigation';

/**
 * Enterprise navigation: real collapsible sections rather than decorative headings.
 * Parents intentionally have no permission: the sidebar filters their children
 * by permission and removes the whole group if none are accessible.
 */
export const SIDEBAR_NAV_ITEMS: SidebarNavItem[] = [
  {
    key: 'dashboard',
    labelKey: 'nav.dashboard',
    to: ROUTES.dashboard,
    icon: LayoutDashboard,
    permission: PERMISSIONS.dashboardView,
  },
  {
    key: 'operations',
    labelKey: 'navGroups.management',
    icon: Package,
    children: [
      { key: 'users', labelKey: 'nav.users', to: ROUTES.users, icon: Users, permission: PERMISSIONS.usersView },
      { key: 'products', labelKey: 'nav.products', to: ROUTES.products, icon: Package, permission: PERMISSIONS.productsView },
      { key: 'brands', labelKey: 'nav.brands', to: ROUTES.brands, icon: Bookmark, permission: PERMISSIONS.brandsView },
      { key: 'categories', labelKey: 'nav.categories', to: ROUTES.categories, icon: Tags, permission: PERMISSIONS.categoriesView },
      { key: 'ads', labelKey: 'nav.ads', to: ROUTES.ads, icon: Megaphone, permission: PERMISSIONS.adsView },
      { key: 'orders', labelKey: 'nav.orders', to: ROUTES.orders, icon: ClipboardList, permission: PERMISSIONS.ordersView },
      { key: 'discount-codes', labelKey: 'nav.discountCodes', to: ROUTES.discountCodes, icon: TicketPercent, permission: PERMISSIONS.discountCodesView },
    ],
  },
  {
    key: 'finance',
    labelKey: 'navGroups.finance',
    icon: Wallet,
    children: [
      { key: 'delivery-finance', labelKey: 'nav.deliveryFinance', to: ROUTES.deliveryFinance, icon: HandCoins, permission: PERMISSIONS.settingsView },
      { key: 'market-finance', labelKey: 'nav.marketFinance', to: ROUTES.marketFinance, icon: Wallet, permission: PERMISSIONS.marketFinanceView },
    ],
  },
  {
    key: 'system',
    labelKey: 'navGroups.system',
    icon: Settings,
    children: [
      { key: 'notifications', labelKey: 'nav.notifications', to: ROUTES.notifications, icon: Bell, permission: PERMISSIONS.notificationsView },
      { key: 'otp-admin', labelKey: 'nav.otpAdmin', to: ROUTES.otpAdmin, icon: MessageCircleMore, permission: PERMISSIONS.otpAdminView },
      {
        key: 'settings',
        labelKey: 'nav.settings',
        icon: Settings,
        permission: PERMISSIONS.settingsView,
        children: [
          { key: 'settings-general', labelKey: 'nav.settingsGeneral', to: ROUTES.settings, icon: Settings, permission: PERMISSIONS.settingsView },
          { key: 'settings-pricing', labelKey: 'nav.settingsPricing', to: ROUTES.settingsPricing, icon: BadgeDollarSign, permission: PERMISSIONS.settingsView },
          { key: 'settings-preferences', labelKey: 'nav.settingsPreferences', to: ROUTES.settingsPreferences, icon: SlidersHorizontal, permission: PERMISSIONS.settingsView },
          { key: 'product-image-stats', labelKey: 'nav.productImageStats', to: ROUTES.productImageStats, icon: Images, permission: PERMISSIONS.settingsView },
          { key: 'app-versions', labelKey: 'nav.appVersions', to: ROUTES.appVersions, icon: Smartphone, permission: PERMISSIONS.settingsEdit },
        ],
      },
    ],
  },
];
