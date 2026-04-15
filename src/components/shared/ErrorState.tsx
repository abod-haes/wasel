import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button, Card, CardContent } from '@/components/ui';

interface ErrorStateProps {
  titleKey?: string;
  descriptionKey?: string;
  onRetry?: () => void;
}

export function ErrorState({
  titleKey = 'states.error.title',
  descriptionKey = 'states.error.description',
  onRetry,
}: ErrorStateProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <Card className="border-destructive/30">
      <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
        <div className="rounded-full bg-destructive/10 p-3">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <p className="text-base font-semibold">{t(titleKey)}</p>
        <p className="max-w-md text-sm text-muted-foreground">{t(descriptionKey)}</p>
        {onRetry ? (
          <Button variant="outline" onClick={onRetry}>
            {t('common.reset')}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
