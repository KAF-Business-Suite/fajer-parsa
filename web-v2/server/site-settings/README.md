# FP-SITE-CONTROL-01 | Fajr Parsa self-service website management

**Canonical PR:** #24, with release gate KAF-31, content/service gate KAF-25, owner UI in existing Fajr Office PR #14/KAF-35. Do not create a second website, database, project, role system or issue.

## What exists in code (16 Nov 2026)
- Public contact and server-issued receipt use the same safe runtime settings client.
- Reader requests `GET /api/site-settings/public` from the **same origin**. It accepts only a validated versioned public snapshot; if unavailable, it keeps the existing working contact values.
- The contract allows only approved WhatsApp, office email, optional phone, optional HTTPS map link and an enumerated font preset. No arbitrary CSS, scripts, client secrets, user data, draft text, internal roles or migration logic is accepted.
- Contract test runs in both independent GitHub CI and fail-closed Pages release checks.
- **Not live yet:** the read API, private owner editor, draft/publish/rollback store and authorized publishing workflow. No one should say self-service edits currently persist or publish.

## Final owner experience — one mobile-first Website Settings screen
Place this in the **existing Fajr Office** behind its HTTP-only secure session and current KAF/Fajr membership. Keep four languages (Dari, Pashto, English, Arabic).

Sections: 1) Contacts and channels: official phones, WhatsApp, email; 2) Office and map: verified office addresses, safe map URL, opening times; 3) Brand and appearance: existing official logo, approved type/font/theme presets, no arbitrary CSS; 4) Content: translations, notices, FAQs and service visibility subject to independent legal/source review; 5) Preview/Publish: diff by field, all languages/mobile preview, one explicit confirmation, audit/revision, rollback.

**Editing contract:** `GET/PATCH /api/site-settings/draft` and `POST /api/site-settings/preview`, `POST /api/site-settings/publish` and `POST /api/site-settings/rollback` on the same origin behind owner/editor role checks and CSRF. No anonymous write; no service-role token in browsers; no live customer data in draft. Publishes must use expected revision (optimistic lock), explicit owner confirmation, immutable previous version and server audit. Only the published **public-only** shape may be returned from `GET /api/site-settings/public`.

## Storage decision
Use the existing Supabase project with new Fajr-only private publication/audit records and explicit allowlisted public projection after **reviewed, gated** migration. The existing `public.app_settings` and `public.branding_profiles` tables are per-owner user data, not a safe global publication store. Do not repurpose them without tenant authorization. No schema changed in this step. The final permission model must follow existing `fajr_private.office_members` and KAF business membership isolation; no bypass or blanket `anon` grant.

## Publishing criteria
PASS only after real authorized manager edit → draft readback → four-language preview → explicit confirm → public snapshot readback on QA → audit history → rollback → user-level mobile verification; independent negative tests for non-member, wrong tenant, forged CSRF, stale revision, unsafe map URL, private fields. Still under existing KAF-25/KAF-31 until business claims/legal and security gate is cleared.

No verified dedicated corporate domain or corporate mailboxes are currently connected to the inspected Cloudflare account (zone inventory empty). Domain and email work is in existing KAF-33; a free incoming forwarder is not an outbound SMTP mailbox. Until DNS and legitimate sender exist, never advertise `info@` or `contact@` as operating addresses.

No new secret, database, domain, deployment or paid plan was created by this code change.
