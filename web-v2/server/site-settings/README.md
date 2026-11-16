# FP-SITE-CONTROL-01 | کنترل وب‌سایت فجرپارسا — قرارداد موجود

## CURRENT | 16 Nov 2026 — QA implementation, Production locked

**One project and existing gates:** public site in Draft PR #24 / KAF-25; authorized Office in Draft PR #14 / KAF-35; release authority KAF-31. No separate CMS, second database, tenant, site or paid subscription.

### Confirmed source and QA state
- Existing PostgreSQL Supabase project contains additive migration `fajr_site_control_versioned_private_publication` (recorded as version `20261116072408`). The source file lives in PR #14 at `supabase/migrations/20261116_001_fajr_site_control.sql`; it creates Fajr-only private draft/publication and audit records and an explicit publisher role. `anon` has **no write access**, and both private tables have no user-level table grants. Only a single verified active Fajr owner/editor was eligible for publishing.
- The existing Office Worker QA at `https://fajr-office-qa.khoojafahim.workers.dev/site-settings` serves a mobile-first four-language editor (fa/ps/en/ar); uses the current encrypted HttpOnly login session, same-origin/Origin guards and no service-role key in browser. Staff APIs: `GET /api/site-settings/draft`, `POST /api/site-settings/draft`, `POST /api/site-settings/preview`, `POST /api/site-settings/publish`, `POST /api/site-settings/rollback`. Source: `workers/fajr-office-qa/{worker.mjs,site-settings-api.mjs,site-settings-ui.mjs}` in PR #14. Writes must also pass the existing Office authorization and atomic quota check.
- The existing Pages QA alias `https://fp-intake-safe-review.fajr-parsa-qa.pages.dev/` has a **read-only** same-origin public `GET /api/site-settings/public` function. It reads only a published snapshot via a public Supabase key and returns 404 until publication. No client write, draft, staff data, private key or raw table is exposed; production Pages remains static-only. Source: `web-v2/qa-only/functions/api/site-settings/public.js` in PR #24.
- The public React client validates the published allowlisted snapshot and falls back to existing contact values when unavailable. On published settings, it can render official office address/hours, notice and FAQs in each of four languages. Editing the source code is not necessary for those approved fields. Font preset metadata is stored/validated but an alternate Estedad/Inter font package is **not installed yet**; do not claim that it changes all website typography.
- Independent GitHub source and isolated PostgreSQL CI prove schema, roles, versioning, audit, rollback, CSRF and synthetic browser interactions. Newest exact PR head, CI and Cloudflare deployment must be re-checked before any acceptance claim.

### Owner experience
One Website Settings screen: contacts and WhatsApp; verified address, map and hours; two allowlisted font choices; four-language notices and up to five FAQs; save draft → readback → four-language preview → explicit confirm QA publish → QA public readback → audit → rollback.

### Boundaries and outstanding acceptance
- Current published state is `null`; no business contact or claim has been published through the new API. This is correct while positive authorized owner sign-in and verified content have not passed.
- **Owner S21 positive login/reload/logout, authenticated real edit/readback, QA publication/public GET, human visual acceptance and recovery still need validation.** Synthetic CI does not prove those.
- KAF-31 Production `productionAuthorization=false` and seven legal, contact, security and release checks remain BLOCKED. No PR merge, customer production deploy, real intake, DNS, payments or messages until independent approval. Existing customer-visible Pages SHA `9ded561eae7394f38eb633d3ec890be51df3f830` preserved.
- Corporate mailbox and custom domain not verified; never advertise invented `info@` or `contact@` addresses.
- Existing `public.app_settings` and `branding_profiles` store private per-owner settings; never repurpose as public Fajr publication tables.

### Fail-closed tests and references
- [PR #14 Office](https://github.com/KAF-Business-Suite/fajer-parsa/pull/14), [PR #24 Public](https://github.com/KAF-Business-Suite/fajer-parsa/pull/24), [KAF-25](https://linear.app/rpcfpta/issue/KAF-25), [KAF-31](https://linear.app/rpcfpta/issue/KAF-31).
- Security advisory on deliberately private RLS tables and intentionally authenticated `SECURITY DEFINER` RPC must be reviewed against owner/membership checks; no broad role grants.
- Public Pages QA fallback must continue working if the versioned API is unavailable. Production remains fail closed.
