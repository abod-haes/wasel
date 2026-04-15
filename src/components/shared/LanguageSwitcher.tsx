import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { SUPPORTED_LANGUAGES } from '@/constants/app';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import type { LanguageCode } from '@/types/i18n';

interface LanguageSwitcherProps {
  compact?: boolean;
}

export function LanguageSwitcher({ compact = false }: LanguageSwitcherProps): React.JSX.Element {
  const { t, i18n } = useTranslation();
  const currentLanguage: LanguageCode = i18n.language.startsWith('ar') ? 'ar' : 'en';

  if (SUPPORTED_LANGUAGES.length <= 1) {
    return <></>;
  }

  const handleLanguageChange = (languageCode: string): void => {
    void i18n.changeLanguage(languageCode as LanguageCode);
  };

  return (
    <div className="flex items-center gap-2">
      {!compact ? <Languages className="h-4 w-4 text-muted-foreground" /> : null}
      <Select value={currentLanguage} onValueChange={handleLanguageChange}>
        <SelectTrigger className={compact ? 'h-9 w-[72px]' : 'h-9 w-[130px]'}>
          <SelectValue placeholder={t('language.label')} />
        </SelectTrigger>
        <SelectContent>
          {SUPPORTED_LANGUAGES.map((language) => (
            <SelectItem key={language.code} value={language.code}>
              {t(language.labelKey)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
