import { Link } from 'react-router-dom';
import { RodoBrandLogo } from '@/components/shared';
import { PublicContentSection } from '@/features/content-pages/components/public-content-section';
import { ROUTES } from '@/constants/routes';

export default function HelpPage(): React.JSX.Element {
  return (
    <main dir="rtl" className="min-h-screen bg-background px-5 py-8 text-foreground">
      <div className="mx-auto flex max-w-4xl flex-col gap-5">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5">
          <RodoBrandLogo className="h-12 w-36" />
          <nav className="flex gap-4 text-sm text-primary">
            <Link to={ROUTES.privacy}>الخصوصية</Link>
            <Link to={ROUTES.support}>الدعم</Link>
          </nav>
        </header>
        <h1 className="text-2xl font-bold">المساعدة والأسئلة الشائعة</h1>
        <PublicContentSection slug="help" />
      </div>
    </main>
  );
}
