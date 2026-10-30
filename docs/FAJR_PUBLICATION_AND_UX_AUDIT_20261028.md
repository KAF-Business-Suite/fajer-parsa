# Approved baseline publication and pre-change UX audit — 2026-10-28

## Publication
Owner explicitly authorized publishing the currently approved preview as main/public baseline, superseding the earlier no-production restriction for this Fajr site only. Same existing Cloudflare project, no new project or domain purchase. No Git merge or main-branch mutation.
Source: 267db7628d1b5ef96e2800bd1062fd1a4b10124c. Pages production deployment: 18c04074-6b1f-4a03-bf07-a9855944361f. Root: https://fajr-parsa-qa.pages.dev/ . The qa word remains the existing project name; root is now canonical production, distinct from preview alias. No functions/database/billing changes.
Existing 34 local browser checks and build apply to these same application assets. Live root rendered the branded app and confirmed all 15 countries in the finder. Actual new release screenshot captured. Samsung screenshots supplied by owner are visual feedback, not a full new device acceptance test.
noindex/nofollow retained while content is under development; publication does not imply search-engine indexing. Baseline Git source and immutable preview 157b0ca7-9075-40c5-94f3-6bf44d0fae20 retained for recovery. No prior production deployment existed in this project; do not assume rollback to an earlier production exists.

## Observed gaps before UI changes
- New country-services block repeats long plain text in 15 large cards, without images or hierarchy. Existing seven-image gallery is separate, creating duplicate browsing concepts.
- Service rail is native CSS horizontal overflow/snap with no active-card status or explicit previous/next controls.
- Details are modal summaries, not full destination/service pages.
- Mobile menu contains five anchors only. No real localization layer; all page copy is Persian and inline.
- Header and bottom dock consume substantial phone height; modal/action fitting and footer density need phone-specific checks.
- Hero eyebrow on bright imagery appears low contrast in live desktop screenshot; include in next palette/contrast review.

## Reuse shortlist and license boundaries
1. shadcn/ui carousel (Embla) for accessible swipe/controls/direction; https://ui.shadcn.com/docs/components/base/carousel ; project MIT: https://github.com/shadcn-ui/ui/blob/main/LICENSE.md . Retain current Radix-compatible choice rather than blindly installing another framework variant.
2. Existing Magic UI MagicCard/BlurFade and free Bento Grid for consistent accents/layout. Free source MIT verified at https://github.com/magicuidesign/magicui/blob/main/LICENSE.md . Pro is separate, not purchased.
3. React Bits Tilted Card: https://reactbits.dev/components/tilted-card . Current LICENSE.md is MIT + Commons Clause, not unrestricted MIT. Commercial site use permitted; resale/redistribution of components themselves restricted. Not yet imported. https://github.com/DavidHDev/react-bits/blob/main/LICENSE.md
4. Aceternity 3D Card Effect: https://ui.aceternity.com/components/3d-card-effect . Candidate only; free code/item license must be captured before import. Pro license is separate. No paid component copied.

## Next bounded implementation
Compact branded country cards with correct image metadata or honest illustrated fallback; selected detail reveals services as categorized choices. Use one shared catalog rather than duplicate inconsistent country sources. Ready-made carousel where needed; layer depth and short feedback, no auto-spinning content or expensive full-page WebGL. Hover-only tilt must have touch/keyboard alternative and reduced-motion mode.

Mobile menu groups: travel/services, destinations, worldwide booking, journey/FAQ/contact; add about/policies only with real content, never dead links or invented customer/account capabilities.

Languages requested: Persian fa and Pashto ps RTL; English en, Turkish tr, German de LTR. Separate locale dictionaries/pages with direction, font/glyph checks, dates, metadata and translated request flow. No fake language selector that leaves Persian content unchanged; do not auto-translate visa eligibility/guarantees as verified facts.

Acceptance: 320/360/393/768/1440 fitting; light/dark contrast; touch/keyboard rail controls; reduced motion; all country/request handoffs; locale consistency; image load/payload budget. Keep future interface work in QA first; do not treat approval of this baseline as blanket approval of every future production revision.
