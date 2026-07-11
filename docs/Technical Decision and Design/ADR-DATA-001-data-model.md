---
id: ADR-DATA-001
category: Data
status: Decided
---

# ADR-DATA-001 — Data Model

## Context

Grant Pathway stores user accounts, charity profile information, grant applications, and per-question draft answers. The data model must support multi-step application flows, AI usage tracking, and the ability for users to have multiple concurrent applications in different states. All data is scoped to the authenticated user.

## Options Considered

- **Option A — Flat model (applications table stores all answer fields as columns):** Simple, all data in one row per application. Not extensible if question sets change between funders.
- **Option B — Normalised model (separate `application_answers` table with one row per question):** More flexible. Allows variable numbers of questions per application. Supports per-question save/load without fetching the entire application row.
- **Option C — JSON blob for answers:** Store all answers in a JSONB column on the `applications` table. Flexible but harder to query and index individual answers.

## Decision

**Option B — Normalised model with a separate `application_answers` table.**

The data model comprises six tables:

### `funders`

| Column           | Type        | Notes                                                       |
| ---------------- | ----------- | ----------------------------------------------------------- |
| `id`             | uuid (PK)   |                                                             |
| `name`           | text        | Unique. Full name of the grant-giving organisation          |
| `funder_type`    | text        | `structured` or `narrative` — determines Step 4 routing     |
| `grant_range`    | text        | Nullable. Display string only (e.g. "£10k–£30k")            |
| `guidelines_url` | text        | Nullable. URL to funder's apply/guidelines page             |
| `is_active`      | boolean     | Default: `true`. Only active funders shown in Step 1 picker |
| `created_at`     | timestamptz |                                                             |

### `user_profiles`

| Column       | Type        | Notes                      |
| ------------ | ----------- | -------------------------- |
| `id`         | uuid (PK)   | References `auth.users.id` |
| `email`      | text        | From Supabase Auth         |
| `full_name`  | text        |                            |
| `created_at` | timestamptz |                            |
| `updated_at` | timestamptz |                            |

### `charity_profiles`

| Column              | Type                      | Notes           |
| ------------------- | ------------------------- | --------------- |
| `id`                | uuid (PK)                 |                 |
| `user_id`           | uuid (FK → user_profiles) | Unique per user |
| `charity_name`      | text                      |                 |
| `charity_number`    | text                      |                 |
| `mission_statement` | text                      |                 |
| `beneficiaries`     | text                      |                 |
| `programmes`        | text                      |                 |
| `impact`            | text                      |                 |
| `created_at`        | timestamptz               |                 |
| `updated_at`        | timestamptz               |                 |

### `applications`

| Column          | Type                          | Notes                                                                                            |
| --------------- | ----------------------------- | ------------------------------------------------------------------------------------------------ |
| `id`            | uuid (PK)                     |                                                                                                  |
| `user_id`       | uuid (FK → user_profiles)     |                                                                                                  |
| `funder_id`     | uuid (FK → funders, nullable) | Nullable for migration safety. Set when user selects from the approved funder picker (DR-FD-001) |
| `funder_name`   | text                          | Retained for display/export. Populated from `funders.name` on selection                          |
| `fund_name`     | text                          |                                                                                                  |
| `deadline`      | date                          | Nullable                                                                                         |
| `amount_sought` | integer                       | In pence or £ (TBD)                                                                              |
| `status`        | text                          | `draft`, `in_progress`, `complete`                                                               |
| `current_step`  | integer                       | 1–5                                                                                              |
| `ai_summary`    | text                          | Generated in Step 3                                                                              |
| `created_at`    | timestamptz                   |                                                                                                  |
| `updated_at`    | timestamptz                   |                                                                                                  |

### `application_answers`

| Column           | Type                      | Notes                          |
| ---------------- | ------------------------- | ------------------------------ |
| `id`             | uuid (PK)                 |                                |
| `application_id` | uuid (FK → applications)  |                                |
| `user_id`        | uuid (FK → user_profiles) | Denormalised for RLS           |
| `question_text`  | text                      | As entered by user             |
| `answer_text`    | text                      | AI-generated, then user-edited |
| `word_limit`     | integer                   | Nullable                       |
| `created_at`     | timestamptz               |                                |
| `updated_at`     | timestamptz               |                                |

### `ai_usage_log`

| Column           | Type                      | Notes                  |
| ---------------- | ------------------------- | ---------------------- |
| `id`             | uuid (PK)                 |                        |
| `user_id`        | uuid (FK → user_profiles) |                        |
| `request_type`   | text                      | `summary` or `draft`   |
| `application_id` | uuid (FK → applications)  | Nullable               |
| `created_at`     | timestamptz               | Used for monthly count |

## Rationale

- Separate `application_answers` table supports auto-save of individual answers without rewriting the full application row.
- `user_id` is denormalised onto `application_answers` to allow straightforward RLS policies (`user_id = auth.uid()`) without requiring joins.
- `ai_summary` is stored on `applications` (not as an answer row) because it is generated content, not a question-answer pair.
- JSONB was rejected because individual answer querying and indexing is cleaner with normalised rows.
- `funders` is a global reference table (not user-scoped) — RLS allows all authenticated users to read active funders but only the service role may write (DR-FD-001).

## Consequences

- RLS policies (ADR-SEC-002) must be defined for all six tables, including the non-user-scoped `funders` table.
- `current_step` on `applications` drives the resume-flow logic (ADR-ARCH-004).
- `ai_usage_log.created_at` is used to count monthly usage (`WHERE created_at >= date_trunc('month', now())`).
- Funder guidelines text is intentionally absent from the data model — it is not stored (ADR-DATA-002).

## Source

FR-06 to FR-22, PDR-AI-005, PRD-Grant-Pathway.md (Section 9 — Data Requirements).

## Date Decided

2026-04-17

## Revision History

| Date       | Change                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-06-01 | `funders` table added (DR-FD-001) — approved funder directory, global/non-user-scoped. `funder_id` nullable FK added to `applications`. Table count updated 5 → 6. RLS consequence updated.                                                                                                                                                                                                                                            |
| 2026-07-05 | **Superseded in part by ADR-DATA-006.** The flat `application_answers` structure described here is being replaced by a typed item-graph model, following a nine-funder review that found the flat/narrative-only assumption false in twenty distinct ways. Not yet built — see ADR-DATA-006 and its linked build plan for the phased migration. This table remains the accurate record of the schema as it exists in production today. |
