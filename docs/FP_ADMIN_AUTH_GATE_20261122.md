# FP-AUTH-02 / FP-AUTH-03 — One Admin Console, one sign-in, secure second factor

**Owner decision · 2026-11-22 · Fajr Parsa private QA only**

## Committed functional contract

1. **One application:** `/console` is the only user-facing private Admin entry. The office, requests, website management, connected resources and settings are permissioned modules inside one shell. Historical `/` remains temporarily for earlier emailed password-recovery fragments; it must not become a new advertised office/login product.
2. **One session:** after authorized owner sign-in, navigating between approved modules does not ask for a second password. Every API module must continue its server-side session/RBAC/RLS checks. A single frontend shell is **not** a bypass of those checks.
3. **One sign-out:** both global Admin and Security Center sign-out send the user to `/console` after the server confirms cookie expiration and provider logout call. Root `/` must not be used as a second exit destination. If logout fails, do not falsely claim success.
4. **Remembering a session:** an unexpired, server-verified remembered session can return directly to the Admin shell. This is not a new login. Explicit logout invalidates the browser cookie and requires authentication again. A code on *every app reopening* would require a separate, explicitly scoped reauthentication policy; do not silently conflate it with a code on each fresh sign-in.
5. **Second-factor code:** on each **new authentication**, the target is Supabase Auth TOTP, 6-digit challenge/verify, short-lived/replay-safe, server-verified and enforced at an appropriate assurance level (AAL2) before accessing owner-only APIs. No browser-side self-invented codes or displaying auth/refresh tokens. In-app navigation must not prompt additional codes.
6. **Activation safety:** actual mandatory TOTP enrollment and enforcement require a verified factor + tested recovery method/alternate registered factor + a QA login/relogin/logout dry-run on the owner's phone; include rejected code, expired challenge, interrupted network, forgotten device, disabled factor and rollback. The existing password login stays usable until this gate passes. Never assume Supabase Dashboard MFA factor is the same as the Fajr staff user.
7. **No duplicate access:** GitHub, Microsoft, Google and passkeys must only use an approved OIDC/WebAuthn authentication broker when individually configured and verified; do not create parallel admin user databases or separate Office passwords. Avoid emails/SMS charges by preferring app-based TOTP on the free tier.
8. **Protected source:** source-only / preview changes are not live features. User authorization and actual physical S21 acceptance must be tracked separately from Chromium synthetic test PASS.

## Gated implementation status

- **FP-AUTH-02:** unified sign-out destination `/console`, same central Worker session, explicit Admin name; automated CI and QA rollout only after PASS. No authenticator API configured or account modified.
- **FP-AUTH-03 — pending:** enroll TOTP, challenge/verify first-login factor, enforce AAL2 at the owner BFF and sensitive endpoints, prove the recovery route and role/RLS, then integrate one secure code-entry screen at `/console`. Code is requested once per new login, not per sidebar click. No mandatory activation before owner readiness.

## Acceptance

- Guest `/console` → branded Admin login at same URL, no private Pages/data.
- Authorized `/console` → Admin shell; no intermediate Office page.
- Admin submodules → existing owner-only BFF, no repeated login UI, refresh preserves selected module.
- Either sign-out → authorized server logout, browser cookie expires, `/console` guest login; Back/refresh must not restore confidential data.
- First MFA-enabled login → password then verified TOTP challenge (AAL2); correct factor passes, wrong/expired codes denied; recovery path tested and documented before activation.
- Tests: responsive 360/393px and desktop, FA/PS/EN/AR login entry, error handling, mobile keyboard, light/dark, no extra charged service, no public Production modification.

**Scope:** Existing draft PR #14 / KAF-35. Public Fajr Pages Production, Supabase user accounts, provider enrollment, credentials, service secrets and billing unchanged by FP-AUTH-02.
