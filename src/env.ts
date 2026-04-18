const toBoolean = (value: string | undefined, fallback = false): boolean => {
  if (value == null) {
    return fallback;
  }

  return value.toLowerCase() === 'true';
};

const API_BASE_URL = 'https://prod.octoserv-comp.com';

const removeTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

const normalizeApiBaseUrl = (value: string | undefined): string => {
  const fallback = 'https://api.example.com';
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    return fallback;
  }

  try {
    const parsedUrl = new URL(normalizedValue);
    const swaggerPathPattern = /^(.*)\/swagger(?:\/index\.html?)?\/?$/i;
    const swaggerMatch = parsedUrl.pathname.match(swaggerPathPattern);

    if (swaggerMatch) {
      parsedUrl.pathname = swaggerMatch[1] || '/';
    }

    parsedUrl.search = '';
    parsedUrl.hash = '';

    return removeTrailingSlash(parsedUrl.toString());
  } catch {
    return removeTrailingSlash(normalizedValue);
  }
};

export const env = {
  appName: import.meta.env.VITE_APP_NAME ?? 'Wasel',
  apiBaseUrl: normalizeApiBaseUrl(API_BASE_URL),
  enableMockApi: toBoolean(import.meta.env.VITE_ENABLE_MOCK_API, true),
} as const;
