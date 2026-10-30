# Office access — prepared, disabled, not deployed

`handler.ts` is a server-only request boundary with dependency-injected Auth and database access. It is not an active endpoint. No staff UI or sign-in provider has been connected.

`docs/proposals/FAJR_OFFICE_UNAPPLIED.sql` is an unapplied proposal: private deny-by-default membership, 25-row listing, locked expected-state updates and atomic audit. No membership is automatically granted. Customer sessions and receipt holders gain no access. Only a server service role may call these RPCs after remotely verifying the bearer session with Supabase Auth. Never trust a browser-supplied actor or decoded JWT alone. A read-only member may list but may not update.

Before activation: review existing KAF membership compatibility, approve the isolated office schema extension (the earlier approval covered synthetic intake only), identify the owner's authenticated user, test permissions and transactions in Postgres, validate the Auth/RPC adapters and rate limiting, build the staff UI with preview/confirmation, then test synthetic records over HTTPS. Do not enable real customer intake as a side effect.

Validation: `node --test server/office/handler.test.mjs` from web-v2. Seven unit checks use stubs. They do not prove SQL security, live authentication or audit persistence. PostgreSQL tests must cover anonymous/customer/nonmember/read-only/updater, revoked membership, competing updates, rollback of audit failures and isolation from KAF cases.

## Auth/RPC bridge — 30 October, prepared only

`adapters.ts` now supplies the handler's dependencies through the existing project's HTTPS Auth `/auth/v1/user` and the two proposed RPCs. Auth is checked afresh for each request; user metadata, email matching, local JWT decoding and anonymous-sign-in users are not accepted as office authority. RPC permission checks still decide membership. The server key is never the caller's bearer token. Redirects are refused, calls have timeouts, and only the expected list/change fields reach the caller. This file is not imported into the client and is not a deployed route.

The handler requires an injected shared atomic `rateLimit(user)` quota. Denial returns 429; missing quota, Auth outage or RPC failure fail closed. The default adapter now calls the proposed `fajr_office_take_slot` database RPC; it is implemented in the unapplied SQL proposal but is not provisioned live. Do not use an in-memory counter or `async()=>true` in a real deployment. Unit fixtures may stub it. Office activation remains blocked until the quota implementation and SQL permissions/audit have been independently tested.

Metadata-only database inspection found `public.business_members` with `workspace_id`, `user_id`, `role`, `companies`, `status`, plus `business_role_permissions`. It did not establish which workspace/company/role may access Fajr intake. No membership rows, customer rows or Auth identities were read; no automatic grant or KAF membership reuse was added. The live `fajr_private` schema currently contains intake control, not office membership/audit tables.

Run `npm run test:office` (19 handler/adapter checks) and `npm run typecheck:office`. CI runs both. Tests use synthetic fetch responses; they do not establish live sign-in, membership authorization, rate-limit persistence, database audit or Samsung acceptance. No schema, role grant, deployment or production intake setting was changed.

Primary verification reference: https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/auth/jwts.mdx


### Shared quota preparation — 2026-10-30

The proposed RPC admits 60 requests per enabled office member in each 60-second fixed window. Membership row locking serializes admission across server instances; the time is captured after acquiring the lock. A saturated window returns false without increasing its count. Expired windows reset on demand. A fixed window can admit a burst across the boundary; it is not a rolling-window or pre-authentication/IP limiter. HTTP `Retry-After: 60` is conservative. A member has at most one quota row, deleted with their membership. Revocation is checked again by list/change RPCs.

`npm run test:office:postgres` requires `psql` and a **disposable** loopback database named `fajr_office_test`, supplied in `OFFICE_TEST_DATABASE_URL`. It creates fixture roles/tables and applies the proposal only in that database. The separate CI PostgreSQL 17 service tests 80 admissions in concurrent waves (exactly 60 accepted), expiry, member isolation, revocation, RPC/table permissions and no request reads/writes. Do not run it against an existing database. This quota test does not establish full list/change audit transaction security or live Supabase compatibility. No HTTP endpoint is mounted.
