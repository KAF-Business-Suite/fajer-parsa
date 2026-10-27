# Fajr corporate controls and initial-load refinement — 2026-10-27

User approved a bounded implementation after read-only audit, with priority on avoiding regressions. QA branch and existing preview only; original main/production/database/billing unchanged.

## Implemented
- Removed misleading floating sparkle helper and AI-not-connected product copy; guide now links to real service selection and uses a question/help icon.
- Removed continuously shimmering hero button and rotating finder border. Hero title paints directly without entrance blur. Secondary sections retain a once-only 300ms opacity/translate entrance without blur. MagicCard and ScrollProgress remain selectively used.
- Theme control now switches immediately, avoiding full-page transition overlays capturing quick follow-up clicks. Both themes and local preference retained.
- Primary gold, secondary outlined and inline service-selection controls are consistent; bundle and navigation labels are clearer. Existing brand, capsule header, fuller local fonts, photos and phone-safe controls preserved.
- Deferred the Radix request/details dialog until an explicit open action; loading status is accessible. No new dependency.
- Finder destination/purpose/passport, individual service and bundle choice now flow into the request form and reviewed WhatsApp message. Related services are selectable. Context is serialized explicitly without UI state.
- Contact/tracking windows offer the actual office WhatsApp link instead of a new-order button. No message was sent. Tracking remains contact-based; no live case backend added.

## Validation
Build PASS; 29 browser checks PASS including lazy chunk loading, preserved Iran/tourism/Afghanistan request context, service and bundle prefill, contact action, both themes, normal/reduced motion, focus restoration and five viewport widths. No runtime errors or external requests in checked flow.
The single-process browser test harness could not close an extra context safely; the deferred-load test was corrected to use a fresh navigation in the existing page, preserving the actual request assertions. Product code did not bypass browser errors.
Desktop and phone screenshots visually reviewed. Main JS 506.68 -> 450.99 kB minified (~11% less); gzip 163.15 -> 144.33 kB. Deferred dialog ~46.85 kB minified /16.25 kB gzip loads on demand. Vite chunk-size warning no longer emitted. Text CSS ~74.69 kB /18.01 kB gzip. Hero phone photo remains ~87 kB.

## Same local lab comparison (not field measurements)
393x852 touch viewport; CPU4x; network1.6 Mbps,120ms latency; gzip text, cache disabled; three runs. Before LCP 3136/3224/2720 ms; after 2596/2472/2584 ms. Median 3136 ->2584 ms (~18%). Long-task blocking proxy median812 ->605 ms. CLS remained under0.02. Not measured live origin INP or Samsung. Do not claim field Core Web Vitals pass or guaranteed speed; total below-fold image loading can differ between runs. Test harness is an external temporary audit script, not shipped application code.

## Limits
Previous issues such as durable request recovery/import, company legal content, real online case tracking/payment and Samsung acceptance remain separate. No standalone demo and no new service created. Current app publication uses existing Direct Upload Pages preview and does not enable push auto-deployment.
