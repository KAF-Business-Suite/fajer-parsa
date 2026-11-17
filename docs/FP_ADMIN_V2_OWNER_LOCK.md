# FP-ADMIN-V2 | Unified Fajr Office — OWNER-LOCKED architecture / living design
Status: **DESIGN PROTOTYPE STARTED (NOT DEPLOYED, NOT ACCEPTED)**
Date: 2026-11-17 (Asia/Kabul)
Owner gate: [KAF-35](https://linear.app/rpcfpta/issue/KAF-35)
Existing execution PR: [#14](https://github.com/KAF-Business-Suite/fajer-parsa/pull/14)
Public site and legal release gates: [KAF-25](https://linear.app/rpcfpta/issue/KAF-25) / [KAF-31](https://linear.app/rpcfpta/issue/KAF-31)
Global master: [§13 Open-source-first, design-first](https://github.com/KAF-Business-Suite/openai-cloudflare-github-hub/blob/main/docs/GLOBAL_PROJECT_AI_GOVERNANCE.md)

## Owner lock — process, not permanent technology freeze

1. **One integrated system:** no new one-off pages/modules with independent auth, data or navigation; expand the chosen common shell/registry.
2. **Research before new coding:** inspect open-source and established designs, compare licensing, maintainability, actual dependencies, RTL, security, costs, migration and quality. Prefer reuse and audit over rebuilding commonplace admin functionality.
3. **Design and owner acceptance before live connection:** show a complete responsive information architecture and coherent interactive flow before database-backed features and public publication.
4. **Owner controls content:** verified company profile, services, web pages, notices, country rules, four-language copy, branding, contacts and staff operations become editable in a governed UI. Legal claims, payments, staff permissions and customer-facing publishing require role checks, audit/revisions and release gates.
5. **Extensible forever:** modules, palettes, fonts, layouts, technology and providers can change later. Keep versioned contracts, component registry and adapter boundaries; replacements follow documented mini-gates, migration and rollback. Never silently override existing business authority.
6. **Reuse sources lawfully:** MIT licences/attribution kept; vendor/demo authentication or fictitious "live" data never imported as actual Fajr data.

## Existing system, not a new product

- **Canonical repository:** \`KAF-Business-Suite/fajer-parsa\`.
- **Current staff Office:** PR #14 QA Cloudflare Worker, existing encrypted/HttpOnly session and authorization, Supabase backend; preserve while prototype matures.
- **Public website:** PR #24 Vite/React and Cloudflare Pages; only sanitized **published** values visible to visitors.
- **Source of truth:** existing Supabase project with organization isolation. KAF shared domains remain central where already governed. No additional identity database or business CMS.
- **Production:** KAF-31 legal/business/security gate remains BLOCKED. Do not publish contact/legal/service changes just because a design is approved.

## OSS technical selection and attribution

- **Refine Core**: preferred resource/data-provider, forms, authorization and i18n patterns; MIT: https://github.com/refinedev/refine . **Framework integration to be pinned and installed only after design/source compatibility verification**, not yet part of the initial isolated preview. No invented current dependency.
- **shadcn-admin**: MIT layout/reference: https://github.com/satnaing/shadcn-admin . The author explicitly says it is **not a production-ready complete app starter**, and its sample \`@clerk/react\` auth must not replace our secure Fajr account. Source is a design reference, not an unauthorized blind code fork.
- **Existing real OSS packages reused for prototype**: React (existing), Radix Dialog \`@radix-ui/react-dialog\`, Lucide icons, Vazirmatn/Manrope font packages, Vite; their installed versions are already pinned in the repository lockfile.
- **Proposed platform integration**: Cloudflare Worker static assets & same-origin BFF for staff UI, PostgreSQL/Supabase scoped RPC and audit; no cross-site cookie forwarding, generic admin DB grants or service-role browser tokens.

## Whole-shell IA (single registry)

Source \`web-v2/src/office-v2/registry.ts\` has 10 modules with typed IDs, labels in **fa/ps/en/ar**, required role, and integration classification:

| Main group | Modules |
|---|---|
| Workspace | Dashboard, Requests, Customers |
| Business | Website manager, Services & Countries, Finance, Communications |
| Control | Reports, Company & People, Settings & Security |

Desktop: fixed collapsible vertical sidebar, one header, search/locale and contextual actions.
Mobile: compact header, five bottom tabs, responsive cards with no horizontal overflow, system safe-area, no duplicate navigation.
Website manager: six section tabs, a rendered **site-like** preview in every language, owner review modal with a change checklist (not \`window.confirm\`); later connect to actual same-origin safe preview of the public site with a signed short-lived token and approved data.
Four languages with direction fa/ps/ar RTL and en LTR; avoid mixing numbers or text direction. Future text completeness checks and date/time locale parity required.

## Prototype created in existing PR #14

- \`web-v2/office-preview.html\` — separate NOINDEX-only preview entry.
- \`web-v2/vite.office.config.ts\` and \`npm run build:office-demo\` — **isolated \`dist-office-preview\` output**; default public Pages \`npm run build\` still produces the original customer website only.
- \`web-v2/src/office-v2/{registry.ts,main.tsx,OfficeApp.tsx,office.css}\` — responsive, branded React design shell; 4 localized navigation views and all 10 modules already in registry; simulated information only, no network or staff data.
- \`web-v2/tests/office-v2-preview.mjs\` — mobile/desktop Playwright screenshot and interaction test with external network DENIAL assertions.
- CI on existing QA PR #14 runs the separate build and test, uploads preview screenshots. Screenshots are **candidate design evidence, not owner's visual acceptance**.

## Mandatory next integration, after owner visually accepts unified shell

1. Pin compatible Refine Core version and adapt selected MIT shadcn-admin components into audited local \`components/ui\`/layout, with NOTICE/attribution and lockfile. Replace custom styling pieces where mature OSS components exist, rather than expanding bespoke CSS.
2. Extract existing Fajr Worker Office BFF into versioned, permission-aware resource adapters for the typed module IDs. Preserve the same host/origin and HttpOnly session. No new login provider. Add Form/Zod validation with pinned compatible releases where justified.
3. Integrate **real** website visual preview (not text card simulation), draft vs published diff, four-language completeness, legal service approval, explicit accessible confirm/publish and rollback with audit. Default off; no live publication without authorization.
4. Connect Requests/Customers/Company/Service/Finance modules only when their own domain permissions, data mapping and audit tests pass; do not invent data or force production table mutations.
5. Run automated tests + actual Samsung S21 and desktop flow/keyboard/back acceptance and production legal/security authorization. Merge/deploy to customer-facing production only after KAF-31.

## Decision evidence/status (must never be conflated)

- Global governance updated, project charter created: **PASS only when commit verified**.
- Independent preview and responsive JSX source: **IMPLEMENTED IN SOURCE**, CI status independent.
- Refine package import / actual shadcn-admin component fork: **NOT YET EXECUTED** (no blind dependencies).
- Live Office integration, published website, CRM/payment/messaging: **NOT IMPLEMENTED**.
- Owner design acceptance: **NOT YET ACCEPTED**.
- Production customer deployment: **BLOCKED** until KAF-31.
