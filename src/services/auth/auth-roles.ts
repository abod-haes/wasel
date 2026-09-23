import { PERMISSIONS, type Permission } from '@/constants/permissions';

const ROLE_CLAIM_KEYS = [
  'role',
  'roles',
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
] as const;

const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
  const parts = token.split('.');
  if (parts.length < 2) return null;

  try {
    const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const decoded = atob(padded);
    const json = decodeURIComponent(
      Array.from(decoded)
        .map((character) => `%${character.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join('')
    );

    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
};

const normalizeRoleValue = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

export const getRolesFromToken = (token: string): string[] => {
  const payload = decodeJwtPayload(token);
  if (!payload) return [];

  const roles = ROLE_CLAIM_KEYS.flatMap((key) => normalizeRoleValue(payload[key]));
  return Array.from(new Set(roles));
};

export const hasAppRole = (roles: string[], role: string): boolean => {
  const normalizedRole = role.toLowerCase();
  return roles.some((item) => item.toLowerCase() === normalizedRole);
};

export const isAdminRole = (roles: string[]): boolean =>
  hasAppRole(roles, 'Admin') || hasAppRole(roles, 'SuperAdmin');

export const isMarketRole = (roles: string[]): boolean => hasAppRole(roles, 'Market');

export const getPermissionsForRoles = (roles: string[]): Permission[] => {
  if (isAdminRole(roles)) {
    return Object.values(PERMISSIONS);
  }

  if (isMarketRole(roles)) {
    return [
      PERMISSIONS.dashboardView,
      PERMISSIONS.productsView,
      PERMISSIONS.ordersView,
    ];
  }

  return [];
};
