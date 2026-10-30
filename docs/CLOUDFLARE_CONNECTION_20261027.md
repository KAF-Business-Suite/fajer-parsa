> Historical snapshot. Superseded by [current implementation status](WEB_V2_IMPLEMENTATION_STATUS.md); do not use as current deployment configuration.

# Cloudflare direct connection — 2026-10-27

Verified by Cloudflare MCP whoami, account listing, Pages listing, Workers listing and Worker Build trigger API. All Cloudflare calls read-only.

## Actual separation
- Pages kaf-documents-qa: repository KAF-Business-Suite/kaf-business-suite; production branch design/docs-hub-gate1-20261018; preview builds all branches. This is KAF documents, not Fajr Parsa.
- Worker fahim: live deployed on 2026-10-26; repository khwajaprn/fahim-parsa; branch main only; root /; empty build command; deploy npx wrangler deploy. Worker version preview URLs disabled. This is personal Fahim, not Fajr Parsa.
- No Pages project or Worker trigger for KAF-Business-Suite/fajer-parsa was found among the complete returned inventories (one Pages project and one Worker).
- Fajr repo numeric ID 1313543103, default main, push permission verified.
- Local QA tree initially clean at c684573160bb176da12306a7595d8568cdb807e6, branch qa/fajr-visual-review-20261027. No push performed.

## Concrete next action awaiting limited publication approval
Proposed new, separate Pages project: fajr-parsa-qa. Request body prepared in cloudflare-fajr-qa.proposed.json, not executed. Git source uses existing organization integration; API may require user authorization if its current grant does not include this repo. Do not widen GitHub App access silently.
- Root web-v2; npm run build; output dist; Node 24.22.1; npm 11.9.0.
- Production automatic deployments disabled.
- Only qa/fajr-visual-review-20261027 may auto-build previews, only web-v2 changes. No schedule, PR comments, paid product, database or Worker Function binding.
- Creating Git-connected project can initiate a build. Verify returned configuration and avoid any production publication. Inspect before pushing the new QA branch.
- Ask permission for the new separate public HTTPS QA site and QA-only branch push before executing, following the user's explicit publication gate.
- No live QA URL exists yet; do not construct a URL and claim it is live.

## Limits verified from official docs
Static asset requests without Functions are free; Pages Free has 500 builds/month and one concurrent build. Do not enable billing upgrades. Exact remaining account build quota was not retrieved.
Sources: https://developers.cloudflare.com/pages/functions/pricing/ and https://developers.cloudflare.com/pages/platform/limits/ .
No existing Cloudflare resource or production setting changed. No credential values persisted.
