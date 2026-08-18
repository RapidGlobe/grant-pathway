# Subject Access Request (SAR) Procedure

**Version:** 1.5
**Last updated:** 18 August 2026
**Owner:** Wac Jokhia, RapidGlobe Ltd
**Legal basis:** UK GDPR Article 15 — Right of Access

| Version | Date           | Changes                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.5     | 18 August 2026 | **Reviewed against the current stack — the project ref was wrong and three tables were missing.** Step 3 named `grant-pathway-prod` but gave dev's ref. Queries 7–9 added (`application_guidelines`, `application_items`, `user_tooltip_dismissals`); `ai_usage_log` gains `input_token_count`/`output_token_count`. New Step 3b covers the four stores outside the database. Axiom/Sentry inclusion left as an open decision for WJ. |
| 1.0     | 29 June 2026   | Initial version                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 1.1     | 29 June 2026   | Step 3 rewritten — six numbered queries; warning added that `user_id` is a UUID not an email                                                                                                                                                                                                                                                                                                                                          |
| 1.2     | 29 June 2026   | Notes: added future automation note                                                                                                                                                                                                                                                                                                                                                                                                   |
| 1.3     | 29 June 2026   | Version history table added; no content changes                                                                                                                                                                                                                                                                                                                                                                                       |
| 1.4     | 29 June 2026   | SAR contact email changed from wjokhia@rapidglobe.com to admin@rapidglobe.com                                                                                                                                                                                                                                                                                                                                                         |

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
**grant-pathway-prod** project (`mvmjryipieepvsjudche`)

> ⚠️ **Check the ref, not just the name.** Until 2026-08-18 this step named `grant-pathway-prod` but gave the ref `stanwaejdvlvremtffkf`, which is **`grant-pathway-dev`**. Following it would have answered a real subject access request from the development database — returning either nothing or the wrong person's test data, while stating in writing that it was a complete copy of their personal data. Prod is `mvmjryipieepvsjudche`; dev is `stanwaejdvlvremtffkf`.. Navigate to the **SQL Editor** and
> run the queries below, substituting the user's email address where shown.

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
select request_type, token_count, input_token_count, output_token_count,
       created_at, application_id
from ai_usage_log
where user_id = '<user_id>'
order by created_at;
```

### Query 7 — Extracted funder guidelines

**Added 2026-08-18.** The `application_guidelines` table did not exist when this procedure was written. It holds the guideline text the user uploaded or pasted, and the AI summary derived from it — the user's own content, and squarely within Article 15.

```sql
select ag.application_id, a.funder_name, a.grant_name,
       ag.source_type, ag.raw_text, ag.summary_json,
       ag.created_at, ag.updated_at
from application_guidelines ag
join applications a on a.id = ag.application_id
where a.user_id = '<user_id>'
order by ag.created_at;
```

### Query 8 — Application items

**Added 2026-08-18.** `application_items` carries the extracted question set and, for applications created by reuse, `cloned_from_application_id` linking to the source application.

```sql
select ai.application_id, a.funder_name, ai.item_type, ai.item_text,
       ai.cloned_from_application_id, ai.created_at, ai.updated_at
from application_items ai
join applications a on a.id = ai.application_id
where a.user_id = '<user_id>'
order by ai.created_at;
```

### Query 9 — Tooltip dismissals

**Added 2026-08-18.** Trivial in content but it is a record of the individual's interaction with the service, held against their `user_id`, so it is disclosable.

```sql
select tooltip_key, dismissed_at
from user_tooltip_dismissals
where user_id = '<user_id>';
```

⚠️ **Column names in queries 7–9 were read from the migrations, not from a live SAR.** Run each one and check it returns before assembling the response — a column may have been renamed since. If a query errors, list the table's columns rather than guessing: `select column_name from information_schema.columns where table_name = '<table>';`

### Step 3b — Data held outside the database

**Added 2026-08-18. Four stores hold personal data that no SQL query above will find.** This procedure was written on 2026-06-29, before three of them existed.

| Store                                          | What it holds                                                                                       | Include in the export?                                                                                                                                                                                            |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Supabase Storage**, bucket `guidelines-temp` | Files the user uploaded, at `guidelines-temp/<user_id>/<filename>`                                  | **Yes — download and include them.** They are the user's own documents. Check the bucket even if the applications look complete; uploads are transient by design and may not correspond to a current application. |
| **Axiom** (technical logs, 30 days)            | Request logs including the user's **IP address** — disclosed in Privacy Policy Section 2 since v1.7 | **Decision needed — see below.**                                                                                                                                                                                  |
| **Sentry** (error reports, up to 12 months)    | Error events, which may carry a user identifier                                                     | **Decision needed — see below.**                                                                                                                                                                                  |
| **Upstash** (rate-limit counters, ~1 hour)     | A counter keyed by `user.id` or email                                                               | **No.** Transient and expired long before a one-month response window closes. Say so if asked rather than treating it as a hidden store.                                                                          |

⚠️ **Axiom and Sentry are a genuine open question, not an oversight to be quietly resolved by whoever handles the first SAR.** Article 15 covers technical logs where the individual is identifiable, and an IP address in a log tied to a signed-in session usually is. Against that: the logs are keyed by request rather than by user, so retrieval means searching 30 days of log lines, and the exercise risks exposing other people's data if done carelessly. **This needs a decided position before the first real SAR arrives**, not an improvised one under a one-month deadline. Raised with WJ 2026-08-18; unresolved at the time of writing.

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
- funder-guidelines.csv  — the funder guidelines you uploaded or pasted, and the summaries produced from them
- application-items.csv  — the question sets extracted from those guidelines
- tooltip-dismissals.csv — which in-service help tips you have dismissed
- uploaded-files/         — the guideline documents you uploaded, in their original format

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
