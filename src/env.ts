import { getActiveApiBaseUrl } from '@/config/api-environment';

const toBoolean = (value: string | undefined, fallback = false): boolean => {
  if (value == null) {
    return fallback;
  }

  return value.toLowerCase() === 'true';
};

export const env = {
  appName: import.meta.env.VITE_APP_NAME ?? 'RODO',
  apiBaseUrl: getActiveApiBaseUrl(),
  enableMockApi: toBoolean(import.meta.env.VITE_ENABLE_MOCK_API, false),
  supportEmail: import.meta.env.VITE_SUPPORT_EMAIL?.trim() || undefined,
  googleMapsBrowserApiKey: import.meta.env.VITE_GOOGLE_MAPS_BROWSER_API_KEY?.trim() || '',
} as const;
