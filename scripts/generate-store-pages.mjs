/**
 * Create publicly crawlable HTML policy/help pages from the RODO dashboard build.
 * The app itself is a client-side SPA; crawlers often never execute its React routes.
 * These three static pages must exist at their documented paths in production.
 * Email is substituted at build time and is intentionally NEVER guessed.
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadEnv } from 'vite';

const out = resolve(process.cwd(), 'dist');
if (!existsSync(out)) throw new Error('Run vite build before generating store pages.');
const email = (process.env.VITE_SUPPORT_EMAIL || loadEnv('production', process.cwd(), 'VITE_').VITE_SUPPORT_EMAIL || '').trim();
const validEmail = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email);
const escape = (value) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const contactHtml = validEmail
  ? '<a dir="ltr" href="mailto:' + escape(email) + '">' + escape(email) + '</a>'
  : '<strong>قناة الدعم غير مهيأة بعد. يجب ضبط VITE_SUPPORT_EMAIL قبل نشر التطبيق بالمتاجر.</strong>';

const style = `
:root { color-scheme:light; --navy:#142f7d;--ink:#182338;--muted:#526079;--bg:#f6f9ff;--line:#d8e2f2; }
* { box-sizing:border-box; }
body { margin:0; background:var(--bg); color:var(--ink); font:16px/1.9 system-ui,-apple-system,"Segoe UI",sans-serif; }
main { max-width:840px; margin:0 auto; padding:28px 18px 60px; }
header, section { background:#fff; border:1px solid var(--line); border-radius:20px; padding:22px 26px; margin-bottom:18px; }
h1 { font-size:clamp(24px,4vw,36px);margin:.2em 0; color:var(--navy); line-height:1.4; }
h2 {font-size:20px; margin:0 0 10px;color:var(--navy);}
p {margin:0 0 12px;}ul {padding-inline-start:24px;}li{margin-bottom:8px;}
nav {display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;}
a {color:var(--navy); text-underline-offset:3px;}
nav a, .primary {border:1px solid var(--line); border-radius:14px;padding:8px 14px;text-decoration:none;}
.primary {display:inline-block;background:var(--navy);color:white;font-weight:700;margin-top:12px;border-color:var(--navy);}
small {color:var(--muted);}strong {font-weight:700;}
@media(max-width:500px) {header,section{padding:20px 16px;}nav a{padding:7px 10px;font-size:14px}}
`;

function html(title, description, body) {
  return `<!doctype html>
<html lang="ar" dir="rtl"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="index,follow">
<meta name="description" content="${escape(description)}">
<title>${escape(title)} | RODO رودو</title>
<style>${style}</style>
</head><body><main>
<nav aria-label="روابط صفحات رودو"><a href="/privacy">الخصوصية</a><a href="/account-deletion">حذف الحساب</a><a href="/support">الدعم</a></nav>
${body}
<footer><small>RODO رودو — آخر تحديث: 20 أكتوبر 2026. هذه المعلومات تخص تطبيق طلبات وتوصيل السلع المادية.</small></footer>
</main></body></html>`;
}

const privacy = html(
  'سياسة الخصوصية',
  'كيف يجمع تطبيق رودو بيانات الحساب والموقع والطلبات، وكيف تطلب حذف حسابك.',
  `
<header><h1>سياسة خصوصية رودو RODO</h1>
<p>يوضح هذا المستند كيف يستخدم رودو البيانات اللازمة لتسجيل الحساب وتنفيذ طلبات شراء وتوصيل السلع المادية، بما في ذلك بيانات المندوب أثناء تفعيل استقبال الطلبات والتوصيل.</p></header>
<section><h2>البيانات التي نجمعها</h2>
<ul>
<li>بيانات الحساب مثل الاسم ورقم الهاتف وبيانات التحقق والمصادقة.</li>
<li>تفاصيل الطلبات والمنتجات والأسعار وعنوان التسليم وسجل الطلب والمبالغ النقدية المرتبطة بالطلبات.</li>
<li>الموقع الدقيق الذي يختاره المستخدم أو يسمح باستعماله لتحديد عنوان التوصيل.</li>
<li>بيانات موقع المندوب الدقيق عند اختيار حالة «متاح» لتعيين الطلبات القريبة، بما في ذلك في الخلفية حتى عندما يكون التطبيق مغلقاً أو غير مستخدم إذا وافق المندوب على الأذونات اللازمة.</li>
<li>بعد استلام الطلب، يُستخدم موقع المندوب لتحديث حالة التوصيل وعرض حركته لصاحب الطلب حتى انتهاء التوصيل أو إلغائه.</li>
<li>معرّفات الجهاز ورموز إشعارات الطلبات والدعم الفني عند الحاجة.</li></ul></section>
<section><h2>لماذا نستخدم البيانات؟</h2>
<p>لتقديم الخدمة، وتحديد المحلات المناسبة، وإسناد الطلبات للمندوبين المتاحين، والتواصل بشأن تنفيذها، وحساب رسوم التوصيل، وأمان الحساب وتسوية الالتزامات. لا نستخدم بيانات الموقع لأغراض استهداف إعلاني، ويمكن للمندوب إيقاف مشاركة موقع التوفر بإيقاف حالة «متاح».</p></section>
<section><h2>من يمكنه الاطلاع عليها؟</h2>
<p>تصل تفاصيل الطلب اللازمة إلى المحل والمندوب المختص فقط ضمن سير العمل. قد تُعالج بيانات الموقع والإشعارات عبر Google Maps ومزودي الاستضافة والإشعارات. لا نبيع بيانات الموقع أو الحساب للمعلنين.</p></section>
<section><h2>التحكم والاحتفاظ وحذف البيانات</h2>
<p>يمكن تعديل بيانات الحساب وإدارة العناوين والتحكم بأذونات الموقع والإشعارات من التطبيق أو إعدادات الهاتف، وطلب حذف الحساب من داخل التطبيق أو من الصفحة العامة أدناه. عند الحذف يجب إزالة البيانات الشخصية غير اللازمة؛ وقد تُحتفظ السجلات المالية والطلبات الضرورية للالتزامات القانونية وتسوية النزاعات فقط وفق المدد المعمول بها. على مشغّل المنصة توثيق مدد الاحتفاظ الدقيقة قبل النشر.</p>
<a class="primary" href="/account-deletion">طلب حذف الحساب والبيانات</a></section>
<section><h2>التواصل مع مشغّل رودو بشأن الخصوصية</h2><p>يمكن الاستفسار عن الوصول للبيانات أو تصحيحها أو حذفها عبر ${contactHtml}، أو مراجعة <a href="/support">صفحة الدعم</a>.</p></section>`
);

const deletion = html(
  'حذف الحساب والبيانات',
  'طلب حذف حساب RODO من خارج التطبيق دون الحاجة إلى إعادة تنزيل التطبيق.',
  `
<header><h1>حذف حساب رودو وبياناته</h1>
<p>يمكنك حذف حسابك من داخل التطبيق عبر «حسابي ← حذف الحساب»، أو استخدام نموذج الحذف الآمن من الموقع حتى لو حذفت التطبيق من جهازك.</p></header>
<section><h2>إرسال طلب الحذف من الموقع</h2>
<p>اضغط الزر التالي وافتح نموذج التحقق برقم الهاتف وكلمة المرور. تتم العملية عبر اتصال آمن مباشر بسيرفر رودو. لن نعتبر عملية الحذف مكتملة ما لم يرجع السيرفر تأكيد النجاح؛ لا يُطلب إرسال كلمة المرور عبر البريد أو إلى موظف الدعم.</p>
<a class="primary" href="/account-deletion/submit">فتح نموذج حذف الحساب</a></section>
<section><h2>ماذا يحدث عند الحذف؟</h2>
<ul><li>يُطلب حذف حساب رودو والبيانات المرتبطة به التي لا يجب الاحتفاظ بها.</li>
<li>قد تبقى سجلات محاسبية أو معاملات مطلوبة قانونياً أو لتسوية مطالبات قائمة؛ راجع <a href="/privacy">سياسة الخصوصية</a>.</li>
<li>لا يعني فتح نموذج الحذف أو إرسال بيانات الدخول أن الحساب حُذف. انتظر رسالة نجاح مؤكدة من السيرفر.</li></ul></section>
<section><h2>هل واجهت مشكلة؟</h2>
<p>إذا تعذر التحقق أو لم يؤكد السيرفر الحذف، تواصل مع الدعم عبر ${contactHtml}، بدون مشاركة كلمة المرور أو رمز التحقق.</p></section>`
);

const support = html(
  'الدعم والمساعدة',
  'قناة دعم RODO الرسمية للاستفسار عن الحساب والطلبات والخصوصية وحذف الحساب.',
  `
<header><h1>دعم رودو RODO</h1><p>للاستفسارات المتعلقة بالحساب أو الطلبات أو الخصوصية أو إلغاء الطلبات وحل النزاعات.</p></header>
<section><h2>التواصل مع الدعم</h2><p>قناة الدعم المهيأة: ${contactHtml}</p>
<p>اذكر وصف المشكلة ورقم الطلب عند الحاجة، ولا ترسل كلمة المرور أو رمز OTP أو بيانات بطاقة دفع.</p></section>
<section><h2>حذف الحساب</h2><p>لا تحتاج للتواصل مع موظف لحذف حسابك؛ استخدم <a href="/account-deletion">صفحة حذف الحساب</a> ونموذج التحقق مباشرة.</p></section>
<section><h2>الخصوصية</h2><p>اطلع على <a href="/privacy">سياسة الخصوصية</a> للاطلاع على استخدام بيانات الموقع والطلبات وطريقة طلب محو البيانات.</p></section>`
);

for (const [name, content] of [
  ['privacy.html', privacy],
  ['account-deletion.html', deletion],
  ['support.html', support],
]) {
  writeFileSync(resolve(out, name), content, 'utf8');
  console.log('Generated public RODO store page:', name);
}
if (!validEmail) {
  console.warn('STORE RELEASE BLOCKER: set VITE_SUPPORT_EMAIL to a monitored real inbox and redeploy.');
}
