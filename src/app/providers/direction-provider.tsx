import { useLayoutEffect, type PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';

import { DEFAULT_LANGUAGE, LANGUAGE_DIRECTION_MAP } from '@/constants/app';
import type { LanguageCode } from '@/types/i18n';

export function DirectionProvider({ children }: PropsWithChildren): React.JSX.Element {
  const { i18n } = useTranslation();

  useLayoutEffect(() => {
    const normalizedLanguage: LanguageCode = i18n.language.startsWith('ar') ? 'ar' : DEFAULT_LANGUAGE;
    const direction = LANGUAGE_DIRECTION_MAP[normalizedLanguage];

    document.documentElement.lang = normalizedLanguage;
    document.documentElement.dir = direction;
    document.body.dir = direction;
  }, [i18n.language]);

  return <>{children}</>;
}
