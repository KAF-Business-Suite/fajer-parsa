# Fajr Office — UI/UX Pilot v01 (Review Only)

Status: **design preview, not approved/frozen**. Scope: authentication screen + case list. Operational office remains at `/`; the pilot is isolated at `/design-preview`.

## Product decisions
- Base visual identity from **Fajr Parsa public v2**: neutral paper, navy, muted gold, teal for success, subtle borders and restrained motion.
- Source files inspected: `web-v2/src/base.css`, `theme.css`, `mobile-polish.css`, `visual-review.css`.
- Source of behavior and authentication: existing office `worker.mjs`; preview imports it, and adds scoped styles only.
- **No new login provider, Supabase schema, customer migration, logo or invented brand asset.**
- Pilot disables writes both in the API wrapper and in status controls; only reads allowed.
- Target body 14px, control height 44–48px, restrained 150–200ms transitions, mobile 360/390px, desktop 1280px.
- Loading must be immediate, `aria-busy=true`, disabled submit, visible activity; errors red, success green.
- No dynamic widgets that obstruct navigation; respect `prefers-reduced-motion`.
- Persian (Afghan Dari) first. **English full locale not yet implemented**; do not claim bilingual completion.
- Pilot CSS temporarily downloads Vazirmatn/Manrope via Google Fonts, with local fallback. **Before approval, self-host Fontsource packages already installed in `web-v2`**, to avoid external font requests.
- The typographic brand is not a substitute for the original logo: verify original brand asset before applying anything to the main website.
- Existing office QA is separate from Fajr public Pages production; no public Pages deploy/merge in this pilot.

## Gates
- [x] Source comparison KAF vs Fajr public vs office; no design lock.
- [x] Review-only GitHub branch.
- [x] Scoping to `/design-preview` and disabling writes by code.
- [x] Route deployed to existing QA Worker by reviewed code source.
- [ ] Live Chromium: original root unchanged; pilot works at 360/390/1280.
- [ ] Loading progress, no horizontal overflow, status select disabled, no POST in design pilot.
- [ ] English complete, RTL/LTR verification — separate milestone, **not** part of current v01 acceptance.
- [ ] Self-host fonts; adopt actual brand logos only after asset verification.
- [ ] Owner visual acceptance; final design tokens remain open.

## References
- Public theme repo: https://github.com/KAF-Business-Suite/fajer-parsa
- KAF DS-02: https://linear.app/rpcfpta/issue/KAF-10
- Scoped QA: https://fajr-office-qa.khoojafahim.workers.dev/design-preview
- Stable operational QA: https://fajr-office-qa.khoojafahim.workers.dev/
- shadcn RTL official: https://ui.shadcn.com/docs/rtl
- Motion reduced motion: https://motion.dev/docs/react-use-reduced-motion
- Fontsource variable Vazirmatn: https://fontsource.org/fonts/vazirmatn/use
