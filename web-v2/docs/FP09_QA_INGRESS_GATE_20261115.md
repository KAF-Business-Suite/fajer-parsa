# FP-09 / QA ingress contract — 2026-11-15

## CURRENT — FP-09 real browser → DB → authorized office readback → cleanup PASS (18 Nov 2026)

**Decision: QA END-TO-END SUBGATE CLOSED / PASS** on the existing isolated Pages alias, using only fictional test data. This supersedes the dated 'Still NOT VERIFIED' statements below for the same QA browser→database test; the old notes are retained for provenance and must not be interpreted as the current verdict.

- Tested URL: https://fp-intake-safe-review.fajr-parsa-qa.pages.dev/?lang=fa ; Cloudflare immutable QA deployment `2d589418-277d-4033-a237-00671705f3f1` (SUCCESS, build merge SHA `cf812273570f78d574f4a97addced033531a42be`; source PR HEAD before this record `608a7e4fec2003536a2affc9a7659b6f764e6b1f`).
- An actual normal browser exercised the service form, confirmed Dari/Pashto/English/Arabic, saw the explicit QA-only warning, used **only** a fictional `@example.invalid` address, checked consent, and passed ordinary Cloudflare Turnstile with visible 'Success!'. **Exactly one submission**, with server receipt `27cbd53d-2a12-4ef8-8c3c-bb15a7581229`. This was not a browser mock, CAPTCHA bypass or public Production request.
- Independent Supabase DB read: **exactly 1 persisted matching synthetic record** (same UUID, service, destination and consent); **PASS**. Existing `public.fajr_office_list` returned that same receipt for an enabled authorized Fajr member (**RPC-based office readback PASS; not an employee interactive login test**). No real employee credentials were read or exposed.
- Cleanup safety: checked referenced office audit rows **0** and matching record fields; deleted **only that precise synthetic receipt** in a guarded transaction; SQL returned **0 records remaining** (**PASS**). No other user/customer data was changed.
- Separately tested `fajr_receive_web_request` new receipt and identical-request replay with an authorized office RPC listing in a transaction that was explicitly **rolled back**, confirming idempotency and zero lasting synthetic rows (**PASS**).
- Exact app CI before the browser test: [independent #44344322778](https://github.com/KAF-Business-Suite/fajer-parsa/actions/runs/44344322778) and [safe Pages QA #44344323844](https://github.com/KAF-Business-Suite/fajer-parsa/actions/runs/44344323844), both **SUCCESS**.
- Explicit environment boundaries: **QA PASS ≠ customer Production authorization**. Public main remains on existing Cloudflare Production `9ded561eae7394f38eb633d3ec890be51df3f830`; Cloudflare QA proxies allow synthetic emails only. KAF-31's seven production approval checks, legal service scope, privacy/retention and genuine staff S21 login/logout are still separate. Preserve fail-closed Production gate.
- **Next big gate:** Finish authorized Fajr Office/Identity/Session acceptance under existing **KAF-35 + PR #14**: user opens/reloads same view, log-out blocks relogin, role-aware Fajr data, mobile S21 Back, audit/rollback, then reconfirm remaining customer-facing legal and production release checks under KAF-31. No duplicate app, repo, database, issue or paid provider.

## CURRENT — isolated QA Pages route published; live HTTP rejection tests PASS

**Authoritative checkpoint after PR #24 code commit `b23cf575c54d8903e2ec05418b6b564fdf7b2c6a`.** The earlier private Worker and service-binding plan below is **historical only** and must not be implemented by default. Continue the same PR, KAF-25 and KAF-31; create no micro-gates.

- **Actual QA route:** https://fp-intake-safe-review.fajr-parsa-qa.pages.dev, Pages project `fajr-parsa-qa`, preview branch `fp-intake-safe-review`, deployment `d4c00bff-2a9c-4491-8865-fe68273c134b`, build SHA `24b5b4537f15fa0f04c15532f051ee58ebc24fc8` (synthetic PR merge); Cloudflare readback SUCCESS. Production SHA `9ded561eae7394f38eb633d3ec890be51df3f830` unchanged.
- **Existing CI:** The safeguarded PR-only workflow builds with the **public** pre-existing QA Turnstile sitekey and temporarily stages only `qa-only/functions/api/requests.ts` under the Pages `functions/` path. The ordinary production build remains static and intake OFF. The source `web-v2/functions/` is absent; nothing was merged into main.
- **Backend reused:** Secret-free Pages Function checks exact QA Origin, POST path, 4-KiB body, and synthetic-only `@example.invalid` contact, then forwards to existing Supabase Edge `fajr-web-intake-qa` v4. Edge owns its existing server secret, real Turnstile hostname/action validation, database-wide QA quota, idempotency, and existing `fajr_receive_web_request` RPC. Database public anon/authenticated cannot execute the sensitive RPCs. Older Cloudflare `fajr-intake-gateway-qa` remains no-route, no-secret, deny-only.
- **Evidence:** GitHub runs 43749355338 and 43749355339 are SUCCESS. Live GitHub runner HTTP smoke proved: QA HTML GET 200; wrong-Origin POST 503; non-synthetic contact POST 400; a syntactically valid synthetic request with deliberately invalid Turnstile challenge POST 403 `challenge_failed`. None of these tests creates a database receipt. Supabase readback still shows 4 old synthetic rows and 0 new rows from `qa-ci@example.invalid`.
- **Still NOT VERIFIED:** a **valid** browser Turnstile token, accepted synthetic receipt UUID persisted in DB, staff-authorized office readback, and synthetic cleanup. QA preview is working, but end-to-end customer submission is not yet PASS; real Customer Production remains OFF.

**One necessary owner action:** Using a trusted browser/device, open the QA alias, select `ویزا و اقامت` and `امارات`, use fictional contact `qa-fp09@example.invalid` only, consent to synthetic storage, finish the normal Turnstile widget, submit once, and return only the UUID receipt or a screenshot with contact concealed. If form/widget is missing, report the screen; never enter customer data, keys or real contact details.

**Agent next step:** match that receipt in the existing KAF database, prove the staff-authorized Fajr Office readback, clean up the synthetic QA case under the existing authority, and update existing KAF-25/KAF-31 with precise evidence. No new database, billing, public release or messaging.

**Rollback:** keep Production unchanged; in a QA problem, revert the QA preview deployment or PR-only workflow. Do not activate the private Worker as a bypass.

---

## Historical planning/bootstrap evidence (preserved below, superseded by CURRENT above)

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

## Architecture mini-decision — reuse existing Cloudflare, no new business system

- **Rejected: privileged Supabase key directly in Pages Preview.** Cloudflare Pages Preview variables/bindings can span branches; an unrelated preview must not gain a database credential. The Pages Functions binding documentation lists a supported subset and does not document the Workers native rate-limit binding as a direct Pages binding: https://developers.cloudflare.com/pages/functions/bindings/ .
- **Selected for QA preparation: existing Pages hostname → secret-free Pages Function → private Worker service binding**. The private Worker holds the server Supabase credential and Turnstile secret and has a native `FAJR_RATE_LIMIT` binding. `workers_dev=false` with no public route reduces exposure; still verify actual binding scope and the service trust boundary before deploying. Both hops fail closed when flag/binding/host/challenge is wrong. No new database, app, CRM or user-visible website.
- **Alternative held:** existing Supabase Edge Function could host an HTTP adapter, but requires separate authentication, request-quota and secret-scope review and would touch the existing Edge runtime; do not introduce it merely to dodge an incomplete QA test.
- **Rate limiting precision:** Cloudflare Worker rate limits are approximate and local to each Cloudflare location, not strict worldwide quotas, and IP-based keys can group customers on shared mobile networks. Test expected abuse controls against the actual Fajr traffic and preserve upstream request quotas: https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/ .
- **Portability/exit:** `/api/requests` JSON/UUID receipt contract and PostgreSQL `fajr_receive_web_request` remain app-owned; the thin private Worker adapter can later be replaced by another HTTP runtime without changing customer records or office permissions. Review if service binding, rate-limit accuracy, free-tier sustainability or secret scope changes materially.
- **Approval gate:** Code/CI/dry-run are preparation only. Creation or deployment of the private Worker, storing secrets, binding it to Pages Preview, making real network writes and any Production change are **NOT AUTHORIZED by this design document**. No additional user-facing gate is opened; continue KAF-25 / KAF-31 / FP-09.

## Authorized QA-only bootstrap readback — 2026-11-15

**Owner approval:** Permission given in chat to create the private FP-09 Cloudflare QA function and prepare an isolated, synthetic-only test connection. No approval was given for Production release, live client outreach, paid plans or changing the Supabase schema.

**Created:** Cloudflare Workers script `fajr-intake-gateway-qa` in the already-connected Cloudflare account. Its exact **initial deployed source** is versioned in `web-v2/qa-only/worker/bootstrap-disabled.mjs` (Git blob `277dfca53dfba5fdeca8aff24a470f198083d940`). This is an intentionally **always-deny** module, not the full `entry.ts` bundle and not live customer intake: for the expected QA POST it returns HTTP 503 `intake_not_enabled`; for other hosts/routes/methods HTTP 404. It makes **no network requests or database writes**, regardless of environment values.

**Direct Cloudflare readback:** Worker script exists; subdomain `enabled=false`, `previews_enabled=false`; list of Worker secrets is empty; no Worker bindings configured. Cloudflare Pages `fajr-parsa-qa` has **no preview services/env_vars**, so no deployed Pages-to-Worker connection. Production Pages SHA `9ded561eae7394f38eb633d3ec890be51df3f830`, Office Worker version `17eaf4ed-5372-4f7d-b168-14719aa4ecb3` 100% unchanged.

**Next remaining dependency:** Deploy the reviewed **actual private Worker application bundle** (rather than the safe bootstrap), with an isolated least-privilege server credential stored only in that private Worker, approved Turnstile secret, native rate-limit binding and strictly scoped Pages service binding; prove a true browser QA POST → existing Supabase RPC → authorized Fajr office readback → synthetic data cleanup. The connected Supabase app currently exposes publishable keys but no privileged server key through its available actions; **never substitute a public/anon key or copy any secret into Git/Linear/chat**. Current Worker stays disabled until this credential and runtime isolation are established. Existing FP-09/KAF-25/KAF-31 remain open, not new gates.

**Evidence discipline:** Creating a no-route Worker script, successful synthetic tests, compile/dry-run and an administrative readback do not constitute a functioning public customer registration. Do not report this step as end-to-end acceptance or Production readiness.
