# Fajr Parsa visual review — 2026-10-27

Branch: qa/fajr-visual-review-20261027
Base: f9492f3371a36cf1a00d36b6b808df40d1b09697
Scope: existing web-v2 project only. Main, original root website, database and production untouched. No deployment, push, new service or cost.

## Implemented
- Fully rounded detached capsule header; mobile drawer and focus handling retained. Scroll shadow and progress indicator.
- Bright local Dubai hero with separate mobile image; two themes, light default, remembered explicit preference.
- Seven destination cards, real country/city search, category filtering and destination details. Kaaba no longer used as hero.
- Clearer customer copy, interactive service bundles, FAQ and office contact path.
- Destination-prefilled request form, service/date/traveler inputs, explicit review summary and user-initiated WhatsApp link. No automatic message, server submission, payment or customer-account claim.
- Individual section/card reveals, title animation, shimmer primary button, hover glow, border beam and animated theme change. Reduced-motion alternatives retained.

## Ready-made code
Seven Magic UI components now used: blur-fade, magic-card, border-beam, shimmer-button, text-animate, scroll-progress, animated-theme-toggler.
New four copied from magicuidesign/magicui commit efe76fc5755eca1142dd4f74c1d6f0ace2887e3c, registry/magicui/<component>.tsx; MIT notice retained in web-v2/vendor/magicui/LICENSE.md.
Adaptations: local utils import, Persian accessible theme label, controlled next-themes state, reduced-motion fallback and corresponding registry keyframes.
Wayfare supplied by user is a visual reference for capsule geometry, calm spacing and phone structure; no Framer template code or paid components copied.

## Photo provenance
Optimized local WebP derivatives, original photographers retained below. Unsplash License https://unsplash.com/license permits commercial use and modification. Do not resell unchanged photos or build a competing image service.
- Dubai: Sirav Talwar — https://unsplash.com/photos/lMo2HjtoUpM
- Istanbul: usman faisal — https://unsplash.com/photos/HRhS-mMExhE
- Iskanderkul: Dilshod Hojiboev — https://unsplash.com/photos/TVr0kUIIsdY
- Shiraz: Faruk Kaymak — https://unsplash.com/photos/OYTO1UKJK3M
- AlUla: Purvang Panchal — https://unsplash.com/photos/WgCNeDhNWXY
Existing Karbala/Pakistan project images remain. Photos introduce destinations and are not availability or price guarantees.

## Validation
Node 24.22.1 / npm 11.9.0; existing lockfile unchanged, no dependency added.
Build PASS. 24 browser checks PASS, including actual request review and URL contents, no automatic external request, destination filters, menu focus, both themes, reduced motion and root overflow at widths 320/360/393/768/1440.
Actual Chromium screenshots reviewed at desktop 1440 and mobile 393. Destination title layout fixed after visual review. Reproducible audit: web-v2/tests/visual-review.mjs. Browser results: docs/qa/web-v2-visual-20261027.json.
Build warning: JS main chunk approximately 506.5 kB minified / 163.1 kB gzip, above Vite 500 kB warning threshold; performance budget/code splitting remains future optimization, not a failed build.
Samsung hardware/Samsung Internet, real office message delivery and public HTTPS end-to-end: NOT TESTED. No WhatsApp message sent.

## Publication blocker
Cloudflare dashboard currently redirects this conversation browser to login. No Cloudflare connector/installable plugin found. Existing production/preview branch settings cannot be verified without account access; therefore no branch push or deploy was attempted. Existing GitHub homepage is not evidence that web-v2 is deployed. No preview URL invented and no standalone demo created.
Next: authenticate the existing Cloudflare account securely, inspect the Fajr project and branch auto-deploy settings, then publish only an authorized preview of this branch with root web-v2, build npm run build, output dist. Do not alter production branch or paid settings.
