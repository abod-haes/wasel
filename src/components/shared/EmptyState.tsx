import { Inbox } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Card, CardContent } from '@/components/ui';

interface EmptyStateProps {
  titleKey?: string;
  descriptionKey?: string;
}

export function EmptyState({
  titleKey = 'states.empty.title',
  descriptionKey = 'states.empty.description',
}: EmptyStateProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
        <div className="rounded-full bg-muted p-3">
          <Inbox className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-base font-semibold">{t(titleKey)}</p>
        <p className="max-w-md text-sm text-muted-foreground">{t(descriptionKey)}</p>
      </CardContent>
    </Card>
  );
}
