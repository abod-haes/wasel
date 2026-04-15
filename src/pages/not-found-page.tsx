import { FileWarning } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '@/constants/routes';
import { Button, Card, CardContent } from '@/components/ui';

export default function NotFoundPage(): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <div className="container py-12">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
          <div className="rounded-full bg-muted p-3">
            <FileWarning className="h-7 w-7 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-semibold">{t('pages.notFound.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('pages.notFound.description')}</p>
          <Button asChild variant="outline">
            <Link to={ROUTES.dashboard}>{t('nav.dashboard')}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
