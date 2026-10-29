# Fajr isolated Edge intake — 2026-10-30 Kabul

Owner authorization: isolated intake, QA-only server/anti-bot configuration and synthetic writes; no new cost, existing customer/case mutation, automatic messaging or main change.

## Provisioned
- Existing Supabase organization verified plan=free, tier=tier_free.
- Existing project reused, new function `fajr-web-intake-qa` version 3, with request-body Turnstile validation. Gateway JWT verification is off for this public synthetic intake; the function validates exact Origin, payload, consent, real Turnstile action/hostname and global database rate gate before storage. This is not staff authentication.
- Native runtime service-role credential reused, never fetched or sent to Cloudflare/browser. One fixed-purpose service-only config RPC reads the one encrypted QA Turnstile credential in Vault.
- One free, non-interactive Turnstile widget on the exact QA hostname. Real siteverify validation required; no dummy live keys or bypass.
- Applied platform-generated migration `20261029204124_fajr_intake_qa_gate`: private RLS table, private enable/quotas, service-only configuration and rate RPCs. Global caps 12/minute and 100/UTC day, serialized in Postgres. Denied attempts do not exceed quota; one actor can consume this small shared QA budget.
- Public configuration file contains only sitekey, allowed origin and fixed Edge endpoint. No secret/token is committed.
- Only synthetic @example.invalid contact values allowed. Real contacts are rejected. Existing intake table remains inaccessible to anonymous/ordinary authenticated users.

## Validated
- Database quota tests: disabled gate refuses; only 12 of 13 attempts allowed; 100/day cap refuses. Tests rolled back their quota changes.
- Permission checks: anonymous/authenticated roles cannot execute secret RPC or read decrypted Vault; anonymous role cannot execute quota RPC.
- Strict TypeScript/build: PASS. Client/server tests: 28 PASS. Local browser form tests: 7 PASS with stubbed widget/API; not live proof.
- First live request exposed the internal HTTP runtime URL behind the Supabase HTTPS proxy. The Edge adapter now normalizes to its fixed canonical HTTPS endpoint only after exact-origin validation; a regression test covers it. No browser TLS warning was bypassed.
- Security advisors: two INFO findings for RLS enabled with no policies (the private control table and service-only intake table). Intentional deny-by-default; public policies were not added to silence them. Other existing project findings were not changed.

## Live publication and acceptance
- QA deployment: 394e17b6-433f-4c4b-95ce-d4e2a4e5de6c, preview success; application source 1260b1dbbfdf0ebe5860950e982db822e7a7a3db, source tree ff7b4e32b9115b8c73007e5a6e41da1aad75eb31. Public build flags were enabled only for this QA build; production defaults remain off.
- URL: https://qa-fajr-visual-review-202610.fajr-parsa-qa.pages.dev/#/country/ir
- Real HTTP negative checks PASS: exact QA preflight 204, invalid Turnstile 403 challenge_failed, missing fields 400, production origin 403 origin_denied.
- Browser used the real, non-interactive Turnstile widget without mock/interception or a manual challenge solve. Clicked Iran tourist visa, reviewed, entered only a reserved synthetic email, checked consent, submitted via the live Edge endpoint.
- Browser displayed database receipt 38949594-f6af-48af-9f57-a47371f9f46d. Database read independently reconciled the same receipt, request ID 3c7beb58-a847-47e9-8efb-59b2ab41269c, Iran/tourist visa, consent=true, status=received and exactly one matching synthetic row. Stored at 2026-10-29T20:49:46.547121Z (30 October Kabul).
- Replaying that exact payload through the real database RPC returned the same receipt and replayed=true, without another row. This is database replay proof, not a claimed second live browser HTTP replay.
- Actual browser → real Turnstile → live Edge → persisted database → visible receipt: PASS. No real customer data or message was sent.
- Production remains 0b742f3b-a6d9-463e-9900-ad9669da3046. This phase does not activate real customer intake or change production origin authorization.
- Samsung hardware, HTTP retry after ambiguous delivery, spent-token replay and authorized staff/case integration remain NOT TESTED / unfinished. Synthetic-only mode must not be marketed as customer intake.


## Sources
- https://developers.cloudflare.com/turnstile/plans/
- https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
- https://supabase.com/docs/guides/database/vault
- https://supabase.com/docs/guides/platform/manage-your-usage/edge-function-invocations
