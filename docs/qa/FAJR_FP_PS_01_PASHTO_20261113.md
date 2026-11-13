# FP-PS | FINAL RELEASE STATUS — 14 November 2026 (Asia/Kabul)

**CURRENT: FP-PS-01/02/03 CLOSED — PASS for code, tests, preview, authorized production release, and live Chromium QA.**
**NEXT: FP-PS-04 OPEN — independent Afghan Pashto language review + physical Samsung Galaxy S21 acceptance (UNVERIFIED).**

This section replaces the obsolete DRAFT/PENDING claims preserved below only as historical evidence. The deployed application is public now; do not interpret the old checkpoint as a current no-deploy instruction.

## Current authoritative release

- Official repo: `KAF-Business-Suite/fajer-parsa`, one source of truth; canonical [merged PR #19](https://github.com/KAF-Business-Suite/fajer-parsa/pull/19). Merge SHA `9ded561eae7394f38eb633d3ec890be51df3f830`.
- Duplicate [PR #20](https://github.com/KAF-Business-Suite/fajer-parsa/pull/20): **CLOSED / SUPERSEDED / not merged**. Its additional 20 guarded form notices and the nationality label correction were incorporated in PR #19 before review and release. No second website or translation catalog.
- Language menu: **دری → پښتو → English → العربية**; Pashto `ps-AF`, RTL and `?lang=ps`. Existing English, Dari, Arabic unaffected in the scoped checks.
- Locales and services: 324/324 checked Pashto display strings, 15 country options, inbound five services, user-controlled draft WhatsApp and consent warnings. Stable service/data IDs unchanged.
- Runtime: existing Cloudflare Pages project `fajr-parsa-qa`, environment **production**, branch `main`, live SHA `9ded561eae7394f38eb633d3ec890be51df3f830`, deployment **`16950d0e-b5f6-42e5-bb83-3fc3bdd26e55`**, provider status **success**.
- Live links: [main site in Pashto](https://fajr-parsa-qa.pages.dev/?lang=ps); [Afghanistan inbound in Pashto](https://fajr-parsa-qa.pages.dev/inbound?lang=ps).

## Acceptance evidence — exact execution

| Gate | Status | Evidence |
|---|---|---|
| FP-PS-01 i18n, unit tests, TypeScript/build and SEO | **PASS** | [Independent candidate CI #43498447726](https://github.com/KAF-Business-Suite/fajer-parsa/actions/runs/43498447726) SUCCESS, candidate SHA `4d96b1465c98070891e780f9e1f598c8aa8c1d19` |
| FP-PS-02 Cloudflare Preview and protected checks | **PASS** | [Preview deployment workflow #43498676629](https://github.com/KAF-Business-Suite/fajer-parsa/actions/runs/43498676629) SUCCESS; [immutable Preview](https://4dcb4408.fajr-parsa-qa.pages.dev/?lang=ps), ID `4dcb4408-9135-49de-91bd-87ae159179ae`, exact candidate SHA |
| FP-PS-02 browser review | **PASS** | Independent Chromium main/inbound **20/20** checks across four languages and widths 320, 393, 768 and 1440px; plus eight language, navigation, form and user-privacy interaction checks. Zero console page errors or horizontal overflow in those cases |
| FP-PS-03 controlled merge | **PASS** | Canonical PR #19 merged. [Post-merge `main` CI #43499282955](https://github.com/KAF-Business-Suite/fajer-parsa/actions/runs/43499282955) SUCCESS; automatic deploy intentionally SKIPPED |
| FP-PS-03 owner-approved protected Production | **PASS** | [Manual Production workflow #43499362133](https://github.com/KAF-Business-Suite/fajer-parsa/actions/runs/43499362133) completed SUCCESS, guard and deployment steps PASS; direct Cloudflare deployment readback matched merge SHA |
| FP-PS-03 live-browser verification | **PASS** | Independent Chromium **14/14** checks on public Production at 320/393px: four locales, correct RTL/LTR, menu order, main/inbound, 15 country options, five tourism services, Turkey destination, no horizontal overflow or JavaScript errors |
| FP-PS-04 real Samsung S21 (100% zoom, keyboard & hardware Back) | **UNVERIFIED** | No physical-device user acceptance; emulation is not sufficient |
| FP-PS-04 human Pashto editorial/legal terminology | **UNVERIFIED** | Full static key coverage does not prove native copy accuracy or legal phrasing |

**Non-goals / safety:** No live intake-to-office or Pipedrive connector was enabled, no customer records, database/secret changes, payments, emails or automatically sent WhatsApp messages. Form opens only an opt-in draft. The separate `FP-INTAKE-01` integration is not certified by this language release.

**Recovery:** prior successful Production deployment `15771551-eaec-4d52-844b-b94857494586` at application SHA `c6245e4d5ac043e1287fd202ebabaa84b7f554b9`; rollback has **not** been executed or proven. A docs-only follow-up commit can advance Git `main` without redeploying the unchanged application; do not treat that as deployment/source drift.

**Next single gate:** `FP-PS-04` editorial and real-device acceptance; record screenshots, visual issues, text corrections and named reviewer signoff before a future separate patch/Production promotion. Keep umbrella [Linear KAF-31](https://linear.app/rpcfpta/issue/KAF-31) open for unrelated FP-08 work.

---

## Historical record — original pre-release checkpoint (superseded)
The following original 13 November text is retained for historical traceability. Its DRAFT/PENDING statuses no longer describe the live production state.

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
