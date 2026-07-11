# Email Notifications — Grant Pathway v1

This document defines the content, trigger conditions, and delivery rules for all system-generated emails in Grant Pathway v1. All emails must follow the Grant Pathway tone of voice — plain English, encouraging, honest, respectful, and concise.

---

## Sender Details

| Field          | Value                       |
| -------------- | --------------------------- |
| Display name   | Grant Pathway               |
| Sender address | noreply@grantpathway.org.uk |
| Reply-to       | (none — noreply address)    |

Email delivery is handled by Supabase Auth for authentication emails (Email 1 and Email 2) and by a transactional email service for system notification emails (Emails 3, 4, and 5).

---

## Email 1 — Email Verification

| Field           | Detail                                     |
| --------------- | ------------------------------------------ |
| **Trigger**     | User submits the registration form         |
| **Recipient**   | The email address provided at registration |
| **Subject**     | Verify your Grant Pathway email address    |
| **Link expiry** | 24 hours from send                         |
| **Handled by**  | Supabase Auth                              |

**Body:**

> Hi [First name],
>
> Thanks for signing up to Grant Pathway. Please verify your email address to activate your account.
>
> **[Verify my email address]** _(button — links to verification URL)_
>
> This link expires in 24 hours. If you did not create a Grant Pathway account, you can ignore this email.
>
> —
> Grant Pathway
> grantpathway.org.uk

**Notes:**

- If the verification link has expired, the user is shown a plain-language message on the verification page with a Resend email option (FR-03)
- The account remains inactive until email verification is complete

---

## Email 2 — Password Reset

| Field           | Detail                                        |
| --------------- | --------------------------------------------- |
| **Trigger**     | User submits the Forgot Password form         |
| **Recipient**   | The email address associated with the account |
| **Subject**     | Reset your Grant Pathway password             |
| **Link expiry** | 1 hour from send                              |
| **Handled by**  | Supabase Auth                                 |

**Body:**

> Hi [First name],
>
> We received a request to reset your password. Click the link below to choose a new one.
>
> **[Reset my password]** _(button — links to password reset URL)_
>
> This link expires in 1 hour. If you did not request a password reset, please ignore this email — your account is safe and no changes have been made.
>
> —
> Grant Pathway
> grantpathway.org.uk

**Notes:**

- If the reset link has expired, the user is shown a plain-language message with a link to request a new reset email
- No confirmation is sent after password reset is complete (Supabase Auth default behaviour)

---

## Email 3 — Inactivity Warning

| Field          | Detail                                                |
| -------------- | ----------------------------------------------------- |
| **Trigger**    | No login activity recorded for 23 consecutive months  |
| **Recipient**  | The email address associated with the account         |
| **Subject**    | Your Grant Pathway account will be deleted in 30 days |
| **Handled by** | Application scheduled job (Supabase)                  |

**Body (corrected 2026-07-10 -- verified against `lib/emails/inactivity-warning.ts`; previous body text below did not match the live email):**

> Hi [First name],
>
> We haven't seen you on Grant Pathway for nearly two years. To protect your privacy, we automatically delete inactive accounts after 24 months.
>
> **Your account will be permanently deleted on [deletion date].** If you'd like to keep it, simply sign in before that date.
>
> **[Sign in to keep my account]** _(button — links to homepage)_
>
> If you no longer need your account, you don't need to do anything — it will be deleted automatically on [deletion date].

**Notes:**

- Deletion date shown in the email is calculated as send date + 30 days, formatted as DD Month YYYY (e.g. 16 May 2028)
- A single login at any point before the deletion date resets the inactivity clock and cancels the scheduled deletion
- Only one inactivity warning email is sent per inactivity cycle

---

## Email 4 — Account Deleted (Inactivity)

| Field          | Detail                                                                                     |
| -------------- | ------------------------------------------------------------------------------------------ |
| **Trigger**    | No login activity recorded for 24 consecutive months (30 days after Email 3 with no login) |
| **Recipient**  | The email address associated with the now-deleted account                                  |
| **Subject**    | Your Grant Pathway account has been deleted                                                |
| **Handled by** | Application scheduled job (Supabase)                                                       |

**Body (corrected 2026-07-10 -- verified against `lib/emails/account-deleted-inactivity.ts`):**

> Hi [First name],
>
> As we notified you previously, your Grant Pathway account has now been permanently deleted due to 24 months of inactivity.
>
> All your data, including your charity profile and saved applications, has been removed. If you'd like to use Grant Pathway again, you're welcome to create a new free account.
>
> **[Create a new account]** _(button — links to registration page; corrected from "Register a new account")_

**Notes:**

- This email is sent immediately after account deletion is completed
- Data deleted includes: user account, charity profile, all saved applications and content, uploaded files, and AI usage records (per PDR-DH-002)
- The email address itself is retained only long enough to send this confirmation, then purged

---

## Email 5 — Account Deleted (User Initiated)

| Field          | Detail                                                                                                                    |
| -------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Trigger**    | User completes the account deletion flow in the application                                                               |
| **Recipient**  | The email address associated with the now-deleted account                                                                 |
| **Subject**    | Your Grant Pathway account has been deleted                                                                               |
| **Status**     | Should Have — FR-44. **Confirmed built (2026-07-10)**, no longer conditional; see `docs/PRD-Grant-Pathway.md` Section 6.9 |
| **Handled by** | Application (triggered on successful deletion)                                                                            |

**Body (corrected 2026-07-10 -- verified against `lib/emails/account-deleted-user.ts`):**

> Hi [First name],
>
> Your Grant Pathway account has been permanently deleted. All your data, including your charity profile and saved applications, has been removed.
>
> If you change your mind, you can create a new account at any time — it's free.
>
> **[Create a new account]** _(button — links to registration page; corrected from "Register a new account")_
>
> _The previous closing line, "Thank you for using Grant Pathway. We hope it was useful," does not exist in the live email — removed._

**Notes:**

- This email is sent immediately after account deletion is completed
- The subject line is intentionally identical to Email 4 — a user will only ever receive one or the other, never both
- Data deleted includes: user account, charity profile, all saved applications and content, uploaded files, and AI usage records (per FR-40 to FR-43)

---

## Summary

| #   | Email                            | Trigger                      | Expiry   | FR reference                          |
| --- | -------------------------------- | ---------------------------- | -------- | ------------------------------------- |
| 1   | Email verification               | Registration                 | 24 hours | FR-03                                 |
| 2   | Password reset                   | Forgot password request      | 1 hour   | FR-06                                 |
| 3   | Inactivity warning               | 23 months no login           | —        | PDR-DH-002                            |
| 4   | Account deleted (inactivity)     | 24 months no login           | —        | PDR-DH-002                            |
| 5   | Account deleted (user initiated) | User completes deletion flow | —        | FR-44 (Should Have — confirmed built) |

---

_Last updated: 2026-07-10_
