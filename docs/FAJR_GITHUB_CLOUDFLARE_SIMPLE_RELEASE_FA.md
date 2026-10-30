# فجرپارسا | انتشار منظم و ساده (راهنمای مدیر)

## وضعیت موجود — ۳۰ اکتوبر ۲۰۲۶
- لینک فعلی سایت: https://fajr-parsa-qa.pages.dev
- پروژهٔ فعلی Cloudflare: `fajr-parsa-qa`، نوع انتشار Direct Upload است؛ اتصال مستقیم GitHub ندارد.
- آخرین Production تأییدشده توسط API: `94891bba02354fef36a6af292de9435872568c02`.
- شاخهٔ GitHub `main` در زمان بررسی ۲۲ کامیت عقب بود. نسخهٔ فعلی در Draft PR #6 محفوظ است.
- این PR تازه از همان نسخهٔ منتشرشده ساخته شده، اما خودش هیچ انتشار و تغییری به سایت نمی‌دهد.

## سه معنی ضروری
- **GitHub:** محل اصلی کد.
- **Cloudflare:** همان لینک سایت که مردم می‌بینند.
- **GitHub Actions:** بعد از تأیید و تنظیم امن، خودکار کد را آزمایش می‌کند و نسخهٔ مجاز را به Cloudflare می‌رساند.

## الان چه چیزی در این PR ساخته شده؟
فایل `.github/workflows/fajr-pages-safe-release.yml`:
1. تغییرات PR را بدون انتشار آزمایش و Build می‌کند.
2. انتشار Production به طور پیش‌فرض **خاموش** است.
3. قبل از انتشار، فایل‌های غیرمنتظرهٔ Functions و Worker را رد می‌کند.
4. برای Production باید `main` شامل کامیت منتشرشدهٔ قبلی باشد و کامیت فعال Cloudflare از لحاظ تاریخ Git پدرِ نسخهٔ جدید باشد؛ در صورت اختلاف، **متوقف** می‌شود.
5. انتشار دستی **preview** هیچ‌وقت Production را جایگزین نمی‌کند.
6. برای انتشار Production دستی، `main` و عبارت تأیید `DEPLOY-FAJR-PRODUCTION` الزامی است.
7. درخواست‌ها، دیتابیس مشتری، کلیدها و پیام‌های WhatsApp را تغییر نمی‌دهد.
8. هنوز هیچ Token در این مخزن نوشته نشده است.

## فقط پس از بررسی و تطبیق با PR #6
**مرحلهٔ ۱ — ایمنی:** Review کامل PR #6 (۱۱۸ فایل شامل migration پیشنهادشده)؛ با ادغام، اجرای workflowهای دیگر ممکن است شروع شود. فقط با آزمایش و نسخهٔ صحیح به `main` وارد شود.
**مرحلهٔ ۲ — انتقال کد:** این PR کوچک باید پس از PR #6 (یا با بازتنظیم base به `main`) با کد اصلی هماهنگ و آزمایش شود؛ تا آن زمان Draft بماند.
**مرحلهٔ ۳ — تنظیم امن:** در Cloudflare یک API Token با دسترسی محدود به Cloudflare Pages Edit در حساب درست بسازید؛ در GitHub مخزن `KAF-Business-Suite/fajer-parsa` > Settings > Secrets and variables > Actions > Secrets دو مقدار `CLOUDFLARE_ACCOUNT_ID` و `CLOUDFLARE_API_TOKEN` را **خودتان در صفحهٔ خصوصی** وارد کنید. هیچ Token را در پیام، فایل، کد یا اسکرین‌شات قرار ندهید.
**مرحلهٔ ۴ — آزمون:** بعد از رسیدن workflow به default branch، GitHub > Actions > Fajr Parsa | safe Pages release > Run workflow > target=preview. سپس لینک preview را روی گوشی بررسی کنید.
**مرحلهٔ ۵ — اولین انتشار کنترل‌شده:** فقط پس از PASS QA و بررسی حفاظ‌های نسخه، انتشار production دستی از `main` با عبارت دقیق انجام شود.
**مرحلهٔ ۶ — خودکارسازی دائمی:** GitHub > Settings > Secrets and variables > Actions > Variables > New repository variable: `FAJR_AUTO_DEPLOY` با مقدار `enabled`. از آن پس فقط Pushهای `main` شامل تغییر `web-v2/**` یا workflow، بعد از تست موفق و عبور از کنترل اختلاف نسخه، منتشر می‌شوند. در همهٔ حالت‌های دیگر توقف امن است.

## در صورت مشکل
- انتشار خودکار را خاموش کنید: مقدار Variable بالا را حذف یا به `disabled` تغییر دهید.
- هر تغییر غیرمنتظرهٔ Cloudflare production commit باید بررسی شود؛ از Force Push یا انتشار کورکورانه خودداری کنید.
- بازگشت به نسخهٔ قبلی فقط با بررسی دقیق Deploymentهای Cloudflare و اجازهٔ مالک انجام شود. برگشت‌پذیری خودکار تأیید نشده است.
- وضعیت سبز CI به‌تنهایی به معنی سلامت فرم مشتری، دیتابیس، نمایش تلفون یا دریافت پیام نیست.

## محدودیت‌های فعلی
- اتصال Secret در GitHub توسط این ابزار موجود قابل‌ثبت نیست؛ بدون این تنظیم هیچ Deploy از workflow انجام نمی‌شود.
- وضعیت مصرف پلن و هرگونه هزینهٔ احتمالی از این نوشته نتیجه‌گیری نشده؛ مجوز ارتقای پولی وجود ندارد.
- فرم دریافت زندهٔ مشتری، Turnstile و دفتر کارمندان جداگانه و غیرفعال‌اند.

منابع:
https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/
https://developers.cloudflare.com/pages/configuration/git-integration/
https://github.com/KAF-Business-Suite/fajer-parsa/pull/6

## وضعیت تست رایگان (بررسی تازه)
- GitHub Actions ساخت سایت و تست‌های مستقل `web-v2` موفق هستند و نباید با TestDriver پولی اشتباه شوند.
- در اجرای TestDriver به شناسهٔ `40954168123` سهمیهٔ رایگان ۳۰ دقیقه‌ای تمام شده بود؛ این **خطای سرویس تست** است نه اثبات خرابی سایت. همان اجرای قبلی دو فایل `node:test` را با Vitest اشتباه کشف می‌کرد و تست مرورگر URL قدیمی `kaf-business-suite.github.io/fajer-parsa/` و رابط انگلیسی قدیمی را انتظار داشت.
- برای جلوگیری از مصرف دوبارهٔ سهمیه، workflow قدیمی `.github/workflows/testdriver.yml` در این PR فقط **دستی** و با Variable `FAJR_ENABLE_LEGACY_TESTDRIVER=enabled` قابل اجراست. به‌طور پیش‌فرض کار نمی‌کند؛ تست قدیمی تا بازنویسی مبتنی بر لینک کنونی نباید PASS تلقی شود.
- در صورت وجود **required check** بر TestDriver در تنظیمات Branch Protection، پیش از Merge باید مدیر مخزن آن را بررسی و به تست رایگان معتبر تغییر دهد؛ ابزار فعلی تأیید این تنظیم را ارائه نکرده است.
- هیچ ارتقا، خرید یا استفادهٔ دوباره از سهمیهٔ TestDriver انجام نشد.

## کنترل اضافه‌شده بعد از آزمون رایگان (۳۰ اکتوبر)
پیش از هر انتشار PR #8، همان Chromium browser QA و فرم آزمایشی که در [PR #9](https://github.com/KAF-Business-Suite/fajer-parsa/pull/9) با [Run 41085426093](https://github.com/KAF-Business-Suite/fajer-parsa/actions/runs/41085426093) موفق شدند نیز اجرا می‌شوند. این محافظ جلوی انتشار را در صورت شکست آزمون می‌گیرد. همچنین قبل از نیاز به Secret، کمک‌دستور Wrangler در CI بررسی می‌شود؛ این آزمایش هیچ سایتی را نشر نمی‌کند. با این‌همه آزمون واقعی Deploy و Android هنوز انجام نشده است.
