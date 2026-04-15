import type { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';

import { Label } from '@/components/ui';
import { cn } from '@/lib/utils';

interface FormFieldProps extends PropsWithChildren {
  labelKey: string;
  htmlFor?: string;
  descriptionKey?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

export function FormField({
  labelKey,
  htmlFor,
  descriptionKey,
  error,
  required = false,
  className,
  children,
}: FormFieldProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={htmlFor}>
        {t(labelKey)}
        {required ? <span className="ms-1 text-destructive">*</span> : null}
      </Label>
      {children}
      {descriptionKey ? <p className="text-xs text-muted-foreground">{t(descriptionKey)}</p> : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
