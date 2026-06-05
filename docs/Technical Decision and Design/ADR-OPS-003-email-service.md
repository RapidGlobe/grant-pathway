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

## Consequences

- A Resend account (or equivalent) must be created and connected to the Rapidglobe sending domain.
- Supabase email templates (verification, password reset) should be customised to match the Grant Pathway brand (warm, approachable tone from design-requirements.md).
- SMTP credentials must be stored securely in the Supabase dashboard (not in the Next.js environment variables).

## Source

FR-01 to FR-05.

## Date Decided

2026-04-21
