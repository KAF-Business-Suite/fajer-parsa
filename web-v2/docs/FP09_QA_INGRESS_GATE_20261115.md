# FP-09 / QA ingress contract — 2026-11-15

**Objective:** The existing public Fajr request form should eventually submit to the **existing** `public.fajr_receive_web_request` RPC and be readable through the already-authorized `fajr_office_list`. No new public database, client portal, staff login or production site.

## Current facts (verified, not inferred)
- The real Supabase RPC receive → replay → authorized office readback was previously tested with `fp09-transaction@example.invalid` inside an explicit SQL transaction. The entire transaction was rolled back; **zero synthetic rows remained**.
- The sensitive RPCs reject `anon` and `authenticated` direct execution; access is reserved to the server role.
- Cloudflare Pages project `fajr-parsa-qa` uses production branch `main`. Project API readback on 2026-11-15 showed **no preview or production env_vars**.
- A real public Pages API route `/api/requests` is **not deployed**: the handler is currently in `server/intake/pages-entry.ts`, not the production `functions/` directory. The public form still defaults to disabled. Email and WhatsApp contact links are functional but do **not** automatically create database cases.
- The exact maintained QA alias is `https://fp-intake-safe-review.fajr-parsa-qa.pages.dev`. Its origin is now the one accepted by the prepared handler; production, older aliases and immutable hash previews fail closed.
- Live Cloudflare readback 2026-11-15: the QA alias already had a successful deployment `34e9c86e-12f2-47cd-bb70-bb33e31b0721` on branch `fp-intake-safe-review`, and the existing `Fajr Parsa isolated intake QA` Turnstile widget permits this exact hostname. The regular catalog alias `fp07-service-catalog-preview` is a different site experience; its origin remains **DENIED** by the intake handler. No new Pages project or Turnstile widget is needed.

## Added in the existing PR #24
- `server/intake/pages-entry.ts`: exact origin+path allowlist before making any external calls; missing `FAJR_INTAKE_ENABLED`, rate limiter, server Supabase URL/key or Turnstile secret => **503, no data write**.
- `server/intake/pages-entry.test.mjs`: host denial, no bindings, rate-limit denial, wrong origin/IP, synthetic Turnstile/Supabase adapter roundtrip, wrong Turnstile hostname. **All HTTP endpoints are mocks and no real token is used in these tests**.
- `qa-only/functions/api/requests.ts`: **secret-free Pages proxy** for the existing intake QA alias; it rejects all other hosts, other methods and missing `FAJR_QA_GATEWAY` service binding, then forwards the original request to a private Worker. It remains **outside** live `web-v2/functions/`.
- `qa-only/worker/entry.ts` + `wrangler.toml`: private, no-route, `workers_dev=false` Worker which owns Supabase server secret, Turnstile verification and Cloudflare Workers native `FAJR_RATE_LIMIT` binding; QA flag defaults `false`. The rate-limit namespace `20261115` is **pre-release candidate configuration and must be checked for uniqueness before a deploy**.
- `tests/fp09-qa-proxy.test.mjs`: proves secret-free proxy denial and forward behavior; existing server tests verify private Worker logic using synthetic mocks.
- CI `npm run test:intake` includes these tests, **compiles the QA Pages proxy**, and runs the private Worker build via `wrangler deploy --dry-run` **without deploying**. A passing dry-run does not prove actual HTTP ingress or secret configuration.

## Mandatory controls before a live QA-only submit
1. Verify the **right isolated QA environment and hostname**, exact `Origin`, existing database project, a server-side (never `VITE_` or repo) Supabase credential, and an independent Cloudflare Turnstile secret/site key and verified `action` and hostname.
2. Cloudflare Pages **preview environment variables and other bindings may be shared by multiple preview branches**. **Never place a privileged Supabase service-role key in shared Pages Preview**. This implementation uses a **secret-free Pages service binding → private no-public-route Worker** to isolate server credentials. Ensure the service binding is attached to the intended environment, the exact QA host is enforced in BOTH proxy and Worker, and the service worker has no public route. Do not store or print keys in issues, source, logs or chat. Native Worker rate limits are **approximate and per-location**, not strict global quotas; test the effective protection and consider upstream safeguards before broad exposure.
3. Require a functioning server-enforced `FAJR_RATE_LIMIT` binding, replay/idempotency, contact consent, a 4 KB request cap, strict field allowlist, no PII in receipts or URLs, and no public ability to read office requests.
4. Build, verify security tests and deploy **only one separately authorized QA endpoint**; use synthetic input only. Prove real HTTP POST (with challenge) → persisted receipt → staff-verified readback → cleanup.
5. Only after full QA evidence, business-approved terms, the separate KAF-31 release guard and explicit owner authorization can Production be changed. No automatic Merge, production deploy, customer messaging, payments or DB schema changes.

## PASS / BLOCKED semantics
- Prepared route and simulated E2E: PASS only after latest exact SHA CI.
- Existing DB RPC + authorized office readback in rollback transaction: PASS.
- Browser → actual QA Cloudflare Worker/Pages → live Supabase DB, with server challenge and rate binding: **NOT YET TESTED**.
- Real customer form in public Production: **OFF**.
- Security configuration / actual QA credential binding: **BLOCKED — no appropriate scoped bindings were found**.

**Next single step:** after successful current CI and dry-run, verify the **dedicated private Worker scope** and its key storage, configure its narrowly approved QA secrets and native rate limit, attach only its service binding to the existing intake QA Pages preview, then run **one** real synthetic browser HTTP→Worker→same DB→authorized office readback→cleanup test. Never merge/release Production merely because a mock or dry-run passed.
