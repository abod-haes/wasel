import { PERMISSIONS, type Permission } from '@/constants/permissions';
import { env } from '@/env';
import { apiClient } from '@/services/api/client';
import { delay } from '@/services/mock/mock-utils';
import type { AuthSession, AuthUser, LoginApiResponse, LoginApiUserResponse, LoginPayload } from '@/types/auth';

const DEFAULT_AUTH_PERMISSIONS: Permission[] = Object.values(PERMISSIONS);
const DEFAULT_SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

const resolveString = (...values: Array<string | undefined>): string => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }

  return '';
};

const resolveNumber = (...values: Array<number | undefined>): number | null => {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
  }

  return null;
};

const resolveExpiresAt = (value: string): string => {
  const parsedTimestamp = Date.parse(value);
  if (Number.isNaN(parsedTimestamp)) {
    return new Date(Date.now() + DEFAULT_SESSION_DURATION_MS).toISOString();
  }

  return new Date(parsedTimestamp).toISOString();
};

const mapApiUser = (apiUser: LoginApiUserResponse): AuthUser => {
  const firstName = resolveString(apiUser.FirstName, apiUser.firstName);
  const lastName = resolveString(apiUser.LastName, apiUser.lastName);
  const phoneNumber = resolveString(apiUser.PhoneNumber, apiUser.phoneNumber);
  const name = `${firstName} ${lastName}`.trim() || phoneNumber || 'User';

  return {
    id: resolveString(apiUser.Id, apiUser.id, phoneNumber, name),
    firstName,
    lastName,
    name,
    email: resolveString(apiUser.Email, apiUser.email),
    phoneNumber,
    phoneNumberVerified: Boolean(apiUser.PhoneNumberVerified ?? apiUser.phoneNumberVerified),
    phoneNumberVerifiedAt:
      resolveString(apiUser.PhoneNumberVerifiedAt, apiUser.phoneNumberVerifiedAt) || null,
    latitude: resolveNumber(apiUser.Latitude, apiUser.latitude),
    longitude: resolveNumber(apiUser.Longitude, apiUser.longitude),
    permissions: DEFAULT_AUTH_PERMISSIONS,
  };
};

const mapLoginResponse = (payload: LoginApiResponse): AuthSession => {
  const token = resolveString(payload.Token, payload.token);
  const expiresAtValue = resolveString(payload.ExpiresAt, payload.expiresAt);
  const apiUser = payload.User ?? payload.user;

  if (token.length === 0 || !apiUser) {
    throw new Error('Invalid login response.');
  }

  const mappedUser = mapApiUser(apiUser);
  if (mappedUser.id.length === 0) {
    throw new Error('Invalid user data in login response.');
  }

  return {
    token,
    expiresAt: resolveExpiresAt(expiresAtValue),
    user: mappedUser,
  };
};

const buildMockSession = (credentials: LoginPayload): AuthSession => {
  const normalizedPhoneNumber = credentials.phoneNumber.trim();
  const now = new Date();

  return {
    token: `mock-token-${Date.now()}`,
    expiresAt: new Date(now.getTime() + DEFAULT_SESSION_DURATION_MS).toISOString(),
    user: {
      id: normalizedPhoneNumber,
      firstName: '',
      lastName: '',
      name: normalizedPhoneNumber,
      email: '',
      phoneNumber: normalizedPhoneNumber,
      phoneNumberVerified: true,
      phoneNumberVerifiedAt: now.toISOString(),
      latitude: null,
      longitude: null,
      permissions: DEFAULT_AUTH_PERMISSIONS,
    },
  };
};

const validateCredentials = (credentials: LoginPayload): LoginPayload => {
  const normalizedCredentials = {
    phoneNumber: credentials.phoneNumber.trim(),
    password: credentials.password.trim(),
  };

  if (!normalizedCredentials.phoneNumber || !normalizedCredentials.password) {
    throw new Error('Phone number and password are required.');
  }

  return normalizedCredentials;
};

export const authApi = {
  async login(credentials: LoginPayload): Promise<AuthSession> {
    const normalizedCredentials = validateCredentials(credentials);

    if (env.enableMockApi) {
      await delay(350);
      return buildMockSession(normalizedCredentials);
    }

    const { data } = await apiClient.post<LoginApiResponse>('/api/Auth/login', normalizedCredentials);
    return mapLoginResponse(data);
  },
};
