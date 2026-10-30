# Fajr Parsa — portable request summary, 2026-10-29

Scope: existing QA branch only. No production, database, dependency, billing or automatic customer messages.

After the customer validates and reviews the request, a read-only text field and explicit copy button make the exact summary portable to email or another messenger. Clipboard denial selects the text and explains manual copying. The summary retains the country, selected service subtype and bundle. Editing inputs hides the previous review and clears copy feedback. Neither copying nor downloading submits a request to the office; the interface states this explicitly. Existing WhatsApp handoff remains available.

Validation: production build and browser smoke suite, including simulated clipboard success and denial, context preservation, stale-review clearing and existing country flows. Real Samsung clipboard permission and paste into another app require device acceptance. No destination email address or unconfigured intake channel has been invented.

Source changes: web-v2/src/components/DetailsDialog.tsx, web-v2/src/visual-review.css, web-v2/tests/smoke.mjs.
