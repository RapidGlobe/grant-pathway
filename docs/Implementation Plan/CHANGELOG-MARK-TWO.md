# Grant Pathway — Change Log Mark Two

**Purpose:** This log records every significant change to the Grant Pathway product design from Mark Two onwards — decisions made, rationale, and what changed. It is the audit trail for the Mark Two BRD and all subsequent design evolution.

**Scope:** Covers product and design decisions only. Code-level changes are recorded in `CHANGELOG.md`. This document is the business-level companion to that technical log.

**Note:** This file is temporarily stored in `docs/Implementation Plan/`. It will be moved to a more appropriate location in a future session.

**Authoritative source:** When this log refers to a BRD section, the full requirement lives in `docs/BRD plus decisions Mark Two/BRD-Grant-Pathway-Mark-Two-v0.1.md`.

---

## 2026-05-29 — Mark Two BRD v0.1 created

**Document:** `docs/BRD plus decisions Mark Two/BRD-Grant-Pathway-Mark-Two-v0.1.md`

**Supersedes:** `docs/BRD-Grant-Pathway-v0.2.md` (Mark One)

### Why Mark Two was needed

Testing in May 2026 against the consolidated 12-funder target list revealed that the assumptions in the Mark One BRD did not hold across the real range of UK grant-giving organisations:

1. Most funders use proprietary online portals — Grant Pathway cannot submit applications and Mark One did not make this sufficiently clear.
2. The majority of questions on many funder forms are non-narrative (data-entry, financial, dropdown, file upload) — the AI can only genuinely help with narrative text answers.
3. The structured/narrative funder-type model was too coarse — AB Charitable Trust has 33 questions of which only 3 are narrative; classifying it as "structured" overstated Grant Pathway's value for that funder.
4. Character limits are more common than word limits across UK funders — the Mark One data model and UI only handled word limits (GAP-27).

### Seven business-level decisions made (2026-05-29)

All decisions agreed with WJ Okhia in the design review session. See Section 10 of the BRD for the full log.

| Decision | Summary |
|----------|---------|
| BD-01 | Grant Pathway is a **preparation tool**, not a submission platform |
| BD-02 | Charity profile is **thick** — stores full org data including financials, contact details, employee data |
| BD-03 | Non-narrative questions are **pre-filled from profile** where possible; shown as reminders otherwise |
| BD-04 | **Question-level typing** replaces funder-level type as the primary classification for question handling |
| BD-05 | Both **character limits and word limits** are supported |
| BD-06 | Multi-stage applications are **separate records** with no automated linkage in v1 |
| BD-07 | Funders marketed at the **coverage tier they genuinely support** (Full / Partial / Guidance) |

### Key new concepts in Mark Two

**Three-tier funder coverage model:**
- Tier 1 (Full): Narrative questions with limits; full Q&A assistance
- Tier 2 (Partial): Portal-based mixed forms; narrative subset only; pre-fill for data-entry fields
- Tier 3 (Guidance): Free-form narrative document; section-by-section canvas

**Question-level typing:**
Each extracted question carries a type: `narrative | data_entry | financial | dropdown | date | file_upload`. The product handles each type differently — only `narrative` questions get a writing textarea and AI assist; `data_entry` and `financial` are pre-filled from the charity profile; the rest are shown as completion reminders.

**Thick charity profile:**
Profile expanded from 4 fields (name, what it does, who it helps, where it works) to ~30 fields covering legal identity, registered address, contact details, financial snapshot (from latest accounts), people data, and supporting document status flags.

**Limit handling:**
`word_limit` (integer) replaced by `limit_value` (integer) + `limit_type` (`words | characters | none`). Counter in Step 4 displays "120 / 800 characters" or "85 / 200 words" as appropriate.

**Per-question copy export:**
New export option for Tier 2 funders: individual copy-to-clipboard button per question, optimised for pasting into portal fields one at a time.

### What is explicitly out of scope (confirmed)

Direct portal submission, funder discovery, eligibility screening, supporting document storage, deadline tracking, post-award reporting, multi-user collaboration, Stage 1→2 auto-population.

---

## 2026-05-29 — BRD Mark Two v0.2: AI usage principle expanded; funder AI policies added

**Document:** `docs/BRD plus decisions Mark Two/BRD-Grant-Pathway-Mark-Two-v0.2.md`

### What changed

**Section 1.1 — "AI to assist, not generate" stated as explicit product principle**

The Mark Two BRD now opens with a clear, unambiguous statement of how Grant Pathway uses AI. Added paragraph:

> *"Grant Pathway uses AI to assist the charity in writing — not to generate content on its behalf. The charity writes every substantive answer. AI helps organise, structure, and clarify what the charity has already said."*

This phrase is reinforced in Sections 1.3 (what it is not), 1.4 (AI usage principle), and 5.4 (AI assistance in Step 4). It should also be reflected in product copy, onboarding, and export disclaimers.

**Section 1.4 — AI usage principle substantially expanded**

Deep research (104 agents, 21 sources fetched, 25 claims verified, 22 confirmed) identified 10 confirmed UK grant-giving organisations with published AI policies beyond the two already known. Full table with verbatim quotes and source URLs added to the BRD.

### Confirmed UK funder AI policies (all verified May 2026)

| Funder | One-line position |
|--------|-------------------|
| Henry Smith Foundation | Cautious — "use AI for structure not content" |
| National Lottery Community Fund | Permissive — won't reject AI applications but warns against generic content |
| Lloyds Bank Foundation | Permissive — warns AI applications are "often generic and do not bring out your own voice" |
| Paul Hamlyn Foundation | Permissive — "Using AI tools alone will not disadvantage your application. But be careful." |
| Arts Council England | Permissive — applicants "accountable for what they submit"; warns about bias and creative rights |
| British Film Institute | Permissive + transparency required — warns AI applications "look remarkably similar to others" |
| Esmée Fairbairn Foundation | No formal policy — "a decision for individual organisations to take" |
| London Community Foundation | Exploratory — "still in the exploratory phase"; content "must be owned by you" |
| UKRI | Permissive + transparency expected — disclosure "will not affect the assessment process" |
| Royal Geographical Society | Disclose AI use; AI "should not be used as part of the review process" |
| Wellcome Trust + co-signatories | Cross-funder joint statement (Sept 2023): AI use must be cited; AI must not be used in peer review |

### Dominant finding across all funders

Every policy — regardless of how permissive — warns that generic AI content disadvantages applications. Authentic voice, specific community knowledge, and real organisational experience are what funders assess. Grant Pathway's "assist not generate" principle directly addresses this.

---

## 2026-05-29 — BRD Mark Two v0.3: five editorial updates from WJ Okhia review

**Document:** `docs/BRD plus decisions Mark Two/BRD-Grant-Pathway-Mark-Two-v0.3.md`

### What changed

**Section 2.1 — Primary user pain point reworded**
The original bullet "Pain point: time to write, not knowledge of their own organisation" was ambiguous. Reworded to: *"Core pain point: the capacity and time to produce well-structured, compelling applications across multiple funders — not lack of knowledge about their own work. They know their organisation deeply; Grant Pathway helps them express it in the language and format each funder requires."*

**Section 2.2 — Senior staff financial role made explicit and mandatory**
Added paragraph making clear that senior involvement for financial sections is not optional. The treasurer, finance lead, or trustee with financial oversight must verify all financial figures. Grant Pathway surfaces this requirement at the preparation checklist and senior review prompt.

**Section 3.2 Tier 1 — Charity Commission pre-fill flow documented**
Added explanation of the Charity Commission → profile → application pre-fill chain for Tier 1 funders. Identity and financial data flows from the register into the profile, and from the profile into application data-entry fields.

**Section 4.2 Identity — Charity Commission as primary data source**
Added introductory note explaining the Charity Commission register as the primary source for identity fields. OSCR (Scotland) and CCNI (Northern Ireland) noted. Source column added to the field table. England and Wales Charity Commission prioritised for v1.

**Section 4.2 Financial — Charity Commission annual returns as starting point; data lag warning**
Added introductory note explaining that Charity Commission financial data comes from submitted annual returns and is typically 12–18 months behind. Charity must review and verify all financial fields against latest signed accounts. Mandatory verification by treasurer/finance lead stated. Source column added; fields not available from the register (volunteers, average salary, top salary band, government funding, main funders) flagged as manual entry.

---

*Change Log Mark Two — created 2026-05-29. To be moved from `docs/Implementation Plan/` to a permanent location in a future session.*
