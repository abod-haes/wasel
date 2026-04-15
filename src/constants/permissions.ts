export const PERMISSIONS = {
  dashboardView: 'dashboard:view',
  usersView: 'users:view',
  usersCreate: 'users:create',
  usersEdit: 'users:edit',
  productsView: 'products:view',
  categoriesView: 'categories:view',
  ordersView: 'orders:view',
  ordersManage: 'orders:manage',
  notificationsView: 'notifications:view',
  notificationsSend: 'notifications:send',
  settingsView: 'settings:view',
  settingsEdit: 'settings:edit',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
