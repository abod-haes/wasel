import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '@/constants/routes';
import { Button, Card, CardContent } from '@/components/ui';

export default function UnauthorizedPage(): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <div className="container py-12">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
          <div className="rounded-full bg-destructive/10 p-3">
            <ShieldAlert className="h-7 w-7 text-destructive" />
          </div>
          <h1 className="text-2xl font-semibold">{t('pages.unauthorized.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('pages.unauthorized.description')}</p>
          <Button asChild variant="outline">
            <Link to={ROUTES.dashboard}>{t('nav.dashboard')}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
