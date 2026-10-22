import { create } from 'zustand';

import type { IncomingPushNotification } from '@/features/push/push-notification-utils';

type ConnectionState = 'idle' | 'connecting' | 'active' | 'unavailable' | 'error' | 'denied';
interface PushInboxState {
  ownerId: string | null;
  items: IncomingPushNotification[];
  connection: ConnectionState;
  error: string | null;
  bindUser: (userId: string | null) => void;
  receive: (notification: IncomingPushNotification) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  setConnection: (state: ConnectionState, error?: string | null) => void;
}

export const usePushInboxStore = create<PushInboxState>((set) => ({
  ownerId: null,
  items: [],
  connection: 'idle',
  error: null,
  bindUser: (userId) => set((state) => {
    if (state.ownerId === userId) return state;
    // Never let one shop/admin account see a previous account's alerts.
    return { ownerId: userId, items: [], connection: 'idle', error: null };
  }),
  receive: (notification) => set((state) => {
    if (!state.ownerId || state.items.some((item) => item.id === notification.id)) return state;
    return { items: [notification, ...state.items].slice(0, 50) };
  }),
  markRead: (id) => set((state) => ({
    items: state.items.map((item) => item.id === id ? { ...item, read: true } : item),
  })),
  markAllRead: () => set((state) => ({
    items: state.items.map((item) => ({ ...item, read: true })),
  })),
  setConnection: (connection, error = null) => set({ connection, error }),
}));
