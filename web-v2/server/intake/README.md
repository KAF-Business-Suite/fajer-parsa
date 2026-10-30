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
