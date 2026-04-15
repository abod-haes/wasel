import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { DEFAULT_LANGUAGE } from '@/constants/app';
import arCommon from '@/i18n/locales/ar/common.json';

void i18n
  .use(initReactI18next)
  .init({
    resources: {
      ar: {
        translation: arCommon,
      },
    },
    lng: DEFAULT_LANGUAGE,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: ['ar'],
    defaultNS: 'translation',
    ns: ['translation'],
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
