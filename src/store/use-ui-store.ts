import { create } from 'zustand';

interface UiState {
  isSidebarCollapsed: boolean;
  isMobileSidebarOpen: boolean;
  unreadNotificationsCount: number;
  toggleSidebarCollapse: () => void;
  setMobileSidebarOpen: (isOpen: boolean) => void;
  markNotificationsAsRead: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  isSidebarCollapsed: false,
  isMobileSidebarOpen: false,
  unreadNotificationsCount: 3,
  toggleSidebarCollapse: () => {
    set((state) => ({
      isSidebarCollapsed: !state.isSidebarCollapsed,
    }));
  },
  setMobileSidebarOpen: (isOpen) => {
    set({
      isMobileSidebarOpen: isOpen,
    });
  },
  markNotificationsAsRead: () => {
    set({
      unreadNotificationsCount: 0,
    });
  },
}));
