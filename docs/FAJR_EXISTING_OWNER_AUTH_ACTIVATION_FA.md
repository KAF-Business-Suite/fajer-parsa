# FP-04 · اتصال امن مدیر موجود — پیش‌نیازهای اجرایی

وضعیت: **حساب Supabase Auth موجود است؛ عضویت دفتر/endpoint هنوز فعال نیست.**

## شواهد خواندنی (۳۱ اکتوبر ۲۰۲۶)
- پروژه: `krzxajtrhvupyywovdzy`
- Auth در پروژه ۴ حساب دارد (فقط تعداد؛ بدون مطالعهٔ ایمیل، UUID یا مشخصات شخصی).
- جدول `public.business_members` موجود است. وجود عضویت KAF به معنی دسترسی فجرپارسا نیست.
- جدول‌های `fajr_private.office_members`، `fajr_private.office_audit`، `fajr_private.office_quota` و RPCهای `fajr_office_*` هنوز اجرا نشده‌اند.
- `web-v2/server/office/adapters.ts` سرورمحور و fail-closed است؛ endpoint فعال یا Login UI حقیقی متصل نیست.

## اجرای مسئولانه، بدون افشای مشخصات
1. **مالک** در [Supabase Auth Users](https://supabase.com/dashboard/project/krzxajtrhvupyywovdzy/auth/users) حساب شخصی موجود را شناسایی کند؛ UID/Email را در گفتگوی عمومی یا GitHub Issue ننویسد.
2. **قبل از DDL** نام workspace/شرکت فجرپارسا و دسترسی مالک از عضویت‌های موجود تأیید شوند؛ Auth یکسان، مجوز سازمانی مشترک نمی‌سازد. پشتیبان و Rollback لازم است.
3. طرح `docs/proposals/FAJR_OFFICE_UNAPPLIED.sql` مستقل بازبینی شود. اجرای طرح روی دیتابیس عملیاتی **به تأیید صریح جداگانه** نیاز دارد. هیچ grant عمومی، عضویت خودکار یا انتخاب «اولین کاربر» مجاز نیست.
4. در صورت تأیید و اجرای schema، مالک از محیط امن SQL Editor فقط برای حساب **احراز‌شده و انتخاب‌شده توسط خود** یک سطر `office_members` با `enabled=true` و `can_update=true` ایجاد کند؛ هیچ دادهٔ شناسایی در repository، لاگ یا چت ثبت نشود. قبل از آن migration و مجوزهای RPC و RLS دوباره بررسی شوند.
5. Endpoint سرور با `handleOffice` و `officeDependencies` فقط با Secret سرور، Origin مجاز، Auth refresh و quota مشترک متصل شود. هیچ `VITE_*` secret، service role browser یا Auth bypass.
6. UI login/email/Google و فهرست دفتر باید روی HTTPS Preview بعد از تست «کاربر عادی=403»، «مدیر=200»، «فرد لغوشده=403»، «تغییر وضعیت=audit»، «خطای پایگاه داده=503» آزمایش شود.
7. گوشی واقعی و محدودیت‌های انتشار/هزینه در آخر بررسی شوند. دفتر در Production تا PASS روشن نمی‌شود.

## معیار پایان
درخواست ساختگی -> ذخیره واقعی و قابل پیگیری -> ورود مدیر از حساب موجود -> فهرست ۲۵تایی -> تغییر وضعیت با تأیید -> ثبت audit -> logout -> ممنوعیت مشتری/غیرعضو، روی origin آزمایشی و Samsung واقعی. بدون این شواهد وضعیت DONE نیست.

**هیچ ID، ایمیل، رمز، OTP، توکن یا service key از کاربر در چت درخواست نشود.**
