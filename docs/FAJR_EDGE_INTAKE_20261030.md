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

## Pending final publication/acceptance record
Live QA deployment, actual Turnstile pass and stored receipt reconciliation will be recorded after verification. Production `0b742f3b-a6d9-463e-9900-ad9669da3046` remains the owner-approved website; central intake stays off there. No production server permission is implied.

## Sources
- https://developers.cloudflare.com/turnstile/plans/
- https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
- https://supabase.com/docs/guides/database/vault
- https://supabase.com/docs/guides/platform/manage-your-usage/edge-function-invocations
