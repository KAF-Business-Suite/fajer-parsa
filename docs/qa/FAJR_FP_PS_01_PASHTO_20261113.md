# FP-PS-01 — Afghan Pashto as fourth Fajr Parsa website language

Date: 2026-11-13
State: **DRAFT — code candidate / production NOT authorized by this record**
Owner request: Dari → Pashto → English → Arabic, with Pashto as a real site language, not merely a selector label.

## Source of truth and decision

- Repository: `KAF-Business-Suite/fajer-parsa`; develop on `feat/fajr-pashto-ps-af-20261113` from main SHA `c6245e4d5ac043e1287fd202ebabaa84b7f554b9`.
- Runtime: existing Cloudflare Pages `fajr-parsa-qa`; do not create another site, repository, domain or CMS.
- Language codes: Dari `fa-AF` (`fa` URL), Afghan Pashto `ps-AF` (`ps` URL), English `en`, Arabic `ar`. Only English is LTR.
- Translation ownership: the existing Dari-keyed `site-i18n.ts` remains the catalog and stable source IDs; `site-ps.ts` is a separate, reviewed presentation-only Pashto map. No change to service IDs, customer data, case IDs or databases.
- Selected approach: explicit audited Pashto text catalog + dedicated inbound translations + deterministic tests.
- Rejected: displaying a Pashto selector while falling back to Dari, browser auto-translation, arbitrary runtime translation API, second duplicate website or separate Pashto database. Reasons: unstable privacy, quality, cost and inconsistent labels.
- Change and exit path: remove/revert only this feature branch before any promotion; keep existing three-language production and historical Cloudflare deployment. The map is plain UTF-8 and portable.

## Candidate changes

- Four-language menu order and selected state, query parameter `?lang=ps`, `html lang="ps-AF"`, RTL.
- Explicit Pashto catalog for **324 source labels** and exact-key audit; 15 country names and seven Iran visa labels remain stable in data.
- Pashto homepage, country explorer/pages, favorite/filters, detail dialog, safe WhatsApp draft and manual follow-up copy.
- Afghan inbound page: Pashto service cards, travel request form, consent, non-guarantee statements and user-controlled WhatsApp message.
- Pashto inbound title, description, `og:locale=ps_AF`. Language URLs continue to share the existing canonical `/inbound` until per-locale static SEO is separately designed; no `hreflang` claims.
- No automatic messages, bookings, production CRM writes or service changes.

## Measurable acceptance

| Check | Current evidence | Gate |
|---|---|---|
| Source translation-key coverage | Static readback: 324/324 map keys, no missing or orphan keys | PASS (static only) |
| Language order | Source shows fa → ps → en → ar | PASS (static only) |
| TypeScript / full build | Run existing workflow on exact PR head | PENDING |
| I18n catalog contract | Execute `node tests/i18n-contract.mjs` (within `web-v2/`), also included in `npm run test:seo` | PENDING |
| Pages browser regression | `web-v2/tests/seo-pages.mjs` includes ps-AF (320–430px mobile) | PENDING |
| Safe enquiry | Pashto request summary and consent, zero external sends | PENDING browser |
| Real Samsung Galaxy S21 | 100% zoom, menu, scroll, keyboard/Back, RTL overflow, four-language change | NOT TESTED |
| Native Pashto editorial review | Service terminology, consent, privacy, tone and legal copy | NOT REVIEWED |
| Cloudflare Preview / Production | Preview only after CI, Production only after acceptance and explicit release gate | NOT DEPLOYED by this change |

## Risk and scope boundary

- A full Pashto QA claim requires working build/browser results plus native-language review; the static coverage check alone is insufficient.
- Existing WordPress PR #16 and office PRs #14–15 are out of scope.
- Existing Fajr public number and approved manually clicked WhatsApp link are unchanged.
- Keep all server intake and billing gates unchanged; `VITE_FAJR_INTAKE_ENABLED` stays off.
- Existing production Cloudflare SHA must remain `c6245e4d5ac043e1287fd202ebabaa84b7f554b9` until a distinct approved promotion.

## Verification report

This document records the reversible code candidate and acceptance criteria. Update with real GitHub check URLs, Preview deployment URL and owner-device evidence only after those checks actually occur.
