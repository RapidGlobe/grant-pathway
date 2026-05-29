# Step 4 Redesign Proposal
## Session notes — 2026-05-26

These notes capture the design review and recommendations from the 2026-05-26 working session.
They are held here for review before implementation begins. No code has been changed.

---

## Background: what triggered this review

Three test fixture documents were reviewed to understand what grant-giving authorities actually expect
from applicants. The review surfaced significant diversity in application formats that has design
implications for Grant Pathway's Step 4 (draft generation).

### Test fixture findings

> **Note (2026-05-29):** The 3-funder table below was the original test fixture used to trigger the redesign. It has been superseded by the consolidated 12-funder target list, which is now the canonical reference. See [`docs/target-funder-list.md`](../target-funder-list.md).

| Funder | Document | Key finding |
|---|---|---|
| National Lottery Heritage Fund | `heritage-fund-application-guidance.pdf` | Structured online form with discrete questions + up to 11 categories of mandatory supporting documents |
| Garfield Weston Foundation | `Garfield Weston Application-guidelines-1.pdf` | Free-form typed proposal, max 10 A4 pages — NO discrete questions, thematic sections only |
| Stony Stratford Town Council | `Stony-Stratford-Town-Council-Grant-Scheme-2026-27-adopted-FC0226.docx` + `Stony Stratford Grant-Application-Form-2026.docx` | Small local council grant (typical £100–£1,000, max £5,000). Structured form with 13 numbered questions submitted as a Word document by email. Includes a budget table (income + expenditure), a supporting documents checklist (7 categories), and requires countersignature by the treasurer. Third distinct funder format: downloadable form, not an online portal or free-form narrative. |

### Key design implications from the guidelines review

1. **The "discrete questions" assumption does not hold universally.** Heritage Fund = structured questions
   with word limits. Garfield Weston = no questions, just themes to cover in a narrative document.
   The current `AiSummaryData.questions` array will be empty for ~half the market.

2. **Supporting documents are not captured anywhere.** Heritage Fund requires up to 11 document
   categories, some mandatory, and will not begin assessment until all are received. Stony Stratford
   requires 7 categories (accounts, constitution, AGM minutes, board approval minutes, business plan,
   equality policy, safeguarding policy where applicable). Grant Pathway currently has no mechanism
   to surface, list, or track supporting document requirements.

3. **Financial tables are not narrative answers.** Garfield Weston requires two detailed financial
   tables (projected income, planned expenditure) plus a budget summary and income plan narrative.
   Stony Stratford requires a per-line income/expenditure table plus a balance outstanding figure.
   AI must never generate the financial figures — these must come from the charity.

4. **Two-stage application processes exist.** Garfield Weston Major Grants (over £100k) require an
   Expression of Interest before a full proposal is invited. Minor concern at current stage but
   worth noting for the roadmap.

5. **Application output format differs across three types.** Heritage Fund = answers submitted to an
   online portal (one answer per question). Garfield Weston = a single Word/PDF document. Stony
   Stratford = a Word form emailed to the council clerk. The assembled output shape must differ by
   funder type.

6. **Senior countersignature is a real requirement.** Stony Stratford requires the application to be
   signed by the applicant AND countersigned by the treasurer. This validates the Stage 3 senior
   review prompt in the redesign model — it is not just best practice, it is a mandatory condition
   for at least some funders.

---

## The problem with the current Step 4 "Generate Draft" approach

The current design sends the charity profile + funder summary to Bedrock and returns a complete
draft in a single call. This produces AI-authored content that:

- Will not contain the charity's actual statistics, case studies, or authentic voice
- May include hallucinated figures or generic statements
- Will likely be identified by experienced grants officers as AI-generated
- Actively disadvantages the charity with funders who score for specificity and authentic community voice

---

## Funder AI guidance reviewed

### Henry Smith Foundation (formal AI statement document)

- **Position:** Cautious. Use AI for structure and to suggest themes; do not let AI write the content.
- Key quotes:
  - "Your application should reflect your voice and experience"
  - "Applications written in your own words give a much better insight into your work"
  - "If you use AI, let it help structure your application rather than the content"
  - "AI-generated applications can include errors, generic information, and don't always make sense"
- Privacy: explicit GDPR warning — do not put personal/identifiable details into AI tools.

### National Lottery Community Fund (web statement, extracted by user)

- **Position:** Permissive but explicit about the risk. Will not reject AI applications, but:
  - "AI supported applications do not tell the unique story of your community"
  - "Being too generic in content may disadvantage your application"
  - "Don't rely on AI-suggested budgets without reviewing them"
  - Explicit environmental impact warning: use AI mindfully and only where it clearly helps
- Privacy: explicit GDPR warning. Refers applicants to the ICO for guidance on AI and data protection.

### Common thread across both funders

Both funders, despite different tolerance levels, are saying the same thing:
**generic AI content = weaker application.** The charity's specific details, community insights,
and authentic voice = stronger application.

---

## Recommended redesign: Q&A dialogue model

### The principle

> Grant Pathway uses AI to ask the right questions and assemble the answers.
> The charity writes the content.

This is fully compliant with Henry Smith's "AI for structure not content" guidance and fully aligned
with the Community Fund's "specific, community-rooted, your voice" guidance. It produces better
applications and removes the risk of AI-detectable generic content disadvantaging the charity.

### How Step 4 works under the new model

**Stage 1 — Preparation checklist (one-time, before Q&A begins)**

Display a "Before you begin" screen prompting Margaret to gather:
- Most recent annual accounts or financial statements
- Projected budget for the grant period (income and planned expenditure)
- Details of other funding secured or applied for
- Input from the treasurer, finance lead, or a trustee who understands the budget

Explicit message: *"The financial sections cannot be completed by AI. You will need your actual figures.
It is worth involving a senior colleague before reaching the financial questions."*

**Stage 2 — Q&A interview (multi-session, persistent)**

For each question/section identified in the Step 3 summary:
- The charity types their own answer in a text area
- Answers auto-save on field blur (no AI involved — pure database write)
- Budget/financial questions are visually distinct (amber highlight, "£" badge)
- Budget questions have the AI assist button disabled with explicit label:
  *"This section requires your actual financial data — do not estimate or use AI-generated figures"*
- Non-budget questions have an optional "Help me improve this" button that takes the charity's
  draft answer and refines structure/clarity — it does NOT add factual content

**Stage 3 — Senior review prompt (before assembly)**

Before triggering the final Bedrock assembly call, display:

> *Before assembling your final draft, we recommend checking with your CEO, treasurer, or a trustee that:*
> - *The budget figures are accurate and approved*
> - *The project description reflects your current priorities*
> - *You have authority to submit this application*

**Stage 4 — Final assembly (one Bedrock call)**

Takes all Q&A pairs and assembles them into the funder's required format:
- Structured form funders (Heritage Fund): answer-per-question output
- Free-form document funders (Garfield Weston): coherent flowing narrative, respecting page limits

**Stage 5 — Export**

Copy section by section (for portal submission) or download as Word document (for free-form funders).

---

## AI usage positioning

Grant Pathway's guidance to users at the point of export should reflect the funder-facing spirit:

> *"This application was built using Grant Pathway's guided process. The responses reflect
> your organisation's own answers to structured questions, reviewed and formatted for this
> funder's requirements."*

---

## Funder AI policy in the Step 3 summary

If the funder's guidelines contain an AI usage statement, the Step 3 summary display should
surface it as a notice. Proposed addition to `AiSummaryData`:

```typescript
funderAiPolicy?: string  // extracted from guidelines if present; null if not mentioned
```

Displayed in Step 3 as an info banner before the charity proceeds to Step 4.

---

## Supporting documents gap

Heritage Fund requires up to 11 categories of supporting documents. Proposed addition to
`AiSummaryData`:

```typescript
supportingDocuments?: string[]  // list of documents the funder requires or recommends
```

Displayed in Step 3 as a "Documents you will need to submit" checklist so the charity can
gather them before starting the Q&A.

---

## Cost, storage, and Bedrock usage impact

### Bedrock call pattern

| Call | Trigger | Approx tokens | Notes |
|---|---|---|---|
| Step 3 summary | Unchanged | ~3,200 total | No change |
| Generate question set | Once on entering Step 4 | Likely eliminable | Questions already in `ai_summary` — derive deterministically |
| Per-question assist | Optional, on demand per question | ~1,200 total | User chooses; disabled on budget questions |
| Final assembly | Once, all answers complete | ~5,000 total | Comparable to current single draft-generation call |

Net effect per application: roughly 1.5–2× current Bedrock spend. Not an order-of-magnitude change.

### Monthly cap needs redesigning

Current: 20 AI calls per user per month.

Under Q&A model, one application consumes approximately:
- Step 3 summary: 1 call
- Per-question assists (optional, typically 3–5): up to 5 calls
- Final assembly: 1 call
- Total per application: ~7 calls

A charity working on 3 applications in a month could consume ~21 calls and hit the cap mid-way
through their second application. The current cap was designed for a 1-call-per-step model.

**Decision (2026-05-28):** Raise the monthly cap from 20 to 50 and monitor. Per-application
credit budgeting remains on the roadmap but is not implemented in this phase. A flat cap of 50
calls is simple to implement with no change to the existing `ai_usage` tracking logic.

### Storage impact

| Item | Estimate per application |
|---|---|
| 8–10 Q&A answers (~300 words each) | ~25 KB |
| AI-refined versions (where requested) | ~15 KB |
| Assembled final draft | ~20 KB |
| Step 3 summary (already stored) | ~5 KB |
| **Total** | **~65 KB** |

Negligible. No storage cost concern at current or projected scale.

---

## Database changes required

**Decision (2026-05-28):** Extend the existing `application_answers` table rather than adding a
JSONB column to `applications`. This keeps individual answers as discrete rows (better for
partial saves, progress tracking, and future querying) and avoids the overhead of deserialising
a large JSONB blob on every read.

### `application_answers` table — two new columns

```sql
ai_refined_answer  TEXT     -- AI-improved version of the user's answer (NULL if not requested)
is_budget_question BOOLEAN  NOT NULL DEFAULT false  -- disables AI assist on this question
```

### `applications` table — two new columns

```sql
assembled_draft  TEXT     -- final assembled application text (written by assembly API)
draft_status     TEXT     -- 'not_started' | 'in_progress' |
                          --   'ready_to_assemble' | 'assembled' | 'exported'
```

The existing `application_answers` row structure (one row per question, with `question_index`,
`question_text`, `user_answer`, `is_complete`, `updated_at`) is unchanged. The two new columns
are additive — no data migration required.

---

## Session persistence requirements

The Q&A model is fundamentally multi-session. The auto-save behaviour is critical:

- Auto-save triggers on field blur (user moves focus away from a text area)
- Single Supabase `update` call per save — no AI involved
- On re-entering an in-progress application, the Q&A screen shows:
  - Green: questions with a complete answer
  - Amber: questions with a partial answer
  - Grey: questions not yet started
- The charity picks up exactly where they left off

---

## Summary of what changes vs what stays the same

| Area | Status |
|---|---|
| Steps 1, 2, 3 | **Unchanged** |
| Bedrock infrastructure, rate limiting, usage logging | **Unchanged** |
| Charity profile | **Unchanged** |
| Application persistence (applications table) | **Extended** — three new columns |
| AiSummaryData type | **Extended** — add `funderAiPolicy`, `supportingDocuments` |
| Step 4 UI | **Redesigned** — Q&A interface replaces single "Generate" button |
| Step 4 Bedrock call | **Repositioned** — assembly of charity's words, not generation from scratch |
| Monthly AI cap logic | **Needs rethinking** — per-application credits vs raw call count |
| Budget handling | **New constraint** — financial questions flagged; AI assist disabled; senior involvement prompted |

---

## Open questions before implementation begins

1. ~~**Replace TNL test fixture**~~ — **Resolved 2026-05-28.** Replaced with Stony Stratford Town
   Council grant scheme guidelines + application form. Three representative fixture types now in
   `docs/test-fixtures/`: Heritage Fund (structured online portal), Garfield Weston (free-form
   narrative), Stony Stratford (structured Word form submitted by email).

2. ~~**Monthly cap model**~~ — **Resolved 2026-05-28.** Raise monthly cap from 20 to 50 and
   monitor. Per-application credit budgeting deferred to a later phase. No change to the
   existing `ai_usage` tracking logic is required for this release.

3. ~~**Assembly output format**~~ — **Resolved 2026-05-28.** The assembly API writes to
   `applications.assembled_draft`. Step 5 export reads from that single column — it does not
   reassemble from individual answer rows. Word document export for free-form funders
   (Garfield Weston) is in scope for Step 5 (S6.8), not a later phase.

4. ~~**Supporting documents checklist**~~ — **Resolved 2026-05-28.** `supportingDocuments`
   surfaces in Step 3 as a read-only aide-memoire ("Documents you will need to submit"). No
   interactive ticking. Grant Pathway does not track whether documents have been gathered —
   that is the charity's responsibility.

5. ~~**`funderAiPolicy` field**~~ — **Resolved 2026-05-28.** Display as an info banner in Step 3,
   below the main summary and above the "Proceed to Step 4" button. Prominent enough to be
   seen before the charity starts writing; not a blocking modal.

---

---

## Final decisions summary (2026-05-28)

All open questions resolved. Decisions recorded here for traceability before implementation begins.

| # | Decision |
|---|---|
| 1 | Extend `application_answers` table (add `ai_refined_answer`, `is_budget_question`); no JSONB column on `applications` |
| 2 | Monthly cap raised from 20 → 50; per-application credit model deferred |
| 3 | Assembly writes to `applications.assembled_draft`; Step 5 export reads from that column; Word doc export for free-form funders is in S6.8 scope |
| 4 | Preparation checklist is a separate screen shown once (on first entry to Step 4) |
| 5 | `supportingDocuments` = read-only aide-memoire in Step 3; no interactive tracking |
| 6 | `funderAiPolicy` = info banner in Step 3, below summary, above "Proceed to Step 4" button |

---

*Notes prepared: 2026-05-26*
*Open questions resolved: 2026-05-28*
*Status: Implementation complete — 2026-05-29*

---

## Implementation update — 2026-05-29

### Section-by-section interface for free_form funders

The Q&A design (Stages 2–4 above) was implemented in two releases:

**Release 1 (2026-05-28):** Structured funders only. The `application_answers` table stores one row per numbered question. Step 4 shows each question as a labelled card with a textarea. Budget questions flagged in amber. AI refine button for non-budget questions. Prep checklist gate. Senior review prompt. Assembly API.

**Release 2 (2026-05-29):** Free_form funder support. The AI (Step 3 prompt) now extracts **sections** as well as questions. For free_form funders, `sections` is populated (with title, guidance text, word limit, budget flag per section); `questions` is empty. For structured funders, `questions` is populated; `sections` is empty.

#### New type: `AiSummarySection`

```typescript
export type AiSummarySection = {
  number: number
  title: string          // e.g. "About your organisation"
  guidance: string       // 2–3 sentences from funder instructions ("what to include")
  wordLimit?: number     // only if funder specifies explicitly
  is_budget_section: boolean
}

// Added to AiSummaryData:
sections?: AiSummarySection[]
```

#### Step 4 interface: free_form mode

When `funder_type === 'free_form'`, Step 4 shows:
- **Funder context bar** — teal banner identifying the funder and grant name
- **Sticky progress bar** — "X of N sections completed" — remains visible as the user scrolls through long applications
- **Section cards** — one card per extracted section, in order. Each card shows:
  - Section title (no number prefix — section titles are the natural headings)
  - Guidance text in muted type below the title (derived from funder's own instructions)
  - Textarea (8 rows, auto-saved on blur)
  - Word count (with over-limit warning if `wordLimit` is set)
  - "Help me improve this" AI refine button (disabled on budget sections)
- **Budget sections** — amber background, no AI assist, explicit warning to enter own figures

#### Step 4 interface: both modes

Both free_form and structured modes now share:
- `max-w-[960px]` wider layout (was 640px)
- Funder context bar (teal)
- Sticky progress bar (top-0, z-10, shadow)
- "sections completed" label for free_form; "questions answered" label for structured

#### Assembly format

`assembleAndAdvance` detects `funder_type` from the `ai_summary` JSON and formats accordingly:
- **free_form:** `section_title\n\nanswer_text` (no number prefix — suits narrative Word document)
- **structured:** `N. question_text\n\nanswer_text` (number prefix matches form structure)

Both formats join sections with `\n\n---\n\n` separator, unchanged.

#### Bug fix: advanceToStep4 reset

`advanceToStep4` now resets `draft_status` to `not_started` only when the current status is `in_progress`. States `ready_to_assemble` and `assembled` are preserved. Previously, any return to Step 3 followed by Continue would reset the status and re-show the prep checklist — even for applications already through the senior review stage.

---

## Document History

| Version | Date | Author | Summary of changes |
|---------|------|--------|--------------------|
| 1.0 | 2026-05-26 | Rapidglobe Ltd | Initial design notes from guidelines review session |
| 1.1 | 2026-05-28 | Rapidglobe Ltd | All open questions resolved; final decisions documented; database design confirmed |
| 1.2 | 2026-05-29 | Rapidglobe Ltd | Implementation update added: section-by-section interface for free_form funders, AiSummarySection type, assembly format, bug fix. Document history table added. |
