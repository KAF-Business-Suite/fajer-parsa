# PR17 — crawlable inbound gate (no deployment)

Scope: existing `feat/fajr-inbound-global-20261105` branch and PR #17 only.
Starting HEAD: `2e0fc383c6c3ecd31015080f16c86133a02efbc1`.

## Result

- `npm run build` now emits `dist/inbound.html` from the existing React App and InboundTourism component at build time. No server, Pages Function, Worker, parallel site or alternate content source was added.
- `/inbound` has meaningful English HTML, five services, initial language/direction, title, description, canonical and Open Graph tags before JavaScript. JavaScript enhances the same page; no independent language URLs or speculative hreflang/schema claims were added.
- The legacy `/#/inbound` link is replaced client-side using replaceState (fragments never reach Pages). Slash and `.html` aliases converge to `/inbound`. Existing home anchors and country hashes remain supported. Home links now target `/`.
- Header, body language and metadata share state. Static form is inert and its submit button disabled until interactive; it never submits a native GET when JavaScript is unavailable. Existing consent/validation and intercepted WhatsApp draft behavior remain intact.
- Both existing workflows include `npm run test:seo`; release policy, credentials and deployment steps were not modified. Local emulator state is ignored.

## Local verification

Node 24.22.1 / npm 11.9.0; locked application dependencies.

| Check | Result |
| --- | --- |
| TypeScript + Vite + React static render | PASS |
| Isolated intake unit checks | 23 PASS |
| Existing browser smoke scenarios | 42 PASS; failures=[], external=[] |
| Synthetic intercepted intake form | 7 PASS; errors=[] |
| Local Wrangler Pages SEO scenarios | 7 PASS; errors=[], external=[], assetErrors=[] |
| Whitespace/diff check | PASS |

The 7 Pages scenarios cover raw HTTP HTML and metadata, redirect aliases, JavaScript-disabled content and form safety, direct entry/reload, EN/fa-AF/ar at widths 320/360/393/768/1440, consented draft interception, legacy replacement, home links, country paths, browser back/forward and shared-instance language state. Synthetic examples use example.invalid; no actual WhatsApp message/API submission occurred. Screenshots were reviewed for Dari mobile presentation.

Environment distinction: the usual Playwright browser download was truncated in this workspace. Local browser verification used separately installed Chromium 143 through QA_CHROMIUM, outside application dependencies. Local Wrangler 4.76.0 required a temporary loopback-only network-interface fallback because this container cannot enumerate interfaces; it did not change Pages routing. That workaround is not in the repository or CI. GitHub must independently run these same suites with its normal Playwright Chromium and native interface enumeration on the new SHA before hosted CI is claimed PASS.

Vite reports an approximately 500 kB main JS chunk warning; build succeeds. Inbound is eagerly available so static content is replaced directly by the interactive page, without a lazy fallback removing it.

## Boundaries and remaining gates

This proves static output and local Pages emulation, not production availability, Google indexing, real Samsung QA or live customer acceptance. No merge, deploy (including preview), workflow_dispatch, Cloudflare credentials, DNS, database change, payment or live message was performed by this gate. PR remains Draft. The existing stable origin is used only as canonical metadata; hosted HTTPS acceptance remains open.

Re-run from web-v2: npm ci --no-audit --no-fund; npm run test:intake; npm run build; npx playwright install --with-deps chromium; npm run test:smoke; npm run test:seo; npm run test:intake-form. Use only the PR-triggered checks; manual safe-release workflow_dispatch defaults to deploying a preview and must not be invoked for this gate.
