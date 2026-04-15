import { env } from '@/env';
import type { LanguageCode } from '@/types/i18n';

export const APP_NAME = env.appName;

export const THEME_STORAGE_KEY = 'dashboard-theme';
export const LANGUAGE_STORAGE_KEY = 'wasel-language';

export const DEFAULT_LANGUAGE: LanguageCode = 'ar';

export const LANGUAGE_DIRECTION_MAP: Record<LanguageCode, 'ltr' | 'rtl'> = {
  en: 'ltr',
  ar: 'rtl',
};

export const SUPPORTED_LANGUAGES: Array<{
  code: LanguageCode;
  labelKey: string;
}> = [
  {
    code: 'ar',
    labelKey: 'language.arabic',
  },
];
