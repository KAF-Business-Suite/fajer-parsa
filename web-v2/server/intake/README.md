# Fajr central intake — current execution path

The active QA server is Supabase Edge Function `fajr-web-intake-qa`, using `edge-entry.ts`, `edge.ts`, `handler.ts` and `adapters.ts`. It reuses runtime-injected Supabase server credentials. The Turnstile credential is stored in encrypted Supabase Vault, returned only through a service-role-only, fixed-purpose RPC; no secret value is in source or browser output. This avoids transferring the broad database credential to Cloudflare.

The existing Supabase organization plan was verified `free/tier_free` through get_organization. No project, paid branch, paid Worker, upgrade or billing change was created. One free Turnstile widget is restricted to the exact QA hostname. Configuration is in `web-v2/config/intake-qa.json` (public identifiers only).

The private database gate is deny-by-default and uses a serialized GLOBAL cap of 12 attempts/minute and 100/day. It is not per-IP. A service-only switch can disable the server immediately. Daily windows use database UTC. QA accepts only synthetic `@example.invalid` contacts; production origin is refused. Data API public reads/writes remain denied. No customer tracking/office authorization has been exposed.

`pages-entry.ts` is an inactive alternative, kept outside `functions/`; do not deploy it or configure Cloudflare server keys for the selected Supabase path. Historical instructions below are superseded by this section.

See `docs/FAJR_EDGE_INTAKE_20261030.md` for current proof and remaining live acceptance. Never confuse local mocked browser tests with real HTTPS receipt proof.

# Prepared server intake — NOT DEPLOYED

These server files are intentionally outside `functions/` and Vite `src/`. A normal static build cannot expose them. No client UI calls this endpoint yet, and the isolated table/RPC migration has now been applied with owner approval. See docs/FAJR_INTAKE_DATABASE_QA_20261030.md.

Activation prerequisites (explicit owner approval required):
1. DONE: the approved isolated migration is recorded at `supabase/migrations/20261030_001_fajr_web_intake.sql`; separate table, no anonymous reads or writes, no existing-case mutation.
2. Set server-only Supabase credential and Turnstile secret. Never commit keys or use VITE_ secrets. Prefer a dedicated server role limited to the intake RPC when the platform supports it; the provided Supabase adapter uses service-role credentials, which are broad and must remain server-only.
3. Add a Pages Functions entrypoint with a required rate-limit binding, trusted `CF-Connecting-IP`, exact QA origin, `enabled` false until reviewed, and the injected adapters. Do not silently substitute in-memory production rate limiting. No new paid resource is authorized.
4. Add the real Turnstile widget/action `fajr_intake`, contact+consent fields, explicit submit, stable UUID across retries, and render receipt only from a successful server response. Never treat WhatsApp opening, copying, a client UUID or a network timeout as receipt.
5. Test isolated synthetic intake, duplicate replay, wrong origin, challenge/rate rejection, database outage, authenticated staff visibility and Samsung. The owner authorized isolated synthetic QA writes on 2026-10-30; this does not authorize real customer submissions or changes to existing KAF cases.
6. Staff access/assignment and a secure customer tracking portal require a separate authorization design. Do not publish table reads, contact details or passport files. A receipt alone must not unlock a customer case.

Current tests exercise handler/adapters with stubs. They do not prove real Turnstile, rate-limit binding, HTTP-to-database delivery, email delivery or staff/case integration. Separate database QA has verified SQL execution, persisted synthetic storage, replay and access restrictions. No customer message is sent.

Run: `node --test server/intake/handler.test.mjs` with Node 24.22.1.
