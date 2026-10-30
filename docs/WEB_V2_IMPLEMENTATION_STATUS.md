# فجر پارسا — وضعیت تطبیق‌شدهٔ ۳۰ اکتوبر ۲۰۲۶

این بخش بر اساس خواندن مستقیم GitHub، Linear، Cloudflare و Supabase در همین تاریخ است. متن قدیمی پایین فقط سابقهٔ تاریخی است.

## مرجع امروز
- شاخهٔ اصلی GitHub: `main`؛ SHA مشاهده‌شده: `3948338a1558bcdde1f4bd53cd0ef95ab5422052`.
- PRهای #6 و #8 و #11 وارد main شده‌اند؛ تست سه سناریوی ساختگی اکنون در دستور test:intake موجود است.
- Cloudflare canonical deployment: `0b742f3b-a6d9-463e-9900-ad9669da3046`، production/success، سورس `94891bba02354fef36a6af292de9435872568c02`.
- نشانی رسمی فعلی: https://fajr-parsa-qa.pages.dev/ . ادغام Git به معنی انتشار Cloudflare نیست.
- مسیر انتشار امن در main موجود است؛ انتشار خودکار هنوز اثبات/فعال نشده. KAF-31 دو Secret خصوصی و Preview، Samsung و نخستین انتشار دستی را باز نگه داشته است. تنظیم Secret طبق آخرین یادداشت KAF-22 به بعد موکول شده؛ از کاربر توکن در چت نخواهید.
- GitHub Pages نیز در CI سایت جدا منتشر کرده؛ آن را با نشانی رسمی Cloudflare اشتباه نگیرید. حذف یا تغییر آن در این بررسی انجام نشده.

## دفتر؛ از نو ساخته نشود
- PR #7: https://github.com/KAF-Business-Suite/fajer-parsa/pull/7 — open/Draft.
- HEAD مشاهده‌شده: `f6f44317c6da367358876a32eb8741dad5a3a841`.
- مبنای PR هنوز `qa/fajr-visual-review-20261027` است؛ انتقال به main نیازمند تطبیق تغییرات و CI دوباره است، نه overwrite یا merge کور.
- CI https://github.com/KAF-Business-Suite/fajer-parsa/actions/runs/41106677186 موفق است. طبق شواهد PR: ۱۹ آزمون handler/adapter، ۲۸ intake و هفت گروه آزمون PostgreSQL موقت موفق‌اند. آزمون زنده، هویت مدیر یا Samsung با این نتایج ثابت نمی‌شود.
- Supabase موجود ACTIVE_HEALTHY است. جدول‌های business_members، business_role_permissions و profiles وجود دارند؛ business_members شامل workspace_id، user_id، role، companies و status است.
- جدول خصوصی عضویت/سابقهٔ دفتر در فهرست بررسی‌شده وجود ندارد؛ SQL دفتر هنوز پیشنهاد است. هویت مدیر و نگاشت شرکت/فضای کاری باید با قواعد موجود کاف تطبیق داده شود، نه صرفاً ایمیل یا نام نمایشی.
- اولویت ادامه: تطبیق PR #7 با main و مجوزهای موجود؛ رابط دفتر با پیش‌نمایش/تأیید تغییر وضعیت؛ سپس آزمون زندهٔ مجاز با داده ساختگی. حساب مشتری، SMS و فعال‌سازی دریافت مشتری واقعی جدا باقی‌اند.

## برند و محتوا
- مرجع برند موجود خوانده شد: فایل اصلی لوگو در Drive با ID `1klmq61spIQCDEGUA0qj9wx6xep7kMCWe`؛ بدون بازطراحی یا تغییر رنگ استفاده شود.
- برنامهٔ هفت‌روزهٔ محتوا پیش‌نویس است و تأیید خدمات، تماس و زمان‌بندی انتشار را ثابت نمی‌کند.
- هیچ secret، مجوز کارمند، migration، ارسال مشتری، هزینه یا انتشار Cloudflare در این بررسی تغییر نکرد.

---

## سابقهٔ قدیمی؛ مرجع وضعیت فعلی نیست

# Fajr Parsa Web v2 — Implementation Status

## Executed
- Created production-oriented web-v2 React + TypeScript + Vite + Tailwind foundation.
- Added premium light travel-commerce design system.
- Implemented homepage shell, desktop mega menu, service finder, destination hubs, commerce bundles, tracking/account teaser and floating AI entry.
- Reused the existing Fajr Parsa logo and travel imagery as temporary assets.
- Added first Supabase service-catalog migration.
- Added RLS-safe public-read policies for published catalog data.
- Added structure-only seeds for countries and service categories.
- Intentionally did not seed unverified prices or service availability.

## Next implementation slice
1. Connect the finder/home cards to Supabase catalog reads.
2. Build country hub + service detail route/template.
3. Build Smart Request Builder and lead creation.
4. Connect lead output to KAF CRM.
5. Add real Gemini server endpoint after catalog/knowledge grounding.

## Safety decisions
- No anonymous write policies were added.
- No Gemini/service-role secret is exposed in browser code.
- Unknown commercial data stays quote-only/draft until verified.
- The existing public site is not overwritten; v2 work is isolated in its own branch/path.

## 2026-10-26 — Local ready-source UI candidate
- Continued the existing web-v2 app on qa/fajr-ready-ui-light-dark-20261026.
- Added exactly light/dark, ready-made licensed motion/dialog components, functional UI interactions and local optimized assets.
- Clean npm ci, production build and 18 browser checks passed.
- See WEB_V2_READY_SOURCE_QA_20261026.md for scope and limitations.
- Account/CRM/payment/backend tracking remain unconnected. No remote push or deployment.

## 2026-10-27 — Floating header refinement
- Rounded, detached glass header with responsive gutters and sticky positioning.
- Adapted the two-line/X menu transition from Tailark MIT source; original source and license preserved under web-v2/vendor/tailark.
- Separate rounded menu panels, outside-click dismissal, Escape focus return and breakpoint cleanup.
- Build and 20 browser checks PASS. Source remains on the same local QA branch; no push or deploy.
