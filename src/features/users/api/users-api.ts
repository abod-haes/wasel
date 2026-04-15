import { env } from '@/env';
import { createUserSchema, updateUserSchema } from '@/features/users/schemas/user-form-schema';
import type {
  CreateUserInput,
  UpdateUserInput,
  User,
  UserRole,
  UserRoleAssignment,
  UsersFilter,
} from '@/features/users/types/user-types';
import { apiClient } from '@/services/api/client';
import { delay } from '@/services/mock/mock-utils';
import type { ApiPaginatedResult } from '@/types/api';

interface UserRoleApiResponse {
  Id?: string;
  id?: string;
  Name?: string;
  name?: string;
}

interface UserApiResponse {
  Id?: string;
  id?: string;
  FirstName?: string;
  firstName?: string;
  LastName?: string;
  lastName?: string;
  Email?: string;
  email?: string;
  PhoneNumber?: string;
  phoneNumber?: string;
  Location?: string;
  location?: string;
  Latitude?: number;
  latitude?: number;
  Longitude?: number;
  longitude?: number;
  PhoneNumberVerified?: boolean;
  phoneNumberVerified?: boolean;
  PhoneNumberVerifiedAt?: string;
  phoneNumberVerifiedAt?: string;
  CreatedAt?: string;
  createdAt?: string;
  LastLogin?: string;
  lastLogin?: string;
  Roles?: UserRoleApiResponse[];
  roles?: UserRoleApiResponse[];
}

interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  phoneNumberVerified: boolean;
  roleIds: string[];
}

interface UpdateUserRequest {
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

type UsersPaginatedResponse = Partial<ApiPaginatedResult<UserApiResponse>> & {
  items?: UserApiResponse[];
};

const MOCK_ROLE_CATALOG: Record<UserRole, UserRoleAssignment> = {
  admin: {
    id: 'role-admin',
    name: 'Admin',
    key: 'admin',
  },
  editor: {
    id: 'role-editor',
    name: 'Editor',
    key: 'editor',
  },
  viewer: {
    id: 'role-viewer',
    name: 'Viewer',
    key: 'viewer',
  },
};

const cloneUserRole = (role: UserRoleAssignment): UserRoleAssignment => ({ ...role });

const createMockUser = (
  id: string,
  firstName: string,
  lastName: string,
  email: string,
  phoneNumber: string,
  roleKey: UserRole,
  phoneNumberVerified: boolean,
  createdAt: string,
  lastLogin: string
): User => {
  const role = cloneUserRole(MOCK_ROLE_CATALOG[roleKey]);

  return {
    id,
    firstName,
    lastName,
    name: `${firstName} ${lastName}`.trim(),
    email,
    phoneNumber,
    location: undefined,
    latitude: null,
    longitude: null,
    phoneNumberVerified,
    phoneNumberVerifiedAt: phoneNumberVerified ? lastLogin : null,
    roles: [role],
    role: role.key,
    status: phoneNumberVerified ? 'active' : 'invited',
    lastLogin,
    createdAt,
  };
};

let usersDb: User[] = [
  createMockUser(
    'u-1001',
    'سارة',
    'ووكر',
    'sarah@wasel.com',
    '+963944000001',
    'admin',
    true,
    '2026-01-12T08:00:00.000Z',
    '2026-03-30T07:30:00.000Z'
  ),
  createMockUser(
    'u-1002',
    'عمر',
    'حداد',
    'omar@wasel.com',
    '+963944000002',
    'editor',
    true,
    '2026-02-01T09:00:00.000Z',
    '2026-03-29T18:10:00.000Z'
  ),
  createMockUser(
    'u-1003',
    'لينا',
    'جورج',
    'lina@wasel.com',
    '+963944000003',
    'viewer',
    false,
    '2026-03-05T10:00:00.000Z',
    '2026-03-20T13:00:00.000Z'
  ),
  createMockUser(
    'u-1004',
    'يزن',
    'صالح',
    'yazan@wasel.com',
    '+963944000004',
    'viewer',
    false,
    '2026-01-28T09:30:00.000Z',
    '2026-02-27T16:20:00.000Z'
  ),
];

const cloneUser = (user: User): User => ({
  ...user,
  roles: user.roles.map(cloneUserRole),
});

const applyFilters = (users: User[], filters: UsersFilter): User[] => {
  const searchValue = filters.search.trim().toLowerCase();

  return users.filter((user) => {
    const matchesSearch =
      searchValue.length === 0 ||
      user.name.toLowerCase().includes(searchValue) ||
      user.email.toLowerCase().includes(searchValue) ||
      user.phoneNumber.toLowerCase().includes(searchValue);

    const matchesRole = filters.role === 'all' || user.role === filters.role;
    const matchesStatus = filters.status === 'all' || user.status === filters.status;

    return matchesSearch && matchesRole && matchesStatus;
  });
};

const getPaginatedItems = <T>(
  data: Partial<ApiPaginatedResult<T>> & { items?: T[] }
): T[] => {
  const items = data.Items ?? data.items;
  return Array.isArray(items) ? items : [];
};

const resolveIsoDate = (value?: string): string => {
  if (!value) {
    return new Date().toISOString();
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return new Date().toISOString();
  }

  return parsedDate.toISOString();
};

const resolveNullableIsoDate = (value?: string): string | null => {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate.toISOString();
};

const resolveUserRoleKey = (roleName: string): UserRole => {
  const normalizedRoleName = roleName.toLowerCase();

  if (normalizedRoleName.includes('admin')) {
    return 'admin';
  }

  if (normalizedRoleName.includes('editor') || normalizedRoleName.includes('manager')) {
    return 'editor';
  }

  return 'viewer';
};

const resolvePrimaryRole = (roles: UserRoleAssignment[]): UserRole => {
  if (roles.some((role) => role.key === 'admin')) {
    return 'admin';
  }

  if (roles.some((role) => role.key === 'editor')) {
    return 'editor';
  }

  return 'viewer';
};

const resolveNumber = (...values: Array<number | undefined>): number | null => {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
  }

  return null;
};

const resolveOptionalString = (...values: Array<string | undefined>): string | undefined => {
  for (const value of values) {
    if (typeof value === 'string') {
      const normalizedValue = value.trim();
      if (normalizedValue.length > 0) {
        return normalizedValue;
      }
    }
  }

  return undefined;
};

const mapRoleResponse = (role: UserRoleApiResponse): UserRoleAssignment | null => {
  const roleId = (role.Id ?? role.id ?? '').trim();
  const roleName = (role.Name ?? role.name ?? '').trim();
  const normalizedRoleName = roleName || roleId;
  const normalizedRoleId = roleId || roleName;

  if (!normalizedRoleName || !normalizedRoleId) {
    return null;
  }

  return {
    id: normalizedRoleId,
    name: normalizedRoleName,
    key: resolveUserRoleKey(normalizedRoleName),
  };
};

const mapUserResponse = (user: UserApiResponse): User => {
  const firstName = resolveOptionalString(user.FirstName, user.firstName) ?? '';
  const lastName = resolveOptionalString(user.LastName, user.lastName) ?? '';
  const phoneNumber = resolveOptionalString(user.PhoneNumber, user.phoneNumber) ?? '';
  const email = resolveOptionalString(user.Email, user.email) ?? '';
  const fullName = `${firstName} ${lastName}`.trim();
  const mappedRoles =
    (user.Roles ?? user.roles ?? [])
      .map(mapRoleResponse)
      .filter((role): role is UserRoleAssignment => role !== null) ?? [];
  const phoneNumberVerified = Boolean(user.PhoneNumberVerified ?? user.phoneNumberVerified);
  const phoneNumberVerifiedAt = resolveNullableIsoDate(
    user.PhoneNumberVerifiedAt ?? user.phoneNumberVerifiedAt
  );
  const createdAt = resolveIsoDate(
    user.CreatedAt ?? user.createdAt ?? phoneNumberVerifiedAt ?? user.LastLogin ?? user.lastLogin
  );
  const lastLogin = resolveIsoDate(
    user.LastLogin ?? user.lastLogin ?? phoneNumberVerifiedAt ?? user.CreatedAt ?? user.createdAt
  );

  return {
    id: resolveOptionalString(user.Id, user.id, phoneNumber, email, fullName) ?? '',
    firstName,
    lastName,
    name: fullName || phoneNumber || email || 'User',
    email,
    phoneNumber,
    location: resolveOptionalString(user.Location, user.location),
    latitude: resolveNumber(user.Latitude, user.latitude),
    longitude: resolveNumber(user.Longitude, user.longitude),
    phoneNumberVerified,
    phoneNumberVerifiedAt,
    roles: mappedRoles,
    role: resolvePrimaryRole(mappedRoles),
    status: phoneNumberVerified ? 'active' : 'invited',
    lastLogin,
    createdAt,
  };
};

const buildUserId = (): string => {
  return `u-${Math.floor(Math.random() * 9000) + 1000}`;
};

const findRoleById = (roleId: string): UserRoleAssignment | undefined => {
  const normalizedRoleId = roleId.trim();

  if (!normalizedRoleId) {
    return undefined;
  }

  for (const user of usersDb) {
    const matchedRole = user.roles.find((role) => role.id === normalizedRoleId);
    if (matchedRole) {
      return cloneUserRole(matchedRole);
    }
  }

  const roleFromCatalog = Object.values(MOCK_ROLE_CATALOG).find((role) => role.id === normalizedRoleId);
  if (roleFromCatalog) {
    return cloneUserRole(roleFromCatalog);
  }

  return {
    id: normalizedRoleId,
    name: normalizedRoleId,
    key: 'viewer',
  };
};

const mapRoleIdsToAssignments = (roleIds: string[]): UserRoleAssignment[] => {
  const uniqueRoles = new Map<string, UserRoleAssignment>();

  roleIds.forEach((roleId) => {
    const role = findRoleById(roleId);
    if (!role) {
      return;
    }

    uniqueRoles.set(role.id, role);
  });

  return Array.from(uniqueRoles.values());
};

const buildCreateUserRequest = (payload: CreateUserInput): CreateUserRequest => {
  const parsed = createUserSchema.parse(payload);

  const requestPayload: CreateUserRequest = {
    firstName: parsed.firstName,
    lastName: parsed.lastName,
    email: parsed.email,
    phoneNumber: parsed.phoneNumber,
    password: parsed.password,
    phoneNumberVerified: Boolean(parsed.phoneNumberVerified),
    roleIds: parsed.roleIds ?? [],
  };

  if (parsed.location) {
    requestPayload.location = parsed.location;
  }

  if (parsed.latitude != null) {
    requestPayload.latitude = parsed.latitude;
  }

  if (parsed.longitude != null) {
    requestPayload.longitude = parsed.longitude;
  }

  return requestPayload;
};

const buildUpdateUserRequest = (payload: UpdateUserInput): {
  id: string;
  requestPayload: UpdateUserRequest;
} => {
  const parsed = updateUserSchema.parse(payload);
  const requestPayload: UpdateUserRequest = {};

  if (parsed.firstName != null) {
    requestPayload.firstName = parsed.firstName;
  }

  if (parsed.lastName != null) {
    requestPayload.lastName = parsed.lastName;
  }

  if (parsed.email != null) {
    requestPayload.email = parsed.email;
  }

  if (parsed.phoneNumber != null) {
    requestPayload.phoneNumber = parsed.phoneNumber;
  }

  if (parsed.password != null) {
    requestPayload.password = parsed.password;
  }

  if (parsed.location != null) {
    requestPayload.location = parsed.location;
  }

  if (parsed.latitude != null) {
    requestPayload.latitude = parsed.latitude;
  }

  if (parsed.longitude != null) {
    requestPayload.longitude = parsed.longitude;
  }

  if (parsed.phoneNumberVerified != null) {
    requestPayload.phoneNumberVerified = parsed.phoneNumberVerified;
  }

  if (parsed.roleIds != null) {
    requestPayload.roleIds = parsed.roleIds;
  }

  return {
    id: parsed.id,
    requestPayload,
  };
};

export const usersApi = {
  async getUsers(filters: UsersFilter): Promise<User[]> {
    if (env.enableMockApi) {
      await delay(450);
      return applyFilters(usersDb.map(cloneUser), filters);
    }

    const { data } = await apiClient.get<UsersPaginatedResponse>('/api/Users', {
      params: {
        page: 1,
        pageSize: 100,
        includeRoles: true,
      },
    });

    const mappedUsers = getPaginatedItems(data).map(mapUserResponse);
    return applyFilters(mappedUsers, filters);
  },

  async createUser(payload: CreateUserInput): Promise<User> {
    const requestPayload = buildCreateUserRequest(payload);

    if (env.enableMockApi) {
      await delay(500);

      const nowIso = new Date().toISOString();
      const roles = mapRoleIdsToAssignments(requestPayload.roleIds);
      const createdUser: User = {
        id: buildUserId(),
        firstName: requestPayload.firstName,
        lastName: requestPayload.lastName,
        name: `${requestPayload.firstName} ${requestPayload.lastName}`.trim(),
        email: requestPayload.email,
        phoneNumber: requestPayload.phoneNumber,
        location: requestPayload.location,
        latitude: requestPayload.latitude ?? null,
        longitude: requestPayload.longitude ?? null,
        phoneNumberVerified: requestPayload.phoneNumberVerified,
        phoneNumberVerifiedAt: requestPayload.phoneNumberVerified ? nowIso : null,
        roles,
        role: resolvePrimaryRole(roles),
        status: requestPayload.phoneNumberVerified ? 'active' : 'invited',
        createdAt: nowIso,
        lastLogin: nowIso,
      };

      usersDb = [createdUser, ...usersDb];

      return cloneUser(createdUser);
    }

    const { data } = await apiClient.post<UserApiResponse>('/api/Users', requestPayload);
    return mapUserResponse(data);
  },

  async updateUser(payload: UpdateUserInput): Promise<User> {
    const { id, requestPayload } = buildUpdateUserRequest(payload);

    if (env.enableMockApi) {
      await delay(500);

      let updatedUser: User | undefined;

      usersDb = usersDb.map((user) => {
        if (user.id !== id) {
          return user;
        }

        const nextUser: User = {
          ...user,
          roles: user.roles.map(cloneUserRole),
        };

        if (requestPayload.firstName != null) {
          nextUser.firstName = requestPayload.firstName;
        }

        if (requestPayload.lastName != null) {
          nextUser.lastName = requestPayload.lastName;
        }

        if (requestPayload.email != null) {
          nextUser.email = requestPayload.email;
        }

        if (requestPayload.phoneNumber != null) {
          nextUser.phoneNumber = requestPayload.phoneNumber;
        }

        if (requestPayload.location != null) {
          nextUser.location = requestPayload.location;
        }

        if (requestPayload.latitude != null) {
          nextUser.latitude = requestPayload.latitude;
        }

        if (requestPayload.longitude != null) {
          nextUser.longitude = requestPayload.longitude;
        }

        if (requestPayload.phoneNumberVerified != null) {
          nextUser.phoneNumberVerified = requestPayload.phoneNumberVerified;
          nextUser.phoneNumberVerifiedAt = requestPayload.phoneNumberVerified
            ? nextUser.phoneNumberVerifiedAt ?? new Date().toISOString()
            : null;
        }

        if (requestPayload.roleIds != null) {
          nextUser.roles = mapRoleIdsToAssignments(requestPayload.roleIds);
        }

        nextUser.name = `${nextUser.firstName} ${nextUser.lastName}`.trim() || nextUser.phoneNumber || nextUser.email;
        nextUser.role = resolvePrimaryRole(nextUser.roles);
        nextUser.status = nextUser.phoneNumberVerified ? 'active' : 'invited';
        nextUser.lastLogin = resolveIsoDate(nextUser.phoneNumberVerifiedAt ?? nextUser.createdAt);
        updatedUser = nextUser;

        return nextUser;
      });

      if (!updatedUser) {
        throw new Error('User not found');
      }

      return cloneUser(updatedUser);
    }

    const { data } = await apiClient.put<UserApiResponse>(`/api/Users/${id}`, requestPayload);
    return mapUserResponse(data);
  },

  async deleteUser(userId: string): Promise<void> {
    if (env.enableMockApi) {
      await delay(450);

      const previousLength = usersDb.length;
      usersDb = usersDb.filter((user) => user.id !== userId);

      if (usersDb.length === previousLength) {
        throw new Error('User not found');
      }

      return;
    }

    await apiClient.delete(`/api/Users/${userId}`);
  },
};
