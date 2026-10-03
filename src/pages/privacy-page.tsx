import {
  BellRing,
  ChevronLeft,
  Database,
  MapPinned,
  ShieldCheck,
  ShoppingBag,
  Trash2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { WaselBrandLogo } from '@/components/shared';
import { ROUTES } from '@/constants/routes';

const sections = [
  {
    icon: Database,
    title: 'بيانات الحساب',
    body: 'نستخدم الاسم ورقم الهاتف لتسجيل الدخول، حماية الحساب، وربط الطلبات والإشعارات بصاحب الحساب.',
  },
  {
    icon: MapPinned,
    title: 'بيانات الموقع',
    body: 'يستخدم العميل الموقع لاختيار عنوان التوصيل. ويستخدم حساب المندوب الموقع أثناء التوصيل النشط لتحديث التتبع، بما في ذلك في الخلفية عندما يكون التطبيق مغلقاً أو غير مستخدم.',
  },
  {
    icon: ShoppingBag,
    title: 'بيانات الطلبات',
    body: 'تتضمن بيانات السلة والمنتجات والأسعار وعنوان التوصيل وسجل الطلب بما يلزم لتنفيذ الطلب وخدمة المستخدم.',
  },
  {
    icon: BellRing,
    title: 'الإشعارات والجهاز',
    body: 'يتم تسجيل رمز الإشعارات للجهاز لإرسال تحديثات الطلب والتوصيل والتنبيهات المرتبطة بالخدمة.',
  },
];

export default function PrivacyPage(): React.JSX.Element {
  return (
    <main dir="rtl" className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute -right-32 -top-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-28 h-96 w-96 rounded-full bg-secondary/50 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-4xl flex-col gap-7 px-5 py-8 sm:px-8 sm:py-12">
        <header className="animate-stagger flex flex-col gap-6 rounded-[32px] border border-border/80 bg-card/90 p-6 shadow-floating backdrop-blur sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <WaselBrandLogo className="h-14 w-40" />
            <Link
              to={ROUTES.login}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-background/80 px-4 py-2 text-sm font-medium text-muted-foreground transition hover:border-primary/30 hover:text-primary"
            >
              الرجوع
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </div>

          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
              <ShieldCheck className="h-4 w-4" />
              الخصوصية والبيانات
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">سياسة خصوصية واصل</h1>
            <p className="text-base leading-8 text-muted-foreground">
              توضح هذه الصفحة أنواع البيانات الأساسية التي يستخدمها تطبيق واصل ولماذا نحتاجها لتشغيل
              الحساب والطلبات والتوصيل والتتبع والإشعارات.
            </p>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <article
                key={section.title}
                className="animate-stagger rounded-[26px] border border-border/80 bg-card/95 p-5 shadow-card transition duration-300 hover:-translate-y-1 hover:border-primary/25"
                style={{ animationDelay: `${80 + index * 60}ms` }}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-bold">{section.title}</h2>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{section.body}</p>
              </article>
            );
          })}
        </section>

        <section className="animate-stagger rounded-[28px] border border-border/80 bg-card p-6 shadow-card">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
              <Trash2 className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold">حذف الحساب والبيانات</h2>
              <p className="leading-7 text-muted-foreground">
                يمكنك بدء حذف حسابك مباشرة من تطبيق واصل من صفحة الحساب. كما نوفر صفحة عامة لطلب
                الحذف من خارج التطبيق. قد نحتفظ ببعض البيانات فقط عندما يكون ذلك مطلوباً قانونياً أو
                ضرورياً لمنع الاحتيال أو تسوية الالتزامات.
              </p>
              <Link
                to={ROUTES.accountDeletion}
                className="mt-2 inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                إدارة حذف الحساب
                <ChevronLeft className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <footer className="pb-4 text-center text-xs leading-6 text-muted-foreground">
          يجب أن تتطابق هذه السياسة مع ممارسات التطبيق الفعلية ومع بيانات الخصوصية المصرح بها في
          App Store Connect وGoogle Play Console.
        </footer>
      </div>
    </main>
  );
}
