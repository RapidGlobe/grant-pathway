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

**Body:**

> Hi [First name],
>
> We noticed you haven't logged in to Grant Pathway for a while. To keep your account and any saved applications, simply log in before [deletion date — 30 days from send date].
>
> **[Log in to Grant Pathway]** _(button — links to sign-in page)_
>
> If we don't hear from you, your account and all associated data — including your charity profile and saved applications — will be permanently deleted on [deletion date]. This cannot be undone.
>
> If you no longer need your account, you don't need to do anything.
>
> —
> Grant Pathway
> grantpathway.org.uk

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

**Body:**

> Hi [First name],
>
> As we mentioned in our previous email, your Grant Pathway account has now been deleted due to inactivity. All data associated with your account — including your charity profile and saved applications — has been permanently removed.
>
> If you'd like to use Grant Pathway in the future, you're welcome to register again at any time.
>
> **[Register a new account]** _(button — links to registration page)_
>
> —
> Grant Pathway
> grantpathway.org.uk

**Notes:**

- This email is sent immediately after account deletion is completed
- Data deleted includes: user account, charity profile, all saved applications and content, uploaded files, and AI usage records (per PDR-DH-002)
- The email address itself is retained only long enough to send this confirmation, then purged

---

## Email 5 — Account Deleted (User Initiated)

| Field          | Detail                                                                 |
| -------------- | ---------------------------------------------------------------------- |
| **Trigger**    | User completes the account deletion flow in the application            |
| **Recipient**  | The email address associated with the now-deleted account              |
| **Subject**    | Your Grant Pathway account has been deleted                            |
| **Status**     | Should Have — FR-44. Only implemented if FR-44 is included in v1 build |
| **Handled by** | Application (triggered on successful deletion)                         |

**Body:**

> Hi [First name],
>
> This confirms that your Grant Pathway account has been permanently deleted, as you requested. All data associated with your account — including your charity profile and saved applications — has been removed.
>
> If you change your mind in the future, you're welcome to register again at any time.
>
> **[Register a new account]** _(button — links to registration page)_
>
> Thank you for using Grant Pathway. We hope it was useful.
>
> —
> Grant Pathway
> grantpathway.org.uk

**Notes:**

- This email is sent immediately after account deletion is completed
- The subject line is intentionally identical to Email 4 — a user will only ever receive one or the other, never both
- Data deleted includes: user account, charity profile, all saved applications and content, uploaded files, and AI usage records (per FR-40 to FR-43)

---

## Summary

| #   | Email                            | Trigger                      | Expiry   | FR reference        |
| --- | -------------------------------- | ---------------------------- | -------- | ------------------- |
| 1   | Email verification               | Registration                 | 24 hours | FR-03               |
| 2   | Password reset                   | Forgot password request      | 1 hour   | FR-06               |
| 3   | Inactivity warning               | 23 months no login           | —        | PDR-DH-002          |
| 4   | Account deleted (inactivity)     | 24 months no login           | —        | PDR-DH-002          |
| 5   | Account deleted (user initiated) | User completes deletion flow | —        | FR-44 (Should Have) |

---

_Last updated: 2026-04-16_
