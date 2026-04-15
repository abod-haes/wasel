export const queryKeys = {
  dashboard: {
    root: ['dashboard'] as const,
    summary: () => ['dashboard', 'summary'] as const,
  },
  users: {
    root: ['users'] as const,
    list: (filters: unknown) => ['users', 'list', filters] as const,
    detail: (userId: string) => ['users', 'detail', userId] as const,
  },
  products: {
    root: ['products'] as const,
    list: (filters: unknown) => ['products', 'list', filters] as const,
  },
  categories: {
    root: ['categories'] as const,
    list: (filters: unknown) => ['categories', 'list', filters] as const,
    options: () => ['categories', 'options'] as const,
  },
  orders: {
    root: ['orders'] as const,
    list: (filters: unknown) => ['orders', 'list', filters] as const,
  },
  notifications: {
    root: ['notifications'] as const,
    list: (filters: unknown) => ['notifications', 'list', filters] as const,
  },
  settings: {
    root: ['settings'] as const,
    profile: () => ['settings', 'profile'] as const,
  },
} as const;
