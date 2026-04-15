export const USER_ROLES = ['admin', 'editor', 'viewer'] as const;
export const USER_STATUSES = ['active', 'invited', 'suspended'] as const;

export type UserRole = (typeof USER_ROLES)[number];
export type UserStatus = (typeof USER_STATUSES)[number];

export interface UserRoleAssignment {
  id: string;
  name: string;
  key: UserRole;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phoneNumber: string;
  location?: string;
  latitude: number | null;
  longitude: number | null;
  phoneNumberVerified: boolean;
  phoneNumberVerifiedAt: string | null;
  roles: UserRoleAssignment[];
  role: UserRole;
  status: UserStatus;
  lastLogin: string;
  createdAt: string;
}

export interface UsersFilter {
  search: string;
  role: UserRole | 'all';
  status: UserStatus | 'all';
}

export interface UserFormInput {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  phoneNumberVerified: boolean;
  roleIds: string[];
}

export interface CreateUserInput extends UserFormInput {
  password: string;
}

export interface UpdateUserInput {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  phoneNumberVerified?: boolean;
  roleIds?: string[];
}
