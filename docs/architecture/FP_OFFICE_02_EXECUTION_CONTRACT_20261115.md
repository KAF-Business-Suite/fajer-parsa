# FP-OFFICE-02 | قرارداد اجرایی واحد دفتر فجرپارسا
Version: 0.1 / Proposal for controlled QA implementation
Date: 2026-11-15 (Kabul)
Owner of execution: Linear KAF-35; parent platform contract: KAF Business Suite Master Product Lock v2.2
Status: DECISION RECORDED — NOT production approval, NOT master architecture replacement

## CURRENT — 2026-11-18 | QA Worker #40 live, secure sign-out P0 gate

**Status: QA source & anonymous live API PASS; actual staff S21 login still UNVERIFIED; not customer Production.** This supersedes dated 16 Nov notes only for the specific server logout/session bug.

- Executed source [commit `885b15d`](https://github.com/KAF-Business-Suite/fajer-parsa/commit/885b15d0281f80a5ecefe16be964b7c697edc694), existing PR #14. It corrects `/api/session/logout` so the CSRF-guarded browser session cookie expires even if Supabase Auth logout/config returns error or the Worker session key is temporarily unavailable. Remote token revocation is honestly flagged `providerRevocation:'unverified'`, not represented as full server-side success. Staff browser shows four-language notice. Safe numeric page/scroll history survives language switching.
- **Exact-source CI:** [independent checks #44354709972](https://github.com/KAF-Business-Suite/fajer-parsa/actions/runs/44354709972): 3/3 jobs SUCCESS; [safe Fajr Pages #44354710497](https://github.com/KAF-Business-Suite/fajer-parsa/actions/runs/44354710497): SUCCESS. Includes synthetic cookie/CSRF/logout regressions, intercepted Office browser reload/logout, Office and Site Control disposable Postgres tests; no real staff credentials.
- **Existing private QA Worker** `fajr-office-qa`: staged exact source 885 with **version 40** `764b0093-8adb-4602-92bd-946c1adf10ca`; Cloudflare version readback preserved the three existing secret bindings by type/name and no values were read or changed. 100% QA rollout deployment `57094e0c-130f-497a-a977-4d97df60fc3d` (verified active). **Rollback anchor:** previous 100% version 39 `447535c2-a348-43b2-b29f-8c2c00031372`, deployment `528c15d4-61df-4ba7-af59-d4d9e5a77fa5`. No DNS, staff keys or Production configuration changed.
- **Independent anonymous live-browser QA:** at https://fajr-office-qa.khoojafahim.workers.dev/ neutral loading before login, FA/PS/EN/AR selector and RTL/LTR PASS. No-cookie `GET /api/session` returned **401**, anonymous zero-data `POST /api/session/logout` returned **200** `{signedOut:true}`, subsequent `GET /api/session` **401**; no errors or actual sign-in/data writes. Browser did not expose raw Set-Cookie expiration header; header behavior is proven only by unit/CI tests (not independently at a real authenticated device).
- **Public Fajr Production unchanged:** Cloudflare Pages deployment `16950d0e-b5f6-42e5-bb83-3fc3bdd26e55`, source `9ded561eae7394f38eb633d3ec890be51df3f830`, SUCCESS. Office QA Worker is separate from public Production.
- **Concurrent source reconciliation:** another code commit landed on PR #14 after the tested/deployed source (PR HEAD at this checkpoint `237c259b82e9c07e0fb662f79375d23c341437ae`, with UI changes). Version #40 is tied specifically to `885b15d`. **Do not represent newer PR HEAD code as already deployed or QA accepted** until a fresh full test and controlled version rollout. Preserve other agent's changes.
- **Required to close full KAF-35 Phase A:** one authorized owner-only positive Samsung S21 test on the existing HTTPS QA Worker: login with Remember 7d (enter password only in site's secure form), visit a case, refresh and reopen retaining context, secure logout, refresh and confirm login required. Also verify revocation behavior if auth service fails and role-denial where safe. Never request passwords/tokens in chat. KAF-31 customer Production remains separately BLOCKED.

## CURRENT — 2026-11-16 | Strict QA rollback and BFF 401 fix

- Reviewed/temporarily deployed existing Cloudflare QA Worker version `b43ff397` (not customer Production); strict live GitHub CI `43799546488` failed because anonymous `/api/session` returned HTTP **503 instead of 401**. The old Worker `17eaf4ed` was immediately restored at 100% (Cloudflare deployment `be5482b9-1f24-4053-9372-6eee4a20fcff`). This was a **genuine runtime FAIL**, not a code-unit PASS.
- Corrected local BFF handling to parse/check the existing encrypted cookie *before* requesting remote Supabase config/keys. Missing or malformed cookies now get HTTP 401 without network dependency; invalid keys still fail closed. New regression test verifies 401 and **zero** calls to configuration/Auth/Office for missing/invalid sessions.
- Re-run merged-branch CI; do NOT claim live acceptance from code-only tests. A new versioned Worker QA upload and strict live test are required before device sign-in; none of this enables customer Production.

## CURRENT — 2026-11-16 | Source reconciliation without bulk merge

- Existing PR #14 was reconciled with current `main` by building the reviewed office-only tree on top of `main`, preserving both histories. It now has **0 behind main** and GitHub reports **mergeable=true**, but is still Draft/unmerged. Source candidate commit: `bc644ad964719152dfd4b85b938aefab2fa85ca6`.
- Shared main-site SEO/browser checks and artifact upload remain in the combined Workflow, alongside Office BFF/HTTP/Chromium and disposable PostgreSQL tests. Old auto-generated `_docs` files are not part of the new PR diff.
- Live database already contains the named Fajr Office tables/RPCs with RLS/denied direct RPC grants; both `fajr-office` and `fajr-office-api` edge functions are ACTIVE. The old `FAJR_OFFICE_UNAPPLIED.sql` is a **historical proposal**, not an installation instruction. No DDL or Edge deployment was issued.
- No customer Production, staff Worker rollout, real-user sign-in, credentials, billing or SMS/email changes were made.

## CURRENT — 2026-11-16 | Candidate browser versus rolled-back runtime

- Current live Cloudflare staff Worker remains rollback `17eaf4ed-5372-4f7d-b168-14719aa4ecb3` (not candidate BFF `b43ff397-f1ae-47b7-9609-32d8ac7f4886`). `FAJR_SESSION_KEY` binding exists but cannot prove active BFF behavior.
- The candidate Chromium suite serves the **actual branch Worker HTML, CSS and browser JS** through local Playwright routing and intercepts synthetic config/session, office, recovery and logout endpoints. It cannot send real account credentials, messages or database writes. Passing this test proves the candidate UI only.
- The live Worker test in normal CI probes public HTTPS anonymous denials and deliberately reports persistent BFF session acceptance **UNVERIFIED**. A separate manual `workflow_dispatch.office_bff_required=true` strict mode is reserved for inspection of the actual QA Worker after an authorized deployment; it requires cookie-protected same-origin BFF routes and no browser-side password-grant tokens.
- No deploy, merge or customer Production is authorized by a candidate-only PASS. KAF-35 still needs actual live strict acceptance and owner S21 login/refresh/reopen/logout, whereas public site go/no-go remains KAF-31.

## 1. درخواست مالک، بازنویسی دقیق برای اجرا

> دفتر فجرپارسا باید از یک فهرست سادهٔ درخواست به محیط کاری منظم، سریع، قابل‌اعتماد و پریمیوم تبدیل شود؛ با ظاهر و رفتار هماهنگ با سیستم KAF و رنگ/برند مستقل فجرپارسا. کارمند در گوشی یا لپ‌تاپ قابل‌اعتماد پس از هر بازکردن سایت دوباره مجبور به ورود با ایمیل و کد نباشد؛ در عین حال دسترسی ایمن و نقش سازمانی محفوظ باشد. ورود ایمیل باقی بماند؛ Google در اولویت و GitHub برای کارمندان مجاز اضافه شود، ولی فقط بعد از تأیید تنظیمات و اتصال همان هویت؛ روش‌های دیگر مانند لینک ورود، passkey، Microsoft یا WordPress در صورت نیاز و قابلیت صحیح بررسی شوند، نه همگی فوری. دعوت تیم توسط مدیر و نقش‌های محدود باشد. شماره‌های طولانی UUID برای کاربر به کدهای کوتاه، معتبر، لوکس و قابل‌جست‌وجو تبدیل شوند، بدون تخریب شناسهٔ اصلی. تمام جریان‌های درخواست، پیگیری، دادهٔ KAF و صادرات Excel/Sheets زیر یک قرارداد واحد، با چهار زبان دری/پشتو/انگلیسی/عربی و آزمون واقعی گوشی کار کنند. به‌جای تکرار اصلاحات جزئی، ریشهٔ خطا و پذیرش واقعی هر مرحله با شواهد معلوم باشد.

## 2. حقایق ثابت و مرزها

- گیت FP-04 / Linear KAF-22 **DONE فقط برای QA synthetic**: مالک تصویر دفتر با چهار درخواست و رسید نمونه با پیشوند `05b387bc` را تأیید کرد. آزمون DB member/list/status/audit با ROLLBACK، denial به هویت غیرمجاز، و CI موفق ثبت شده است.
- سایت اصلیِ چهارزبانه Customer Intake را هنوز در Production فعال نکرده؛ PR #22 آزمایشی باز و PR #14 دفتر Draft است. این سند به معنای Merge/Deployment نیست.
- منبع اطلاعات: Supabase PostgreSQL/KAF، با RBAC/RLS و عضویت شرکت. Google Sheets/Excel/Pipedrive تنها خروجی، نمای کار یا آداپتر مجازند، نه منبع حقیقی موازی.
- دفتر فعلی از Cloudflare Worker موجود `fajr-office-qa` استفاده می‌کند و در کد فعلی خود توکن دسترسی و refresh را در `sessionStorage` نگه می‌دارد؛ دلیل مهم ورود دوباره پس از بستن نشست. KAF اصلی از Supabase Auth با `persistSession: true`, `autoRefreshToken: true` و کد Google OAuth استفاده می‌کند؛ صحت تنظیمات واقعی Provider/Redirect هنوز اثبات نشده.
- Cloudflare Worker قدیمی /api/office پس از خطای 503 عمداً با 410 غیرفعال شد؛ مرورگر اکنون به Supabase Edge office API مستقیم می‌رود. تغییر معماری نشست نباید آن شکست تاریخی را تکرار کند.
- KAF و Fajr فعلاً روی originهای متفاوت‌اند؛ «یک حساب مشترک» الزاماً به معنای «یک کوکی ورود خودکار در همهٔ دامنه‌ها» نیست. برای SSO میان‌دامنه‌ای، redirect و هویت مرکزیِ حساب باید جدا آزموده شود.
- Auth identity ≠ org membership. ثبت‌نام عمومی در بخش دفتر ممنوع، دعوت کارمند فقط توسط مدیر دارای اختیار. هیچ ایمیل یا Provider به‌تنهایی نقش فجرپارسا صادر نمی‌کند.
- چهار زبان `fa-AF`, `ps-AF`, `en`, `ar`؛ هستهٔ طراحی مشترک KAF، ولی تم برند/لحن/لوگو متفاوت و مطابق مجوز شرکت. نقص‌های تاییدنشدهٔ UI در KAF کپی نشوند.
- Scope فعال: KAF-35 در فجرپارسا؛ قرارداد جهانی KAF-36 در Backlog؛ استاندارد طراحی KAF-10 مرجع؛ انتشار KAF-31 مستقل است. **گیت جدید کوچک ایجاد نشود.**
- Zero-cost first. بدون تغییر live secret/OAuth credentials، تنظیمات مشترک Supabase Site URL، دیتابیس عملیاتی، پیام مشتری، پرداخت یا اشتراک مگر پس از بررسی اثر و تأیید جدا.

## 3. سه فاز بزرگ یک گیت

### A — ورود امن و نشست ماندگار (P0؛ شروع فوری)
**Outcome:** کارمند مجاز در دستگاه منتخب یک‌بار وارد شود؛ Reload و بستن/بازکردن تب بدون کد و ایمیل تکراری ادامه یابد، مگر خروج/انقضا/لغو دسترسی.

1. Snapshot/backup و معادل‌سازی مسیر Worker فعلی، Auth، redirects، عضویت سازمانی، کوکی‌ها، CSP و لایهٔ API. قدم اول تصمیم ADR امنیتی با مقایسهٔ دو گزینه:
   - **A1 ترجیحی برای بررسی:** Backend-for-Frontend داخل Worker موجود با cookie میزبان `__Host-`، `HttpOnly; Secure; SameSite=Lax/Strict` بر اساس OAuth callback، state/CSRF، rotation، logout و enforcement server-side. چون Worker proxy سابق 503 داشته، قبل از انتخاب نهایی باید مسیر request forwarding + JWT verify + refresh در آزمایش شکست-محور دوباره ثابت شود؛ از کپی service-role به Worker خودداری شود.
   - **A2 اگر A1 در محیط رایگان قابل‌اثبات نبود:** auth/session adapter رسمی Supabase برای مرورگر با تنظیمات XSS/CSP، refresh/revoke و persistence کنترل‌شده؛ هرگز کپی دستی refresh-token به `localStorage` به عنوان patch سریع انجام نشود. علت انتخاب و ریسک آن ثبت شود.
2. ورود Email موجود حفظ شود. Google مقدم پس از verification Site URL, exact Redirect URLs, provider enabled, PKCE, same-user linking و تست login/logout/refresh. GitHub فقط بعد از تعیین نیاز واقعی کارکنان، provider readiness و جلوگیری از هویت تکراری/مجوز اضافی. در UI فقط Providerهای واقعاً فعال و تأییدشده نمایش یابند.
3. سیستم دعوت: invitation توسط owner/admin → identity verify → acceptance → KAF membership/branch/role → permission-aware Office. اگر کاربر هویت معتبر اما عضویت ندارد، فقط `Access pending` و بدون API customer data. پذیرش عمومی `Sign up` در بخش دفتر ممنوع.
4. حالت‌ها: signed-out, authenticating, session-loading, authenticated-but-not-member, member, session-expired, revoked, network-error. Refresh-token rotation، خروج از همان دستگاه و خروج از همه دستگاه‌ها، رفتار multi-tab، timeouts و account recovery آزموده شوند.
5. هیچ وعدهٔ «ورود همیشگی بدون انقضا» داده نشود. دستگاه مشترک default کوتاه/بدون remembered-session؛ برای دستگاه شخصی گزینهٔ آگاهانهٔ `این دستگاه را به یاد بسپار` همراه با sign-out آشکار.

**Done when A:** همان حساب مجاز روی QA S21/desktop: ورود موفق، reload، tab close/open، expiry/refresh، logout، revoked denied، wrong org denied و URL callback درست؛ کد/secret در URL/log/JS client افشا نشود؛ یک URL QA ثابت و شواهد دقیق.

### B — پوستهٔ دفتر و شناسهٔ انسانی (P1)
**Outcome:** دفتر از صفحهٔ ساده به تجربهٔ واقعی سازمانی برسد، نه نمای جعلی KAF.
1. استفادهٔ کنترل‌شده از نمونهٔ طراحی PR #15 و Design Tokens KAF-10: هدر و ناوبری ساده، پروفایل/شرکت/شعبه، داشبورد واقعی، جست‌وجو، فهرست پرونده، وضعیت، اقدام بعدی، پیام‌های خطا/خالی/بارگذاری، فرم تأیید تغییر و خروج امن. برند فجرپارسا مستقل باقی بماند.
2. چهار زبان، self-host فونت مناسب دری/پشتو + انگلیسی، خط/جهت درست اعداد و کدهای لاتین، dark/light اگر معیار تایید دارد؛ اکسس‌پذیری WCAG 2.2 AA، focus/keyboard، touch حداقل مناسب، Back/X، یک اسکرول، بدون overflow افقی.
3. قرارداد پیشنهادی شناسه: **کلید داخلی** `UUID` immutable در DB و API، **شمارهٔ انسانی** کوتاه و پایدار `<ORG>-<TYPE>-<SEQ>`، مثلاً `FP-R-00042`, `RPC-S-00013`, `FP-C-00007`. قرارداد مرکزی KAF-36 باید نام نوع‌ها، طول شماره، یکتایی و legacy را پیش از schema rollout نهایی کند.
4. شماره باید با شمارندهٔ اتمیِ درون transaction و unique constraint روی (org,type,sequence) ساخته شود؛ در office، receipt، جست‌وجو، Sheet و چاپ یکسان باشد. UUID هیچ‌گاه کوتاه یا عوض نشود. migration idempotent، نگاشت legacy، backfill برگشت‌پذیر، audit و ردیابی در API لازم است. شمارهٔ عمومی خودش مجوز مشاهدهٔ دادهٔ خصوصی نیست.
5. نمونهٔ آزمایشیِ کاربر `05b387bc...` فعلاً فقط prefix شناسهٔ UUID است، نه کد رسمی قابل‌چاپ؛ پیش از تصویب قرارداد، تغییر نمایشی بی‌ریشه ندهید.

**Done when B:** 4 locale × 320/360/393/768/desktop، dark/light مرتبط، S21 physical Back/keyboard/touch، جدول/کارت خوانا و فشرده، یک پروندهٔ synthetic دارای humanRef + UUID، جست‌وجو در API و رسید، هم‌خوانی دیداری و audit.

### C — دفتر تیمی و همگام‌سازی کنترل‌شده (P2)
**Outcome:** هر مسئول دفتر به پروندهٔ مجاز خودش دسترسی و پیگیری قابل اثبات داشته باشد.
1. owner/manager/ops/read-only با org/branch scope، مسئول پیگیری، مرحله بعدی، زمان اقدام، تاریخچه و audit.
2. اولین اتصال Google Sheets/Excel: **فقط-خواندنی** یا یک‌طرفه با شناسهٔ پایدار + sync status + آخرین همگام‌سازی، بدون کپی رمز یا داده‌های نامجاز و بدون ساخت source-of-truth دوم.
3. بعداً آداپتر CRM یا WordPress فقط در صورت قرارداد SSO/API، permission، logging، idempotency و rollback؛ آن‌ها خودکار identity provider یا مرجع DB جدید نمی‌شوند.
4. پیام واتساپ/ایمیل خودکار، پرداخت و Customer Production فقط پس از گیت امنیت و تأیید جدا.

**Done when C:** synthetic case owner assignment → authorized update → audit → authorized readback → read-only export → role/org deny. یک QA شاهد، بدون پیام/پول.

## 4. روش اجرای واحد برای عوامل و تیم
Task format: Goal / Current Evidence / Source of Truth / Constraints / Change Scope / Done When / Run URL / Commit SHA / PASS-FAIL-BLOCKED / Rollback.

Sequence:
1) Read current source; 2) reproduce on existing QA; 3) choose root-cause decision and record alternative/risk; 4) make minimum reversible change in existing branch; 5) tests + real HTTPS Preview; 6) owner S21 acceptance; 7) sync exact evidence in KAF-35; 8) only then propose promotion by KAF-31.

Do not equate CI green with Production or human acceptance. Every screen/action must actually work; avoid placeholder controls. No secrets or real client data in chat, logs, or screenshots. All KAF global decisions remain proposals under KAF-36 until governance confirms them.

## 5. Useful references
- KAF master: `KAF-Business-Suite/kaf-business-suite/docs/KAF_MASTER_PRODUCT_LOCK.md` v2.2
- KAF architecture: `docs/KAF_GLOBAL_ARCHITECTURE_MAP.md` (G1 Auth simplicity, G2 authorization)
- Fajr PRs: #14 Office, #15 visual pilot, #22 safe intake
- Linear: KAF-22 Done QA; KAF-35 active; KAF-36 global proposal Backlog; KAF-10 Design System; KAF-31 publication
- Supabase Auth sessions: https://supabase.com/docs/guides/auth/sessions
- OWASP Session Management: https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
- WCAG 2.2: https://www.w3.org/TR/WCAG22/

**Immediate authorized next work unit:** Decide and prove session-persistence architecture in existing QA (A1/A2) with negative auth tests and no new provider/production alteration. Do not begin B or C until A is evidenced.
