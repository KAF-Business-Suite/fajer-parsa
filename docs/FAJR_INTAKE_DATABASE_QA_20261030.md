# Fajr intake database QA — 2026-10-30 Kabul

Owner explicitly approved the previously reviewed isolated table/RPC and synthetic QA writes. Applied migration: `fajr_isolated_web_intake_20261030`. Existing KAF customer/case tables and policies were not changed.

## Actual remote database results
- PASS: table and service-only RPC created; RLS enabled.
- PASS: one synthetic request stored, receipt returned from database.
- PASS: exact retry returned the same receipt with replayed=true; still one row.
- PASS: reused request ID with different payload rejected.
- PASS: consent=false rejected by database constraint.
- PASS: anon and ordinary authenticated users lack read/RPC permission. Anon lacks insert permission. Service role has RPC execution permission.
- Stored synthetic rows: 1. Total isolated intake rows: 1. Contact is a reserved example.invalid synthetic address; no real customer information was used.

## Deployment and remaining boundary
No public endpoint was deployed and no form was connected in this step. HTTP submission is NOT TESTED. Cloudflare Pages preview has no configured secret variables or service bindings. The connected Supabase tool supplies public/publishable keys, not a server-only secret provisioning operation. The server credential therefore cannot be safely provisioned through the current tools without an existing server-side binding or owner action in the provider's secret settings. Do not paste a key in chat, source or VITE_ variables; do not weaken RLS to use the public key for writes.

Real Turnstile keys/widget and a trusted server rate-limit binding remain unconfigured. Do not use public test keys as live bot protection or an in-memory limiter as a production substitute. Staff authorization and customer tracking are not implemented. Only synthetic database QA is proven.

Cloudflare production deployment remained `18c04074-6b1f-4a03-bf07-a9855944361f`. No billing setting, paid resource, main branch, production deployment, customer message or existing customer record was changed. Prior public QA continues to offer review/copy/WhatsApp, without claiming central submission.

Current review-only SQL proposal remains historical. Use the applied migration for provenance; do not apply both or rerun table creation.
