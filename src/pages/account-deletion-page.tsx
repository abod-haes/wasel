import { useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  LockKeyhole,
  Phone,
  ShieldCheck,
  Smartphone,
  Trash2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { RodoBrandLogo } from '@/components/shared';
import { Button, Input } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { deleteAccountViaWeb } from '@/services/account-deletion';

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

export default function AccountDeletionPage(): React.JSX.Element {
  const [countryCallingCode, setCountryCallingCode] = useState('+963');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [error, setError] = useState('');

  const submitRequest = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (submitting || !confirmed || !phoneNumber.trim() || !password) return;
    setSubmitting(true);
    setError('');

    try {
      await deleteAccountViaWeb({ countryCallingCode, phoneNumber, password });
      setDeleted(true);
      setPassword('');
      setConfirmed(false);
    } catch (value) {
      setError(value instanceof Error ? value.message : 'تعذر حذف الحساب، حاول مرة ثانية.');
      setPassword('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main dir="rtl" className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute -right-28 top-0 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-28 h-96 w-96 rounded-full bg-secondary/50 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-4xl flex-col gap-6 px-5 py-8 sm:px-8 sm:py-12">
        <header className="rounded-[32px] border border-border/80 bg-card/95 p-6 shadow-floating sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <RodoBrandLogo className="h-14 w-40" />
            <Link to={ROUTES.privacy} className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-2 text-sm font-medium text-muted-foreground">
              سياسة الخصوصية <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-7 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
              <Trash2 className="h-4 w-4" /> حذف حساب رودو
            </div>
            <h1 className="text-3xl font-bold sm:text-4xl">حذف الحساب والبيانات</h1>
            <p className="text-base leading-8 text-muted-foreground">
              فيك تحذف حسابك من داخل تطبيق رودو، أو من هالصفحة حتى لو حذفت التطبيق من جهازك.
              المطلوب فقط تأكيد ملكية الحساب قبل إرسال طلب الحذف للسيرفر.
            </p>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            { icon: Smartphone, title: 'من داخل التطبيق', body: 'حسابي ← حذف الحساب ← تأكيد.' },
            { icon: ShieldCheck, title: 'من الموقع', body: 'سجّل دخولك هنا لمرة واحدة، ثم أكّد الحذف.' },
            { icon: CheckCircle2, title: 'البيانات المرتبطة', body: 'تُحذف البيانات غير المطلوب الاحتفاظ بها قانونياً أو لتسوية الالتزامات.' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="rounded-[24px] border border-border/80 bg-card p-5 shadow-card">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="font-bold">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
              </article>
            );
          })}
        </section>

        <section className="rounded-[28px] border border-border/80 bg-card p-6 shadow-card sm:p-7">
          <h2 className="text-xl font-bold">حذف الحساب من الويب</h2>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            يتم تسجيل الدخول عبر اتصال HTTPS مباشر مع سيرفر رودو، بدون تخزين كلمة المرور أو رمز الجلسة في المتصفح.
            لا يُعتبر حذف الحساب ناجحاً إلا بعد استلام رد نجاح من السيرفر.
          </p>

          {deleted ? (
            <div role="status" className="mt-5 rounded-2xl border border-green-600/20 bg-green-50 p-4 text-sm leading-7 text-green-800">
              أكّد السيرفر نجاح عملية حذف الحساب. قد تبقى سجلات المعاملات التي يُلزم القانون بالاحتفاظ بها
              وفق سياسة الخصوصية.
            </div>
          ) : (
            <form className="mt-5 space-y-4" onSubmit={(event) => void submitRequest(event)}>
              <div className="space-y-2">
                <label htmlFor="deletion-country" className="text-sm font-semibold">رمز الدولة</label>
                <Input id="deletion-country" dir="ltr" inputMode="tel" autoComplete="tel-country-code"
                  value={countryCallingCode} onChange={(event) => setCountryCallingCode(event.target.value.replace(/[^+\d]/g, ''))}
                  placeholder="+963" maxLength={6} required />
              </div>
              <div className="space-y-2">
                <label htmlFor="deletion-phone" className="text-sm font-semibold">رقم الهاتف المرتبط بالحساب</label>
                <div className="relative" dir="ltr">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="deletion-phone" type="tel" inputMode="numeric" autoComplete="tel-national"
                    value={phoneNumber} onChange={(event) => setPhoneNumber(digitsOnly(event.target.value))}
                    className="pl-10 text-left" placeholder="09xxxxxxxx" required />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="deletion-password" className="text-sm font-semibold">كلمة المرور للتحقق من الملكية</label>
                <div className="relative" dir="ltr">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="deletion-password" type="password" autoComplete="current-password"
                    value={password} onChange={(event) => setPassword(event.target.value)}
                    className="pl-10" required />
                </div>
              </div>
              <label className="flex items-start gap-3 rounded-2xl bg-secondary/50 p-3 text-sm leading-6">
                <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)}
                  className="mt-1 h-4 w-4" required />
                <span>أؤكد أنني أريد حذف حسابي وبياناته التي لا يوجد التزام بالاحتفاظ بها. أفهم أنني قد أفقد الوصول إلى سجل طلباتي.</span>
              </label>
              {error ? <p role="alert" className="rounded-2xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
              <Button type="submit" disabled={submitting || !confirmed || !phoneNumber || !password}
                className="w-full sm:w-auto">
                {submitting ? 'عم نتحقق ونحذف الحساب...' : 'تأكيد حذف الحساب'}
              </Button>
            </form>
          )}
        </section>

        <p className="text-center text-xs leading-6 text-muted-foreground">
          لن يطلب فريق رودو منك كلمة المرور أو رمز OTP عبر البريد أو المحادثة.
          لمعلومات عن الاحتفاظ بسجلات الطلبات، اقرأ <Link to={ROUTES.privacy} className="font-bold text-primary">سياسة الخصوصية</Link>
          {' '}أو <Link to={ROUTES.support} className="font-bold text-primary">تواصل مع الدعم</Link>.
        </p>
      </div>
    </main>
  );
}
