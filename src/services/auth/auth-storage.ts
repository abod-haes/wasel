import type { AuthSession } from '@/types/auth';

const AUTH_SESSION_KEY = 'wasel_auth_session';
const TOKEN_KEY = 'wasel_token';
const LEGACY_TOKEN_KEY = 'token';

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

    return {
      token: parsed.token,
      expiresAt: parsed.expiresAt,
      user: {
        id: user.id,
        firstName: typeof user.firstName === 'string' ? user.firstName : '',
        lastName: typeof user.lastName === 'string' ? user.lastName : '',
        name: typeof user.name === 'string' ? user.name : '',
        email: typeof user.email === 'string' ? user.email : '',
        phoneNumber: typeof user.phoneNumber === 'string' ? user.phoneNumber : '',
        phoneNumberVerified: typeof user.phoneNumberVerified === 'boolean' ? user.phoneNumberVerified : false,
        phoneNumberVerifiedAt:
          typeof user.phoneNumberVerifiedAt === 'string' ? user.phoneNumberVerifiedAt : null,
        latitude: typeof user.latitude === 'number' ? user.latitude : null,
        longitude: typeof user.longitude === 'number' ? user.longitude : null,
        permissions: Array.isArray(user.permissions) ? user.permissions : [],
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

  const rawSession = window.localStorage.getItem(AUTH_SESSION_KEY);
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

  return window.localStorage.getItem(TOKEN_KEY) ?? window.localStorage.getItem(LEGACY_TOKEN_KEY);
};

export const saveAuthSession = (session: AuthSession): void => {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  window.localStorage.setItem(TOKEN_KEY, session.token);
  window.localStorage.setItem(LEGACY_TOKEN_KEY, session.token);
};

export const clearStoredAuthSession = (): void => {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.removeItem(AUTH_SESSION_KEY);
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(LEGACY_TOKEN_KEY);
};
