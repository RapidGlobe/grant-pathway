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

## Source

FR-01 to FR-05.

## Date Decided

2026-04-21

## Revision History

| Date       | Change                                                                                                                                                                                                                                                                                                                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-07-10 | Added description of Resend's second usage pattern: direct REST API calls via `lib/emails/send.ts` (confirmed present in the codebase) for three transactional emails outside the Supabase Auth flow — account-deleted-by-user, inactivity-warning, and account-deleted-by-inactivity (Slice 8, S8.2/S8.3). Added corresponding `RESEND_API_KEY` environment-variable consequence. |
