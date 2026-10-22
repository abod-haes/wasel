import { formatDateTime } from '@/lib/date-time';
import axios from 'axios';
import { AlertTriangle, ExternalLink, LoaderCircle, Plus, Search, Save, Smartphone, Info } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

import { PageContainer, SectionHeader } from '@/components/shared';
import { Button, Card, CardContent, Input, Label, Switch } from '@/components/ui';
import { appVersionsApi } from '@/features/app-versions/api/app-versions-api';
import type {
  AppVersion,
  CreateAppVersionInput,
  UpdateAppVersionInput,
} from '@/features/app-versions/types/app-version-types';

type Mode = 'create' | 'edit';
type FormValues = CreateAppVersionInput;
type LinkKey = 'googlePlayLink' | 'appStoreLink' | 'websiteLink';

const emptyForm: FormValues = {
  version: '',
  needToUpdate: false,
  forceUpdate: false,
  isVisible: true,
  googlePlayLink: '',
  appStoreLink: '',
  websiteLink: '',
};

const linkFields: { key: LinkKey; label: string; placeholder: string }[] = [
  { key: 'googlePlayLink', label: 'رابط Google Play', placeholder: 'https://play.google.com/store/apps/details?id=...' },
  { key: 'appStoreLink', label: 'رابط App Store', placeholder: 'https://apps.apple.com/app/...' },
  { key: 'websiteLink', label: 'رابط الموقع الإلكتروني', placeholder: 'https://example.com/download' },
];

function isValidOptionalUrl(value: string): boolean {
  if (!value.trim()) return true;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' && Boolean(url.hostname);
  } catch {
    return false;
  }
}

function normalize(form: FormValues): FormValues {
  const needToUpdate = form.needToUpdate || form.forceUpdate;
  return {
    version: form.version.trim(),
    needToUpdate,
    forceUpdate: needToUpdate && form.forceUpdate,
    isVisible: form.isVisible,
    googlePlayLink: form.googlePlayLink.trim(),
    appStoreLink: form.appStoreLink.trim(),
    websiteLink: form.websiteLink.trim(),
  };
}

function errorMessage(error: unknown, action: 'find' | 'save'): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 404 && action === 'find') {
      return 'ما لقينا إصدار بهالرقم. تأكد من رقم النسخة أو أضفها كنسخة جديدة.';
    }
    if (error.response?.status === 409) return 'رقم الإصدار موجود مسبقاً. استخدم تعديل نسخة موجودة.';
    if (error.response?.status === 401 || error.response?.status === 403) {
      return 'ما عندك صلاحية لهالعملية. سجّل الدخول بحساب إداري.';
    }
    if (!error.response) return 'تعذّر الاتصال بالسيرفر. تحقق من الاتصال وأعد المحاولة.';
    if (error.response.status === 400) return 'البيانات غير مقبولة. راجع رقم الإصدار والخيارات والروابط.';
  }
  return action === 'find' ? 'تعذّر تحميل الإصدار. حاول مرة ثانية.' : 'ما قدرنا نحفظ التعديلات. حاول مرة ثانية.';
}

function ConfigToggle({
  id,
  title,
  description,
  checked,
  onCheckedChange,
  warning,
}: {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  warning?: boolean;
}): React.JSX.Element {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-background/55 p-4">
      <div className="min-w-0 space-y-1">
        <Label htmlFor={id} className="cursor-pointer text-sm font-bold">{title}</Label>
        <p className="text-xs leading-5 text-muted-foreground">{description}</p>
        {warning && checked ? <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">سيُطلب من المستخدم التحديث قبل متابعة استخدام التطبيق.</p> : null}
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} aria-label={title} />
    </div>
  );
}

export default function AppVersionsPage(): React.JSX.Element {
  const [mode, setMode] = useState<Mode>('edit');
  const [lookupVersion, setLookupVersion] = useState('');
  const [selected, setSelected] = useState<AppVersion | null>(null);
  const [form, setForm] = useState<FormValues>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const updateField = <K extends keyof FormValues,>(key: K, value: FormValues[K]): void => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setFormError('');
  };

  const lookup = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const version = lookupVersion.trim();
    if (!version) {
      setFormError('أدخل رقم النسخة اللي بدك تعرضها.');
      return;
    }

    setLoading(true);
    setFormError('');
    setSelected(null);
    try {
      const result = await appVersionsApi.getByVersion(version);
      setSelected(result);
      setForm(normalize({
        version: result.version,
        needToUpdate: result.needToUpdate,
        forceUpdate: result.forceUpdate,
        isVisible: result.isVisible,
        googlePlayLink: result.googlePlayLink ?? '',
        appStoreLink: result.appStoreLink ?? '',
        websiteLink: result.websiteLink ?? '',
      }));
      setMode('edit');
    } catch (error) {
      setFormError(errorMessage(error, 'find'));
    } finally {
      setLoading(false);
    }
  };

  const selectMode = (next: Mode): void => {
    setMode(next);
    setFormError('');
    if (next === 'create') {
      setSelected(null);
      setForm({ ...emptyForm });
    } else if (selected) {
      setForm(normalize(selected));
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (mode === 'edit' && !selected) {
      setFormError('ابحث عن نسخة موجودة أولاً قبل تعديلها.');
      return;
    }

    const payload = normalize(form);
    if (!payload.version) {
      setFormError('رقم النسخة مطلوب.');
      return;
    }

    const invalidLink = linkFields.find((field) => !isValidOptionalUrl(payload[field.key]));
    if (invalidLink) {
      setFormError(`تأكد من صحة ${invalidLink.label}. الرابط لازم يبدأ بـ https://.`);
      return;
    }

    const hasDownloadLink = Boolean(
      payload.googlePlayLink || payload.appStoreLink || payload.websiteLink,
    );
    if (payload.needToUpdate && !hasDownloadLink) {
      setFormError('قبل تفعيل تحديث التطبيق، أضف رابط تنزيل صالحاً على الأقل (المتجر أو رابط الموقع/ملف APK).');
      return;
    }
    if (payload.forceUpdate && !payload.websiteLink && !(payload.googlePlayLink && payload.appStoreLink)) {
      setFormError('التحديث الإجباري يحتاج رابط موقع يصلح كبديل لكل الأجهزة، أو روابط Google Play وApp Store معاً.');
      return;
    }

    setSaving(true);
    setFormError('');
    try {
      if (mode === 'create') {
        await appVersionsApi.create(payload);
      } else {
        const patch: UpdateAppVersionInput = {
          needToUpdate: payload.needToUpdate,
          forceUpdate: payload.forceUpdate,
          isVisible: payload.isVisible,
          googlePlayLink: payload.googlePlayLink,
          appStoreLink: payload.appStoreLink,
          websiteLink: payload.websiteLink,
        };
        await appVersionsApi.update(selected!.version, patch);
      }

      // Read back the exact version: verify the update policy and download links
      // that the installed mobile client will receive from GET.
      const verified = await appVersionsApi.getByVersion(payload.version);
      const matchesSavedPolicy =
        verified.needToUpdate === payload.needToUpdate &&
        verified.forceUpdate === payload.forceUpdate &&
        verified.isVisible === payload.isVisible &&
        (verified.googlePlayLink ?? '').trim() === payload.googlePlayLink &&
        (verified.appStoreLink ?? '').trim() === payload.appStoreLink &&
        (verified.websiteLink ?? '').trim() === payload.websiteLink;

      if (!matchesSavedPolicy) {
        setSelected(verified);
        setLookupVersion(verified.version);
        setMode('edit');
        throw new Error('تم إرسال الحفظ، لكن بيانات التحديث أو روابط التنزيل لا تطابق استجابة GET. تحقق من دعم الباك للقيم قبل اعتماد النسخة.');
      }


      setSelected(verified);
      setLookupVersion(verified.version);
      setForm(normalize({
        version: verified.version,
        needToUpdate: verified.needToUpdate,
        forceUpdate: verified.forceUpdate,
        isVisible: verified.isVisible,
        googlePlayLink: verified.googlePlayLink ?? '',
        appStoreLink: verified.appStoreLink ?? '',
        websiteLink: verified.websiteLink ?? '',
      }));
      setMode('edit');
      toast.success(mode === 'create'
        ? 'تم إنشاء النسخة والتحقق من إعدادات التحديث وروابط التنزيل.'
        : 'تم حفظ إعدادات التحديث وروابط التنزيل والتحقق منها.');
    } catch (error) {
      const message = error instanceof Error && !axios.isAxiosError(error)
        ? error.message
        : errorMessage(error, 'save');
      setFormError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer>
      <SectionHeader
        titleKey="nav.appVersions"
        descriptionKey="إدارة تنبيهات التحديث الاختياري أو الإجباري وروابط التنزيل لكل رقم نسخة."
        actions={
          <div className="inline-flex items-center gap-2 rounded-lg border border-primary/15 bg-primary/5 px-3 py-2 text-xs font-medium text-primary">
            <Smartphone aria-hidden="true" className="h-4 w-4" />
            إعدادات إصدار تطبيق RODO
          </div>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.72fr)]">
        <div className="space-y-5">
          <Card>
            <CardContent className="space-y-5 p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="نوع العملية">
                <Button type="button" variant={mode === 'edit' ? 'default' : 'outline'} onClick={() => selectMode('edit')} className="gap-2">
                  <Search className="h-4 w-4" /> عرض وتعديل نسخة
                </Button>
                <Button type="button" variant={mode === 'create' ? 'default' : 'outline'} onClick={() => selectMode('create')} className="gap-2">
                  <Plus className="h-4 w-4" /> إضافة نسخة
                </Button>
              </div>

              {mode === 'edit' ? (
                <form onSubmit={(event) => void lookup(event)} className="space-y-2">
                  <Label htmlFor="lookup-version">البحث برقم الإصدار</Label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      id="lookup-version"
                      value={lookupVersion}
                      onChange={(event) => setLookupVersion(event.target.value)}
                      placeholder="مثال: 1.0.0"
                      className="min-w-0 flex-1"
                      dir="ltr"
                      autoComplete="off"
                    />
                    <Button type="submit" variant="outline" disabled={loading || saving || !lookupVersion.trim()} className="gap-2">
                      {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                      جلب الإصدار
                    </Button>
                  </div>
                  <p className="text-xs leading-5 text-muted-foreground">
                    البحث عن نسخة محددة فقط؛ الـ API الحالي ما بيوفّر قائمة بجميع النسخ.
                  </p>
                </form>
              ) : null}
            </CardContent>
          </Card>

          {mode === 'create' || selected ? (
            <Card>
              <CardContent className="p-5 sm:p-6">
                <form onSubmit={(event) => void submit(event)} className="space-y-5">
                  <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
                    <div className="space-y-1">
                      <h2 className="text-lg font-bold">{mode === 'create' ? 'إضافة إصدار جديد' : 'إعدادات الإصدار'}</h2>
                      <p className="text-xs text-muted-foreground">
                        {mode === 'create' ? 'بعد الحفظ، فيك ترجع تعدّل نفس النسخة.' : 'التعديل بيستخدم رقم النسخة نفسه بدون تغييره.'}
                      </p>
                    </div>
                    <Smartphone className="h-6 w-6 shrink-0 text-primary" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="app-version-number">رقم الإصدار <span className="text-destructive">*</span></Label>
                    <Input
                      id="app-version-number"
                      dir="ltr"
                      required
                      value={form.version}
                      onChange={(event) => updateField('version', event.target.value)}
                      readOnly={mode === 'edit'}
                      placeholder="1.0.0"
                      autoComplete="off"
                      className={mode === 'edit' ? 'bg-muted/60' : ''}
                    />
                    <p className="text-xs text-muted-foreground">لازم يطابق رقم الإصدار الموجود في التطبيق عند نشر النسخة.</p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-bold">سياسة تحديث التطبيق</h3>
                    <ConfigToggle
                      id="version-need-update"
                      title="يتطلب تحديث"
                      description="اعرض للمستخدم تنبيه بوجود تحديث للنسخة."
                      checked={form.needToUpdate}
                      onCheckedChange={(checked) => setForm((current) => ({
                        ...current,
                        needToUpdate: checked,
                        forceUpdate: checked ? current.forceUpdate : false,
                      }))}
                    />
                    <ConfigToggle
                      id="version-force-update"
                      title="تحديث إجباري"
                      description="امنع متابعة التطبيق حتى ينتقل المستخدم لتنزيل التحديث."
                      warning
                      checked={form.forceUpdate}
                      onCheckedChange={(checked) => setForm((current) => ({
                        ...current,
                        forceUpdate: checked,
                        needToUpdate: checked ? true : current.needToUpdate,
                      }))}
                    />
                    <ConfigToggle
                      id="version-visible"
                      title="إظهار النسخة"
                      description="النسخة مرئية حسب إعدادات الباك؛ إخفاؤها لا يحذفها."
                      checked={form.isVisible}
                      onCheckedChange={(checked) => updateField('isVisible', checked)}
                    />
                    <p className="rounded-lg border border-border bg-muted/30 p-3 text-xs leading-6 text-muted-foreground">
                      عملة أسعار التطبيق تتحكم فيها صفحة «التسعير وأسعار الصرف» فقط؛ إعدادات الإصدارات هنا مخصصة للتحديث والتنزيل، سواء كان التطبيق منشوراً بالمتاجر أم لا.
                    </p>
                    {form.forceUpdate ? (
                      <div className="flex items-start gap-2 rounded-xl border border-amber-400/40 bg-amber-400/10 p-3 text-xs leading-6 text-foreground">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                        التحديث الإجباري يحتاج رابط تنزيل صالحاً لنظام الجهاز. قبل النشر على المتاجر، يمكن استخدام رابط HTTPS مباشر لنسخة APK أو صفحة تنزيل مناسبة عبر رابط الموقع.
                      </div>
                    ) : null}
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-bold">روابط تنزيل التطبيق</h3>
                    <p className="text-xs leading-6 text-muted-foreground">
                      رابط الموقع يقبل رابط HTTPS لصفحة التنزيل أو ملف APK قبل نشر التطبيق على المتجر. يُستخدم رابط المتجر المناسب أولاً عند توفره، ثم رابط الموقع كبديل.
                    </p>
                    {linkFields.map((field) => (
                      <div key={field.key} className="space-y-2">
                        <Label htmlFor={field.key}>{field.label}</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id={field.key}
                            type="url"
                            dir="ltr"
                            value={form[field.key]}
                            placeholder={field.placeholder}
                            onChange={(event) => updateField(field.key, event.target.value)}
                            className="min-w-0 flex-1"
                          />
                          {isValidOptionalUrl(form[field.key]) && form[field.key].trim() ? (
                            <a
                              href={form[field.key].trim()}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`فتح ${field.label}`}
                              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border text-primary hover:bg-primary/10"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>

                  {formError ? (
                    <div role="alert" className="rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                      {formError}
                    </div>
                  ) : null}

                  <div className="flex justify-end border-t border-border pt-4">
                    <Button type="submit" disabled={saving || loading} className="min-w-40 gap-2">
                      {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      {mode === 'create' ? 'إنشاء النسخة' : 'حفظ التعديلات'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : formError ? (
            <div role="alert" className="rounded-xl border border-destructive/25 bg-destructive/10 p-4 text-sm text-destructive">
              {formError}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
              ابحث عن رقم نسخة موجودة لتعرض إعداداتها، أو اختار «إضافة نسخة».
            </div>
          )}
        </div>

        <div className="space-y-5">
          <Card>
            <CardContent className="space-y-4 p-5 sm:p-6">
              <h2 className="text-base font-bold">ملخّص النسخة</h2>
              {selected ? (
                <dl className="space-y-4 text-sm">
                  <div className="flex items-center justify-between gap-2"><dt className="text-muted-foreground">رقم الإصدار</dt><dd dir="ltr" className="font-bold">{selected.version}</dd></div>
                  <div className="flex items-center justify-between gap-2"><dt className="text-muted-foreground">التحديث</dt><dd className="font-semibold">{selected.forceUpdate ? 'إجباري' : selected.needToUpdate ? 'اختياري' : 'غير مطلوب'}</dd></div>
                  <div className="flex items-center justify-between gap-2"><dt className="text-muted-foreground">الظهور</dt><dd className="font-semibold">{selected.isVisible ? 'ظاهر' : 'مخفي'}</dd></div>
                  
                  {selected.createdAt ? (
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-muted-foreground">تاريخ الإنشاء</dt>
                      <dd className="text-start" dir="ltr">{formatDateTime(selected.createdAt)}</dd>
                    </div>
                  ) : null}
                </dl>
              ) : (
                <p className="text-sm leading-6 text-muted-foreground">
                  ما تم اختيار نسخة بعد. رح تظهر بيانات النسخة هون بعد إنشائها أو جلبها من السيرفر.
                </p>
              )}
            </CardContent>
          </Card>

          <div className="flex items-start gap-3 rounded-2xl border border-brand-border bg-brand-primary-soft/40 p-4 text-sm leading-6 dark:bg-primary/10">
            <Info className="mt-1 h-5 w-5 shrink-0 text-primary" />
            <div>
              الإصدارات تستخدم نفس السيرفر المتصل بالداشبورد؛ ما في Backend منفصل إلها.
              الـ API المتاح حالياً يدعم إنشاء إصدار، جلبه برقم النسخة وتعديله فقط.
              عرض جميع الإصدارات أو حذف إصدار يحتاج Endpoint من الباك.
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
