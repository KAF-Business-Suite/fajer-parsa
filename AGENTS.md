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

## Free-tier Cloudflare QA deployment discipline — 19 Nov 2026

Cloudflare `fajr-parsa-qa` is **Direct Upload**, not a GitHub-auto-build project. The live API history contains **126 successful deployment records in November 2026 through 19 Nov**; all 126 have distinct commit hashes (47 `fp-admin-v2-review`, 42 `fp07-service-catalog-preview`, 22 `fp-intake-safe-review`, 12 `fajr-ci-preview`, 3 `main`). This is not duplicate-SHA deployment waste. **Seven records were created on 19 Nov and 49 on 18 Nov.** Actual Cloudflare account billing meter cannot be read with current credentials; record count is not verified charged build count.

**Agent action contract, inside existing KAF-25/KAF-31/KAF-35 issues and current PRs:**
1. Build + unit/browser/integration smoke **locally or in existing GitHub CI first**, with synthetic data; collect a single QA checklist and exact commit SHA.
2. **Do not upload a Pages preview after every small commit, typo or untested adjustment.** Batch related changes into one validated, owner-reviewable preview per meaningful QA checkpoint. Reuse an already successful same-SHA preview URL where available. Never fabricate a new branch/PR merely to trigger another build.
3. Before any manual `wrangler pages deploy`, read the target project's last deployments, environment, branch, last successful SHA, and confirm the planned work is not already published. Preview only on existing approved QA branches; production remains protected by KAF-31's explicit owner approval and rollback gate.
4. The existing `.github/workflows/fajr-pages-safe-release.yml` must stay **release-off by default**; no automatic deployments, changed credentials, paid upgrades or new workflow jobs as part of quota cleanup. Do not prune historical successful deployments without recovery/consumer evidence.
5. Pass evidence to the existing KAF-26 cross-tool audit. This rule applies to agents that actually load this repository file; it is **not a provider-enforced throttle** and does not automatically restrain independent Cloudflare/third-party agents.

No existing office/auth or public release requirements are relaxed.
