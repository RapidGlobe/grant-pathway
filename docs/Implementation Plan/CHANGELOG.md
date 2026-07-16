# Grant Pathway — Design & Decision Changelog

**Tier:** 1 — Always check after every task
**Volatility:** High
**Update when:** Any significant design decision, deviation from plan, or architectural change

**Purpose:** This log records every significant change to the original design of Grant Pathway, together with the reason for each change. Use it to refresh context on why the design evolved, without having to re-read all the source documents.

**Authoritative sources:** When this log refers to a decision record, the full rationale lives in the linked file. This log summarises; the ADR or DR is the definitive record.

---

## 2026-07-16 — Form-aware truncation: large multi-form guideline PDFs were losing their actual application questions

WJ was live-testing Clothworkers' Foundation (Harry's Rainbow) — a scheduled ADR-AI-010 test funder whose 54-page guidance-plus-sample-forms PDF has always hit the truncation warning ("very large... reviewed the first section") — and asked directly: how many questions should this document actually produce, and can the message/process be improved rather than just accepted? Investigation confirmed the guidance was accurate but the underlying process was actively losing content: production's `PREPROCESS_CHAR_CEILING` (50,000, per this ADR's 2026-06-05 decision) truncated in raw document order, which meant a "keep the first N characters" cut systematically favoured front-loaded eligibility/overview prose over the actual Sample Small Grants Programme Application Form — landing mid-way through the form's most important narrative questions ("describe your project," "how you will raise the shortfall") on the real document.

Presented two fix options with a clear tradeoff (raise the ceiling further vs. detect-and-prioritise the real form section) and asked WJ to choose before changing a production-wide parameter; he chose the form-aware approach. **Built:** `findFormStartIndex()` (`lib/preprocess-text.ts`) scans for a strong "this is the actual sample form" heading (`SAMPLE ... APPLICATION`, falling back to `APPLICATION FORM`) — deliberately skipping numbered table-of-contents entries so an early "4. Sample Small Grants Programme Application Form" listing doesn't get mistaken for the real thing. When a form-start heading is found anywhere in a document that needs truncation, the ceiling budget is split: pre-form content is capped at 40% of the ceiling (`PREAMBLE_MAX_SHARE`) so the form section reliably gets the majority share, rather than letting a long preamble consume the whole budget before the form is ever reached. The existing marker-snap logic (drop a partial page/section entirely rather than leave it half-populated) was extracted into a reusable `snapToLastMarker()` helper and applied to both the preamble and form slices.

**A real implementation bug found and fixed during verification, not shipped as designed:** the first version only triggered the form-aware split when the form heading's offset was _beyond_ the ceiling — reproducing this exactly on the real Clothworkers PDF revealed that header/footer stripping (an earlier pipeline step) shrinks the cleaned document enough that the heading actually lands _before_ the ceiling, so the condition never fired and the plain path still cut the form short. Corrected to trigger whenever a form heading exists anywhere in a truncated document, not only when it's beyond the ceiling. Verified against the real PDF (not a synthetic fixture) both before and after this correction — confirmed broken, confirmed fixed — using a local repro script that reproduces `lib/extract-text.ts`'s exact `unpdf` extraction pipeline (no Bedrock call, so no secrets required; see `docs/PRD decisions/PDR-AI-008-governance-fact-detection-and-fallback.md`-adjacent tooling note in project memory about Bedrock calls specifically needing production logs instead).

The client-facing message (`components/application-step3-summary.tsx`) now distinguishes the two cases: when a form section was found and prioritised, the copy says so explicitly rather than the previous blanket "reviewed the first section" wording, which would have been actively misleading once truncation stopped happening in raw document order. The API response (`app/api/generate-summary/route.ts`) carries a new `formSectionPrioritized` boolean alongside the existing `guidelinesTruncated` flag.

**A second, separate bug surfaced during this investigation, not fixed here:** Clothworkers repeats the exact sentence "Please describe the difference you expect your capital project to make" identically across all three of its forms (Small Grants, Large Grants stages 1 and 2). The existing repeated-line header/footer detection (any line appearing 3+ times identically, `detectRepeatedLines`) treats this as page-header noise and strips it everywhere — including from the Small Grants form where it's a genuine, load-bearing question. Confirmed this happens regardless of truncation (reproduced with an artificially huge ceiling, no cut at all). Flagged to WJ as a distinct follow-up requiring its own fix and cross-funder validation (per this ADR's existing Consequences requirement to test any pre-processing change against all scheduled funders) — not bundled into this change.

`tsc --noEmit`, `eslint --max-warnings 0`, all 72 tests pass (4 new, covering: a SAMPLE-heading form prioritised over an earlier numbered TOC entry; the APPLICATION FORM fallback pattern; no-op when the form already fits the ceiling; plain fallback when no form heading exists at all).

**Files changed:** `lib/preprocess-text.ts`, `app/api/generate-summary/route.ts`, `components/application-step3-summary.tsx`, `__tests__/preprocess-text.test.ts`, `docs/Technical Decision and Design/ADR-AI-010-summary-performance-strategy.md`, `docs/Implementation Plan/IMPLEMENTATION-STATUS.md`.

---

## 2026-07-16 — generate-summary fix: free_form sections with no word limit crashed Step 3 deterministically

WJ was live-testing Walton Charity (a `free_form` funder) specifically to exercise the eligibility-mismatch path (Harry's Rainbow — bereavement support in Milton Keynes vs. Walton's Elmbridge-only, poverty-focused criteria) and hit "We couldn't generate your summary right now" on Step 3. He asked whether it was a Claude outage. Anthropic's status page did show a resolved "Claude Sonnet 5 errors" incident earlier that morning (08:39–08:53 UTC), which looked like a plausible match at first, but the real Vercel function logs (retrieved after installing and linking the Vercel CLI — not previously set up in this environment — `vercel logs --status-code 500`) told a different story: `stop_reason: end_turn` on every attempt, ruling out output-token truncation, and the actual failure was `[generate-summary] JSON parse/validation failed after retry`.

**Root cause:** temporary diagnostic logging (added to `route.ts`, then removed once root-caused) surfaced the exact Zod error — 4× `"Invalid input: expected number, received null"`. Claude was returning `wordLimit: null` for each of Walton's narrative sections that has no stated word limit — the same convention already used and accepted for `questions[].wordLimit`. But `aiSummarySectionSchema.wordLimit` was `z.number().optional()` (missing `.nullable()`), so every section without an explicit limit failed validation. Since this route runs at `temperature: 0` (the 2026-07-15 determinism fix), the failure was 100% reproducible on this document, not transient — no amount of "Try again" could ever have worked, and the error copy's "this is usually temporary" was actively misleading for this failure mode.

**Fix:** `aiSummarySectionSchema` (`app/api/generate-summary/route.ts`) and the `AiSummarySection` type (`lib/types.ts`) now accept `wordLimit: number | null`, matching `aiSummaryQuestionSchema`'s existing pattern. Downstream consumers (`actions/applications.ts`, `app/(authenticated)/applications/[id]/step/4/page.tsx`) already normalised with `?? null` and needed no change — only the validation boundary was wrong. Confirmed fixed by WJ's live retry: the summary generated successfully and the eligibility-mismatch result rendered exactly as expected. `tsc --noEmit`, `eslint --max-warnings 0`, all 68 tests pass.

**Tooling note:** the Vercel CLI is now installed and linked to this project (`rapidglobes-projects/grant-pathway`), so `vercel logs`/`vercel ls` are available for future investigations — this was the missing piece that made root-causing this fast rather than guesswork.

**Files changed:** `app/api/generate-summary/route.ts`, `lib/types.ts`, `docs/Implementation Plan/IMPLEMENTATION-STATUS.md`.

---

## 2026-07-15 — Step 5 assembled-draft numbering fix for governance items

WJ predicted, then live-verified, that MK Community Foundation's Sapling Grants guidelines would trigger the same 3-of-5 governance facts as Oak Grants (Reserves, bank-signatory count, bank-signatories-related) — confirming the extraction logic generalises correctly across a second programme from the same funder. But he then flagged the Step 5 "Review and approve" screen showing these items with their raw internal numbering visible: "-4. Reserves (£)", "-2. How many people are authorised as bank signatories?", "-1. Are any bank signatories related to each other or to a trustee?"

**Root cause:** governance items use a reserved negative `item_order` (-5 to -1) purely so they sort before a funder's own numbered questions — never meant to be shown to a user. Step 4's rendering already excludes this prefix for governance items, built during the PDR-AI-008 work. But `assembleAndAdvance()` (`actions/applications.ts`), which formats the Step 5 "assembled draft" independently by reading `item_order`/`item_label`/`answer_text` straight from the database, had no equivalent exclusion — it prefixes every structured-funder item with its raw `item_order` unconditionally.

**Fix:** the query now also selects `field_key`; a governance item (identified the same way Step 4 does — `field_key !== null`) renders as a plain label with no number, exactly matching Step 4's display. `tsc --noEmit` and `eslint --max-warnings 0` both clean. No test added — `assembleAndAdvance` has no existing unit coverage (heavy Supabase-client coupling, consistent with other server actions in this file) — live re-verification of the Step 5 screen is pending WJ's own testing, per this project's established pattern for AI/UI behaviour that can't be exercised from this environment.

**Files changed:** `actions/applications.ts`, `docs/Implementation Plan/IMPLEMENTATION-STATUS.md`.

---

## 2026-07-15 — Citation-highlight fix: typographic punctuation tolerance

WJ asked a direct testable question after the PDR-AI-008 build: "will the MKCF guidelines trigger a governance question?" Read the actual MK Community Foundation Oak Grants PDF and predicted 2-3 of the 5 facts would trigger (reserves policy, bank-signatory relatedness, plausibly signatory count) based on the extraction rules. WJ then live-tested it and got exactly that — 12 narrative questions + 3 governance items — confirming the detection logic works as designed. But he flagged something the prediction didn't cover: the Reserves item's citation badge linked correctly to "Page 3," but clicking it opened the viewer with no highlight and no auto-scroll, landing on Page 1.

**Root-caused with a direct database query**, not guesswork: `supabase db query --linked` against `grant-pathway-dev` to pull the actual stored `guideline_reference.quote` for the 3 governance items and the retained `application_guidelines.guideline_text` for the same application, then ran the real `findQuoteRange` matching logic against both outside the app to reproduce the failure deterministically. Found: the AI's quote read "...six months' free reserves..." (straight apostrophe, U+0027) while the source PDF's actual text reads "...six months' free reserves..." (curly/smart apostrophe, U+2019) — a single-character mismatch that defeats the literal word-for-word regex match. WJ separately confirmed the two bank-signatory items (sharing a different quote with no smart punctuation) highlighted correctly — isolating the bug to typographic punctuation variants specifically, not a broader citation-viewer regression.

**Fix:** `findQuoteRange` (`lib/guideline-citations.ts`) now treats each of three punctuation-equivalence classes as interchangeable when building its match pattern — straight/curly apostrophe (`'` / `'` / `'` / `ʼ`), straight/curly double quote (`"` / `"` / `"`), and hyphen/en-dash/em-dash (`-` / `–` / `—`). Each character in the quote is matched against its whole equivalence class in the source text, not just that literal character — but the _displayed_ highlight still slices from the original text, so the on-screen result always shows the source's real typesetting (e.g. the curly apostrophe), never a normalised version. This is a general fix, not scoped to governance facts — it benefits any funder's guidelines using proper typographic punctuation, which is common in PDFs and Word documents generated by non-technical staff.

Verified against the real retained MKCF text before and after the fix (a standalone script reproducing the exact production logic) — confirmed broken beforehand, confirmed fixed afterward, before touching the actual source file.

`tsc --noEmit`, `eslint --max-warnings 0`, all 68 tests pass (4 new — the exact live case verbatim, the symmetric curly-in-quote/straight-in-source direction, double quotes, and dashes).

**Files changed:** `lib/guideline-citations.ts`, `__tests__/guideline-citations.test.ts`, `docs/Implementation Plan/IMPLEMENTATION-STATUS.md`.

---

## 2026-07-15 — PDR-AI-008's manual-add fallback built (fast-follow)

The auto-detection half of PDR-AI-008 (previous entry) deliberately deferred the zero-signal fallback — a manual-add picker — as a separate follow-up. WJ asked for it to be built while stepping out briefly, and asked what was needed first; answered directly (the design was already agreed in the earlier conversation) and proceeded without a blocking plan-mode approval gate, since he wouldn't be present to approve one. One real judgement call was flagged rather than silently decided: how to distinguish a manually-added item from an AI-detected one with no citation, since both otherwise look identical (`guideline_reference: null`). Resolved with a new boolean column rather than overloading an existing enum.

**The mechanism:** a quiet link below the Step 4 question list — "Need to add something about your finances or governance that wasn't asked above? Add it." — appears only when at least one of the 5 governance facts isn't already shown, and disappears entirely once all 5 are present. Clicking it reveals checkboxes for just the missing facts, each carrying a plain-English explanation (`GOVERNANCE_FIELD_EXPLANATIONS`, `lib/governance-items.ts`) rather than a bare label — a novice user (Persona 1, Margaret) shouldn't have to already know what "bank signatory relatedness" means to decide whether it applies to her.

**Data:** new `application_items.added_manually` boolean column (migration `20260715000001`), `false` by default. A new server action `addManualGovernanceItems` (`actions/applications.ts`) creates the selected rows via `resolveGovernanceInserts()` with `added_manually: true`, scoped to the closed 5-field vocabulary only — any value outside `GOVERNANCE_FIELD_KEYS` is silently rejected server-side, not just hidden client-side.

**A real bug caught before it shipped:** the existing orphan-cleanup logic only treats a governance item's `item_order` as "in the summary" when the AI currently detects it. A manually-added item is never AI-detected by definition, so without a fix, the very next Step 4 sync (e.g. simply reloading the page) would have deleted an unanswered manually-added item as "orphaned." Fixed by folding any existing row's `added_manually` item_order into the same `summaryOrders` set used for narrative orphan-checking — a manually-added item now survives regardless of what any given extraction pass does or doesn't detect, exactly as intended.

**Rendering:** a manually-added item shows a small "Added by you" badge in place of a citation badge — honest about where the question came from, matching the UX design discussed earlier the same day. On successful add, the client does a hard page reload rather than reconciling local state — consistent with this codebase's existing "mutate then hard-refresh" pattern (`setDraftInProgress`'s own caller), and avoids duplicating the server's sort/guidance/citation logic on the client for what is a rare-use feature.

`tsc --noEmit`, `eslint --max-warnings 0`, all 64 tests pass (4 new — explanation-map coverage and `added_manually` default/override behaviour). Migration applied to `grant-pathway-dev` only (`supabase migration list`, 24/24 matched before and after); `grant-pathway-prod` confirmed still unlinked (`supabase projects list`).

**Files changed:** `supabase/migrations/20260715000001_governance_manual_add.sql` (new), `lib/database.types.ts`, `lib/governance-items.ts`, `actions/applications.ts`, `app/(authenticated)/applications/[id]/step/4/page.tsx`, `components/application-step4-draft.tsx`, `__tests__/governance-items.test.ts`, `docs/PRD decisions/PDR-AI-008-governance-fact-detection-and-fallback.md`, `docs/PRD decisions/PRD-DECISIONS-INDEX.md`, `docs/data-model.md` (v1.13), `docs/PRD-Grant-Pathway.md` (v0.51), `docs/PRD inputs/acceptance-criteria.md` (new AC-FR-12A-04).

---

## 2026-07-15 — PDR-AI-008 built: governance facts now guideline-driven, superseding the always-on block

WJ's live testing of the always-on 5-item "Governance and reserves" block (built earlier the same day, commit `82e11d9`, currency-formatted in `7e68c9a`) found it disjointed from the rest of Step 4 — no citation, no funder-specific rationale, shown regardless of whether the funder cares. Decided (`docs/PRD decisions/PDR-AI-008-governance-fact-detection-and-fallback.md`) and built the same day.

**The mechanism:** a new `"governanceFacts"` array joins `questions`/`sections` in the AI JSON schema (`lib/prompts.ts`), Zod-validated and citation-reconciled in `app/api/generate-summary/route.ts` through the exact same `extractValidMarkers`/`validateCitation` pipeline already used for narrative items — no new citation machinery. The key design choice: this array's extraction bar is deliberately **lower** than "questions" — a general eligibility or policy statement counts, not just a discrete question — and citation stays optional (an entry with `citation: null` is still shown, exactly like narrative questions/sections already behave). This is what delivers WJ's "auto-show on any signal" decision without needing a separate relaxed-citation tier.

**What creates the rows:** `lib/governance-items.ts` gained `resolveGovernanceInserts()` — given whichever facts the AI detected this time, it looks up `item_type`/`item_label`/`item_order`/`is_budget_question` from the fixed `GOVERNANCE_ITEMS` table (still never trusted from the AI — only _whether_ a row exists at all is now guideline-driven) and dedupes by `field_key`. Both sync paths (`setDraftInProgress`, Step 4's fallback sync) now call this conditionally, replacing the unconditional "always upsert all 5" block from this morning.

**Orphan cleanup simplified, not special-cased:** `isOrphanedItem()`'s `field_key` carve-out — needed this morning because governance items were never part of the AI's own numbering — is gone. A detected fact's reserved `item_order` now folds into the same `summaryOrders` set the narrative sync already builds, so a governance item whose fact the extraction no longer raises is cleaned up exactly like a dropped narrative question: deleted if unanswered, kept if already answered. This is a genuine simplification, not just new capability — one fewer special case in the codebase than this morning's build had.

**Rendering:** the dedicated "Governance and reserves" section heading in `components/application-step4-draft.tsx` is removed entirely (confirmed with WJ: blend in, no special framing) — a shown item now renders as an ordinary-looking card at its reserved sort position, picking up the same citation badge every other item gets automatically once `guideline_reference` is populated. The AI's extracted wording is surfaced through the existing `guidance` text slot (previously free_form-sections-only) instead of a removed heading's blurb — loosened that render condition to also cover governance items regardless of funder type or budget-question status.

**Deliberately not built this round:** a manual-add picker for the zero-signal case (WJ confirmed: auto-detection first, manual-add as a separate fast-follow — see `PDR-AI-008` for the full reasoning about why a self-serve relevance picker would ask a novice user, Persona 1 Margaret, to make a judgement call her persona says she can't reliably make).

`tsc --noEmit`, `eslint --max-warnings 0`, all 60 tests pass (2 tests removed — they asserted the exact carve-out being retired — 5 new tests added, 3 for `resolveGovernanceInserts`, 2 for the simplified `isOrphanedItem`). No DB migration — `field_key`/`guideline_reference` already existed from this morning's build.

**Files changed:** `lib/types.ts`, `lib/prompts.ts`, `lib/governance-items.ts`, `app/api/generate-summary/route.ts`, `actions/applications.ts`, `app/(authenticated)/applications/[id]/step/4/page.tsx`, `components/application-step4-draft.tsx`, `__tests__/governance-items.test.ts`, `docs/Technical Decision and Design/ADR-DATA-006-application-item-graph-model.md`, `docs/PRD decisions/PDR-AI-008-governance-fact-detection-and-fallback.md`, `docs/PRD decisions/PRD-DECISIONS-INDEX.md`, `docs/data-model.md` (v1.12), `docs/PRD-Grant-Pathway.md` (v0.50), `docs/PRD inputs/acceptance-criteria.md`.

---

## 2026-07-15 — DR-FD-001 v1.4: curated funder picker/directory removed, free-text field restored

WJ questioned whether Step 1's "Who is offering this grant?" searchable picker was still needed, six weeks after it was introduced (DR-FD-001, 2026-06-01). Investigation found the 2026-07-11 amendment relaxing the picker to a free-text fallback had never actually been built — it existed only inside the decision record, with no corresponding task in `IMPLEMENTATION-PLAN.md`'s tracked list.

**Decision: go further than finishing that fallback — remove the picker/directory entirely.** With Step 3/4/5 processing already known (per the same 2026-07-11 amendment) to be driven per-application by the uploaded guidelines rather than by funder identity, a curated directory no longer serves the purpose it was built for. `Who is offering this grant?` is a plain free-text field again.

**Dependency sweep before touching anything** (WJ was explicit he didn't want something else to silently break): grepped every reference to `funder_id`/`funders`/`FunderOption` across the codebase. Contained to three files: `actions/applications.ts` (`getActiveFunders()` deleted; `saveApplicationStep1()` loses its `funderId` param), `components/application-step1-form.tsx` (whole picker/dropdown/keyboard-nav/mailto-link UI replaced with a plain text input), and the Step 1 server page (stops fetching the funder list). No test file referenced any of it.

**The one real compatibility question:** P6.5's "start from your last application to [Funder]" (`getPreviousApplicationForFunder`) matched "same funder" by exact `funder_id` equality. With no stable funder identity left, it now matches a trimmed, case-insensitive `funder_name` comparison instead (Postgres `ILIKE`, with `%`/`_`/`\` escaped so a funder name containing one of those characters literally isn't treated as a wildcard). Agreed with WJ as a deliberate soft-miss trade-off: typing a funder's name slightly differently between two applications means the reuse prompt just won't offer itself — it will never wrongly match two different funders' data together.

**Left alone, on purpose:** the `funders` table and `applications.funder_id` column — same low-priority-cleanup treatment already given to the table's own dormant `funder_type` column, rather than an urgent drop migration. No database migration in this change at all.

`tsc --noEmit`, `eslint --max-warnings 0`, all 55 tests pass.

**Files changed:** `actions/applications.ts`, `components/application-step1-form.tsx`, `app/(authenticated)/applications/[id]/step/1/page.tsx`, `docs/decisions/DR-FD-001-funder-directory-model.md` (v1.4), `docs/decisions/DECISIONS-INDEX.md`, `docs/PRD-Grant-Pathway.md` (v0.49), `docs/PRD inputs/acceptance-criteria.md` (FR-15), `docs/moscow-feature-register.md` (v1.17), `docs/data-model.md` (v1.11).

---

## 2026-07-15 — PDR-AI-008: governance-facts placement to be reworked via guideline-driven extraction

Following the £-formatting fix (next entry below), WJ's live testing prompted a bigger rethink: the fixed 5-item "Governance and reserves" block (built earlier the same day, previous entry) felt disjointed from the rest of Step 4 — no citation badge, no funder-specific rationale, shown unconditionally regardless of whether a given funder cares about any of it.

**Decision (full record: `docs/PRD decisions/PDR-AI-008-governance-fact-detection-and-fallback.md`):** fold these 5 facts into the same guideline-driven extraction pipeline that already produces ordinary narrative questions with citations — shown only when a funder's guidelines actually raise the topic, not unconditionally on every application.

**The key nuance, worth preserving:** the natural instinct was to require a precise, quotable citation before showing an item, with a self-serve "tick whichever of these applies" picker as the fallback for anything less precise. WJ pushed back once the conversation reached `docs/user-personas-journeys-and-use-cases.md`'s Persona 1, Margaret — no fundraising training, finds funder language confusing, already unsure whether her answers address what the funder asked. A picker that asks her to judge relevance herself just relocates the guesswork, it doesn't remove it. Also explicitly rejected: proactively suggesting a governance fact to a novice user when the AI has no signal at all — WJ's judgement was that this could make things worse for Margaret, not better, by introducing a decision point instead of removing one.

**Landed on instead:** auto-show a governance item whenever the AI has _any_ signal at all, even an imprecise, unlocalised one — so a novice user is never shown a gap she's expected to notice and fill herself. The manual-add picker (plain-English explanations, not jargon labels) stays available to everyone but is designed as a rare shortcut for a more experienced user (Persona 2, David) who might know a funder-specific quirk the guidelines don't spell out — not the primary safety net.

**Status: decided, not built.** This supersedes the "placement only, always show all 5 unconditionally" scope agreed earlier the same day (see the entry below) — that build stands as shipped and working, but its unconditional-display design will be reworked once this is scheduled.

---

## 2026-07-15 — Governance Step 4 items: £ fields reformatted to UK currency style

During his live verification pass of the governance-items redesign (previous entry below), WJ confirmed the 5 items render correctly at the top of Step 4, then asked for the two £ fields (total annual expenditure, reserves) to display in UK currency format — "£ n,nnn,nnn" — rather than a plain unformatted number input.

**Fix:** `components/application-step4-draft.tsx` splits the governance number-input branch in two: the two budget fields (`is_budget_question: true`) now render a text input with a fixed "£" affix and live UK thousands-separator formatting (`toLocaleString('en-GB')`) via a new `formatThousands()` helper; the bank-signatory count field (not a budget question) keeps the original plain number input, unaffected. The underlying stored `answer_text` stays raw digits (formatting is display-only, applied on render and stripped again on input) — no change to what's saved, so `saveAnswer`, Step 5 export, and the DB column are all unaffected.

`tsc --noEmit`, `eslint --max-warnings 0`, all 55 tests pass. `docs/PRD-Grant-Pathway.md` (v0.48) Step 4 Q&A table row corrected to describe the three number-field input types precisely instead of grouping them all as "plain number input".

**Files changed:** `components/application-step4-draft.tsx`, `docs/PRD-Grant-Pathway.md` (v0.48).

---

## 2026-07-15 — Governance/reserves facts re-sited from `charity_profiles` into `application_items`

WJ asked why the 5 governance/reserves facts (P6.1, 2026-07-05) lived on the charity profile page rather than at Step 3 or Step 4. Investigation found they were never actually consumed anywhere — not by Step 3's summary/eligibility logic, not by P6.5's clone — so `/profile`'s own copy ("helps flag issues before you apply") was untrue.

**Decision: Option C — re-site into the item-graph, not Step 3 or a hybrid.** The schema already had dormant scaffolding that looked purpose-built for exactly this: `item_type` values `data`/`number` and a `source_of_truth = 'charity_profile'` enum value, both defined by P6.2 but never populated. Chosen over keeping them at profile level (never wired up, no reuse of the citation/approval machinery every other item already has) and over building AI-driven per-funder relevance detection immediately (bigger scope, not asked for this round).

**Scope, confirmed with WJ:**

- Placement only, this round — all 5 items always shown, every application, matching today's behaviour. No AI relevance/citation detection yet; deferred.
- `/profile`'s governance section and the 5 `charity_profiles` columns retired outright. No backfill — this is dev/test data, and the new design has no per-charity "current value" store to backfill into anyway.
- **No seeding between applications, including P6.5 reuse.** WJ was explicit: carrying forward financial/governance figures silently risks stale data. Every application collects these 5 facts fresh, every time — no exception for the "start from your last application" reuse flow.

**Implementation:** new `application_items.field_key` column (CHECK-constrained to the 5 known values) identifies these rows robustly, independent of `item_label` wording. Reserved negative `item_order` (-5 to -1) sorts them first without touching the existing AI-driven narrative numbering. Created via the same dual sync path every other item already uses (`setDraftInProgress`, Step 4's fallback sync) — a third upsert block runs unconditionally in both, `answer_text` deliberately omitted so a fresh row inserts blank and an already-answered row is never clobbered on repeat syncs. `answer_text` stores the literal display value as plain text (not a coded enum), so `saveAnswer`/`approveAnswer` and the Step 5 export needed zero changes — only the Step 4 input widget is type-aware (a number input, or a Yes/No/Not sure yet select, instead of a textarea). P6.5's clone explicitly filters out `field_key IS NOT NULL` rows so reuse never carries these forward either. Item labels end in "(optional)" deliberately, reusing Step 4's existing optional-question gate with no code change to that logic.

Also fixed in passing: the Step 4 orphan-cleanup filter (deletes unanswered rows the AI summary no longer mentions) was duplicated identically in two branches — extracted into a single tested `isOrphanedItem()` helper, which also had to learn to never treat a governance item as orphaned regardless of the current AI summary's numbering.

`tsc --noEmit`, `eslint --max-warnings 0`, all 55 tests pass (9 new). Migration applied to `grant-pathway-dev` only (confirmed via `supabase migration list` before/after — 22/22, then 23/23); `grant-pathway-prod` remains unlinked. Live browser verification pending WJ.

**Files changed:** `supabase/migrations/20260715000000_governance_items_move_to_item_graph.sql`, `lib/governance-items.ts` (new), `lib/database.types.ts`, `actions/applications.ts`, `actions/charity.ts`, `app/(authenticated)/applications/[id]/step/4/page.tsx`, `components/application-step4-draft.tsx`, `components/charity-profile-form.tsx`, `__tests__/governance-items.test.ts` (new), `docs/data-model.md` (v1.10), `IMPLEMENTATION-STATUS.md`.

---

## 2026-07-15 — Step 3 extraction pinned to `temperature: 0`; anti-merge rule added

Ad-hoc E2E testing found a regression: MK Community Foundation — Oak Grants extracted 10 questions on a brand-new test run, down from the 12 confirmed correct the day before (2026-07-14 P6.3 live-test). `git log` and a same-code-path check ("Regenerate summary" vs. a first-time upload) ruled out a code change or stale cache — the guideline text and route were identical between runs.

**Root cause:** the Step 3 Bedrock call (`app/api/generate-summary/route.ts`) never set a `temperature`, leaving the model at its non-zero API default — the same input text can legitimately produce different extraction output, including a different question count, on separate calls. This had never been decided or documented anywhere (`ADR-AI-004`, the prompt-construction ADR, said nothing about temperature). Separately, `lib/prompts.ts`'s extraction rules only forbade merging questions _across_ multiple application forms — nothing stopped the model merging two adjacent, related-but-distinct questions _within_ one form, which is the specific pair (existing funding secured / fundraising plans) that went missing.

**Fixed:** `temperature: 0` pinned on the Step 3 summary call only — this is a structured-extraction task (pull out what's literally stated), not creative generation, so determinism is the correct behaviour. `/api/refine-answer` (rewording a user's own answer) is a different, more variation-tolerant task and was deliberately left unchanged. The extraction prompt gained an explicit instruction alongside the existing cross-form rule: never merge two distinct questions into one, even when adjacent or thematically related, even within the same form.

This is a general reliability fix, not specific to one funder — any funder's guidelines could in principle have hit the same non-deterministic merging behaviour.

`tsc --noEmit` and `eslint --max-warnings 0` both clean. No schema change.

**Live-verified by WJ the same day:** re-ran "Regenerate summary" three times on MK Community Foundation — Oak Grants — all three runs consistently returned 12 questions. Separately, a fresh funder (MK Community Foundation — Sapling Grants) was spot-checked: Claude's manual read of the PDF (applying the same extraction rules) predicted 6 narrative questions; the live app returned exactly 6.

**Files changed:** `app/api/generate-summary/route.ts`, `lib/prompts.ts`, `IMPLEMENTATION-STATUS.md`, `ADR-AI-004-prompt-construction.md`.

---

## 2026-07-14 — P6.6 (Transparency Status) retired, will not be built

P6.6 was designed to show a per-funder trust badge (fully supported / partially supported / guidance-only / unreviewed), keyed to whether a human curator had reviewed and approved a playbook for that funder. P6.5's pivot earlier today to private, per-charity reuse removed that basis entirely — no curator role exists or is planned. Rather than invent a substitute signal (extraction/citation quality, structured-vs-free-text parsing were both considered), WJ confirmed retiring the task: with no curation step anywhere in the product, every funder is in the identical state, so there is nothing left for a "trust tier" to differentiate.

**Effect on the launch gate:** the Phase 6 → Go-Live Gate now requires P6.1–P6.5 complete (was P6.1–P6.6). Phase 6's tracked task count drops from 8 to 7.

**Files changed:** `IMPLEMENTATION-PLAN.md` (v3.15), `IMPLEMENTATION-STATUS.md`, `ADR-DATA-006-application-item-graph-model.md` (new amendment), `ADR-TRACEABILITY.md` (v2.12), `docs/v1-out-of-scope.md`, `docs/constraints-and-assumptions.md`, `docs/BRD plus decisions Mark Two/build-plan-any-guideline-or-form.md`.

---

## 2026-07-14 — P6.5 live-tested: two small UI tweaks

WJ live-tested P6.5 against MK Community Foundation — Oak Grants immediately after it shipped. The reuse choice, Step 2 skip, and carried-over citation/badge all worked correctly on the first try — no functional bugs found this time. Two presentation tweaks requested: the page citation badge now reads "Page N of the guidelines" (was just "Page N"); the "Carried over — please review" badge is now bold and larger, to draw more attention to the fact it needs a second look. `tsc --noEmit`, `eslint --max-warnings 0`, all 46 tests pass.

**Files changed:** `components/application-step4-draft.tsx`.

---

## 2026-07-14 — P6.5 built: private per-charity reuse, not the originally-designed shared "playbook"

**A design pivot made live, during the walkthrough, not discovered after building the wrong thing.** P6.5 had been scoped since 2026-07-05 as "Playbook Infrastructure and Curation Workflow" — a versioned, human-reviewed record per funder, approved once by a curator, reused by every charity applying to that funder. Before writing any migration, WJ asked directly: why shouldn't a charity applicant be their own curator? Working through it surfaced the real justification for a _shared_ playbook — reliability for every future applicant, not just whoever curated it first — and that a charity reviewing their own past application has no reason to notice extraction mistakes that don't affect them personally, which a shared record would then silently trust for every unrelated applicant afterwards. That risk doesn't exist if reuse is private to one charity's own account.

**What's built instead:** when a charity starts a new application for a funder they've already reached Step 4 with before, Step 1 offers an explicit choice — "Start fresh" or "Start from your last application to [Funder]." Choosing reuse carries across, entirely within that one account: the question list (`application_items`, including their own previous answers, `is_approved` reset to `false`), the retained guideline text (`application_guidelines`, a full independent copy), and the AI summary (`applications.ai_summary`, so Step 4's prep checklist isn't blank). Step 2 (guideline upload) is skipped entirely; the new application lands on Step 3 with the carried-over summary already showing. Carried-over answers are marked with a "Carried over — please review" badge on Step 4, reusing the citation-badge visual style.

**Schema footprint: one nullable column, not a new table.** `application_items.cloned_from_application_id` (self-referencing FK to `applications`, `ON DELETE SET NULL`, migration `20260714000002`) records which prior application a row was cloned from. `ON DELETE SET NULL` rather than `CASCADE` was deliberate — deleting the source application must not delete the clone, only forget where it came from. Verified by direct SQL round-trip against `grant-pathway-dev`: cloned answer text and citation carried across correctly, `is_approved` reset, and deleting the source application left the clone fully intact with `cloned_from_application_id` nulled.

**Two follow-on effects surfaced and tracked, not silently absorbed:**

1. **P6.6 (transparency status) needs re-design.** It was scoped to derive its per-funder support-status signal from "the approved playbook" — that concept no longer exists. `IMPLEMENTATION-PLAN.md`'s P6.6 section now states this is an open design question, not yet resolved, and must be answered before that task starts.
2. **The rubric-criteria table moved from P6.5 to P6.7.** WJ was explicit that this must not just quietly disappear as a passing mention inside P6.7's open-ended "ongoing" framing — so it's now a named, findable line item there, plus a dedicated `ADR-TRACEABILITY.md` row (⚠️ tracked, tied to `ADR-DATA-006`'s rubric-criterion-link field), plus a memory entry, as three independent tripwires against it being missed.

**Documentation:** `ADR-DATA-006` and `ADR-DATA-007` both amended the same day with the full design history (superseding, not deleting, their original playbook-based text — the original reasoning is kept as historical record per this project's "corrections are dated notes, not silent rewrites" convention). `BRD-Grant-Pathway.md` (v0.51), `PRD-Grant-Pathway.md` (v0.46), `acceptance-criteria.md`, `technical-design.md` (v1.16), and `data-model.md` (v1.9) all corrected to match — every prior reference to a curator-approved, cross-charity playbook was either struck through with the real behaviour alongside it, or marked permanently superseded rather than left as a stale "not yet built" pointer.

**Verification:** `tsc --noEmit`, `eslint --max-warnings 0`, all 46 Vitest tests pass, plus the SQL round-trip above. Live browser verification pending WJ.

**Files changed:** `supabase/migrations/20260714000002_p6_5_reuse_previous_application.sql`, `lib/database.types.ts`, `actions/applications.ts`, `components/application-step1-form.tsx`, `components/application-step4-draft.tsx`, `app/(authenticated)/applications/[id]/step/4/page.tsx`.

---

## 2026-07-14 — P6.4 live-testing bug fix: quote highlighting didn't survive PDF line-wraps

Found live-testing P6.4 minutes after it shipped: WJ opened the "view original guidelines" panel and it showed the top of page 1 instead of jumping to and highlighting the cited quote on page 5. The badge and panel both opened correctly — only the highlight/scroll silently failed.

**Root cause:** the retained text preserves the PDF's own line-wrapping, so a sentence that wraps mid-line becomes `"...this project\nwill address..."` in the stored text, while the AI's quote (a clean sentence) has `"...this project will address..."` — an ordinary space where the source has a newline. `GuidelineTextPanel`'s exact `text.indexOf(quote)` match failed silently and fell back to its "no highlight" degradation path (which was working exactly as designed — the bug was that this fallback triggered far more often than expected, not that the fallback itself misbehaved).

**Fix:** replaced the exact-substring match with a new `findQuoteRange()` (`lib/guideline-citations.ts`) that matches the quote's words in order joined by `\s+`, so any run of whitespace in the source — space, newline, multiple spaces — satisfies a single space in the quote. Moved out of the component and into the shared citation-logic module so it's unit-testable without a DOM environment (this codebase's test setup is Node-only, no jsdom/React Testing Library).

**Verification:** 6 new Vitest tests (`__tests__/guideline-citations.test.ts`), including one that reproduces the exact reported bug verbatim (the real newline-vs-space case), plus multiple/irregular whitespace, no-match, empty-quote, and regex-special-character-in-quote cases (e.g. "£5,001 - £15,000 (20% match required)"). `tsc --noEmit`, `eslint --max-warnings 0`, all 46 tests pass.

**Files changed:** `lib/guideline-citations.ts`, `components/application-step4-draft.tsx`, `__tests__/guideline-citations.test.ts`.

---

## 2026-07-14 — P6.4 built (first milestone): Step 4 shows citations, plus a live-verification finding

**P6.3 live-verified first.** Before starting P6.4, WJ regenerated the Step 3 summary for the real MK Community Foundation — Oak Grants test application (re-supplying the guidelines after a session reset). Checked the result against the actual PDF: the AI found 12 questions where the previous, pre-`P6.3` baseline (recorded in the test plan, 2026-07-03) had only 10. Questions 1–10 matched verbatim; questions 11–12 are genuine, verbatim page-5 questions about additional funding and fundraising plans — both correctly flagged as budget questions, both citing real page 5 content, and both filling a gap the original test-plan baseline had explicitly noted as missing ("no dedicated match-funding question found"). **Conclusion: a correct improvement, not a regression** — `P6.3`'s citation validation works end to end against a real Bedrock call, which local automated tests alone couldn't prove (no real AWS credentials in this environment). **Follow-up agreed, not yet done:** the MK Community Foundation test plan and the user guide need refreshing to reflect the corrected 12-question baseline.

**Then P6.4 built.** Step 4 now shows a small clickable badge next to any question with a validated citation (e.g. "Page 5"), opening a "view original guidelines" panel that highlights the cited quote in the retained text (`application_guidelines`, GAP-33) and auto-scrolls to it.

**Design correction made before writing any UI code:** `ADR-SEC-004`, `ADR-DATA-007`, and `ADR-OPS-006` all assumed this viewer would fetch the raw PDF and render it to a `<canvas>` (pdf.js-style) — a reasonable assumption in July when it was written, but one that stopped being true the moment GAP-33's fix confirmed only _text_ is ever retained, never the raw file. Corrected all three the same day: no PDF-rendering library, no CSP change (`ADR-SEC-004`'s `worker-src 'self' blob:` consequence removed — nothing loads a rendering web worker), no novel accessibility surface (`ADR-OPS-006`'s three-item checklist reduced to two — a text panel is natively screen-reader-accessible, unlike a canvas).

**Implementation:** `app/(authenticated)/applications/[id]/step/4/page.tsx` now selects `guideline_reference` (written by `P6.3`, never read back until now) and fetches `application_guidelines.guideline_text`. `components/application-step4-draft.tsx` gained the citation badge, a single reused `Dialog` (the existing `components/ui/dialog.tsx` Base UI primitive, already used for the senior-review and timeout-warning modals — no new dependency), and a `GuidelineTextPanel` helper that finds the cited quote in the retained text and highlights it — degrading gracefully to "shown but not highlighted" if the quote isn't found verbatim (citations are validated against real page/section markers, not a verbatim-substring guarantee).

**Scope confirmed with WJ before coding:** "walk the graph respecting visibility conditions" is a no-op this pass — nothing produces a branching or non-narrative item yet, so there's no graph-walking logic to actually build. Adding it now would be speculative, against this project's established practice.

**Verification:** `tsc --noEmit`, `eslint --max-warnings 0`, all 40 Vitest tests pass. Live browser verification is pending WJ, same pattern as `P6.2a`/`P6.3`.

**Files changed:** `app/(authenticated)/applications/[id]/step/4/page.tsx`, `components/application-step4-draft.tsx`, `docs/Technical Decision and Design/ADR-SEC-004-http-security-headers.md`, `docs/Technical Decision and Design/ADR-DATA-007-guideline-source-reference-mechanism.md`, `docs/Technical Decision and Design/ADR-OPS-006-accessibility-testing.md`, `docs/Implementation Plan/IMPLEMENTATION-PLAN.md` (v3.14), `docs/Implementation Plan/IMPLEMENTATION-STATUS.md`, `docs/Implementation Plan/ADR-TRACEABILITY.md` (v2.10), `docs/Technical Decision and Design/technical-design.md` (v1.15).

---

## 2026-07-14 — GAP-33 fixed: guideline-text retention built

New `application_guidelines` table (migration `20260714000001`) stores `guideline_text` — the marker-tagged text sent to the AI and validated against for citations (`P6.3`'s `textForPrompt`) — one row per application, upserted in `/api/generate-summary` alongside the existing `ai_summary` save. Not the raw uploaded file, which `ADR-DATA-002`/`ADR-FILE-001` never retain.

**Schema:** `id`, `application_id` (FK → `applications`, unique, cascade-deletes), `user_id` (FK → `auth.users`, cascade-deletes, denormalised for RLS same as `application_items`), `guideline_text`, `created_at`, `updated_at`. RLS restricted to own rows on all four operations, same hardened `(select auth.uid())` form as every other user-scoped table.

**Verification:** since this environment has no real AWS credentials, a live Bedrock-triggered write couldn't be tested end to end. Instead, verified by direct SQL round-trip against a real test application: insert, confirm `created_at` stays fixed while `updated_at` bumps on a second upsert (proving the regeneration-refresh path), then clean up. RLS policies confirmed present and correctly scoped via `pg_policies`. `tsc --noEmit`, `eslint --max-warnings 0`, all 40 Vitest tests pass.

**Also updated:** `app/api/account/delete/route.ts` now deletes `application_guidelines` explicitly alongside `application_items`, matching that route's existing explicit-deletion convention (the FK's `on delete cascade` would cover it regardless, but consistency with the documented pattern was judged worth the extra step).

**New gap found, not fixed:** GAP-34 (Low priority) — Step 2/3's "guidelines are not saved" UI copy is now stale, since retention exists server-side (invisible to the user — nothing surfaces it yet, that's `P6.4`). Left for a separate, smaller pass rather than widening this fix's scope.

**Files changed:** `supabase/migrations/20260714000001_gap33_application_guidelines.sql` (new), `lib/database.types.ts`, `app/api/generate-summary/route.ts`, `app/api/account/delete/route.ts`, `docs/data-model.md` (v1.8), `docs/Technical Decision and Design/technical-design.md` (v1.14), `docs/Implementation Plan/IMPLEMENTATION-PLAN.md` (v3.13), `docs/Implementation Plan/IMPLEMENTATION-STATUS.md`, `docs/Implementation Plan/ADR-TRACEABILITY.md` (v2.9).

---

## 2026-07-14 — GAP-33 found while scoping P6.4: guideline-text retention was never actually built

Before writing any P6.4 code, checked what its "view original guidelines" panel would actually have to render — and found nothing to render. The raw guideline file is deleted from Storage immediately after Step 2 extraction (`ADR-FILE-001`), and the extracted text only ever lives in the browser's `sessionStorage`, cleared the moment the AI summary saves (`lib/guidelines-session.ts`, `ADR-FILE-004`). Neither is retained in Postgres — only a small citation (`application_items.guideline_reference`, built in `P6.2`) is.

`ADR-DATA-002`'s 2026-07-10 reversal decided guideline text _should_ be retained precisely so a citation has something to point at. `ADR-TRACEABILITY.md` carried a task pointer for this — "P6.2a (groundwork) → P6.2 (storage)" — but that pointer was written the same day as the reversal, before `P6.2`'s real task list existed. When `P6.2`'s actual bullets were written (2026-07-13) and built (2026-07-14), they only covered the item-graph and citation-shape half; "store the guideline text itself" was never added to any task, by anyone, at any point. The pointer just sat there unreconciled.

**This is a planning-process gap, not a defect in P6.2's own build.** WJ asked directly whether P6.2 had been built incorrectly — it hadn't: P6.2 was built completely and correctly against what it actually promised (a typed item-graph with a citation-shape column), which is exactly what was verified, tested, and live-tested with zero regressions. The missing piece is a different, larger feature (full guideline-text retention) that a forward-looking ADR note gestured at but no task ever formally picked up.

**Fixed today:** the vague `ADR-TRACEABILITY.md` pointer replaced with a properly registered gap — **⚠️ GAP-33** (High priority, in the Gaps register) — plus two adjacent rows whose "unchanged until P6.2a/P6.2 ship" wording was now stale (both have shipped, without touching this).

**Left deliberately unfixed for now:** `ADR-SEC-004`'s consequence note for the P6.4 viewer says it can "fetch the file as bytes" from Storage — which contradicts `ADR-DATA-002`'s "no raw file ever stored" decision. Correcting that wording is deferred until GAP-33's actual fix is decided, so it's corrected once rather than twice.

**P6.4 is now blocked** on deciding how to plug GAP-33 — a design conversation with WJ is in progress before any P6.4 code is written.

**Files changed:** `docs/Implementation Plan/ADR-TRACEABILITY.md` (v2.8), `docs/Implementation Plan/IMPLEMENTATION-STATUS.md`.

---

## 2026-07-14 — P6.3 built (first milestone): extraction now records citations, not just questions

Built the third part of `ADR-DATA-007` Option B: extraction cites a specific chunk of `P6.2a`'s tagged text for each question/section, rather than free-typing a page number. Scope confirmed with WJ before coding: questions/sections only this pass (the ones feeding `application_items`) — not the Step 3 summary bullets, which have no database column to store a citation in yet and nothing displays any citation regardless (that's `P6.4`).

**Prompt (`lib/prompts.ts`):** `buildSummaryPrompt`'s JSON schema gained an optional `citation` field per question/section — `source_type` ('page'/'heading'), `page_number`, `heading_path`, `quote` — matching the shape agreed with WJ on 2026-07-13. Explicit instruction: omit the citation entirely rather than guess if no `[PAGE N]`/`[SECTION: ...]` marker clearly applies.

**Validation (`lib/guideline-citations.ts`, new):** a citation is never trusted purely on the AI's word. `extractValidMarkers()` reads the real markers out of the text the AI was actually given; `validateCitation()` cross-checks the AI's reported citation against them and returns null if it doesn't check out (wrong page number, non-existent heading path, or an empty quote) — a fake or mismatched citation is dropped, not treated as a reason to fail or retry the whole response. If over half of what the AI offered for a document turns out invalid, a warning is logged (visible in error-monitoring only) as a signal worth checking, without blocking the user — threshold agreed with WJ. `toGuidelineReferenceColumn()` converts a validated citation into the exact JSONB shape `application_items.guideline_reference`'s `P6.2` CHECK constraint requires: the unused key (`page_number` or `heading_path`) must be an **absent object key**, not a `null` value, since the constraint tests key presence via the `?` operator, not value.

**Wiring:** `app/api/generate-summary/route.ts` reconciles citations once, after either the first-attempt or retry-attempt JSON parse succeeds, against `textForPrompt` (post-truncation — the same text the AI saw). Both `application_items` write points (`actions/applications.ts`'s `setDraftInProgress`, and Step 4's page-load sync fallback) now pass the validated citation into `guideline_reference`. No other field or item-type change — `item_type`/`source_of_truth` stay hardcoded `'narrative'`/`'user_input'` exactly as in `P6.2`.

**Design walkthrough:** presented item-by-item to WJ in plain language, as with `P6.2a`. One real decision point (silently drop an invalid citation vs. reject/retry the whole AI response) resolved in favour of dropping — a missing citation is a minor, invisible gap since nothing renders citations yet. A follow-up question (what threshold should trigger a warning) settled at >50% invalid.

**Verification:** `tsc --noEmit`, `eslint --max-warnings 0`, `prettier --check` all clean. 11 new Vitest tests (`__tests__/guideline-citations.test.ts`, 40/40 total passing) cover marker extraction, valid/invalid page and heading citations (including a citation pointing at a real-looking but non-existent page/heading — the hallucination-guard case), empty-quote rejection, and the key-omission behaviour required by the CHECK constraint. **Live verification limitation:** this local environment has no real AWS credentials configured (`.env.local`'s `AWS_ACCESS_KEY_ID` is an empty placeholder) — a real Bedrock call against the actual MK Community Foundation guideline PDF could not be made from here. "No information loss versus the current prompt" and citation accuracy against real content are confirmed by code review and unit tests only; live browser verification through Step 2/3 against the real PDF is still pending WJ, same pattern as `P6.2a`.

**Files changed:** `lib/prompts.ts`, `lib/types.ts`, `lib/guideline-citations.ts` (new), `app/api/generate-summary/route.ts`, `actions/applications.ts`, `app/(authenticated)/applications/[id]/step/4/page.tsx`, `__tests__/guideline-citations.test.ts` (new), `docs/Implementation Plan/IMPLEMENTATION-PLAN.md` (v3.12), `docs/Implementation Plan/IMPLEMENTATION-STATUS.md`, `docs/Implementation Plan/ADR-TRACEABILITY.md` (v2.7), `docs/Technical Decision and Design/technical-design.md` (v1.13).

---

## 2026-07-14 — P6.2a built: guideline extraction now tags structure instead of discarding it

Built the groundwork task from `ADR-DATA-007` Option B ("the text itself carries verifiable structure — e.g. `[PAGE 3]` markers") — extraction preserves page (PDF) or heading (docx, pasted text) boundaries so a future citation can only ever point at a chunk of text that structurally exists in the source, rather than a free-typed guess. This is groundwork only: nothing consumes the markers yet, that's `P6.3`.

**PDF (`lib/extract-text.ts`):** `unpdf` switched from `mergePages: true` (all pages flattened into one string, page boundaries lost) to per-page extraction, rejoined with a `[PAGE N]` marker before each page's text.

**Docx (`lib/extract-text.ts`):** switched from `mammoth.extractRawText` (plain text, headings discarded) to `mammoth.convertToHtml`, which preserves Word's heading styles as `<h1>`–`<h6>` tags. A new helper walks the HTML tracking a heading-level stack and emits `[SECTION: A > B]` markers preserving the full nesting trail — docx has no fixed pages, so headings are the fallback reference unit per the task spec.

**Pasted text (`lib/preprocess-text.ts`):** no file means no source of structure at all, so a new heuristic reuses the numbered ("1. Title"/"2.3 Section") and ALL-CAPS heading detection already in this file (previously only used to bound boilerplate-stripping) to insert the same `[SECTION: ...]` markers — numbered headings nest by depth, ALL-CAPS headings reset to top-level. Explicitly a guess, not a guarantee: text with no heading-like lines gets no markers. Skipped entirely if the text already carries markers from `extract-text.ts`.

**Marker protection (`lib/preprocess-text.ts`):** the existing page-number/repeated-line/boilerplate-heading stripping steps are all now marker-aware — a `[PAGE N]`/`[SECTION: ...]` line is never treated as noise.

**ADR consequence gap found and closed:** `ADR-DATA-007`'s consequences section names an `ADR-AI-007` follow-on that was not one of `IMPLEMENTATION-PLAN.md`'s three listed P6.2a bullets — the character-ceiling truncation safety net needs to become marker-aware, snapping to the last complete marker before the ceiling rather than the last newline, so a page/section that would be cut off is dropped in its entirety rather than left half-populated with no citation to anchor to. Added as a fourth step per AGENTS.md's mandatory ADR consequences check. The ceiling _value_ (20,000 chars dev / 50,000 prod) is unchanged — confirmed with WJ this fixes only where the cut lands, not how much is cut.

**Design walkthrough:** presented item-by-item to WJ in plain, jargon-free language (re-explained after an initial pass used too much technical shorthand) before any code was written — each item confirmed as information-only except the truncation fix, which WJ explicitly approved.

**Verification:** `tsc --noEmit`, `eslint --max-warnings 0`, `prettier --check` all clean. 7 new Vitest tests added (`__tests__/preprocess-text.test.ts`, 29/29 total passing) covering marker protection, pasted-text nesting including the ALL-CAPS reset case, no-double-tagging of already-marked text, and marker-aware truncation including the no-marker-in-range fallback. Live browser testing of an actual PDF/docx upload through Step 2 was not performed by Claude — per this project's convention, that is WJ's live-testing pass, not a substitute automated check.

**Files changed:** `lib/extract-text.ts`, `lib/preprocess-text.ts`, `__tests__/preprocess-text.test.ts` (new), `docs/Implementation Plan/IMPLEMENTATION-PLAN.md` (v3.11), `docs/Implementation Plan/IMPLEMENTATION-STATUS.md`, `docs/Implementation Plan/ADR-TRACEABILITY.md` (v2.6), `docs/Technical Decision and Design/technical-design.md` (v1.12).

---

## 2026-07-14 — P6.2 built: application_answers → application_items (item-graph model, compatibility mode)

Built the typed item-graph schema decided in `ADR-DATA-006` and `ADR-DATA-007`, replacing `application_answers` outright rather than extending it (migration `20260714000000`, `grant-pathway-dev` only — `grant-pathway-prod` stays untouched and unlinked until P5.4). Compatibility mode: only `item_type = 'narrative'` is populated — the new schema's other nine item types (`data`, `date`, `number`, `table`, `file`, `consent`, `eligibility_gate`, `scoring_criterion`, `manual_action`) exist in the enum but are not yet produced by any code path; that is P6.3 onward, funder by funder.

**Schema:** `question_text`/`question_order` renamed to `item_label`/`item_order`. New columns: `item_type`, `visibility_condition`, `source_of_truth`, `validation_mode`, `rubric_criterion_link` (no FK yet — the rubric table doesn't exist until P6.5), `decision_maker_visible`, `output_mode`, `guideline_reference`. Two decisions enforced at the database layer rather than left to application-code convention: `output_mode` is `CHECK`-constrained to `generic_export` only (`native_template_fill` is permanently out of scope per ADR-DATA-006's 2026-07-11 amendment — this makes that boundary real, not just documented), and `guideline_reference` is `CHECK`-constrained to ADR-DATA-007's discriminated-union shape (`source_type` XOR `page_number`/`heading_path`, `quote` always required when present).

**Migration approach:** new table created, all 169 existing rows copied across as `item_type = 'narrative'` with zero information loss (verified by direct query — all 10 items of the MK Community Foundation — Oak Grants test application, "Community Mental Health Drop-In Programme 2026–27 - Retest 040726", intact: labels, order, approval state, answer source), old table dropped. Chosen over an in-place `ALTER TABLE` rename because the shape change is large enough that a side-by-side compare-then-drop is safer than reshaping in place, and this is dev-only so there's no data-preservation cost to the cleaner approach. `funders.funder_type` also dropped in the same migration — ADR-DATA-006 consequence 5, formally superseding DR-FD-001 rather than leaving the column as unused cleanup.

**Live-tested by WJ same day, two passes:** (1) re-opened the application — Step 4 correctly showed all 10 items with their original labels and answers, and `is_approved` correctly reset to `false` on every row (the `reopen_application` RPC repointed at `application_items`, working as intended). This caught a documentation error in this entry's first draft, which had misquoted the item count as 13 — a conflation with the unrelated "13/13 test cases" figure from this funder's `TEST-DASHBOARD.md` test plan, not the actual `application_items` row count. Corrected here. (2) Full end-to-end write path exercised: edited and saved an answer (`saveAnswer`), approved all 10 individually and the whole application (`approveAnswer`, `approve_application` RPC), passed the senior-review gate, assembled the draft, and exported to Word — output document correctly showed the edited answer and all 10 numbered Q&A pairs. This satisfies P6.2's exit criterion in full ("proven end to end — extraction, storage, Step 4 rendering, export — with zero regression"), not just the read/re-open path.

**Blast radius:** the `approve_application`/`reopen_application` Postgres RPCs and seven application code files (`actions/applications.ts`, both Step 4/5 pages, the export/refine-answer/account-delete/cron-inactivity-deletion routes) all had to be repointed at the new table/columns in the same change, plus `supabase/seed.sql`. `tsc --noEmit`, `eslint --max-warnings 0`, and all 22 Vitest tests pass clean.

**Files changed:** `supabase/migrations/20260714000000_p6_2_application_item_graph.sql` (new), `supabase/seed.sql`, `lib/database.types.ts`, `actions/applications.ts`, `app/(authenticated)/applications/[id]/step/4/page.tsx`, `app/(authenticated)/applications/[id]/step/5/page.tsx`, `app/api/export/[applicationId]/route.ts`, `app/api/refine-answer/route.ts`, `app/api/account/delete/route.ts`, `app/api/cron/inactivity-deletion/route.ts`, `components/application-step4-prep-checklist.tsx`, `docs/data-model.md` (v1.7), `docs/Implementation Plan/IMPLEMENTATION-PLAN.md` (v3.10), `docs/Implementation Plan/IMPLEMENTATION-STATUS.md`.

---

## 2026-07-13 — P6.2 environment scoping confirmed: dev only

Confirmed with WJ rather than assumed: P6.2 follows the same convention as P6.1 — applied only to `grant-pathway-dev`, with `grant-pathway-prod` untouched and unlinked until P5.4. Worth an explicit confirmation rather than inheriting the P6.1 precedent silently, since P6.2's migration is far larger in scope (it supersedes `application_answers` entirely, rather than adding five nullable columns) — the blast radius of getting this assumption wrong would be much bigger than it was for P6.1.

This was the last of three prerequisites identified before P6.2 build could start: test funder (Oak Grants, v3.7), citation-field shape (v3.8), and this scoping decision (v3.9). All three are now settled.

**Files changed:** `docs/Implementation Plan/IMPLEMENTATION-PLAN.md` (v3.9), `docs/Implementation Plan/IMPLEMENTATION-STATUS.md`.

---

## 2026-07-13 — P6.2 guideline-reference field shape agreed with WJ

The task list previously described the citation field vaguely ("page number or section/heading") with no concrete data shape — writing a migration against that wording would have meant guessing, with a real risk of a schema rewrite once P6.2a's actual output was known. Presented as a visual mockup (two worked examples — a PDF page-anchored citation from Idlewild Trust, a docx heading-anchored citation from Henry Smith Foundation — each shown as it would render in the app, plus the underlying data shape) rather than raw JSON, since a plain-text schema proposal isn't a format WJ can evaluate directly. Approved as proposed, with the caveat that live testing will be the real confirmation once built.

**Shape:** a discriminated union — `source_type: 'page' | 'heading'`, `page_number` (page citations only), `heading_path: string[]` (heading citations only, an array to preserve nesting), `quote` (short verbatim excerpt, always present regardless of source type — what the P6.4 "view original guidelines" panel highlights, and a second, human-checkable guarantee against a hallucinated citation).

**Files changed:** `docs/Technical Decision and Design/ADR-DATA-007-guideline-source-reference-mechanism.md`, `docs/Implementation Plan/IMPLEMENTATION-PLAN.md` (v3.8), `docs/Implementation Plan/IMPLEMENTATION-STATUS.md`.

---

## 2026-07-13 — P6.2 test funder chosen: MK Community Foundation — Oak Grants

P6.2's exit criterion requires proving the item-graph migration "end to end... with zero regression" against an existing funder, which needs a baseline result that's actually trustworthy today. Oak Grants is the only funder at 🟢 on `docs/Test Plans/TEST-DASHBOARD.md` — fully re-verified against the current schema (13/13 test cases, 2026-07-04). Every other funder is 🔁 (passed, but predates the 2026-07-01 schema fix) or 🟡 (untested), which would mean re-establishing a baseline before P6.2 work could even start. Checked Oak Grants' own test plan for entanglement with the parked Group Profile Score (R16, MK Community Foundation's own cross-application scoring criterion) — none found, so this stays within compatibility-mode scope.

**Files changed:** `docs/Implementation Plan/IMPLEMENTATION-PLAN.md` (v3.7), `docs/Implementation Plan/IMPLEMENTATION-STATUS.md`.

---

## 2026-07-13 — Phase 6 plan audit: P6.6/FR-46 conflict reconciled, three uncovered ADR consequences added, cross-check safeguard added to AGENTS.md

A full audit of the Phase 6 plan (`IMPLEMENTATION-PLAN.md`) against the BRD, PRD, `acceptance-criteria.md`, `technical-design.md`, and `technology-stack.md` found P6.6 (Transparency Status) specified a support-status field "per funder/playbook," surfaced in the Step 1 picker — the same funder-identity-scoped premise that FR-46 (three-tier funder coverage badge) was withdrawn for on 2026-07-11, six days after `ADR-DATA-006` first specified P6.6. Neither document had been cross-checked against the other at the time.

**Root cause:** the FR-46 withdrawal was reasoned entirely within `moscow-feature-register.md`/`v1-out-of-scope.md`, with no step requiring a check of the live Phase 6 task list for the same underlying concept.

**Fixed:** P6.6 reworded so status is explicitly scoped to the approved _playbook_ (pinned to a specific curated guideline version), not to the funder as a standalone identity — a funder with no matching approved playbook falls back to unreviewed/live-extraction status. `ADR-DATA-006` and `v1-out-of-scope.md` both updated with matching reconciliation notes.

**Also fixed during the same audit (three ADR consequences that had no covering task):** P6.2 gained an explicit bullet to drop the unused `funders.funder_type` column (`ADR-DATA-006` consequence 5) and to name the `scoring criterion` item type as R16's resolution mechanism; P6.5 gained an explicit `funder_note` field on the playbook (R17's disclosure mechanism, already documented in `clean-slate-design-proposal.md` but not named in the task list).

**Process change:** AGENTS.md's Tier 2 rule for `moscow-feature-register.md` now requires grepping the live Phase 6 task list for the same concept before closing out a withdrawal or promotion, so this failure mode does not recur.

**Files changed:** `docs/Implementation Plan/IMPLEMENTATION-PLAN.md` (v3.6), `docs/Implementation Plan/IMPLEMENTATION-STATUS.md`, `docs/Technical Decision and Design/ADR-DATA-006-application-item-graph-model.md`, `docs/v1-out-of-scope.md`, `AGENTS.md`.

---

## 2026-07-13 — Date display made consistent (zero-padded day) across dashboard, Step 5, and export

Surfaced during the `PRD-Grant-Pathway.md` Section 7 (Screen Specifications) review, Screen 5 (Dashboard): the doc's own "Last updated [DD Month YYYY]" wording implies a zero-padded day, but `components/dashboard-populated.tsx`'s `formatDate()` and `components/application-step5-approve.tsx`'s `formatExportDate()` both used `day: 'numeric'` (e.g. "3 July 2026"), while the exported Word/text document's own date formatter (`app/api/export/[applicationId]/route.ts`) used `day: '2-digit'` (e.g. "03 July 2026"). WJ asked for all three to be made consistent. Changed both UI-side formatters to `day: '2-digit'` to match the export route, rather than the reverse, since the documentation's own "DD" convention already implied zero-padding.

**Files changed:** `components/dashboard-populated.tsx`, `components/application-step5-approve.tsx`, `docs/PRD-Grant-Pathway.md`.

---

## 2026-07-13 — Dashboard `mismatch` status now counted; "View" renamed to "Re-open"; re-open wording reconciled

Surfaced during a full section-by-section review of `docs/PRD inputs/acceptance-criteria.md` against live code (Section 9.3, Application Management).

**Dashboard summary strip didn't count `mismatch` applications.** `applications.status` has five values (`not_started`, `in_progress`, `approved`, `exported`, `mismatch` — the last set by FR-47's eligibility hard stop), but `components/dashboard-populated.tsx`'s summary strip only tallied four. A mismatched application still appeared as a card and counted toward the total shown, but was invisible in the breakdown — so the four numbers didn't sum to the total whenever a mismatch application existed. WJ decided `mismatch` should get its own fifth count so the numbers tally. Added `mismatch` to the `counts` object and a fifth "[n] ineligible" segment to the summary strip.

**"View" button relabelled to "Re-open."** The button shown on `approved`/`exported` cards was labelled "View" but is not read-only — clicking it opens a confirmation modal and, on confirm, reverts status to `in_progress`, resets `draft_status`, clears the assembled draft, and un-approves every answer. Renamed to "Re-open" to match what the confirmation modal, its own button, and the underlying `reopenApplication()`/`reopen_application` RPC already call it.

**Re-open confirmation wording reconciled.** Two different UI entry points for the same re-open action (the dashboard card's modal and Step 5's own "Re-open application to make changes" dialog) had slightly different confirmation text. Standardised both on: "Re-opening this application will remove your approval. You will need to review and approve your answers again before you can export."

**`acceptance-criteria.md` corrected to match** across Sections 9.3, 9.6, 9.7, and 9.9 (multiple other pre-existing wording/behaviour mismatches also found and corrected in that same pass — see the document's own revision note for the full list).

**Files changed:** `components/dashboard-populated.tsx`, `components/application-step5-approve.tsx`, `docs/PRD inputs/acceptance-criteria.md`, `actions/auth.ts` and `app/auth/callback/route.ts` (unrelated stale D-012 comments corrected in the same session — see below).

---

## 2026-07-13 — Stale D-012 code comments corrected to describe the shipped auto-submit behaviour

Two comments (`actions/auth.ts`'s `confirmEmail()`, `app/auth/callback/route.ts`) still described D-012's fix as requiring "an explicit button click" on the email-confirmation page. That described an earlier version of the fix; the shipped behaviour (`components/confirm-email-form.tsx`) auto-submits via a `useEffect` on mount with no visible button at all, relying on the fact that Gmail's link-scanner fetches the raw page over HTTP and never executes JavaScript. Found during the same acceptance-criteria.md review (FR-03 check) — `acceptance-criteria.md` itself already correctly described the real behaviour; only these two code comments were stale.

**Files changed:** `actions/auth.ts`, `app/auth/callback/route.ts`.

---

## 2026-07-10 — Stale "Generate your draft" copy corrected to "Write your answers"

The dashboard empty-state three-step explainer (`components/dashboard-empty.tsx`) still labelled Step 3 "Generate your draft," a holdover from the auto-generation model abandoned in the 2026-05-28 Step 4 redesign (`PRD-Grant-Pathway.md` Section 6.6): the app no longer auto-generates a draft, the charity writes every answer, and AI only assists on request via "Help me improve this." The same stale phrase had propagated into six other documents that were never updated when that redesign shipped.

Relabelled to "Write your answers" (paired description where one accompanies the label: "You write every answer — AI can help if you ask") in the component and in `PRD-Grant-Pathway.md` (bumped to v0.18), `screen-requirements.md`, `IMPLEMENTATION-PLAN.md`, `PDR-UI-005-dashboard-design.md`, `DDR-CS-006-empty-state.md`, `design-requirements.md`, and `Business Design/mockup.html`.

**Files changed:** `components/dashboard-empty.tsx`, `docs/PRD-Grant-Pathway.md`, `docs/PRD inputs/screen-requirements.md`, `docs/Implementation Plan/IMPLEMENTATION-PLAN.md`, `docs/PRD decisions/PDR-UI-005-dashboard-design.md`, `docs/Business Design/DDR-CS-006-empty-state.md`, `docs/Business Design/design-requirements.md`, `docs/Business Design/mockup.html`.

---

## 2026-07-10 — `supportingDocuments` surfaced on the Step 4 preparation checklist

A code review found the Step 3 AI summary prompt (`lib/prompts.ts`, `buildSummaryPrompt`) extracts a `supportingDocuments` field (list of document categories the funder requires) on every summarisation call, typed and Zod-validated, but never rendered anywhere — unlike `funderAiPolicy`, which has an explicit "deliberately not displayed" comment, this field had no such comment and looked like dead extraction work.

Presented WJ two options — display it on Step 3, or remove it from the prompt to cut extraction scope — and while investigating found a third: Step 4 already shows a hardcoded, generic "Before you begin writing" preparation checklist (`components/application-step4-prep-checklist.tsx`, S6.4) with the same four items for every funder. WJ chose to merge the extracted list into that screen instead, as a second, funder-specific checklist shown alongside (not replacing) the standing one — see `PDR-UI-007`.

`app/(authenticated)/applications/[id]/step/4/page.tsx` now parses `ai_summary` before the `draft_status === 'not_started'` branch (previously parsed later, only for question sync) and passes `funderName` + `supportingDocuments` into `ApplicationStep4PrepChecklist`. The component renders the extracted list under "[Funder name] also asks you to submit:" only when non-empty; the four hardcoded financial-prep items are unchanged. `tsc --noEmit` and `eslint` both clean; not yet verified in a live browser session (reaching this screen requires a real AI summarisation call against monthly quota, so left for WJ's own testing per the project's usual verification approach for this app).

**Files changed:** `app/(authenticated)/applications/[id]/step/4/page.tsx`, `components/application-step4-prep-checklist.tsx`, `docs/PRD decisions/PDR-UI-007-supporting-documents-checklist.md` (new), `docs/PRD decisions/PRD-DECISIONS-INDEX.md`, `docs/PRD inputs/acceptance-criteria.md` (new AC-FR-28-09), `docs/PRD inputs/screen-requirements.md` (new "Step 4 — Preparation Checklist" section — this screen had no prior entry in this doc).

---

## 2026-07-10 — Dead code removed: `buildDraftPrompt`

`PRD-Grant-Pathway.md` v0.4 (Section 10.2) had confirmed `lib/prompts.ts`'s `buildDraftPrompt` function had zero callers anywhere in the codebase, since its presumed caller, the `/api/generate-draft` route, was deleted 2026-07-01 — but flagged the removal as a separate follow-up rather than fixing it in that pass. This closes that follow-up.

Removed `buildDraftPrompt` and the `ApplicationQuestion` type (used only by it) from `lib/prompts.ts`, and the three dedicated tests (`buildDraftPrompt — XML fencing` describe block and its import) from `__tests__/prompts.test.ts`. Re-confirmed zero remaining references via a full-codebase grep before removing. `tsc --noEmit`, `eslint . --max-warnings 0`, and the full Vitest suite (22 tests, 4 files) all pass clean afterward. `lib/prompts.ts` now exports exactly the two prompt builders live routes actually use: `buildSummaryPrompt` and `buildRefinePrompt`.

**Files changed:** `lib/prompts.ts`, `__tests__/prompts.test.ts`, `docs/PRD-Grant-Pathway.md` (bumped to v0.5 — Section 10.2 updated, revision history row added).

---

## 2026-07-10 — Open source vs. closed source conflict found and reversed: closed source confirmed

A review surfaced a standing conflict between two decision records dated eight days apart in April: `DR-BM-003` (2026-04-09) decided Grant Pathway would be fully open source under the MIT Licence, reasoning that the succession plan (`DR-BM-002`) depended on public hosting and that there was "no commercial value to protect." `ADR-STACK-005` (2026-04-17) decided the opposite — private GitHub repository, proprietary licence, all rights reserved — with no note linking it to or reversing `DR-BM-003`. The live repository has in fact been private with no licence file throughout, matching `ADR-STACK-005`, but several other docs (this codebase's own README, Terms of Service, business overview, constraints register, technology stack) still described the open-source position as current.

WJ decided closed source is correct going forward, for four reasons: (1) the "no commercial value to protect" premise doesn't hold — the AI prompt engineering (`lib/prompts.ts`) and the item-graph/playbook curation design (Phase 6, `ADR-DATA-006`) are genuinely differentiated, hard-won product work worth protecting; (2) the two options aren't symmetrically reversible — closed → open is trivial to decide later, open → closed is not, since public code can be cloned, forked, or mirrored and never fully retracted, so the reversible option is the sound default; (3) free-to-charities (C5) and closed source aren't in tension — C5 governs what charities pay to use the app, not who can see the source code; (4) the succession plan's actual continuity goal doesn't require public code specifically — `DR-BM-002` already listed escrow with a sector body (Option C) and a named co-maintainer (Option B) as alternatives that achieve the same goal without giving up IP protection.

**Files changed:** `DR-BM-003` — original Decision/Options/Rationale preserved unchanged as the historical record; a dated reversal note added at the top, frontmatter gains `superseded_by: ADR-STACK-005`. `DR-BM-002` — Decision and Rationale rewritten to adopt Option C (escrow with a named sector body or trusted third party, activated on a defined trigger) as the succession mechanism, with Option D (defined sunset process) unchanged as last-resort fallback; a "Change from Previous Decision" note added; frontmatter gains `supersedes: 2026-04-09 decision`. `ADR-STACK-005` — brief note added confirming it was actively reconsidered and reaffirmed 2026-07-10, not silently left alone; no content change. `constraints-and-assumptions.md` — C17 and C18 descriptions corrected to proprietary licence / private repository / escrow-based continuity (Ref numbers unchanged). `business-overview.md` and `docs/overview/business-overview.md` (stale duplicate copy) — "the code is open source" line corrected. `technology-stack.md` — TS-10 and Stack Summary corrected to private repository, proprietary licence; bumped to v1.5. `DECISIONS-INDEX.md` — `DR-BM-003` and `DR-BM-002` status changed to Revised, new Revision History row added; total Decided/Revised counts updated.

**Also corrected in the same sweep** (docs and repo root describing Grant Pathway's own codebase, not a third-party open-source dependency): `README.md` (top-line description and Licence section), `docs/legal/terms-of-service.md` Section 8 (Intellectual Property — bumped to v1.3), `docs/non-functional-requirements.md` and `docs/PRD-Grant-Pathway.md` (secrets-management rows referencing "public repository"), `docs/Implementation Plan/IMPLEMENTATION-PLAN.md` P0.1 (GitHub setup step), `docs/decisions/DR-BM-001-who-builds.md` (dated note — its stated intention to transition toward open-sourcing the codebase no longer holds), `docs/Technical Decision and Design/ADR-DATA-004-database-migrations.md` (rationale no longer ties local-dev onboarding to open source specifically).

**Not regenerated:** `Grant-Pathway-Business-Overview.docx` is now out of sync with the corrected `business-overview.md` and needs regenerating via the docx skill — deliberately left as a separate follow-up task pending review of these `.md` changes. **Not yet resolved:** `DR-BM-002`'s updated decision names escrow with "a named sector body or trusted third party" but no specific organisation has been identified yet — this was already an open action under the original decision and remains open under the new mechanism.

---

## 2026-07-10 — Guideline source-reference feature blended into Phase 6 (planning only)

Design discussion on adding page/section citations to the Phase 3 (AI Summary) and Phase 4 (Draft Answers) screens — so a user can cross-reference the AI's output against their own copy of the funder guidelines, and get reassurance that no section was dropped — considered three options: (1) a simple free-text page/section label attached to each summary bullet, generated and discarded at summary time; (2) chunk-anchored citations (guidelines pre-split into numbered chunks; the model cites a chunk ID rather than free-typing a number) plus a clickable "view original guidelines" panel that jumps to and highlights the source; (3) full document retention with a viewer but no structural citation guarantee. Recommended option 2, since a chunk ID the model must select from a known list can't be hallucinated the way a free-typed page number can, and the same chunking also enables an automated check that every guideline section got cited by something.

Initial analysis assumed `ADR-DATA-002` ("guidelines are never stored") still applied and estimated a ~2–3 week standalone build. Re-examining under the assumption that constraint didn't exist, and separately checking the actual Phase 6 plan, found option 2 would touch the exact same surface Phase 6 (P6.2–P6.5) is already rewriting: the data model (`application_answers` → item-graph), the extraction prompt (`lib/prompts.ts`), and Step 4 rendering. Building it as a standalone track ahead of Phase 6 would mean building it twice — once now against the current flat schema, again once P6.2's item-graph model lands. WJ decided to fold it into Phase 6 as one blended plan instead of running two separate ones.

**`IMPLEMENTATION-PLAN.md` (bumped to v3.2) and `IMPLEMENTATION-STATUS.md`** updated: added a new groundwork task **P6.2a** (preserve PDF page boundaries during extraction, currently flattened; stop `lib/preprocess-text.ts` stripping page-number markers; docx/pasted guidelines fall back to heading/section structure) — independent of P6.1 and P6.2, can start immediately. Added bullets to the existing tasks rather than new phase numbers: **P6.2** gains a guideline-reference field on each item in the new schema; **P6.3**'s extraction rewrite also records which page/section each item was drawn from, citing a chunk rather than free-typing a number; **P6.4**'s Step 4 rework shows the reference and adds the "view original guidelines" panel; **P6.5**'s human playbook review also confirms or corrects the reference once per funder, rather than trusting a fresh AI guess on every application.

Planning only — no code changed. No ADR or PDR written yet for the citation mechanism itself; worth adding one when P6.2/P6.3 build actually starts, per the ADR consequences check.

## 2026-07-05 — P6.1 complete: charity profile governance and reserves fields

First implementation work on Phase 6. Added `total_expenditure`, `reserves`, `trustees_related`, `bank_signatory_count`, and `bank_signatories_related` to `charity_profiles` (migration `20260705000000`), extended `actions/charity.ts` and the profile-setup form, and surfaced a live "months of reserve cover" ratio (`reserves ÷ (total_expenditure ÷ 12)`) once both figures are entered — closing R13 (Walton, MK Community Foundation) for the profile side. Scoped deliberately minimally, per WJ's decision, to only what R13 needs — not the rest of the documented-but-never-built "thick profile" fields already sitting in `data-model.md` (address/contact, remaining financial fields, supporting-doc status), which is a separate, pre-existing gap left untouched here. Applied to `grant-pathway-dev` only; `grant-pathway-prod` remains unlinked and untouched, consistent with prod not being re-entered until P5.4. All five new fields are nullable and optional — existing profiles and the rest of the product are unaffected. Verified via `tsc --noEmit`, `eslint`, the full Vitest suite, and `next build`, all clean; not yet verified in a live browser session.

## 2026-07-05 — Launch gated on Phase 6; target date no longer 31 July 2026

Same day ADR-DATA-006 was decided and Phase 6 was first added to `IMPLEMENTATION-PLAN.md` as a non-gating parallel track, WJ revised that framing: **Phase 6 (P6.1–P6.6) must now be complete before Grant Pathway launches.** Reasoning: launching on the current flat, narrative-only model while knowingly aware of R1–R20 — in particular, that non-narrative fields are currently silently invisible to the user, who finishes the Step 4 writing flow believing the form is complete when it may not be — risks the "trusted partner" objective established earlier in the day more than a later launch does. There is no commercial deadline forcing 31 July 2026 and no customers waiting; the cost of waiting is acceptable, the cost of a trust failure at launch is not.

Added a **Phase 6 → Go-Live Gate** to `IMPLEMENTATION-PLAN.md`, immediately before P5.6 (DNS and Go-Live) — mirroring the existing Phase 3→4 and Phase 4→5 gate pattern. Requires P5.1–P5.5 (the existing pre-launch checklist, unaffected and free to proceed independently) and P6.1–P6.6 complete. P6.7 (the ongoing funder-by-funder capability extension) is explicitly excepted — it has no completion state by design and does not block launch, nor do the two parked items (native-document output, R16).

**Target launch changed from 31 July 2026 to "not committed — working estimate August–September 2026"** everywhere it was recorded: `IMPLEMENTATION-PLAN.md`, `IMPLEMENTATION-STATUS.md`, `docs/constraints-and-assumptions.md` (C2), `docs/PRD-Grant-Pathway.md`. `ADR-DATA-006` and `docs/BRD plus decisions Mark Two/build-plan-any-guideline-or-form.md` amended with same-day notes recording the reversal, rather than silently edited, so the record shows what was actually decided and when it changed.

**Direction given:** work begins on P6.1 (profile schema extension) immediately — tonight or 2026-07-06.

## 2026-07-05 — ADR-DATA-006 decided: Application Item-Graph Model

Formalises the recommendation from a day-long design exercise: a review of nine funders' actual guidance and application materials (`docs/BRD plus decisions Mark Two/question-coverage-analysis.md`) found the flat, narrative-only `application_answers` model (ADR-DATA-001) false in twenty distinct, recurring ways (R1–R20) — mixes of narrative and non-narrative fields, branching and multi-stage forms, published scoring rubrics, sensitive-data handling, at least four budget shapes, guidance split across documents, hard-vs-judgement rules, funder-native output requirements, manual actions Grant Pathway can never complete, guidance with no form to extract at all, and items of unequal importance to an actual decision-maker, among others.

Four architectural options were considered (`docs/BRD plus decisions Mark Two/clean-slate-design-proposal.md` §5): a universal typed item-graph, bolt-on modules added piecemeal to the existing core, AI-drafted/human-reviewed playbooks per funder, and a declared scope boundary that simply excludes unsupported funders. **Decision: a combination — the item-graph as the data model, populated the playbook way, with the scope-boundary transparency principle applied unconditionally on top.** Bolt-on modules were explicitly rejected as the default failure mode this decision is meant to avoid repeating — it is, functionally, what BD-03/BD-04/BD-07 already were, and BD-08 already had to retire one of them (the funder-type badge) once it collided with a case it wasn't built for.

The recommendation was stress-tested against two further funders (Garfield Weston, Heritage Fund) after being drafted, specifically to check whether it would hold or need revision. It absorbed both with incremental additions (R18–R20) rather than a rewrite.

**Formally recorded as `ADR-DATA-006-application-item-graph-model.md`**, superseding `application_answers`' structure (ADR-DATA-001) in part and formally retiring the unused `funders.funder_type` column (DR-FD-001) rather than leaving it as low-priority cleanup. This is a decision, not an implementation — nothing in production changes as a result. Phased build sequencing is recorded separately in `docs/BRD plus decisions Mark Two/build-plan-any-guideline-or-form.md`; R16 (scoring criteria driven by cross-application funder history) is explicitly parked pending a separate decision on whether to reverse BD-06.

## 2026-07-05 — Established git version-tagging convention; tagged v0.2.0 baseline before the any-guideline-or-form rearchitecture

Following a design proposal (`docs/BRD plus decisions Mark Two/clean-slate-design-proposal.md`) and build plan (`docs/BRD plus decisions Mark Two/build-plan-any-guideline-or-form.md`) for a significant rearchitecture of guideline/application handling, decided to mark the pre-rearchitecture state in git history before Phase 1 of the build plan begins.

Checked `IMPLEMENTATION-PLAN.md` P5.4 (GAP-12) first, which already specifies a `git tag` step for the go-live commit — found it used two-part `v1.0`, inconsistent with the three-part semver `package.json` requires. Amended GAP-12 to `v1.0.0` and added a note establishing that pre-launch checkpoints use `v0.x.x` tags (no stability guarantee, standard semver meaning of a `0.x` major version), so the full tag history stays in one consistent format from now through go-live.

**Actioned:** `package.json` version bumped `0.1.0` → `0.2.0`; commit tagged `v0.2.0` and pushed; GitHub Release created linking the analysis, proposal, and build plan documents. The next `package.json` bump, to `0.3.0`, will mark the start of Phase 1 of the build plan.

## 2026-07-04 — DR-FD-001 amended: retired the funder picker's "Structured"/"Narrative" badge

Traced during a deep review of the funder-type/question-type terminology prompted by IT-CW-08 (Clothworkers testing). The Step 1 funder picker showed a "Structured" or "Narrative" pill badge next to each funder name, sourced from a `funder_type` column on the `funders` table. Reviewing the real guideline documents in `docs/Grant Org Guidelines/` (22 files, ~15 funders/programmes) found this label doesn't reflect a stable property of the funder: several funders with multiple documents (Henry Smith, Idlewild) have _both_ a discrete-question application form (structured) and free-form background guidance (narrative) — the "same" funder produces both, depending on which document happens to be uploaded in a given session.

Separately, this DB column turned out to be functionally disconnected from what actually matters: Step 3/4/5 behaviour (which UI mode renders, how the export is assembled) is driven by a _different_ `funder_type` value (`structured`/`free_form`), derived fresh from each application's own AI summary at Step 3 — not from this pre-committed DB column. The column was purely cosmetic, driving only the picker badge.

Also traced the terminology's origin: `funder_type` (`structured`/`narrative`) was introduced in `DR-FD-001` (2026-06-01) as a database-schema convenience, two days _after_ the actual product decisions (Mark Two BRD's BD-01–BD-07, 2026-05-29), which never mention it and never define what either term means. The name also collides with an unrelated, well-defined concept — `narrative` as a _question-level_ type (BD-04) — which was a likely source of ongoing confusion.

**Fix:** Removed `funder_type` from the Step 1 picker query and dropped the badge from the UI.

- `actions/applications.ts` — `FunderOption` type no longer carries `funderType`; `getActiveFunders()` selects only `id, name`
- `components/application-step1-form.tsx` — removed the badge `<span>` from each picker list item; the funder name renders alone

The `funders.funder_type` DB column itself is left in place, unused — dropping it is low-priority cleanup, not urgent. The dynamic, per-application `ai_summary.funder_type` classification is completely unaffected and continues to correctly drive Step 3/4/5 behaviour.

**Verified:** `npx tsc --noEmit` clean; full test suite (24 tests) passes unchanged; confirmed no other code references `FunderOption.funderType`.

Full amendment recorded in `docs/decisions/DR-FD-001-funder-directory-model.md` (v1.0 → v1.2).

---

## 2026-07-04 — D-CW-02: AI assist not reliably compressing over-limit answers

Found live during Clothworkers Foundation testing (IT-CW-09): a 344-word answer against a 250-word limit (38% over) was returned by "Help me improve this" almost completely unchanged — no words removed. An earlier, smaller case that same session (60 words against a 50-word limit, 20% over) was partially compressed but still left over the limit.

**Root cause:** `buildRefinePrompt` (`lib/prompts.ts`) told the model both "the refined answer must not exceed N words" and "do not change facts... the claims being made," with no instruction on _how_ to actually cut length when over. With those two instructions in tension and no explicit permission to trim, the model appears to have prioritised preserving every sentence over meeting the limit — more so as the excess grew, which fits both observed data points (worse compliance the further over the limit the answer started).

**Fix:** `buildRefinePrompt` now computes the answer's word count and, when it exceeds the limit, swaps in an explicit hard-requirement instruction: cut less essential detail, combine sentences, and remove repetition or examples to hit the limit. The general "don't change facts" instruction is now scoped explicitly to facts that are _kept_ — it no longer implies every sentence must survive — and explicitly permits omitting less essential detail to meet a word limit.

**Verified:** `npx tsc --noEmit` clean; existing `__tests__/prompts.test.ts` (9 tests) and full suite (24 tests) pass unchanged. **Not yet re-verified live against Bedrock** — pending WJ's next over-limit AI assist test during A B Charitable Trust testing.

Logged as D-CW-02 in `docs/Test Plans/Clothworkers-Foundation-test-plan.md`.

---

## 2026-07-02 — Versioning strategy: proposed and implemented same day

Raised while reinstating the export footer's version number (see entry below) -- the footer has always shown a hardcoded literal `"v1"`, which has never actually changed and doesn't derive from anything real. `package.json`'s own `version` field is `0.1.0` and is not connected to the footer at all. Whatever the footer is meant to support (traceability for support and issue reporting, per `PDR-DH-003`), a string that has never once updated cannot deliver on that.

**Why a manually-bumped semantic version (the obvious default) is a poor fit here specifically:** this project has no formal release cadence -- it's continuously deployed, often more than a dozen times a day (today alone had well over 20 pushes to `master`). A manual version bump requires remembering to do it on every meaningful change, which is exactly the discipline that has evidently already failed once (`"v1"` frozen since the footer was first built). Even bumped diligently, a coarse `MAJOR.MINOR.PATCH` wouldn't have the resolution to distinguish two builds shipped hours apart, which is the realistic scenario for a support conversation about this project ("was this generated before or after this afternoon's fix?").

**Proposed instead: auto-derived from build metadata, zero manual maintenance.**

Vercel automatically injects Git commit metadata as build-time environment variables on every deployment (`VERCEL_GIT_COMMIT_SHA`, `VERCEL_GIT_COMMIT_MESSAGE`, etc.) -- no configuration needed. A version string built from this at build time would be:

- **Precise:** a short commit SHA maps to exactly one code state, unambiguously -- exactly what's needed to diagnose "what was live when this document was generated"
- **Human-readable at a glance:** paired with the deploy date, gives an immediate "roughly when" answer without needing to look anything up
- **Zero maintenance:** nobody has to remember to bump anything, ever -- it changes automatically with every deployment, which matches how this project actually ships

Suggested format: `v2026.07.02 (a2ca520)` or similar -- exact display wording is a matter of taste, not something this proposal is trying to settle. Mechanically: read `VERCEL_GIT_COMMIT_SHA` (and its own commit date) at build time in `next.config.ts`, expose it via `NEXT_PUBLIC_APP_VERSION` (or similar) so it's available without a database round-trip, and have the export route read it the same way it currently reads the hardcoded literal.

**Approved and implemented the same day.** Format settled on `YYYY.MM.DD-<short SHA>` (e.g. `2026.07.02-a2ca520`), joined with a hyphen rather than the parenthesised form originally suggested -- simpler to read inline in a discreet footer.

- `next.config.ts` -- computes `appVersion` once at build time (`new Date()` for the build date, `process.env.VERCEL_GIT_COMMIT_SHA` for the commit), exposed everywhere via the `env` config key as `process.env.APP_VERSION`
- `lib/version.ts` (new) -- `getAppVersion()` helper, falls back to `"dev"` when `APP_VERSION` is unset
- `app/api/export/[applicationId]/route.ts` -- footer now interpolates `getAppVersion()` instead of the hardcoded `"v1"` literal, on both export formats
- `__tests__/version.test.ts` (new) -- covers the set/fallback cases

**Bug caught before it shipped, via a local production build (`npm run build`), not just type-check:** the initial implementation used `process.env.VERCEL_GIT_COMMIT_SHA ?? 'dev'`. Locally, `.env.local` (written by a past `vercel env pull`) sets this variable to an **empty string**, not absent -- nullish coalescing (`??`) only falls back on `null`/`undefined`, not `""`, so the version silently came out as `2026.07.02-` with no identifier at all. Fixed with an explicit truthiness check instead. Would not have affected the real Vercel deployment (which sets a genuine SHA), but would have produced a subtly broken version string on any local build -- worth knowing about if this pattern (`vercel env pull` + `VERCEL_*` vars + `??`) comes up again elsewhere in the codebase.

Not yet done: PDR-DH-003's `[version number]` placeholder wording was updated to show the new format as an example, but this hasn't been wired into Sentry release tracking (`withSentryConfig` already auto-detects a release identifier from the local Git repo independently -- confirmed via `_sentryRelease` in the build output -- so this is a nice-to-have alignment, not a gap).

---

## 2026-07-02 — Export footer: version number briefly removed, then reinstated; page numbering added (PDR-DH-003 revised)

Wac downloaded both export formats during live RT-10 testing and initially asked for the version number to be removed from the footer, plus page numbers added to the Word export ("Page N of NN" — not meaningful for plain text, which has no concept of pages).

This wasn't just a typo fix -- `PDR-DH-003` (Export Format and Structure) explicitly specified the version number, with a stated rationale ("provides traceability for support and issue reporting"). Implemented and recorded as a decision reversal in `PDR-DH-003`'s new Revision History section rather than silently overwriting the original decision. **Wac then recalled the version number was included deliberately for that reason and asked to reinstate it** -- reverted the same session, before it was ever deployed to a real user-facing state for long. Recorded as a further Revision History entry rather than pretending the excursion didn't happen.

**Net result** (`app/api/export/[applicationId]/route.ts`):

- Footer text: unchanged from the original -- _"Prepared using Grant Pathway v1 — grantpathway.org.uk"_ on both formats
- Word export only: added a second footer paragraph, "Page N of NN", using `docx`'s `PageNumber.CURRENT` / `PageNumber.TOTAL_PAGES` fields (dynamic Word fields, computed by Word itself at open/print time) -- this part of the change stuck
- Verified via a standalone test document using the same `docx` calls, checked with the skill's `validate.py` -- structurally valid OOXML. Could not render to PDF for a visual check (the sandboxed LibreOffice wrapper hits a Windows socket-API incompatibility, unrelated to this change) -- relying on the well-documented, standard nature of these field codes instead.

**Documentation:** `PDR-DH-003` Revision History now has an honest two-entry record (removed, then reinstated) rather than a single edit that erases what actually happened. `acceptance-criteria.md` (`AC-FR-37-03`) and `regression-test-plan.md` both reflect the final state (version number present, page number added).

Also found and fixed in passing: `technical-design.md`'s API Routes table had `/api/export/[id]` -- the route folder is actually `[applicationId]`, and the table didn't mention the route also serves `format=txt`, not just Word. The route's own doc comment already had the correct param name -- just an internal inconsistency within the same file.

**Raised in passing, not yet actioned:** the footer's version string has always been a hardcoded literal (`"v1"`), never derived from `package.json` (currently `0.1.0`) or any real build/deploy metadata -- it has never actually tracked anything. See the versioning-strategy proposal below.

---

## 2026-07-02 — RT-09 and RT-10 merged: approve + Word export is one user action, so it's one test

Following on from the footer discussion above, Wac raised that RT-09 (approval) and RT-10 (Word export verification) would be better merged, given approve+download became a single action on 2026-06-12 -- testing them as two separate cases had forced awkward "if RT-09 used Word... if RT-09 used plain text..." branching logic to stitch them back together, which was itself a sign the split no longer matched reality.

**Fixed:** RT-09 is now "Final Review, Approval, and Word Export" -- tick checkboxes, click **Download as Word document** (a fixed choice, not "record which"), verify the approval RPC and banner, verify the resulting Word document content, all as one continuous test. The freed **RT-10** slot is reused for plain-text export (previously **RT-10a**, added earlier the same day when the gap was first found -- plain-text export had never had its own test at all). Because RT-09 now always downloads Word first, RT-10 (plain text) deterministically triggers the re-export confirmation dialog (D-WF-04) every time -- no more conditional "if/if" logic needed in either test.

---

## 2026-07-02 — RT-09 corrected: still described the approval modal removed weeks ago

Found by Wac while running the live regression suite — he recalled a past decision to not have a separate approval modal at Step 5, and asked for it to be checked against the design docs before treating it as a defect. Confirmed: `CHANGELOG.md`'s own 2026-06-12 entry ("Step 5: approve + download collapsed into a single action") already documents that the separate "Approve my application" button and its confirmation modal were deliberately removed -- three checkbox ticks already demonstrate intent, so the modal was judged redundant friction. `screen-requirements.md` and `acceptance-criteria.md` (AC-FR-33-01 through 03) were correctly updated at the time. Only `regression-test-plan.md`'s RT-09 was never updated to match -- rewritten to describe the actual flow (tick three checkboxes -> a download button becomes enabled -> clicking it approves and downloads in one action, no modal).

---

## 2026-07-02 — RT-07 corrected: stale test step never matched the real design

Found by Wac while running the live regression suite. RT-07 step 4 asked the tester to verify a "50 AI request monthly limit" tip on the Step 4 preparation checklist screen. Checked both the actual component (`components/application-step4-prep-checklist.tsx`) and the authoritative requirement (`AC-FR-28-01`) -- neither has ever specified this. That screen only covers the financial-documents checklist and the note about involving a senior colleague before the budget questions; the only AI-usage-limit messaging anywhere near Step 4 is a conditional banner inside the Q&A interface itself, shown only when nearing the 40-50 request range -- a different screen entirely. Corrected RT-07 to check for the senior-colleague note instead, which is what the screen actually shows.

---

## 2026-07-02 — D-012 continued: Gmail's own link scanning was silently consuming verification links

Follow-up to the Resend API key fix below. Once email delivery started working again, verification links began showing "This link has expired" within minutes of being sent -- confirmed as a _second, distinct_ root cause from the SMTP issue.

**Investigation:** Checked `auth.users` timestamps across 5 accounts spanning a month (`created_at` back to 2026-06-09) and found every single one confirmed 15-80 seconds after the email was sent -- far too fast for a human, and consistent regardless of which browser was used to read the email (Comet, Chrome, and later re-tested in Edge). Ruled out browser-specific causes directly: registered a fresh account in Wac's non-Chrome default browser as a controlled experiment, and it auto-confirmed in 25.7 seconds -- _faster_ than the Chrome attempt. Ruled out Resend's own click-tracking (the "New tracking subdomain" screen Wac found was an unsaved setup wizard, not an active config). Checked Supabase's own Auth Logs directly: the verification token (`token=pkce_...&type=signup`) was hit twice at `/auth/v1/verify`, 5 seconds apart, minutes before Wac ever opened the email.

**Root cause:** all 5 sampled accounts were `+alias@gmail.com` addresses on the same underlying Gmail inbox. Gmail performs server-side link scanning on incoming HTML email as part of spam/phishing detection -- entirely independent of the recipient's browser or device -- and was visiting the single-use verification link within seconds of delivery, before the real person ever saw it. This is a widely-documented gotcha for exactly this style of single-use email link, unrelated to this app's implementation quality; it will affect any Gmail recipient, including quite possibly the charity contact using the service next week.

**Fix, in two stages (both in `app/auth/callback/route.ts`, `actions/auth.ts`, and new files `app/(public)/verify-email/confirm/page.tsx` + `components/confirm-email-form.tsx`):**

1. `/auth/callback` no longer completes verification (`verifyOtp` / `exchangeCodeForSession`) the instant its page loads -- that's exactly the kind of GET request an automated scanner performs. Password recovery (`type=recovery` or `next=reset`) is unchanged. Signup confirmation now redirects to a new `/verify-email/confirm` page, which required an explicit "Confirm my email address" button click before the token is spent -- scanners fetch pages, they don't click buttons.
2. **Wac tested this via Comet and found it asked the user to verify twice** -- once via the button in the email itself, then again via the new page's button. Confirmed by checking `auth.users` (30s send-to-confirm, consistent with a human clicking through both steps quickly) and by Wac describing exactly two clicks. Fixed by auto-submitting the confirm page's form the instant it mounts in a real browser (`formRef.current.requestSubmit()` in a mount-only `useEffect`) -- Gmail's scanner fetches the raw page over HTTP and does not execute JavaScript, so this stays safe, while a real person gets back a single-click experience.
3. **Further UX refinement, also from Wac:** since a real person isn't expected to interact with the confirm step at all, showing "Confirm your email address" + a clickable button was misleading even though nobody has to click it. Replaced with a passive "Confirming your email… This will only take a moment." spinner, no interactive element at all.

On success, `confirmEmail()` (the new Server Action) signs the session back out immediately, mirroring the existing `resetPassword()` pattern, so the "Email verified" screen's button always leads to a normal sign-in with credentials rather than an active session carried over from the link. `verify-email/page.tsx`'s verified-state copy and button updated to match ("Sign in" / `/`, not "Go to my dashboard" / `/dashboard`).

**Verified fixed** by re-registering fresh accounts and completing the full flow via Comet, Chrome, and Edge -- all three confirmed cleanly (14.5s-30s, single pass, no repeat prompts) with no code changes between browsers.

**Documentation corrected in the same pass** (deferred until the fix was confirmed working, per Wac): `screen-requirements.md` (new `/verify-email/confirm` intermediate-screen entry; State 2 copy/button updated) and `acceptance-criteria.md` (AC-FR-03-03 updated, new AC-FR-03-3a added for the scanner-safety behaviour) both also had their verification-link expiry documented as 24 hours -- corrected to the actual 1 hour while in these files for an unrelated but adjacent reason. `technical-design.md` updated: project structure tree, public routes list, page inventory, API routes table (`/auth/callback` added), and the `actions/auth.ts` Server Actions row (`confirmEmail` added). `regression-test-plan.md`'s D-012 Defect Log entry rewritten to cover both chained root causes.

Temporary D-012 experiment logging (`Sentry.captureMessage` + `console.log` in `route.ts` and `actions/auth.ts`, tagged `d-012-auth-callback`) removed now that the fix is confirmed and documented.

---

## 2026-07-02 — D-012: registration broken for every new account (email delivery)

Found live during the first run of RT-01a (the new account-registration regression test). Every attempt to register a new account on dev showed the generic "Something went wrong. Please try again in a moment." error.

**Root cause, confirmed by calling Supabase Auth's `/auth/v1/signup` endpoint directly** (bypassing the app, using the project's anon key): `{"code":500,"error_code":"unexpected_failure","msg":"Error sending confirmation email"}`. This is Supabase Auth failing to send the verification email via its configured SMTP relay (Resend) -- not an application bug in the traditional sense. Checked in passing: the Resend API key recorded in `AWS and Supabase keys.md` also failed authentication when queried directly against Resend's API (`"API key is invalid"`) -- may or may not be the same key configured in Supabase's SMTP settings, but consistent with a Resend-side credential or account problem. **Not yet fixed -- needs Wac to check the Resend account (suspension, domain verification, sending limits) and the SMTP API key configured in Supabase Dashboard -> Authentication -> Settings -> SMTP Settings, for both dev and prod projects.**

Confirmed no orphaned/partially-created `auth.users` rows result from the failure (checked directly against the dev database) -- Supabase rolls back the whole signup, so retries are safe once the email issue is resolved.

**Fixed in code, separately from the root cause:** `actions/auth.ts`'s `registerUser` caught the Supabase error and returned a generic `{ error: 'unknown' }` with **no logging at all** -- the real reason was completely invisible without manually reproducing the API call. Added `Sentry.captureException(error, { tags: { action: 'registerUser' } })` before the generic return, so future auth failures of any kind surface in Sentry instead of vanishing silently.

Logged as **D-012** in `regression-test-plan.md`'s Defect Log, severity Blocking -- this affects every prospective new user, including the real charity application planned for next week, so it needs resolving before then regardless of testing progress otherwise.

**Resolved same day.** The Resend API key configured as the SMTP password in Supabase Dashboard -> Authentication -> Emails -> SMTP Settings (dev project) was stale/invalid -- confirmed independently by querying Resend's API directly with the key on file (`"API key is invalid"`), and by Resend's own dashboard showing zero sent emails in the last 15 days. Domain verification was ruled out first (DKIM and SPF records both correctly in place). Wac generated a new Resend API key (`grant-pathway-supabase-smtp`, Sending-access scope) and updated the SMTP password field. Verified fixed by repeating the direct `/auth/v1/signup` call -- Supabase returned a full success response with `confirmation_sent_at` set. Prod's SMTP settings were not touched -- prod has no live consumer yet -- but should be checked before it does.

---

## 2026-07-02 — P5.6 DNS: Vercel side configured, GoDaddy record outstanding

A real charity contact wants to complete a live application next week under Wac's supervision. That doesn't require production to be publicly reachable (the session will be supervised, on Wac's device, dev or prod both fine) -- but it surfaced that `grantpathway.org.uk` was never actually connected, worth fixing anyway since it's needed eventually. Investigated and got as far as CLI access allows:

- `grantpathway.org.uk` and `www.grantpathway.org.uk` added and attached to the `grant-pathway` Vercel project (`vercel domains add`).
- Confirmed via `vercel domains inspect` that the domain is still sitting on GoDaddy's default parking IPs (nameservers `ns39/ns40.domaincontrol.com`) -- never pointed at Vercel.
- **Deliberately did not recommend migrating nameservers to Vercel.** The domain has live MX records (`smtp.secureserver.net`, `mailstore1.secureserver.net`) and an SPF record covering both `secureserver.net` and `amazonses.com` -- real email depends on this, including the `noreply@grantpathway.org.uk` mailbox. A full nameserver migration would silently break it unless every record were manually recreated at Vercel DNS.
- **Correct fix instead:** a single `A` record at GoDaddy, `grantpathway.org.uk -> 76.76.21.21` (and the same for `www`), leaving nameservers and all other records untouched. This requires GoDaddy registrar access, which Claude does not have -- flagged for Wac.
- Checked the second half of the "domain gap" -- the SSO/Vercel-Authentication wall currently blocking the raw `*.vercel.app` production URL. Queried the Vercel API directly (`vercel api`) and found `ssoProtection.deploymentType = "all_except_custom_domains"` -- it's already configured to exempt custom domains. No Vercel-side change needed; the domain will work as soon as the DNS record is added.

See `IMPLEMENTATION-STATUS.md` P5.6 for the outstanding action.

---

## 2026-07-02 — Legal docs corrected for the abandoned AI-generates-drafts model

**`docs/legal/terms-of-service.md`** → v1.2, **`docs/legal/privacy-policy.md`** → v1.4, **`docs/business-overview.md`**

Flagged while preparing yesterday's session plan (`docs/Test Plans/2026-07-02-session-plan.md`, Priority 1): both live legal documents — the actual files `/terms` and `/privacy` read at request time — still described AI as generating draft answers to application questions from scratch. This is the same stale claim corrected in `business-overview.md` on 2026-05-29 (BD-01) after the product model was abandoned 2026-05-28, but it was never caught in the legal docs. Higher stakes here since these are the documents users click through to accept.

**Fixed:**

- `terms-of-service.md` Section 5 (two paragraphs) reworded to state the actual model: the charity writes every answer; AI refines and improves on request only via "Help me improve this," and never generates an answer from nothing. Confirmed against the current code (`components/application-step4-draft.tsx`'s `handleRefine` → `/api/refine-answer`; the old `/api/generate-draft` route was deleted 2026-07-01). Version bumped 1.1 → 1.2.
- `privacy-policy.md` Sections 2, 3, and 5 (five locations) reworded the same way. Version bumped 1.3 → 1.4. Also fixed a pre-existing bug found in passing: the document's footer said "Version 1.2 / Last updated 17 June 2026" while its own header said "Version 1.3 / 29 June 2026" — the footer had not been kept in sync through the last two version bumps.
- `business-overview.md` "What Grant Pathway Does Not Do" section had one residual line — "The AI generates a draft. A human reviews it." — missed by the 2026-05-29 pass that fixed the rest of the file. Corrected to match.
- Wording was drafted and approved by Wac before editing (legal document — deliberate wording, not a mechanical find-replace, per the session plan). Both amended documents are being taken offline by Wac for a further re-review pass. This does not replace the still-outstanding solicitor review or the `[TO BE CONFIRMED]` effective dates (P5.1).

---

## 2026-07-01 — Schema drift check automated; test URL confirmed as dev; target-funder-list.md retired

**`.github/workflows/schema-drift-check.yml`** (new), **`docs/Test Plans/regression-test-plan.md`**

Follow-up to the test dashboard reset (previous entry). Two items closed:

- **RT-00 automated.** New scheduled GitHub Actions workflow runs daily (07:00 UTC) plus on-demand, checking both `grant-pathway-dev` and `grant-pathway-prod` for the same two things RT-00 checks by hand: all 5 required RPC functions present, and the migration count tracked remotely matches the local `supabase/migrations/` file count. Fails loudly (GitHub email notification) if either environment drifts again. Requires two repository secrets (`SUPABASE_DEV_DB_URL`, `SUPABASE_PROD_DB_URL`) to be added manually in GitHub — not yet configured as of this commit.
- **Confirmed: `grant-pathway-three.vercel.app` (the regression/funder test URL) points to `grant-pathway-dev`.** Nothing currently points to `grant-pathway-prod` — it has no live consumer yet, pending the P5.6 DNS/go-live cutover. Recorded in `regression-test-plan.md`'s Test Data table.
- `docs/Test Plans/target-funder-list.md` retired to `docs/Test Plans/archive/target-funder-list-v1.1.md` — it was never updated after the 2026-06-11 funder additions and had drifted to missing 8 of 20 live funders. `TEST-DASHBOARD.md`'s Active Funders table is now the single source of truth for the funder list. Live references in `data-model.md` and `DR-FD-001` redirected accordingly; also found `DR-FD-001` referenced a "v1.3" version of the retired file that was apparently planned but never actually created.

---

## 2026-07-01 — Test dashboard reset; regression plan hardened; live `is_active` data bug found

**`docs/Test Plans/TEST-DASHBOARD.md`** → v2.0 (old v1.39 archived to `docs/Test Plans/archive/`), **`docs/Test Plans/regression-test-plan.md`** → v1.1, plus 3 funder test plans

Direct consequence of today's dev/prod schema-gap finding (see earlier entries): every recorded funder test result predates the 2026-06-22 introduction of the AI-cap RPC and the 2026-06-29 introduction of the approve/reopen RPC — both of which were broken on hosted environments until today. This means none of the 7 funders previously marked 🟢 "fully tested" have actually been verified against the current codebase; the schema gap was invisible from inside the app the whole time.

**Fixed:**

- `regression-test-plan.md` v1.1: added RT-00 (environment/schema verification — checks all 5 RPC functions exist and `supabase migration list` shows no drift, before trusting any other result) and RT-11 (dashboard reopen — the only test covering `reopen_application`, previously untested by this plan). Annotated RT-05 and RT-09 with their RPC dependencies. Noted the plan has zero recorded executions since it was written 2026-06-15.
- `TEST-DASHBOARD.md` reset to v2.0: all 7 previously-🟢 funders downgraded to a new 🔁 "needs re-verification" status (not a claim anything is broken — an honest statement that the last verified-passing result predates a confirmed infrastructure gap). Old dashboard (39 revisions, 2026-06-02 to 06-17) preserved at `docs/Test Plans/archive/TEST-DASHBOARD-v1.39.md`.
- **New finding, not yet fixed:** a live database check found `Foyle Foundation`, `Nationwide Building Society`, `Motability Foundation`, and `City Bridge Foundation` — all four documented as closed/parked/removed since 2026-06-04 — still have `is_active = true` in the database, meaning they're currently selectable in the live funder picker. Per the dashboard's own Funder Readiness Standard, parked funders should be `is_active = false`. Logged as a Known Issue in the new dashboard for WJ to action; remediation SQL provided there.
- 3 active funder test plans (A B Charitable Trust, Clothworkers' Foundation, Idlewild Trust) still referenced the old "10+ characters" password rule; corrected to the current 12-character-plus-letters-and-digits rule.
- `target-funder-list.md` (v1.1, 2026-06-04) noted as stale — missing MK Community Foundation, Baily Thomas, and CPF Trust variants added to the dropdown 2026-06-11. Not yet updated; flagged for a future pass since `TEST-DASHBOARD.md`'s Active Funders table is the more current source of truth in the meantime.

---

## 2026-07-01 — `Grant-Pathway-Business-Overview.docx` regenerated from `business-overview.md`

**`docs/Grant-Pathway-Business-Overview.docx`**

Closes the loop on the finding that started today's whole audit chain. The Word export was Version 1.3 (22 May 2026) and still described Grant Pathway as generating first-draft answers from scratch — the model abandoned on 2026-05-28 after real funder guidance (Henry Smith Foundation, National Lottery Community Fund) showed AI-generated content disadvantages applications. `docs/business-overview.md` was correctly updated to the "AI assists, doesn't generate" model on 2026-05-29 and verified accurate against the live Step 4 code; the `.docx` was simply never regenerated to match.

Rebuilt from scratch via `docx-js` (hand-editing the original's ~1100-line Word XML was judged too error-prone given how much prose changed) — same cover-page structure and both brand logos (Grant Pathway teal, RapidGlobe navy) reused from the original file, content copied verbatim from the current `business-overview.md`, version bumped to 1.4 (1 July 2026). Verified via `zipfile.testzip()` (clean) and a full pandoc round-trip extraction compared line-by-line against the source `.md` — no content drift.

---

## 2026-07-01 — `/api/generate-draft` and `advanceToStep5` deleted; all doc/diagram references corrected

**`app/api/generate-draft/route.ts`** (deleted), **`actions/applications.ts`** (`advanceToStep5` deleted), **`docs/Technical Decision and Design/technical-design.md`** → v1.7, plus 6 ADR files, `docs/future-phases.md`, `docs/Implementation Plan/IMPLEMENTATION-PLAN.md`, and both `docs/diagrams/01-system-architecture.*`/`07-application-workflow.*`

Final cleanup from today's orphaned-code audit (see earlier entries — the audit that found the dev/prod schema gap started here).

**Code deleted, both confirmed to have zero callers anywhere in the codebase:**

- `app/api/generate-draft/route.ts` — the route that started this entire investigation. Fully implemented, actively maintained (kill-switch, fail-closed cap check, cap raised to 50), but never wired to any UI since the 2026-05-28 charity-authored redesign. `answer_source: 'ai_generated'` (the enum value only this route could set) is now permanently unused — noted in `saveAnswer`'s docstring rather than removed from the DB enum, since removing an enum value is a separate, riskier migration.
- `advanceToStep5()` in `actions/applications.ts` — the code's own comment already called it "legacy — superseded by `setDraftReadyToAssemble`." Deleted along with its section header.

Verified via `tsc --noEmit`, `eslint`, and the full Vitest suite (22/22) after both deletions — clean.

**Documentation swept for every current (non-archived) reference to `/api/generate-draft`:**

- `technical-design.md` — removed from §4 project tree, §9 API routes table, §13 rate-limiting table; `/api/refine-answer`'s config corrected from "Default timeout" to the actual `maxDuration = 60`. Also caught and backfilled two missing document-history rows (v1.5 MFA fix, v1.6 route-naming fix) that were never logged when those versions were bumped earlier today.
- `future-phases.md` (FP-10) — corrected the "three AI routes" streaming-scope list, which also incorrectly named a non-existent `/api/paraphrase` route (charity paraphrase is a step inside `actions/charity.ts`, not a route).
- `IMPLEMENTATION-PLAN.md` — two still-pending P5.3/P5.4 tasks (Sentry route tagging, Sentry performance alert) retargeted from `generate-draft` to `refine-answer` so future work doesn't get pointed at a deleted route.
- Six ADR files (`ADR-AI-006`, `ADR-AI-010`, `ADR-ARCH-003`, `ADR-OPS-001`, `ADR-OPS-005`, `ADR-SEC-005`) — illustrative route examples and tables corrected to `refine-answer`. Formal decisions in each ADR are unchanged; only stale example route names/durations were updated, with an editorial note added where an ADR's _reasoning_ (not just its example) referenced `generate-draft`'s specific behaviour (ADR-AI-010's JSON-streaming-complexity argument, which doesn't transfer to `refine-answer`'s simple text response).
- `acceptance-criteria.md`, `IMPLEMENTATION-PLAN.md`'s Slice 6 note, and `docs/Implementation Plan/ADR-TRACEABILITY.md` already correctly described the route as removed/historical — left untouched.

**Diagrams corrected and regenerated** (`.svg` source edited, `.png`/`.docx` regenerated with ImageMagick, verified via crop-and-inspect):

- `01-system-architecture.svg` — removed from the API Routes panel; five remaining routes reflowed to close the gap.
- `07-application-workflow.svg` — Step 4's description corrected from "AI draft generation per answer" to "Charity writes answer · optional 'Help me improve this' AI refine," matching the edge-case callout already added to this diagram earlier today.

---

## 2026-07-01 — Dev/prod schema gap closed: AI features and approve/reopen were broken on every hosted environment

**`supabase/migrations/20260701000000_item21_transactional_approve_reopen.sql`** (new), **`docs/migrations/item-21-transactional-integrity.sql`** (removed), **`docs/Implementation Plan/IMPLEMENTATION-PLAN.md`** → v3.1 — **RESOLVED, both dev and prod fully reconciled**

Follow-up to the orphaned-code audit (previous entry). A full dev-vs-prod schema diff, prompted by the confirmed-broken `approve_application`/`reopen_application` finding, turned up a much larger gap:

- **`reserve_ai_slot`, `update_ai_slot_token_count`, `cancel_ai_slot` (the AI cap-check RPCs) existed on neither `grant-pathway-dev` nor `grant-pathway-prod`.** Every AI route (`generate-summary`, `refine-answer`, and the charity paraphrase action) calls `reserve_ai_slot` as its first step — this means the AI features have been non-functional on every hosted environment (Vercel preview and production both connect to one of these two remote Supabase projects, not local Docker) since the `20260622000002_ai_cap_rpc.sql` migration was written and never actually applied outside local dev/CI.
- **`approve_application`/`reopen_application` existed on dev but not prod** — confirmed via direct SQL query against both projects. Step 5 "Approve" and the dashboard "Reopen" action were broken in production.
- **6 columns missing on prod only:** `applications.assembled_draft`, `applications.draft_status`, `application_answers.ai_refined_answer`, `.is_budget_question`, `.char_limit`, `.limit_type` — breaking draft assembly and character-limit funders in production.
- **`ai_request_type` enum missing `'charity_paraphrase'` on both projects.**

Root cause: schema changes since 2026-05-20 have been applied by pasting SQL directly into the Supabase dashboard SQL editor rather than via `supabase db push`, so the CLI's own migration tracking table only recorded the first 3 of 17 migrations as applied — on both dev and prod. `docs/migrations/item-21-transactional-integrity.sql` (never a tracked migration) even had a header comment reading "Run this in the Supabase SQL Editor for grant-pathway-prod" immediately followed by dev's project reference ID — almost certainly why that fix reached dev but not production.

**Fixed:**

1. All missing schema (columns, enum value, all 5 missing functions) applied directly to `grant-pathway-dev` and `grant-pathway-prod` via the SQL Editor, in dependency order (columns before functions that reference them). Verified via a full table/column/function fingerprint re-diff — dev and prod now match exactly.
2. `item-21-transactional-integrity.sql` relocated from `docs/migrations/` into `supabase/migrations/20260701000000_item21_transactional_approve_reopen.sql` as a proper tracked migration. Verified it applies cleanly via `supabase db reset --local` (the same check CI's `validate-migrations` job runs).
3. `20260622000003_rls_hardening.sql`'s `WITH CHECK` policies confirmed genuinely present on prod (queried `pg_policy` directly on `applications`, not assumed) before including it in the repair.
4. Both `grant-pathway-dev` and `grant-pathway-prod` migration tracking tables fully repaired via `supabase migration repair --status applied` for the same 15 versions (14 previously-untracked plus the new item-21 migration) — confirmed via `supabase migration list` on both projects showing all 18 local migrations matched against remote. WJ ran the prod repair himself from a real terminal (`supabase link --project-ref` needs an interactive DB-password prompt that can't go through an AI-issued command). `supabase db push` is trustworthy against both dev and prod again.

**Why this matters:** CI's `validate-migrations` job only proves the tracked migration files apply cleanly to an empty local database — it says nothing about whether the real, hosted dev/prod databases match what's in version control. This gap would only have been caught by testing against an actually-deployed URL, which hadn't happened yet this close to launch.

---

## 2026-07-01 — Orphaned-code audit finds broken prod approve/reopen; migration tracking reconciliation added to P5.4

**`docs/Implementation Plan/IMPLEMENTATION-PLAN.md`** → v2.9

Following the FR-07/MFA and diagram accuracy work earlier today, a scoped audit was run across every API route, Server Action, and Supabase RPC function to check for orphaned/unreachable code (the same failure shape as the `/mfa` and `generate-draft` findings, but for live code rather than docs). Findings:

- `app/api/generate-draft/route.ts` and `advanceToStep5()` in `actions/applications.ts` confirmed orphaned (zero callers anywhere) — pending deletion, not yet actioned.
- **`approve_application` and `reopen_application` — the two Postgres RPC functions backing Step 5 "Approve" and the dashboard "Reopen" action — exist on `grant-pathway-dev` but do not exist on `grant-pathway-prod`.** Confirmed via direct SQL query against both projects. These features are currently broken in production.
- Root cause: `supabase migration list --linked` shows only 3 of 17 local migrations recorded as applied in the CLI's tracking table, on both dev and prod — schema changes since 2026-05-20 have been applied by pasting SQL directly into the Supabase dashboard SQL editor rather than via `supabase db push`. This is why the item-21 transactional-integrity fix (2026-06-29) ended up at `docs/migrations/item-21-transactional-integrity.sql` instead of a tracked `supabase/migrations/` file — and why it silently never reached production.
- `IMPLEMENTATION-PLAN.md` P5.4's existing "Apply initial migrations to production… `supabase db push --db-url [prod-url]`" bullet would fail if run as written, since the CLI believes 14 migrations have never been applied. Replaced with a migration tracking reconciliation sequence (link to prod, full dev-vs-prod schema diff, file the item-21 migration properly, apply to prod, `supabase migration repair` on both projects).

**Status:** Full dev-vs-prod schema comparison in progress. WJ to attempt Phase 5 next week.

---

## 2026-07-01 — Diagram edge-case update + route-naming consistency fix

**`docs/diagrams/07-application-workflow.svg`**, **`docs/Technical Decision and Design/technical-design.md`** → v1.6, **`docs/Technical Decision and Design/ADR-ARCH-004-multi-step-flow-state.md`**

Follow-up from the diagram review that surfaced the FR-07/MFA regression (see entry below). Two further items closed:

1. **Application-workflow diagram edge cases.** `07-application-workflow.svg` was missing two edge-case states added to `screen-requirements.md` on 2026-06-30: the Step 2 guidelines-truncation warning banner (>20k extracted characters) and the `AI_ENABLED` kill-switch "AI unavailable" state (Step 3 summary and Step 4 AI-assist). Added as a dashed callout box alongside Step 3. **Known limitation:** no SVG rasteriser (rsvg-convert, ImageMagick, headless browser) is available in this environment — Chrome automation blocked both `file://` and `localhost` navigation pending user permission grant. `07-application-workflow.svg` (the source of truth) is updated; `07-application-workflow.png` and `.docx` are now stale and need manual re-export.
2. **Route-naming inconsistency.** `technical-design.md` §4 (project tree) and §7 (routes tables) referred to the application-detail routes as `/application/[id]/step/N` (singular), while the actual codebase, `screen-requirements.md`, and the information architecture all use `/applications/[id]/step/N` (plural) — already resolved in favour of plural per decision D1 in `IMPLEMENTATION-PLAN.md`. `technical-design.md`'s project tree also listed `applications/` and `application/` as two separate top-level directories; merged into one. Same stale singular form corrected in `ADR-ARCH-004-multi-step-flow-state.md` (9 occurrences) — the ADR's decision (URL-encoded step state) is unchanged, only the example route string.

---

## 2026-07-01 — `07-application-workflow.png`/`.docx` regenerated (ImageMagick installed)

**`docs/diagrams/07-application-workflow.svg`**, **`.png`**, **`.docx`**

Follow-up to the entry above, which flagged the diagram's `.png`/`.docx` exports as stale with no SVG rasteriser available. WJ installed ImageMagick (`choco install imagemagick -y`), which bundles librsvg. Regenerated `07-application-workflow.png` at `-density 200` (matches the original's 2083×3125px output exactly — ImageMagick/rsvg treats the SVG at 96 DPI base, so density 200 reproduces the same pixel dimensions as the original renderer's 150 DPI-at-72-base assumption). Also fixed a rendering defect surfaced by the switch to ImageMagick: the `&#9888;` (⚠) Unicode warning-sign entity used in two diagram callouts rendered as a missing-glyph box under the local font set, whereas the original renderer (browser-based) had emoji font coverage. Replaced both occurrences in `07-application-workflow.svg` with a small hand-drawn vector warning-triangle icon (`<path>` + rect + circle) so rendering no longer depends on font/emoji coverage — verified consistent across the diagram.

`07-application-workflow.docx` updated by swapping the embedded image bytes only (same filename, same relationship ID, identical pixel dimensions) — no XML content changed. Verified via independent zip-integrity check (`zipfile.testzip()` clean, all 20 expected parts present, embedded PNG size matches exactly) since LibreOffice is not installed in this environment for a full visual re-render.

---

## 2026-07-01 — FR-07 (MFA) documentation regression corrected

**`docs/Technical Decision and Design/technical-design.md`** → v1.5, **`docs/PRD inputs/acceptance-criteria.md`**, **`middleware.ts`**

While reviewing the diagrams in `docs/diagrams` against yesterday's technical-design.md v1.4 gap-analysis update, a documentation regression was found: the gap-analysis pass had resurrected a `/mfa` TOTP challenge route as if it were live — in the project tree, the protected-routes list, and the routes table. In reality, MFA was implemented on 2026-05-20 (S0.6), then removed on 2026-06-12 (`fix: remove orphaned MFA component and page files`) and already correctly demoted to Won't Have in `docs/moscow-feature-register.md` with a documented risk-analysis rationale (worst-case password compromise exposes only draft applications and publicly-registered charity data; no payment data or submission capability; mandatory MFA friction outweighs the marginal security gain for non-technical volunteer users). The regression traced back to a stale `/mfa` entry left in `middleware.ts`'s `PROTECTED` array after the removal, which the gap-analysis picked up without checking whether the page still existed.

Fixed: `middleware.ts` dead `/mfa` entry and comment removed; technical-design.md v1.5 strips all 3 phantom `/mfa` references; acceptance-criteria.md FR-07 explicitly marked `~~Should Have~~` **Won't Have**, criteria retained for historical reference only.

Confirmed with WJ: MFA stays out of v1 permanently for now; may be reconsidered post-launch if user demand or a security incident warrants it. No new decision record was created — `docs/moscow-feature-register.md` already carries the full rationale and is the canonical record of this decision.

---

## 2026-07-01 — CI fix: `validate-migrations` rate-limit failures

**`.github/workflows/ci.yml`**

- `supabase/setup-cli@v2` step now passes `github-token: ${{ secrets.GITHUB_TOKEN }}`.

Overnight and through 2026-06-30, `validate-migrations` failed intermittently across many unrelated pushes (docs-only commits, dependency bumps) with `Failed to resolve latest Supabase CLI release: rate limit exceeded`. The action resolves `version: latest` via the GitHub API; without a token this call is unauthenticated (60 req/hour) and was being exhausted by the volume of CI runs. Passing the built-in `GITHUB_TOKEN` raises the quota to 1000 req/hour per repo. No actual migration files were broken — this was a CI infrastructure issue only.

---

## 2026-06-30 — Technology stack review completed

**`docs/Technical Decision and Design/technology-stack-review-2026-06-30.md`** and `.pdf` added.

Full review of all 10 v1 stack components against current alternatives. Verdict: retain all components.
One new addition recommended: Axiom (structured log management) at P5.4 to close the AI route latency
observability gap (GAP-27). No architectural changes arising from the review.

---

## 2026-06-30 — Tier 2 docs updated — future-phases FP-10 added

**`docs/future-phases.md`** (last updated 2026-05-29 → 2026-06-30)

- FP-10 added: Streaming AI responses deferred post-v1 per ADR-AI-010. All three AI routes use batch mode for v1; streaming requires a UX design change (incremental text render) and is deferred until a Sentry performance baseline is established post-launch.

---

## 2026-06-30 — Tier 2 docs updated — non-functional-requirements, information-architecture-and-navigation

Two Tier 2 documents updated to reflect changes since they were last written. No code changes.

**`docs/non-functional-requirements.md`** (last updated 2026-06-04 → 2026-06-30)

- NFR-04 password requirement corrected: minimum 10 characters → minimum 12 characters, must contain both letters and digits. Reflects Supabase password policy hardened on 2026-06-29.

**`docs/information-architecture-and-navigation.md`** → v1.7 (last updated 2026-06-10 → 2026-06-30)

- Step 1 description updated: funder is now selected from the funder directory picker, not entered as free text (funder directory added 2026-06-01 via DR-FD-001).
- §9 Inactivity: inactivity warning banner row added (55-minute warning; user can dismiss to reset timer). Resolves GAP-22 documentation gap.

---

## 2026-06-30 — Remaining Tier 1 docs updated — data-model, screen-requirements, acceptance-criteria

Three Tier 1 documents updated to reflect changes since they were last written. No code changes.

**`docs/data-model.md`** → v1.3

- `ai_usage_log.request_type` enum updated: `charity_paraphrase` added as third value (migration 20260622000001, applied via SQL Editor).

**`docs/PRD inputs/screen-requirements.md`** (last updated 2026-06-10 → 2026-06-30)

- Screen 2 (Register): password validation updated — minimum 12 characters (was 10), must contain letters and digits (2026-06-29 Supabase prod policy hardening).
- Step 2 (Upload): two new extraction error states — PDF exceeds 200 pages; extraction timeout (30 seconds) (2026-06-22).
- Step 3 (AI Summary): truncation warning banner added — shown when `guidelinesTruncated: true` (2026-06-22). AI kill-switch unavailable state added (2026-06-29).
- Step 4 (Draft Answers): AI kill-switch unavailable state added for "Help me improve this" button (2026-06-29).

**`docs/PRD inputs/acceptance-criteria.md`** (last updated 2026-06-04 → 2026-06-30)

- FR-02 requirement text updated (10→12 chars; letters + digits); AC-FR-02-02 updated; AC-FR-02-02b added.
- AC-FR-23-04 added: 200-page PDF cap rejection.
- AC-FR-23-05 added: extraction timeout handling.
- AC-FR-24-06 added: truncation warning shown when guidelines pre-processed.
- AC-FR-27-03 added: AI kill-switch error state on Step 3.
- AC-FR-27-04 added: AI kill-switch error state on Step 4 AI assist.

---

## 2026-06-30 — technical-design.md updated to v1.4 — gap analysis applied

`docs/Technical Decision and Design/technical-design.md` updated from v1.3 to v1.4. No code changes — documentation brought into line with the current codebase following a gap analysis performed on 2026-06-29.

**Gaps closed:**

| Section              | What changed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| §3 Technology Stack  | Vitest and GitHub Actions added to stack table; AI cap corrected from 20 to 50 req/user/month in operating costs table                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| §4 Project Structure | Full file tree rewrite: added `__tests__/`, `vitest.config.ts`, `instrumentation*.ts`, `sentry.*.config.ts`, `global-error.tsx`, `(authenticated)/error.tsx`, `robots.ts`, `sitemap.ts`, new lib files (`env.ts`, `database.types.ts`, `types.ts`, `application-guard.ts`, `file-validation.ts`, `preprocess-text.ts`, `rate-limit.ts`, `utils.ts`); corrected `next.config.js` → `next.config.ts`; added new public routes (`/terms`, `/privacy`, `/verify-email`) and authenticated routes (`/mfa`)                                                  |
| §5 Auth / Middleware | Updated to `updateSession()` pattern (replacing `createMiddlewareClient`); documented per-request CSP nonce generation; corrected redirect target from `/sign-in` to `/` (landing page)                                                                                                                                                                                                                                                                                                                                                                |
| §6 Database Schema   | Full rewrite to match `data-model.md` (Tier 1): `user_profiles` corrected (`first_name`/`last_name`/`feedback_consent` replacing `email`/`full_name`); `charity_profiles` replaced with thick profile summary (BD-02); `funders` table added; `applications` updated with `funder_id`, `last_exported_at`, `mismatch` status; `application_answers` updated with `char_limit`, `limit_type`, `question_type`, `is_approved` and corrected `answer_source` enum; `ai_usage_log` `request_type` values corrected; RLS table updated to include `funders` |
| §9 API Routes        | `/api/generate-draft` restored as active route; `/api/health` added; `applications.ts` action list updated to include `approveApplication` and `reopenApplication`                                                                                                                                                                                                                                                                                                                                                                                     |
| §11 AI Integration   | `AiSummaryData` type canonical location updated to `lib/types.ts`; type updated with `charLimit`, `limitType`, `eligibilityMismatch`, `mismatchReason`; notes added on XML-tag fencing, Zod `safeParse`, `AI_ENABLED` kill-switch, and atomic `reserve_ai_slot` advisory lock                                                                                                                                                                                                                                                                          |
| §13 Security         | CSP documented as per-request (middleware, nonce-based) rather than static (`next.config.ts`); CSP directives table corrected (no `unsafe-inline` on `script-src`); defence-in-depth table updated (RLS WITH CHECK, Zod env validation, IDOR check, fail-closed cap, CSP nonce, Resend preflight); secrets table updated (`RESEND_API_KEY`, `AI_ENABLED`, split `NEXT_PUBLIC_SENTRY_DSN` / `SENTRY_DSN`)                                                                                                                                               |
| §14 Operations       | Branch name corrected `main` → `master`; GitHub Actions CI documented as active with 4 jobs; `vercel.json` example updated to show all 3 cron jobs; Sentry instrumentation file pattern documented                                                                                                                                                                                                                                                                                                                                                     |

---

## 2026-06-29 — technology-stack.md updated to v1.3 — five missing services documented

**What changed:**

`docs/Technical Decision and Design/technology-stack.md` updated from v1.2 to v1.3. Five services that were already live in production but undocumented in the stack doc have been added:

| Section | Service added                 |
| ------- | ----------------------------- |
| TS-05   | Resend (transactional email)  |
| TS-06   | Sentry EU (error tracking)    |
| TS-07   | Upstash Redis (rate limiting) |
| TS-08   | GitHub Actions (CI pipeline)  |
| TS-09   | Vitest (test framework)       |

The "To Be Set Up Before Development Begins" table (TS-10) has been retired — all accounts are now active. Replaced with a "Registered and active" status table. Stack Summary updated from 11 to 16 rows.

File also moved from `docs/` root to `docs/Technical Decision and Design/` to keep the docs root tidy.

**Why:**
The stack doc was written in April 2026 and not updated as new services were added during development. A gap analysis in June 2026 identified five services running in production with no stack entry. An undocumented stack is a risk for onboarding, handover, and future sessions that check technology decisions.

---

## 2026-06-29 — POST-LAUNCH item 25 resolved: production password policy hardened (VQ-009)

**What changed:**

Supabase prod project (`stanwaejdvlvremtffkf`) Auth settings updated:

| Setting                                | Before | After                   |
| -------------------------------------- | ------ | ----------------------- |
| Minimum password length                | 6      | 12                      |
| Password requirements                  | None   | Letters and digits      |
| Prevent use of leaked passwords        | Off    | On (HaveIBeenPwned API) |
| Secure password change                 | Off    | On                      |
| Require current password when updating | Off    | On                      |

**Why:**
Alan Knox POST-LAUNCH item 25, VQ-009, §2.3 item 25. The previous defaults (6-char minimum, no complexity, no breach check) were too weak for a service holding charity application data. NCSC recommends 12+ characters. The HaveIBeenPwned check silently rejects known-compromised passwords with no friction for users who choose sensible ones.

---

## 2026-06-29 — POST-LAUNCH item 26 resolved: least-privilege key scoping (VQ-021)

**What changed:**

- **AWS:** New IAM user `grant-pathway-prod` created with custom policy `grant.pathway.bedrock.invoke` — single permission `bedrock:InvokeModel` scoped to `arn:aws:bedrock:eu-west-2::foundation-model/anthropic.claude-sonnet-4-6`. New access key applied to Vercel Production env vars. Old `grant-pathway-dev` user (had `AmazonBedrockFullAccess`) retained for dev environment only.
- **Resend:** New API key `grant-pathway-production-send` created with Sending access scoped to `grantpathway.org.uk`. Old Full access key deleted. Vercel `RESEND_API_KEY` updated to new scoped key.
- **Charity Commission:** Read-only by API design — no action required.

**Why:**
Alan Knox POST-LAUNCH item 26, VQ-021, §2.3 item 26. `AmazonBedrockFullAccess` granted every Bedrock operation including model management and training. Resend Full access allowed domain management, API key deletion, and log access. Both are now scoped to the minimum required: invoke one model, send from one domain.

---

## 2026-06-29 — POST-LAUNCH item 27 resolved: SPF/DKIM/DMARC confirmed for grantpathway.org.uk (VQ-022)

**What changed:**

- SPF TXT record updated to add `include:amazonses.com` (Resend sends via Amazon SES): `v=spf1 include:secureserver.net include:amazonses.com -all`
- DKIM confirmed: `resend._domainkey.grantpathway.org.uk` present and Verified in Resend dashboard
- DMARC confirmed: `v=DMARC1; p=quarantine` in place

**Why:**
Alan Knox POST-LAUNCH item 27, VQ-022, §2.3 item 27. Without SPF covering Resend's infrastructure, transactional emails (welcome, inactivity warning, account deletion) risk landing in spam or being rejected. Cross-client email rendering deferred to P5.4 pre-launch testing.

---

## 2026-06-29 — POST-LAUNCH item 28 resolved: master branch protection enabled (VQ-014)

**What changed:**

- GitHub Pro activated on the RapidGlobe personal account.
- Branch protection rule applied to `master` via GitHub API: all four CI jobs required to pass (`lint-and-typecheck`, `test`, `audit`, `validate-migrations`); `strict: true` (branch must be up to date with master before merge); force-pushes and deletions blocked.

**Why:**
Alan Knox POST-LAUNCH item 28, VQ-014, §2.3 item 28. Without branch protection, a push directly to master could trigger a Vercel production deploy before CI completes, or a failed CI could be ignored. Branch protection closes that gap — no merge (or direct push from a PR) reaches master unless all four checks pass.

---

## 2026-06-29 — POST-LAUNCH item 22 resolved: CSP nonce migration — script-src off 'unsafe-inline' (F-08-02, M5)

**What changed:**

- `middleware.ts` — generates a fresh `crypto.randomUUID()` nonce (base64-encoded) on every request; builds the `Content-Security-Policy` header with `'nonce-{nonce}'` on `script-src` (replaces `'unsafe-inline'`); passes nonce to `updateSession`.
- `lib/supabase/middleware.ts` — accepts optional `nonce`; forwards it as `x-nonce` request header in both `NextResponse.next()` calls (including the cookie-refresh path) so the page layout can read it.
- `next.config.ts` — static `Content-Security-Policy` header removed; all other security headers unchanged. CSP is now set per-request in middleware.
- `app/layout.tsx` — made async; calls `await headers()` to make the layout dynamic so Next.js renders it fresh per request and stamps the nonce on its own inline hydration scripts.

**Why:**
Alan Knox POST-LAUNCH item 22, F-08-02 (M5), §2.2 item 22. `'unsafe-inline'` on `script-src` allows any injected inline script to execute — removing it eliminates that XSS vector. A static nonce in `next.config.ts` would be trivially bypassable (same value every request); a per-request nonce is not. TypeScript clean (0 errors).

---

## 2026-06-29 — POST-LAUNCH item 21 resolved: transactional integrity for approve and reopen (F-06-05/06, M9)

**What changed:**

- `docs/migrations/item-21-transactional-integrity.sql` (new) — two Postgres functions: `approve_application` and `reopen_application`. Each performs both table updates (`applications` + `application_answers`) in a single transaction; raises `application_not_found` if the row is missing or not owned by the caller. `SECURITY INVOKER` — RLS applies.
- `actions/applications.ts` — `approveApplication` and `reopenApplication` now call `supabase.rpc()` instead of two separate update calls.
- `lib/database.types.ts` — typed signatures added for both new RPC functions.

**Why:**
Alan Knox POST-LAUNCH item 21, F-06-05/06 (M9), §2.2 item 21. The previous two-step pattern left a window where `applications.status` could be updated but `application_answers.is_approved` not (or vice versa), leaving the application in a permanently inconsistent state visible to the user. Wrapping both writes in one Postgres transaction eliminates the window. Scope limited to approve and reopen — `assembleAndAdvance` is serial with no cross-table race risk, and the deletion paths are handled by Supabase Auth cascade.

---

## 2026-06-29 — POST-LAUNCH item 20 resolved: AI kill-switch added (F-09-03, M15)

**What changed:**

- `app/api/generate-summary/route.ts`, `app/api/generate-draft/route.ts`, `app/api/refine-answer/route.ts` — kill-switch check added as step 0 of each POST handler: if `AI_ENABLED === 'false'`, returns HTTP 503 with `overloaded` error body immediately, before authentication.
- `actions/charity.ts` — `AI_ENABLED !== 'false'` added to the Bedrock paraphrase guard; skips paraphrase and degrades gracefully (empty `whatDoes`/`whoHelps`) when kill-switch is active. Charity Commission lookup is unaffected.
- `.env.example` — `AI_ENABLED=true` added with usage instructions.

**Why:**
Alan Knox POST-LAUNCH item 20, F-09-03 (M15), §2.2 item 20. Provides an immediate lever to disable all AI spend in a runaway-cost incident or Bedrock outage without a code deploy — change `AI_ENABLED=false` in Vercel env vars and redeploy. TypeScript clean (0 errors).

---

## 2026-06-29 — POST-LAUNCH item 19 resolved: SAR procedure documented (Article 15, manual process)

**What changed:**

- `docs/legal/sar-procedure.md` (new) — Internal procedure for handling UK GDPR Article 15
  subject access requests. Covers: receipt and acknowledgement (within 3 working days),
  identity verification, Supabase SQL queries to retrieve all personal data held per user,
  response email template with ZIP attachment, and a running log of requests handled.

**Why:**
Alan Knox POST-LAUNCH item 19, F-05-02 (M12), §2.2 item 19. UK GDPR Article 15 requires a
response to SARs within one calendar month. Decision: manual process is proportionate at
pre-launch scale. Privacy Policy Section 8 already directs users to wjokhia@rapidglobe.com —
no policy change required. Automated self-serve export endpoint deferred to a future phase
once live user volumes justify the build effort.

---

## 2026-06-29 — POST-LAUNCH item 18 resolved: generated Supabase types, createClient<Database>(), AiSummaryData to lib/types.ts

**What changed:**

- `lib/database.types.ts` (new) — Generated from remote Supabase project (`stanwaejdvlvremtffkf`) via `supabase gen types typescript`. Three SECURITY DEFINER RPC function types (`reserve_ai_slot`, `update_ai_slot_token_count`, `cancel_ai_slot`) added manually (CLI did not detect them). `charity_paraphrase` enum value added manually (was applied via SQL Editor, not captured by gen).
- `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/middleware.ts` — `createClient<Database>()` type parameter applied to all three Supabase client factories.
- `lib/types.ts` (new) — `AiSummaryData`, `AiSummaryQuestion`, `AiSummarySection` moved here from `app/api/generate-summary/route.ts`. Re-exported from route to preserve all existing import paths without changes.
- `actions/applications.ts` — Update payload re-typed from `Record<string, unknown>` to `{ current_step: number; draft_status?: string }` (typed client now rejects the loose record type).

**Why:**
Alan Knox POST-LAUNCH item 18, F-06-07 (M10), §2.2 item 18. Typed Supabase clients catch schema mismatches at compile time rather than runtime. Moving shared types to `lib/` removes the dependency on a route file for types used across components and actions. TypeScript clean (0 errors).

---

## 2026-06-22 — POST-LAUNCH items 1–10 resolved: error boundaries, env validation, Resend preflight, truncation UX, RLS hardening, Bedrock timeout, OG/robots/sitemap, extraction bounds, npm audit CI, Sentry instrumentation

**What changed:**

- `app/(authenticated)/error.tsx` (new) — React error boundary for authenticated routes; `Sentry.captureException` in `useEffect`; Try again + Go to dashboard actions.
- `app/global-error.tsx` (new) — Root-level error boundary with minimal `html/body` wrapper; `captureException` on mount.
- `lib/env.ts` (new) — Zod schema validates all eight required server env vars at import time. Process throws if any are missing/invalid.
- `instrumentation.ts` — imports `lib/env.ts` (env check runs before first request) and `sentry.server.config.ts`.
- `instrumentation-client.ts` (new) — Client-side Sentry init hook (Next.js 15 `instrumentation-client`); imports `sentry.client.config.ts`.
- `app/api/account/delete/route.ts` — Preflight check: returns HTTP 503 if `RESEND_API_KEY` is absent, before any data is deleted.
- `app/api/generate-summary/route.ts` — `guidelinesTruncated` flag added to JSON response (tracked from existing `preprocessText` call).
- `components/application-step3-summary.tsx` — Inline warning banner shown when `guidelinesTruncated: true`; advises user to paste most-relevant sections manually.
- `supabase/migrations/20260622000003_rls_hardening.sql` (new) — All RLS policies on five tables recreated: `auth.uid()` → `(select auth.uid())` (once per statement, not per row); `WITH CHECK` added to all four UPDATE policies.
- `app/api/generate-summary/route.ts`, `app/api/generate-draft/route.ts`, `app/api/refine-answer/route.ts` — All `messages.create` calls (including JSON retry branches) now pass `{ signal: AbortSignal.timeout(60_000) }` as the second argument.
- `app/layout.tsx` — `metadataBase: new URL('https://grantpathway.org.uk')`, `openGraph`, and `twitter` cards added to root metadata.
- `app/robots.ts` (new) — Disallows `/api/`, `/account/`, `/dashboard/`; references sitemap.
- `app/sitemap.ts` (new) — Five public routes: home, login, register, terms, privacy.
- `lib/extract-text.ts` — 30-second `Promise.race` extraction timeout (returns `extraction_timeout`); PDF page count capped at 200 pages (returns `extraction_failed` if exceeded).
- `.github/workflows/ci.yml` — `audit` job added: `npm audit --audit-level=high` on every push/PR.

**Why:**
Alan Knox POST-LAUNCH items §2.1 items 8–14, §2.4 item 32, §2.5 items 34 + 36. TypeScript clean (0 errors), 22/22 tests pass.

---

## 2026-06-22 — Five LAUNCH-BLOCKERs resolved: DB indexes, prompt injection, cap TOCTOU, Vitest, migration CI gate

**What changed:**

- `supabase/migrations/20260622000000_add_performance_indexes.sql` — four missing indexes added: `ai_usage_log(user_id, created_at)` (cap check), `applications(user_id, updated_at DESC)` (dashboard), `application_answers(user_id)` (RLS/upload), `applications(funder_id)` (funder FK).
- `supabase/migrations/20260622000001_add_charity_paraphrase_enum.sql` — adds `charity_paraphrase` to `ai_request_type` enum (apply via SQL Editor, not CLI — `ALTER TYPE ADD VALUE` cannot run in a transaction).
- `supabase/migrations/20260622000002_ai_cap_rpc.sql` — three SECURITY DEFINER functions: `reserve_ai_slot` (advisory lock + count + insert placeholder atomically), `update_ai_slot_token_count`, `cancel_ai_slot`. Closes the count-then-insert TOCTOU.
- `lib/prompts.ts` / `AI_SYSTEM_PROMPT` — added XML data-isolation directive. All four prompt builders now wrap untrusted user content in XML tags: `<funder_guidelines>`, `<question>`, `<original_answer>`, `<funder_summary>`, `<questions>`, `<charitable_objects>`.
- `app/api/generate-summary/route.ts`, `app/api/generate-draft/route.ts`, `app/api/refine-answer/route.ts` — replaced manual count + insert with `reserve_ai_slot` RPC; `cancel_ai_slot` called on Bedrock or parse error; `update_ai_slot_token_count` called on success. Added Zod safeParse for all AI JSON responses.
- `actions/charity.ts` — same RPC pattern applied; `paraphraseSchema` Zod validation added; XML fencing on `buildParaphrasePrompt`.
- `vitest.config.ts`, `package.json` — Vitest installed; `npm test` runs `vitest run`; 22 tests across 3 files (pure functions + IDOR guard + cap thresholds).
- `__tests__/prompts.test.ts`, `__tests__/ai-cap.test.ts`, `__tests__/upload-idor.test.ts` — first test suite.
- `.github/workflows/ci.yml` — `test` job (runs `npm test`) and `validate-migrations` job (Supabase CLI, `db start` + `db reset`) added.

**Why:**
Alan Knox initial assessment LAUNCH-BLOCKER items §2.1 item 5 (indexes), §2.1 item 7 (prompt injection), §2.2 item 16 (cap TOCTOU), §2.2 item 17 (test strategy), §2.4 item 30 (migration CI gate). All five resolved. TypeScript clean (0 errors), 22/22 tests pass.

---

## 2026-06-22 — Authenticate and meter charity paraphrase in `lookupCharity`

**What changed:**

- `actions/charity.ts` — `lookupCharity` now calls `getUser()` at the top and returns `{ ok: false, reason: 'unavailable' }` for unauthenticated callers. Before the Bedrock paraphrase call: monthly cap checked fail-closed (query error or cap exceeded → skip Bedrock, degrade gracefully to empty `whatDoes`/`whoHelps`); `aiRatelimit.limit()` burst check applied. After a successful paraphrase: `ai_usage_log` row inserted (`request_type: 'charity_paraphrase'`, `application_id: null`).

**Why:**
Independent system specialist review flagged: _"Authenticate and meter the charity paraphrase: add `getUser()` to `lookupCharity`, write `ai_usage_log`, and apply the cap/burst limit."_ The Bedrock paraphrase in `lookupCharity` was an unguarded AI call — no auth, no usage recording, no cap or rate-limit enforcement. A user could trigger it without a session, or exhaust cost by repeated lookups without it counting toward their monthly limit. Degradation is preserved: if cap/rate blocks the paraphrase, the Charity Commission name and registration number are still returned successfully. TypeScript clean (0 errors).

---

## 2026-06-22 — Consolidate `MONTHLY_CAP` and `MODEL` into `lib/prompts.ts`

**What changed:**

- `lib/prompts.ts` — `MONTHLY_CAP = 50` and `APPROACHING_LIMIT_THRESHOLD = 40` exported alongside `MODEL`; single source of truth for all AI constants.
- `app/api/generate-summary/route.ts`, `app/api/generate-draft/route.ts`, `app/api/refine-answer/route.ts` — local `MONTHLY_CAP` and `APPROACHING_LIMIT_THRESHOLD` declarations removed; constants now imported from `lib/prompts`.
- `actions/charity.ts` — duplicate `const MODEL = 'anthropic.claude-sonnet-4-6'` (line 16) removed; `MODEL` now imported from `@/lib/prompts`.

**Why:**
Independent system specialist review flagged: _"Reconcile `MONTHLY_CAP` (50 in summary/refine, 20 in draft) into one shared constant; import `MODEL` from `lib/prompts.ts` everywhere instead of the duplicate in `charity.ts:16`."_ The `generate-draft` cap had already been corrected to 50 in a prior session but remained a local copy. Consolidating into `lib/prompts.ts` ensures a single update point — no risk of routes drifting apart again. TypeScript clean (0 errors).

---

## 2026-06-22 — AI cap-count made fail-closed across all three AI routes

**What changed:**

- `app/api/generate-summary/route.ts` — destructures `error` from the `ai_usage_log` count query; returns 500 (`server_error`) immediately if the query fails, instead of defaulting `usageCount ?? 0` to 0.
- `app/api/generate-draft/route.ts` — same fix applied.
- `app/api/refine-answer/route.ts` — same fix applied.

**Why:**
Independent system specialist review flagged as a launch-blocker (F-01-01): _"Make the AI cap-count fail closed: inspect the count-query `error` and refuse the call on error instead of defaulting `usageCount ?? 0` to 0."_ If the count query fails and the result is treated as zero, the monthly cap is silently bypassed — a user (or attacker) triggering a DB error on the usage log could make unlimited AI calls, resulting in unbounded Bedrock cost. The fix refuses all three AI calls with HTTP 500 if the cap cannot be read. TypeScript clean (0 errors).

---

## 2026-06-22 — Cross-user file-read IDOR closed on upload/process; Sentry breadcrumb type fix

**What changed:**

- `app/api/upload/process/route.ts` — storage path prefix check added: before the service-role download, the route now verifies `path.startsWith(user.id + '_')` and returns 403 if not. Combined with the existing `applicationId` ownership check, this closes the cross-user file-read IDOR.
- `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts` — breadcrumb scrubbing corrected: `event.breadcrumbs` is `Breadcrumb[]` in this SDK version (not `{ values: Breadcrumb[] }`); accessing `.values` silently resolved to `Array.prototype.values` and the scrubbing was never executing. TypeScript now clean (0 errors).

**Why:**
Independent system specialist review flagged as a launch-blocker: _"Add the ownership check on the upload path: before the service-role download, reject any `path` not prefixed with the caller's id and verify `applicationId` ownership. Closes the cross-user file-read IDOR."_ The `applicationId` ownership check (BOLA fix, 2026-06-21) was already in place; the storage path prefix check is the new addition. The Sentry breadcrumb type error was discovered during the typecheck run for this fix.

---

## 2026-06-22 — Sentry `beforeSend` hardened; storage paths and charity content scrubbed

**What changed:**

- `sentry.client.config.ts` — `beforeSend` hook updated: strips `event.request.data` (request body), `Authorization`/`Cookie` headers, and sensitive breadcrumb data keys (`guidelinesText`, `answerText`, `answer_text`, `path`, `signedUrl`).
- `sentry.server.config.ts` — same hardening applied.
- `sentry.edge.config.ts` — same hardening applied.
- `docs/Alan Knox Audits/initial-assessment-report-findings.md` — fourth review item logged as Actioned.

**Why:**
Independent system specialist review flagged as a launch-blocker: _"Confirm whether the storage path and guideline/answer text reach Sentry; a leak escalates the upload IDOR to Critical."_ Audit confirmed `sendDefaultPii` is not set (defaults false), so request bodies are not auto-captured by Sentry. However, all three `beforeSend` hooks have been hardened defensively to strip: the full request body (which may contain `guidelinesText` or `answerText` from API calls); `Authorization` and `Cookie` request headers; and any breadcrumb data entries keyed by storage-path or charity-content field names. Storage path (user UUID + timestamp) is now blocked from reaching Sentry regardless of how it might appear in breadcrumbs. Launch-blocker closed; IDOR severity remains at its pre-existing level — not escalated.

---

## 2026-06-22 — Supabase Pro activated; backups confirmed; restore drill RTO 6 min

**What changed:**

- `docs/Technical Decision and Design/ADR-DATA-005-backup-strategy.md` — Production verification section added recording all confirmed checks, RTO (6 minutes), and RPO (≤24 hours).
- `docs/Implementation Plan/IMPLEMENTATION-STATUS.md` — P5.4 Supabase pause warning replaced with completion note; Notes entry added for 2026-06-22.
- `docs/Alan Knox Audits/initial-assessment-report-findings.md` — third review item logged as Actioned.

**Why:**
Independent system specialist review flagged as a launch-blocker: _"Confirm the project is London/UK on a tier with daily backups, and run the first restore drill to record an RTO and RPO."_ All items confirmed on 2026-06-22: Supabase Pro activated on `grant-pathway-prod`; region AWS | eu-west-2; compute MICRO; daily physical backups running at ~02:55 UTC with 7-day retention (8 backups visible). Restore drill completed via "Restore to new project" — elapsed time 6 minutes (RTO), RPO ≤24 hours. Test project deleted post-drill. Launch-blocker closed.

---

## 2026-06-22 — Sentry region confirmed EU; privacy policy accurate; P5.4 updated

**What changed:**

- `docs/Implementation Plan/IMPLEMENTATION-STATUS.md` — P3.7 note updated: EU region confirmed 2026-06-22, production DSN empty noted as expected pre-launch, P5.4 flagged as the action point.
- `docs/Implementation Plan/IMPLEMENTATION-PLAN.md` — P5.4 Sentry step updated: region pre-confirmed as EU, explicit note to set `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN` in Vercel Production at P5.4.
- `docs/Alan Knox Audits/initial-assessment-report-findings.md` — second review item logged as Actioned.

**Why:**
An independent system specialist review flagged as a launch-blocker: _"Confirm whether the Sentry org is EU or US, and correct the served privacy policy to match the code."_ Sentry Organisation Settings (org: `rapidglobe-ltd`) confirmed Data Storage Region as **European Union (EU)**. The privacy policy v1.2 statement is accurate — no correction needed. The production Vercel DSN is empty (Sentry not yet active in production), which is expected pre-launch and covered by P5.4. The launch-blocker is closed.

---

## 2026-06-22 — Bedrock zero-retention launch-blocker closed; AWS DPA confirmed

**What changed:**

- `docs/legal/AWS-navigating-gdpr-compliance.pdf` (new) — AWS whitepaper "Navigating GDPR Compliance on AWS" added to the legal folder as the authoritative reference for the AWS Data Processing Addendum.
- `docs/legal/AWS-DPA-reference.md` (new) — Reference summary confirming DPA status, confirmed checks, and links to related decision records.
- `docs/decisions/DR-DP-003-data-ownership.md` — Review note added (2026-06-22) recording the two production account checks completed and formally closing the launch-blocker.
- `docs/decisions/DR-DP-002-data-hosting.md` — Pre-launch actions updated: three of four marked complete with dates; EU Geo fallback live test remains outstanding.

**Why:**
An independent system specialist review identified as a launch-blocker: _"Confirm the production Bedrock account in eu-west-2 enforces zero retention and no training-data use."_ Two checks were completed against the live AWS production account on 2026-06-22:

1. **Model Invocation Logging** — confirmed disabled in the AWS Bedrock Console (eu-west-2 Settings). Prompts and responses are not captured to S3 or CloudWatch.
2. **AWS Data Processing Agreement** — confirmed automatically in force for the RapidGlobe AWS account. The AWS DPA is incorporated into the AWS Service Terms and applies to all customers without separate acceptance (verified against the AWS GDPR whitepaper, February 2021 Supplementary Addendum).

The launch-blocker is closed. One pre-launch action remains open: a live test call to confirm EU Geo fallback routing (`eu.anthropic.claude-sonnet-4-6`) before go-live.

> **Phase 0–4 entries** (up to 2026-05-22) have been moved to [CHANGELOG-ARCHIVE.md](CHANGELOG-ARCHIVE.md) to keep this file manageable. All entries are preserved in full.

---

## 2026-06-21 — Dependabot vulnerabilities resolved; edge middleware wired up; IDOR/BOLA fix

### 1. Dependabot vulnerabilities resolved (6 open alerts cleared)

**What changed:**

- `@sentry/nextjs` upgraded `10.56.0` → `10.59.0` — resolves `@opentelemetry/core` (2.7.1 → 2.8.0, unbounded memory allocation in W3C Baggage propagation, CVE moderate).
- `package.json` overrides extended: `hono >=4.12.25` (installed 4.12.26), `@babel/core >=7.29.6`, `js-yaml >=4.2.0` — all transitive dependencies with no patch available via direct-dependency upgrades.
- Stale `eslint-disable-next-line react-hooks/set-state-in-effect` comment removed from `components/application-step2-form.tsx` — the rule no longer fires after the `eslint-plugin-react-hooks` update; the suppression became a lint warning under `--max-warnings 0`.
- `npm audit` now reports **0 vulnerabilities**.

**Why:**

Six Dependabot alerts were open on the repository (1 high, 5 moderate). All were in transitive dependencies — `hono` (via `shadcn` → `@modelcontextprotocol/sdk`) and `@opentelemetry/core` (via `@sentry/nextjs`). The `hono` vulnerabilities (CORS wildcard reflection, Lambda@Edge header handling, serve-static path traversal, body limit bypass) affect applications using hono as their HTTP server; Grant Pathway uses Next.js as its server and hono is not active in production — risk was low but alerts needed clearing. The `@opentelemetry/core` issue (unbounded memory in W3C Baggage propagation) is relevant as Sentry uses OpenTelemetry for tracing.

---

## 2026-06-21 — Edge middleware wired up; IDOR/BOLA fix

### 1. middleware.ts created — edge middleware now active (ADR-SEC-001)

**What changed:**

- `middleware.ts` created at project root — exports `proxy` as `middleware` and re-exports `config` from `proxy.ts`.

**Why:**

At Phase 0 bootstrap, a comment in `proxy.ts` incorrectly stated that Next.js 16 renamed `middleware.ts` to `proxy.ts`. Next.js has never made this change — the framework always looks for `middleware.ts` at the project root. The auth logic in `proxy.ts` was correctly written at P3.4 (2026-05-19) but was never connected to the Next.js middleware pipeline. As a result, the edge-level route protection (redirect unauthenticated users from protected routes, redirect authenticated users away from auth-only routes, refresh session tokens on every request) was never executing. The gap was masked by server-side auth checks on every API route and RLS on every table. The fix is a single re-export file. Discovered during a vibe-coding security review on 2026-06-21.

---

### 2. IDOR/BOLA fix: applicationId ownership check added to /api/upload/process

**What changed:**

- `app/api/upload/process/route.ts` — added an ownership verification query before processing. The route now checks that the supplied `applicationId` belongs to the authenticated user (`eq('user_id', user.id)`) before downloading or processing the file. Returns `404` if the check fails.

**Why:**

A security review identified that this route accepted `applicationId` from the request body without verifying ownership. Every other sensitive API route in the application (export, generate-summary, generate-draft, refine-answer) already enforced ownership via a `user_id` column check, but `/api/upload/process` was missing that guard. An authenticated user could have passed another user's `applicationId` in the request body to associate a processed file with an application they do not own — a Broken Object Level Authorisation (BOLA/IDOR) vulnerability. The fix adds the same ownership pattern already in use across all other routes.

Note: the risk was partially mitigated by all IDs being UUIDs (not guessable sequential integers) and by the file `path` being namespaced by the uploader's own `user.id`. The ownership check closes the gap fully.

---

## 2026-06-17 — Privacy policy Section 7 corrected; legal docs consolidated to docs/legal/; generate-draft cap aligned to 50

Three issues found and fixed during the Phase 4→5 gate ADR re-review session (ADR-SEC-005 and ADR-DATA-005):

### 1. generate-draft monthly cap corrected from 20 → 50

**What changed:**

- `app/api/generate-draft/route.ts` — `MONTHLY_CAP` raised from 20 to 50; `APPROACHING_LIMIT_THRESHOLD` raised from 16 to 40.
- `docs/Technical Decision and Design/ADR-SEC-005-api-rate-limiting.md` — Context and Decision sections updated to state 50 req/month throughout; revision history row added.

**Why:**
`MONTHLY_CAP` on `generate-draft` was never updated when the monthly cap was raised to 50 on 2026-05-28 (Step 4 redesign). The 2026-06-08 readiness review confirmed `generate-summary` and `refine-answer` both enforced 50 but missed `generate-draft`. Users had a cap of 20 on draft generation while the other two AI routes enforced 50 — discovered during ADR-SEC-005 re-review.

### 2. Privacy policy Section 7 — incorrect GDPR disclosure on live /privacy page

**What changed:**

- `docs/legal/privacy-policy.md` — Already correct (updated when ADR-DATA-005 was decided, 2026-05-26).
- `docs/privacy-policy.md` (root level, now deleted) — Section 7 incorrectly stated "we do not retain a backup of your data after deletion". This was the file the live `/privacy` page was actually serving. Corrected before deletion to accurately disclose the 7-day automated backup retention window (Supabase Pro daily backups, eu-west-2).

**Why:**
The live `/privacy` page routed to the root-level `docs/privacy-policy.md`, which was not updated when ADR-DATA-005 introduced the 7-day backup commitment on 2026-05-26. The `docs/legal/privacy-policy.md` file had the correct disclosure, but the app was reading the wrong file. This was a GDPR Article 17 compliance gap: users were told no backup is retained after deletion, but Supabase Pro retains automated daily backups for 7 days before rotation.

### 3. Legal docs consolidated to docs/legal/ as single authoritative location

**What changed:**

- `docs/privacy-policy.md` and `docs/terms-of-service.md` (root level) — deleted via `git rm`.
- `app/(public)/privacy/page.tsx` — `readFile` path updated from `docs/privacy-policy.md` to `docs/legal/privacy-policy.md`.
- `app/(public)/terms/page.tsx` — `readFile` path updated from `docs/terms-of-service.md` to `docs/legal/terms-of-service.md`.

**Why:**
Two copies of each legal document existed and had drifted. `docs/legal/` was already the location of the authoritative privacy policy (since ADR-DATA-005 on 2026-05-26) but the page routes still served the root-level copies. Consolidation to `docs/legal/` as the single location eliminates the drift risk.

> **Correction to 2026-06-10 entry below:** The 2026-06-10 "Terms of Service and Privacy Policy pages live" entry states the pages read from `docs/terms-of-service.md` and `docs/privacy-policy.md`. Those root-level files have now been deleted; both pages serve from `docs/legal/` as of this entry.

---

## 2026-06-15 — Dependency updates merged and smoke tested

**What changed:**

Five Dependabot PRs merged to master (#37–#41):

| Package              | Before  | After   | Risk                        |
| -------------------- | ------- | ------- | --------------------------- |
| `@types/node`        | 25.9.1  | 25.9.3  | Low — types only            |
| `eslint-config-next` | 16.2.7  | 16.2.9  | Low — dev/lint only         |
| `lucide-react`       | 1.17.0  | 1.18.0  | Low — icons only            |
| `@anthropic-ai/sdk`  | 0.100.1 | 0.104.1 | Medium — core AI library    |
| `@supabase/ssr`      | 0.10.3  | 0.12.0  | Medium — auth/session layer |

**Why:**

Routine dependency hygiene. The `@supabase/ssr` bump (0.10.3 → 0.12.0) rewrote the cookie architecture but our codebase already used the `getAll`/`setAll` interface introduced in 0.5.0, so no code changes were required. The `@anthropic-ai/sdk` bump (0.100.1 → 0.104.1) included minor API additions; no breaking changes to our usage patterns.

**Smoke test result (2026-06-15, local dev):**

- Login / session persistence ✅ (Supabase SSR auth layer working)
- Dashboard data load ✅ (3 applications rendered, AI usage counter correct)
- Step 4 Q&A interface ✅ (page loads, question sections populated from DB)
- AI "Help me improve this" ✅ (`/api/refine-answer` returned 200, 317 tokens via Bedrock, suggestion rendered in UI)
- No console errors on any tested page

Note: the `.next` build cache from the previous dev server run needed to be cleared before the step pages would compile correctly under the new versions. No code changes required.

---

## 2026-06-13 — Final Grant Pathway logo implemented

**What changed:**

- `components/logo.tsx` — replaced hand-coded SVG placeholder with `next/image` referencing the real brand asset (`/public/images/logo.png`). The PNG was created in Canva AI and exported with transparent background (1562×560px).
- `public/images/logo.png` — final logo: teal arc + orange person figure icon, "Grant Pathway" two-word wordmark in dark teal. Works on all white/light backgrounds used by both navs.
- `public/images/logo-white-wordmark.png` — retained for dark/teal background contexts (emails etc.).

**Why:**
After multiple iterations attempting to hand-code the original logo as SVG (blocked by Canva exporting raster PNGs disguised as SVG), the decision was made to create a new logo using Canva AI with clear brand requirements. The new design is cleaner, more scalable, and professionally executed.

---

## 2026-06-12 — Logo icon mark updated to match brand design

**What changed:**

- `components/logo.tsx` — Placeholder SVG icon replaced with hand-coded SVG accurately matching the Canva brand asset. The icon mark is three orange elements: a head circle (top), a tall left vertical bar, and a G-arc with horizontal crossbar. The dark wordmark ("Grant" in teal, "Pathway" in dark) is retained — it works on white/light backgrounds used by both navs.
- `public/images/logo-white-wordmark.png` — Canva export (transparent background, white wordmark) added for use in dark/teal contexts such as email templates.

**Why:**
The Canva-exported SVG file was a base64-encoded PNG embedded in an SVG wrapper (309 KB), not a true vector. The PNG export has a white wordmark suitable only for dark backgrounds, while both nav bars use `bg-white`. The solution is a hand-coded SVG icon mark (faithful to the brand) combined with the existing CSS text wordmark, giving correct rendering on all backgrounds without needing multiple PNG variants in the component.

---

## 2026-06-12 — Two-factor authentication removed (FR-07 demoted to Won't Have)

**What changed:**

- `components/account-settings-form.tsx` — MFA section removed from Account Settings UI. `mfaEnabled` and `mfaFactorId` props removed.
- `app/(authenticated)/account/page.tsx` — `supabase.auth.mfa.listFactors()` call removed; component now only reads email.
- `actions/auth.ts` — `mfaEnroll`, `mfaVerifyEnrollment`, `mfaUnenroll`, `verifyMfaSignIn` actions removed. MFA assurance-level check and `/mfa` redirect removed from `signIn`.
- `docs/moscow-feature-register.md` — FR-07 demoted from Should Have to Won't Have.
- `docs/non-functional-requirements.md` — NFR-04 MFA row updated to reflect removal.

**Why:**
Risk analysis confirmed the worst-case password compromise is low severity for Grant Pathway: an attacker can view draft applications and charity profile data (all of which is publicly registered information for UK charities), but cannot access payment data (none exists), cannot submit applications on the charity's behalf (export is a file download the charity must manually submit), and cannot reach financial figures (never stored). The marginal security gain of optional MFA does not justify the friction it introduces for non-technical volunteer users — the primary persona. FR-07 was already Should Have (not Must Have); the decision is to not offer it in v1 or subsequent phases unless the product's data sensitivity materially increases.

---

## 2026-06-12 — Step 5: Back link replaced with Re-open (loop bug fix)

**What changed:**

- `components/application-step5-approve.tsx` — "Back" link removed from Step 5. "Re-open application to make changes" is now always shown, regardless of approval state. Unused `Link` import removed.
- `docs/PRD inputs/screen-requirements.md` — Back link row replaced with Re-open link row.

**Why:**
Step 4 (`app/(authenticated)/applications/[id]/step/4/page.tsx` line 49) unconditionally redirects to Step 5 when `draft_status === 'assembled'`. Since draft_status is always 'assembled' when a user reaches Step 5, clicking Back from Step 5 immediately bounced them straight back to Step 5 — an unescapable loop. The Back link gave the appearance of working navigation but never functioned. Re-open is the only correct route back to Step 4 as it resets `draft_status` to `in_progress`, clears the assembled draft, and redirects to Step 4 via the server action.

---

## 2026-06-12 — Step 5: approve + download collapsed into a single action

**What changed:**

- `components/application-step5-approve.tsx` — The separate "Approve my application" button and its confirmation modal have been removed. The download buttons (Word / plain text) are now disabled until all three confirmation checkboxes are ticked. On first click they approve the application and trigger the download in a single action. The re-export warning modal (for repeat downloads), re-open modal, and the three declaration checkboxes are all unchanged.
- `docs/PRD inputs/screen-requirements.md` — Step 5 table updated: Approve button row removed; Export buttons row updated to describe the merged approve-and-download behaviour.
- `docs/PRD inputs/acceptance-criteria.md` — AC-FR-33-01, AC-FR-33-02, AC-FR-33-03 rewritten to reflect new flow; AC-FR-39-03 updated to remove reference to the old approval button.

**Why:**
The previous flow required 6 interactions to complete a first download (3 checkbox ticks → Approve button → modal confirm → download click). The confirmation modal was redundant — three deliberate checkbox ticks already demonstrate intent; asking again immediately after added friction without adding safety. Collapsing approve + download reduces the flow to 4 interactions (3 checkbox ticks → download click) while preserving all legal declarations and the re-export / re-open safeguards.

---

## 2026-06-12 — AI suggestion card: "Use this version" renamed to "Use this improved version"

**What changed:**

- `components/application-step4-draft.tsx` — Button label on the AI suggestion card changed from _"Use this version"_ to _"Use this improved version"_.
- `docs/PRD inputs/screen-requirements.md` — AI assist button row updated to document the suggestion card buttons including the new label.
- `docs/PRD inputs/acceptance-criteria.md` — Acceptance criterion updated to match new button label.

**Why:**
The original label "Use this version" was ambiguous — it was unclear what "version" referred to without reading the surrounding context. "Use this improved version" is explicit: it tells the user exactly what they are accepting, reinforcing that the AI has refined their answer rather than replaced it.

---

## 2026-06-12 — Register button hidden on /privacy and /terms pages

**What changed:**

- `components/nav-public.tsx` — "Register — it's free" button now hidden on `/privacy` and `/terms` in addition to the existing `/register` and `/verify-email` exclusions.
- `docs/PRD inputs/screen-requirements.md` — Public navigation bar spec updated to reflect the new exclusions.

**Why:**
The register button is out of context on legal document pages. Visitors arrive there from footer links or search results to read policy content; a promotional CTA alongside legal text is inappropriate and clutters the header.

---

## 2026-06-11 — Six new funders added to dropdown (MK Community Foundation × 4, Baily Thomas × 2)

**What changed:**

- New migration `supabase/migrations/20260611000001_add_mkcf_and_baily_thomas_funders.sql` adds 6 funder rows.
- `docs/target-funder-list.md` updated to v1.1 with all 6 new entries.

**MK Community Foundation — 4 separate dropdown entries (one per grant tier):**

| Entry                                                  | funder_type | grant_range        |
| ------------------------------------------------------ | ----------- | ------------------ |
| MK Community Foundation — Seed Grants                  | structured  | Up to £750         |
| MK Community Foundation — Sapling Grants               | structured  | £750–£5,000        |
| MK Community Foundation — Oak Grants                   | structured  | £5,001–£15,000     |
| MK Community Foundation — Strategic Partnership Grants | narrative   | Above £15,000 p.a. |

Seed, Sapling and Oak use the MKCF online portal with discrete scored questions (structured). Strategic Partnership is an email EOI + invited full proposal — no portal, bespoke process (narrative).

**Baily Thomas — 2 separate dropdown entries (one per tier):**

| Entry                            | funder_type | grant_range  |
| -------------------------------- | ----------- | ------------ |
| Baily Thomas — Small Grants      | structured  | Up to £5,000 |
| Baily Thomas — General Programme | structured  | £9,000+      |

Both use the same BenefactorCloud portal with discrete word-limited fields. Learning disability focus only (eligibility confirmed in guidelines).

**Why:** WJ instruction 2026-06-11. Sources: MKCF grant criteria PDFs (Nov 2025); Baily Thomas General Application form (Mar 2024).

---

## 2026-06-10 — Register button hidden on /verify-email

**What changed:**

- `components/nav-public.tsx` — The "Register — it's free" nav button is now hidden on `/verify-email` as well as `/register`. A comment in the component records both exclusions and the reasoning.

**Why:** WJ's walkthrough test of the registration journey reached the "Email verified" screen and found the nav still offering "Register — it's free" — to a user who has just completed registration. Same circular-navigation rationale as the 2026-06-09 NavPublic clean-up (Register hidden on `/register`).

**Also checked, no change needed:** WJ reported the footer Terms/Privacy links opening in the same tab on this screen. The deployed page already serves `target="_blank"` on both (verified via curl against production) — the same-tab behaviour was a browser-cached copy of the pre-deploy page.

**Documentation updated:** `information-architecture-and-navigation.md` v1.6 (nav table); `PRD inputs/screen-requirements.md` (global elements).

---

## 2026-06-10 — Supabase production project pause warnings: accepted until Phase 5 (decision)

**What changed:** No code change. A decision was made and recorded after Supabase emailed a 7-day-inactivity pause warning for the production project `grant-pathway-prod` (ID `mvmjryipieepvsjudche`).

**Investigation findings:**

- The Vercel Pro crons are running correctly, but they generate activity on whichever Supabase project the deployment's env vars point at — and production still points at the **dev** project (P5.4 env var switch not yet done).
- The prod project therefore sits idle on the free tier, which auto-pauses after 7 days without API activity. It currently holds no schema and no data.

**Decision (Wac, 2026-06-10):** Accept the pause warnings (and any actual pause) until Phase 5, rather than activating Supabase Pro early. Rationale: nothing of value is in the prod database; a paused project restores with one click within 90 days; Phase 5 is expected within 2–3 weeks, comfortably inside that window; and ADR-DATA-005 already schedules the Pro upgrade (which permanently ends pausing and enables daily backups) for pre-go-live.

**Consequence recorded in IMPLEMENTATION-STATUS P5.4:** the opening steps of P5.4 are now (1) unpause `grant-pathway-prod`, (2) activate Supabase Pro per ADR-DATA-005, (3) apply migrations, (4) switch production env vars — with an explicit warning not to switch env vars while funder testing still runs against the production URL on the dev database.

---

## 2026-06-10 — No-dead-ends fix: footer legal links open in a new tab; public nav logo links home

**What changed:**

- `components/site-footer.tsx` — The Privacy Policy and Terms of Service footer links now open in a new tab (`target="_blank"` with `rel="noopener noreferrer"`), matching the register form's consent-checkbox links. Each link carries a visually hidden "(opens in a new tab)" hint for screen readers.
- `components/nav-public.tsx` — The logo on the public navigation bar now links to `/` (previously deliberately unlinked). Signed-in users who click it are redirected on to `/dashboard` by the existing auth middleware.

**Why:** WJ's UX review of the new legal pages found a dead end: clicking a footer legal link navigated in the same tab, and the legal pages offered no route back (logo unlinked, only nav action "Register"). The user's sole way back was the browser Back button — a breach of the IA document's "No dead ends" principle. Worse for signed-in users: the footer appears on authenticated pages too, so the same-tab link pulled them out of an in-progress application. New-tab links fix the return journey for all footer entry points; the linked logo covers visitors who arrive at `/terms` or `/privacy` directly (search result, emailed link) and have no originating tab.

**Documentation updated:** `information-architecture-and-navigation.md` v1.5 (nav logo behaviour, footer link behaviour); `PRD inputs/screen-requirements.md` (global elements, Screen 10/11 notes).

---

## 2026-06-10 — Terms of Service and Privacy Policy pages live at /terms and /privacy

**What changed:**

- `app/(public)/terms/page.tsx` and `app/(public)/privacy/page.tsx` (new) — The legal pages now exist as routes. Each page reads its markdown source from `docs/` at build time and is statically prerendered, so `docs/terms-of-service.md` and `docs/privacy-policy.md` remain the single authoritative sources — the published page can never drift from the file a solicitor reviews.
- `components/legal-document.tsx` (new) — Shared server component rendering legal markdown with `react-markdown` + `remark-gfm` (GFM needed for the Privacy Policy's tables), styled to the app's design tokens. Headerless source tables (e.g. the company details table) have their empty header row hidden rather than rendering a blank stripe.
- **Dependencies added:** `react-markdown`, `remark-gfm`. Chosen over `@next/mdx` because the content is plain markdown read from `docs/` (not MDX pages in `app/`), needing no `next.config` changes or `mdx-components.tsx`.
- `components/site-footer.tsx` — Footer privacy link corrected from `/privacy-policy` (404) to `/privacy`, aligning with the register form's consent-checkbox link. Both legal pages are reachable from the footer (all pages) and the register form (new tab).
- `docs/privacy-policy.md` — Trailing "Last updated" date corrected from 22 May 2026 to 8 June 2026 to match the header date (the footer line was missed in the 2026-06-08 readiness review update).
- Routes are accessible in any auth state — they appear in neither the middleware's `PROTECTED` nor `AUTH_ONLY` lists, so signed-in users are not redirected away.

**Documentation updated:** `information-architecture-and-navigation.md` v1.4 (site map, route reference, access control, footer); `PRD inputs/screen-requirements.md` (Screens 10 and 11 added; stale unauthenticated-nav description from the 2026-06-09 NavPublic change also corrected); `IMPLEMENTATION-STATUS.md` (P5.1/P5.6 progress notes).

**Why:** P5.1 and P5.6 require the Terms of Service and Privacy Policy to be published, and the register form already linked to both routes — until now those links (and the footer's) led to 404s. **Still outstanding for P5.1:** the `[TO BE CONFIRMED]` effective dates in both documents must be set, and a solicitor should review both (particularly the Privacy Policy, UK GDPR) before go-live.

---

## 2026-06-09 — NavPublic: Sign in link removed; Register button hidden on /register; register form link wrapping fixed

**What changed:**

- `components/nav-public.tsx` — Two UX fixes to the public navigation bar:
  1. **"Sign in" link removed entirely.** The link pointed to `/` (the sign-in page) but appeared on every public page including the sign-in page itself — a circular no-op on that page and redundant on all others (every public-facing form already has a contextual sign-in link). Removing it de-clutters the nav without losing any user journey.
  2. **"Register — it's free" button hidden on `/register`** using `usePathname()`. When a user is already on the registration page, showing a button to navigate there is circular. The component was converted to a Client Component (`'use client'`) to support the `usePathname()` hook; the button renders on all other public pages unchanged.

- `components/register-form.tsx` — `whitespace-nowrap` class added to the Terms of Service and Privacy Policy `<a>` elements to prevent mid-phrase line breaks (e.g. "Terms of" / "Service" on separate lines).

**Why:** Both nav issues were identified during a UX review of the sign-in / registration flow. Circular or duplicate navigation links cause confusion — a user seeing "Sign in" in the nav while already on the sign-in page, or "Register" while on the registration page, questions whether they are in the right place. The wrapping fix is a polish item ensuring the consent checkbox text reads cleanly at all viewport widths.

---

## 2026-06-09 — P5.5: feedback opt-in verification and post-launch action added to implementation docs

**What changed:**

- `docs/Implementation Plan/IMPLEMENTATION-PLAN.md` — P5.5 gate checklist updated: (1) a pre-go-live test step added to verify the `feedback_consent` field in `user_profiles` is populated correctly by the `handle_new_user` Supabase trigger; (2) a post-launch reminder added to action the opt-in data (contact opted-in users) so it is not silently ignored.
- `docs/Implementation Plan/IMPLEMENTATION-STATUS.md` — Same note added to the P5.5 gate checklist.

**Why:** The `feedbackConsent` checkbox on the register form writes to `user_profiles.feedback_consent` via a Supabase database trigger. The mechanism works in code but has not been end-to-end tested. Without an explicit gate item it could be omitted from pre-launch QA. The post-launch reminder ensures the opt-in has a defined follow-up action rather than being collected and never used.

---

## 2026-06-08 — GAP-27 partial resolution: structured latency logging + capacity plan

**What changed:**

Two parts of GAP-27 (performance observability) resolved following Knox "Readiness Testing" audit:

1. **Structured latency logging added to all three AI routes.** Each route now records `const bedrockStart = Date.now()` before the `withRetry()` call. On success, logs `[route] Bedrock latency: Xms, Y tokens`. On failure, the existing error log now includes duration: `[route] Bedrock error after retries (Xms):`. Consistent across `generate-summary`, `generate-draft`, and `refine-answer`.

2. **Capacity plan documented in NFR-03.** A "Concurrent AI generation behaviour" section added to `docs/non-functional-requirements.md` documenting expected system behaviour at launch (~10 concurrent users) and at scale (~100), the role of per-user rate limiting, and the key risk (unmeasured latency under concurrent load) to address before the first marketing push.

**What remains outstanding in GAP-27:** Sentry performance monitoring configuration, deferred to P5.4 once a production traffic baseline is established.

**Why:** Knox "Readiness Testing" article identified the absence of latency observability and a capacity plan as gaps against production readiness criteria. Both are low-effort, high-value additions before go-live.

---

## 2026-06-08 — Privacy Policy and Terms of Service readiness review; T&S corrected

**What changed:**

A readiness review of `docs/privacy-policy.md` and `docs/terms-of-service.md` was conducted against the implementation documentation set. Two inaccuracies were identified and corrected in the T&S:

- **Section 6 (Fair Use):** The stated limit of 20 AI-assisted requests per calendar month was incorrect. The implementation enforces 50 requests per calendar month (raised from 20 during Step 4 redesign, 2026-05-29). The T&S now states 50.
- **Section 8 (Intellectual Property):** The open-source licence was described vaguely as "its open-source licence". The MIT Licence is named explicitly, consistent with constraint C17.

**Remaining blockers before both documents can go live:**

| Item                              | Status                                                                                               |
| --------------------------------- | ---------------------------------------------------------------------------------------------------- |
| ICO registration number           | 🔴 Outstanding — must be confirmed and inserted before publication                                   |
| Legal firm review                 | 🔴 Outstanding — not yet engaged                                                                     |
| Effective date                    | 🔴 Outstanding — set when go-live date is confirmed                                                  |
| Domain live (grantpathway.org.uk) | 🔴 Outstanding — DNS is Phase 5; Privacy Policy references this URL                                  |
| DPAs with all five providers      | ⚠️ Unverified — Supabase, Anthropic, Resend, Vercel, Sentry each need a DPA accepted; not documented |

**Items confirmed complete during review:**

| Item                                       | Evidence                                                                                                        |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| Account deletion (T&S §11, PP §7)          | S8.2 complete — cascade deletion, confirmation, redirect implemented                                            |
| Policy links in UI (registration + footer) | screen-requirements.md §registration, §footer — implemented; live URLs required before go-live                  |
| Fair-use limit enforcement (now 50/month)  | Both `generate-summary` and `refine-answer` routes enforce `MONTHLY_CAP = 50`                                   |
| Inactivity cron cadence (PP §7)            | Warning at 23 months (08:00 UTC daily), deletion at 24 months (09:00 UTC daily) — both confirmed live in Vercel |
| Sentry listed as data processor (PP §5)    | Sentry EU integrated at P3.7 — PII scrubbing via `beforeSend` confirmed                                         |

**Commit:** f4bc816

---

## 2026-06-07 — D-HSF-03 fixed (second attempt) — sync moved to Server Action; hard navigation added

**What changed (second attempt — first attempt 55c60a7 did not resolve the issue):**

- `actions/applications.ts` — `setDraftInProgress` now syncs `application_answers` from `ai_summary` before returning, ensuring rows exist in the DB before the Step 4 page renders. Return type changed from `Promise<{ ok: false; error: string }>` (redirect-on-success) to `Promise<{ ok: true } | { ok: false; error: string }>`.
- `components/application-step4-prep-checklist.tsx` — after receiving `{ ok: true }`, uses `window.location.href` (hard navigation) instead of relying on the Server Action's `redirect()` + Next.js Router Cache soft navigation.
- `app/(authenticated)/applications/[id]/step/4/page.tsx` — existing sync block retained as a fallback for returning users who navigate directly to Step 4 without going through the prep checklist.

**Why the first attempt failed (55c60a7):**
The first fix hardened the upsert in the Server Component (null filtering, explicit error checking, `ignoreDuplicates: false`). While those changes improve resilience, the actual root cause is a **Next.js Router Cache timing issue**: when `setDraftInProgress` called `redirect()` inside a `startTransition`, the router performed a soft navigation that served a cached render of Step 4 — either one from before the upsert ran, or one where the upsert ran on the server but the client received stale cached HTML. The workaround (Back → regenerate → confirm prep checklist again) worked because the two sequential Server Action redirects caused the cache to be busted differently.

**Root cause (second fix):**
Two structural problems:

1. The question sync ran in the Server Component (during page render), but the Router Cache served a stale render where `questionRows` was empty, bypassing that sync entirely.
2. `redirect()` inside `startTransition` is a soft navigation — it may reuse a cached RSC payload from the Router Cache rather than triggering a fresh server render.

The fix addresses both: sync happens in the Server Action (before any navigation), and `window.location.href` forces a full page reload (hard navigation) that bypasses the Router Cache.

**Prior hardening retained (55c60a7):** The Server Component sync block (null filtering, explicit upsert error logging, `ignoreDuplicates: false`) is retained as a robust fallback for direct navigation cases.

**Workaround (now obsolete):** Return to Step 3 and regenerate.

---

## 2026-06-05 — D-CWF-01 fixed — faith/religion conditional question exclusion

**What changed:**

- `lib/prompts.ts` — FAITH AND RELIGION QUESTIONS rule added to the `buildSummaryPrompt()` questions extraction clause. Questions asking primarily about an organisation's religious affiliation, the role of faith in its activities or governance, or whether staff/trustees are required to be of a particular religion are now excluded from extraction — they are treated as inherently conditional and must not appear as writing cards for non-faith-based organisations.

**Why the existing rule didn't catch it:**
The existing CONDITIONAL QUESTIONS rule requires the conditional qualifier to be explicitly stated in the surrounding text (e.g. "only required if applying for a vehicle"). For Clothworkers Q1, the qualifier ("If your organisation has a religious affiliation") sits on the preceding yes/no question, which is correctly excluded as a non-narrative field. This leaves the narrative follow-up question appearing as a universal question in isolation — the AI had no context that it was conditional. The new rule detects these questions by their subject matter rather than relying on the surrounding conditional text.

**Retest required:** Clothworkers must be retested to confirm Q1 no longer appears. Expected outcome: 9 questions (previously 10 with faith Q at position 1).

**Defect record:** D-CWF-01 in `docs/Test Plans/Clothworkers-Foundation-test-plan.md` — status updated to Fixed, retest required.

---

## 2026-06-05 — ADR-AI-010 testing complete; ceiling raised to 50,000; two defects logged

**Testing results — all seven required funders validated:**

| Funder                     | Time | Path        | Result                                             |
| -------------------------- | ---- | ----------- | -------------------------------------------------- |
| Garfield Weston Foundation | 34s  | PDF upload  | ✅ Pass — 3s saving vs 37s pre-preprocessing       |
| Clothworkers' Foundation   | 30s  | PDF upload  | ✅ Pass — ceiling raised to 50,000 (see below)     |
| AB Charitable Trust        | 17s  | PDF upload  | ✅ Pass — eligibility mismatch correct             |
| Idlewild Trust             | ~21s | PDF upload  | ✅ Pass — two eligibility mismatches expected      |
| Henry Smith Foundation     | 21s  | DOCX upload | ✅ Pass — IT-11 escape hatch verified (Branch B)   |
| Wolfson Foundation         | 18s  | DOCX upload | ✅ Pass — 7 sections extracted                     |
| Walton Charity             | 18s  | Paste       | ✅ Pass — 4 sections; also tested PDF upload (24s) |

All funders within NFR-01 (≤30s standard, ≤45s large document).

**PREPROCESS_CHAR_CEILING raised from 20,000 → 50,000:**
Clothworkers' PDF extracted at 97,906 characters — the 20,000 ceiling truncated the document before the application questions were reached, producing "No specific questions found" on first run. Ceiling raised to 50,000 via Vercel environment variable. Second run extracted all 9 questions in 30 seconds. The ceiling is now set as a Vercel production environment variable (`PREPROCESS_CHAR_CEILING=50000`) and does not require a code change to adjust further.

**Defects found during testing:**

- **D-CWF-01 (Medium, Open)** — Clothworkers Q1 (faith affiliation) extracted as a standard writing card for all charities. It is a conditional question applying only to faith-based organisations. The existing conditional exclusion rule in `lib/prompts.ts` does not detect this pattern. Fix: extend the prompt rule to skip faith/religious affiliation conditionals.
- **D-HSF-03 (Medium, Open)** — Step 4 shows "No specific questions found" on first load after multi-pass Step 3 flows (mismatch → profile fix → regeneration, or truncation → ceiling raised → regeneration). Sections appear correctly on second load after going Back and regenerating. Same root cause as D-HSF-02 and D-GWF-01 — Step 4 sync is fragile when `application_answers` rows exist from a prior failed/truncated summary generation. Workaround confirmed working.

**IT-11 escape hatch — first verified execution:**
Henry Smith IT-HSF-04 Branch B was executed for the first time — mismatch detected for Harry's Rainbow, profile corrected with age range and deprivation area language, reapplication passed eligibility. This was the IT-11 test deferred from Idlewild testing.

**Full decision record:** `docs/Technical Decision and Design/ADR-AI-010-summary-performance-strategy.md`

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

- Vercel Pro upgrade approved — Hobby plan blockers (sub-daily cron rejected, 2-cron cap, unreliable webhook) caused significant testing overhead. Upgrade to Pro (~~£16/month) will be actioned as part of P5.4. Total fixed costs remain within C1 budget (~~£36/month of £100/month).

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
