import { create } from 'zustand';

import { authApi } from '@/services/auth/auth-api';
import {
  clearStoredAuthSession,
  isAuthSessionValid,
  loadStoredAuthSession,
  saveAuthSession,
} from '@/services/auth/auth-storage';
import type { AuthSession, AuthUser, LoginPayload } from '@/types/auth';

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
  expiresAt: string | null;
  login: (credentials: LoginPayload) => Promise<void>;
  logout: () => void;
  checkAuth: () => boolean;
}

interface AuthSnapshot {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
  expiresAt: string | null;
}

const anonymousSnapshot: AuthSnapshot = {
  isAuthenticated: false,
  user: null,
  token: null,
  expiresAt: null,
};

const mapSessionToSnapshot = (session: AuthSession): AuthSnapshot => {
  return {
    isAuthenticated: true,
    user: session.user,
    token: session.token,
    expiresAt: session.expiresAt,
  };
};

const resolveInitialSnapshot = (): AuthSnapshot => {
  const storedSession = loadStoredAuthSession();

  if (!isAuthSessionValid(storedSession)) {
    clearStoredAuthSession();
    return anonymousSnapshot;
  }

  return mapSessionToSnapshot(storedSession);
};

const initialSnapshot = resolveInitialSnapshot();

export const useAuthStore = create<AuthState>((set, get) => ({
  ...initialSnapshot,
  login: async (credentials) => {
    const session = await authApi.login(credentials);
    saveAuthSession(session);
    set(mapSessionToSnapshot(session));
  },
  logout: () => {
    clearStoredAuthSession();
    set({ ...anonymousSnapshot });
  },
  checkAuth: () => {
    const storedSession = loadStoredAuthSession();
    const isSessionValid = isAuthSessionValid(storedSession);

    if (!isSessionValid) {
      clearStoredAuthSession();

      if (get().isAuthenticated) {
        set({ ...anonymousSnapshot });
      }

      return false;
    }

    const currentState = get();
    if (
      currentState.token !== storedSession.token ||
      currentState.expiresAt !== storedSession.expiresAt ||
      currentState.user?.id !== storedSession.user.id
    ) {
      set(mapSessionToSnapshot(storedSession));
    }

    return true;
  },
}));
