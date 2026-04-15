import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import type { Permission } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { hasPermission } from '@/services/permissions/mock-permissions';
import { useAuthStore } from '@/store/use-auth-store';

export function ProtectedRoute(): React.JSX.Element {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace />;
  }

  return <Outlet />;
}

interface PermissionGuardProps {
  required: Permission | Permission[];
  children: React.ReactNode;
}

export function PermissionGuard({ required, children }: PermissionGuardProps): React.JSX.Element {
  const userPermissions = useAuthStore((state) => state.user?.permissions ?? []);

  if (!hasPermission(userPermissions, required)) {
    return <Navigate to={ROUTES.unauthorized} replace />;
  }

  return <>{children}</>;
}
