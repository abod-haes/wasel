import { ChevronLeft, Headphones, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { RodoBrandLogo } from '@/components/shared';
import { ROUTES } from '@/constants/routes';
import { PublicContentPage } from '@/features/content-pages/components/public-content-page';

/** Support slug is informational; it never creates tickets or submits chat. */
export default function SupportPage(): React.JSX.Element {
  return (
    <main dir="rtl" className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-5 py-8 sm:px-8 sm:py-12">
        <header className="rounded-3xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center justify-between gap-4">
            <RodoBrandLogo className="h-14 w-40" />
            <Link to={ROUTES.privacy} className="inline-flex items-center gap-1 text-sm text-primary">
              الخصوصية <ChevronLeft className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-5 flex items-center gap-2">
            <Headphones className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold">الدعم والتواصل</h1>
          </div>
        </header>

        <PublicContentPage slug="support" />

        <footer className="rounded-3xl border border-border bg-card p-5">
          <Link
            to={ROUTES.accountDeletion}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
          >
            <Trash2 className="h-4 w-4" /> إدارة حذف الحساب
          </Link>
        </footer>
      </div>
    </main>
  );
}
