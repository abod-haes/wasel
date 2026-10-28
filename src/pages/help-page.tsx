import { ChevronLeft, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

import { RodoBrandLogo } from '@/components/shared';
import { ROUTES } from '@/constants/routes';
import { PublicContentPage } from '@/features/content-pages/components/public-content-page';

export default function HelpPage(): React.JSX.Element {
  return (
    <main dir="rtl" className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-5 py-8 sm:px-8 sm:py-12">
        <header className="rounded-3xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center justify-between gap-4">
            <RodoBrandLogo className="h-14 w-40" />
            <Link to={ROUTES.support} className="inline-flex items-center gap-1 text-sm text-primary">
              الدعم <ChevronLeft className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-5 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold">المساعدة والأسئلة الشائعة</h1>
          </div>
        </header>

        <PublicContentPage slug="help" />
      </div>
    </main>
  );
}
