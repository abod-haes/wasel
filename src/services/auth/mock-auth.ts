import { useAuthStore } from '@/store/use-auth-store';

export const authService = {
  getCurrentUser: () => useAuthStore.getState().user,
  isAuthenticated: () => useAuthStore.getState().isAuthenticated,
};
