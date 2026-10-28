# React Bits integration and Vercel readiness — 2026-10-28

## Real integration
Vendored React Bits TiltedCard TypeScript/plain CSS from DavidHDev/react-bits main, paths src/ts-default/Components/TiltedCard/TiltedCard.tsx and TiltedCard.css. Retrieved 2026-10-28. Complete upstream LICENSE.md retained alongside component. License: MIT + Commons Clause, permits application/website use; component resale/redistribution as standalone product is restricted. Not purchased Pro.

Adapted TiltedCard.tsx SHA256: ca1803814dfaf8b4d0feef752cbdf3b071cc1965bc92568b8555828b839fd54c. Upstream origin URL and retained license identify the fetched source; this hash identifies our adapted application copy.

Adaptations: image lazy/async decode; device-motion permission disabled by default. Usage explicitly disables gyroscope, floating and intro, restricts rotation to 5 degrees and scale to 1.015, and honors reduced motion through zero rotation/scale and static CSS. No new package or lockfile change.

CountryExplorer replaces 15 tall text-only cards with compact 2-column phone/3-column desktop cards, real ready-made tilt component, local 7-destination photography where available, and deliberately graphic code/globe artwork for countries without photos. No invented landmark/location image. AI Pakistan origin label retained. No claim every country has a new photo. Country search and keyboard/touch request handoff retained. Worldwide booking retained.

## Vercel
Connected team kaf-bs-01 (slug kfa-bs). Existing Fajr project fajer-parsa-new, prj_yJJLFmQfApkHkpd7lzXqdeZPDw3U. Existing personal abdulfahim-parsa is separate and untouched. Fajr project API shows framework null, node24.x, older READY production deployment; this is not the current Cloudflare source. Account plan not exposed in the returned team summary, so not verified.

Prepared web-v2/vercel.json: Vite, npm ci, npm run build, dist. Project root must be web-v2 if later connected. No Vercel project settings/Git connection/domain/protection/deployment/billing modified. No migration from Cloudflare. Official Vercel Hobby terms restrict commercial use, so do not promise free Vercel hosting for this company or deploy without resolving the existing plan/cost allowance.

## Release boundary
New interface goes to existing QA preview only. Previously approved production baseline remains 267db7628d1b5ef96e2800bd1062fd1a4b10124c. Five-language translation, complete country photo collection, richer navigation and full service pages remain separate pending work; not claimed delivered here.

Validation: build PASS; 35 local browser checks PASS, including normal-motion tilt matrix, keyboard activation, country filtering, two-column phone layout and reduced-motion static transform. Zero runtime errors/external requests in checked flows. Phone preview screenshot inspected. Initial JS 470.24 kB minified / 151.17 kB gzip (previous 457.58 / 146.04); no dependency additions. Actual Samsung hardware remains not tested.
