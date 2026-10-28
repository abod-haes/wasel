import { Link, useParams } from 'react-router-dom';

import {
  CONTENT_SLUGS,
  type ContentPageSlug,
} from '@/features/content-pages/api/content-pages-api';
import { PublicContentSection } from '@/features/content-pages/components/public-content-section';
import { ROUTES } from '@/constants/routes';
import { RodoBrandLogo } from '@/components/shared';

const titles: Record<ContentPageSlug, string> = {
  privacy: 'سياسة الخصوصية',
  help: 'المساعدة والأسئلة الشائعة',
  support: 'معلومات الدعم والتواصل',
};

/** Dedicated public API-backed routes independent of static store listing pages. */
export default function PublicContentPage(): React.JSX.Element {
  const { slug } = useParams<{ slug: string }>();
  if (!slug || !CONTENT_SLUGS.some((entry) => entry === slug)) {
    return (
      <main dir="rtl" className="mx-auto max-w-3xl p-8">
        <h1 className="text-xl font-semibold">الصفحة غير موجودة</h1>
        <Link to={ROUTES.support} className="mt-4 inline-block text-primary underline">الدعم</Link>
      </main>
    );
  }

  const pageSlug = slug as ContentPageSlug;
  return (
    <main dir="rtl" className="min-h-screen bg-background px-4 py-8 text-foreground">
      <div className="mx-auto flex max-w-4xl flex-col gap-5">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5">
          <RodoBrandLogo className="h-12 w-36" />
          <Link to={ROUTES.support} className="text-sm text-primary underline">معلومات الدعم</Link>
        </header>
        <h1 className="text-2xl font-bold">{titles[pageSlug]}</h1>
        <PublicContentSection slug={pageSlug} />
      </div>
    </main>
  );
}
