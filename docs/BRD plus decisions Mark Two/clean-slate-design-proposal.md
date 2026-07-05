# Clean-Slate Design Proposal — Handling Any Guideline or Form

**Tier:** 2 — Check if relevant
**Volatility:** High — this is a proposal for discussion, not a decision
**Update when:** Reviewed with WJ, revised, or superseded by a formal decision record

---

## 1. What this is

This is a design proposal, not a decision. It answers a specific instruction: if we were designing Grant Pathway's handling of funder guidance and applications **from scratch today** — ignoring the current codebase, the current extraction pipeline, and any option discussed earlier in the day (the tiered field-handling model, "Option D") — what would we build, and why?

It is built entirely on [question-coverage-analysis.md](question-coverage-analysis.md), which documents concrete findings from seven funders reviewed today: Idlewild, Clothworkers, Henry Smith, Stony Stratford, Walton Charity, Lloyds Bank Foundation, and MK Community Foundation. Every requirement and every claim below traces back to something one of those funders actually does. Nothing here is speculative about what funders might require — it's a direct response to what they already do require.

## 2. What's held fixed, and what's genuinely open

"Ignore what we've built" is read here as: ignore technical architecture, data model, and product-flow decisions made so far. It is **not** read as reopening the standing business and product principles already decided and reaffirmed earlier today:

- Grant Pathway is a **preparation tool, not a submission platform** (BD-01) — it never submits on a charity's behalf.
- The AI **assists, not generates** — the charity writes every substantive answer; AI clarifies, structures, and (per this proposal) coaches toward known criteria, on request.
- The service is **free for UK charities**, always.
- The reframed objective from this morning holds: Grant Pathway is a **trusted partner** helping a charity have a better chance of **completing** an application and a better chance of **getting the grant** — for whatever form that application takes.

Everything else — how guidance gets turned into something Grant Pathway can act on, how a form gets represented internally, what the writing flow looks like, what gets exported and how — is treated as open.

## 3. The north-star question, restated

This morning's reframing was: **"How do we make sure every question in any form gets covered — narrative or not?"** That question held up well through Idlewild and into Clothworkers. By Walton and Lloyds it was already too narrow — some funders have no form to extract questions from at all, and some of what determines a successful application (MK Community Foundation's Group Profile Score) has no question behind it whatsoever.

The evidence points to a wider question:

> **How do we correctly guide a charity through whatever process a specific funder actually requires — assessing whether they should apply, completing every question or requirement in whatever shape that takes, producing whatever counts as a valid submission — while being honest about what's genuinely outside our control?**

This isn't a rejection of this morning's question, it's the same question with its scope corrected to match what's actually been found.

## 4. What any design has to survive

Distilled directly from `question-coverage-analysis.md`, each requirement traceable to a specific funder:

| #   | Requirement                                                                                                                                        | Evidence                                                                                                                                                                               |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | Handle a mix of narrative and non-narrative fields inside a single form                                                                            | Idlewild: 9 of 36 fields narrative, 27 not                                                                                                                                             |
| R2  | Handle forms that branch — by an earlier answer, or by the applicant's own self-assessed status                                                    | Clothworkers (project type); Stony Stratford ("established group" status)                                                                                                              |
| R3  | Handle multi-stage programmes reviewed months apart                                                                                                | Clothworkers Large Grants (First Stage → Full Application)                                                                                                                             |
| R4  | Use a published scoring rubric to coach how a narrative answer is written, not just classify a field                                               | Clothworkers' Impact Framework; MK Community Foundation's 1:1 question-to-rubric mapping                                                                                               |
| R5  | Handle sensitive data with no-default, consent-first logic                                                                                         | Clothworkers' DEI data block                                                                                                                                                           |
| R6  | Handle budgets in at least four distinct shapes                                                                                                    | Idlewild (fixed table); Clothworkers (four templates by project type); Henry Smith (expenditure/income/shortfall worked example); MK Community Foundation (one unstructured line item) |
| R7  | Handle guidance split across multiple documents, some not bundled with what's uploaded, including references to sibling programmes never described | Henry Smith (separate budget-rules fragment); Lloyds (eight external theme guides); MK Community Foundation ("Partnership Grant" mentioned, never explained)                           |
| R8  | Distinguish hard/mechanical rules from fuzzy/judgement-based ones, and never conflate them                                                         | Henry Smith's 25%/40% staff-cost cap (judgement) vs. Stony Stratford's expenditure/income reconciliation (mechanical)                                                                  |
| R9  | Sometimes produce the funder's own native document as the real submission, not a generic export                                                    | Stony Stratford                                                                                                                                                                        |
| R10 | Track manual actions Grant Pathway can never complete on the charity's behalf                                                                      | Signatures/countersignatures (Stony Stratford); mandatory pre-application phone calls (MK Community Foundation, Walton)                                                                |
| R11 | Handle guidance with no extractable form at all, requiring prose-based judgement about fit before any form exists                                  | Walton                                                                                                                                                                                 |
| R12 | Handle multiple overlapping funding streams at one funder with no clean branch between them                                                        | Walton (five streams, different thresholds each)                                                                                                                                       |
| R13 | Handle eligibility that depends on derived metrics or governance facts a profile doesn't currently store                                           | Walton (reserves ÷ monthly expenditure; trustee relatedness); MK Community Foundation (bank-signatory relatedness, asset lock)                                                         |
| R14 | Handle answer types beyond written prose                                                                                                           | Lloyds (a website link accepted in place of narrative)                                                                                                                                 |
| R15 | Handle applications with no budget or requested amount at all                                                                                      | Lloyds (fixed £75,000 grant, uniform for all applicants)                                                                                                                               |
| R16 | Handle scored criteria with no corresponding question, driven by the charity's history with that specific funder                                   | MK Community Foundation's Group Profile Score                                                                                                                                          |
| R17 | Disclose, rather than attempt, things genuinely outside Grant Pathway's control                                                                    | Due diligence (Walton); non-grant funder offerings (Walton's Funder Plus, Lloyds' funded accessibility support); funder cross-checks against public presence (Lloyds)                  |

Seventeen requirements from seven funders reviewed in one morning. That rate of discovery is itself evidence that a narrow, field-by-field fix will keep breaking.

## 5. Design options

### Option 1 — The Universal Item Graph

Model every application not as a list of "questions" but as a graph of typed **items**: narrative, data, date, number, table/budget, file upload, consent, eligibility gate, scoring criterion, manual action. Each item carries: a visibility condition (so branching and conditional sections are just graph edges, not special cases), a source of truth (user-authored, profile-derived, computed, or "not applicable — funder-only"), a validation mode (hard/mechanical vs. soft/judgement, never conflated), an optional rubric-criterion link for coaching, and an output-mapping (which field in which export or native template it fills). Guidance that isn't a form at all (Walton) becomes a graph with no fillable items, only judgement-flag items and a fit-assessment step. A scored criterion with no question (MK Community Foundation) becomes an item with no user-facing input at all — visible as "outside your control" rather than silently ignored.

- **Advantages:** This is the only option that can genuinely claim "any guideline, any form" as an architectural property rather than a marketing line — every requirement in Section 4 maps onto some combination of item type, edge, and flag, without needing a new special case each time. It gives Grant Pathway one canonical way to answer "did we cover everything this funder asks for," which nothing built so far can currently answer for even one funder.
- **Disadvantages:** This is a genuinely large build — a general-purpose form/decision engine, not a feature. Its usefulness depends entirely on the accuracy of whatever turns messy funder guidance into this graph; a wrong branch, a misclassified rule, or a missed conditional item produces a confidently wrong application, which is a direct threat to "trusted partner." Risk of over-engineering a "deliberately focused" v1 product.

### Option 2 — Bolt-On Modules

Instead of one model, build separate, purpose-built modules on top of the existing narrative-writing core, each solving one category of finding independently: an eligibility assistant, a non-narrative field tracker/checklist, a flexible budget helper, an optional rubric-coach, a native-document output mode, a relationship/history tracker.

- **Advantages:** Each module ships independently and in priority order without needing to agree a unifying model first. Lower blast radius — a limitation in the rubric-coach doesn't touch the budget helper. Fits the instinct (already used once today) to go narrow first without closing off growth.
- **Disadvantages:** This is, functionally, what has already been tried — BD-03, BD-04, BD-07, and BD-08 were all bolt-on attempts at pieces of this same problem, and BD-08 already had to retire one of them (the funder-type badge) because it didn't hold up. Without a shared representation, modules duplicate the same classification logic (hard vs. judgement rule, narrative vs. not) independently, and "did we cover everything" has no single place to check.

### Option 3 — Curated Funder Playbooks

Treat each funder as needing a one-time, explicitly reviewed **playbook**: a structured record of its questions, item types, rubric mapping, budget shape, known rules (hard and fuzzy), output mode, and manual actions — drafted by AI from the funder's guidance, then checked and approved by a human before it goes live, and reused for every future application to that funder.

- **Advantages:** Directly answers the reliability problem in Options 1 and 2: extraction accuracy for genuinely novel structures (a mandatory pre-application call, a scoring rubric, a native-document requirement) is far higher with a human review step than an unsupervised pipeline, especially for a "free, trusted" service where a wrong answer costs a charity real money and time. Naturally represents judgement calls (Walton's mission-fit test, Stony Stratford's "ask the Town Clerk," MK Community Foundation's CIC pre-conversation) as flagged-for-the-user rather than silently guessed.
- **Disadvantages:** Doesn't scale to "any funder, immediately" — coverage is bounded by curation capacity, not engineering capacity, which is in real tension with the founding "any guideline/form, we handle it" vision if read literally. Raises a sustainability question: who curates, and does that cost undermine the "always free" commitment as funder count grows?

### Option 4 — Declared Scope Boundary

Define a small number of supported "application shapes" (e.g., single-stage online form with a fixed field list) and tell the user plainly, before they invest time, whether their chosen funder fits. Everything outside the declared shapes — Stony Stratford's native document, Walton's no-form guidance, MK Community Foundation's history-based scoring — is explicitly out of scope, stated as such, not attempted.

- **Advantages:** By far the cheapest option — an honest gate, not new engineering. Protects trust directly: doing an openly limited job well may serve "trusted partner" better than doing an ambitious job unreliably.
- **Disadvantages:** Every funder reviewed this morning was reviewed precisely because it didn't fit the previous, narrower assumption — narrowing further shrinks Grant Pathway's real-world usefulness, working directly against the growth this whole exercise has been in service of. On its own, it doesn't resolve BD-03 so much as declare most of today's findings permanently out of scope.

## 6. Recommendation

None of the four stands alone. The recommendation is a specific combination, not a fifth option:

**Adopt Option 1's typed item-graph as the underlying data model — it is the only representation that doesn't need a new special case every time a new funder shape appears, and every requirement in Section 4 maps onto it. Populate that model the Option 3 way — AI-drafted, human-reviewed playbooks per funder — rather than trusting an unsupervised extraction pipeline to correctly infer branching logic, scoring rubrics, and mandatory human gates on its own. Apply Option 4's transparency principle unconditionally on top of both: every funder Grant Pathway supports carries a visible status (fully supported / partially supported, flagged gaps shown / guidance-only, use with caution), so the product never silently overclaims what it has actually verified.**

Option 2 is not part of the recommendation. It's flagged explicitly because it's the path of least resistance from where the product is today, and it's already been tried, piece by piece, under different names (BD-03, BD-04, BD-07), with BD-08 standing as direct evidence that a bolt-on classification eventually has to be retired once it collides with a case it wasn't built for.

This combination is deliberately close in spirit to this morning's "narrow now, architect for broad" decision: a handful of funders get a fully curated, trustworthy playbook first (narrow), while the item-graph underneath them doesn't need to be redesigned as funder #20 or #50 turns up something new (architected for broad).

## 7. How this answers each requirement

| Req. | Mechanism                                                                                                                                                                                                                 |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1   | Item types (narrative / data / date / number / table / file / consent) coexist in one graph                                                                                                                               |
| R2   | Visibility conditions on graph edges represent branching and self-assessed skip logic                                                                                                                                     |
| R3   | A playbook can define multiple linked stages, each its own sub-graph                                                                                                                                                      |
| R4   | Rubric-criterion links on narrative items drive AI coaching text, sourced from the playbook                                                                                                                               |
| R5   | A `consent_required, no_default` flag on sensitive items — never profile-pre-filled                                                                                                                                       |
| R6   | Budget is a flexible item type; its shape (fixed table, free upload, worked example, single line, or absent) is playbook-defined, not hardcoded                                                                           |
| R7   | Playbook curation explicitly requires assembling every relevant source document — including sibling programmes and externally linked guidance — before the graph is built, not extracting from a single upload at runtime |
| R8   | Rule items are tagged `hard_check` (auto-validated, e.g. "ask ≤ 80% of cost") or `judgement_flag` (surfaced as a caution, never auto-rejected)                                                                            |
| R9   | An `output_mode` flag per playbook: `generic_export` or `native_template_fill`                                                                                                                                            |
| R10  | A `manual_action` item type — tracked and reminded, never completed by Grant Pathway                                                                                                                                      |
| R11  | A pre-application "fit assessment" stage, separate from the item graph, for funders with no form to extract                                                                                                               |
| R12  | A funder can carry multiple playbooks (one per funding stream), with an explicit stream-selection step before either is entered                                                                                           |
| R13  | Requires a profile schema extension (see Section 8) feeding computed/derived items                                                                                                                                        |
| R14  | A `link_acceptable: true` flag on a narrative item enables a link-instead-of-prose input mode                                                                                                                             |
| R15  | The budget item is optional per playbook — simply absent where a grant is fixed                                                                                                                                           |
| R16  | Represented as a visible, non-fillable item — "this counts toward your score and is outside this application's control" — rather than silently omitted                                                                    |
| R17  | A `funder_note` field on the playbook surfaces disclosures (due diligence exists; non-grant offerings exist; the funder checks public presence) without Grant Pathway attempting to act on them                           |

## 8. What this proposal doesn't solve

- **R16 sits in direct tension with BD-06** ("multi-stage applications are separate records; no automated linkage"). Genuinely helping with a criterion like MK Community Foundation's Group Profile Score would mean tracking a charity's relationship history with a specific funder across applications and time — which BD-06 currently rules out by design. This proposal does not resolve that tension; it surfaces it as a decision only WJ can make, with a real trade-off between added complexity and leaving part of some funders' scoring genuinely untouched.
- **The profile data model needs extending** regardless of which option is chosen — governance facts (trustee relatedness, bank-signatory relatedness) and derived metrics (reserves ÷ monthly expenditure) go beyond what BD-02's "thick profile" currently captures. This is real, additional work, not something the architecture above makes free.
- **Playbook curation capacity is the actual bottleneck** of the recommended approach, and who does it — WJ alone, a future sector-partner review process, or something else — interacts directly with the "always free" commitment in the vision statement. Not addressed here.
- **Native-document output (R9)** — correctly filling an arbitrary funder's own Word template or portal fields — is a distinct, non-trivial technical problem in its own right and deserves its own design pass, not a sub-bullet in this one.
- **This is a proposal**, built to survive contact with the funders reviewed today. It has not been reviewed, is not agreed, and per this document's own tier header, sits below the level of a decision record.

## 9. Suggested next step

Discuss and stress-test this proposal the same way the morning's funder-by-funder exercise stress-tested BD-03 — ideally against a couple more funders before treating it as settled. If it holds, the next artifact is a formal decision record capturing whichever architecture is actually agreed, followed by a separate conversation about implementation sequencing — deliberately not attempted in this document.
