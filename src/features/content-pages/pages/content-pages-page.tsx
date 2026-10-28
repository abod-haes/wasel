import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Check, FileText, LoaderCircle, Save, ShieldAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { ErrorState, PageContainer } from '@/components/shared';
import { Button, Card, CardContent, CardHeader, CardTitle, Textarea } from '@/components/ui';
import { contentPagesApi } from '@/features/content-pages/api/content-pages-api';
import {
  CONTENT_PAGE_LABELS,
  CONTENT_PAGE_SLUGS,
  type AdminContentPage,
  type ContentPageSlug,
} from '@/features/content-pages/types/content-page-types';
import { sanitizeContentHtml } from '@/features/content-pages/utils/sanitize-content-html';
import { isAdminRole } from '@/services/auth/auth-roles';
import { useAuthStore } from '@/store/use-auth-store';

const ADMIN_KEY = ['content-pages', 'admin'] as const;
const MAX_HTML_LENGTH = 200_000;

function getSaveError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 401) return 'انتهت الجلسة. سجّل الدخول بحساب إداري من جديد.';
    if (status === 403) return 'ليس لديك صلاحية تعديل صفحات المحتوى.';
    if (status === 400) {
      const body = error.response?.data as { message?: string; title?: string; errors?: Record<string, string[]> } | undefined;
      const fieldError = Object.values(body?.errors ?? {}).flat()[0];
      return fieldError || body?.message || body?.title || 'المحتوى غير صالح. راجع النص وحاول مجدداً.';
    }
    if (!error.response) return 'تعذر الاتصال بالسيرفر. احتفظنا بالمسودة ويمكنك إعادة المحاولة.';
  }
  return 'تعذر حفظ المحتوى. بقيت المسودة كما هي؛ حاول مجدداً.';
}

/**
 * Backend has no create/post/publish endpoint. The first PUT creates the fixed
 * slug and subsequent PUTs update it. No legal or support template is seeded.
 */
export default function ContentPagesPage(): React.JSX.Element {
  const user = useAuthStore((state) => state.user);
  const roles = user?.roles ?? [];
  const queryClient = useQueryClient();
  const [slug, setSlug] = useState<ContentPageSlug>('privacy');
  const [draft, setDraft] = useState('');
  const [dirty, setDirty] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [preview, setPreview] = useState(false);

  const adminQuery = useQuery({
    queryKey: ADMIN_KEY,
    queryFn: contentPagesApi.listAdmin,
    enabled: isAdminRole(roles),
    retry: 1,
  });
  const pages = adminQuery.data ?? [];
  const selected = pages.find((item) => item.slug === slug);

  useEffect(() => {
    if (!dirty) setDraft(selected?.html ?? '');
  }, [selected?.html, slug, dirty]);

  const saveMutation = useMutation({
    mutationFn: (input: { slug: ContentPageSlug; html: string }) =>
      contentPagesApi.save(input.slug, input.html),
    onSuccess: (saved) => {
      queryClient.setQueryData<AdminContentPage[]>(ADMIN_KEY, (previous = []) => [
        ...previous.filter((page) => page.slug !== saved.slug),
        saved,
      ]);
      void queryClient.invalidateQueries({ queryKey: ['content-pages', 'public', saved.slug] });
      setDraft(saved.html); // backend sanitizer is authoritative
      setDirty(false);
      setSaveError('');
      toast.success('تم حفظ الصفحة ونشرها مباشرة.');
    },
    onError: (error: unknown) => {
      const message = getSaveError(error);
      setSaveError(message);
      toast.error(message);
    },
  });

  const selectPage = (next: ContentPageSlug) => {
    if (next === slug || saveMutation.isPending) return;
    if (dirty && !window.confirm('لديك تعديلات غير محفوظة. هل تريد الانتقال وإهمال المسودة؟')) return;
    setSlug(next);
    setDraft(pages.find((item) => item.slug === next)?.html ?? '');
    setDirty(false);
    setSaveError('');
    setPreview(false);
  };

  const save = () => {
    if (saveMutation.isPending) return;
    const content = draft.replace(/<[^>]*>/g, '').replace(/&nbsp;/gi, ' ').trim();
    if (!content || draft.length > MAX_HTML_LENGTH) {
      setSaveError('أدخل محتوى HTML نصياً غير فارغ، وبحد أقصى 200,000 حرف.');
      return;
    }
    setSaveError('');
    saveMutation.mutate({ slug, html: draft });
  };

  if (!isAdminRole(roles)) {
    return (
      <PageContainer>
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5 text-destructive">
          هذه الصفحة مخصصة لحساب Admin أو SuperAdmin فقط.
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <header className="space-y-2" dir="rtl">
        <h1 className="text-2xl font-bold">صفحات المحتوى</h1>
        <p className="text-sm leading-7 text-muted-foreground">
          أضف سياسة الخصوصية والمساعدة ومعلومات الدعم بعد اعتماد النصوص رسمياً.
          أول حفظ عبر PUT ينشئ الصفحة؛ أي تعديل لاحق ينشر فوراً، بدون زر نشر منفصل.
        </p>
      </header>

      {adminQuery.isPending ? (
        <div className="flex items-center gap-2 p-5 text-sm text-muted-foreground">
          <LoaderCircle className="h-5 w-5 animate-spin" /> جاري تحميل الصفحات...
        </div>
      ) : adminQuery.isError ? (
        <div className="space-y-3">
          <p className="text-sm text-destructive">{getSaveError(adminQuery.error)}</p>
          <ErrorState onRetry={() => void adminQuery.refetch()} />
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(230px,0.8fr)_minmax(0,2fr)]" dir="rtl">
          <div className="space-y-3">
            {CONTENT_PAGE_SLUGS.map((item) => {
              const page = pages.find((entry) => entry.slug === item);
              return (
                <button
                  type="button"
                  key={item}
                  onClick={() => selectPage(item)}
                  className={`flex min-h-24 w-full flex-col gap-2 rounded-2xl border p-4 text-right transition ${slug === item ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/40'}`}
                  aria-pressed={slug === item}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-bold">{CONTENT_PAGE_LABELS[item]}</span>
                    {page ? <Check className="h-4 w-4 text-emerald-600" /> : <FileText className="h-4 w-4 text-muted-foreground" />}
                  </span>
                  <span className={`text-xs ${page ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                    {page ? 'مهيأة — تعديل المحتوى' : 'غير مهيأة — إضافة المحتوى'}
                  </span>
                </button>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-3 text-lg">
                <span>{CONTENT_PAGE_LABELS[slug]}</span>
                <span className="text-xs font-normal text-muted-foreground">{selected ? 'تعديل المحتوى' : 'إضافة المحتوى'}</span>
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {selected?.updatedAt ? `آخر تحديث: ${new Date(selected.updatedAt).toLocaleString('ar-SY')}` : 'لم يُحفظ محتوى لهذه الصفحة بعد'}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label htmlFor="content-html" className="text-sm font-medium">المحتوى المعتمد (HTML)</label>
                <span className="text-xs text-muted-foreground" dir="ltr">{draft.length.toLocaleString('en-US')} / 200,000</span>
              </div>
              <Textarea
                id="content-html"
                dir="rtl"
                className="min-h-[280px] font-mono text-sm leading-7"
                value={draft}
                onChange={(event) => {
                  setDraft(event.target.value);
                  setDirty(true);
                  setSaveError('');
                }}
                placeholder="ألصق النص المعتمد بصيغة HTML، مثل <h2>عنوان</h2><p>محتوى معتمد...</p>"
                disabled={saveMutation.isPending}
                aria-invalid={Boolean(saveError)}
                maxLength={MAX_HTML_LENGTH + 1}
              />
              <div className="flex items-start gap-2 rounded-xl border border-amber-400/25 bg-amber-400/5 p-3 text-xs leading-6 text-muted-foreground">
                <ShieldAlert className="mt-1 h-4 w-4 shrink-0" />
                لا تُدرج نصوصاً قانونية تجريبية. السيرفر ينظّف HTML عند الحفظ،
                وسيظهر النص المُعاد من السيرفر بدل النص المرسل.
              </div>

              {saveError && <p role="alert" className="text-sm text-destructive">{saveError}</p>}

              <div className="flex flex-wrap gap-2">
                <Button onClick={save} disabled={saveMutation.isPending || !dirty || !draft.trim()}>
                  {saveMutation.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  حفظ
                </Button>
                <Button type="button" variant="outline" onClick={() => setPreview((value) => !value)}>
                  {preview ? 'إغلاق المعاينة' : 'معاينة آمنة'}
                </Button>
              </div>

              {preview ? (
                <section className="space-y-2 border-t pt-4">
                  <h3 className="text-sm font-bold">معاينة HTML بعد تصفية العناصر الخطرة</h3>
                  <div
                    className="prose max-w-none break-words rounded-xl border bg-background p-4 leading-7 dark:prose-invert"
                    dir="rtl"
                    dangerouslySetInnerHTML={{ __html: sanitizeContentHtml(draft) }}
                  />
                </section>
              ) : null}
            </CardContent>
          </Card>
        </div>
      )}
    </PageContainer>
  );
}
