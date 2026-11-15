# FP-09 / QA ingress contract — 2026-11-15

**Objective:** The existing public Fajr request form should eventually submit to the **existing** `public.fajr_receive_web_request` RPC and be readable through the already-authorized `fajr_office_list`. No new public database, client portal, staff login or production site.

## Current facts (verified, not inferred)
- The real Supabase RPC receive → replay → authorized office readback was previously tested with `fp09-transaction@example.invalid` inside an explicit SQL transaction. The entire transaction was rolled back; **zero synthetic rows remained**.
- The sensitive RPCs reject `anon` and `authenticated` direct execution; access is reserved to the server role.
- Cloudflare Pages project `fajr-parsa-qa` uses production branch `main`. Project API readback on 2026-11-15 showed **no preview or production env_vars**.
- A real public Pages API route `/api/requests` is **not deployed**: the handler is currently in `server/intake/pages-entry.ts`, not the production `functions/` directory. The public form still defaults to disabled. Email and WhatsApp contact links are functional but do **not** automatically create database cases.
- The exact maintained QA alias is `https://fp07-service-catalog-preview.fajr-parsa-qa.pages.dev`. Its origin is now the one accepted by the prepared handler; production, older aliases and immutable hash previews fail closed.

## Added in the existing PR #24
- `server/intake/pages-entry.ts`: exact origin+path allowlist before making any external calls; missing `FAJR_INTAKE_ENABLED`, rate limiter, server Supabase URL/key or Turnstile secret => **503, no data write**.
- `server/intake/pages-entry.test.mjs`: host denial, no bindings, rate-limit denial, wrong origin/IP, synthetic Turnstile/Supabase adapter roundtrip, wrong Turnstile hostname. **All HTTP endpoints are mocks and no real token is used in these tests**.
- `qa-only/functions/api/requests.ts`: a deployable Pages Functions routing shim kept **outside** `web-v2/functions/` so the established static-only Preview workflow cannot accidentally expose this endpoint.
- CI `npm run test:intake` includes these tests, and separately compiles `qa-only/functions` into a Worker artifact without deploying it.

## Mandatory controls before a live QA-only submit
1. Verify the **right isolated QA environment and hostname**, exact `Origin`, existing database project, a server-side (never `VITE_` or repo) Supabase credential, and an independent Cloudflare Turnstile secret/site key and verified `action` and hostname.
2. Cloudflare Pages **preview environment variables and other bindings may be shared by multiple preview branches**. **Do not put a privileged Supabase service-role key into a broadly shared Preview environment until isolation is proven**. Prefer a dedicated restricted QA ingress with least privilege; do not store or print keys in issues, source, test logs or chat.
3. Require a functioning server-enforced `FAJR_RATE_LIMIT` binding, replay/idempotency, contact consent, a 4 KB request cap, strict field allowlist, no PII in receipts or URLs, and no public ability to read office requests.
4. Build, verify security tests and deploy **only one separately authorized QA endpoint**; use synthetic input only. Prove real HTTP POST (with challenge) → persisted receipt → staff-verified readback → cleanup.
5. Only after full QA evidence, business-approved terms, the separate KAF-31 release guard and explicit owner authorization can Production be changed. No automatic Merge, production deploy, customer messaging, payments or DB schema changes.

## PASS / BLOCKED semantics
- Prepared route and simulated E2E: PASS only after latest exact SHA CI.
- Existing DB RPC + authorized office readback in rollback transaction: PASS.
- Browser → actual QA Cloudflare Worker/Pages → live Supabase DB, with server challenge and rate binding: **NOT YET TESTED**.
- Real customer form in public Production: **OFF**.
- Security configuration / actual QA credential binding: **BLOCKED — no appropriate scoped bindings were found**.

**Next single step:** review whether Cloudflare can provide a **restricted QA-only secret and rate-limit scope** without exposing the service-role credential to all preview branches. Complete the binding only in a controlled endpoint and verify HTTP→DB→Office end to end. Do not treat UI tests or mock fetch as proof of that live path.
