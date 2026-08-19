# Impact Assessment — Supporting-Document Questions (the "D5 gap")

**Tier:** 2
**Volatility:** Medium
**Update when:** The scope decision is made, or any evidence below is superseded

**Status:** Assessment only. **No decision has been taken.** Commissioned by WJ on 2026-08-19 during the `P5.5` production run of `AB-Charitable-Trust-test-plan.md`, to decide whether this is built before or after launch.

---

## 1. The question being asked

A B Charitable Trust's **D5** asks the applicant to attach a Word or PDF document of **2 to 2½ pages** covering "background, aims and objectives, activities and achievements", plus a budget if the request is for project funding.

Grant Pathway does not help with it at all. The app currently offers the applicant four items — one governance fact, B3 (a short paragraph), B4 (**15 words**), and C11 (optional) — and stays silent on the largest piece of writing the funder asks for. **Verified live on production, 2026-08-19: the Step 3 banner reported "3 application questions, plus 1 financial detail".** ⚠️ **"Stays silent" was too strong, corrected at v1.2:** the pre-writing checklist **does** name D5 with its length, contents and budget condition. **What is absent is a writing surface, not the information.**

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

| Option                                           | What the charity gets                                                                                                                                                                         | Effort    | Risk to launch |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | -------------- |
| **A — Ship as-is, log for post-launch**          | Nothing. Silence on the largest piece of writing.                                                                                                                                             | None      | None           |
| **B — Tell them what the document must contain** | ✅ **ALREADY BUILT — verified live on production 2026-08-19.** The prep checklist already names D5 with its length, its four content areas and its budget condition. **No work outstanding.** | **Done**  | **None**       |
| **C — Full document support**                    | Structured prompts per part, a writing surface, completeness assessment, separate export.                                                                                                     | **Large** | **High**       |

**Recommendation: no further work before launch. Decide C on its merits, after.**

⚠️ **Revised at v1.2, because the evidence changed.** v1.0 and v1.1 recommended building option B before launch. **Option B turned out to be already built** — the checklist names D5, its length, its four content areas and its budget condition, extracted from the funder's own note. **There is nothing small left to do.** The remaining choice is between leaving it as it stands and building C.

**What the charity gets today is genuinely more than "silence", which is how this started.** They are told the document exists, how long it must be, and what it must cover. **What they do not get is help writing it** — no prompt per section, no completeness view, no export.

**That reframes the original complaint rather than dismissing it.** The gap is not "we never mention D5"; it is "we mention it and then leave". Whether that constitutes short-changing the charity is a product judgement for WJ, and it is a narrower and more arguable one than it looked at the outset.

**C is unchanged in size and risk** — its two large items remain the writing surface and the export, and the export problem is not cosmetic: **putting Grant Pathway's footer and disclaimer inside a document the charity submits to a funder is a product decision in its own right**, not an implementation detail. ⚠️ **Nothing about C is urgent enough to sit ahead of a DNS cutover**, and the case for it is now weaker than at v1.0, since the informational half of the value is already delivered.

---

## 7. What is not known

- ~~Whether D5 already appears in the `supportingDocuments` checklist today.~~ ✅ **Settled 2026-08-19 by a screenshot of the live "Before you begin writing" screen: it does appear, in full.** Item 5 of "A B Charitable Trust also asks you to submit" reads: _"Overview of work/funding proposal (Word or PDF, 2 to 2½ pages, including background, aims and objectives, activities and achievements; budget if project funding requested)"_ — **the length, all four content areas and the budget condition, extracted from D5's own note.** ⚠️ **This reverses v1.1, which recorded the opposite on a first reading, and it changes the decision rather than the estimate: option B is already built.** The extraction does not drop D5 twice over; it captures D5 as a supporting-document requirement and declines only to offer a writing surface for it. **v1.1's "the one item the charity must write is the one that never reaches the list" was wrong and is withdrawn.**
- Whether any of the 14 `Structured` funders beyond ABCT embeds a document question. Only ABCT's guidance was read question-by-question.
- Real-world demand. No user has asked for this; it was noticed by reading a form.

---

## 8. Option C — effort estimate and delivery mechanics

Added at v1.3, at WJ's request, now that option B is known to be already built.

### 8.1 Estimate

⚠️ **These are working-day estimates at this project's actual pace, which includes its documentation discipline** — every item below carries doc updates, and the prompt and export items carry live re-runs. They are not developer-hours on the code alone.

| #   | Item                               | Days  | What drives it                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| --- | ---------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Extraction contract and prompt** | 2–3   | `aiSummaryQuestionSchema` has **no field that can express "this is a document"**; one must be added, along with prompt rules to capture the funder's stated contents and length instead of discarding the question. ⚠️ **Prompt changes are behavioural, not mechanical** — `GAP-39`, `GAP-40` and `GAP-51` were all rules written and then found to behave differently live, so this needs re-running against several fixtures, not a unit test. |
| 2   | **Storage**                        | 0.5–1 | `item_type = 'file'` already exists in the enum; likely no migration. The Step 4 client type narrows the enum to three values and would widen.                                                                                                                                                                                                                                                                                                    |
| 3   | **Writing surface**                | 4–6   | **The largest single item.** There is no multi-section or long-form answer model anywhere in the codebase — every answer is one `<Textarea rows={8}>`. A 2½-page document with five named parts needs linked cards or a new control, plus approval semantics for a part-complete document. ⚠️ **A page limit has no representation in the product**; "2 to 2½ pages" must become a word target, which is a judgement, not a conversion.           |
| 4   | **Budget interaction**             | 1–2   | `FR-31` disables AI assist on budget content and D5's document **must contain a budget**. This would be the first answer in the product that is **part-assistable** — one region behaving differently from its neighbours.                                                                                                                                                                                                                        |
| 5   | **Completeness assessment**        | 3–4   | The "is this a reasonable overview?" feature WJ described. A new AI route, prompt, and its own `ai_usage_log` type. ⚠️ Counts against the **hard 50 requests per user per month** (`ADR-AI-008`), and a 2½-page document sits close to `REFINE_MAX_TOKENS` (3,000 ≈ 2,000 words), where overflow is **non-retryable** by design.                                                                                                                  |
| 6   | **Export**                         | 3–5   | A supporting document is **funder-facing**. Today's export is one `Document`, one section, one filename, carrying Grant Pathway's footer and a disclaimer — which would land inside the charity's submission. ⚠️ **Part of this is a product decision, not code:** whether our branding appears in a document a funder reads.                                                                                                                     |
| 7   | **Documentation and tests**        | 2–3   | A new PDR, an `ADR-DATA-006` amendment, `FR-45`, `target-funder-list.md`'s two-value classification, a new capability-matrix case, and **rewriting `ABC-06`, whose current expectation is that D5 must _not_ appear** — plus re-running the flagship.                                                                                                                                                                                             |

**Total: roughly 16–24 working days — call it 3 to 5 weeks**, allowing for the two product decisions (items 3 and 6) needing WJ's time rather than build time.

⚠️ **Confidence: moderate, and the risk is one-sided.** Items 1, 3 and 6 are the uncertain ones and all three can overrun; none is likely to come in under. **Item 1 is the one most likely to surprise** — this project's history with prompt rules is that writing the rule is the small part and finding out what the model does with it is the large part.

### 8.2 Can testing continue on `master` while C is built on a branch?

✅ **Yes, and it is the right shape for this.** Production only changes when `master` is pushed, so a feature branch cannot disturb a test run.

Four things to know:

1. ⚠️ **Vercel deploys `master` to production automatically.** `master` must stay releasable at all times — no half-finished merges "to be tidied later".
2. ⚠️ **Preview deployments do not work and never have (`GAP-108`, status 🔴, no task).** Five variables are Production-scope only, three of which `lib/env.ts` throws on, so **every pull-request preview this project has produced has been dead on arrival** — the green Vercel check means "built", not "runs". **So the branch cannot be smoke-tested on a preview URL.** Development and testing of the branch happen locally against `grant-pathway-dev`, exactly as all development has to date.
3. **If C needs a migration**, dev and prod schemas diverge for the life of the branch. That is expected and visible — `npm run parity` will report it — but **re-run parity after the merge**, and remember `D-020`: a version row recorded on production proves bookkeeping, not execution.
4. **Keep it short-lived or rebase often.** A branch open for weeks against a `master` receiving test fixes will drift.

---

## Document History

| Version | Date       | Author         | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------- | ---------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.3     | 2026-08-19 | Rapidglobe Ltd | **New §8: an effort estimate for option C and the delivery mechanics**, requested by WJ once option B was known to be already built. **Roughly 16–24 working days, 3–5 weeks**, the largest items being the writing surface (no long-form answer model exists anywhere in the codebase) and the export (a funder-facing document would carry Grant Pathway's footer and disclaimer). ⚠️ **Two of the seven items are product decisions rather than build work.** Branch-and-merge confirmed workable, with the caveat that **preview deployments have never functioned (`GAP-108`)**, so branch testing is local against dev.                                                             |
| 1.2     | 2026-08-19 | Rapidglobe Ltd | **v1.1 was wrong and is withdrawn: D5 _is_ in the checklist, with its length, its four content areas and its budget condition** — confirmed by a screenshot of the live "Before you begin writing" screen. **Option B is therefore already built, which changes the decision rather than the estimate.** The recommendation becomes: no further work before launch, and decide C on its merits afterwards. ⚠️ **The original framing — that the product says nothing about the largest piece of writing — does not survive the evidence.** It says what the document must be; it does not help write it. **A narrower and more arguable gap than the one this assessment was opened on.** |
| 1.1     | 2026-08-19 | Rapidglobe Ltd | **§7's open question answered from the live production run: D5 does not appear in the supporting-documents checklist either.** Option B re-sized from "possibly nearly free" to "small, but needs an extraction-prompt change". ⚠️ **The finding is worth more than the sizing:** the checklist carries the artefacts a charity already possesses, while the one item it must actually write is filtered out by the same "file upload instruction" rule. Recommendation unchanged.                                                                                                                                                                                                        |
| 1.0     | 2026-08-19 | Rapidglobe Ltd | Initial assessment, commissioned by WJ during the `P5.5` production run of the AB Charitable Trust flagship. Evidence gathered from the code, the docs set, and all 25 funder guideline documents.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
