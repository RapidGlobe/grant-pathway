# Impact Assessment — Supporting-Document Questions (the "D5 gap")

**Tier:** 2
**Volatility:** Medium
**Update when:** The scope decision is made, or any evidence below is superseded

**Status:** Assessment only. **No decision has been taken.** Commissioned by WJ on 2026-08-19 during the `P5.5` production run of `AB-Charitable-Trust-test-plan.md`, to decide whether this is built before or after launch.

---

## 1. The question being asked

A B Charitable Trust's **D5** asks the applicant to attach a Word or PDF document of **2 to 2½ pages** covering "background, aims and objectives, activities and achievements", plus a budget if the request is for project funding.

Grant Pathway does not help with it at all. The app currently offers the applicant four items — one governance fact, B3 (a short paragraph), B4 (**15 words**), and C11 (optional) — and stays silent on the largest piece of writing the funder asks for. **Verified live on production, 2026-08-19: the Step 3 banner reported "3 application questions, plus 1 financial detail".**

WJ's framing, which this assessment adopts: **the charity supplies every word and every figure.** The app would prompt for structure and tell the applicant whether what they have written is a reasonable overview. It would not generate content. On that framing the hallucination risk is not materially different from the AI assist already shipped — an earlier draft of this concern, raised in conversation, overstated it and was withdrawn.

---

## 2. How common is this shape?

All 25 documents in `docs/Grant Org Guidelines/` were read. Of **16 distinct funder guideline sets**:

| Category                                                  | Count    | Funders                                                                                                                |
| --------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------- |
| Requires an **applicant-authored narrative document**     | **3**    | A B Charitable Trust (D5), Garfield Weston (the proposal _is_ the application), Heritage Fund (mandatory project plan) |
| Conditional or optional                                   | 3        | MKCF Oak and Sapling (business plan, **CICs only**), Stony Stratford ("if available")                                  |
| Third-party expert document                               | 1        | Idlewild Conservation (report by an accredited conservator)                                                            |
| Pre-existing artefacts only (accounts, policies, budgets) | majority | the remainder                                                                                                          |

⚠️ **Two of the three are already handled or out of reach, which shrinks the gap considerably.**

- **Garfield Weston is not a gap.** It is classified `Narrative` in `target-funder-list.md` and already routes through the **`free_form` extraction path**, which extracts named sections with titles, guidance and word limits. The product already helps an applicant write a 10-page proposal document — when the whole application is one.
- **Heritage Fund is not in the v1 target list at all**, and its guidance provides its own project-plan template and says "please do not submit any extra documents".

**So the real gap is one shape: a structured question set with a document question embedded inside it.** A B Charitable Trust is the only clear instance in the corpus. `target-funder-list.md`'s classification is binary — `Structured` (14) or `Narrative` (5) — and **has no slot for "structured, and also requires an authored document"**, which is why the shape has never been named.

⚠️ **Do not read "one funder" as "rare".** The corpus is 16 sets, several sampled opportunistically; ABCT is a mainstream trust and the shape is ordinary in UK grant-making. But **the evidence available today supports one confirmed instance in scope**, and honest scoping should say so rather than assert a trend.

---

## 3. What already exists that this would build on

This is the strongest argument that the work is smaller than it looks.

| Asset                                   | State                                                                                                                                                                                                                            |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`free_form` extraction path**         | **Built and tested.** Extracts narrative _sections_ with title, guidance and word limit — structurally the closest thing to a case-for-support outline (`lib/prompts.ts`).                                                       |
| **Aggregate word limit** (`PDR-AI-012`) | **Built.** A single overall limit shared across several cards, with a combined counter and a "Counts toward N-word total" badge. This is the mechanism a page-limited document needs.                                            |
| **`is_budget_question`**                | **Built and load-bearing.** Amber card, warning banner, `£` input, and AI assist disabled — enforced server-side in `app/api/refine-answer/route.ts`, which re-reads the flag from the database rather than trusting the client. |
| **`supportingDocuments`**               | **Built.** Extraction already lists the document categories a funder wants, rendered as a read-only checklist before Step 4 (`PDR-UI-007`).                                                                                      |
| **`item_type = 'file'`**                | **Exists in the database enum, never written.** Nothing to un-hide — see §4.                                                                                                                                                     |

⚠️ **`output_mode = 'native_template_fill'` is blocked by a database CHECK constraint** whose comment states that lifting it requires an ADR amendment first (`ADR-DATA-006`, 2026-07-11: permanently out of scope, **not deferred**). **This assessment does not propose lifting it** — filling the funder's own template is a different feature. `generic_export` is sufficient here.

---

## 4. What would actually have to change

⚠️ **The key mechanical fact: a D5 never reaches the database.** It is discarded by the extraction prompt itself — `lib/prompts.ts` instructs the model "DO NOT include: … file upload instructions". There is no stored row, no gap in `item_order`, and no render-time filter. **This cannot be enabled by a flag or a UI toggle; the extraction contract has to change.**

| Area               | Change required                                                                                                                                                                                                                                                                                                                                 | Size      |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| Extraction prompt  | Stop discarding document questions; capture the funder's stated contents (background, aims, activities, achievements, budget) and page/length spec. The JSON contract has **no field that can express "this is a document"** — `aiSummaryQuestionSchema` would need one.                                                                        | Medium    |
| Storage            | Write the item with a real type. The enum value exists; nothing else needs a migration.                                                                                                                                                                                                                                                         | Small     |
| Writing UI         | **Every answer today is a single `<Textarea rows={8}>`.** There is no multi-section or long-form answer model anywhere in the codebase. A 2½-page document with five named parts needs either several linked cards or a new control.                                                                                                            | **Large** |
| Budget interaction | `FR-31` disables AI assist on budget content, and D5's document **must contain a budget**. So one part of the document must behave differently from the rest — the first item in the product where a single answer is part-assistable.                                                                                                          | Medium    |
| Export             | The export is **one `Document`, one section, one filename**, carrying Grant Pathway's footer and a disclaimer. ⚠️ **A supporting document is funder-facing**, so shipping it through this route would put our branding and disclaimer inside the charity's submission. Needs a separate artefact. No multi-file or page-break machinery exists. | **Large** |
| AI usage           | Structure prompts and completeness assessment are net-new calls against the **hard 50 per user per month** cap (`ADR-AI-008`). A document with five parts could consume a meaningful share of a user's month.                                                                                                                                   | Medium    |
| Truncation         | `REFINE_MAX_TOKENS` is 3,000 (~2,000 words). A 2½-page document is close enough to that ceiling to hit `response_too_long`, which is **non-retryable** by design.                                                                                                                                                                               | Medium    |

---

## 5. Documentation and test impact

⚠️ **This changes a test that is passing today.** `ABC-06` in the flagship plan asserts D5 **must not** appear, and it passed on production on 2026-08-19. Changing the behaviour means rewriting that expectation and re-running the flagship.

Also affected: `guideline-capability-matrix-test-plan.md` (**no axis tests "requires a supporting document"** — a new case), `TEST-DASHBOARD.md`, `target-funder-list.md`'s two-value classification, `moscow-feature-register.md` (`FR-45`), and a new PDR. `ADR-DATA-006` would need an amendment recording that non-narrative _visibility_ is being extended while `native_template_fill` stays dead.

---

## 6. Options

| Option                                           | What the charity gets                                                                                                                                                                                                                                                                                                                                                                  | Effort    | Risk to launch |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | -------------- |
| **A — Ship as-is, log for post-launch**          | Nothing. Silence on the largest piece of writing.                                                                                                                                                                                                                                                                                                                                      | None      | None           |
| **B — Tell them what the document must contain** | The prep checklist names D5 explicitly and lists the funder's own required contents and length. **No AI, no writing surface, no export change.** Turns "gather these" into "here is what this one must cover". ⚠️ **Confirmed on production 2026-08-19: D5 is absent from the checklist today**, so this needs an extraction-prompt change as well as rendering — small, but not free. | **Small** | **Low**        |
| **C — Full document support**                    | Structured prompts per part, a writing surface, completeness assessment, separate export.                                                                                                                                                                                                                                                                                              | **Large** | **High**       |

**Recommendation: B before launch, C after.**

B addresses the actual complaint — that the product short-changes the charity by staying silent — for a fraction of the cost. It touches no schema, no export, and no AI budget. ⚠️ **Revised 2026-08-19 after checking the live run: D5 does not appear in the checklist either**, so B is an extraction-prompt change plus rendering, not rendering alone. **The recommendation is unchanged; the estimate is not.**

C is the right eventual feature, and §3 shows the foundations are unusually good for it. But its two large items are **the writing surface and the export**, and the export problem is not cosmetic: **putting Grant Pathway's footer and disclaimer inside a document the charity submits to a funder is a product decision in its own right**, not an implementation detail. That deserves designing, not squeezing in ahead of a DNS cutover.

⚠️ **The counter-argument to B, stated fairly:** it is advice, not assistance. A charity that does not know how to write a case for support is not much helped by a list of headings. If the honest goal is to stop short-changing them, **B is a partial answer and should be recorded as such** rather than allowed to close the question.

---

## 7. What is not known

- ~~Whether D5 already appears in the `supportingDocuments` checklist today.~~ ✅ **Answered by WJ on 2026-08-19, from the live production run: it does not.** **So option B is not nearly free, and that is the single most decision-relevant fact in this assessment.** D5 is absent from the checklist as well as from the writing cards — the extraction drops it twice over. ⚠️ **The pattern this exposes is worth more than the sizing.** `supportingDocuments` is populated with the artefacts a funder wants — accounts, safeguarding policy, governing document — all of which the charity already possesses and merely has to attach. **The one item on that list the charity must sit down and _write_ is the one that never reaches it.** The extraction prompt treats "file upload instruction" as a single category and discards it, so the question that needs the most help is filtered by the same rule as the question that needs none. **Revised sizing for option B: small, but no longer trivial** — it needs an extraction-prompt change so a document question is captured with its stated contents and length, plus rendering in the existing checklist. Still no schema change, no writing surface, no export change, and no AI usage.
- Whether any of the 14 `Structured` funders beyond ABCT embeds a document question. Only ABCT's guidance was read question-by-question.
- Real-world demand. No user has asked for this; it was noticed by reading a form.

---

## Document History

| Version | Date       | Author         | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------- | ---------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.1     | 2026-08-19 | Rapidglobe Ltd | **§7's open question answered from the live production run: D5 does not appear in the supporting-documents checklist either.** Option B re-sized from "possibly nearly free" to "small, but needs an extraction-prompt change". ⚠️ **The finding is worth more than the sizing:** the checklist carries the artefacts a charity already possesses, while the one item it must actually write is filtered out by the same "file upload instruction" rule. Recommendation unchanged. |
| 1.0     | 2026-08-19 | Rapidglobe Ltd | Initial assessment, commissioned by WJ during the `P5.5` production run of the AB Charitable Trust flagship. Evidence gathered from the code, the docs set, and all 25 funder guideline documents.                                                                                                                                                                                                                                                                                 |
