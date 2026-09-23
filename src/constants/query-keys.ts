export const queryKeys = {
  dashboard: {
    root: ['dashboard'] as const,
    summary: () => ['dashboard', 'summary'] as const,
    marketSummary: (marketUserId: string) => ['dashboard', 'market-summary', marketUserId] as const,
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
  otpAdmin: {
    root: ['otp-admin'] as const,
    summary: () => ['otp-admin', 'summary'] as const,
    session: () => ['otp-admin', 'session'] as const,
    requests: (pagination: unknown) => ['otp-admin', 'requests', pagination] as const,
    request: (requestId: string) => ['otp-admin', 'request', requestId] as const,
    auditLogs: (pagination: unknown) => ['otp-admin', 'audit-logs', pagination] as const,
    clients: () => ['otp-admin', 'clients'] as const,
    apiKeys: () => ['otp-admin', 'api-keys'] as const,
  },
  settings: {
    root: ['settings'] as const,
    profile: () => ['settings', 'profile'] as const,
    currency: () => ['settings', 'currency'] as const,
    deliveryPricing: () => ['settings', 'delivery-pricing'] as const,
  },
} as const;
