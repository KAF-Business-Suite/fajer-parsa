# Fajr Parsa — central intake preparation, 2026-10-30 Kabul

## Observed existing systems (read-only)
- Existing KAF Supabase project is active. Table/function metadata were inspected, not customer records.
- No dedicated Fajr website public intake table or verified public website intake endpoint was established. Existing `kaf-google-intake` is a separate Google integration; its name alone is not permission or evidence that it accepts public website requests.
- Airtable `Visa Application Tracker` exists with Clients, Visa Applications and Embassy Requirements tables. Its standalone Visa Application Submission form and interfaces are drafts, not published. Its client schema includes passport/date-of-birth/attachments; these are unnecessary for initial website contact. No Airtable record, page, form or permission was changed.
- Source of truth remains the existing Fajr repository. Do not create competing customer masters in Airtable and KAF.

## Prepared, not enabled
- Server-only bounded request handler, exact-origin check, required anti-bot and rate-limit interfaces, consent/contact validation, rejection of unknown fields.
- Supabase server adapter and Turnstile hostname/action verification; neither is called from the deployed website.
- Review-only SQL creates a dedicated Fajr intake table and service-only RPC. Unique request ID supports safe retries; changed payload with reused ID is rejected. Receipt is returned from storage, never fabricated by the client.
- No public customer lookup. Staff visibility and authenticated customer tracking remain future work; a receipt does not grant access.

## Validation
- Node 24 server tests: 13 PASS, 0 FAIL. Tests use synthetic fixtures and injected stubs, not remote database or customer data.
- Strict TypeScript check for server modules: PASS.
- Existing frontend production build: PASS.
- SQL execution, live database insert/replay, actual Turnstile, deployed rate limit, staff authorization and Samsung acceptance: NOT TESTED.
- No frontend change or new deployment this step; previous public QA remains the same application.

## Explicit next approval
The standing prohibition on database changes remains in effect. Before activation, approve the isolated table/RPC in `FAJR_INTAKE_UNAPPLIED.sql`, QA-only server bindings/Turnstile configuration without paid resources, and synthetic write tests. No changes to existing KAF customer/case tables, public production, billing, automatic messages or existing RLS are included. A trusted QA origin and privacy/consent wording must be configured before collecting real inquiries.

No secret, token, customer record or private document is included in these files.
