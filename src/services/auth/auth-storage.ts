import { getPermissionsForRoles, getRolesFromToken } from '@/services/auth/auth-roles';
import type { AuthSession } from '@/types/auth';

import { getApiEnvironment } from '@/config/api-environment';

const LEGACY_TOKEN_KEY = 'token';
const authSessionKey = (): string =>
  getApiEnvironment() === 'development' ? 'rodo_dev_auth_session' : 'wasel_auth_session';
const tokenKey = (): string =>
  getApiEnvironment() === 'development' ? 'rodo_dev_token' : 'wasel_token';

const hasWindow = (): boolean => typeof window !== 'undefined';


const parseStoredSession = (rawValue: string): AuthSession | null => {
  try {
    const parsed = JSON.parse(rawValue) as Partial<AuthSession>;

    if (typeof parsed.token !== 'string' || typeof parsed.expiresAt !== 'string') {
      return null;
    }

    if (!parsed.user || typeof parsed.user !== 'object') {
      return null;
    }

    const user = parsed.user as Partial<AuthSession['user']>;
    if (typeof user.id !== 'string') {
      return null;
    }

    const roles = getRolesFromToken(parsed.token);

    return {
      token: parsed.token,
      expiresAt: parsed.expiresAt,
      user: {
        id: user.id,
        firstName: typeof user.firstName === 'string' ? user.firstName : '',
        lastName: typeof user.lastName === 'string' ? user.lastName : '',
        name: typeof user.name === 'string' ? user.name : '',
        roles,
        countryCallingCode:
          typeof user.countryCallingCode === 'string' ? user.countryCallingCode : '+963',
        phoneNumber: typeof user.phoneNumber === 'string' ? user.phoneNumber : '',
        phoneNumberVerified: typeof user.phoneNumberVerified === 'boolean' ? user.phoneNumberVerified : false,
        phoneNumberVerifiedAt:
          typeof user.phoneNumberVerifiedAt === 'string' ? user.phoneNumberVerifiedAt : null,
        latitude: typeof user.latitude === 'number' ? user.latitude : null,
        longitude: typeof user.longitude === 'number' ? user.longitude : null,
        permissions: getPermissionsForRoles(roles),
      },
    };
  } catch {
    return null;
  }
};

export const isAuthSessionExpired = (expiresAt: string): boolean => {
  const parsedTimestamp = Date.parse(expiresAt);

  if (Number.isNaN(parsedTimestamp)) {
    return true;
  }

  return parsedTimestamp <= Date.now();
};

export const isAuthSessionValid = (session: AuthSession | null): session is AuthSession => {
  if (!session) {
    return false;
  }

  if (session.token.trim().length === 0 || session.user.id.trim().length === 0) {
    return false;
  }

  return !isAuthSessionExpired(session.expiresAt);
};

export const loadStoredAuthSession = (): AuthSession | null => {
  if (!hasWindow()) {
    return null;
  }

  const rawSession = window.localStorage.getItem(authSessionKey());
  if (!rawSession) {
    return null;
  }

  const parsedSession = parseStoredSession(rawSession);
  if (!parsedSession) {
    clearStoredAuthSession();
  }

  return parsedSession;
};

export const getStoredAuthToken = (): string | null => {
  const storedSession = loadStoredAuthSession();
  if (isAuthSessionValid(storedSession)) {
    return storedSession.token;
  }

  if (!hasWindow()) {
    return null;
  }

  return getApiEnvironment() === 'development'
    ? window.localStorage.getItem(tokenKey())
    : window.localStorage.getItem(tokenKey()) ?? window.localStorage.getItem(LEGACY_TOKEN_KEY);
};

export const saveAuthSession = (session: AuthSession): void => {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.setItem(authSessionKey(), JSON.stringify(session));
  window.localStorage.setItem(tokenKey(), session.token);
  if (getApiEnvironment() === 'production') {
    window.localStorage.setItem(LEGACY_TOKEN_KEY, session.token);
  }
};

export const clearStoredAuthSession = (): void => {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.removeItem(authSessionKey());
  window.localStorage.removeItem(tokenKey());
  if (getApiEnvironment() === 'production') {
    window.localStorage.removeItem(LEGACY_TOKEN_KEY);
  }
};
