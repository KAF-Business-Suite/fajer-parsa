# Fajr Parsa — Cloudflare + WordPress.com newsroom integration
Date: 2026-11-03
Status: Candidate only (draft PR). No production release authorized by this change.

## Decision and ownership
- The Fajr Parsa React/Vite site in web-v2 is the **only customer-facing website**.
- Cloudflare Pages project: fajr-parsa-qa (root_dir=web-v2, build= npm run build, output=dist). Its name includes QA; do not assume it is a final official domain.
- WordPress.com site ID 256155663, https://fajerparsa.wordpress.com, is the **editorial source** for public articles only.
- No duplicate service pages, booking flows, forms, prices, identities or case records are copied from WordPress.
- The existing original company logo under web-v2/public/media/logo.png is preserved.
- The separate khwajaprn/fahim-parsa repository is a *personal* portfolio, not a source for this integration.

## Technical data flow
WordPress.com published posts
  -> unauthenticated public REST GET https://public-api.wordpress.com/wp/v2/sites/256155663/posts
  -> web-v2/src/lib/wordpress-content.ts (read-only public adapter)
  -> web-v2/src/components/Newsroom.tsx
  -> existing same-origin React site hash routes:
      #/journal
      #/journal/post/:id

In the current deployment architecture, Cloudflare Pages hosts static React assets. The browser requests public published articles directly from WordPress.com. It does NOT use a WordPress plugin, database, Function, Worker, secret, token or server-side content mutation. The connection is dynamic for articles and works without a website rebuild when WordPress publishes a new article, subject to API availability/CORS and client network access.

## Security and reliability
- Never send applicant data, cookies, contact messages, forms, credentials or case IDs to WordPress.
- Public WordPress GET with credentials:'omit' only; validate response shape, allow published posts only.
- The demonstration default post slug hello-world is hidden.
- Treat all externally authored content as untrusted: DOMParser extracts text nodes only; never inject WP markup into innerHTML.
- Provide loading/empty/error/retry states. A WordPress outage must not break the Fajr homepage or intake.
- All existing release gates remain intact. Do not add a Pages Function or a Worker: the safe release workflow currently explicitly rejects those artifacts.
- No changes to WordPress theme, plugins, DNS, privacy, homepage or published content.

## SEO/editorial and canonical content policy
- Keep service catalog and company facts solely in the website's maintained service content / approved company sources.
- WordPress stores editorial material (news, visa explainers, pilgrimage guides), not copy-pasted company/service landing pages.
- Browser-rendered React article views may not be fully indexable by search engines; **SEO is not certified** by this candidate.
- Before an official launch, decide one canonical URL per full article, verify robots/indexing behavior of WordPress.com and Cloudflare, and implement appropriate canonical or content syndication policy. Do not assert that one is already deindexed.
- Use Dari/Afghan terminology and verify visas, prices, legal terms and dates against authoritative sources before publishing. Publishing content requires separate content review.

## QA acceptance gates (must pass before production)
1. npm ci; npm run typecheck; npm run build; npm run test:intake; npm run test:smoke; npm run test:intake-form.
2. On a *preview only*, check #/journal for loading and empty state (currently WP has only "Hello World!", intentionally hidden).
3. Publish one reviewed, non-test WordPress article only after editorial approval, then verify same-site listing and article text without rebuild.
4. Test WordPress REST cross-origin behavior and offline/API failure with retry; confirm no uncaught errors.
5. Test 360/390/393px Samsung browser, desktop, RTL keyboard and tap navigation, and access to request form.
6. Verify public search-engine policy/canonical URLs; content and privacy compliance.
7. Identify verified production URL and ensure source SHA/QA and rollback are documented. No change to production before owner approval.

## Known limitations
- WordPress simple hosting has limited plugin capabilities; none are needed for this content read.
- No published business articles exist yet: only the WordPress default "Hello World!" post.
- This candidate is read-only and integrates public content, not WordPress user login or WordPress admin.
- Hash routing + client-side fetch does not provide SSR/static indexing or the final SEO and bilingual editorial workflow.
- The current interface for articles is in Dari; English article representation needs a later approved content policy.
