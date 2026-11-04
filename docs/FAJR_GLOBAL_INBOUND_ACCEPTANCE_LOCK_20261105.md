# Fajr Parsa | Global Inbound Tourism — Acceptance Lock

Date: 2026-11-05
Status: Owner-approved acceptance criteria; not approval to deploy, merge, pay, or activate customer data.
Canonical repo: https://github.com/KAF-Business-Suite/fajer-parsa
Stable public URL: https://fajr-parsa-qa.pages.dev/
Working PR: https://github.com/KAF-Business-Suite/fajer-parsa/pull/17 (Draft)

## Locked business and product requirements

1. Use one existing Fajr website and one canonical source of truth. Do not create a new public site, permanent URL or database.
2. Homepage must clearly offer **Afghanistan Inbound Tourism** to visitors and international travel partners.
3. Complete, accurate **English, Afghan Dari and Arabic** content with verified RTL/LTR, readable fonts and language choice visible.
4. Explain what is actually coordinated: airport pickup, private transportation, hotels, interpreter/guide services, tailored itineraries. Do not promise unverified capacity or permissions.
5. Visitor enquiry asks name, reachable contact, arrival date, party size, Afghan destination, desired service and optional notes; validate and show clear consent.
6. WhatsApp transfer is user initiated; never claim booking, data storage, or message delivery unless actually confirmed.
7. Trust: exact verified company legal name, license type/number if owner approved, address, contact details, team support process, service inclusions, exclusions, cancellation and privacy policy.
8. Real Afghanistan images with verified licensing and correct captions; no simulated client reviews, fake hotels or fabricated staff.
9. Mobile-first visual polish plus desktop; 320/360/393/768/1440, real Samsung S21, keyboard navigation, contrast and reduced motion.
10. International discovery: indexable path (hash route only acceptable for preview), valid titles, metadata, sitemap, hreflang and structured data only with verified facts.
11. No KAF duplicate identity, CRM or finance records. Fajr is public acquisition interface; KAF internal staff workflows require auth/organization membership, RLS and audit.
12. Cloudflare remains at the existing stable URL. Full release gate: QA preview, build, browser/mobile and owner approval; no secret, DNS, merge, or deployment without explicit permission.

## Current evidence vs not done

- Implemented on Draft PR #17: inbound page, EN/Dari/Arabic for inbound only, five service categories, form fields, client-side validation and user-initiated WhatsApp draft; regular Dari home is preserved.
- Not implemented/accepted: full-site language coverage, usable live booking/receipt/office intake, verified legal license claims, source-licensed photography, crawlable /inbound URLs, SEO and real Samsung QA.
- Current public Cloudflare production build confirmed read-only on Nov 5: commit 94891bba02354fef36a6af292de9435872568c02 (deployed Oct 29); GitHub main newer; PR17 draft not deployed.
- Caution: security escort is not guaranteed; travel conditions, guide card requirements, permits and visas require current official guidance. The verbal statement from Tourism Directorate is not a written blanket exemption.

## Fajr vs KAF responsibility

Public Fajr: service discovery, incoming inquiries, multilingual communications and quoting. Internal KAF: authenticated staff access, case management, documents, audit, receipts, financial records. The integration boundary requires an explicit server-side identity and data-protection gate.

## References

- https://linear.app/rpcfpta/issue/KAF-31 — protected release process
- https://linear.app/rpcfpta/issue/KAF-22 — intake and office QA
- https://linear.app/rpcfpta/issue/KAF-10 — KAF design system
- https://linear.app/rpcfpta/issue/KAF-7 — KAF alpha
- https://github.com/KAF-Business-Suite/fajer-parsa/pull/17 — scoped public-site implementation