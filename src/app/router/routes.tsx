import { Suspense } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';

import { AppLayout } from '@/app/layouts/app-layout';
import { lazyRoute } from '@/app/router/lazy-route';
import { PermissionGuard, ProtectedRoute } from '@/app/router/route-guards';
import { LoadingScreen } from '@/components/shared';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import AccountDeletionPage from '@/pages/account-deletion-page';
import LoginPage from '@/pages/login-page';
import NotFoundPage from '@/pages/not-found-page';
import PrivacyPage from '@/pages/privacy-page';
import RouteErrorPage from '@/pages/route-error-page';
import SupportPage from '@/pages/support-page';
import UnauthorizedPage from '@/pages/unauthorized-page';

const DashboardPage = lazyRoute(() => import('@/features/dashboard/pages/dashboard-page'));
const ProfilePage = lazyRoute(() => import('@/features/profile/pages/profile-page'));
const UsersPage = lazyRoute(() => import('@/features/users/pages/users-page'));
const ProductsPage = lazyRoute(() => import('@/features/products/pages/products-page'));
const BrandsPage = lazyRoute(() => import('@/features/brands/pages/brands-page'));
const ProductCreatePage = lazyRoute(() => import('@/features/products/pages/product-create-page'));
const ProductEditPage = lazyRoute(() => import('@/features/products/pages/product-edit-page'));
const CategoriesPage = lazyRoute(() => import('@/features/categories/pages/categories-page'));
const AdsPage = lazyRoute(() => import('@/features/ads/pages/ads-page'));
const OrdersPage = lazyRoute(() => import('@/features/orders/pages/orders-page'));
const DiscountCodesPage = lazyRoute(() => import('@/features/discount-codes/pages/discount-codes-page'));
const DeliveryFinancePage = lazyRoute(
  () => import('@/features/delivery-finance/pages/delivery-finance-page')
);
const NotificationsPage = lazyRoute(() => import('@/features/notifications/pages/notifications-page'));
const OtpAdminPage = lazyRoute(() => import('@/features/otp-admin/pages/otp-admin-page'));
const SettingsPage = lazyRoute(() => import('@/features/settings/pages/settings-page'));
const PricingSettingsPage = lazyRoute(() => import('@/features/settings/pages/pricing-settings-page'));
const SettingsPreferencesPage = lazyRoute(
  () => import('@/features/settings/pages/settings-preferences-page')
);

const withSuspense = (element: React.ReactNode): React.JSX.Element => {
  return <Suspense fallback={<LoadingScreen />}>{element}</Suspense>;
};

export const appRoutes: RouteObject[] = [
  {
    path: ROUTES.login,
    element: <LoginPage />,
    handle: {
      breadcrumbKey: 'nav.login',
    },
  },
  {
    path: ROUTES.privacy,
    element: <PrivacyPage />,
  },
  {
    path: ROUTES.accountDeletion,
    element: <AccountDeletionPage />,
  },
  {
    path: ROUTES.support,
    element: <SupportPage />,
  },
  {
    path: ROUTES.unauthorized,
    element: <UnauthorizedPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: ROUTES.root,
        element: <Navigate to={ROUTES.dashboard} replace />,
      },
      {
        element: <AppLayout />,
        errorElement: <RouteErrorPage />,
        children: [
          {
            path: ROUTES.dashboard,
            element: (
              <PermissionGuard required={PERMISSIONS.dashboardView}>
                {withSuspense(<DashboardPage />)}
              </PermissionGuard>
            ),
            handle: {
              breadcrumbKey: 'nav.dashboard',
            },
          },
          {
            path: ROUTES.profile,
            element: withSuspense(<ProfilePage />),
            handle: {
              breadcrumbKey: 'profile.title',
            },
          },
          {
            path: ROUTES.users,
            element: (
              <PermissionGuard required={PERMISSIONS.usersView}>
                {withSuspense(<UsersPage />)}
              </PermissionGuard>
            ),
            handle: {
              breadcrumbKey: 'nav.users',
            },
          },
          {
            path: ROUTES.products,
            element: (
              <PermissionGuard required={PERMISSIONS.productsView}>
                {withSuspense(<ProductsPage />)}
              </PermissionGuard>
            ),
            handle: {
              breadcrumbKey: 'nav.products',
            },
          },
          {
            path: ROUTES.brands,
            element: (
              <PermissionGuard required={PERMISSIONS.productsView}>
                {withSuspense(<BrandsPage />)}
              </PermissionGuard>
            ),
            handle: {
              breadcrumbKey: 'nav.brands',
            },
          },
          {
            path: ROUTES.productCreate,
            element: (
              <PermissionGuard required={PERMISSIONS.productsView}>
                {withSuspense(<ProductCreatePage />)}
              </PermissionGuard>
            ),
            handle: {
              breadcrumbKey: 'products.createProduct',
            },
          },
          {
            path: ROUTES.productEdit,
            element: (
              <PermissionGuard required={PERMISSIONS.productsView}>
                {withSuspense(<ProductEditPage />)}
              </PermissionGuard>
            ),
            handle: {
              breadcrumbKey: 'products.editProduct',
            },
          },
          {
            path: ROUTES.categories,
            element: (
              <PermissionGuard required={PERMISSIONS.categoriesView}>
                {withSuspense(<CategoriesPage />)}
              </PermissionGuard>
            ),
            handle: {
              breadcrumbKey: 'nav.categories',
            },
          },
          {
            path: ROUTES.ads,
            element: (
              <PermissionGuard required={PERMISSIONS.adsView}>
                {withSuspense(<AdsPage />)}
              </PermissionGuard>
            ),
            handle: {
              breadcrumbKey: 'nav.ads',
            },
          },
          {
            path: ROUTES.orders,
            element: (
              <PermissionGuard required={PERMISSIONS.ordersView}>
                {withSuspense(<OrdersPage />)}
              </PermissionGuard>
            ),
            handle: {
              breadcrumbKey: 'nav.orders',
            },
          },
          {
            path: ROUTES.discountCodes,
            element: (
              <PermissionGuard required={PERMISSIONS.discountCodesView}>
                {withSuspense(<DiscountCodesPage />)}
              </PermissionGuard>
            ),
            handle: {
              breadcrumbKey: 'nav.discountCodes',
            },
          },
          {
            path: ROUTES.deliveryFinance,
            element: (
              <PermissionGuard required={PERMISSIONS.settingsView}>
                {withSuspense(<DeliveryFinancePage />)}
              </PermissionGuard>
            ),
            handle: {
              breadcrumbKey: 'nav.deliveryFinance',
            },
          },
          {
            path: ROUTES.notifications,
            element: (
              <PermissionGuard required={PERMISSIONS.notificationsView}>
                {withSuspense(<NotificationsPage />)}
              </PermissionGuard>
            ),
            handle: {
              breadcrumbKey: 'nav.notifications',
            },
          },
          {
            path: ROUTES.otpAdmin,
            element: (
              <PermissionGuard required={PERMISSIONS.otpAdminView}>
                {withSuspense(<OtpAdminPage />)}
              </PermissionGuard>
            ),
            handle: {
              breadcrumbKey: 'nav.otpAdmin',
            },
          },
          {
            path: ROUTES.settings,
            element: (
              <PermissionGuard required={PERMISSIONS.settingsView}>
                {withSuspense(<SettingsPage />)}
              </PermissionGuard>
            ),
            handle: {
              breadcrumbKey: 'nav.settingsGeneral',
            },
          },
          {
            path: ROUTES.settingsPricing,
            element: (
              <PermissionGuard required={PERMISSIONS.settingsView}>
                {withSuspense(<PricingSettingsPage />)}
              </PermissionGuard>
            ),
            handle: {
              breadcrumbKey: 'nav.settingsPricing',
            },
          },
          {
            path: ROUTES.settingsPreferences,
            element: (
              <PermissionGuard required={PERMISSIONS.settingsView}>
                {withSuspense(<SettingsPreferencesPage />)}
              </PermissionGuard>
            ),
            handle: {
              breadcrumbKey: 'nav.settingsPreferences',
            },
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];
