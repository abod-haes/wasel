import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  titleKey: string;
  descriptionKey?: string;
  actions?: ReactNode;
  className?: string;
}

export function SectionHeader({ titleKey, descriptionKey, actions, className }: SectionHeaderProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t(titleKey)}</h1>
        {descriptionKey ? <p className="mt-1 text-sm text-muted-foreground">{t(descriptionKey)}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
