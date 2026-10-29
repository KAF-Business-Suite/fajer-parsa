# Country service pages — 2026-10-29

Baseline: latest remote QA9667240b5453ba998a9d4cdf88d086695c4ae3f0, not the stale restored local checkout. Old local history preserved in a separate local branch; no merge/reset/force push.

## Delivered scope
Existing React Bits country cards open dedicated hash routes (#/country/ir etc.) on the same website. All15 owner-confirmed countries share the page template, local imagery and canonical service catalog. Independent page title, breadcrumb, service choices, request steps and other-country return link. Lazy loaded route; no new router dependency. Unknown country code has a recovery page.

Iran explicitly separates seven owner-confirmed visa types plus residence, work assistance, ticket, tours, invitation and application assistance (13 choices). Other countries preserve their confirmed service combinations without inventing subtypes or immigration requirements.

Request context adds optional variant: exact selected service retained through review, optional local draft and WhatsApp link. Changing a preselected broad category/destination clears stale subtype. Generic multi-service country combinations allow explicit broad-category selection without dropping selected context. Header/bottom request starts use current country. No form is sent automatically.

Existing Tailark navigation, Magic UI Reveal, Radix dialog and brand tokens reused. Existing seven-image inspiration gallery retains its photo modal. No new stock assets, paid API, account setting or dependency.

## Limits
Hash routes are client-side deep links, not separate server-rendered/indexable SEO pages. Current publication remains noindex. These pages are a customer browsing/request experience, not a live immigration policy, verified availability or visa/job guarantee. No fabricated prices, processing times or required-document lists. No central submissions, case tracking, database, automation or AI integration added. Actual Samsung hardware requires acceptance. QA preview only; production and main untouched.

Validation: build PASS;40 browser checks PASS, including all prior coverage adapted for full-page navigation, direct country reload/back/forward, Iran medical visa subtype in reviewed message and draft, stale subtype clearing, phone/desktop light/dark fitting, unknown-code recovery and zero runtime errors/external requests. Screenshots at393 and1440 reviewed. Actual Samsung remains untested. Lazy country module6.14kB minified/2.24kB gzip; initial main474.58/152.43kB gzip versus previous473.70/152.12. No dependency or lockfile change.

Published application commit366d485f0164a52227e9b1960971d1622322b41c; exact source tree7860cbb676a56fa38ce00286d16538bf12569a6d. Preview deployment2664a13d-444f-41eb-8022-575202543498 successful. Link: https://qa-fajr-visual-review-202610.fajr-parsa-qa.pages.dev/#/country/ir . Live browser verified page title,13 Iran service choices, Iran/medical subtype form handoff and direct reload, and saved screenshot. Production remained267db7628d1b5ef96e2800bd1062fd1a4b10124c.
