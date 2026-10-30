# Office access — prepared, disabled, not deployed

`handler.ts` is a server-only request boundary with dependency-injected Auth and database access. It is not an active endpoint. No staff UI or sign-in provider has been connected.

`docs/proposals/FAJR_OFFICE_UNAPPLIED.sql` is an unapplied proposal: private deny-by-default membership, 25-row listing, locked expected-state updates and atomic audit. No membership is automatically granted. Customer sessions and receipt holders gain no access. Only a server service role may call these RPCs after remotely verifying the bearer session with Supabase Auth. Never trust a browser-supplied actor or decoded JWT alone. A read-only member may list but may not update.

Before activation: review existing KAF membership compatibility, approve the isolated office schema extension (the earlier approval covered synthetic intake only), identify the owner's authenticated user, test permissions and transactions in Postgres, add Auth/RPC adapters and rate limiting, build the staff UI with preview/confirmation, then test synthetic records over HTTPS. Do not enable real customer intake as a side effect.

Validation: `node --test server/office/handler.test.mjs` from web-v2. Seven unit checks use stubs. They do not prove SQL security, live authentication or audit persistence. PostgreSQL tests must cover anonymous/customer/nonmember/read-only/updater, revoked membership, competing updates, rollback of audit failures and isolation from KAF cases.
