import { lazy, Suspense } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';

import { AppLayout } from '@/app/layouts/app-layout';
import { PermissionGuard, ProtectedRoute } from '@/app/router/route-guards';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { LoadingScreen } from '@/components/shared';
import LoginPage from '@/pages/login-page';
import NotFoundPage from '@/pages/not-found-page';
import UnauthorizedPage from '@/pages/unauthorized-page';

const DashboardPage = lazy(() => import('@/features/dashboard/pages/dashboard-page'));
const UsersPage = lazy(() => import('@/features/users/pages/users-page'));
const ProductsPage = lazy(() => import('@/features/products/pages/products-page'));
const CategoriesPage = lazy(() => import('@/features/categories/pages/categories-page'));
const OrdersPage = lazy(() => import('@/features/orders/pages/orders-page'));
const NotificationsPage = lazy(() => import('@/features/notifications/pages/notifications-page'));
const SettingsPage = lazy(() => import('@/features/settings/pages/settings-page'));
const SettingsPreferencesPage = lazy(
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
