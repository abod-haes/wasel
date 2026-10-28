import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import {
  contentPagesApi,
  type ContentPageSlug,
} from '@/features/content-pages/api/content-pages-api';
import { sanitizeContentHtml } from '@/features/content-pages/utils/sanitize-content-html';

export function PublicContentSection({ slug }: { slug: ContentPageSlug }): React.JSX.Element {
  const query = useQuery({
    queryKey: ['content-pages', 'public', slug],
    queryFn: () => contentPagesApi.getPublic(slug),
    retry: 1,
    staleTime: 30_000,
  });

  if (query.isPending) {
    return <section className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">عم نحمّل المحتوى...</section>;
  }
  if (query.isError) {
    return (
      <section className="rounded-2xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">تعذر تحميل المحتوى من السيرفر.</p>
        <button type="button" className="mt-3 text-primary underline" onClick={() => void query.refetch()}>إعادة المحاولة</button>
      </section>
    );
  }
  if (!query.data?.html?.trim()) {
    return (
      <section className="rounded-2xl border border-border bg-card p-6">
        <p className="font-semibold">المحتوى غير متوفر حالياً</p>
        <p className="mt-2 text-sm text-muted-foreground">لم يتم إعداد هذه الصفحة بعد. فيك ترجع لاحقاً أو تتواصل مع الدعم.</p>
        {slug !== 'support' ? <Link to="/support" className="mt-3 inline-block text-sm text-primary underline">معلومات الدعم</Link> : null}
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-7">
      <div className="mb-4 text-xs font-semibold text-muted-foreground">المحتوى المعتمد من إدارة رودو</div>
      <div
        className="space-y-3 break-words text-right leading-8 text-foreground [&_a]:text-primary [&_a]:underline [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-bold [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pe-6 [&_ol]:list-decimal [&_ol]:pe-6"
        dir="rtl"
        dangerouslySetInnerHTML={{ __html: sanitizeContentHtml(query.data.html) }}
      />
    </section>
  );
}
