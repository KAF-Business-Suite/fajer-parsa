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

## Agent source parity and public QA batching — 19 Nov 2026

**This Draft PR is the public four-language site/catalogue and synthetic-only intake**, not staff Office or an approved Production site. Follow [current canonical Fajr main AGENTS](https://github.com/KAF-Business-Suite/fajer-parsa/blob/main/AGENTS.md) for global release-off and Cloudflare Direct Upload discipline; it is an explicit pointer, not a guarantee future main updates automatically appear in this branch.

**Existing branch scripts:** from `web-v2/`, `npm ci --no-audit --no-fund`; targeted `npm run test:intake`, `npm run test:site-settings`, `npm run build`, `npm run test:smoke`, `npm run test:seo`, `npm run test:intake-form` as applicable. All these scripts are present in this PR's `web-v2/package.json`. Do not invent prices, immigration approvals or guaranteed visa timelines.

**Free-tier and real acceptance:** execute the cheapest appropriate local/CI test *before* requesting one meaningful owner-reviewed Pages preview; no upload for every small commit or docs-only edit. Review FA/PS/EN/AR switching, RTL/LTR, accessibility, tiny-screen action labels, synthetic intake response and error states. Static/synthetic QA is not legal/privacy approval or real client acceptance. Do not send client inquiries, change customer DB/permissions, introduce a second intake Worker or publish to production outside existing KAF-31.

**Current global priority:** KAF-26 internal tool cleanup; leave UI redesign and Office/Auth work in their own existing gates. This documentation-only change does not authorize code deployment.
