# Grant Pathway — Design & Decision Changelog

**Purpose:** This log records every significant change to the original design of Grant Pathway, together with the reason for each change. Use it to refresh context on why the design evolved, without having to re-read all the source documents.

**Authoritative sources:** When this log refers to a decision record, the full rationale lives in the linked file. This log summarises; the ADR or DR is the definitive record.

---

## 2026-06-05 — Document pre-processing implemented — ADR-AI-010 Phase 1

**What changed:**

- `lib/preprocess-text.ts` — new module. Pure function `preprocessText(raw, charCeiling?)` that:
  - Strips PDF artefacts: form feed characters, null bytes, CRLF normalisation
  - Removes page number lines (`1`, `Page 1 of 5`, `- 1 -`)
  - Removes repeated header/footer lines (identical short lines appearing 3+ times across the document)
  - Strips boilerplate sections by heading pattern: Contact Us, Privacy Policy, Data Protection, Accessibility, Equality & Diversity, Complaints, Freedom of Information, About Us, About the Foundation/Trust/Fund, Our History/Story, Disclaimer, Copyright, Website Terms. Each pattern is conservative and anchored — only exact section headings match, not headings that happen to contain those words.
  - Collapses 3+ consecutive blank lines to 2
  - Trims trailing whitespace per line
  - Applies a configurable character ceiling (default 20,000) as a safety net for very large multi-form PDFs; snaps to last newline within the final 10% to avoid mid-sentence cuts
  - Returns `{ text, wasTruncated, originalLength, processedLength }`
- `app/api/generate-summary/route.ts` — new step 6 inserted before the Bedrock call:
  - Calls `preprocessText(guidelinesText, charCeiling)` unless `DISABLE_TEXT_PREPROCESSING=true`
  - Ceiling configurable via `PREPROCESS_CHAR_CEILING` env var (defaults to 20,000)
  - Logs `[generate-summary] pre-processing: N → M chars` on every call
  - Logs an additional `console.warn` if truncation occurs
  - `textForPrompt` (processed) replaces `guidelinesText` in `buildSummaryPrompt()`

**Why:** NFR-01 large-document tier ceiling is 45 seconds. Garfield Weston (11-page PDF) already measures 33–37s. A projected Clothworkers 3-form PDF pack could reach 40–47s. Pre-processing reduces input tokens by 15–25% by removing content that never informs the AI summary, creating headroom before the ceiling without changing the API contract, client, or UI.

**Feature flag:** Set `DISABLE_TEXT_PREPROCESSING=true` in Vercel environment variables to disable preprocessing entirely if a quality regression is found. Set `PREPROCESS_CHAR_CEILING=<n>` to adjust the ceiling.

**Testing required before production:** Validate summary quality is unchanged (or improved) against all scheduled funder fixtures: Garfield Weston, Clothworkers, AB Charitable Trust, Idlewild, Walton, Henry Smith, Wolfson. If any funder's summary degrades, exclude the relevant boilerplate pattern and re-test.

**Full decision record:** `docs/Technical Decision and Design/ADR-AI-010-summary-performance-strategy.md`

---

## 2026-06-05 — AI summary performance strategy documented — ADR-AI-010

**What changed:**

- New ADR created: `docs/Technical Decision and Design/ADR-AI-010-summary-performance-strategy.md`
- ADR-INDEX.md updated: ADR-AI-010 added to Group 6 (AI Integration); total ADR count updated to 45
- ADR-TRACEABILITY.md updated: GAP-27 refined to reference ADR-AI-010; ADR-AI-010 consequences added

**Decision summary:**
The streaming vs document pre-processing investigation (conducted 2026-06-04 during funder testing) is formally recorded as ADR-AI-010. The decision is a hybrid, phased approach:

- **Pre-v1 (pre-launch):** Implement document pre-processing (`lib/preprocess-text.ts`) in `/api/generate-summary` to reduce input tokens by ~15–25% and build headroom before the NFR-01 large-document tier ceiling.
- **Post-v1:** Evaluate streaming responses as a quality-of-life improvement once the batch pipeline is stable.

**Why:** Real performance data from testing (LBF: 24s, Walton: 25s, Garfield Weston: 33–37s) confirmed NFR-01 is currently met. However, a projected Clothworkers multi-PDF pack could reach 40–47s — close to the 45s ceiling. Pre-processing is low-risk and additive. Streaming requires a UI redesign (replace progress bar with incremental text render) and Supabase save-on-stream complexity; it is deferred to post-v1 when it can be implemented coherently across both AI routes simultaneously.

**ADR-AI-005 status:** Unchanged — batch mode remains the v1 decision. ADR-AI-010 is an optimisation strategy within the batch architecture, not a replacement of it.

---

## 2026-06-05 — Linting and code quality infrastructure — ADR-OPS-008

**What changed (all four phases implemented):**

**Phase 1 — Scripts and Prettier:**

- `prettier` and `eslint-config-prettier` installed as dev dependencies
- `.prettierrc` created (semi: false, singleQuote: true, tabWidth: 2, trailingComma: all, printWidth: 100)
- `.prettierignore` created (ignores `.next/`, `out/`, `build/`, `node_modules/`, `public/`, `*.lock`)
- `eslint-config-prettier` added to `eslint.config.mjs` (last in config array — Prettier wins on style rules)
- `.vercel/**` added to ESLint `globalIgnores` (generated build artefacts were being linted)
- `package.json` scripts updated: `lint` now targets `.` with `--max-warnings 0`; `lint:fix`, `format`, `format:check`, `type-check` added
- ESLint downgraded from `^10` to `^9` — `eslint-config-next` bundles `eslint-plugin-react` that uses a deprecated API removed in ESLint 10 (`contextOrFilename.getFilename`). ESLint 9 is the correct version for Next.js 16
- One-time Prettier pass applied to all 226 existing files
- 14 pre-existing lint issues resolved across 4 source files (8 errors, 6 warnings): unused vars, stale `eslint-disable` comments, `react-hooks/set-state-in-effect` violations (all valid init patterns, suppressed with targeted comments), and one `react-hooks/refs` pattern suppressed (intentional "latest value" ref). All suppressions are documented inline.

**Phase 2 — Pre-commit hooks:**

- `husky` and `lint-staged` installed as dev dependencies
- `.husky/pre-commit` configured to run `npx lint-staged`
- `lint-staged` config added to `package.json`: ESLint + Prettier on `*.{ts,tsx}`; Prettier only on `*.{json,md,css}`

**Phase 3 — GitHub Actions CI:**

- `.github/workflows/ci.yml` created: runs `type-check`, `lint`, `format:check` on every push to `master` and every PR targeting `master`

**Phase 4 — TypeScript tightening:**

- `noImplicitReturns: true` and `noFallthroughCasesInSwitch: true` added to `tsconfig.json`
- Both flags passed `tsc --noEmit` cleanly with no new errors
- `noUncheckedIndexedAccess` deferred to a future session (per ADR — may surface existing issues requiring targeted fixes)

**Why this matters:** The pre-existing `lint` script (`eslint` with no path or `--max-warnings 0`) was silently doing nothing — all AI-generated code was committed without any automated check. The full stack (Prettier + Husky + CI + stricter TypeScript) means formatting inconsistencies are caught at commit time and type issues at push time, before Vercel begins its build.

**Full decision record:** `docs/Technical Decision and Design/ADR-OPS-008-linting-and-code-quality.md`

**Why this matters:** AI-assisted development dramatically increases the speed at which inconsistencies accumulate. Pre-commit hooks (Phase 2) are the most critical gap — currently all AI-generated code can be committed without any automated check.

**Full decision record:** `docs/Technical Decision and Design/ADR-OPS-008-linting-and-code-quality.md`

---

## 2026-06-04 — Step 4 stale cache fix; free-form path first test (Garfield Weston)

**What changed:**

- `actions/applications.ts` — `revalidatePath()` added before `redirect()` to step/4 in all three locations (`advanceToStep4`, `setDraftInProgress`, `reopenApplication`). Without this, Next.js App Router could serve a stale cached version of Step 4 after a Server Action redirect, causing the "No specific questions found" fallback to appear even though sections were correctly stored in the database.
- `components/application-step4-draft.tsx` — Budget section warning wording updated: "AI cannot generate these for you" → "AI cannot assist you with this". Applies to both free_form sections and structured questions.

**Why:**
Garfield Weston Foundation testing (2026-06-04) — first test of the free-form/narrative path. Step 4 showed the manual entry fallback immediately after the prep checklist. Database inspection confirmed all 11 sections were correctly stored; the issue was Next.js serving cached HTML after the Server Action redirect. `revalidatePath()` is the standard Next.js fix. Budget wording change was a user UX improvement identified during the same test session — "AI cannot assist you" is more accurate than "AI cannot generate these" because the distinction is about assistance, not just generation.

---

## 2026-06-04 — LBF defects D-LBF-01 to D-LBF-05 fixed; Foyle Foundation removed

**What changed:**

- `components/application-step4-draft.tsx`:
  - **D-LBF-01/03:** `isOptionalQ()` helper added. Detects optional questions matching either `"(optional)"` (existing pattern) or `"this question is optional..."` (Lloyds Bank Foundation Q10 pattern). Used in both the `allApproved` assembly gate and the approve section visibility condition. Fixes D-WF-01 regression where Lloyds Q10 (phrased as optional in the question text) was blocking the assembly gate.
  - **D-LBF-02:** Over-limit hard stop. `!isOver` added to the approve section condition — the "Approve this answer" panel is now hidden entirely when the answer exceeds the word/character limit. Over-limit message updated to "Please trim it or use AI to bring it within the limit before approving." This replaces the previous "warn but allow" behaviour.
- `components/application-step5-approve.tsx`:
  - **D-LBF-04:** `formatExportDate()` updated to include HH:MM time so re-export warning dialog shows full timestamp (e.g. "4 June 2026, 09:57") matching the format in the exported document.
  - **D-LBF-05:** `isDownloading` split into `isDownloadingDocx` and `isDownloadingTxt`. Each download button now shows its own loading state independently. Previously a shared state caused both buttons to show "Downloading…" when only one was active.
- `docs/target-funder-list.md` — Foyle Foundation struck through and annotated as permanently closed December 2025.
- `docs/Test Plans/TEST-DASHBOARD.md` — Foyle Foundation marked ❌; Nationwide, Motability Foundation, and City Bridge Foundation marked ⏸️ (offline/closed); Garfield Weston flagged as next active funder.

**Why:**
All five defects surfaced during Lloyds Bank Foundation testing (2026-06-04). D-LBF-02 (over-limit hard stop) was a deliberate product decision: grant portal systems uniformly reject over-limit answers, so allowing approval would give false confidence. D-LBF-01/03 shared a root cause — the optional detection relied on "(optional)" in parentheses, missing the Lloyds-style "This question is optional..." phrasing. D-LBF-04 and D-LBF-05 were minor polish items improving timestamp accuracy and loading state UX.

Foyle Foundation removed after research confirmed the foundation permanently closed its grant programme December 2025 — no new applications being accepted. Three other funders (Nationwide, Motability, City Bridge) parked as all currently offline or between rounds.

---

## 2026-06-04 — NFR-01 summarisation target revised; AGENTS.md NFR reference added

**What changed:**

- `docs/non-functional-requirements.md` — NFR-01 AI guideline summarisation target split into two tiers based on funder testing evidence: standard documents (up to ~8 pages) ≤30 seconds; large documents (over 8 pages) ≤45 seconds. Performance evidence from six funder test cycles added as a table. Pre-launch recommendation added for Clothworkers-style multi-form PDFs (40–47s) which approach the upper limit.
- `AGENTS.md` — `docs/non-functional-requirements.md` added to the documentation table so future sessions know to update it when performance targets change.
- Affected test plans updated to reference the correct NFR-01 tier (Clothworkers, LBF, Garfield Weston).

**Why:**
Garfield Weston Foundation testing (2026-06-04) produced summary times of 33–37 seconds on the 11-page guidelines PDF. The original single 30-second target was set before any real-funder testing. Six test cycles have now produced a range of measurements (24s–47s) that shows clearly that document size is the primary driver. A two-tier target (30s standard / 45s large) is both more accurate and more actionable: it confirms that simple structured PDFs are comfortably within target while flagging that very large multi-form PDFs need attention before go-live. The pre-launch recommendation to investigate streaming or document pre-processing ensures the issue is not lost.

---

## 2026-06-03 — Three testing defects fixed; Lloyds funder corrected; Lloyds test plan created

**What changed:**

- `components/application-step4-draft.tsx` — D-WF-01 fix: optional sections (question text contains "(optional)") now show the "Approve this answer" button even when the textarea is empty; `allApproved` gate updated to exclude unanswered optional sections from the required count.
- `components/application-step5-approve.tsx` — D-WF-04 fix: `handleDownloadClick` now checks `lastExported` (DB-sourced prior export history) rather than `isExported` (current session state) to trigger the re-export warning dialog. The warning now correctly appears after a re-open → re-approve → download cycle.
- `app/api/export/[applicationId]/route.ts` — D-WF-05 fix: `formatDate` updated to include HH:MM in Europe/London timezone (e.g. "03 June 2026, 17:35"). Allows users to distinguish between multiple exports on the same day.
- `supabase/migrations/20260603000000_update_lloyds_funder_to_england_wales.sql` — New migration replacing "Lloyds Bank Foundation CI" (Channel Islands) with "Lloyds Bank Foundation" (England & Wales) in the funder directory. ⚠️ Requires manual application to dev and prod via Supabase dashboard.
- `supabase/migrations/20260601000001_seed_funders.sql` — Seed file updated to reflect E&W foundation for future resets.
- `docs/Test Plans/Lloyds-Bank-Foundation-test-plan.md` — New test plan (v1.0, 13 cases).
- `docs/target-funder-list.md` — Lloyds CI replaced with Lloyds E&W.

**Why:**
Wolfson Foundation testing (12 tests, 2026-06-03) surfaced three defects:

- D-WF-01: Optional sections could not be approved when blank, blocking the assembly gate entirely — a UX dead-end requiring a workaround.
- D-WF-04: The re-export warning (protecting funders from receiving multiple versions) was bypassed after re-opening and re-approving an application — a meaningful safeguard gap.
- D-WF-05: Without a time component in the export date, two exports on the same day were indistinguishable in the downloaded document.

The Lloyds Bank Foundation CI was identified as unsuitable for Grant Pathway: Channel Islands-only geographic restriction, AI use discouraged, and the online form is currently offline. Replaced with the main England & Wales foundation which has a downloadable Word example form, permits AI use with conditions, and has a broad UK-wide remit appropriate for Grant Pathway's target charities.

---

## 2026-06-03 — Wolfson Foundation test plan created (Health & Disability Stage 1)

**What changed:**

- `docs/Test Plans/Wolfson-Foundation-test-plan.md` (v1.0, new) — 12-case end-to-end test plan for the Wolfson Foundation Health & Disability Stage 1 programme.

**Key test coverage decisions:**

- **Paste path tested.** Wolfson Stage 1 guidelines are published online only — there is no downloadable PDF or Word file. The test therefore exercises the Step 2 text-paste input rather than file upload. This is the first test plan to use the paste path as the primary input method.
- **New test charity: Compass Wellbeing.** A new test account (`grantpathway+wf1@gmail.com`) with a fictional South London mental health/brain injury charity is used, rather than reusing Harry's Rainbow. Compass Wellbeing is a clear fit for Wolfson's Health & Disability capital criteria, reducing mismatch risk and making the eligibility test meaningful.
- **Re-open → amend → re-approve → re-export cycle (IT-WF-11 and IT-WF-12).** This is the first test plan to explicitly cover the full re-opening flow: after a first export, the tester re-opens the application, amends one answer (Project summary), re-approves only that card, reassembles, re-approves the whole application, and re-exports. IT-WF-12 verifies the re-export warning dialog shows the correct prior export timestamp, and the downloaded document contains the amended answer.
- **Short word limit fields.** The 50-word "previous support" and 25-word "project title" fields are unusual — shorter than any question seen in previous test cycles. These are recorded as observation points: the AI may extract them as narrative cards or skip them as too short to be textareas.

**Why Wolfson Foundation next:**
Idlewild Trust Round 1 2026 (opens 8 June) is not being targeted in this cycle. Wolfson is a well-characterised structured funder with publicly listed questions and word limits, is already seeded in the funder picker, and exercises a paste-path test scenario not yet covered by any existing test plan.

---

## 2026-06-02 — AI assist allowed when answer exceeds word limit (FR-30 revised)

**What changed:**

- `components/application-step4-draft.tsx` — `isOver` removed from the disabled condition on "Help me improve this". AI assist is now available even when the answer exceeds the word limit.
- `app/api/refine-answer/route.ts` — Server-side word limit rejection removed. Belt-and-braces no longer needed since the refine prompt enforces the limit in the AI output.
- Over-limit message updated: _"Your answer exceeds the funder's word limit. In your interest, you can use AI to refine, improve the structure and bring it within the limit — or approve this answer as it stands."_

**Why:**
Idlewild and Henry Smith testing revealed an inconsistency: the over-limit message said "reduce it first" but the Approve button was still available. The two instructions contradicted each other. More importantly, the AI refine prompt already instructs the AI to stay within the word limit — so an over-limit answer is exactly the scenario where AI assist is most useful (the AI will compress to fit). Blocking it forced users to manually reduce first, which is a worse experience. The new message is advisory, not prescriptive, and honestly presents both options.

---

## 2026-06-02 — funderAiPolicy banner removed from Step 3

**What changed:**

- `components/application-step3-summary.tsx` — The blue AI policy banner (which displayed `summary.funderAiPolicy`) was removed from the Step 3 summary screen. The `funderAiPolicy` field remains in the `AiSummaryData` type and is stored in the database, but is no longer displayed.

**Why:**
Raised during Henry Smith Holiday Grants testing (IT-HSF-03). The banner added no value because:

1. Grant Pathway's Q&A model already embodies responsible AI use — the charity writes all content, AI only refines on request, mandatory review before approval, AI disclaimer in every export.
2. All approved funders are pre-screened by Rapidglobe; funders with explicit AI prohibitions are not listed.
3. Extraction quality was unreliable — some funder documents only contained a pointer to a website ("You can find AI guidance on our website"), which rendered as a confusing, unactionable banner.

---

## 2026-06-02 — GAP-28 Layer 1: three prompt extraction improvements

**What changed:**

- `lib/prompts.ts` — Three new exclusion rules added to the question extraction logic:
  1. **Conditional questions**: Questions prefaced with explicit project-type conditionals (e.g. "only required if applying for a vehicle") are excluded.
  2. **Multi-form PDFs**: When a document contains multiple application forms (e.g. Small Grants + Large Grants), only the first complete form is extracted.
  3. **Meta/feedback questions**: Questions asking for feedback about the application process (e.g. "Do you have any feedback for us?", "How long did this take?") are excluded — these are not grant application content.

**Why:**
Clothworkers and Henry Smith testing surfaced all three issues. The Clothworkers PDF contained both Small and Large Grants forms, causing duplicate questions. Henry Smith's form included "Do you have any feedback for us?" as Q9, which was appearing as a writing card. Conditional project-type questions (vehicle-only, digital infrastructure-only) were appearing for all applicants regardless of project type.

---

## 2026-06-02 — Question sync: Step 4 now syncs with regenerated AI summary

**What changed:**

- `app/(authenticated)/applications/[id]/step/4/page.tsx` — The `if (questionRows.length === 0)` guard was replaced with an always-run sync. On every Step 4 visit:
  1. Orphaned rows (question_order no longer in the current AI summary) that are unanswered are deleted.
  2. New questions from the summary are upserted.
  3. The DB is re-fetched after the upsert to get the full current set (fixing a Supabase `ignoreDuplicates: true` issue where the upsert return value was empty for existing rows).

**Why:**
Henry Smith testing (D-HSF-02): after regenerating the AI summary, returning to Step 4 showed "No specific questions were found" because the old question rows remained in the database and the upsert's `ignoreDuplicates: true` returned an empty array — overwriting `questionRows` with nothing. The sync now correctly handles regeneration mid-session without losing any answered content.

---

## 2026-06-02 — FR-47 eligibility mismatch hard stop

**What changed:**

- New `mismatch` application status added to the `application_status` enum (migration `20260602000000_add_mismatch_status.sql`).
- `lib/prompts.ts` — AI summary prompt extended with `eligibilityMismatch: boolean` and `mismatchReason: string | null` fields.
- `app/api/generate-summary/route.ts` — `AiSummaryData` type extended.
- `actions/applications.ts` — `setApplicationMismatch()` server action added.
- `components/application-step3-summary.tsx` — Mismatch display state added: red warning card, acknowledge button, redirect to dashboard.
- `components/dashboard-populated.tsx` — Red "Ineligible" badge for mismatch applications; no Continue/View button.

**Why:**
Raised during Idlewild Trust IT-04 testing. Harry's Rainbow (bereavement charity) was shown 9 application question cards for an arts-only grant — there is no purpose in a charity writing answers for a grant they clearly cannot receive. The hard stop protects funder relationships (preventing a stream of ineligible applications routed via Grant Pathway) and saves the charity from wasted effort. Full rationale: `docs/decisions/DR-EL-001-eligibility-mismatch-handling.md`.

---

## 2026-06-01 — Step 5 approval wording and export disclaimer improved

**What changed:**

- `components/application-step5-approve.tsx` — Three confirmation checkboxes updated with more professional, precise language appropriate for a formal grant application context:
  - "I have read through every answer and am satisfied with the content." → "I have reviewed all responses in full and am satisfied with their content."
  - "I confirm the information is accurate and true to the best of my knowledge." → "The information provided is accurate and complete to the best of my knowledge."
  - "I understand this application was drafted with AI assistance..." → "I understand that this application was prepared with AI assistance and accept full responsibility for all information submitted."
- `app/api/export/[applicationId]/route.ts` — Export disclaimer updated from "drafted with AI assistance" to "prepared with AI assistance" to align with the Step 5 checkbox language.

**Why:**
Identified during AB Charitable Trust testing (2026-06-01). The original wording was informal and imprecise. "Reviewed" is stronger and more appropriate than "read through". "Accurate and complete" better reflects the scope of the declaration than "accurate and true". "Prepared" is more accurate than "drafted" given the charity-authored model. Disclaimer aligned with checkbox for consistency.

---

## 2026-06-01 — Spelling correction added to AI refine-answer prompt

**What changed:**

- `lib/prompts.ts` — `buildRefinePrompt` updated: "Correct any spelling errors and grammatical mistakes." added to the refine instruction, before the constraint "You must not add any information that is not already in the answer."

**Why:**
AB Charitable Trust testing (2026-06-01) showed the AI was returning answers unchanged when they contained only spelling errors, because the original prompt mentioned "structure, flow, and clarity" but did not explicitly include spelling correction. Correcting "oppotunity" → "opportunity" is not changing a fact — it falls under clarity improvement. This is a core part of the AI assist value for non-specialist charity users.

---

## 2026-06-01 — char_limit and limit_type DB columns added; Step 4 pipeline fixed

**What changed:**

- `supabase/migrations/20260601000002_add_char_limit_and_limit_type.sql` — New migration adds `char_limit integer` and `limit_type text check (words|characters|none)` to `application_answers`. These columns were defined in `data-model.md` (BD-05) and referenced in the Step 4 page code but were never backed by a migration.
- `app/(authenticated)/applications/[id]/step/4/page.tsx` — SELECT and upsert queries updated to include `char_limit` and `limit_type`.
- `components/application-step4-draft.tsx` — `QuestionRow` type extended with `charLimit` and `limitType` fields. Counter display updated: shows "X / 800 characters" when `limitType === 'characters'` and "X / 400 words" when `limitType === 'words'`.

**Why:**
Root cause of D-IT-01 (Step 4 silently showing Tier 3 free-form fallback despite AI summary correctly extracting questions): the `upsert` in `step/4/page.tsx` referenced `char_limit` and `limit_type` columns that did not exist in the database. The upsert failed with a PostgreSQL error that was swallowed by the `try/catch` block, leaving `questionRows` empty and triggering the "no questions found" path. The missing migration was the single root cause of the Step 4 failure across both Idlewild Trust and A B Charitable Trust testing.

---

## 2026-06-01 — AI summary prompt updated for table-format PDFs and character limits

**What changed:**

- `lib/prompts.ts` — `buildSummaryPrompt` updated with two significant rule changes:
  1. **Table format recognition**: `funder_type` rule extended — documents presented as a table with columns such as "Question", "Type of question", "Character limits", "Mandatory" are now classified as `structured`. A TABLE FORMAT extraction rule added to the `questions` rule: extract only rows where the "Type of question" column indicates narrative text (Long/Medium free text); skip Yes/No, Short free text (data fields), Drop-down, Date, Number, Address, and File upload rows.
  2. **Character limit handling**: Removed the incorrect instruction to convert character limits to approximate word counts. New rule: if the limit is in characters, set `charLimit` to the value and `limitType` to `'characters'`; if in words, set `wordLimit` and `limitType` to `'words'`; if no limit, set `limitType` to `'none'`.
- `app/api/generate-summary/route.ts` — `AiSummaryQuestion` type updated: added `charLimit?: number | null` and `limitType?: 'words' | 'characters' | 'none' | null` fields.

**Why:**
Idlewild Trust testing (2026-06-01) revealed two extraction failures. (1) The Idlewild Arts question set is published as a multi-column table — the AI could not parse table structure from extracted PDF text and returned an empty questions array. The TABLE FORMAT rule gives the AI explicit instructions for this format. (2) All Idlewild narrative questions use character limits (800 or 1600 chars), but the original prompt converted these to approximate word counts (800 chars ≈ 120 words), losing precision. The fix preserves the original limit type and value so counters show "X / 800 characters" correctly.

---

## 2026-06-01 — "Help me improve this" disabled when answer exceeds word/character limit

**What changed:**

- `components/application-step4-draft.tsx` — The "Help me improve this" AI assist button is now disabled when `isOver` is true (i.e. the answer exceeds the word or character limit). An inline message — "Your answer is over the limit. Edit it down first, then use AI to improve the structure." — is shown in red beneath the button when this condition applies.

**Why:**
AB Charitable Trust testing (2026-06-01) identified a design gap: clicking "Help me improve this" when an answer was already over the limit returned the answer unchanged, because the AI cannot remove factual content. This confused testers who expected the AI to help them fit within the limit. Disabling the button with an explanatory message makes the required user action explicit and prevents a silent no-op.

---

## 2026-06-01 — FR-32/FR-33 per-question approval step added to Step 4

**What changed:**

- `components/application-step4-draft.tsx` — Per-question approval flow added. Each question card now shows three plain-language review prompts (FR-32: "Does this accurately describe your charity and project?", "Are all figures, dates, and facts correct?", "Does this answer the question that was asked?") whenever an answer is non-empty and not yet approved. An "Approve this answer" button (FR-33) saves approval to the database. Editing text or accepting an AI refinement clears approval and requires re-review. Progress bar and "Ready to assemble" gate now use approved count, not answered count. Approved cards render with a green border and confirmation stamp.
- `actions/applications.ts` — New `approveAnswer(answerId)` Server Action added; sets `is_approved = true` on the `application_answers` row with `user_id` ownership check.
- `app/(authenticated)/applications/[id]/step/4/page.tsx` — `is_approved` added to the `application_answers` DB select (existing rows and both upsert paths); mapped to new `QuestionRow.isApproved` field.

**Why:**
AB Charitable Trust testing (2026-06-01) found that FR-32 (three plain-language review prompts alongside each draft) and FR-33 (explicit per-question approval before content is saved to the assembly queue) were missing from the Mark Two charity-authored Q&A interface. These requirements were present in the original Step 4 design but were not carried forward into the 2026-05-28 redesign. The fix brings the implementation into full compliance with the Must Have acceptance criteria.

---

## 2026-06-01 — Funder directory and access control model decided (DR-FD-001)

**What changed:**

- `docs/decisions/DR-FD-001-funder-directory-model.md` — New decision record created. Hybrid curated funder directory + "Request a Funder" escape hatch adopted as the funder access control model.
- `docs/decisions/DECISIONS-INDEX.md` — DR-FD-001 added under new "Funder Directory" section; total count updated to 29; revision history entry added.
- `docs/moscow-feature-register.md` v1.4 — FR-15 revised: funder selection is now via searchable curated picker (not free-text entry); "Request a Funder" escape hatch noted.
- `docs/Implementation Plan/IMPLEMENTATION-STATUS.md` — Phase 5 build tasks added for funder directory implementation.

**Why:**
Grant Pathway's AI extraction and Q&A interface has only been validated against 12 specific funders (see `docs/Test Plans/target-funder-list.md`). Allowing users to freely enter any funder name would let untested combinations enter the system, producing degraded or misleading output with no warning. Five options were evaluated; the hybrid model (Option 5) was selected because it maintains a hard gate on untested funders while converting user frustration (unlisted funder = dead end) into a demand signal via the request form. The decision was taken to implement the near-final product model now so that all test activity — starting with Idlewild Trust (Round 1 2026, opens 8 June 2026) — reflects the real user experience rather than a temporary workaround.

**Build scope (Phase 5):**

1. `funders` Supabase table — seeded with 12 approved orgs from target funder list
2. RLS policy — authenticated users read; service role writes
3. `applications.funder_id` FK column — nullable migration-safe
4. Step 1 funder picker UI component — replaces free-text funder name input
5. "Request a Funder" link — mailto or Tally form in v1
6. Request notification to Rapidglobe

---

## 2026-05-29 — Product documents updated to reflect Mark Two BRD decisions

**What changed:**

- `docs/BRD-Grant-Pathway-v0.2.md` — Superseded notice added at top. Mark Two BRD (`BRD plus decisions Mark Two/BRD-Grant-Pathway-Mark-Two-v0.4.md`) is the authoritative reference; Mark One retained for audit only.
- `docs/vision-statement.md` — Vision updated: "preparation tool" replaces "writing companion" (BD-01); "AI-assisted writing" replaces "AI-powered drafting" to reflect the AI assists not generates principle.
- `docs/business-overview.md` — Elevator pitch and "What Grant Pathway Does" section updated: AI generates draft answers → AI assists on request; charity writes every substantive answer.
- `docs/information-architecture-and-navigation.md` v1.3 — Step 4 description updated to reflect question-level typing (BD-04): `narrative | data_entry | financial | dropdown | date | file_upload`; Tier 1/2/3 coverage model referenced.
- `docs/moscow-feature-register.md` v1.3 — FR-10/11 updated (OSCR/CCNI planned before general release); FR-12 updated (thick profile, BD-02); FR-29 extended (character limits + word limits, BD-05); FR-45 added (question-level typing, BD-04); FR-46 added (three-tier coverage model, BD-07). Summary count 39 → 41 Must Have.
- `docs/user-personas-journeys-and-use-cases.md` v1.2 — UC-04 updated to reflect thick charity profile fields (BD-02): identity, address/contact, mission/work, financial fields, supporting document status. OSCR/CCNI note added.
- `docs/data-model.md` v1.1 — `charity_profiles` table replaced with thick profile structure (BD-02): five sub-sections covering identity, address/contact, mission/work, financial fields, and supporting document status. `question_type` and `limit_type`/`word_limit`/`char_limit` fields added to `application_answers` (BD-04, BD-05). `is_budget_question` field added. AI cap corrected 20 → 50 in ai_usage_log constraints. Document history table added.
- `docs/technology-stack.md` v1.2 — TS-04 updated: Vercel function region explicitly set to London (eu-west-2 / lhr1). Stack Summary table and rationale updated.
- `docs/constraints-and-assumptions.md` — C8 updated (OSCR/CCNI planned before general release); C13 updated (Vercel function region confirmed as London); A8 revised (funder guidelines do not always yield discrete questions — three-tier coverage model added).
- `docs/future-phases.md` — FP-07 (OSCR/CCNI register lookup — planned before general release), FP-08 (full question-level typing implementation), and FP-09 (thick profile pre-fill for all funder tiers) added.
- `docs/non-functional-requirements.md` — NFR-01 updated: "AI draft answer generation" renamed to "AI answer refine (per question)" with ≤15 second target; Vercel function region note added.

**Why:**
The Mark Two BRD (`BRD-Grant-Pathway-Mark-Two-v0.4.md`) was created on 2026-05-29 following real-funder testing against the 12-funder target list. Key decisions confirmed today (BD-01 through BD-07) changed the product model in ways that were not yet reflected across the supporting documentation. This update brings all product documents into alignment with Mark Two.

---

## 2026-05-29 — Vercel function region set to London (eu-west-2 / lhr1)

**What changed:**

- Vercel project → Settings → Function Regions: London, United Kingdom (eu-west-2 / lhr1) selected and saved. Redeployment triggered.

**Why:**
AWS Bedrock is configured for `eu-west-2` (London). Vercel functions were previously executing from the default `iad1` region (Virginia, USA) — no European region had been explicitly configured. Every AI call was making a transatlantic round trip (Virginia → AWS London → Virginia), adding significant latency and contributing to timeout risk on large documents. Aligning Vercel and Bedrock in the same region reduces call latency, lowers timeout risk, and improves data residency (all processing stays in UK).

---

## 2026-05-29 — generate-summary parse_error fixed for large structured documents (D-011)

**What changed:**

- `app/api/generate-summary/route.ts` — `SUMMARY_MAX_TOKENS` raised from 2000 to 4000. Documents with large question sets (e.g. A B Charitable Trust: 33 questions across 4 labelled sections) were truncating the AI response mid-JSON, causing `JSON parse failed after retry` on both attempts and returning a 500 error.
- `lib/prompts.ts` — `buildSummaryPrompt` updated: (a) explicit JSON-only instruction added at end of user prompt ("Respond with ONLY the JSON object — no preamble, no explanation, no markdown fencing. Start your response with { and end with }."); (b) "questions" rule extended to instruct the AI to skip non-text question types (dropdowns, dates, numbers, file uploads, yes/no consent fields) — only narrative text questions should be extracted. This also partially resolves GAP-28.

**Why:**
Verified via Vercel function logs: three consecutive `[generate-summary] JSON parse failed after retry` entries (14:28, 14:29, 14:34) all for the same application. A B Charitable Trust document has 33 numbered questions but only ~5 require narrative text answers — the remaining 28 are data-entry, financial, or file upload fields. Extracting all 33 into JSON exceeded the 2000 token limit, truncating the response. Raising to 4000 and filtering to narrative-only questions eliminates both failure modes.

---

## 2026-05-29 — Dashboard AI cap display corrected from 20 to 50 (D-010)

**What changed:**

- `components/dashboard-populated.tsx` — `AI_REQUESTS_LIMIT` constant updated from `20` to `50`. The display showed "14 of 20 AI requests used this month" — the enforced cap in the API routes was correctly 50 but the constant driving the UI was never updated when the cap was raised. The under-display (20 vs 50) was misleading users into thinking they were closer to the limit than they were.

**Why:**
Discovered during testing session 2026-05-29. User dashboard showed 14 of 20. API routes (`generate-summary/route.ts`, `refine-answer/route.ts`) both use `MONTHLY_CAP = 50` correctly — only the display was wrong.

---

## 2026-05-29 — GAP-27 and GAP-28 raised: character limits and non-text questions

**What changed:**

- `docs/test-fixtures/` — Three Idlewild Trust PDFs added: `idlewild-arts-application-questions-dec2025.pdf`, `idlewild-conservation-application-questions-dec2025.pdf`, `idlewild-funding-guidelines-dec2025.pdf`. Sourced from `idlewildtrust.org.uk` ahead of Round One 2026 (opens 8 June 2026).
- `docs/test-plan-e2e-slices-4-8.md` v1.7 — GAP-27 and GAP-28 added to Known Expected Failures. Idlewild fixture note updated.
- `docs/Implementation Plan/IMPLEMENTATION-STATUS.md` — GAP-27 and GAP-28 recorded.

**GAP-27 — Character limits not supported (Medium)**
Idlewild Trust question sets use character limits (800 chars, 1600 chars), not word limits. Grant Pathway's AI prompt extracts `wordLimit` only and the `word_limit` column in `application_answers` stores word counts. Character limits will either be missed entirely or incorrectly converted to word counts by the AI. Affects all funders whose published guidelines specify character limits rather than word limits. Fix: extend `AiSummaryData.questions` and `AiSummarySection` to carry a `limitType: 'words' | 'characters'` field; update the AI prompt to extract limit type; update the word count display in Step 4 to show "X / 800 characters" or "X / 200 words" as appropriate.

**GAP-28 — Non-text questions extracted as text (Medium)**
Idlewild Trust question sets include non-text question types: Yes/No (consent, ownership), dropdown (region, org status), date fields (start/end dates), number fields (grant amount), budget tables (cost breakdown, income raised, pending), and file uploads (accounts, safeguarding policy, photos). The AI has no way to distinguish question type from a PDF reference document and will extract all questions as text fields, showing them as textareas in Step 4. Budget table questions will be flagged as `is_budget_question` but will still appear as textareas rather than being excluded. Fix: extend the AI prompt to extract `questionType` for each question; filter non-text types (Yes/No, dropdown, date, number, table, file) from the Step 4 Q&A interface or display them as read-only aide-memoire items.

**Why:**
Discovered during pre-test review of Idlewild Arts and Conservation question set PDFs (2026-05-29). These gaps affect all structured funders that use portal-based forms with character limits and mixed question types. They do not affect the current passing test fixtures (TNL, Heritage Fund, Garfield Weston) which are narrative/free-form or simpler structured formats.

---

## 2026-05-29 — refine-answer: parse_error fix and stale rate-limit comment corrected

**What changed:**

- `lib/prompts.ts` — `buildRefinePrompt` strengthened: added explicit instruction to respond with JSON only (no preamble, no explanation, no markdown fencing); added fallback instruction to return the answer unchanged if too short to meaningfully improve. Fixes `parse_error` returned when the AI received a very short answer and returned a conversational response instead of JSON.
- `lib/rate-limit.ts` — Stale comment updated: "20 req/month" → "50 req/month" to match the current cap in `refine-answer/route.ts` and `generate-summary/route.ts`.

**Why:**
During free_form testing (Garfield Weston), clicking "Help me improve this" on sections with 1–2 word answers returned `parse_error` (D-008). The AI was responding with a natural language explanation rather than the required JSON object. The `rate_limited` error (D-009) on rapid successive clicks is expected production behaviour (5 req/60s burst limit) — no code change needed, but the stale comment was corrected.

---

## 2026-05-29 — Step 4: sticky progress bar fixed; Back link added to funder context bar; typo fixed

**What changed:**

- `components/application-step4-draft.tsx` — Sticky progress bar changed from `top-0` to `top-16` to offset correctly below the authenticated nav header (`h-16`, `sticky top-0 z-[100]`). Previously the bar was sticking behind the nav and not visible. Back link added to the funder context bar (top-right, white text) so users can navigate to Step 3 without scrolling to the bottom of long applications.
- `components/application-step3-summary.tsx` — Typo fixed: "sectionsto complete" → "sections to complete". Caused by JSX whitespace stripping the newline between `section` and `{"s"}`. Replaced with a template literal to guarantee correct spacing.

**Why:**
The sticky progress bar was requested and implemented in yesterday's session but was not visible in the deployed service because the `top-0` offset placed it directly behind the sticky nav. The Back button was only at the bottom of the page — inaccessible without scrolling through all sections on a long free_form application.

---

## 2026-05-29 — Test plan updated to v1.4

**What changed:**

- `docs/test-plan-e2e-slices-4-8.md` — Version 1.3 → 1.4. Four areas updated:
  1. **Test Fixtures** — pointer added to `docs/target-funder-list.md`; all 12 consolidated funders listed; missing fixture files identified per funder.
  2. **S5-P-02** — rewritten to reflect Step 3 two-column card layout redesign; S5-P-02b added (free_form funder summary — "Application sections" card, "X sections to complete" note).
  3. **S6-P-03b** — new test covering `advanceToStep4` bug fix: confirms `ready_to_assemble`/`assembled` states are not reset to `not_started` when user returns via Step 3.
  4. **NF-02** — rewritten: old auto-generation response time test removed (model no longer exists); replaced with refine-answer API response time test (≤15 seconds target).
- Summary table: total 114 → 116.

**Why:** Test plan had not been updated to reflect the Step 3 layout redesign, the advanceToStep4 bug fix, or the removal of the Step 4 auto-generation model. NF-02 was actively misleading — it described a test that could no longer pass because the behaviour it tested had been removed.

---

## 2026-05-29 — Consolidated target funder list documented; AGENTS.md audit trail rule strengthened

**What changed:**

- `docs/target-funder-list.md` — **New file.** Canonical consolidated list of 12 target grant-giving organisations (10 structured, 2 narrative) used to design and test Grant Pathway's Step 4 Q&A model and Step 5 assembly/export. Supersedes the 3-funder test fixture table that had been the only documented reference. Includes funder name, type, grant range, rationale for inclusion, and guidelines/apply URL.
- `docs/Implementation Plan/STEP4-REDESIGN-PROPOSAL.md` — Note added to the 3-funder test fixture table marking it as superseded and pointing to `docs/target-funder-list.md`.
- `docs/Implementation Plan/CHANGELOG.md` (this file) — Superseded note added to the earlier partial funder list entry (2026-05-27).
- `AGENTS.md` — Documentation rule (`implementation-docs-rules` section) substantially strengthened. Now explicitly requires: (a) all changes documented without exception, (b) product-level decisions (funder lists, research findings, scope) documented in `docs/` not just code comments, (c) agent must ask the user before proceeding if it is unclear where something should be documented. Motivated by the gap discovered this session.

**Why:**
The consolidated funder list was researched in a prior working session and used as the basis for the Step 4 redesign, but was never written to any file. It existed only in session context. This created an audit gap: the canonical list underpinning a fundamental product decision was not recoverable from the repository. This entry closes that gap and adds an explicit rule to AGENTS.md to prevent recurrence.

---

## 2026-05-29 — Step 4: section-by-section mode for narrative funders; advanceToStep4 bug fix

**What changed:**

- `app/api/generate-summary/route.ts` — New `AiSummarySection` type (`{ number, title, guidance, wordLimit?, is_budget_section }`); `sections?: AiSummarySection[]` field added to `AiSummaryData`; `questionsFound` response now returns `true` for free_form funders with sections; `SUMMARY_MAX_TOKENS` raised from 1500 → 2000 to accommodate sections guidance text.
- `lib/prompts.ts` — `buildSummaryPrompt` updated: `sections` array added to the JSON schema (populated for free_form funders only, with title + 2–3 sentence guidance + word limit + budget flag per section); `questions` array restricted to structured funders only (the two fields are mutually exclusive). Rule added: number sections sequentially starting at 1.
- `components/application-step3-summary.tsx` — "Application sections" card added for free_form funders, replacing "Application questions" card. `questionsFound` state init handles both cases. Green confirmation note reads "X sections to complete" for free_form, "X questions found" for structured.
- `app/(authenticated)/applications/[id]/step/4/page.tsx` — `funderName` and `grantName` destructured from `getApplicationOrRedirect`. Free_form path populates `application_answers` from `parsedSummary.sections` (section title → `question_text`, wordLimit, is_budget_section). Guidance map built from sections keyed by `question_order`. `guidance` passed per row to component.
- `components/application-step4-draft.tsx` — **Complete rebuild.** Wider layout (`max-w-[960px]`). Teal funder context bar showing funder name and grant name. Sticky progress bar (`sticky top-0 z-10`) showing "X of N sections/questions completed". Free_form mode: section title as header (no number prefix), guidance text shown below title, budget section warning copy updated. Structured mode: numbered Q&A with `q.questionOrder. q.questionText` header. Both modes share: word count, AI refine button, auto-save, 60-second sweep.
- `actions/applications.ts` — `assembleAndAdvance` updated: detects `funder_type` from `ai_summary` JSON; free_form format is `section_title\n\nanswer` (no number prefix, narrative flow); structured format is `N. question\n\nanswer` (unchanged).
- **Bug fix** (same release): `advanceToStep4` in `actions/applications.ts` reset `draft_status` to `not_started` whenever the user navigated forward from Step 3. Previously, if a user had started writing (`draft_status = in_progress`) and then returned to Step 3, clicking Continue again would skip the prep checklist gate. Fix: reset only when `draft_status = 'in_progress'`; states `ready_to_assemble` and `assembled` are preserved.

**Why:**
The 2026-05-28 Q&A redesign established a two-path model: structured funders (numbered questions → Q&A) vs free_form funders (narrative sections → open textarea). Only the structured path was implemented. This release completes the model:

For free_form funders (e.g. Garfield Weston), the AI now extracts the narrative sections from the guidelines (section title + guidance for the applicant), stores them as `application_answers` rows, and presents them as a section-by-section writing interface. Each section shows a guidance note derived from the funder's own instructions ("what to include in this section"). This matches how narrative funders expect content to be structured — not a list of Q&A pairs but a flowing document with discrete sections. The assembled draft format is `Title\n\nContent` (no number prefixes), suitable for flowing into a Word document at Step 5.

The sticky progress bar and funder context bar were specifically requested during mockup review and are present in both modes — they improve usability significantly on longer applications.

**Architectural consequences:**

- `AiSummaryData.sections[]` is optional (backwards compatible with existing saved summaries that lack this field)
- `application_answers` stores section titles as `question_text` — no DB schema change required
- Guidance text is re-derived from `ai_summary.sections[i].guidance` on each Step 4 page load, matched by `question_order` — not stored in DB (avoids duplication)
- `assembleAndAdvance` is now funder-type-aware — single source of truth for format

---

## 2026-05-29 — Step 3 summary redesigned: two-column card layout, highlighted section headings, supporting documents removed

**What changed:**

- `components/application-step3-summary.tsx`:
  - Single summary card replaced with individual cards in a responsive two-column grid (`md:grid-cols-2`)
  - Max-width widened: `max-w-[640px]` → `max-w-[960px]`
  - "About this grant" spans full width; "Grant amount" and "Who can apply" sit side-by-side; "Grant amount" auto-expands to full width if "Who can apply" is absent
  - Section headings highlighted: `CardTitle` sub-component adds a teal left border (`border-l-4 border-[#0D6E6E]`) to each card heading
  - "Documents you will need to submit" card removed from this step — supporting document requirements are noted in funder guidelines and do not need a separate card in the Step 3 summary
  - Button text changed: "This looks right — continue" → "Continue"

**Why:**
During testing, the single-card summary was described as "too busy" and hard to scan. Breaking information into separate cards reduces visual density and makes it easier to locate specific information (e.g. "How much can I apply for?" is now an immediately visible card, not a paragraph buried in a wall of text). The wider two-column layout makes better use of modern screen widths. The section heading highlights add visual anchoring without colour-coding the content itself. Supporting documents were removed because they add friction at the review step — the user has already read the guidelines and doesn't need a re-list of documents at this point.

---

## 2026-05-29 — Strategic pivot: Grant Pathway targets a curated set of UK funders with published guidelines

**What changed:**

- Product positioning: Grant Pathway is now explicitly designed for UK grant funders that publish accessible, downloadable application guidelines (structured Q&A or narrative). Funders that use online portals without downloadable guidelines, or that require a quiz to identify fund type, are out of scope for v1.
- Research conducted: ~12 target funders identified across structured (form-based) and free_form (narrative) categories with accessible guidelines and appropriate grant ranges for small/mid-size charities.
- No code changes in this release — this is a product scope decision. Future onboarding copy and help text will reference this scope.

**Target funder profile (v1):**

- Published downloadable guidelines (PDF or Word) or accessible online guidelines
- Applications reviewed on merit (not exclusively online portal input)
- Grant ranges broadly £5,000–£200,000
- No absolute AI prohibition in guidelines (a small number of funders explicitly ban AI tools — these are noted but outside scope)

**Example funders in scope (non-exhaustive):**

- Structured: A B Charitable Trust, Foyle Foundation (Main Grants), Walton Charity, Nationwide Building Society Community Grants, Garfield Weston Foundation (small grants), Bletchley & Fenny Stratford Town Council
- Free_form / narrative: Garfield Weston Foundation (larger grants), City Bridge Foundation

> **Superseded (2026-05-29):** The above example funder lists were a working approximation. The canonical consolidated target funder list (12 funders) is now documented in [`docs/target-funder-list.md`](../target-funder-list.md). All future funder references should use that document.

**Why:**
Grant funding authorities vary enormously in their application processes: some require a quiz to route applicants, some use locked online portals, some generate forms per-applicant, and some require multi-stage expressions of interest. There is no generalised API or extraction route that works across all types. By targeting funders with published, accessible guidelines, Grant Pathway can reliably extract structured data (questions, sections, word limits, eligibility criteria) and produce correctly formatted output. This constraint removes a category of support failure and makes the product significantly easier to test, demo, and explain to prospective users.

---

## 2026-05-28 — Step 4 redesign: auto-generation replaced with Q&A interview model

**What changed:**

- `docs/Implementation Plan/STEP4-REDESIGN-PROPOSAL.md` — all open questions resolved; final decisions documented; database design updated from JSONB column to table extension.
- `docs/Implementation Plan/IMPLEMENTATION-PLAN.md` — Slice 6 (Step 4) replaced in its entirety. Old 4 tasks (generate draft on load, editable textareas, regenerate all) removed. New 8 tasks (S6.1–S6.8) cover: extending the Step 3 prompt, Step 3 UI additions, database migration, preparation checklist, Q&A interface, per-question refine-answer API, senior review + assembly API, and Step 5 export update. Monthly AI cap updated from 20 to 50 throughout.
- `docs/PRD inputs/acceptance-criteria.md` — Section 9.6 rewritten. FR-28 (auto-generation on load) replaced with preparation checklist + user-authored answers. FR-29 (user-specified word limits) updated to auto-extracted word limits. FR-30 (AI draft inputs) updated to per-question assist + assembly. FR-31 (AI draft word limit warning) replaced with budget question flagging. FR-31A added (senior review prompt + funder-type-aware assembly). FR-34 (editable AI text) updated to user writes from scratch. FR-35 (discard/regenerate) updated to reflect that writing from scratch is the default.
- `docs/Implementation Plan/IMPLEMENTATION-STATUS.md` — Summary table updated: Phase 4 grows from 36 to 40 tasks; 4 old S6 tasks removed from "done" count; 8 new tasks added as "not started". Phase 4→5 gate remains open pending S6 redesign completion.

**Why:**
Review of three real funder guidelines documents (Heritage Fund, Garfield Weston, Stony Stratford Town Council) and explicit AI policy statements from two major UK funders (Henry Smith Foundation, National Lottery Community Fund) established a clear finding: AI-generated draft answers actively disadvantage charities.

Both reviewed funders stated explicitly:

- Henry Smith: _"Your application should reflect your voice and experience"_ / _"Applications written in your own words give a much better insight into your work"_
- NLCF: _"AI supported applications do not tell the unique story of your community"_ / _"Being too generic in content may disadvantage your application"_

Funders score for specificity, community insight, and authentic voice — none of which appear in AI-generated boilerplate. The original design would have produced applications that are identifiable as AI-generated and weaker than manually written alternatives.

The new model aligns with Henry Smith's explicit guidance: "AI for structure not content." Grant Pathway uses AI to identify the right questions, assist with clarity and structure on request, and assemble the charity's own words into the required format. The charity writes the content.

**Architectural consequences:**

- `/api/generate-draft` route removed
- `application_answers` table: two new columns (`ai_refined_answer`, `is_budget_question`)
- `applications` table: two new columns (`assembled_draft`, `draft_status`)
- New API route: `POST /api/refine-answer` (structure/clarity only; AI assist disabled on budget questions)
- New API route: `POST /api/assemble-draft` (funder-type-aware; writes to `assembled_draft`)
- Step 5 export reads from `assembled_draft` (not assembled from individual answer rows)
- `funder_type: 'structured' | 'free_form'` extracted in Step 3; drives assembly format
- Monthly AI cap: 20 → 50; approaching-limit threshold: 16 → 40

**Full design record:** `docs/Implementation Plan/STEP4-REDESIGN-PROPOSAL.md`

---

## 2026-05-28 — Test fixture updated: TNL replaced with Stony Stratford Town Council

**What changed:**

- `docs/test-fixtures/tnl-community-fund-application-form-2025.docx` retired as a test fixture (it was a public appointment form, not a grant application — never a valid fixture).
- Replaced with two Stony Stratford Town Council documents: `Stony-Stratford-Town-Council-Grant-Scheme-2026-27-adopted-FC0226.docx` (scheme guidelines) and `Stony Stratford Grant-Application-Form-2026.docx` (application form).
- `docs/Implementation Plan/STEP4-REDESIGN-PROPOSAL.md` updated: fixture table corrected; design implications expanded to include Stony Stratford findings (supporting documents, budget table, countersignature requirement, third output format type); open question 1 marked resolved.

**Why:**
The TNL document was identified in the 2026-05-26 design review as a public appointment form for a board role at TNL Community Fund Wales — not a grant application. It provided no useful design signal. The Stony Stratford fixture is a genuine small local council grant (typical £100–£1,000) with discrete numbered questions, a budget table, a seven-category supporting documents checklist, and a mandatory treasurer countersignature. It adds a third distinct funder format to the test set and validates several design decisions in the Step 4 redesign proposal (budget question handling, supporting documents display, senior review prompt).

**Test fixture set now covers three distinct formats:**

- Heritage Fund: structured online portal, discrete questions + word limits, 11 supporting document categories
- Garfield Weston: free-form 10-page narrative, no discrete questions, financial tables required
- Stony Stratford: downloadable Word form submitted by email, 13 discrete questions, budget table, 7 supporting document categories, treasurer countersignature required

---

## 2026-05-26 — S1 testing: profile edit redirects to dashboard; beta feedback noted

**What changed:**

- `components/charity-profile-form.tsx` — After saving an edited charity profile, the page previously stayed on `/profile` and showed an inline "Your changes have been saved." banner. Changed to redirect to `/dashboard` instead.

**Why:**
During S1-P-04 testing, WJ found the stay-on-page behaviour felt like a dead end — after updating the profile the natural next step is to get on with an application. The original spec (IMPLEMENTATION-PLAN.md line 970) was: _"Subsequent saves: 'Your changes have been saved.' (stays on `/profile`)"_. The rationale was that an editor might want to review or further adjust their changes. In practice this feels less reassuring than being taken forward.

**Beta feedback needed:**
⚠️ **Collect user opinion on this during beta testing.** Ask users: "After saving changes to your charity profile, would you prefer to stay on the profile page or be taken to the dashboard?" The current behaviour (redirect to dashboard) matches new-user onboarding flow. If beta users frequently return straight to `/profile` after being redirected, reverting to stay-on-page with a success banner may be preferable.

---

## 2026-05-26 — S0 testing: four auth bugs fixed; Vercel infrastructure resolved

**What changed:**

**Bug fixes (found during S0-P-01 → S0-P-07 test run):**

- `components/nav-authenticated.tsx` — Sign out button had no `onClick` handler; clicking it did nothing. Fixed by wiring `onClick` directly on `DropdownMenuItem` and using `window.location.href = "/"` for a hard redirect (client-side `router.push` left stale auth cache). **(D-001)**
- `app/auth/callback/route.ts` + `actions/auth.ts` — Password reset email link landed on "Email verified" instead of "Choose a new password". Root cause: `resetPasswordForEmail` uses the PKCE code flow, so the callback received `?code=xxx` (not `?token_hash=xxx&type=recovery`) and the `code` branch always routed to `verify-email?state=verified`. Fixed by appending `?next=reset` to the `redirectTo` URL so the callback can distinguish recovery from email verification and redirect to `forgot-password?state=reset` instead. **(D-002)**
- `actions/auth.ts` + `components/reset-password-form.tsx` — Entering the same password during a reset showed the generic "Something went wrong" error. Fixed by detecting Supabase's `same_password` error code and returning a specific status that renders "Your new password must be different from your current password." **(D-003)**
- `actions/auth.ts` — After a successful password reset, clicking "Sign in" redirected to `/dashboard` because the recovery session was still active. Fixed by calling `supabase.auth.signOut()` immediately after `updateUser` succeeds, so the session is clean before the user reaches the sign-in page. **(D-004)**
- `docs/test-plan-e2e-slices-4-8.md` — Defect log updated with D-001 to D-004; sign-out reminder added at end of S0-P-02.

**Infrastructure fixes:**

- `vercel.json` — `cleanup-guidelines` cron schedule changed from `*/30 * * * *` (every 30 min) to `0 2 * * *` (daily 02:00 UTC). Vercel Hobby plan rejects sub-daily cron expressions and was silently canceling every deployment. **Revert to `*/30 * * * *` when upgrading to Vercel Pro (P5.4).**
- Vercel GitHub App webhook reconnected — auto-deploy from `master` had stopped working (no webhook installed on GitHub repo). Reconnecting the integration in Vercel Project Settings → Git restored auto-deploy.

**Decision recorded:**

- Vercel Pro upgrade approved — Hobby plan blockers (sub-daily cron rejected, 2-cron cap, unreliable webhook) caused significant testing overhead. Upgrade to Pro (~£16/month) will be actioned as part of P5.4. Total fixed costs remain within C1 budget (~£36/month of £100/month).

**Why:**
First full test run of Slice 0 (authentication) uncovered four bugs in the auth flow, all fixed on the same day. The most significant was D-002 (password reset routing) which required understanding the interaction between Supabase's PKCE code flow and the app's auth callback route. Infrastructure issues (Vercel Hobby cron restriction and missing webhook) caused unexpected deployment friction; both are resolved and documented.

---

## 2026-05-26 — ADR-DATA-005: Backup strategy decided; documentation updated

**What changed:**

- `docs/Technical Decision and Design/ADR-DATA-005-backup-strategy.md` (new) — Supabase Pro daily backup strategy decided. Decision: upgrade production Supabase project to Pro tier before go-live. Provides daily automated backups with 7-day retention, UK-hosted (eu-west-2). Zero implementation effort. Cost: ~£20/month.
- `docs/Technical Decision and Design/ADR-INDEX.md` — ADR-DATA-005 added to Group 4 (Data); total ADRs: 43 → 44; "Last updated" date updated.
- `docs/Technical Decision and Design/technical-design.md` (v1.0 → v1.1) — §3 operating costs table updated: Supabase line changed from "Free tier (initially)" to "Pro (~£20/month)"; total fixed costs updated from ~£16/month to ~£36/month.
- `docs/legal/privacy-policy.md` (v1.1, new folder) — Three corrections from v1.0: (1) Section 5 provider table updated — Anthropic/US replaced with Amazon Web Services Bedrock/UK; Sentry corrected from "United States" to "European Union". (2) Section 5 AI processing note rewritten to accurately describe Bedrock eu-west-2 routing. (3) Section 6 international transfers updated — AI processing no longer a US transfer. (4) Section 7 updated to disclose 7-day automated backup retention window that applies after account deletion (GDPR Article 17 requirement).
- `docs/legal/terms-of-service.md` (v1.1, new folder) — Section 5 updated to reference Amazon Bedrock as the AI processing layer. Section 9 updated to acknowledge operational backup infrastructure exists as an internal safeguard, with an explicit statement that this does not constitute a guarantee of data recovery.
- `docs/overview/business-overview.md` (v1.1, new folder) — "Data, Privacy, and Trust" section updated to: (1) correct AI data residency statement (Bedrock UK/EEA, not Anthropic US); (2) acknowledge operational daily backup infrastructure for disaster recovery; (3) clarify that deletions remain immediate and permanent from the user's perspective, with backup copies purged within 7 days.
- `docs/Implementation Plan/ADR-TRACEABILITY.md` — ADR-DATA-005 consequences added to the Data section.
- `docs/Implementation Plan/IMPLEMENTATION-PLAN.md` — P5.4 pre-launch checklist updated: "Activate Supabase Pro plan and confirm automated backup is active" added.
- `docs/Implementation Plan/IMPLEMENTATION-STATUS.md` — Notes entry added for ADR-DATA-005 decision.
- Legal and overview documents moved from `docs/` root to `docs/legal/` and `docs/overview/` subfolders for better long-term version management.

**Why:**
The absence of any backup mechanism represented a reputational risk: a migration error, compromised credentials, or provider incident affecting multiple charities simultaneously would be permanently unrecoverable. Supabase Pro's daily automated backups (7-day retention, London region) address this risk with zero implementation effort and within the C1 budget constraint. Three pre-existing inaccuracies in the privacy policy were corrected at the same time: the Anthropic/US AI provider reference (superseded by the 2026-05-07 Bedrock migration, DR-DP-002), the Sentry region (EU, not US), and the backup retention window (a GDPR Article 17 disclosure obligation introduced by ADR-DATA-005).

---

## 2026-05-22 — Phase 4→5 gate check

**What changed:**

- `ADR-TRACEABILITY.md` — full Phase 4 exit sweep completed; three previously resolved gaps marked; six new gaps added; Phase 4→5 gate row filled.
- `IMPLEMENTATION-STATUS.md` — Phase 4→5 gate row added to summary table; notes entry added.

**Resolved gaps (confirmed in Phase 4 implementation):**

- **GAP-07** (ADR-EXPORT-002): Null `answer_text` handled — export route uses `'[No answer provided]'` fallback in both docx and txt formats (S7.2).
- **GAP-13** (ADR-OPS-004): Cron routes confirmed excluded from rate limiter — cleanup-guidelines (S4.4), inactivity-warning + inactivity-deletion (S8.3) have no rate-limiter imports; auth is CRON_SECRET only.
- **GAP-19** (ADR-DATA-002): Re-upload advisory implemented — blue info banner shown in Step 2 component when `currentStep >= 3` and no sessionStorage entry for guidelines (S4.3).

**New gaps identified (GAP-21 to GAP-26):**

- **GAP-21** (ADR-OPS-005 — Low): Sentry `withScope` + route tag not implemented in `generate-summary` or `generate-draft` routes. `technical-design.md` §14 specifies `scope.setTag('route', 'generate-summary')` for AI route error filtering. Sentry auto-captures global exceptions but tagged filtering is missing. Resolution deferred to P5.3.
- **GAP-22** (ADR-SEC-003 — Low): Session timeout `SessionTimeoutProvider` calls `router.push("/")` with no `?timeout=true` query param. `technical-design.md` §5 specifies sign-in page should show "You've been signed out due to inactivity." message. `sign-in-form.tsx` has no timeout param handler. Resolution deferred to P5.3 or S0.5 patch.
- **GAP-23** (ADR-ARCH-002 — Medium): Zero `loading.tsx` files exist in `app/`. ADR-ARCH-002 + `technical-design.md` §8 specify "Loading states handled via Next.js `loading.tsx` / skeleton components." `page-skeleton.tsx` exists (P1.15) but is not wired as Suspense boundaries. Resolution deferred to P5.3 per authenticated route.
- **GAP-24** (PDR-DH-003 — Low): Export disclaimer wording differs from spec. PDR-DH-003 specifies: _"Please review carefully before submitting to the funder."_ Implementation uses: _"All content has been checked for accuracy before submission."_ — different meaning and liability implication. Resolution: patch S7.2 export route.
- **GAP-25** (ADR-ARCH-003 — Medium): Zod validation absent from `actions/applications.ts` and `actions/auth.ts`. ADR-ARCH-003 requires Zod on all Server Actions. Only `actions/charity.ts` imports Zod. The other two actions use manual `if (!user) redirect('/')` guards only. Resolution deferred to P5.3 sweep.
- **GAP-26** (PDR-UI-004 — High): `app/(authenticated)/applications/[id]/page.tsx` is a stub rendering "redirects to current step (stub)". Technical design and PDR-UI-004 specify it should redirect to `/applications/[id]/step/[current_step]`. A direct link to `/applications/[id]` lands on a broken page. **Must be fixed before P5.5 final testing.**

---

## 2026-05-22 — Slice 8: Account Management wired up (Phase 4 complete)

**What changed:**

- `actions/auth.ts` — `changePassword(currentPassword, newPassword)` Server Action added (S8.1). Verifies the current password by calling `signInWithPassword` before `updateUser({ password })` — Supabase has no dedicated "verify before change" API so re-authentication is the correct approach.
- `components/account-settings-form.tsx` — static password-change simulation replaced with real SA call via `useTransition`; `wrong_password` surfaces as inline field error; server error banner added; button shows "Updating…" while pending.
- `lib/emails/send.ts` (new) — `sendEmail()` wraps the Resend REST API using `fetch` (no extra dependency). Skips gracefully with a console error if `RESEND_API_KEY` is not set.
- `lib/emails/account-deleted-user.ts` / `inactivity-warning.ts` / `account-deleted-inactivity.ts` (new) — Email 2 (user-initiated deletion), Email 3 (inactivity warning), Email 4 (inactivity deletion). All are inline HTML functions, consistent with the P3.8 design decision that Resend template variables aren't supported.
- `app/api/account/delete/route.ts` (new, S8.2) — POST route using service role client. Cascade order: application_answers → applications → charity_profiles → ai_usage_log → user_profiles → `auth.admin.deleteUser`. Sends Email 2 after deletion; email failure is logged but does not block the response.
- `components/delete-account-form.tsx` — rewritten; calls `/api/account/delete`; on success calls `signOut()` SA then redirects to `/?deleted=true`.
- `app/(public)/page.tsx` + `components/sign-in-form.tsx` — `?deleted=true` query param now shows a green "Your account has been deleted" banner on the sign-in page.
- `app/api/cron/inactivity-warning/route.ts` (new, S8.3) — daily 08:00 UTC; pages through `auth.admin.listUsers()`; sends Email 3 to accounts in the 23-month inactivity window.
- `app/api/cron/inactivity-deletion/route.ts` (new, S8.3) — daily 09:00 UTC; cascade-deletes accounts ≥24 months inactive (same order as user-initiated deletion); sends Email 4 per deletion; logs user ID to console (not email — PII).
- `vercel.json` — `inactivity-warning` (`0 8 * * *`) and `inactivity-deletion` (`0 9 * * *`) added alongside existing cleanup-guidelines cron.

**Key decisions:**

- **Current password verification via re-authentication (S8.1):** Supabase does not expose a dedicated "verify current password" endpoint. Re-signing-in with `signInWithPassword` achieves the same result — if the credential is wrong, `signInWithPassword` returns an error and the password change is blocked. The re-sign-in refreshes the session token as a side effect, which is harmless.
- **Resend via `fetch`, not SDK (S8.2/S8.3):** The `resend` npm package is not installed. All three email functions use the Resend REST API directly via `fetch`. This avoids adding a dependency for what is four simple HTTP calls. The `sendEmail` wrapper is ~25 lines and covers all cases.
- **Email failure does not block deletion (S8.2):** Once `auth.admin.deleteUser` succeeds, the user is gone and cannot be recovered. Blocking the 200 response because of an email failure would leave the client in an error state with no account — the deletion happened but the client sees a failure. Email failures are logged for investigation; the 200 is returned regardless.
- **Inactivity cron skips null `last_sign_in_at` (S8.3):** Users who registered but never signed in have `last_sign_in_at = null`. Treating null as "infinitely old" would delete brand-new accounts that haven't confirmed their email yet. Null is explicitly skipped; only accounts with a known last sign-in date are evaluated.
- **Deletion cron logs user ID, not email (S8.3):** Per ADR-OPS-OPS (Sentry PII scrubbing) and general GDPR hygiene, log lines contain the Supabase user UUID only. Email addresses are not logged anywhere in the cron path.

---

## 2026-05-21 — Slice 7: Step 5 Approve & Export wired up

**What changed:**

- `actions/applications.ts` — `approveApplication(applicationId)` Server Action added. Sets `applications.status = 'approved'` and `is_approved = true` on all `application_answers` rows. Ownership enforced via `user_id` filter on the applications UPDATE (prevents one user approving another's application even if they know the ID).
- `app/(authenticated)/applications/[id]/step/5/page.tsx` — fully rewritten; `getApplicationOrRedirect(id, 5)` for step locking; separate query for `last_exported_at` (not in `ApplicationData` type); `application_answers` fetched ordered by `question_order`; typed `AnswerRow[]` and application metadata passed to component.
- `components/application-step5-approve.tsx` — full rewrite; `AnswerRow` type exported; three-item checklist (must all be checked before Approve activates); read-only Q&A view with per-answer word count, source badge, over-limit warning; approve + re-open dialogs with real Server Action calls via `useTransition`; two download buttons (`.docx` and `.txt`); download via `fetch()` + `response.blob()` + `createObjectURL` (shows error state if route fails); re-export warning dialog shows real `lastExported` date from DB; status and `lastExported` updated client-side on first download.
- `app/api/export/[applicationId]/route.ts` (new) — `GET` route; auth + ownership + status check (`approved` or `exported` required); fetches answers and user profile for disclaimer; generates A4 Word doc (docx v9.6.1) per PDR-DH-003; updates `status = 'exported'` and `last_exported_at = now()` on every call; `?format=txt` returns plain-text variant.

**Key decisions:**

- Three-item checklist gates the Approve button (not just a confirmation dialog): this reflects P1.12's spec intention of "three review prompts" and ensures users consciously confirm accuracy and AI responsibility before approving. The dialog then provides a second confirmation with grant/funder details shown.
- Download updates status on every call (not just the first): `last_exported_at` is always current, so the re-export warning can show the accurate "last exported on [date]" message. This matches the data-model.md note: "last_exported_at is updated on every export, not just the first".
- Source badges on read-only view: showing "AI generated / AI + edited / Written by you" on Step 5 helps users quickly spot answers they haven't personally reviewed. This was not explicitly in the spec but is low-cost and directly supports the accuracy checklist.
- `Uint8Array` conversion before `new Response(...)`: `Packer.toBuffer()` returns `Buffer<ArrayBufferLike>` which TypeScript 5.x does not accept as `BodyInit`. Wrapping with `new Uint8Array(buffer)` is the correct fix (zero-copy for Node.js Buffers backed by `ArrayBuffer`).

---

## 2026-05-21 — Slice 5: Step 3 AI Summary wired up

**What changed:**

- `lib/prompts.ts` (new) — `MODEL = 'anthropic.claude-sonnet-4-6'`; `AI_SYSTEM_PROMPT` enforces UK grant expert persona + JSON-only output (no prose, no markdown); `buildSummaryPrompt(guidelinesText, charity|null)` injects charity context when available and specifies the exact JSON schema (`aboutGrant`, `amount`, `whoCanApply[]`, `lookingFor[]`, `questions[]`, `keyRequirements[]`); `buildDraftPrompt()` pre-built for Slice 6; `ApplicationQuestion` type exported.
- `lib/ai-error-handler.ts` (new) — `AiErrorCode` union (8 codes); `httpStatusForError()` and `aiErrorBody()` provide consistent GAP-04 error shapes across all AI routes; `classifyBedrockError()` maps SDK `.status` codes; `withRetry<T>()` wraps any async call with 2 retries for `rate_limited`, `overloaded`, `server_error`, `timeout` — delays 1 s / 3 s; non-retryable for 400/401/403.
- `POST /api/generate-summary` (new) — `maxDuration = 90` (Bedrock calls up to ~35 s in production; Vercel default 10 s too short — Vercel Pro required per ADR-AI-006/ADR-OPS-001); `SUMMARY_MAX_TOKENS = 1200` (reduced from spike's 1500 to cut response time while still fitting a full summary, per P2.3 deviation note); flow: auth → ownership check → monthly cap (20/month, `ai_usage_log` WHERE current month) → Upstash rate limit → charity profile fetch → Bedrock withRetry → strip markdown fences → JSON.parse → one retry on parse failure → save to `applications.ai_summary` → insert `ai_usage_log` (`request_type: 'guideline_summary'`) → return `{ summary, questionsFound, approachingLimit }`.
- `actions/applications.ts` — `advanceToStep4()` added; advances `current_step` to `max(current, 4)`; no status change (remains `in_progress` from Step 2); redirects to step/4 on success.
- `app/(authenticated)/applications/[id]/step/3/page.tsx` — rewritten; calls `getApplicationOrRedirect(id, 3)` for step locking; passes `existingSummary` (from `applications.ai_summary` DB column) to component so previously generated summaries are shown immediately on revisit without a Bedrock call.
- `components/application-step3-summary.tsx` — fully rewritten; five display states; on mount: if `existingSummary` is non-null → parse JSON → render `"content"` immediately; else check sessionStorage → if no guidelines → `"no-guidelines"`; else call `/api/generate-summary`; asymptotic progress bar (GAP-02: `p += (89−p) × 0.04` every 200 ms, snaps to 100 on API return); staged loading messages; `clearGuidelines()` on success (GAP-10); `isRetry` bool — second failure shows `"persistent-failure"` (no retry button); Regenerate resets `isRetry`; `advanceToStep4()` via `useTransition`.

**Key decisions:**

- `SUMMARY_MAX_TOKENS = 1200` not 1500: P2.3 spike showed 1500 tokens caused 33 s response times, marginally over the 30 s NFR-01 target. 1200 tokens fits a complete summary and typically returns in ~20–25 s. Documented as P2.3 deviation in API route comment.
- Parse failure retry uses multi-turn conversation: the retry sends the original prompt, Claude's malformed response, and a new user message demanding JSON-only output. This gives Claude the context to understand what it got wrong, more reliable than repeating the original prompt cold (ADR-AI-004).
- `maxDuration = 90` requires Vercel Pro: noted in the route file header and tracked in P5.4 production infrastructure. On Hobby (default 10 s), the route will time out in production for large guideline documents. The current dev environment (no function timeout cap) is unaffected.
- `clearGuidelines()` called on summary success, not on Regenerate: the guidelines must remain in sessionStorage for the user to be able to regenerate. They are only cleared once the user is satisfied with the summary (GAP-10). Navigating away and returning to Step 3 — if the DB `ai_summary` column is populated — renders the existing summary without needing sessionStorage again.

---

## 2026-05-20 — S1.1: Charity Commission lookup — corrected endpoints and AI paraphrase restored

**What changed:**

- `actions/charity.ts` (rewritten) — `lookupCharity(query)` Server Action now uses the correct Charity Commission Register of Charities API endpoints, confirmed from the official OpenAPI YAML spec:
  - Name search: `GET /searchCharityName/{charityname}` (was incorrectly `/charitySearch/{name}/1/1`)
  - Number search: `GET /charityRegNumber/{RegisteredNumber}/0` (was incorrectly `/allCharityDetails/{n}`)
  - New: second call to `GET /charitygoverningdocument/{RegisteredNumber}/0` to retrieve `charitable_objects` (free-text legal description from governing document)
  - New: Amazon Bedrock Claude (`anthropic.claude-sonnet-4-6`, eu-west-2) paraphrases `charitable_objects` into plain-English `whatDoes` and `whoHelps` descriptions. Uses `Promise.race` with a 30-second timeout. Bedrock failure degrades gracefully — name + registration number are still returned, and `whatDoes`/`whoHelps` are empty strings.
  - Return type extended: `{ ok: true; charityName; registrationNumber; whatDoes; whoHelps }`.
- `components/charity-profile-form.tsx` — `paraphrasedFromLookup` state restored (was incorrectly removed in initial S1.1 pass); `handleLookup` now pre-fills `whatDoes` and `whoHelps` from Bedrock result when non-empty; amber Sparkles banner displayed on match when AI descriptions were generated, prompting user to review and personalise; hint text on `whatDoes`/`whoHelps` fields condenses when `paraphrasedFromLookup` is true.
- `app/(authenticated)/profile/page.tsx` — `export const maxDuration = 60` added (two Charity Commission API calls at 10 s each plus Bedrock at up to 30 s exceeds Vercel's default 10 s timeout).
- `.env.example` — `CHARITY_COMMISSION_API_KEY` entry unchanged (already added in initial pass).

**Why the initial implementation was wrong:**
The initial S1.1 pass used endpoint paths reverse-engineered from the Charity Commission developer portal screenshots rather than the authoritative OpenAPI spec. After the user provided the full `register-of-charities-api.yaml`, the correct paths were confirmed. The AI paraphrase feature was also incorrectly removed in the initial pass, incorrectly assessed as "speculative Phase 1 content" — the CHANGELOG entry from 2026-05-18 (below) records it as a deliberate design decision that was always part of S1.1.

**Why `useTransition` (not `useActionState`):**
`lookupCharity` returns structured data (`{ charityName, registrationNumber, whatDoes, whoHelps }`) rather than a form state value. The same pattern applies as `mfaEnroll`.

**Why `GetCharityGoverningDocument` (not `GetCharityWhoWhatHow`):**
`GetCharityWhoWhatHow` returns structured taxonomy codes (`classification_code`, `classification_type`, `classification_desc`) — these are classification labels, not natural language. `GetCharityGoverningDocument.charitable_objects` is the actual legal free-text description of the charity's purposes — far better as input for an AI paraphrase prompt.

**Action required (WJ):** Register for a Charity Commission API key at https://api.charitycommission.gov.uk/ and add it to `.env.local` as `CHARITY_COMMISSION_API_KEY`, and to Vercel environment variables for production. Also ensure `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_REGION` are set — without these the Bedrock paraphrase step is silently skipped and `whatDoes`/`whoHelps` will be empty on lookup.

---

## 2026-05-20 — S0.6: MFA opt-in wired up

**What changed:**

- `actions/auth.ts` — four new Server Actions: `mfaEnroll()` (returns QR code SVG data URL, factorId, and TOTP secret for display; called directly from a useTransition handler, not useActionState, because it returns structured data), `mfaVerifyEnrollment()` (verifies the 6-digit code entered during setup; maps status 422 to `invalid_code`), `mfaUnenroll()` (removes the TOTP factor), `verifyMfaSignIn()` (completes MFA sign-in; redirects to `/dashboard` on success). `signIn()` updated: after a successful `signInWithPassword`, calls `getAuthenticatorAssuranceLevel()`; if `nextLevel === 'aal2'` and `currentLevel !== 'aal2'`, redirects to `/mfa` instead of `/dashboard`.
- `proxy.ts` — `/mfa` added to PROTECTED (requires an active aal1 session to reach the challenge page).
- `app/(authenticated)/mfa/page.tsx` (new) — reads first TOTP factor via `listFactors()`; redirects to `/dashboard` if the user somehow arrives with no factor enrolled; renders `MfaChallengeForm`.
- `components/mfa-challenge-form.tsx` (new) — `useActionState(verifyMfaSignIn)`; hidden `factorId` input; numeric code input with `inputMode="numeric"` and `autoComplete="one-time-code"`; separate error banners for `invalid_code` and `unknown`.
- `app/(authenticated)/account/page.tsx` — rewritten as async Server Component. Previously passed `?mfa=enabled` URL param from a static demo. Now reads real email from `auth.getUser()` and real MFA status from `mfa.listFactors()` (filters by `factor_type === 'totp'` and `status === 'verified'`). Passes `email`, `mfaEnabled`, `mfaFactorId` to `AccountSettingsForm`.
- `components/mfa-setup-panel.tsx` (new) — two-state panel. Not enabled: "Set up" button calls `mfaEnroll()` inside `useTransition` (not `useActionState`) since it returns data, not FormData; shows QR code and manual setup key; verify form uses `useActionState(mfaVerifyEnrollment)`. Enabled: unenroll form uses `useActionState(mfaUnenroll)`. `router.refresh()` triggered via `useEffect` when either action reaches `status === 'success'`, causing the parent Server Component to re-fetch and pass updated props.
- `components/account-settings-form.tsx` — `MOCK_EMAIL` replaced with real `email` prop; static MFA toggle (local `mfaOn` useState) replaced with `MfaSetupPanel`; interface updated with `email`, `mfaEnabled`, `mfaFactorId` props.

**Why:**
`mfaEnroll()` is called outside `useActionState` because it returns structured data (QR code, factorId, secret) that the component needs to display. Encoding those as FormData round-trips would add unnecessary complexity. `useTransition` provides the pending state. The `router.refresh()` approach (useEffect on status change) is preferred over a server `redirect()` inside the action because the user stays on `/account` after MFA setup — only the data changes.

---

## 2026-05-20 — S0.5: Session timeout wired up

**What changed:**

- `actions/auth.ts` — new `signOut` Server Action; calls `supabase.auth.signOut()` only, no `redirect()`. Navigation is handled by the caller. This is intentional — calling `redirect()` inside a `setTimeout` callback is unreliable; having the client component own the navigation is cleaner and more predictable.
- `components/session-timeout-provider.tsx` (new) — client component that implements FR-06. Attaches passive event listeners (`mousemove`, `keydown`, `click`, `touchstart`) to `document`. Any activity resets two timers: a 55-minute warning timer and a 60-minute sign-out timer. At 55 minutes, `SessionTimeoutModal` opens with a 5-minute countdown (decremented each minute via `setInterval`). At 60 minutes, `signOut()` is called and the user is sent to `/`. "I'm still here" calls `resetTimers()`. "Sign out now" calls `doSignOut()` immediately. Stable `useCallback` references ensure the `useEffect` only runs once on mount and the activity handlers always call the current version of `resetTimers`.
- `app/(authenticated)/layout.tsx` — converted to async Server Component; `SessionTimeoutStub` replaced with `SessionTimeoutProvider`; real `first_name` and `email` now read from `supabase.auth.getUser()` via `user_metadata` and passed to `NavAuthenticated`. `MOCK_FIRST_NAME` removed.
- `components/session-timeout-stub.tsx` — deleted.

**Why:**
The `signOut` action omits `redirect()` because Server Action redirects work reliably from form submissions (via React's transition system) but are fragile when called from timer callbacks. Owning the navigation in the client component makes the timeout flow predictable. The layout is a Server Component so it can call `getUser()` at render time without adding a client-side data-fetch waterfall.

---

## 2026-05-20 — S0.4: Password reset wired up

**What changed:**

- `actions/auth.ts` — two new actions. `requestPasswordReset`: calls `resetPasswordForEmail(email, { redirectTo: {origin}/auth/callback })`; always returns `{ status: 'sent' }` — never reveals whether the email is registered (AC-FR-05-02). `resetPassword`: checks session exists first, then calls `updateUser({ password })`; maps session errors to `{ status: 'expired' }` so the user sees the "link expired" view rather than a generic error.
- `app/auth/callback/route.ts` — added `type === 'recovery'` routing. On success routes to `/forgot-password?state=reset`; on failure routes to `/forgot-password?state=expired`. Email verification routing (`type === 'email'`) unchanged.
- `proxy.ts` — removed `/forgot-password` from AUTH_ONLY. The callback sets a recovery session (making the user technically "authenticated") before redirecting to `/forgot-password?state=reset`. Keeping it in AUTH_ONLY would redirect them to `/dashboard` instead of the password form.
- `components/forgot-password-request-form.tsx` — wired via `useActionState`. `state.status === 'sent'` replaces the old `submitted` useState toggle. Anti-enumeration: the success view always shows regardless of whether the email is registered.
- `components/reset-password-form.tsx` — wired via `useActionState`. Two expired paths: `isExpired` prop (link was expired when the user arrived) and `state.status === 'expired'` (session expired while the user was on the form). Both render the same expired view with a "Request a new link" button.

**Why:**
The `requestPasswordReset` action always returns `sent` because revealing whether an email is registered would let an attacker enumerate accounts (AC-FR-05-02). The `/forgot-password` AUTH_ONLY removal mirrors the `/verify-email` fix from S0.2 — Supabase's recovery session makes the user "authenticated" immediately after the callback, so the route must be publicly accessible in all auth states.

---

## 2026-05-20 — S0.3: Sign in wired up

**What changed:**

- `actions/auth.ts` — new `signIn` Server Action. Calls `supabase.auth.signInWithPassword()`. Detects `error.code === 'email_not_confirmed'` and returns `{ error: 'unverified' }` so the form can show the resend link. All other auth errors (wrong password, unknown email, rate limit) return the same `{ error: 'credentials' }` message — intentional, to prevent email enumeration (AC-FR-04-03). On success: `redirect('/dashboard')`.
- `components/sign-in-form.tsx` — fully wired. `useActionState(signIn)` replaces the static `useState` stub. Same validation-first / Server Action pattern as the register form: `handleSubmit` calls `e.preventDefault()` on field errors, does nothing on success. `name` attributes added to email and password inputs. Submit button shows `disabled={isPending}` and "Signing in…". The "Resend verification email" stub button replaced with a `<Link>` to `/verify-email?email=xxx` — takes the user to the existing resend flow with their email pre-filled.

**Why:**
The same `credentials` error for both wrong password and unknown email is deliberate (AC-FR-04-03) — returning different messages would let an attacker enumerate registered email addresses. Linking to `/verify-email` for the resend (rather than calling the resend action inline) reuses the existing rate-limited resend flow and avoids duplicating resend logic on the sign-in page.

---

## 2026-05-20 — S0.2: Email verification wired up

**What changed:**

- `app/auth/callback/route.ts` (new) — handles the Supabase redirect after the user clicks their verification email link. Calls `verifyOtp({ token_hash, type })` for email OTP flow (the default); falls back to `exchangeCodeForSession(code)` for PKCE flows (OAuth, magic links). On success → `/verify-email?state=verified`; on any failure → `/verify-email?state=expired`.
- `proxy.ts` — removed `/verify-email` from `AUTH_ONLY`. After clicking the verification link, the callback sets the session and redirects the now-authenticated user to `/verify-email?state=verified`. Having it in AUTH_ONLY would redirect them to `/dashboard` before they see the confirmation.
- `lib/rate-limit.ts` — added `resendRatelimit` (3 per hour per email, Upstash sliding window, prefix `grant-pathway:resend`) to satisfy AC-FR-03-06.
- `actions/auth.ts` — two changes to `registerUser`: (1) `emailRedirectTo: ${origin}/auth/callback` added to `signUp()` so the verification link points to our callback; (2) redirect updated to `/verify-email?email=xxx` so the page can display the email without a session (Supabase does not create a session before email confirmation when `enable_confirmations = true`). New `resendVerificationEmail` action: rate-checks via `resendRatelimit`, calls `supabase.auth.resend({ type: 'signup', email, options: { emailRedirectTo } })`.
- `components/verify-email-resend-form.tsx` (new) — `"use client"` component using `useActionState(resendVerificationEmail)`. Two modes: `awaiting` (hidden email input, outline button) and `expired` (visible email input for correction, primary button). Four feedback states: sent (green), rate_limited (amber), error (red), missing_email (red).
- `app/(public)/verify-email/page.tsx` — MOCK_EMAIL replaced; page reads email from `?email=` query param first, then from Supabase session (local dev where email confirmation is disabled), then falls back to empty string. `VerifyEmailResendForm` wired into both AwaitingState and ExpiredState.

**Why:**
`/auth/callback` is the standard Next.js + Supabase SSR pattern for handling the token returned after email verification. The `emailRedirectTo` option on `signUp()` is the mechanism that tells Supabase which URL to embed in the verification email — without it, Supabase uses the `site_url` (the homepage) which would not invoke our callback. The `?email=` param on the redirect avoids a session dependency: locally `enable_confirmations = false` so a session exists, but in production `enable_confirmations = true` means no session until the email is verified.

---

## 2026-05-20 — S0.1: Registration wired up

**What changed:**

- `supabase/migrations/20260520000001_handle_new_user_trigger.sql` (new) — `handle_new_user()` trigger (`SECURITY DEFINER SET search_path = ''`) on `auth.users` INSERT. Auto-creates a `user_profiles` row by reading `first_name`, `last_name`, and `feedback_consent` from `raw_user_meta_data`. Chosen over a service-role API call in the Server Action because the trigger is atomic with the user creation, cannot be skipped, and is the Supabase-recommended pattern for profile initialisation.
- `actions/auth.ts` (new) — `registerUser` Server Action. Calls `supabase.auth.signUp()` with profile data in `options.data`. Detects duplicate email by checking `data.user.identities?.length === 0` (Supabase does not return an error for duplicate emails when email confirmation is enabled — privacy-preserving behaviour). Returns `{ error: 'email_exists' }` or `{ error: 'unknown' }` on failure; redirects to `/verify-email` on success.
- `components/register-form.tsx` — wired from static shell to real Server Action using React 19 `useActionState`. Client-side validation runs first (`handleSubmit`): calls `e.preventDefault()` on field errors, does nothing on success (allowing `action={action}` to fire the Server Action). All inputs given `name` attributes for FormData. Submit button shows `disabled={isPending}` and "Creating account…" loading text. Two server-error banners: `email_exists` (with "Sign in instead?" link) and `unknown`.

**Why:**
Standard React 19 App Router pattern: `useActionState` binds the Server Action to the form; client validation guards against obviously invalid data without a round-trip; the database trigger keeps profile creation atomic.

---

## 2026-05-20 — P3.12: Pre-Phase 4 Gap Resolutions (GAP-06, 08, 09, 10, 11, 14, 18)

**What changed:**

- `.env.example` — `SUPABASE_DB_PASSWORD` added with explanation of its purpose (CLI operations, not API calls). GAP-06 resolved.
- `lib/file-validation.ts` (new) — `validateFile(mimeType, sizeBytes)` returns a typed discriminated union result. Imported by `POST /api/upload/process` in Slice 4 to re-validate before text extraction. `FILE_VALIDATION_MESSAGES` provides user-facing error strings matching FR-23. GAP-08 resolved.
- `lib/guidelines-session.ts` (new) — `setGuidelines()`, `getGuidelines()`, `clearGuidelines()` manage extracted guidelines text in `sessionStorage` keyed by `guidelines_text_${applicationId}`. All sessionStorage access for guidelines text must go through this utility. GAP-09 resolved.
- `IMPLEMENTATION-PLAN.md` S5.2 spec updated — `clearGuidelines(applicationId)` call added to the generate-summary route on-success step. GAP-10 resolved.
- `@axe-core/react` installed as dev dependency; `components/axe-provider.tsx` created (client component, no-op in production); wired into `app/layout.tsx`. WCAG violations now logged to browser console during development. GAP-14 resolved.
- GAP-11 (GitHub branch protection): **blocked** — requires GitHub Pro for private repos. Account upgrade needed. Documented in IMPLEMENTATION-STATUS.md and ADR-TRACEABILITY.md. GAP-18 (JWT expiry): confirmed local `jwt_expiry = 3600` in config.toml; prod default is also 3600s.

**Why:**
These were ADR consequences identified during the P3.12 sweep that had no corresponding implementation task. Resolving them before Phase 4 slice work ensures the architecture contracts (ADR-FILE-002, ADR-FILE-004, ADR-OPS-006, ADR-SEC-003) are honoured from the first slice, not retrofitted. GAP-11 is the only unresolved item and is a GitHub account tier limitation, not a code issue.

---

## 2026-05-20 — P3.11: Health Endpoint and Public API Bypass Pattern (ADR-OPS-007)

**What changed:**

- `app/api/health/route.ts` created: queries `user_profiles` count; returns `{ status: 'ok' }` 200 on success, `{ status: 'error' }` 503 if Supabase is unreachable. Required by ADR-OPS-007 for UptimeRobot monitoring (to be configured in P5.4).
- `proxy.ts` extended with a `PUBLIC_API = ['/api/health']` list. Any route in this list short-circuits before `updateSession()` is called, returning `NextResponse.next()` immediately.

**Why:**
ADR-OPS-007 requires a health check endpoint polled by UptimeRobot every 5 minutes. The endpoint must be reachable without an authenticated session. Rather than relying on the route falling through the auth checks (which would still invoke `updateSession()` and incur Supabase SSR overhead), an explicit `PUBLIC_API` early-return was introduced. This establishes a pattern for any future routes that must be public at the infrastructure level — add them to `PUBLIC_API` rather than letting them leak through the auth logic. UptimeRobot monitor configuration deferred to P5.4 when the production domain is confirmed.

---

## 2026-05-20 — Documentation Restructure: CHANGELOG moved to Implementation Plan folder

**What changed:**

- `docs/CHANGELOG.md` moved to `docs/Implementation Plan/CHANGELOG.md`.
- All four implementation documents now live in one folder: `IMPLEMENTATION-STATUS.md`, `CHANGELOG.md`, `IMPLEMENTATION-PLAN.md`, `ADR-TRACEABILITY.md`.
- `AGENTS.md` updated with a blanket rule: after every task, check all four documents in `docs/Implementation Plan/` and update as appropriate.

**Why:**
The changelog was previously in `docs/` root while the other implementation documents were in `docs/Implementation Plan/`. This made it easy to forget to update — there was no single rule that covered all relevant documents. Co-locating them means one folder, one check, one rule. Appropriate for a team project where multiple contributors need reliable, up-to-date documentation.

---

## 2026-05-20 — Process: ADR Traceability Table, Phase Gates, and Gap Resolutions

**What changed:**

- `docs/Implementation Plan/ADR-TRACEABILITY.md` created — maps every consequence of all 42 ADRs to a specific implementation task. 20 gaps identified (GAP-01 to GAP-20).
- `P3.12` added to Phase 3: 7 High/Medium gap resolutions required before Phase 4 begins.
- Formal Phase 3→4 and Phase 4→5 gate checklists added to the implementation plan.
- Accessibility definition-of-done added to the Phase 4 introduction (ADR-OPS-006).
- `AGENTS.md` updated with mandatory ADR consequences pre-task check rule.
- Plan version 1.6. Total tasks: 78.

**Why:**
Full ADR consequences sweep found that 20 ADR consequences had no corresponding implementation task. Root cause: tasks were written feature-first; ADR consequences are spec-first. The traceability table makes gaps permanently visible. Phase gates make the sweep a formal required step before each phase begins rather than an ad-hoc activity. Three layers of control: AGENTS.md rule (pre-task), traceability table (ongoing visibility), phase gates (phase-boundary enforcement).

---

## 2026-05-20 — Phase 0–3 Re-audit: Supabase Session Cookie Bug Fixed (proxy.ts)

**What changed:**

- `proxy.ts` updated to forward refreshed Supabase session cookies on redirect responses.
- A `redirectWithCookies()` helper function introduced — called in both redirect branches (unauthenticated user → sign-in page; authenticated user → dashboard).

**Why:**
Both redirect branches previously returned a bare `NextResponse.redirect(url)` without carrying the session cookies from `supabaseResponse`. The Supabase SSR documentation explicitly warns that failing to forward these cookies on every response — including redirects — prevents the session token from being refreshed. This could cause spurious logouts for users navigating to or from protected routes. Found during a full Phase 0–3 compliance re-audit (finding D-27).

---

## 2026-05-20 — Phase 3 Compliance Review: word_limit Migration Applied

**What changed:**

- New migration `20260520000000_add_word_limit_to_application_answers.sql` adds `word_limit integer` (nullable) to `application_answers`.
- Applied to both dev (`stanwaejdvlvremtffkf`) and prod (`mvmjryipieepvsjudche`).

**Why:**
`word_limit` is specified in ADR-DATA-001, technical-design.md, and ADR-AI-004 but was omitted from the initial schema during P3.1. It is populated by the AI Summary step (Slice 5) when questions are extracted from funder guidelines, and used as a per-question constraint in the draft-answer prompt (Slice 6). Adding it now as a dedicated migration keeps a clean audit trail.

---

## 2026-05-20 — Phase 3 Compliance Review: High Severity Fixes Applied

**What changed:**

1. **CSP Sentry EU ingest domain added** (`next.config.ts`)
   - `connect-src` directive updated to include `https://*.ingest.de.sentry.io`.
   - Without this, the Sentry browser SDK was silently blocked and no client-side errors were being reported. The omission occurred because P3.5 (security headers) and P3.7 (Sentry setup) were completed independently with no cross-referencing of the CSP against the SDK's required domains.

2. **Sentry edge config PII scrubbing added** (`sentry.edge.config.ts`)
   - `beforeSend` hook added — strips `event.user.email` and `event.user.username` before transmission to Sentry.
   - `sentry.client.config.ts` and `sentry.server.config.ts` already had this hook (ADR-SEC-006); the edge config was overlooked. GDPR risk: without this, user email addresses could be included in Sentry reports for middleware-layer errors.

3. **Security-critical dependency updates**
   - `next` 16.2.5 → 16.2.6: fixes CVE-2026-44575 (High) — middleware/proxy bypass via segment-prefetch routes with Turbopack enabled.
   - `@tailwindcss/postcss` 4.2.4 → 4.3.0: resolves PostCSS XSS vulnerability (Medium).
   - `@anthropic-ai/sdk` 0.97.0 → 0.97.1: routine patch.
   - `tailwind-merge` 3.5.0 → 3.6.0: routine patch.
   - `lucide-react` updated via Dependabot PR #1 (merged).
   - Dependabot PRs #2–5 closed and consolidated into a single batch install to avoid `package-lock.json` conflicts.

**Why:**
Phase 3 compliance review against ADRs, TDD, and PRD identified 8 discrepancies. These 2 High severity items were fixed immediately. 6 Medium/Low items remain (schema migration, docs updates, health endpoint, ADR correction) — to be addressed before Phase 4 begins.

---

## 2026-05-20 — Phase 3 Complete: AWS Bedrock Spend Cap Configured

**What changed:**

- AWS Budget `grant-pathway-bedrock-cap` created in AWS Billing console: $127/month (~£100).
- Alert #1 at $89 (~£70): early warning email to mailinglist@rapidglobe.com.
- Alert #2 at $127 (~£100): hard cap email to mailinglist@rapidglobe.com.
- Budget scoped to All AWS services — Bedrock does not yet appear in the service filter as it has no billing history. To be narrowed to Bedrock-only after first Bedrock invoice.
- No automated IAM hard-stop action attached to Alert #2 — deferred to P5.4 (pre-launch infrastructure) due to complexity of IAM role setup.

**Why:**
The per-user 20 req/month limit in the application is the primary cost control. The AWS budget is a secondary backstop. Email alerts at £70 and £100 provide sufficient warning to intervene manually before launch traffic is significant. The IAM hard-stop will be properly configured during P5.4 when the full production infrastructure is reviewed.

**Phase 3 is now complete.** All 10 infrastructure tasks done. Next: Phase 4 — Vertical Slices.

---

## 2026-05-20 — P3.8 Complete: Email Infrastructure; Inactivity Emails Moved to Code

**What changed:**

- Resend sending domain `grantpathway.org.uk` verified (SPF + DKIM via GoDaddy DNS).
- Supabase Auth SMTP configured to send via Resend: `smtp.resend.com:465`, sender `noreply@grantpathway.org.uk`.
- Supabase Auth email templates updated: Confirm sign up and Reset password — teal CTA buttons, Grant Pathway branding, tone aligned to voice guide.
- Inactivity emails (Email 3 — inactivity warning; Email 4 — account deleted) will be built as dedicated code functions in `lib/emails/inactivity-warning.ts` and `lib/emails/account-deleted-inactivity.ts`, not as Resend templates.
- `RESEND_API_KEY` added to `.env.example` and `.env.local`.
- ⚠️ Prerequisite before testing: `noreply@grantpathway.org.uk` mailbox must be created in GoDaddy before any email flow is tested.

**Why:**
Resend's HTML template editor does not support variable substitution — variables rendered as literal strings (`{first_name}`) rather than being replaced at send time. Rather than use a workaround, the inactivity email HTML will be built in code as pure functions that accept variables and return an HTML string. This also separates email content from cron job logic, making both easier to maintain independently. The cron jobs in Slice 8 will call `resend.emails.send({ html: buildInactivityWarningEmail(firstName, deletionDate) })`.

---

## 2026-05-18 — Charity Profile Lookup Unavailable State Simplified

**What changed:**

- `components/charity-profile-form.tsx`: removed "Try again" and "Enter details manually" buttons from the API unavailable error state.
- Replaced with a single plain message: "We couldn't reach the Charity Commission right now. You can try again using the **Look up charity** button above, or fill in your details manually in the fields below."
- Removed the `showLookup` state and the conditional wrapper around the lookup section — the lookup is now always visible.
- Removed unused `handleTryAgain` and `handleEnterManually` functions.

**Why:**
"Try again" was redundant — the "Look up charity" button already visible above does the same thing. "Enter details manually" hid the lookup section, which was jarring and unnecessary since the form fields are always visible below. One clear message pointing to what is already on screen is simpler and less confusing.

---

## 2026-05-18 — Charity Profile AI Paraphrase on Lookup Match

**What changed:**

- `components/charity-profile-form.tsx`: when the Charity Commission lookup finds a match, "What does your charity do?" and "Who does your charity help?" are now pre-filled with AI-paraphrased plain-English versions of the charity's legal objects and beneficiary description.
- An amber "AI-generated content below" banner appears above the two fields explaining the source and instructing the user to review and edit before saving.
- The individual hint texts for those two fields are hidden when the banner is active (the banner replaces them). They remain visible when the lookup has not been run.
- A `paraphrasedFromLookup` state tracks whether pre-fill is active; also initialised from the `?lookup=match` URL param for static shell testing.

**Why:**
Asking non-technical users to locate and rewrite formal Charity Commission legal objects language is a barrier. AI paraphrase removes that burden while the prominent disclaimer ensures users understand the content is AI-generated and must be reviewed. One AI call (paraphrase on lookup match) rather than two.

---

## 2026-05-18 — Charity Profile Form Hint Text Added

**What changed:**

- `components/charity-profile-form.tsx`: added hint text beneath the label for three fields — "What does your charity do?", "Who does your charity help?", and "Where do you work?". Each hint is linked to its field via `aria-describedby`.

| Field                       | Hint text                                                                                                                   |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| What does your charity do?  | Points to Charity Commission entry (charitable objects) and website 'About us' page.                                        |
| Who does your charity help? | Prompts user to think about age, background, or circumstances of beneficiaries; notes Charity Commission entry as a source. |
| Where do you work?          | Suggests town, county, or region; explains 'National'; fallback to charity's home town if unsure.                           |

**Why:**
Non-technical users (primary persona Margaret) may not know what information to enter in these open-ended fields. The hints point to authoritative, accessible sources (Charity Commission register, charity website) and give concrete examples to reduce blank-page anxiety.

---

## 2026-05-18 — Step 5 Back Button Hidden After Approval

**What changed:**

- `components/application-step5-approve.tsx`: Back link now only renders when `isApproved` is false (pending state). It is hidden once the application is approved or exported.

**Why:**
Once approved or exported, "Re-open application" is the correct route back to Step 4 — it shows a confirmation dialog warning that approval will be removed. The plain Back link bypassed that dialog, silently navigating to Step 4 with no context. It was redundant at best and misleading at worst.

---

## 2026-05-18 — Step 3 Approaching-Limit Banner Moved to Step 4

**What changed:**

- `components/application-step3-summary.tsx`: removed `approachingLimit` prop and amber "You've used most of your monthly AI allowance" banner.
- `app/(authenticated)/applications/[id]/step/3/page.tsx`: removed `usage` search param and `approachingLimit` prop pass-through.
- `components/application-step3-summary.tsx`: fixed missing space between question count and "application" in green questions-found banner (rendered as "3application" → "3 application").

**Why:**
The approaching-limit banner on Step 3 contradicted the green banner below it, which promised to generate draft answers in the next step. Step 3 displays a summary that has already been generated, so the AI allowance warning is irrelevant at this point. Step 4 already shows the same warning immediately before the user triggers the draft-generation AI call, which is the correct placement.

---

## 2026-05-18 — Step 3 Continue Button Simplified

**What changed:**

- `components/application-step3-summary.tsx`: continue button text changed from "This looks right — continue" to "Continue".
- `docs/PRD inputs/screen-requirements.md`: Step 3 continue button spec updated to match.

**Why:**
"This looks right — continue" is unnecessarily wordy. "Continue" is cleaner and consistent with the button label used on Steps 1 and 2.

---

## 2026-05-18 — Step 2 Format and Scanned Error Messages Improved

**What changed:**

- `components/application-step2-form.tsx`: format and scanned error messages rewritten for consistency with the size error message.

| Error   | Was                                                                                                                               | Now                                                                                                                                                                                                                                                                                                                  |
| ------- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Format  | "We can only accept PDF or Word (.docx) files. Please convert your document or paste the text directly."                          | "We can only accept PDF or Word (.docx) files. Check the funder's website for a version in one of these formats. If not, you can paste the key sections — such as eligibility criteria and application questions — into the text box below."                                                                         |
| Scanned | "We couldn't read the text in your PDF — it may be a scanned document. Please try copying and pasting the text directly instead." | "We couldn't read the text in your PDF — it looks like a scanned document rather than a digital one. Some funders also publish a Word version of their guidelines — check their website. If not, you can paste the key sections — such as eligibility criteria and application questions — into the text box below." |

**Why:**
The scanned error made no mention of a Word doc as an alternative, inconsistent with the format error which correctly lists both accepted formats. All three error messages now follow the same pattern: explain the problem, point to the funder's website as the primary fix, then offer the paste fallback with guidance on what to paste.

---

## 2026-05-18 — Step 2 File Size Error Message Improved

**What changed:**

- `components/application-step2-form.tsx`: size error message rewritten.

| Was                                                                                | Now                                                                                                                                                                                                                                                  |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "Your file is over 10MB. Please upload a smaller file or paste the text directly." | "Your file is over 10MB. Some funders publish a shorter summary version of their guidelines — check their website first. If not, you can paste the key sections — such as eligibility criteria and application questions — into the text box below." |

**Why:**
The original message was unhelpful — it told users to get a smaller file without explaining how. The revised message points users to the funder's website first (cleanest fix) and then offers the paste fallback as a secondary option.

---

## 2026-05-18 — Step 1 Heading Differentiated for New vs Existing Applications

**What changed:**

- `docs/PRD inputs/screen-requirements.md`: Step 1 heading split into two variants.
- `components/application-step1-form.tsx`: heading now conditional on whether an `applicationId` is present.

| Route                       | Heading                     |
| --------------------------- | --------------------------- |
| `/applications/new`         | "Start a new application"   |
| `/applications/[id]/step/1` | "Continue your application" |

**Why:**
The original spec had a single heading for both states. When returning to an existing application the user is not starting anything new — "Continue your application" better reflects the context and avoids confusion.

---

## 2026-05-18 — Step Indicator Circle Styles Corrected (DDR-CS-004, DDR-AC-001)

**What changed:**

- `components/step-indicator.tsx`: two circle style fixes.

| State          | Was                              | Now                                       |
| -------------- | -------------------------------- | ----------------------------------------- |
| Current step   | Teal fill + persistent teal ring | Teal fill only — no ring in default state |
| Upcoming steps | Grey fill (`#E2E8F0`)            | White fill + `2px solid #E2E8F0` border   |

**Why:**
DDR-CS-004 specifies upcoming steps as white fill with grey border, not grey fill. DDR-AC-001 specifies the amber focus ring (`#D97706`) applied on `:focus-visible` only — a persistent teal ring on the current step is not part of the spec. Identified during Phase 1 spec compliance review on 2026-05-18.

---

## 2026-05-18 — Charity Profile Incomplete Banner Corrected (design-requirements.md §5.12)

**What changed:**

- `components/dashboard-empty.tsx` and `components/dashboard-populated.tsx`: charity profile incomplete banner updated to match design-requirements.md Section 5.12.

| Property   | Was                                                     | Now                                                             |
| ---------- | ------------------------------------------------------- | --------------------------------------------------------------- |
| Background | `#FEF9F5` (warm white)                                  | `#FEF3C7` (pale amber)                                          |
| Border     | `1px solid #EDE8E1` (warm border)                       | `1.5px solid #FDE68A` (amber-200)                               |
| Icon       | None                                                    | `AlertTriangle` in `#D97706`                                    |
| Text       | "Before you start, add your charity details…" `#1E293B` | "Your charity profile isn't complete yet…" `#92400E` 500 weight |
| Button     | Teal outline "Set up charity profile"                   | Amber fill "Complete your profile"                              |

**Why:**
The banner was built with warm-white styling instead of the spec'd pale amber. Identified during Phase 1 spec compliance review on 2026-05-18.

---

## 2026-05-18 — Review Prompts Moved to Step 4 Sticky Sidebar (DDR-LA-002)

**What changed:**

- `components/application-step4-draft.tsx`: content state changed from single-column to two-column layout. Main content (left, max 640px) + sticky right sidebar (280px) containing the three review prompts per DDR-LA-002 and DDR-LA-001.
- `components/application-step5-approve.tsx`: review prompts removed entirely. Step 5 is single-column per DDR-LA-001.

**Why:**
Review prompts were incorrectly placed inline at the top of Step 5 during Phase 1 implementation. DDR-LA-001 specifies single-column for Steps 1, 2, and 5, and two-column for Steps 3 and 4. DDR-LA-002 specifies the review prompts belong in a sticky right-hand sidebar on Step 4, always visible while the user edits answers. Identified during Phase 1 spec compliance review on 2026-05-18.

---

## 2026-05-18 — Step 5 Review Prompts Corrected to Exact Acceptance Criteria Wording

**What changed:**

- `components/application-step5-approve.tsx`: three review prompts replaced with exact wording from AC-FR-32-01.

| Was                                                                                  | Now                                                       |
| ------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| "Check that your answers are accurate and reflect your charity's work."              | "Does this accurately describe your charity and project?" |
| "Make sure you have answered every question the funder asked."                       | "Are all figures, dates, and facts correct?"              |
| "Read through as if you were the funder — does your application make a strong case?" | "Does this answer the question that was asked?"           |

**Why:**
Custom prompt text was written during Phase 1 implementation instead of reading AC-FR-32-01 verbatim. Identified during Phase 1 spec compliance review on 2026-05-18.

---

## 2026-05-18 — Approve Confirmation Changed from Inline Expansion to Modal Dialog

**What changed:**

- [DDR-IP-001](Business%20Design/DDR-IP-001-confirmation-pattern.md) revised: approve application confirmation changed from **Option B (inline expansion)** to **Option A (modal dialog)**.
- Confirm button text set to **"Approve my application"** (was "Yes, approve" in original spec; matches what was built in Phase 1).
- No code changes required — `components/application-step5-approve.tsx` was already built with a modal dialog.

**Why:**
The approve action is consequential — once exported, a user may have already submitted to a funder, so a duplicate submission is a real risk. An inline expansion risks being overlooked; a modal ensures the user actively acknowledges the confirmation before proceeding. This also gives the product a fully consistent pattern: every consequential action (approve, re-open, re-export warning, delete application, delete account) uses a modal or explicit confirmation.

PDR-UI-006 discourages modals for unexpected interruptions (errors). A user-initiated confirmation is not unexpected, so this does not conflict with that principle.

---

## 2026-05-18 — Step 2 Label Renamed to "Uploaded Guidelines"

**What changed:**

- [DDR-CS-004](Business%20Design/DDR-CS-004-step-indicator.md) updated: Step 2 label changed from "Funder Guidelines" to "Uploaded Guidelines".
- `components/step-indicator.tsx` updated to match.

**Why:**
During Phase 1 Static UI Shell review, the built label ("Upload Guidelines") was flagged as inconsistent with the spec ("Funder Guidelines"). Owner preference is "Uploaded Guidelines" — the past-tense phrasing better reflects that the user has already completed the upload action by the time they see it as a completed step, and is clearer to users at a glance than the more abstract "Funder Guidelines".

---

## 2026-05-17 — Observability Stack Completed

**What changed:**

- New [ADR-OPS-007](Technical%20Decision%20and%20Design/ADR-OPS-007-uptime-monitoring.md) created: uptime monitoring via UptimeRobot (free tier) + a `/api/health` endpoint.
- [ADR-OPS-005](Technical%20Decision%20and%20Design/ADR-OPS-005-error-tracking.md) updated: added cross-reference to ADR-OPS-007 for the complete observability picture.
- [ADR-INDEX](Technical%20Decision%20and%20Design/ADR-INDEX.md) updated: Operations group 6 → 7 ADRs, total 42 → 43.

**Why:**
Sentry (ADR-OPS-005) only captures errors when requests reach the application. A complete Vercel outage or failed deployment produces no Sentry events — the app would be down and silent. Without an external uptime monitor, there is no way to detect a total outage proactively, and no way to measure performance against the documented 99.5% uptime target (NFR-02).

The `/api/health` endpoint checks database connectivity, not just homepage availability — a broken Supabase connection returns a CDN-cached 200 from the homepage even while the app is functionally unusable.

**Observability stack as documented:**

| Layer               | Tool                 | Covers                                      |
| ------------------- | -------------------- | ------------------------------------------- |
| Uptime              | UptimeRobot (free)   | App reachable? DB responding?               |
| App errors          | Sentry EU            | Unhandled exceptions, AI API failures       |
| DB / Auth / Storage | Supabase dashboard   | Slow queries, auth failures, storage errors |
| Deployments         | Vercel dashboard     | Build failures, deployment status           |
| Dev debugging       | Vercel function logs | Real-time logs during development           |

**Previously:** The original design treated Vercel function logs as a dev-only complement to Sentry and did not document Supabase logs or external uptime monitoring.

---

## 2026-05-08 — Phase 0 Complete; Documentation Committed to GitHub

**What changed:**

- Project bootstrapped: Next.js 16.2.5, TypeScript, Tailwind v4, shadcn/ui 4.7.0 (14 components), lucide-react, zod.
- Design tokens confirmed: teal `#0D6E6E`, teal-light `#E6F4F4`, amber `#D97706`, success `#16A34A`, neutral-dark `#1E293B`, neutral-light `#F8FAFC`.
- Route group structure created: `(public)` and `(authenticated)` with 16 stub pages.
- All documentation (BRD, PRD, ADRs, PDRs, DRs, implementation plan, data model, personas) committed to `docs/` in this repository — GitHub is now the single source of truth for all project documentation.
- `proxy.ts` used in place of `middleware.ts` (Next.js 16 convention).
- Vercel deployment live.

**Why:**
Phase 0 establishes the technical skeleton and confirms the toolchain works before any feature development begins. Storing documentation in the repository links design decisions directly to the code that implements them.

---

## 2026-05-07 — Major Revision: AI Provider, Data Residency, and Implementation Plan

This is the most significant revision to the original design. Three decision records were formally revised and the implementation plan was finalised with 30 conflict resolutions.

---

### 1. AI Inference Layer: Anthropic Direct → Amazon Bedrock

**Original decision (2026-04-09):** Claude 3.5 Sonnet via Anthropic's direct API (US infrastructure). Required Anthropic DPA and Standard Contractual Clauses (SCCs) before launch.

**Revised decision:** Claude Sonnet 4.6 via **Amazon Bedrock, eu-west-2 (London), In-Region routing**. EU Geo fallback covers 7 EEA AWS regions. Data never leaves the EU/EEA under any operating condition.

**Why it changed:**
UK data residency is a trust and compliance requirement for charities. The Anthropic direct API processes data on US infrastructure, requiring DPA and SCCs — complex contractual arrangements that delay launch and complicate the privacy policy. Amazon Bedrock eu-west-2 provides In-Region routing at no surcharge, eliminating transatlantic data transfer entirely. The DPA/SCC requirement drops off the critical path.

The model capability and pricing are unchanged. Claude Sonnet 4.6 is the direct successor to Claude 3.5 Sonnet. Bedrock identifiers: `anthropic.claude-sonnet-4-6` (In-Region) / `eu.anthropic.claude-sonnet-4-6` (Geo EU fallback, 10% surcharge).

**References:** [DR-AI-002](decisions/DR-AI-002-ai-provider.md), [DR-DP-002](decisions/DR-DP-002-data-hosting.md), [ADR-AI-001](Technical%20Decision%20and%20Design/ADR-AI-001-ai-provider.md), [ADR-AI-002](Technical%20Decision%20and%20Design/ADR-AI-002-model-selection.md)

---

### 2. Context Window: 200,000 → 1,000,000 Tokens

**Original design:** Claude 3.5 Sonnet context window of 200,000 tokens. Soft warning triggered at 150,000 characters (ADR-AI-007). Hard truncation of documents above the threshold was in the plan.

**Revised design:** Claude Sonnet 4.6 context window of 1,000,000 tokens. Soft warning threshold set at 100,000 tokens (~400,000 characters) as a quality guidance measure only. Hard truncation removed entirely.

**Why it changed:**
The 200k window was a real engineering constraint with Claude 3.5 Sonnet — very long funder guidelines could not fit. Claude Sonnet 4.6's 1M token window makes this a non-issue. The soft warning is retained as guidance to focus on the most relevant sections of guidelines, not as a technical limit. The character threshold in ADR-AI-007 (150,000 characters) is superseded by the PRD token-based threshold (100,000 tokens).

**References:** [PDR-AI-004](PRD%20decisions/), [ADR-AI-007](Technical%20Decision%20and%20Design/ADR-AI-007-context-window-management.md)

---

### 3. Data Ownership: Contractual Mechanism Updated (Substance Unchanged)

**Original design:** Charities own all data; no AI training use ever. Enforced by Anthropic DPA.

**Revised design:** Commitment unchanged. Enforcement mechanism updated — AWS Data Processing Agreement + Anthropic model terms through Bedrock now provide the contractual guarantee. Anthropic DPA no longer required as a separate instrument.

**Why it changed:**
The shift to Bedrock changed the legal chain, not the promise. The user-facing commitment (no training, user owns data) is identical.

**References:** [DR-DP-003](decisions/DR-DP-003-data-ownership.md)

---

### 4. AWS Bedrock Spend Cap Added

**Original design:** Per-user monthly AI request limit (20 requests) as the primary cost control.

**Added:** AWS Bedrock monthly spend alert at £70 and hard cap at £100, configured in the AWS Bedrock console. This is a secondary backstop — the per-user limit remains the primary control. Estimated monthly cost at launch (~10 concurrent users): £35–£38.

**Why it changed:**
The Bedrock console provides native spend controls that were not available with the Anthropic direct API. Adding them as a backstop protects against unexpected usage spikes. Does not change user-facing behaviour.

---

### 5. Implementation Plan Finalised: 30 Specification Conflicts Resolved

During implementation planning, 30 conflicts between the BRD, PRD, ADRs, screen requirements, acceptance criteria, and data model were identified and resolved. The most significant resolutions:

| Topic                           | Original position                                   | Resolved position                                 | Authority                         |
| ------------------------------- | --------------------------------------------------- | ------------------------------------------------- | --------------------------------- |
| Route paths                     | Singular `/application/[id]` (tech-design.md)       | Plural `/applications/[id]`                       | Screen requirements               |
| Landing page                    | Separate landing + sign-in pages                    | Single `/` page combining both                    | Screen requirements               |
| Password reset                  | Two routes (`/forgot-password` + `/reset-password`) | Single route with two states                      | Screen requirements               |
| Step routing                    | IA document described in-page states                | URL-based routing (`/step/[n]`)                   | ADR-ARCH-004 (later decision)     |
| Charity profile fields          | Included income band + registered address           | Removed those fields; merged mission              | Screen requirements               |
| Dashboard AI usage              | Not in original dashboard plan                      | AI usage indicator added (`n of 20 used`)         | ADR-AI-008 consequence            |
| Document truncation             | Hard truncation above threshold                     | Soft warning only; no truncation                  | PDR-AI-004                        |
| Word export font                | Inter, teal headings (ADR-EXPORT-002)               | Calibri 11pt, no teal headings                    | PDR-DH-003 (PRD takes precedence) |
| Inactivity tracking field       | Custom `last_login_at` column                       | `auth.users.last_sign_in_at` (Supabase native)    | data-model.md                     |
| Inactivity deletion (v1 scope)  | Deferred in ADR                                     | v1 requirement                                    | PRD inputs + acceptance criteria  |
| Charity Commission API error UX | No retry mechanism in original plan                 | "Try again" button added                          | PDR-UI-006                        |
| AI persistent failure state     | Single error state                                  | Second error state after failed retry             | PDR-UI-006                        |
| Application status values       | `draft, in_progress, complete`                      | `not_started, in_progress, approved, exported`    | data-model.md                     |
| Status transition trigger       | `not_started → in_progress` on Step 1 Continue      | Transition occurs on Step 2 guideline save        | application-status-model.md       |
| Re-open approved application    | Status reverts only                                 | Status reverts + all `is_approved` reset to false | Acceptance criteria               |
| Protected routes list           | Singular paths in ADR-SEC-001                       | Plural paths matching resolved routes             | Implementation plan               |

**References:** [Implementation Plan](Implementation%20Plan/IMPLEMENTATION-PLAN.md)

---

## 2026-04-17 to 2026-04-21 — Original Architectural Decisions (ADRs)

The 42 original Architectural Decision Records were created and decided in this window. These represent the baseline design. All subsequent changes above are revisions to or additions to this baseline.

Key decisions in the original baseline:

| Area           | Decision                                                            |
| -------------- | ------------------------------------------------------------------- |
| Framework      | Next.js (App Router), TypeScript                                    |
| Database       | Supabase (PostgreSQL, eu-west-2)                                    |
| Auth           | Supabase Auth                                                       |
| Hosting        | Vercel Pro                                                          |
| UI library     | shadcn/ui on Radix UI primitives                                    |
| Error tracking | Sentry EU with PII scrubbing                                        |
| AI provider    | Anthropic direct API (later revised to Bedrock — see above)         |
| File uploads   | Signed-URL direct to Supabase Storage (bypasses Vercel 4.5MB limit) |
| Rate limiting  | Upstash Redis, 5 AI requests/60s per user                           |
| Export         | Word (.docx) via `docx` library                                     |
| AI retry logic | Exponential backoff: 2 retries, 1s then 3s delays, for 429/500/529  |
| Uptime target  | 99.5% (NFR-02)                                                      |

**References:** [ADR-INDEX](Technical%20Decision%20and%20Design/ADR-INDEX.md) — all 43 ADRs listed with status.

---

## 2026-04-09 to 2026-04-16 — Original Business and Product Decisions

The foundational business decisions (DR series) and product requirements decisions (PDR series) were made in this window. These defined the original scope and user experience. The major revision on 2026-05-07 changed the AI delivery mechanism but left all product decisions intact.

Key product decisions that are unchanged from the original:

- **Target users:** Small-to-medium UK charities; non-technical grant writers; desktop-primary.
- **Access model:** Free at launch; registered charities only; no self-serve grant discovery.
- **AI capabilities:** Funder guideline summarisation + question extraction + draft answer generation. Human review mandatory before export.
- **Monthly AI limit:** 20 requests per user, with 80% soft warning.
- **Data storage:** Charities own all data; no AI training use; 24-month inactivity deletion with 30-day warning.
- **Liability:** App is a writing aid only; user responsible for all content submitted to funders.
- **Accessibility:** WCAG 2.2 AA.
- **UK-only scope:** UK grants, UK charities, UK data residency (achieved via Bedrock revision above).

**References:** [decisions/](decisions/DECISIONS-INDEX.md), [PRD decisions](PRD%20decisions/)

---

_Last updated: 2026-05-20_
_Maintained by: Rapidglobe Ltd_
