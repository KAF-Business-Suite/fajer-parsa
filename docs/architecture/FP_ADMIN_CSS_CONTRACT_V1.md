# FP-UI-01 — CSS & Design-System Contract v1
Date: 2026-11-18 · Owner QA: KAF-35 / existing draft PR #14
Status: AUTHORIZED BOUNDED QA THEME POLISH; PHYSICAL OWNER UI ACCEPTANCE PENDING
Source of truth: existing \`web-v2/src/office-v2/EnterpriseConsole.tsx\`, \`console-model.ts\`, \`enterprise.css\`, \`ResourceCenter.tsx\`, and \`web-v2/src/office-v2/executive-theme.css\`.

## 1. Non-negotiable protected boundaries
- One existing React/Vite 46-route private console, existing official Fajr mark, existing FA/EN admin languages; 4-language public Fajr site separate.
- Same authenticated Worker/BFF, JWT server-side, Cloudflare/Pages pin, KAF RLS, role checks, audit and PR #14 Draft; NO enabling locked permissions, fake database writes, provider delete/publish, customer messages, billing or Production merge.
- Desktop sidebar 267px / collapsed 70px, header 65px; mobile <=800px top header 56px, bottom 5 tabs approx 60px + safe-area, button targets >=44px, private shortcuts >=48px, S21 navigation/Back and RTL geometry. Change COLOR/SURFACE only in this gate.
- Do not replace the current shell with upstream shadcn-admin or Refine, add Clerk, Bootstrap, new packages, new fonts, new accounts or new public site themes. Current EnterpriseConsole is a project adaptation, not a pixel clone.
- Do not delete historical OfficeApp, vendor LICENSE or Git history. All 46 route IDs remain.

## 2. Source research and fit (verified Nov 18)
| Source and official demo | Licence | Compatible use | Decision |
|---|---|---|---|
| [satnaing/shadcn-admin](https://github.com/satnaing/shadcn-admin), [live](https://shadcn-admin.netlify.app/) | MIT | React/Vite, sidebar, semantic CSS light/dark tokens; already copied Card/Table/Input with license | **KEEP existing OSS baseline** |
| [shadcn/ui](https://ui.shadcn.com/docs/theming), [sidebar](https://ui.shadcn.com/docs/components/base/sidebar) | MIT | semantic background, card, foreground, border, primary, focus and sidebar token contracts | **Reuse design tokens, no new package** |
| [Keenthemes ReUI](https://github.com/keenthemes/reui), [docs](https://reui.io/) | MIT OSS; avoid separately paid blocks | reference more comfortable controls and forms for later isolated gates | **Reference only** |
| [Tabler](https://github.com/tabler/tabler), [live](https://preview.tabler.io/) | MIT | mature RTL/dark responsive patterns but Bootstrap 5 shell incompatible with current unmodified React/Tailwind | **Reference only** |
| [Refine](https://github.com/refinedev/refine) | MIT Core | resource/auth/data orchestration, not CSS; not installed in repo | **DEFER** |

Additional official upstream evidence: shadcn-admin \`src/styles/theme.css\` defines semantic light/dark values; \`src/styles/index.css\` separates base/theme. Fajr only imported selected primitives, and its custom enterprise.css has many route-specific and repeated legacy hex rules.

## 3. One cohesive official private-console design
- Name: **FP Executive / Warm Stone**. Exactly **Light and Dark appearances**; no separate jade/ocean/champagne palettes in user control. Brand accent champagne gold, primary action navy, teal reserved for verified success or connection health.
- Light tokens: canvas \`#F4F1EB\`; card \`#FFFEFC\`; header \`#FAF9F6\`; sidebar \`#182E3E\`; ink \`#1A3040\`; subdued ink \`#566976\`; hairline \`#E3DDD2\`; brand gold \`#B18A55\`.
- Dark tokens: canvas \`#111C26\`; card \`#1A2B38\`; header \`#192C39\`; sidebar \`#101D27\`; ink \`#E9EBE9\`; subdued ink \`#B9C7CC\`; hairline \`#334956\`; gold \`#D1AF78\`.
- Local **Estedad Variable** remains the sole UI family. Extra Latin UI family not introduced. Font files and existing licences unchanged.
- Flat/opaque but layered panel surfaces, restrained soft shadow + thin border (not plain white boxes, blur-heavy glass, busy gradients or fake 3D). Small gold accents are decorative, never the sole status indicator; provide sufficient text/background contrast.
- Limit CSS selectors to \`.fpx-root\` and existing admin portal dialog classes. Do **not** alter \`web-v2/src/theme.css\`: it is the separate public website.
- Keep comfortable/compact information density and rounded/extra rounded ergonomics as non-theme user controls. All palette choices and system-follow mode are hidden from the active ThemeLab (legacy model may remain for migration compatibility). Existing route/state remain accessible.
- Theme preferences can persist only non-sensitive visual settings in browser localStorage, scoped to this QA origin. This is not authoritative owner-profile cloud synchronization, and must not affect auth/roles. Any invalid/old choice is normalized to the one approved brand.

## 4. Modules that stay protected / not unlocked by CSS
- 46 registered views preserved; six connected *entry points of varying depth*: Home first-page summary, Requests authorized read/status update, Website settings readonly, Cloudflare Resources read plus synthetic registry, KAF Cases RLS read and Tasks projection from case next_action. Do not claim six complete modules or 46/46 business readiness.
- Locked publication, provider write, legal copy, finance, public site deployment and staff role escalation are **server-gated** and out of scope.
- In the private console, synthetic capability buttons remain synthetic until their own audited backend gate. No fake actionable buttons created by theming.
- Owner-verified G7 Cloudflare Worker #38 stays rollback baseline; no change to Production; PR #14 stays draft.

## 5. Verification gate and final states
1. Code review confirms unchanged 46 IDs, stable top/bottom navigation geometry, no dependency/font/auth change.
2. Synthetic Chromium at 360,393 CSS px Samsung-like + 1280px desktop: FA/EN, Light/Dark, theme persistence, buttons >=44px, header/mobile nav geometry, no x-overflow, dialogs, Back and focused states; no external calls from public preview. Compare screenshots.
3. WCAG AA target >=4.5:1 for normal body text against its immediate background and visible focus. Honor reduced-motion.
4. Existing unit/Office/Worker, PostgreSQL, requests/cases/resources/navigation/build tests ALL PASS. A failed job is FAIL, not "mostly done".
5. Only after clean green CI: immutable QA Pages snapshot -> private Worker pinned source -> secret inheritance -> 100% traffic readback; leave public Production unchanged. Save exact CI, SHA, Worker version, rollback, PASS/FAIL/PENDING in KAF-35 + PR #14.
6. Real Samsung S21 owner visual acceptance of Light/Dark is **separate PENDING** until owner sees it; do not equate synthetic browser PASS to physical display PASS.
