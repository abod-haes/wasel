/** API target chosen for this browser. This is NOT Vite's build mode. */
export type ApiEnvironment = 'production' | 'development';

export const API_ENVIRONMENT_STORAGE_KEY = 'rodo:api-environment';
const DEFAULT_PRODUCTION_API_URL = 'https://prod.octoserv-comp.com';

const normalizeBaseUrl = (value: string | undefined): string | null => {
  if (!value?.trim()) return null;

  try {
    const url = new URL(value.trim());
    const isLocal = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    if (url.protocol !== 'https:' && !(import.meta.env.DEV && isLocal && url.protocol === 'http:')) {
      return null;
    }

    // Match the existing support for copying the Swagger page URL.
    url.pathname = url.pathname.replace(/\/swagger(?:\/index\.html?)?\/?$/i, '');
    url.search = '';
    url.hash = '';
    return url.toString().replace(/\/+$/, '');
  } catch {
    return null;
  }
};

export const productionApiBaseUrl =
  normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL) ?? DEFAULT_PRODUCTION_API_URL;

export const developmentApiBaseUrl = (() => {
  const url = normalizeBaseUrl(import.meta.env.VITE_DEV_API_BASE_URL);
  return url && url !== productionApiBaseUrl ? url : null;
})();

export const hasDevelopmentApi = developmentApiBaseUrl !== null;

export const getApiEnvironment = (): ApiEnvironment => {
  if (typeof window === 'undefined' || !hasDevelopmentApi) return 'production';
  return window.localStorage.getItem(API_ENVIRONMENT_STORAGE_KEY) === 'development'
    ? 'development'
    : 'production';
};

export const getActiveApiBaseUrl = (): string =>
  getApiEnvironment() === 'development' && developmentApiBaseUrl
    ? developmentApiBaseUrl
    : productionApiBaseUrl;

export const setApiEnvironment = (next: ApiEnvironment): boolean => {
  if (next === 'development' && !hasDevelopmentApi) return false;
  if (typeof window === 'undefined') return false;

  window.localStorage.setItem(API_ENVIRONMENT_STORAGE_KEY, next);
  return true;
};
