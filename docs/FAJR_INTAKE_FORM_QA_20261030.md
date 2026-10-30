# Fajr request form connection preparation — 2026-10-30 Kabul

## Implemented in the existing application
- Opt-in central intake section after request review; disabled unless both VITE_FAJR_INTAKE_ENABLED=true and a public VITE_FAJR_TURNSTILE_SITEKEY are supplied at build time. No environment values were enabled on Cloudflare.
- Minimal contact + explicit consent; live travel dates/traveler count, passports, nationality and documents are not included in the central intake payload. The section explains this scope and is marked synthetic QA only.
- Same-origin JSON POST to /api/requests with a bounded timeout; no credential in browser source/URL, no cookies, no redirect forwarding, no local storage of contact details.
- Receipt shown only for a validated 200/201 server response containing status=received, UUID receipt and boolean replay flag. HTTP errors/malformed success never generate local receipts.
- After a submission attempt, inputs are frozen and in-modal retries retain the same request ID with a fresh challenge. No repeated success submit control. Closing/reloading loses this in-memory retry context; the form explicitly warns that a fresh form can create another request. Cross-reload recovery is NOT implemented.
- Prepared server entrypoint remains outside auto-deployed functions/. It refuses the production/immutable host, missing rate limiter, missing encrypted server credentials, missing Turnstile secret or disabled flag. It uses the existing bounded handler/adapters.
- Existing read-only GitHub Actions workflow now runs local server/client unit tests before build; no deployment/schedule/secrets added. No dependency or lockfile change.

## Validation and limits
- Strict frontend typecheck and standard build: PASS.
- Server entrypoint strict TypeScript: PASS.
- Client/server Node tests: 20 PASS.
- Local browser with isolated test build, intercepted API and simulated widget: 7 PASS (consent, contact validation, unavailable API, stable-ID retry, valid receipt, malformed receipt, responsive widths/no runtime errors).
- Existing default-feature-off browser suite: 41 PASS; no runtime errors or external assets in that suite.
- The isolated browser test uses a separate temporary build and never publishes test keys, fake receipts or a mocked backend. Results are test evidence, NOT live intake proof.
- Default production bundle remains 474.58 kB minified / 152.43 kB gzip; the new UI is disabled and removed from normal runtime paths. Existing public QA was not redeployed in this step.
- Live end-to-end HTTP storage, actual Turnstile, rate binding, Samsung, staff/case access and customer tracking: NOT TESTED / NOT ENABLED.

## Current activation blockers
The database table/RPC already exist with one synthetic record (see FAJR_INTAKE_DATABASE_QA_20261030.md). Current Cloudflare preview has no server variables/service bindings. The connected Supabase tools cannot provision a service secret for the Cloudflare runtime. No broad server key was fetched, copied or committed. A trusted rate limiter and real Turnstile setup are still required. The existing Pages API settings surface does not establish a usable native rate-limit binding; select and validate a supported server deployment before placing pages-entry.ts into a live functions route.

Cloudflare GET account subscriptions returned 403: the OAuth connection lacks Billing Read/Write. Its account setting usage model=standard is NOT evidence of a free plan. No billing scope/token was requested, no plan changed and no new server resource was created. Continue to respect no-new-cost authorization; do not infer free server capacity from a static Pages site.

Production, Git main, existing KAF cases/customers and messaging were not changed. Owner approval for isolated QA remains valid; no repeat permission is needed for that same scope. Configuration/capability limitations must be resolved before enabling public intake.
