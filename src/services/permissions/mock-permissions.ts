import type { Permission } from '@/constants/permissions';

const normalizeRequired = (required: Permission | Permission[]): Permission[] => {
  if (Array.isArray(required)) {
    return required;
  }

  return [required];
};

export const hasPermission = (
  grantedPermissions: Permission[],
  required: Permission | Permission[]
): boolean => {
  const requiredPermissions = normalizeRequired(required);

  return requiredPermissions.every((permission) => grantedPermissions.includes(permission));
};
