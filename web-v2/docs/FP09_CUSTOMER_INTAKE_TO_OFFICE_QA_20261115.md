# FP-09 — Fajr Parsa enquiry → server receipt → authorized office

Date: 2026-11-15 (Afghanistan)
Ownership: existing Fajr Parsa `KAF-25` + production control `KAF-31`. **Do not create a second database, office or app.**

## Findings from the deployed schema (read-only)
- The existing `public.fajr_receive_web_request(payload jsonb)` inserts into the current `public.fajr_web_requests` table and returns a **persisted UUID receipt** plus a replay flag.
- Its existing `ON CONFLICT (request_id)` path returns the same saved receipt only when the payload matches. Contradictory repeats fail.
- The existing `public.fajr_office_list(actor,offset)` uses an authorized active member for Fajr Parsa and returns an explicit selection from that same table, 25 records per page. `fajr-office` Edge handler performs external JWT verification and staff authorization; it must never be bypassed for an internet visitor.
- The public frontend `CentralRequest` and `submitIntake` already exist. They are not enabled in the deployed public Pages site: `centralIntakeEnabled` requires `VITE_FAJR_INTAKE_ENABLED=true` and a Turnstile site key, and the prepared `server/intake/pages-entry.ts` is **deliberately not placed in `functions/`**. There is therefore **no actual public customer-to-office submission yet**. The existing WhatsApp/email draft is a valid customer communication channel, *not* an automatic office database insert.

## Actual database proof, without persistent test records
A controlled SQL transaction was run against the existing Supabase project:
1. Use `gen_random_uuid()` and synthetic-only `fp09-transaction@example.invalid`, service `ویزا و اقامت`, destination `امارات`.
2. Call `fajr_receive_web_request(payload)` and assert a new stored UUID, `replayed=false`.
3. Call the same function with the same `request_id`, assert **same receipt** and `replayed=true`.
4. Call `fajr_office_list` with an existing authorized Fajr staff identity selected internally using the active membership checks; assert that the returned JSON contains that exact receipt with status `received`.
5. Issue `ROLLBACK`, then assert `count(*)=0` for the synthetic contact. **Result: PASS / 0 persisted QA rows.** No real customer data, messages, payments, secrets or live websites were changed.

This demonstrates the **database contract and office readback**, not that live browser-to-Cloudflare Turnstile-to-DB ingress is enabled or safe for Production.

## Frontend enhancement
- Server-validated UUID receipt is the only source of success, never a client-minted short ID.
- `IntakeReceipt` presents localized confirmation in fa/ps/en/ar, a selectable full reference, **Copy** and **Download receipt**. Download contains only the receipt, selected service and destination; no customer contact or secret token.
- Browser test `tests/intake-form.mjs` simulates HTTPS receipt responses with a stubbed, synthetic endpoint and Turnstile. The test verifies that timeout/invalid response yields no receipt, retry preserves ID, download matches the server receipt, no contact leaks and mobile widths fit. This test **does not submit to Production**.
- The production office Worker, live homepage, live intake bindings, auth, data model and operational staff credentials are unchanged.

## Next single gate, before actual customer intake is on
Authorize **one existing QA-only Pages ingress** with complete server-only Supabase and Turnstile credentials, exact origin allowlist, trusted rate limiting, consent, abuse prevention, idempotency, no-client-secrets and auditable rollback. Prove browser submit → persisted server receipt → authorized office list → status action with **synthetic data only** and cleanup. Until these controls are verified, public form remains disabled and the user can contact Fajr Parsa by working WhatsApp or email. Enable Production only with separately reviewed business and technical evidence under KAF-31.

**Gate claims:** database integration in rollback = PASS; receipt component in branch + browser intercepted QA = awaiting this SHA CI; actual QA ingress = BLOCKED; public central registration = OFF; Production / office Worker untouched.
