import { DEFAULT_COUNTRY_CALLING_CODE, normalizeCountryCallingCode, normalizeNationalPhoneNumber } from '@/constants/phone';
import { getPermissionsForRoles, getRolesFromToken } from '@/services/auth/auth-roles';
import { env } from '@/env';
import { apiClient } from '@/services/api/client';
import { delay } from '@/services/mock/mock-utils';
import type { AuthSession, AuthUser, LoginApiResponse, LoginApiUserResponse, LoginPayload } from '@/types/auth';

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

const mapApiUser = (apiUser: LoginApiUserResponse, token: string): AuthUser => {
  const firstName = resolveString(apiUser.FirstName, apiUser.firstName);
  const lastName = resolveString(apiUser.LastName, apiUser.lastName);
  const countryCallingCode = normalizeCountryCallingCode(
    resolveString(apiUser.CountryCallingCode, apiUser.countryCallingCode) || DEFAULT_COUNTRY_CALLING_CODE
  );
  const phoneNumber = normalizeNationalPhoneNumber(resolveString(apiUser.PhoneNumber, apiUser.phoneNumber));
  const name = `${firstName} ${lastName}`.trim() || `${countryCallingCode}${phoneNumber}` || 'User';
  const roles = getRolesFromToken(token);

  return {
    id: resolveString(apiUser.Id, apiUser.id, phoneNumber, name),
    firstName,
    lastName,
    name,
    roles,
    countryCallingCode,
    phoneNumber,
    phoneNumberVerified: Boolean(apiUser.PhoneNumberVerified ?? apiUser.phoneNumberVerified),
    phoneNumberVerifiedAt:
      resolveString(apiUser.PhoneNumberVerifiedAt, apiUser.phoneNumberVerifiedAt) || null,
    latitude: resolveNumber(apiUser.Latitude, apiUser.latitude),
    longitude: resolveNumber(apiUser.Longitude, apiUser.longitude),
    permissions: getPermissionsForRoles(roles),
  };
};

const mapLoginResponse = (payload: LoginApiResponse): AuthSession => {
  const token = resolveString(payload.Token, payload.token);
  const expiresAtValue = resolveString(payload.ExpiresAt, payload.expiresAt);
  const apiUser = payload.User ?? payload.user;

  if (token.length === 0 || !apiUser) {
    throw new Error('Invalid login response.');
  }

  const mappedUser = mapApiUser(apiUser, token);
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
  const normalizedCountryCallingCode = normalizeCountryCallingCode(credentials.countryCallingCode);
  const normalizedPhoneNumber = normalizeNationalPhoneNumber(credentials.phoneNumber);
  const now = new Date();
  const roles = ['Admin'];

  return {
    token: `mock-token-${Date.now()}`,
    expiresAt: new Date(now.getTime() + DEFAULT_SESSION_DURATION_MS).toISOString(),
    user: {
      id: `${normalizedCountryCallingCode}${normalizedPhoneNumber}`,
      firstName: '',
      lastName: '',
      name: `${normalizedCountryCallingCode}${normalizedPhoneNumber}`,
      roles,
      countryCallingCode: normalizedCountryCallingCode,
      phoneNumber: normalizedPhoneNumber,
      phoneNumberVerified: true,
      phoneNumberVerifiedAt: now.toISOString(),
      latitude: null,
      longitude: null,
      permissions: getPermissionsForRoles(roles),
    },
  };
};

const validateCredentials = (credentials: LoginPayload): LoginPayload => {
  const normalizedCredentials = {
    countryCallingCode: normalizeCountryCallingCode(credentials.countryCallingCode),
    phoneNumber: normalizeNationalPhoneNumber(credentials.phoneNumber),
    password: credentials.password.trim(),
  };

  if (!normalizedCredentials.countryCallingCode || !normalizedCredentials.phoneNumber || !normalizedCredentials.password) {
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
