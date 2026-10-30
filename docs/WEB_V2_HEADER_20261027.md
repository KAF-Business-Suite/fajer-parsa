# Fajr Parsa floating header — 2026-10-27

Base local commit: 1eeff075c073af57fb9f7f513d8ccd6e9441dd72.
Branch: qa/fajr-ready-ui-light-dark-20261026 (existing local QA branch).
Scope: header framing, menu toggle, menu placement and dismissal only. Existing sections and brand preserved.

## Ready code used
Tailark commit 8139698115c1341bfd2e3e286c04bb4d8146f472:
registry/bases/radix/dusk/blocks/hero-section/one/header.tsx.
Adapted its two-line/X animated button into src/components/ui/menu-toggle.tsx with Persian accessible name, existing controlled state, theme colors and 44px touch target.
Original source and MIT notice are preserved under vendor/tailark.
The floating glass frame is a project-specific adaptation; the entire Next.js header was not falsely claimed to run unchanged in Vite.

## Verification
Production build PASS; all 20 smoke checks PASS; zero runtime errors and no external asset requests in the checked flow.
Checked five viewport widths plus rounded gutters, sticky top offset, separate mobile panel gap, outside click, Escape focus restoration, both themes and reduced motion.
Cloud browser cannot reach the local execution namespace; used the already prepared local Chromium/Playwright fallback.
Compared actual screenshots before/after: detached container, corner radius, theme text contrast, logo/navigation spacing, mobile button dimensions and menu panel separation.
A test originally tried to click content covered by the open menu; it was corrected to click the genuinely outside gutter. No force-click was used.

## Remaining boundaries
Samsung hardware and Samsung Internet NOT TESTED.
No push, public HTTPS deployment, main/production change, database change or new cost.
The review HTML is an export of this same compiled project, not a separate mock app.
