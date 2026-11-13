# FP-NAV-01 / FP-CONTACT-01 — Fajr Parsa mobile controls and contact gate
Status: IMPLEMENTED ON REVIEW BRANCH; NOT RELEASED TO PRODUCTION
Date: 2026-11-13
Source of truth: `KAF-Business-Suite/fajer-parsa`; authorized existing Cloudflare Pages project `fajr-parsa-qa`.
Global authority: GLOBAL_PROJECT_AI_GOVERNANCE.md + UNIVERSAL_SYSTEM_CONTROL_PLANE.md. Execution record: Linear KAF-31.

## Problem observed on current production
- At 320 CSS px, floating header can slightly overflow the screen; theme is 44×44, language is 44–87×44 and menu is 44×44, but surfaces have inconsistent radii/motion.
- Existing fixed mobile bar has two actions (request and direct WhatsApp). Users cannot distinguish primary navigation from a messaging handoff.
- The previous home header exposes a mobile-inappropriate mix of brand, appearance, language, request, and menu.
- WhatsApp is an existing public link, but official Telegram/email destinations and an in-site AI agent are unverified. A connected Gmail/Pipedrive account does not prove a customer-facing business endpoint or consented CRM intake.

## Locked information architecture
Header on mobile: existing brand -> single language selector -> appearance toggle -> expandable services menu. No duplicate request CTA in mobile header.
Bottom navigation on compact view: Home -> Services -> Start enquiry -> Contact. The request action is distinguished by brand gold; other items are destinations or a disclosed contact sheet.
Header on desktop: brand, service routes, language, appearance, optional Contact, and primary Enquiry. On the Afghanistan inbound page, Start enquiry scrolls to the consent-aware inbound form; elsewhere it opens existing draft enquiry.
Contact sheet: one verified direct Office WhatsApp link, with Telegram / email / AI assistant labeled PENDING and deliberately **not clickable**. No false promise of immediate response or CRM registration.
Language: Dari (fa-AF/RTL), English (en/LTR), Arabic (ar/RTL), sharing one translation map.
Theme: 44×44 touch target and 18px icon; language and menu 44px minimum; synchronized radius, border, motion (160ms) and keyboard focus.

## Standards and acceptance
- W3C WCAG 2.2 2.5.8 minimum target 24px, preferred 44px for important touch targets: https://www.w3.org/TR/WCAG22/#target-size-minimum
- Android layouts: 3–5 primary destinations in bottom navigation: https://developer.android.com/design/ui/mobile/guides/layout-and-content/layout-and-nav-patterns
- Required browser checks: widths 320, 360, 393, 430; no horizontal overflow/clipping, each header control >=44px; exactly four bottom destinations, contact selection/ESC/keyboard; all three languages; no outbound WhatsApp or CRM send.
- Build/smoke/SEO/intake synthetic tests must PASS on exact SHA before Preview.
- Physical Samsung S21 owner acceptance remains distinct and UNVERIFIED until performed.
- Rollback: main/production immutable deployment before this PR. Keep production untouched; review-only branch and Cloudflare preview use the protected release workflow.

## Provider/communication status and next gate
- WhatsApp: existing public `wa.me` number only; actual customer sending remains user initiated.
- Email: active Gmail connection is not verification of a branded sender/address; UNVERIFIED.
- Telegram: no validated business bot or official channel destination; UNVERIFIED.
- AI agent: no approved live customer-facing configuration or safety/privacy contract; UNVERIFIED.
- CRM: FPTA Pipedrive access exists, but website-to-CRM ingestion/consent/audit/readback is UNVERIFIED. Never claim automatic registration.
- Next dedicated gate after visual acceptance: FP-INTAKE-01, synthetic-only preview-confirm-readback through a verified service boundary, with role/org access and privacy review; no real customer data, messages, secrets, paid provider or live DB writes without approval.
