# KAF-31 / FP-08 — Production release handoff (2026-11-18)

**State: BLOCKED — do NOT publish or bypass release safeguards.** The owner requested fast production publishing. This document is a verified preflight handoff, *not* legal authorization.

## Exact verified build and scope

- Working source: existing Draft [PR #24](https://github.com/KAF-Business-Suite/fajer-parsa/pull/24) HEAD `d084439e2fa7763d0098b2f39b27d1b1f4c9e8e6` (not merged).
- Independent [CI PASS](https://github.com/KAF-Business-Suite/fajer-parsa/actions/runs/44329555885); [safe Pages QA PASS](https://github.com/KAF-Business-Suite/fajer-parsa/actions/runs/44329555971).
- QA Oman: https://fp07-service-catalog-preview.fajr-parsa-qa.pages.dev/?lang=fa#/country/om
- QA uses existing four-language design system, self-hosted destination photography, owner-controlled inquiry only, no promised visa eligibility, fees, or guaranteed residence.
- Existing Cloudflare Pages project: `fajr-parsa-qa`. Live Production latest independently read back: deployment `16950d0e-b5f6-42e5-bb83-3fc3bdd26e55`, SHA `9ded561eae7394f38eb633d3ec890be51df3f830`, status SUCCESS. **This is the current rollback reference, not the new published version.**
- Private Fajr mail sent the licensing-scope inquiry to the government-published ministry contact 2026-11-15, and followed up in the same thread 2026-11-18. **No official issuer reply or written validation has been observed.** Do not copy the private thread, scans, names, QR codes, or license identifiers to this public repo.

## Release blockers — independently evidenced, not checklist theatre

The existing `release/fp08-readiness.json` keeps all seven checks `blocked` (including licensing, approved service scope, public business/contact identity, written terms, privacy consent/retention, live customer-intake security and owner QA release evidence). `productionAuthorization=false` until every real approval exists. The user's general instruction to publish is not an official issuer verification.

**First external dependency:** A written response or authenticated private verification from the issuing tourism authority confirming current license validity and the precisely authorized activities. Verify tourism and municipality permits independently. Store the original evidence privately, never in GitHub. If the authority refuses or cannot confirm, remain BLOCKED.

**Other gates:** Privately verify public contact and business identity, approve dated customer privacy/consent and retention policy, document applicable/no-price/refund terms, test production intake security (Turnstile, RBAC/RLS, readback, quota/replay, rollback and actual device Back), approve exact QA visuals and the complete release evidence. Restrict any unverified service to enquiry-only and never advertise guaranteed visa/residency or payment requirements. Use the same existing project, no new database, no paid services.

## Safe deployment procedure — only AFTER real evidence approval

1. Confirm all seven manifest approvals have source URL, reviewer and review date; authority verification has `issuerVerification=verified`; record genuine written owner acceptance. Do not fabricate dates or links.
2. On the exact candidate, run `node scripts/fp08-release-gate.mjs production` in `web-v2` and require **FP08_PRODUCTION_RELEASE=GATE_PASS**. Confirm all independent/build/browser/SEO/intake jobs are PASS and PR scope is reviewed.
3. Integrate **only approved changes** into the existing `main`, after comparing with current `main`; retain immutable code/asset SHA, do not merge stale unrelated branches. Confirm production SHA `9ded561eae7394f38eb633d3ec890be51df3f830` is an ancestor of the release source. If stale/unrelated, stop for manual reconciliation.
4. Run existing GitHub Actions **Fajr Parsa | safe Pages release** by manual `workflow_dispatch` **on main** with `target=production` and exact confirmation `DEPLOY-FAJR-PRODUCTION` (only after gate PASS). Its workflow checks authenticated Cloudflare project, live source ancestry, and current status before deploy. Automatic deployment remains OFF by default.
5. Read back the newest Cloudflare **production** deployment; assert success and **exact release commit**, then smoke-check site root, four languages, Oman route and image, service inquiry button, responsive widths, page errors and no unintended production API. Record QA/production evidence in KAF-31.
6. **Rollback** on a failure: stop further releases, restore the previously verified Cloudflare deployment `16950d0e-b5f6-42e5-bb83-3fc3bdd26e55` via authorized rollback operation; independently verify production readback and notify owner. Preserve all history, no unconditional force push.

**Stop conditions:** missing or disputed official authorization; missing written privacy terms; live intake unauthorized; failed tests; unknown current production SHA; failed Cloudflare credentials; or any mismatch between build and deployed SHA. No direct, secret-based, unreviewed Pages upload.
