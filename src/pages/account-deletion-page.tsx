import { useMemo, useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Mail,
  Phone,
  ShieldCheck,
  Smartphone,
  Trash2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { WaselBrandLogo } from '@/components/shared';
import { Button, Input } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { env } from '@/env';

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

export default function AccountDeletionPage(): React.JSX.Element {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const requestHref = useMemo(() => {
    if (!env.supportEmail || !phoneNumber) {
      return undefined;
    }

    const subject = encodeURIComponent('طلب حذف حساب واصل');
    const body = encodeURIComponent(
      `مرحباً،\n\nأرغب بطلب حذف حساب واصل المرتبط برقم الهاتف: ${phoneNumber}\n\nأرجو التواصل معي للتحقق من ملكية الحساب وإتمام الطلب.\n`
    );

    return `mailto:${env.supportEmail}?subject=${subject}&body=${body}`;
  }, [phoneNumber]);

  const submitRequest = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    if (!requestHref) {
      return;
    }

    setSubmitted(true);
    window.location.href = requestHref;
  };

  return (
    <main dir="rtl" className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute -right-28 top-0 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-28 h-96 w-96 rounded-full bg-secondary/50 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-4xl flex-col gap-6 px-5 py-8 sm:px-8 sm:py-12">
        <header className="animate-stagger rounded-[32px] border border-border/80 bg-card/95 p-6 shadow-floating sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <WaselBrandLogo className="h-14 w-40" />
            <Link
              to={ROUTES.privacy}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-2 text-sm font-medium text-muted-foreground transition hover:border-primary/30 hover:text-primary"
            >
              سياسة الخصوصية
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-7 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
              <Trash2 className="h-4 w-4" />
              حذف حساب واصل
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">تحكم كامل بحسابك وبياناتك</h1>
            <p className="text-base leading-8 text-muted-foreground">
              يمكنك بدء حذف الحساب من داخل التطبيق مباشرة، أو إرسال طلب حذف من هذه الصفحة إذا لم يعد
              التطبيق متاحاً لديك.
            </p>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Smartphone,
              title: 'من داخل التطبيق',
              body: 'الحساب ← حذف الحساب ← تأكيد الحذف.',
            },
            {
              icon: ShieldCheck,
              title: 'التحقق من الملكية',
              body: 'قد نطلب التحقق من رقم الهاتف قبل تنفيذ طلب الحذف لحماية الحساب.',
            },
            {
              icon: CheckCircle2,
              title: 'البيانات المرتبطة',
              body: 'يتم حذف البيانات المرتبطة التي لا يوجد التزام قانوني بالاحتفاظ بها.',
            },
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="animate-stagger rounded-[24px] border border-border/80 bg-card p-5 shadow-card"
                style={{ animationDelay: `${80 + index * 70}ms` }}
              >
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="font-bold">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
              </article>
            );
          })}
        </section>

        <section className="animate-stagger rounded-[28px] border border-border/80 bg-card p-6 shadow-card sm:p-7">
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">طلب حذف من خارج التطبيق</h2>
              <p className="mt-1 text-sm leading-7 text-muted-foreground">
                أدخل رقم الهاتف المرتبط بالحساب. لن نخزن الرقم في هذه الصفحة؛ سيتم فتح تطبيق البريد
                لديك برسالة جاهزة لإرسال طلب الحذف.
              </p>
            </div>
          </div>

          {env.supportEmail ? (
            <form className="space-y-4" onSubmit={submitRequest}>
              <div className="space-y-2">
                <label htmlFor="deletion-phone" className="text-sm font-semibold">
                  رقم الهاتف المرتبط بالحساب
                </label>
                <div className="relative" dir="ltr">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="deletion-phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    value={phoneNumber}
                    onChange={(event) => {
                      setSubmitted(false);
                      setPhoneNumber(digitsOnly(event.target.value));
                    }}
                    className="pl-10 text-left"
                    placeholder="مثال: 09xxxxxxxx"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full sm:w-auto" disabled={!phoneNumber}>
                إرسال طلب حذف الحساب
              </Button>

              {submitted ? (
                <p className="rounded-2xl bg-secondary px-4 py-3 text-sm font-medium text-secondary-foreground">
                  تم فتح تطبيق البريد. أرسل الرسالة لإكمال إنشاء طلب الحذف.
                </p>
              ) : null}
            </form>
          ) : (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm leading-7 text-destructive">
              قناة طلب الحذف الخارجية تحتاج إعداد بريد الدعم قبل نشر هذه الصفحة. أضف
              <code className="mx-1 rounded bg-background px-1.5 py-0.5" dir="ltr">
                VITE_SUPPORT_EMAIL
              </code>
              في بيئة الإنتاج.
            </div>
          )}
        </section>

        <p className="text-center text-xs leading-6 text-muted-foreground">
          لا نطلب كلمة مرورك أو رمز التحقق عبر البريد. إذا احتجنا للتحقق من الملكية، سيتم ذلك عبر
          القنوات الرسمية لواصل.
        </p>
      </div>
    </main>
  );
}
