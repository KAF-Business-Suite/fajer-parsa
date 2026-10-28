# Owner-confirmed service scope — 2026-10-28

Owner confirmed the full proposed 15-country list and listed service types in conversation, including both Malaysia and Maldives. Iran includes every proposed visa type, residence, work, ticket, tour, invitation and application assistance. Saudi Arabia includes Hajj/Umrah. Japan is specifically a one-year work service; route/eligibility details remain unverified. Worldwide ticket and booking service explicitly confirmed. Scope is expandable.

Canonical structured source: web-v2/src/content/countries.ts. This is business scope supplied by the owner, not independently verified immigration policy or an approval guarantee. No invented price, processing time, accommodation, employer or job guarantee.

Implemented: all 15 countries in finder, country/service overview cards with destination-context request handoff, worldwide ticket/booking request with bundle context. Existing seven photographic inspiration cards retained; no misleading stock photo for the new destinations.

Not implemented: central submissions, email intake, case database, customer portal, WhatsApp API, AI or automations. No new integrations or billing. QA source only; publication status recorded separately.

Validation: production build PASS; 34 browser checks PASS, including 15-country finder, Japan destination handoff and worldwide booking bundle. No browser runtime errors or external asset requests in checked flows. Actual Samsung hardware remains untested.
