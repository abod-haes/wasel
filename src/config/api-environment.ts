/**
 * API base URL is selected by the Vite deployment configuration.
 * Dashboard visitors cannot switch a running production deployment to a
 * different backend with a stored browser preference.
 */
const DEFAULT_API_URL = 'https://prod.octoserv-comp.com';

const normalizeBaseUrl = (value: string | undefined): string | null => {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value.trim());
    const isLocal = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    if (url.protocol !== 'https:' && !(import.meta.env.DEV && isLocal && url.protocol === 'http:')) {
      return null;
    }
    url.pathname = url.pathname.replace(/\/swagger(?:\/index\.html?)?\/?$/i, '');
    url.search = '';
    url.hash = '';
    return url.toString().replace(/\/+$/, '');
  } catch {
    return null;
  }
};

export const productionApiBaseUrl =
  normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL) ?? DEFAULT_API_URL;

export const getActiveApiBaseUrl = (): string => productionApiBaseUrl;
