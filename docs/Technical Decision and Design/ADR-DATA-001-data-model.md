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

The data model comprises five tables:

### `user_profiles`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | References `auth.users.id` |
| `email` | text | From Supabase Auth |
| `full_name` | text | |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### `charity_profiles`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `user_id` | uuid (FK → user_profiles) | Unique per user |
| `charity_name` | text | |
| `charity_number` | text | |
| `mission_statement` | text | |
| `beneficiaries` | text | |
| `programmes` | text | |
| `impact` | text | |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### `applications`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `user_id` | uuid (FK → user_profiles) | |
| `funder_name` | text | |
| `fund_name` | text | |
| `deadline` | date | Nullable |
| `amount_sought` | integer | In pence or £ (TBD) |
| `status` | text | `draft`, `in_progress`, `complete` |
| `current_step` | integer | 1–5 |
| `ai_summary` | text | Generated in Step 3 |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### `application_answers`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `application_id` | uuid (FK → applications) | |
| `user_id` | uuid (FK → user_profiles) | Denormalised for RLS |
| `question_text` | text | As entered by user |
| `answer_text` | text | AI-generated, then user-edited |
| `word_limit` | integer | Nullable |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### `ai_usage_log`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `user_id` | uuid (FK → user_profiles) | |
| `request_type` | text | `summary` or `draft` |
| `application_id` | uuid (FK → applications) | Nullable |
| `created_at` | timestamptz | Used for monthly count |

## Rationale

- Separate `application_answers` table supports auto-save of individual answers without rewriting the full application row.
- `user_id` is denormalised onto `application_answers` to allow straightforward RLS policies (`user_id = auth.uid()`) without requiring joins.
- `ai_summary` is stored on `applications` (not as an answer row) because it is generated content, not a question-answer pair.
- JSONB was rejected because individual answer querying and indexing is cleaner with normalised rows.

## Consequences

- RLS policies (ADR-SEC-002) must be defined for all five tables.
- `current_step` on `applications` drives the resume-flow logic (ADR-ARCH-004).
- `ai_usage_log.created_at` is used to count monthly usage (`WHERE created_at >= date_trunc('month', now())`).
- Funder guidelines text is intentionally absent from the data model — it is not stored (ADR-DATA-002).

## Source

FR-06 to FR-22, PDR-AI-005, BRD Section 9.

## Date Decided

2026-04-17
