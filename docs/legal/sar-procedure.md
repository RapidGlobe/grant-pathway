# Subject Access Request (SAR) Procedure

**Version:** 1.4
**Last updated:** 29 June 2026
**Owner:** Wac Jokhia, RapidGlobe Ltd
**Legal basis:** UK GDPR Article 15 — Right of Access

| Version | Date         | Changes                                                                                      |
| ------- | ------------ | -------------------------------------------------------------------------------------------- |
| 1.0     | 29 June 2026 | Initial version                                                                              |
| 1.1     | 29 June 2026 | Step 3 rewritten — six numbered queries; warning added that `user_id` is a UUID not an email |
| 1.2     | 29 June 2026 | Notes: added future automation note                                                          |
| 1.3     | 29 June 2026 | Version history table added; no content changes                                              |
| 1.4     | 29 June 2026 | SAR contact email changed from wjokhia@rapidglobe.com to admin@rapidglobe.com                |

---

## Overview

Any Grant Pathway user may request a copy of the personal data held about them. Under UK GDPR
Article 15, RapidGlobe Ltd must respond within **one calendar month** of receiving the request.
This document describes how to handle such a request from receipt to completion.

---

## Step 1 — Receive and acknowledge (within 3 working days)

Requests will arrive at **admin@rapidglobe.com**. They may be worded informally — any request
asking "what data do you hold about me?" or "I'd like to see my information" counts as a SAR.

Send the acknowledgement email below within 3 working days of receipt. Note the date received
and the response deadline (one calendar month from receipt date).

### Acknowledgement email template

```
Subject: Your subject access request — Grant Pathway

Dear [Name],

Thank you for your subject access request received on [date].

We will provide a copy of the personal data we hold about you within one calendar month,
i.e. by [deadline date].

If we need to verify your identity before we can release the data, we will contact you
separately.

Kind regards,
Wac Jokhia
RapidGlobe Ltd
admin@rapidglobe.com
```

---

## Step 2 — Verify identity (if not already certain)

If the request comes from an email address that matches a registered Grant Pathway account,
identity is established. No further verification is needed.

If there is any doubt (e.g. the email address does not match a known account, or the request
arrives by post), ask the requester to confirm the email address associated with their account
before proceeding.

---

## Step 3 — Retrieve the data from Supabase

Log in to the Supabase dashboard at [https://supabase.com](https://supabase.com) and open the
**grant-pathway-prod** project (`stanwaejdvlvremtffkf`). Navigate to the **SQL Editor** and
run the queries below, substituting the user's email address where shown.

> **Important:** `user_id` is a UUID, not an email address. The first query resolves the email
> to a UUID. Copy that UUID before running the remaining queries — do not paste the email address
> into the `where user_id = ...` clauses or you will get a type error.

### Query 1 — Resolve email to user ID (run this first)

```sql
select id, email, created_at, last_sign_in_at
from auth.users
where email = 'user@example.com';
```

Copy the `id` value (a UUID like `a1b2c3d4-...`). Use it in place of `<user_id>` in all
queries below.

### Query 2 — User profile

```sql
select first_name, last_name, feedback_consent, created_at, updated_at
from user_profiles
where user_id = '<user_id>';
```

### Query 3 — Charity / organisation profile

```sql
select charity_name, registration_number, what_charity_does,
       who_charity_helps, where_charity_works, lookup_source,
       created_at, updated_at
from charity_profiles
where user_id = '<user_id>';
```

### Query 4 — Applications

```sql
select id, funder_name, grant_name, status, current_step,
       draft_status, created_at, updated_at, last_exported_at
from applications
where user_id = '<user_id>'
order by created_at;
```

### Query 5 — Application answers

```sql
select a.funder_name, a.grant_name,
       aa.question_text, aa.answer_text, aa.ai_refined_answer,
       aa.answer_source, aa.is_approved, aa.word_limit,
       aa.char_limit, aa.question_order, aa.created_at, aa.updated_at
from application_answers aa
join applications a on a.id = aa.application_id
where aa.user_id = '<user_id>'
order by a.created_at, aa.question_order;
```

### Query 6 — AI usage log

```sql
select request_type, token_count, created_at, application_id
from ai_usage_log
where user_id = '<user_id>'
order by created_at;
```

Export each query result as CSV using the download button in the SQL Editor results panel.

---

## Step 4 — Compile and send the response

Assemble the CSV files into a ZIP archive named `grant-pathway-data-export-[date].zip`.
Send the response email below with the ZIP attached.

### Response email template

```
Subject: Your personal data — Grant Pathway subject access request

Dear [Name],

Please find attached a copy of the personal data Grant Pathway holds about you as of [date].

The attachment contains the following files:

- auth-account.csv       — your email address, account creation date, last sign-in date
- user-profile.csv       — your name and communication preferences
- charity-profile.csv    — your organisation profile
- applications.csv       — your grant applications (names, statuses, dates)
- application-answers.csv — the questions and answers within each application
- ai-usage-log.csv       — a log of AI-assisted requests made from your account

If you have any questions about this data, or if you believe anything is inaccurate,
please reply to this email and we will look into it.

You also have the right to ask us to correct or delete your data, or to restrict how
we use it. Details are in our Privacy Policy at https://grantpathway.org.uk/privacy.

Kind regards,
Wac Jokhia
RapidGlobe Ltd
admin@rapidglobe.com
```

---

## Step 5 — Record the request

Add a row to the table below once the response has been sent.

| Date received | Requester email | Date responded | Notes |
| ------------- | --------------- | -------------- | ----- |
|               |                 |                |       |

---

## Notes

- **One-month deadline:** runs from the date of receipt, not the date of acknowledgement.
  If the month-end falls on a weekend or bank holiday, the deadline extends to the next
  working day.
- **No charge:** SARs are free of charge in almost all cases (UK GDPR Article 12(5)).
- **Manifestly unfounded or excessive requests:** may be refused or charged a reasonable fee,
  but this should be rare. If in doubt, respond in full.
- **Third-party data:** do not include data about other individuals in the export. The queries
  above are scoped to the requester's own `user_id` so this risk is minimal.
- **Backup copies:** personal data in automated Supabase backups is not separately exported —
  backups are not accessible to users and are rotated within 7 days. This is disclosed in the
  Privacy Policy Section 7.
- **Solicitor review:** if a SAR appears connected to a complaint, potential legal claim, or
  is unusually complex, seek legal advice before responding.
- **Future automation:** if SAR volume increases to the point where manual processing becomes
  a burden, build a self-serve `/api/account/data-export` endpoint that assembles and downloads
  all personal data in one step from Account Settings. This was the alternative considered at
  the time this procedure was adopted (2026-06-29) and remains the natural next step.
