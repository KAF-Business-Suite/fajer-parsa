# Fajr Admin Console | Mobile-first, Multi-resource, OSS-first — Owner Design Decision & Research

Status: **RESEARCH & OWNER DESIGN SELECTION ONLY — NO UI PATCH AUTHORIZED YET**
Date: 2026-11-18 (Asia/Kabul)
Gate: [KAF-35](https://linear.app/rpcfpta/issue/KAF-35) / existing [PR #14](https://github.com/KAF-Business-Suite/fajer-parsa/pull/14)
Global owner lock: [Global Governance v1.3 §14](https://github.com/KAF-Business-Suite/openai-cloudflare-github-hub/blob/main/docs/GLOBAL_PROJECT_AI_GOVERNANCE.md)

## Owner intent clarified

- This is a **private, personally controlled super-admin console** spanning more than Fajr Parsa. Do not hard-bind all views or business logic to the Fajr website; Fajr is first connected asset, not the only site.
- **All existing 45 menu/module identifiers survive**; organize in compact expandable categories, not remove or rewrite. Add new modules and resources later without changing the fundamental navigation or canonical auth.
- Select **one premium enterprise-grade design system** via validated global OSS demos and repo sources *before any more visual code edits*. The system should feel polished, rounded and comfortable for repeated use, with owner-editable themes, typography, spacing, density and navigation; avoid sharp edges, high visual noise and obligatory KAF color cloning. Maintain official assets/branding for the linked business's public content.
- **Mobile Samsung S21 first;** do not run parallel independent desktop design tracks. Desktop responsive no-break smoke tests only until mobile acceptance. Subsequent desktop refinement is not blocked forever.
- Staff panel **fa/en only** at first; Fajr public website still fa/ps/en/ar independently. Other brands' language requirements remain subject to their own owners.
- Use existing React/Vite, Cloudflare QA + secure Office BFF, scoped Supabase, existing permissions/AGENTS and KAF-31 legal release gate. No billing, third-party send, destructive data or new app/vendor/database by default.

## Verified ready-made global candidates (as of 18 Nov 2026)

| Source & live sample | License / architecture | What to reuse | Limits and migration risk |
|---|---|---|---|
| [satnaing/shadcn-admin](https://github.com/satnaing/shadcn-admin) / [live UI](https://shadcn-admin.netlify.app/) | MIT, React + Vite, shadcn/ui, TanStack | **Primary baseline**: responsive side navigation, tables, settings, dialog, layout, theme primitives. Existing repo already contains imported audited MIT Card/Table/Input + full license | A dashboard starter, NOT a full connected operational CRM; has demo identity integrations that must **not** replace existing Office sign-in |
| [Keenthemes ReUI](https://github.com/keenthemes/reui) / [component catalog](https://reui.io/) | MIT OSS free shadcn components, separate commercial PRO blocks | Premium rounded/lightweight forms, tables, alerts, upload, tabs, command menu, cards and mobile drawers; license each imported component | A component catalog, not complete admin shell; do not copy commercial PRO blocks or assume everything free |
| [Tabler](https://github.com/tabler/tabler) / [live admin](https://preview.tabler.io/) | MIT, Bootstrap 5-based admin kit with 100+ page examples and RTL | Reference for enterprise information architecture: nested nav, logs, sites, apps, settings, data grids, invoices, docs, empty states | Using full Bootstrap shell would duplicate/conflict with React Tailwind and require costly migration; reference only unless owner deliberately chooses it |
| [Kiranism dashboard](https://github.com/Kiranism/next-shadcn-dashboard-starter) / [live demo entry](https://shadcn-dashboard.kiranism.dev/) | MIT, Next.js 16 + shadcn/ui | Screens for working data tables, multi-step forms, workspaces, notifications, role dialogs, mobile console and modern theme presets | Next.js, **Clerk Auth/Billing** and server runtime differ from existing system. Visual and isolated component reference only; no blind full fork |
| [Mantine](https://github.com/mantinedev/mantine) / [examples](https://ui.mantine.dev/) | MIT React component library | Optional consistent accessible components/tokens/theme ideas | Full introduction alongside shadcn may create mixed component ecosystems; only choose if reviewing a whole migration |
| [Vercel admin starter catalog](https://vercel.com/templates/next.js/admin-dashboard) | Multiple independent template licenses | Discover and compare ready-made designs and functionality | Vercel host/template does not by itself provide a ready universal console, nor ensure the starter is safe to copy/licensed/free |

**Recommendation for owner review (not yet visual approval):** Keep existing **React/Vite + imported official MIT shadcn-admin UI**, use **free ReUI design patterns selectively** for premium comfort, and evaluate compatible **Refine Core** for later resource/data/auth adapter contracts *after design acceptance*. Tabler serves as information-architecture benchmark; Kiranism as advanced-workflow benchmark. Avoid a second Next.js site, a parallel database, Clerk billing or unnecessary vendor lock-in.

## One console, arbitrary linked resources — behavioral contract

Model:
- **Workspace** (personal or each approved company) → **resource groups** (websites/domains, mobile/desktop apps, documents/media, communications/social, CRM, finance, developer tools, infrastructure, workflows, integrations) → **assets** → **verified connections/capabilities** → **audited actions**.
- Every asset requires: stable internal ID, type, name, workspace/organization, provider, normalized URL or project ID, external ID once verified, link vs active connection status, allowed capabilities, assigned roles, recent readback timestamp, source-of-truth system, last change and audit link.
- Top-level **+ Add** has two independent options: **Link by URL** (bookmark, inspect public metadata only) and **Connect managed provider** (authorized official OAuth/Cloudflare/Vercel/WordPress project). Site ownership or edit rights cannot be inferred from a URL.
- A site detail view should eventually expose only genuinely supported capabilities: Dashboard, Pages/Navigation, Media/Uploads, News/Offers/Banners, SEO/Translations, Marketing/Form submissions, Integrations, Preview/Draft, History/Publish/Rollback, Security/Team. Unsupported features show **Not Connected**, never dummy buttons promising live actions.
- A "Remove from console" action **only detaches membership/association in registry**; it must NOT delete website, DNS, source repo, Cloudflare/Vercel project, uploaded media or origin DB, and must not revoke provider credentials for other used connections. Explicit remote deletion is a separate high-risk approval, not an overloaded menu option.
- **States:** unlinked → bookmark-only → verified read-only → approved scoped edit → preview/confirm → approved publish+rollback, with stale/expired/disabled/error/permission-denied states and safely reversible detach/reconnect. Backend holds secrets; deny SSRF, require allowlisted hosts, least privilege, scoped role, CSRF protections, audit and readback.
- A single resource registry supports later "Add application", "Add document collection", "Add integration", "Add personal workspace" and module builder **without a new website/app for each**. Keep feature catalog separate from connected assets list; 45 menu items need not each activate a backend until that domain gate.

## Screen blueprint — show before coding

**Primary mobile IA, no removal of 45 modules:**
1. Home: accessible workspaces/sites switcher, system status summary with truth-state labels; no fake KPIs
2. Resources: segmented tabs Websites, Apps, Documents, Communications, More; filters, search and **+ Add Resource**; each row shows provider + connection capability/health
3. One Website details: header, read-only or verified state, nested tabs Pages, Content, Media, Campaigns, SEO, Integrations, Publishing, Settings; safe preview and separate detach action
4. Modules / All Tools: all 45 existing features regrouped (command, operations, content, communications, finance, platform) with future custom-module builder but NO backend write in this design
5. Settings / Personalization: themes Light/Dark/System, token-driven color preset, typography, spacing, corner radius, density, navigation, default workspace, language (fa/en) and accessibility
6. Role security & audit with honest status/no functionality without approved service integration

**Design system acceptance:** default light theme with restrained cool-neutral background, one restrained business accent (teal/blue/champagne per owner choice), readable text, integrated tokens (shadcn radius, spacing, type, palette), rounded 12–20px cards/controls without sharp edges, consistent touches, compact yet spacious hierarchy. Font pair from approved Vazirmatn + Inter/Manrope where compatible (never distribute proprietary font files). Personalization is opt-in and does not block use. Prefer free accessible defaults; don't create expensive theme engine from scratch.

**Mobile gate:** Samsung S21 Chrome/PWA at 360/393 CSS px, RTL/LTR, 100% zoom, smooth Back semantics, retained current view/scroll on safe reload, correct keyboard safe area, no horizontal overflow or clipped select/modals, accessible tap targets/contrast, reduced motion, clear disabled/loading/empty/error states. Desktop only functional smoke until mobile PASS.

## Phased development / acceptance (no parallel side-project)

G0 **now**: research shortlist + verified previews and code/license comparison + owner's preferred coherent aesthetic. **No UI styling changes before selection**.
G1: mobile-first whole-shell prototype in existing QA-only PR #14 with resource attach/list/remove design and 45 preserved modules, synthetic data; one consolidated visual acceptance.
G2: existing secure worker + Supabase backed resource registry and first **Cloudflare Pages site** connected with permissions **read-only first**. Automated test: create console association, verify provider project, list/health, detach without upstream change, reconnect with audit.
G3: actual per-site approved edit of website content/preview, scoped publish/rollback and true readback, only when site permits and KAF-31 permits production.
G4: WordPress/Vercel/application/document/communication connectors in domain-specific gates when needed; then desktop polish and advanced theme customization. No new paid product, new database or Production migration merely for mock UI.

## What has / has not happened

- Global governance §13/§14, universal control plane and adoption updates: **ACTUAL source edits**, confirm commits per document.
- This ADR: **documentation of owner architecture + researched samples**, not a deployed product feature.
- Previous Fajr QA site with 45 navigation labels: existing visual demo, **NOT** universal multi-site connection functionality.
- True multi-site resource registry, dynamic provider ownership check, detach/reconnect, persistent theme UI, 45 live workflows and complete mobile-first acceptance: **NOT IMPLEMENTED**, intentionally held for owner visual design review.
- No modifications to website/app/production, customer records, Supabase, Cloudflare Workers settings, domains, payments, secrets or provider integrations from this research-only gate.
