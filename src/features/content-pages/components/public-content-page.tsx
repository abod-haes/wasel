import { useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui';
import { contentPagesApi } from '@/features/content-pages/api/content-pages-api';
import {
  CONTENT_PAGE_LABELS,
  type ContentPageSlug,
} from '@/features/content-pages/types/content-page-types';
import { sanitizeContentHtml } from '@/features/content-pages/utils/sanitize-content-html';

/** Public anonymous CMS content; never uses the authenticated dashboard client. */
export function PublicContentPage({ slug }: { slug: ContentPageSlug }): React.JSX.Element {
  const query = useQuery({
    queryKey: ['content-pages', 'public', slug],
    queryFn: () => contentPagesApi.getPublic(slug),
    staleTime: 60_000,
    retry: 1,
  });

  if (query.isPending) {
    return (
      <div className="space-y-4 rounded-3xl border border-border bg-card p-6" role="status">
        <div className="h-7 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (query.isError) {
    return (
      <section className="space-y-3 rounded-3xl border border-destructive/25 bg-card p-6">
        <h2 className="font-bold">تعذّر تحميل {CONTENT_PAGE_LABELS[slug]}</h2>
        <p className="text-sm text-muted-foreground">تحقق من اتصالك ثم أعد المحاولة.</p>
        <Button variant="outline" onClick={() => void query.refetch()}>إعادة المحاولة</Button>
      </section>
    );
  }

  if (!query.data?.html?.trim()) {
    return (
      <section className="space-y-2 rounded-3xl border border-border bg-card p-6">
        <h2 className="font-bold">هذه الصفحة غير متاحة حالياً</h2>
        <p className="text-sm text-muted-foreground">
          لم يتم إعداد محتوى {CONTENT_PAGE_LABELS[slug]} بعد.
        </p>
      </section>
    );
  }

  return (
    <article
      dir="rtl"
      className="break-words rounded-3xl border border-border bg-card p-5 text-sm leading-8 shadow-card sm:p-8 [&_a]:text-primary [&_a]:underline [&_h1]:mb-4 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mb-3 [&_h2]:mt-5 [&_h2]:text-xl [&_h2]:font-bold [&_h3]:mt-4 [&_h3]:font-bold [&_li]:mb-2 [&_ol]:list-decimal [&_ol]:ps-6 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:ps-6"
      dangerouslySetInnerHTML={{ __html: sanitizeContentHtml(query.data.html) }}
    />
  );
}
