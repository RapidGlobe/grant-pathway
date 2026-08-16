---
id: ADR-OPS-003
category: Operations
status: Decided
---

# ADR-OPS-003 — Email Service

## Context

Grant Pathway sends transactional emails to users for:

1. **Email verification** — confirm email address on registration (FR-01)
2. **Password reset** — link to reset forgotten password (FR-04)

Supabase Auth handles both flows natively and includes a built-in email service. However, Supabase's built-in email has sending limits and is not suitable for production use at scale. A dedicated email service provides better deliverability and branding.

## Options Considered

### Option A — Supabase Auth built-in email (no custom provider)

- **What it is:** Supabase sends verification and password reset emails using its own email service.
- **Strengths:** Zero configuration. Works immediately.
- **Weaknesses:** Limited to 4 emails per hour on the Supabase free tier. Email templates are basic (customisable in the Supabase dashboard but limited). Poor deliverability for production. Not suitable beyond early development.

### Option B — Resend (custom SMTP for Supabase Auth)

- **What it is:** Resend is a developer-focused transactional email service. Supabase Auth can be configured to use a custom SMTP server. Resend provides a free tier (100 emails/day, 3,000 emails/month).
- **Strengths:** Good deliverability. Simple API. Generous free tier. Designed for transactional email. Can send custom-branded emails.
- **Weaknesses:** Requires SMTP configuration in Supabase dashboard. Domain verification required for best deliverability.

### Option C — SendGrid

- **What it is:** Established transactional email service. Free tier: 100 emails/day.
- **Strengths:** Industry standard. High deliverability. Extensive analytics.
- **Weaknesses:** More complex setup than Resend. Interface is designed for marketing email as well as transactional.

### Option D — Postmark

- **What it is:** Transactional email focused service. Known for excellent deliverability.
- **Strengths:** Best-in-class deliverability for transactional email.
- **Weaknesses:** No free tier (paid from first use). Justified at scale, not for early-stage product.

## Decision

**Option B — Resend, configured as Supabase Auth's custom SMTP provider.**

Resend handles all transactional email: verification on registration and password reset links. It is configured in the Supabase dashboard under Authentication → SMTP Settings — not in Next.js environment variables. Supabase Auth manages the sending; Resend provides the delivery infrastructure.

**Setup steps (one-time, before go-live):**

1. Create a Resend account at resend.com
2. Add and verify the sending domain (SPF and DKIM DNS records on the Rapidglobe or Grant Pathway domain)
3. Generate a Resend API key
4. Configure Supabase Auth SMTP: host `smtp.resend.com`, port 465, username `resend`, password = API key, sender address = verified domain

**Email template configuration (before go-live):**
Supabase Auth's default email templates reference "Supabase" — these must be customised before any user sees them. Templates are edited in the Supabase dashboard under Authentication → Email Templates.

| Template             | Required customisation                                                            |
| -------------------- | --------------------------------------------------------------------------------- |
| Email verification   | Grant Pathway name, warm welcome tone, teal CTA button, correct verification link |
| Password reset       | Grant Pathway name, clear instructions, teal CTA button, correct reset link       |
| Magic link (if used) | Grant Pathway name, teal CTA button                                               |

Templates should follow the tone and voice guide in design-requirements.md: warm, encouraging, plain English. No jargon. See ADR-OPS-002 pre-launch checklist.

**Added 2026-07-10 — a second usage pattern (direct Resend REST API, not Supabase Auth SMTP):**

The Decision above only covers Resend as Supabase Auth's custom SMTP provider for the two auth-flow emails (verification, password reset). Since Slice 8 (S8.2/S8.3), Grant Pathway also calls Resend directly via its REST API for three transactional emails that are not part of the Supabase Auth flow:

| Email                           | Trigger                                                             | Builder function                                                                     |
| ------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Account deleted (by user)       | User-initiated account deletion (`app/api/account/delete/route.ts`) | `buildAccountDeletedByUserEmail()` in `lib/emails/account-deleted-user.ts`           |
| Inactivity warning              | `inactivity-warning` cron, 23-month inactivity threshold            | `buildInactivityWarningEmail()` in `lib/emails/inactivity-warning.ts`                |
| Account deleted (by inactivity) | `inactivity-deletion` cron, 24-month inactivity threshold           | `buildAccountDeletedInactivityEmail()` in `lib/emails/account-deleted-inactivity.ts` |

All three are sent via `sendEmail()` in `lib/emails/send.ts` — a thin wrapper that calls `POST https://api.resend.com/emails` directly with `fetch()` (not the `resend` npm SDK, to avoid an extra dependency), authenticated with `RESEND_API_KEY` as a Next.js server-only environment variable. This is a distinct credential and code path from the Supabase dashboard SMTP configuration described above: these emails are triggered by application code (a Route Handler or a Vercel Cron job), not by Supabase Auth, and their HTML is built in code rather than edited in the Supabase/Resend template editor — a deliberate choice recorded in `IMPLEMENTATION-STATUS.md` (P3.8 design note) because Resend's template editor does not support variable substitution needed for personalisation (first name, deletion date).

## Consequences

- A Resend account (or equivalent) must be created and connected to the Rapidglobe sending domain.
- Supabase email templates (verification, password reset) should be customised to match the Grant Pathway brand (warm, approachable tone from design-requirements.md).
- SMTP credentials must be stored securely in the Supabase dashboard (not in the Next.js environment variables).
- **Added 2026-07-10:** `RESEND_API_KEY` must also be stored as a server-only Next.js environment variable (in Vercel and `.env.local`) for the direct REST API path (`lib/emails/send.ts`) used by account-deletion and inactivity-cycle emails — this is separate from, and in addition to, the SMTP credential stored in the Supabase dashboard.

## Transport security — decided 2026-08-15 (WJ), **applied 2026-08-16**

**Decision: Enforced TLS on the `grantpathway.org.uk` sending domain, not Opportunistic.**

> ✅ **APPLIED 2026-08-16 by WJ**, screenshot-verified: Resend → Domains → `grantpathway.org.uk` → Configuration → TLS now reads **Enforced**. **The exposure described below is now historical rather than live**, for auth emails sent from this domain on or after that date.
>
> _Superseded note, kept because the practice is the point: from 2026-08-15 to 2026-08-16 this section read "DECIDED, NOT YET APPLIED", recorded that way deliberately at WJ's instruction. A decision written up as though it were live is exactly the drift this project keeps finding — `P5.3`'s gate row and `P5.3b`'s status line were both wrong for the same reason. The gap between deciding and applying was one day, and during it the document said so._
>
> ⚠️ **One thing did not change with the flip: the open question below.** Applying the setting closes the decision, not the visibility question — **if an Enforced-TLS rejection ever happens, we still do not know that we would see it.** The support ticket is still owed.

This ADR previously said nothing about transport security at all, so the setting sat at Resend's default with nobody having chosen it.

**What the setting governs.** The last hop only — Resend handing the message to the recipient's mail provider. The app-to-Resend connection is already encrypted (`smtp.resend.com:465`) and is unaffected. Resend's documentation: _"If the receiving server does not support TLS, your email will not be sent."_ Opportunistic instead falls back to sending **unencrypted**.

**Why it matters here specifically.** These are not marketing emails. The verification and password-reset messages carry **tokens that grant account access**. Under Opportunistic, in the case where TLS cannot be negotiated, one of those crosses the internet in clear text. Two things bound the exposure — the links expire in one hour and are single-use — and the attacker needs network-path position between AWS Ireland and the recipient's mail host, which is an ISP- or state-level capability rather than a casual one. It is nonetheless the only place in this system where a credential would be permitted to travel unencrypted, against a build that is otherwise strict throughout (HSTS, nonce-based CSP, RLS verified across 22 assertions, Sentry PII scrubbing on all three runtimes).

**What it costs.** A charity whose mail server does not support TLS will **never receive the email and cannot register**, with no explanation shown to them. The affected population is judged small: most UK charities run Microsoft 365 or Google Workspace through the nonprofit programmes, and both enforce TLS.

### ⚠️ Open question — is an Enforced-TLS failure visible to us?

**Unresolved, and recorded as unresolved rather than assumed.** Resend's documentation states only that the email "will not be sent". It does **not** say whether the message appears in the Emails dashboard, what status it is given, or whether a reason is recorded.

This was originally argued in favour of Enforced on the grounds that such failures would show as a visible bounce, making them diagnosable where an Opportunistic downgrade would be invisible. **That claim was inferred, not verified, and the documentation does not support it.** The decision stands on the two remaining grounds above — small exclusion population, and consistency with the rest of the security posture — not on that one.

**Why this is not merely academic:** the assumption that "a charity who cannot register will get in touch" is weak. A charity that cannot complete registration for a free tool it has just discovered is more likely to close the tab than to report a fault, and silent attrition is indistinguishable from nobody having tried.

**Partial answer received 2026-08-15 — from Resend's documentation chatbot, not their support team.** Provenance matters here and is recorded rather than glossed: the reply narrated its own documentation searches and closed by offering to raise a ticket, so it is a search over the public docs, not a statement from someone with visibility of the platform's behaviour.

What it said, and how much of it to rely on:

- **Claimed:** a `failed` status exists among Resend's email events, meaning "the email failed to be sent", distinct from `bounced` (where the receiving server accepts the connection and then rejects the message). On that basis it asserted the failure "is not a silent failure — it's visible to you."
- **Immediately qualified:** the documentation "doesn't specify the exact failure reason text that appears for TLS-related rejections", and it recommended a support ticket to confirm.

**Treat this as encouraging but not settled.** The existence of a `failed` event is a documented fact; that an Enforced-TLS rejection is _reported through it_, and distinguishably, is the inference — which is precisely the shape of the mistake this section already records once. **The open question stands.**

**Action owed — and now more pressing, not less, because the setting is live.** While TLS was Opportunistic, an unanswerable failure question was hypothetical: nothing was being refused. **From 2026-08-16 a refusal is possible, and we still cannot say we would see it.** Raise the support ticket to confirm the exact status and reason text for a TLS rejection, and record the answer here. ⚠️ **The failure mode to hold in mind is a charity that never receives its verification email and simply gives up** — silent at both ends, since `requestPasswordReset` and the registration flow are deliberately non-revealing. **A post-launch option that would make the question moot:** Resend supports webhooks for email events — wiring `email.bounced` into Sentry would surface delivery failures regardless of Resend's default logging. That is build work, not configuration, so it does not belong in `P5.4`.

## Sending region — recorded 2026-08-15, **re-confirmed 2026-08-16**

**The `grantpathway.org.uk` domain sends from Resend's Ireland (`eu-west-1`) region.** ✅ **Confirmed a second time on 2026-08-16**, from the domain screen during the TLS change — the console shows `Region: Ireland (eu-west-1)` alongside `Status: Verified` and `Provider: GoDaddy`. `GAP-102` therefore rests on directly observed evidence, twice, rather than on a single reading. Recorded here because this ADR named no region at all, which is how the discrepancy in `GAP-102` went unnoticed: `privacy-policy-external.md` places Resend in the **United States**. That may be a deliberate statement about the corporate entity rather than the infrastructure — Resend is a US company, and US entity access is possible regardless of sending region — but the two documents should not disagree silently. **See `GAP-102`; that is an open decision, not a correction to be made unilaterally**, given `P5.1` closed with an independent solicitor review.

## Source

FR-01 to FR-05.

## Date Decided

2026-04-21

## Revision History

| Date       | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-08-16 | **Enforced TLS APPLIED** — the decision taken on 2026-08-15 is now the live setting, screenshot-verified on the Resend domain screen. **The "DECIDED, NOT YET APPLIED" warning is superseded but kept in place rather than deleted**, because the one-day gap between deciding and applying is the practice this project is trying to hold: for that day, the document said the live behaviour was still Opportunistic, and it was. ⚠️ **Applying the setting closes the decision and not the open question** — an Enforced-TLS rejection is now possible where before nothing was being refused, and it remains unconfirmed whether such a failure is visible to us at all. **The support ticket is more pressing than it was yesterday, not less**, and the failure mode to hold in mind is a charity that never receives its verification email and gives up, silent at both ends. **Sending region re-confirmed** in the same screenshot — `Ireland (eu-west-1)`, alongside `Verified` and provider GoDaddy — so `GAP-102` now rests on directly observed evidence twice over rather than a single reading.                                   |
| 2026-08-15 | **Two sections added, covering ground this ADR had never addressed: transport security and sending region.** **TLS set to Enforced** (WJ's decision, during `P5.4`) — the auth emails carry account-granting tokens, and Opportunistic permits them to travel unencrypted where TLS cannot be negotiated. Cost accepted: a charity on a non-TLS mail server cannot register. **An open question is recorded honestly rather than resolved:** the argument that Enforced failures would be visible as a bounce in Resend's dashboard was **inferred and is not supported by Resend's documentation**, which says only that the email "will not be sent". The decision stands on its other grounds; the visibility question is owed to Resend support. **Sending region recorded as Ireland (`eu-west-1`)** — this ADR previously named no region, which is how `GAP-102` (the Privacy Policy placing Resend in the United States) went unnoticed. Also recorded during the same `P5.4` walkthrough: custom SMTP configured on `grant-pathway-prod` (`GAP-101`) and proven by a real production registration; DKIM and SPF both confirmed Verified. |
| 2026-07-10 | Added description of Resend's second usage pattern: direct REST API calls via `lib/emails/send.ts` (confirmed present in the codebase) for three transactional emails outside the Supabase Auth flow — account-deleted-by-user, inactivity-warning, and account-deleted-by-inactivity (Slice 8, S8.2/S8.3). Added corresponding `RESEND_API_KEY` environment-variable consequence.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
