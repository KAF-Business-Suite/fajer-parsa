# Fajr Parsa HTTPS preview — 2026-10-27

User authorized QA branch publication and separate public HTTPS preview in this conversation.

## Published source
- Repository: KAF-Business-Suite/fajer-parsa
- Branch: qa/fajr-visual-review-20261027
- Published application commit: f41a1b74324324ad24a1537dbcba4e1134661762
- Exact Git tree: b8b7f121052c516d96017535aec6031fa705f08c, equal to local tested QA commit 7ffa12beaa2651fbc649a1932d2ca23a1bf30c80.
- Shell push had no GitHub credential. Used authorized GitHub API blobs/tree/commit/ref tools. Every file including all twelve binary images preserved; tree hashes identical. API commit metadata differs from local history. No force push or main update.

## Cloudflare result
- Separate Pages project: fajr-parsa-qa
- Deployment ID: 63f7659b-bdb6-4fdb-b7d1-e1d8c58633a2
- Immutable preview URL: https://63f7659b.fajr-parsa-qa.pages.dev
- Branch alias returned by Cloudflare: https://qa-fajr-visual-review-202610.fajr-parsa-qa.pages.dev
- Environment: preview. Deploy stage: success.
- Production branch setting: main; canonical production deployment: null.
- uses_functions: false; no database, paid binding, account billing setting or existing project changed.
- 23 real build-output files uploaded (about 2 MiB), including local fonts, optimized photos and compiled application.
- X-Robots-Tag noindex,nofollow; X-Content-Type-Options nosniff; Referrer-Policy strict-origin-when-cross-origin attached as deployment headers. These are not access controls: preview is public by user permission.

## Git integration caveat
Git-connected Pages creation failed with Cloudflare 8000011 (internal Pages Git installation issue), despite valid MCP access. Direct Upload creation/upload succeeded. Project has no Git source connection, so pushes do not auto-deploy. This differs from the earlier proposed Git-connected JSON, which remains historical proposal only.
Existing Git source remains fully preserved and independently buildable. Future releases can upload the compiled output again; repairing the Git installation or creating a separate Git-connected project is a later decision. Do not assume Direct Upload projects can be converted to Git integration.

## Acceptance evidence
- Existing independent build PASS; 24 browser checks PASS before publication.
- API publication, uploaded file count, exact source-tree equality and Cloudflare preview deployment stage PASS.
- Public page rendering, online file checksum comparisons and live browser interactions NOT VERIFIED: this environment's browser and HTTP proxy returned upstream connection/reset 503 rather than application content; the web fetch tool also could not access this new URL. No positive online screenshot was obtained. Do not claim site is broken or working from those transport errors alone.
- Real Samsung acceptance NOT TESTED. Next: open immutable preview on Samsung and verify capsule header/menu, theme switch, destination search, Iran prefilled request and reload; do not send a real WhatsApp message for QA.
- No production deployment performed.
