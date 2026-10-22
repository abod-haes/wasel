import { create } from 'zustand';

import { env } from '@/env';
import { queryClient } from '@/lib/query-client';
import { authApi } from '@/services/auth/auth-api';
import {
  clearStoredAuthSession,
  isAuthSessionValid,
  loadStoredAuthSession,
  saveAuthSession,
} from '@/services/auth/auth-storage';
import type {
  AuthSession,
  AuthUser,
  LoginPayload,
  UpdateProfileInput,
} from '@/types/auth';

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
  expiresAt: string | null;
  login: (credentials: LoginPayload) => Promise<void>;
  refreshMe: () => Promise<void>;
  updateProfile: (input: UpdateProfileInput) => Promise<void>;
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
  refreshMe: async () => {
    const { token, expiresAt, user } = get();

    if (!token || !expiresAt || !user || env.enableMockApi) {
      return;
    }

    const refreshedUser = await authApi.getMe(token);

    // Ignore an old /me response after logout or a different user's login.
    // An in-flight response must never restore the previous session.
    if (get().token !== token || !get().isAuthenticated) return;

    const session: AuthSession = {
      token,
      expiresAt,
      user: refreshedUser,
    };

    saveAuthSession(session);
    set({ user: refreshedUser });
  },
  updateProfile: async (input) => {
    const { token, expiresAt, user } = get();

    if (!token || !expiresAt || !user) {
      return;
    }

    if (env.enableMockApi) {
      const firstName = input.firstName.trim();
      const lastName = input.lastName.trim();
      const updatedUser: AuthUser = {
        ...user,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim() || user.name,
      };
      const session: AuthSession = { token, expiresAt, user: updatedUser };
      saveAuthSession(session);
      set({ user: updatedUser });
      return;
    }

    await authApi.updateProfile(user.id, input);
    await get().refreshMe();
  },
  logout: () => {
    // Keep data from one account from appearing when another account signs in.
    // React Query cache may contain profile, orders, financial and user records.
    clearStoredAuthSession();
    queryClient.clear();
    set({ ...anonymousSnapshot });
  },
  checkAuth: () => {
    const storedSession = loadStoredAuthSession();
    const isSessionValid = isAuthSessionValid(storedSession);

    if (!isSessionValid) {
      if (get().isAuthenticated) {
        get().logout();
      } else {
        clearStoredAuthSession();
        queryClient.clear();
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
