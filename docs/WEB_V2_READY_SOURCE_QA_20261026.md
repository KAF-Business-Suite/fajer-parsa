# Fajr Parsa — Ready-source UI candidate, 2026-10-26

## Repository and boundary
Official repository: KAF-Business-Suite/fajer-parsa.
Baseline: 8544b918dabc0204f14375b5ee563c4c7c1104a9.
Local branch: qa/fajr-ready-ui-light-dark-20261026.
A clean initial checkout was restored and checked before work; the only initial additions were the newly prepared component files.
No push, merge, production deploy, database change, new account, paid service or billing change.
The original root index.html, en.html and README.md are unchanged.

## Actual source reuse
The existing web-v2 React/Vite application, sections, services, logo and photos are the foundation.
Magic UI commit: undefined.
- src/components/magicui/blur-fade.tsx: upstream component; no design reimplementation.
- src/components/magicui/border-beam.tsx: upstream component; import path adapted.
- src/components/magicui/magic-card.tsx: upstream component; import path adapted.
- vendor/magicui/LICENSE.md: original MIT notice.
shadcn/ui commit: 8f04138777c1b6996e709993362a7b0a12888ecf.
- src/components/ui/dialog.tsx: adapted upstream dialog with Radix package import, local utility path, Persian close label, RTL positioning, theme and layout classes; native close button replaces unused upstream button dependency.
- vendor/shadcn/dialog.original.tsx and LICENSE.md preserve the original and license.
- next-themes provides exactly light/dark; system mode is disabled.
- Motion provides animation; reduced-motion users bypass reveals and the continuous beam.
Tailark was inspected; its reviewed Next.js hero has next/link, next/image and registry dependencies, so it was not falsely imported as a drop-in Vite page. No paid Framer, Magic UI Pro or Aceternity template was copied.
No claim that every source in the previous research inventory has been installed.

## Implemented in the actual app
- Two explicit semantic themes, persistent selection, local variable fonts.
- Responsive header, working mobile links with close behavior, Escape for menus.
- Ready-made pointer-responsive cards, scroll reveal and one hero border animation.
- Searchable six-category catalog, empty state, accessible service and destination dialogs.
- Travel finder presents service categories matched to the selected purpose. It does not decide visa eligibility.
- Local request draft download; it is explicitly not submitted to the office.
- Existing website WhatsApp destination preserved without automatically opening or sending.
- Removed public copy claiming a connected customer account, real tracking or Gemini assistant.
- Corrected existing Kaaba photograph labeling from UAE to Saudi Arabia.
- Original images are compressed into local WebP assets; original root photos are unchanged.
- Local asset URLs replace fragile raw GitHub links.
- Added focus restoration, labels, focus outlines, skip link, readable theme colors.
- Brand direction remains a review candidate, not final approval.

## Verification
npm ci completed from the new web-v2/package-lock.json; npm run build passed.
Node 24.22.1, npm 11.9.0. .nvmrc, engines and packageManager specify the toolchain.
18 browser checks passed; see accompanying results JSON.
Viewport widths: 320, 360, 393, 768 and 1440.
Default and reduced motion were checked. No runtime page errors or external asset requests in the checked flow.
Two real defects found during testing were fixed: dialog return focus and draft field labels.
A visual inspection also caught the inherited anchor color issue in light mode; it was corrected.
Screenshots inspected at desktop and mobile sizes in both themes.
The cloud browser could not reach the local server. Automated verification used local Chromium and Playwright against an in-process static server; no public exposure was required.
This is not a pixel-for-pixel reproduction of the personal portfolio or a user-approved template: no final template had been selected.
Visual comparison points: light/dark palette; local Persian typography; glass form and header; hero hierarchy and image treatment; card boundaries; mobile header and bottom actions; reduced-motion behavior.
No new hero heading was invented; existing headline and section structure were retained. Implementation-facing public descriptions were replaced with customer-facing guidance, and unsupported live-feature claims were removed.

## What PASS does not prove
Real Samsung hardware, Samsung Internet, mobile keyboard behavior and low-end-device frame rate remain NOT TESTED.
No live account/login, CRM lead creation, payment, external delivery, database, legal availability, visa eligibility or HTTPS production origin has been tested.
A draft file is not a submitted request. An informational tracking dialog is not a connected tracking service.
The browser checks do not constitute a full accessibility or security audit.
The font licenses and upstream component license notices accompany the source.

## GitHub Actions
.github/workflows/fajr-web-v2-check.yml is prepared, not run remotely.
Read-only contents permission; pinned checkout/setup-node; no persisted Git credential.
Only pull requests affecting web-v2 or manual dispatch; no push trigger, schedule, secret or deployment.
8-minute timeout and concurrency cancellation.
Actions usage still consumes account quota when someone triggers the workflow; this session did not trigger it.

## Next small gate
Review the actual UI candidate in both themes. Then continue country/service routes and the real request integration on this same foundation.
Before any remote push, verify Cloudflare/Vercel branch auto-deploy effects and obtain the appropriate publication permission.
