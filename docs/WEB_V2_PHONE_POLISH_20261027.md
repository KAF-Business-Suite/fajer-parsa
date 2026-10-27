# Fajr phone typography, motion and dark palette — 2026-10-27

Scope: QA branch only; user requested fuller type, phone sizing and motion/dark-mode improvements. Existing application and business flows retained; prior request-context audit defects remain outside this styling change.

## Changes
- Retained locally bundled, licensed Vazirmatn Variable (Persian) and Manrope Variable (Latin). Fuller headings (800–850), medium body text; Persian service/step labels use the Persian family rather than Latin fallback. No external font request or new dependency.
- Phone inputs/search 16px; cards and FAQ text larger; phone hero more compact; destination cards one-column below 360px; safe-area bottom bar with 46px controls; redundant floating guide hidden on phone to reduce overlap. Guide remains in main page.
- Dark surfaces and borders separated; header less transparent; white logo plate; phone hero scrim improves text readability; dark gold panels now dark tonal panels with contrasting cream titles; dark bundle rows and footer text corrected. Light hero eyebrow contrast corrected.
- Existing Magic UI BlurFade adapted to 16px/4px/550ms entrance. Added individual staged entrance to four journey steps, service heading, bundle panel and bottom call to action; hover lift only for fine pointers; press feedback. Reduced-motion behavior retained. No new dependency.

## Verification
Build PASS; all 25 smoke checks PASS. Includes no overflow in both light and dark at 320/360/393/768/1440, phone control font size, hidden duplicate floating button, destination heading weight, dark panel title contrast >=4.5 against each gradient endpoint, existing request/navigation behavior, reduced motion and normal pointer interaction. Zero runtime errors/external asset requests in checked flow.
Actual new screenshots reviewed: phone hero/destinations/journey/footer and desktop sections. Samsung hardware still NOT TESTED. Existing JS main-chunk warning (~507 kB minified) remains; no warning hidden and no dependency added.
Public preview update uses existing Direct Upload project and QA branch. No main/production/database/billing changes. Cloudflare Git integration remains disconnected; updates do not auto-deploy.
