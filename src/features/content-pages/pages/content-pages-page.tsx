import axios from 'axios';
import { CheckCircle2, Code2, FileText, HelpCircle, Loader2, RefreshCw, Save, ShieldCheck, Headset } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { PageContainer, SectionHeader } from '@/components/shared';
import { Badge, Button, Card, CardContent, Label, Textarea } from '@/components/ui';
import {
  CONTENT_SLUGS,
  contentPagesApi,
  type AdminContentPage,
  type ContentPageSlug,
} from '@/features/content-pages/api/content-pages-api';
import { sanitizeContentHtml } from '@/features/content-pages/utils/sanitize-content-html';

const icons = { privacy: ShieldCheck, help: HelpCircle, support: Headset } as const;

function describeError(error: unknown, t: (key: string) => string): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 401) return t('contentPages.errors.unauthorized');
    if (status === 403) return t('contentPages.errors.forbidden');
    if (status === 400) {
      const body = error.response?.data as { message?: unknown; errors?: Record<string, unknown> } | undefined;
      if (body?.errors) {
        const messages = Object.values(body.errors).flat().filter((v): v is string => typeof v === 'string');
        if (messages.length) return messages.join(' ');
      }
      return typeof body?.message === 'string' ? body.message : t('contentPages.errors.validation');
    }
  }
  return t('contentPages.errors.network');
}

export default function ContentPagesPage(): React.JSX.Element {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<ContentPageSlug>('privacy');
  const [drafts, setDrafts] = useState<Partial<Record<ContentPageSlug, string>>>({});
  const [formError, setFormError] = useState('');

  const pages = useQuery({
    queryKey: ['content-pages', 'admin'],
    queryFn: contentPagesApi.list,
    staleTime: 20_000,
    refetchOnWindowFocus: false,
    retry: (attempt, error) => !axios.isAxiosError(error) || ![401, 403].includes(error.response?.status ?? 0)
      ? attempt < 1 : false,
  });

  const persisted = useMemo(
    () => new Map<ContentPageSlug, AdminContentPage>(
      (pages.data ?? [])
        .filter((page) => CONTENT_SLUGS.includes(page.slug))
        .map((page) => [page.slug, page]),
    ),
    [pages.data],
  );

  const saved = persisted.get(selected);
  const draft = drafts[selected] ?? saved?.html ?? '';
  const isDirty = draft !== (saved?.html ?? '');
  const canSave = draft.trim().length > 0 && draft.length <= 200_000 && isDirty;

  const save = useMutation({
    mutationFn: async ({ slug, html }: { slug: ContentPageSlug; html: string }) =>
      contentPagesApi.save(slug, html),
    onSuccess: (result, request) => {
      // Server sanitization may change HTML. Never show the submitted draft as saved.
      setDrafts((previous) => ({ ...previous, [request.slug]: result.html }));
      queryClient.setQueryData<AdminContentPage[]>(['content-pages', 'admin'], (previous = []) => [
        ...previous.filter((page) => page.slug !== request.slug),
        result,
      ]);
      void queryClient.invalidateQueries({ queryKey: ['content-pages', 'public', request.slug] });
      setFormError('');
      toast.success(t('contentPages.saved'));
    },
    onError: (error) => {
      // The editor remains untouched after errors (400/401/403/5xx).
      const message = describeError(error, t);
      setFormError(message);
      toast.error(message);
    },
  });

  const submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setFormError('');
    if (!draft.trim() || !draft.replace(/<[^>]*>/g, '').trim()) {
      setFormError(t('contentPages.errors.empty'));
      return;
    }
    if (draft.length > 200_000) {
      setFormError(t('contentPages.errors.tooLong'));
      return;
    }
    if (save.isPending || !isDirty) return;
    save.mutate({ slug: selected, html: draft });
  };

  if (pages.isPending) return (
    <PageContainer><SectionHeader titleKey="contentPages.title" descriptionKey="contentPages.description" />
      <div className="grid gap-4 lg:grid-cols-3">{CONTENT_SLUGS.map((slug) => <div key={slug} className="h-36 animate-pulse rounded-2xl bg-muted" />)}</div>
    </PageContainer>
  );

  if (pages.isError) return (
    <PageContainer><SectionHeader titleKey="contentPages.title" descriptionKey="contentPages.description" />
      <Card><CardContent className="space-y-3 p-6"><p role="alert" className="text-sm text-destructive">{describeError(pages.error, t)}</p>
        <Button type="button" variant="outline" onClick={() => void pages.refetch()}>{t('contentPages.retry')}</Button>
      </CardContent></Card>
    </PageContainer>
  );

  return (
    <PageContainer>
      <SectionHeader
        titleKey="contentPages.title"
        descriptionKey="contentPages.description"
        actions={<Button variant="outline" size="sm" onClick={() => void pages.refetch()} disabled={pages.isFetching || save.isPending}>
          <RefreshCw className="me-2 size-4" />{t('contentPages.reload')}
        </Button>}
      />
      <div className="grid gap-3 md:grid-cols-3">
        {CONTENT_SLUGS.map((slug) => {
          const page = persisted.get(slug);
          const Icon = icons[slug];
          const changed = (drafts[slug] ?? page?.html ?? '') !== (page?.html ?? '');
          return (
            <button
              type="button"
              key={slug}
              aria-pressed={selected === slug}
              onClick={() => { if (!save.isPending) { setSelected(slug); setFormError(''); } }}
              className={`rounded-2xl border p-4 text-start transition-colors ${selected === slug ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-card hover:border-primary/30'}`}
            >
              <div className="flex items-center justify-between gap-2">
                <Icon className="size-5 text-primary" aria-hidden />
                <Badge variant={page ? 'secondary' : 'outline'}>
                  {page ? t('contentPages.configured') : t('contentPages.notConfigured')}
                </Badge>
              </div>
              <h2 className="mt-3 font-semibold">{t(`contentPages.slugs.${slug}`)}</h2>
              <div className="mt-1 text-xs text-muted-foreground">{changed ? t('contentPages.unsaved') : page ? t('contentPages.edit') : t('contentPages.add')}</div>
            </button>
          );
        })}
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-2">
        <Card className="min-w-0">
          <CardContent className="space-y-4 p-4 sm:p-6">
            <div className="flex items-center gap-2">
              <Code2 className="size-5 text-primary" aria-hidden />
              <h3 className="font-semibold">{t(`contentPages.slugs.${selected}`)} — {saved ? t('contentPages.edit') : t('contentPages.add')}</h3>
            </div>
            <form onSubmit={submit} className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="content-pages-html">HTML</Label>
                <span className="text-xs tabular-nums text-muted-foreground">{draft.length.toLocaleString()} / 200,000</span>
              </div>
              <Textarea
                id="content-pages-html"
                dir="auto"
                spellCheck={false}
                value={draft}
                disabled={save.isPending}
                onChange={(event) => { setDrafts((previous) => ({ ...previous, [selected]: event.target.value })); setFormError(''); }}
                placeholder={t('contentPages.editorPlaceholder')}
                className="min-h-[290px] resize-y font-mono text-sm leading-7"
                aria-invalid={Boolean(formError)}
                aria-describedby={formError ? 'content-pages-error' : 'content-pages-hint'}
              />
              <p id="content-pages-hint" className="text-xs leading-6 text-muted-foreground">{t('contentPages.editorHint')}</p>
              {formError ? <p id="content-pages-error" role="alert" className="text-sm text-destructive">{formError}</p> : null}
              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" disabled={!canSave || save.isPending}>
                  {save.isPending ? <Loader2 className="me-2 size-4 animate-spin" /> : <Save className="me-2 size-4" />}
                  {t('contentPages.save')}
                </Button>
                {saved ? <span className="flex items-center gap-1 text-xs text-muted-foreground"><CheckCircle2 className="size-4 text-emerald-600" />{t('contentPages.savedState')}</span> : null}
              </div>
            </form>
            {saved?.updatedAt ? <p className="text-xs text-muted-foreground">{t('contentPages.lastUpdated')}: {new Date(saved.updatedAt).toLocaleString()}</p> : null}
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardContent className="space-y-4 p-4 sm:p-6">
            <div className="flex items-center gap-2">
              <FileText className="size-5 text-primary" aria-hidden />
              <h3 className="font-semibold">{t('contentPages.preview')}</h3>
            </div>
            <p className="text-xs text-muted-foreground">{t('contentPages.previewHint')}</p>
            {draft.trim() ? (
              <div
                dir="rtl"
                className="min-h-64 space-y-3 overflow-auto break-words rounded-xl border border-border bg-background p-4 leading-8 [&_a]:text-primary [&_a]:underline [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-bold [&_ul]:list-disc [&_ul]:pe-5"
                dangerouslySetInnerHTML={{ __html: sanitizeContentHtml(draft) }}
              />
            ) : (
              <div className="flex min-h-64 items-center justify-center rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                {t('contentPages.noPreview')}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
