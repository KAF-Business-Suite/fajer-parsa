# Fajr Parsa — AI / Agent Working Rules

## Mandatory global rule

Before material work, read and apply:
https://github.com/KAF-Business-Suite/openai-cloudflare-github-hub/blob/main/docs/GLOBAL_PROJECT_AI_GOVERNANCE.md

The global owner governance rule applies to architecture, research, provider/tool choice, integrations, security, cost, URLs, data ownership, automation, deployment and continuation behavior.

## Fajr-specific boundary

- Fajr Parsa is a business/project surface; do not create a duplicate source of truth when KAF already owns shared platform data or policy.
- Recover the current Fajr issue/PR, current deployment and KAF integration boundary before changing architecture.
- Search current global/open-source/self-hostable alternatives when a material provider or system decision changes.
- Do not ask repetitive approval questions for safe read-only/reversible continuation.
- Do ask before production/customer/financial/external-message changes, destructive actions, credentials, or new cost.
- Never equate build/deploy with real mobile/auth/business acceptance.
- Keep customer data, credentials and secrets out of Git and AI prompts.

## Shared execution skill — Fajr priority

For continued development, open the [canonical KAF verified-delivery SKILL.md](https://github.com/KAF-Business-Suite/openai-cloudflare-github-hub/blob/main/.agents/skills/kaf-verified-delivery/SKILL.md) and the [live control checkpoint](https://github.com/KAF-Business-Suite/openai-cloudflare-github-hub/blob/main/docs/UNIVERSAL_SYSTEM_CONTROL_PLANE.md) before selecting a work branch. There are only **two active execution PRs**: [#24](https://github.com/KAF-Business-Suite/fajer-parsa/pull/24) for customer-facing site/catalogue and synthetic-only intake (KAF-25), and [#14](https://github.com/KAF-Business-Suite/fajer-parsa/pull/14) for authorized staff Office/Auth reconciliation (KAF-35). [KAF-31](https://linear.app/rpcfpta/issue/KAF-31) exclusively owns customer Production go/no-go, currently blocked on seven documented release proofs. FP-09 synthetic form-to-office acceptance is PASS, not authorization for real-client traffic. Old PRs #15/#16/#22/#23 were closed unmerged and retained only as source donors. Do not merge stale branches wholesale, create parallel intake/office, spawn micro-gates, send customer messages or bypass production rules. The skill never overrides this repository's stronger safeguards or approval gates.

## Owner-locked integrated admin design (2026-11-17)

All new application/website/admin feature work follows the canonical [design-first, OSS-first, extensible owner rule](https://github.com/KAF-Business-Suite/openai-cloudflare-github-hub/blob/main/docs/GLOBAL_PROJECT_AI_GOVERNANCE.md#13-design-first--open-source-first--extensible-system-rule--owner-locked-2026-11-17), **not** ad hoc forms or fragmented applications. Fajr implementation and acceptance contract: [FP_ADMIN_V2_OWNER_LOCK.md](docs/FP_ADMIN_V2_OWNER_LOCK.md). Prototype lives only in the existing **PR #14** Office branch, with separate `npm run build:office-demo`, no live credentials/data/customer publishing. Keep PR #24 website and KAF-31 release authority intact. The design process is locked; future modules, styles, components and approved providers remain replaceable under existing safety/owner gates.


## Owner mobile-first multi-resource admin lock — 2026-11-18

Before any further Admin V2 source/style edits under existing KAF-35 / PR #14, read the [latest owner mobile-first multi-site design shortlist and behavioral contract](docs/FP_ADMIN_MOBILE_MULTISITE_DESIGN_DECISION.md) plus [Global Master §14](https://github.com/KAF-Business-Suite/openai-cloudflare-github-hub/blob/main/docs/GLOBAL_PROJECT_AI_GOVERNANCE.md). **Owner wants existing open-source admin examples/demo/code before redesign, then approves one cohesive look.** First implement mobile-S21-only integrated UX; desktop gets responsive no-break smoke. Do NOT remove any 45 modules. Multiple sites/apps/docs later connect via permissioned provider adapters; unlinking the console entry never deletes the actual remote website. Staff UI fa/en; public Fajr site fa/ps/en/ar. Refine Core not yet installed, source mock ≠ operational multi-provider suite. All production release/legal gates remain active, no customer messages, paid services or DB deletes.

## Agent source parity and Office-specific acceptance — 19 Nov 2026

**This Draft PR keeps its stronger Office design rules above** and now also follows the current [Fajr main AGENTS](https://github.com/KAF-Business-Suite/fajer-parsa/blob/main/AGENTS.md) Free-tier QA-batching, safe Direct Upload and latest four-language/public-intake boundaries. This link is not proof that future main changes auto-sync: re-read both instructions before new code.

**Office-only build evidence:** in `web-v2/`, `npm ci --no-audit --no-fund` then `npm run build:office-demo` (actual PR14 package script). Office/Auth negative browser/session tests and exact live QA Worker SHA are a **different acceptance class** from the static Office preview. No public site publish, sensitive credential, production/staff role change, external message, DB migration or live Office acceptance through this documentation commit.

**Global cleanup precedence:** KAF-26 continues first; defer UI expansion unless the owner explicitly resumes that product gate. Real S21 staff login/refresh/controls/logout stays KAF-35; CSS/HTML mock success is not permission to change the backend or customer traffic. No duplicate module kit or new app.
