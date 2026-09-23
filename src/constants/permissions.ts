export const PERMISSIONS = {
  dashboardView: 'dashboard:view',
  usersView: 'users:view',
  usersCreate: 'users:create',
  usersEdit: 'users:edit',
  productsView: 'products:view',
  brandsView: 'brands:view',
  categoriesView: 'categories:view',
  adsView: 'ads:view',
  ordersView: 'orders:view',
  ordersManage: 'orders:manage',
  notificationsView: 'notifications:view',
  notificationsSend: 'notifications:send',
  otpAdminView: 'otp-admin:view',
  settingsView: 'settings:view',
  settingsEdit: 'settings:edit',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
