export const queryKeys = {
  dashboard: {
    root: ['dashboard'] as const,
    summary: () => ['dashboard', 'summary'] as const,
  },
  users: {
    root: ['users'] as const,
    list: (filters: unknown) => ['users', 'list', filters] as const,
    detail: (userId: string) => ['users', 'detail', userId] as const,
    roles: () => ['users', 'roles'] as const,
    markets: () => ['users', 'markets'] as const,
  },
  brands: {
    root: ['brands'] as const,
    list: (filters: unknown) => ['brands', 'list', filters] as const,
    options: () => ['brands', 'options'] as const,
  },
  products: {
    root: ['products'] as const,
    list: (filters: unknown) => ['products', 'list', filters] as const,
    detail: (productId: string) => ['products', 'detail', productId] as const,
    variants: (productId: string) => ['products', 'variants', productId] as const,
    brief: () => ['products', 'brief'] as const,
  },
  categories: {
    root: ['categories'] as const,
    list: (filters: unknown) => ['categories', 'list', filters] as const,
    options: () => ['categories', 'options'] as const,
    tree: () => ['categories', 'tree'] as const,
  },
  ads: {
    root: ['ads'] as const,
    list: () => ['ads', 'list'] as const,
    detail: (adId: string) => ['ads', 'detail', adId] as const,
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
    currency: () => ['settings', 'currency'] as const,
  },
} as const;
