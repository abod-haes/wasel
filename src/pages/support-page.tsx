import { ChevronLeft, HelpCircle, Mail, ShieldCheck, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { WaselBrandLogo } from '@/components/shared';
import { ROUTES } from '@/constants/routes';
import { env } from '@/env';

export default function SupportPage(): React.JSX.Element {
  return (
    <main dir="rtl" className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-36 -left-24 h-96 w-96 rounded-full bg-secondary/50 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-3xl flex-col gap-6 px-5 py-8 sm:px-8 sm:py-12">
        <header className="animate-stagger rounded-[32px] border border-border/80 bg-card/95 p-6 shadow-floating sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <WaselBrandLogo className="h-14 w-40" />
            <Link
              to={ROUTES.privacy}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-background/80 px-4 py-2 text-sm font-medium text-muted-foreground transition hover:border-primary/30 hover:text-primary"
            >
              الخصوصية
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-7 max-w-xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
              <HelpCircle className="h-4 w-4" />
              دعم واصل
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">كيف فينا نساعدك؟</h1>
            <p className="text-base leading-8 text-muted-foreground">
              للدعم المتعلق بالحساب أو الطلبات أو الخصوصية، تواصل معنا عبر قناة الدعم الرسمية أدناه.
            </p>
          </div>
        </header>

        <section className="animate-stagger rounded-[28px] border border-border/80 bg-card p-6 shadow-card">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Mail className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold">البريد الرسمي للدعم</h2>
              {env.supportEmail ? (
                <>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    أرسل تفاصيل المشكلة بدون مشاركة كلمة المرور أو رمز OTP.
                  </p>
                  <a
                    href={`mailto:${env.supportEmail}`}
                    className="mt-4 inline-flex max-w-full items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                    dir="ltr"
                  >
                    {env.supportEmail}
                  </a>
                </>
              ) : (
                <p className="mt-2 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm leading-7 text-destructive">
                  يجب ضبط بريد الدعم في بيئة الإنتاج قبل نشر هذه الصفحة.
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <Link
            to={ROUTES.accountDeletion}
            className="animate-stagger rounded-[26px] border border-border/80 bg-card p-5 shadow-card transition duration-300 hover:-translate-y-1 hover:border-primary/25"
          >
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Trash2 className="h-5 w-5" />
            </div>
            <h2 className="font-bold">حذف الحساب</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              ابدأ طلب حذف الحساب من خارج التطبيق.
            </p>
          </Link>

          <Link
            to={ROUTES.privacy}
            className="animate-stagger rounded-[26px] border border-border/80 bg-card p-5 shadow-card transition duration-300 hover:-translate-y-1 hover:border-primary/25"
          >
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h2 className="font-bold">سياسة الخصوصية</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              اقرأ كيف يستخدم واصل بيانات الحساب والموقع والطلبات.
            </p>
          </Link>
        </section>

        <p className="text-center text-xs leading-6 text-muted-foreground">
          لن يطلب منك فريق واصل كلمة المرور أو رمز التحقق عبر البريد.
        </p>
      </div>
    </main>
  );
}
