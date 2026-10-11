# Dashboard Starter (React + TypeScript + Vite)

Starter template احترافي لبناء أي Admin Dashboard بسرعة مع بنية **Feature/Module-based** وقابلية توسّع عالية.

## Stack
- React 19 + TypeScript + Vite
- Tailwind CSS
- shadcn/ui style components (داخل `src/components/ui`)
- React Router
- TanStack React Query
- i18next + react-i18next (EN/AR + RTL/LTR)
- Zustand
- Axios
- lucide-react
- Zod

## Scripts
```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run typecheck
```

## Environment
أنشئ ملف `.env` من `.env.example`:
```bash
cp .env.example .env
```

المتغيرات المتوفرة:
- `VITE_APP_NAME`
- `VITE_ENABLE_MOCK_API`

ملاحظة: `API base URL` تم تثبيته داخل [src/env.ts](/home/hares/Desktop/wasel/src/env.ts) في متغير `API_BASE_URL`.

## Project Structure
```text
src/
  app/
    layouts/
    providers/
    router/
  components/
    ui/
    shared/
  features/
    dashboard/
      pages/
      components/
      hooks/
      api/
      schemas/
      types/
    users/
      pages/
      components/
      hooks/
      api/
      schemas/
      types/
    settings/
      pages/
      components/
      hooks/
      api/
      schemas/
      types/
  constants/
  hooks/
  i18n/
  lib/
  pages/
  services/
  store/
  types/
```

## What Is Ready
- App Layout: Sidebar + Header + Breadcrumbs + Main content
- Responsive Sidebar: desktop collapsible + mobile sheet/drawer
- Nested navigation support
- User menu + Notifications button
- Theme switcher
- Language switcher
- RTL/LTR auto-switch by selected language
- Protected routes + permission-ready guard structure
- 404 / Unauthorized pages
- QueryClient setup + default options + global query/mutation error toasts
- API layer separated from UI
- Reusable shared components:
  - `PageContainer`
  - `SectionHeader`
  - `DataTable`
  - `EmptyState`
  - `ErrorState`
  - `LoadingScreen`
  - `ConfirmDialog`
  - `FormField`
  - `LanguageSwitcher`
  - `ThemeSwitcher`
  - `SidebarNav`

## Feature Examples
- `dashboard`: KPI cards + activity table + query hook
- `users`: filters + table + create/edit dialog + mutations
- `settings`: form + preferences page + update mutation

## i18n Notes
- ملفات الترجمة:
  - `src/i18n/locales/en/common.json`
  - `src/i18n/locales/ar/common.json`
- استخدم مفاتيح ترجمة دائمًا بدل النصوص المباشرة.
- الاتجاه `dir` يتغير تلقائيًا بين `ltr` و `rtl`.

## Routing Notes
- route config في: `src/app/router/routes.tsx`
- public route: `/login`
- protected dashboard routes: `/dashboard`, `/users`, `/settings`, `/settings/preferences`
- guard permissions عبر `PermissionGuard`

## Query Keys
بنية query keys موجودة في:
- `src/constants/query-keys.ts`

## How To Add New Feature
1. أنشئ مجلد feature جديد داخل `src/features/<feature-name>` مع:
   - `pages`, `components`, `hooks`, `api`, `schemas`, `types`
2. ضع calls داخل `api/` مع فصل واضح عن UI.
3. أنشئ hooks React Query داخل `hooks/`.
4. أضف route في `src/app/router/routes.tsx`.
5. أضف nav item في `src/constants/navigation.ts`.
6. أضف مفاتيح الترجمة في ملفات `i18n`.
7. إذا احتجت صلاحية، أضف permission في `src/constants/permissions.ts`.

## Aliases
- Alias مفعل: `@/*` -> `src/*`
- الضبط موجود في:
  - `vite.config.ts`
  - `tsconfig.app.json`


## تبديل Backend API بين Production وDevelopment بعد النشر

لوحة RODO تحتوي على **مبدّل بيئة API** في صفحة تسجيل الدخول، وكذلك في الهيدر
لحسابات `Admin` و`SuperAdmin`. الوضع الافتراضي هو **Production**.

في **Vercel → Project Settings → Environment Variables** أضف:

```dotenv
VITE_API_BASE_URL=https://prod.octoserv-comp.com
VITE_DEV_API_BASE_URL=https://YOUR-REAL-STAGING-HOST
VITE_ENABLE_MOCK_API=false
```

غيّر `YOUR-REAL-STAGING-HOST` إلى عنوان الـAPI التجريبي الحقيقي (HTTPS).
بدون `VITE_DEV_API_BASE_URL` يبقى خيار Development معطّلاً ولا يتم تخمين عنوان تجريبي.
أعد نشر مشروع Vercel **مرة واحدة** بعد إضافة/تغيير المتغيرات لتضمين العنوانين.
بعدها يستطيع المشرف التبديل بينهما في نفس الموقع بدون أي إعادة بناء أو نشر.

- عند تغيير البيئة تُلغى الجلسة ويُطلب تسجيل الدخول من جديد. **توكن Development لا يُستخدم على Production**.
- البيئة محفوظة **لكل متصفح** وليست تغييراً عاماً لكل الموظفين أو للموبايل أو للبنية الخلفية.
- عند فتح تبويبين لنفس الموقع يتعامل التطبيق مع تغيّر البيئة بإعادة توجيه التبويب الآخر إلى صفحة الدخول.
- بيئة Development تحتاج حسابات تجريبية، API متاح عبر HTTPS وصلاحيات CORS للسماح بأصل موقع الداشبورد على Vercel.
- `VITE_*` قيم عامة تظهر في كود المتصفح. **لا تضع فيها رموز سرية أو مفاتيح خاصة**.
- المبدّل يغيّر **هدف طلبات API فقط**؛ لا يغيّر `import.meta.env.MODE` أو ملفات بناء واجهة Vite.
- تغيير العناوين بعد النشر أو التحكم المركزي بنمط جميع المستخدمين يحتاج إعدادات Runtime آمنة على الخادم، أو نشر مستقل (Preview/Staging).
