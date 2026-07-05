# Grant Pathway — Business Requirements Document

**Version:** 0.6
**Date:** 2026-07-05
**Status:** Main reference going forward — supersedes the "Mark Two" framing; this document is now maintained as the live, authoritative BRD
**Author:** Rapidglobe Ltd / WJokhia
**Supersedes:** BRD-Grant-Pathway-Mark-Two-v0.4.md, which superseded BRD-Grant-Pathway-v0.2.md (Mark One). Both are archived in `docs/Old/`.

---

## Foreword — Why This Document Exists, and Why It Was Revised Again

The Mark One BRD was written before Grant Pathway had been tested against real funder documents. Testing in May 2026 against the consolidated 12-funder target list revealed that the assumptions underpinning the original design did not hold across the full range of UK grant-giving organisations. Specifically:

- Most funders use proprietary online portals for submission — Grant Pathway cannot submit on a charity's behalf and should not imply it can.
- The majority of questions on many funder forms are non-narrative (data-entry, financial, dropdown, file upload) — the AI can only genuinely assist with narrative text answers.
- Funder form structures vary enormously — not just structured vs. narrative but across a continuum of question types within a single form.
- Character limits are more common than word limits across UK funders — the Mark One data model only handled word limits.

Mark Two (v0.1–v0.4, May 2026) re-based the product on what was actually observed at that point, not on what was assumed. It was written before Phase 5 (Pre-Launch) testing began.

**This revision (v0.5, July 2026) exists for the same reason Mark Two did: real testing surfaced a gap between what was decided and what was actually built.** During Phase 5 funder testing (MKCF, A B Charitable Trust, Clothworkers' Foundation), several parts of Mark Two turned out to describe intended behaviour that was never implemented, or behaviour that has since changed without the BRD being updated:

- Non-narrative question handling (BD-03, BD-04, Section 3.2, Section 5.5) was never built — non-narrative questions are filtered out at AI extraction and never reach the application at all, not pre-filled or shown as reminders as decided. This is flagged as an open decision, not silently resolved — see Section 10.
- The "Structured"/"Narrative" funder-level badge (introduced in `DR-FD-001`, after this BRD's original decisions and never actually defined) turned out not to reflect a stable property of any funder — see the amendment on BD-04 in Section 10. It has been retired from the funder picker.
- The three-tier coverage-level _display_ (Section 3.3) was never built — no tier/coverage column exists in the funders table and no tier badge appears anywhere in the app. The tier model itself remains a useful internal way of thinking about funder coverage, but it is not something a user currently sees.
- Over-limit answer behaviour (Section 6.3) changed from advisory to a hard stop on 2026-06-04 (D-LBF-02) without the BRD being updated to match.
- Step 5's approval flow (Section 5.6) was simplified on 2026-06-12 (a separate approve step was merged into the export action) without the BRD being updated to match.

Where this document conflicts with an ADR, DR, or PDR decided after 2026-05-29, the later, more specific decision record takes precedence for implementation detail — but this BRD is intended to be kept in sync with those decisions and should be treated as the current source of truth for product-level questions. Where a gap between decision and implementation is still open (not yet resolved one way or the other), this document says so explicitly rather than picking a side.

---

## 1. Product Vision and Positioning

### 1.1 What Grant Pathway is

Grant Pathway is a **preparation tool** that helps UK charitable organisations write better grant applications. It guides the charity through understanding a funder's requirements, assists with the structure and clarity of the narrative answers the funder asks for, and produces copy-ready output that the charity then submits through the funder's own channel.

**Grant Pathway uses AI to assist the charity in writing — not to generate content on its behalf.** The charity writes every substantive answer. AI helps organise, structure, and clarify what the charity has already said. This distinction matters: the application reflects the charity's authentic voice, specific knowledge, and real community experience — not generic AI output. This is also what funders expect and value (see Section 1.4).

**Grant Pathway is not a submission platform.** It does not submit applications to funders, integrate with funder portals, or manage submission deadlines. These responsibilities remain with the charity.

### 1.2 Core value proposition

Grant writing is time-consuming, repetitive, and often opaque. Charities — particularly small and medium-sized ones — frequently lack the capacity to write compelling, well-structured grant applications for multiple funders simultaneously. Grant Pathway removes the blank-page problem: it extracts what each funder is actually looking for, helps the charity articulate their work in the funder's language, and produces a structured, reviewable draft the charity can refine and use.

### 1.3 What Grant Pathway is not

- A submission platform or portal integration
- A funder database or grant-finding service
- A compliance checker or eligibility screener
- A document management system for supporting documents
- An automated application generator — Grant Pathway uses AI to assist, not to generate. The charity writes every substantive answer.

### 1.4 AI usage principle — assist, not generate

**Grant Pathway uses AI to assist, not to generate.** This principle is stated explicitly throughout the product — in onboarding, in Step 4 guidance, and in the export disclaimer — and is not negotiable. It is not merely a design preference; it reflects what UK funders consistently require and what produces better application outcomes for charities.

Research conducted in May 2026 confirmed that at least ten major UK grant-giving organisations have published formal AI guidance. The dominant position across all of them is identical: **permissive with conditions** — AI use is permitted, but over-reliance on AI produces generic content that actively disadvantages applications. Authentic voice, specific community knowledge, and real organisational experience are what funders assess.

#### Verified UK funder AI policies (research confirmed May 2026)

| Funder                               | Position                                         | Key quote                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Source                                                     |
| ------------------------------------ | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| **Henry Smith Foundation**           | Cautious — structure only                        | _"If you use AI, let it help structure your application rather than the content. Your application should reflect your voice and experience. Applications written in your own words give a much better insight into your work."_                                                                                                                                                                                                                                   | henrysmith.foundation                                      |
| **National Lottery Community Fund**  | Permissive — warns against generic content       | _"You can use AI tools to help write your funding application. We will not reject an application just because AI was used. AI supported applications do not tell the unique story of your community."_                                                                                                                                                                                                                                                            | tnlcommunityfund.org.uk                                    |
| **Lloyds Bank Foundation**           | Permissive — warns about over-reliance           | _"We read every single funding and job application we receive and do not use AI in any part of our decision making. It is often noticeable when AI has been over-relied on and, in many cases, this is not giving applicants the best chance of success. These applications are often generic, and do not bring out your own voice or uniqueness."_                                                                                                               | lloydsbankfoundation.org.uk/about-us/ai-position-statement |
| **Paul Hamlyn Foundation**           | Permissive — warns about distinctiveness         | _"Using AI tools alone will not disadvantage your application. But be careful of how it is used. This can make it more difficult to understand what is different or special about an applicant, or the work they are describing. We do not use AI to assess grant applications or job applications."_                                                                                                                                                             | phf.org.uk/using-ai-in-your-work-with-us                   |
| **Arts Council England**             | Permissive — applicants accountable              | _"While generative AI can be useful for drafting applications and organising reporting material, applicants and grantholders are accountable for what they submit."_ ACE also advises caution around bias, transparency, data protection, and the moral and legal rights of creators.                                                                                                                                                                             | artscouncil.org.uk                                         |
| **British Film Institute**           | Permissive — transparency required               | _"We do not prohibit the use of AI in funding applications, or in the projects we support, but we do require applicants to be transparent about the use of any AI. Using AI in your project, or to complete your application, could result in a project or application that looks remarkably similar to others. Losing the creative uniqueness of your project or application may mean it is less likely to stand out within the context of a competitive fund."_ | bfi.org.uk                                                 |
| **Esmée Fairbairn Foundation**       | No formal policy — applicant discretion          | _"This is a decision for individual organisations to take and we have no preference."_ Expects applications to honestly reflect the applicant's work.                                                                                                                                                                                                                                                                                                             | esmeefairbairn.org.uk                                      |
| **London Community Foundation**      | Exploratory — content must be owned by applicant | _"We do not currently have formal AI guidelines, as we are still in the exploratory phase. The content included in your application or report, and the proposed or delivered activity, must be owned by you as the applicant doing the work."_                                                                                                                                                                                                                    | londoncf.org.uk/guidance-on-artificial-intelligence        |
| **UKRI**                             | Permissive — transparency expected               | _"Applicants and applications are expected to be transparent where they have used generative AI tools in the development of an application. This information will not affect the assessment process."_                                                                                                                                                                                                                                                            | ukri.org                                                   |
| **Royal Geographical Society**       | Disclose use; prohibit AI in review              | _"Disclose any use of generative AI tools. AI tools should not be used as part of the review process — for reasons of academic rigour and confidentiality."_                                                                                                                                                                                                                                                                                                      | rgs.org                                                    |
| **Wellcome Trust + joint statement** | Cross-funder consensus (September 2023)          | Co-signed by UKRI, Cancer Research UK, NIHR, British Heart Foundation, Royal Academy of Engineering, Royal Society, and Association of Medical Research Charities. Established shared position that AI use in application preparation must be cited and acknowledged, and that AI must not be used in peer review.                                                                                                                                                | wellcome.org                                               |

#### What this means for Grant Pathway

Every funder policy above — regardless of how permissive or cautious — points to the same conclusion: **AI-generated content that lacks the charity's authentic voice and specific knowledge produces weaker applications.** Grant Pathway is designed to prevent exactly this. The charity's real experience and voice are the inputs; AI structures and refines the output. This is what funders permit, what funders value, and what produces better outcomes.

This principle is reinforced at every step of the Grant Pathway workflow:

- **Step 1:** Framing copy explains Grant Pathway helps you write, not writes for you
- **Step 3:** AI Summary extracts the funder's requirements — it does not draft answers
- **Step 4:** The charity writes every answer from scratch; AI assist is optional and refines only
- **Step 5:** The export disclaimer states that answers were written by the charity and reviewed before export

---

## 2. Target Users

### 2.1 Primary users

**Charity staff responsible for fundraising and grant applications** at small to medium-sized UK registered charities. Typically:

- Income band: £50,000 – £2,000,000 per annum
- Team size: 1–10 people; fundraising often shared across roles
- Technical literacy: moderate — comfortable with web applications, not developers
- Core pain point: the capacity and time to produce well-structured, compelling applications across multiple funders — not lack of knowledge about their own work. They know their organisation deeply; Grant Pathway helps them express it in the language and format each funder requires

### 2.2 Secondary users

**Senior staff and trustees** who review and approve applications before submission. Grant Pathway's senior review prompt and approval step are designed with this role in mind.

Senior involvement is particularly important — and should be treated as mandatory — for any application section covering financial information. The treasurer, finance lead, or a trustee with financial oversight must review and verify all financial figures before the application is submitted. No AI-assisted tool can substitute for the senior financial sign-off that funders expect and that protects the charity's integrity. Grant Pathway surfaces this requirement explicitly at the preparation checklist stage and again at the senior review prompt before assembly.

### 2.3 Who Grant Pathway is not designed for

- Large charities with dedicated grant writing teams and specialist CRM systems
- Fundraising consultants writing on behalf of clients (though this is not prohibited)
- Organisations outside the UK charitable sector

---

## 3. Funder Coverage Model

### 3.1 The core challenge

UK grant-giving organisations use a wide variety of application formats. Grant Pathway's ability to assist varies significantly by format. The product must be honest about this variation rather than implying uniform coverage.

### 3.2 Three-tier coverage model

Every funder supported by Grant Pathway is assigned a coverage level that is displayed to the user before they begin an application.

#### Tier 1 — Full coverage

The funder publishes narrative questions with explicit word or character limits. Grant Pathway extracts all narrative questions, presents each as a guided writing card, and produces copy-ready output for every answer.

**⚠ As actually built (confirmed 2026-07-04):** non-narrative fields (data-entry, financial, dropdown, date, file upload) are **not** pre-filled from the charity profile or shown in any form at Step 4 — they are filtered out at AI extraction and never reach the application. Only narrative questions are extracted and presented. The one exception is budget/financial questions that carry a genuine word or character limit: these are extracted as ordinary writing cards but flagged amber with AI assist disabled — the charity still writes the figures in free text, they are not auto-populated from the profile. Whether to build the originally-decided pre-fill/reminder behaviour (BD-03, BD-04) is an open decision — see Section 10.

For charities registered in Scotland (OSCR) or Northern Ireland (CCNI): profile setup uses manual entry in v1, with register lookup planned before general release (see Section 4.2) — this part of Tier 1 is as originally decided and unaffected by the gap above.

**Characteristics:**

- Published question set (PDF, Word, or accessible web page)
- Narrative text questions with stated limits
- Charity Commission register lookup pre-fills the _charity profile_ itself (England and Wales in v1; Scotland and NI planned) — this is separate from, and unaffected by, the non-narrative _question_ handling gap above

**Examples:** Henry Smith Foundation (Stage 1), Wolfson Foundation (Stage 1), Lloyds Bank Foundation CI

#### Tier 2 — Partial coverage

The funder uses a portal-based form where the majority of fields are non-narrative (data-entry, financial, dropdown, file upload). Grant Pathway extracts and assists with the narrative subset only.

**⚠ As actually built:** the non-narrative majority of these forms is not surfaced to the charity in any way today — no pre-fill checklist exists (see the Tier 1 note above; the same gap applies here, and matters more for Tier 2 since non-narrative fields are the majority rather than a minority). A charity using Grant Pathway for a Tier 2 funder currently sees only the narrative subset, with no reminder that other fields exist.

**Characteristics:**

- Online portal submission
- Mixed question types — narrative questions exist but are a minority
- Character limits more common than word limits

**Examples:** Idlewild Trust (Arts and Conservation), A B Charitable Trust

#### Tier 3 — Guidance coverage

The funder does not publish discrete questions. Instead, they specify themes or sections for a free-form narrative document (typically 5–15 pages). Grant Pathway extracts the required themes, presents each as a writing canvas, and assembles the charity's content into a structured Word document suitable for direct submission.

**Characteristics:**

- No discrete numbered questions
- Funder specifies headings, themes, or sections to address
- Submission is typically a Word or PDF document

**Examples:** Garfield Weston Foundation, City Bridge Foundation

### 3.3 Coverage level display

**⚠ Not implemented (confirmed 2026-07-04).** This section originally specified that the coverage tier would be displayed on the new-application screen, the Step 3 funder summary card, and the export screen. None of this was built — the `funders` table has no tier/coverage-level column at all, and no "Tier 1/2/3" or "Full/Partial/Guidance coverage" wording appears anywhere in the app.

What _was_ built instead, for a period, was a simplified two-value "Structured"/"Narrative" badge on the funder picker — sourced from a `funder_type` DB column introduced later in `DR-FD-001` (2026-06-01), not from the tier model described here. That badge has since been retired (2026-07-04, `DR-FD-001` v1.2) after review found it didn't reflect a stable property of any funder (see Section 10, BD-04 amendment).

The three-tier model remains a useful internal way to reason about funder coverage and continues to inform test planning (see `docs/Test Plans/TEST-DASHBOARD.md`), but today it is not something a user sees anywhere in the product. Whether to build a genuine coverage-level display — and what it should say given the Section 3.2 gaps above — is an open question, not a decided and unbuilt feature to simply "finish."

### 3.4 Initial supported funder list

The funder list has grown well beyond the original 12-funder v1 target and this section is no longer maintained as the canonical list. **`docs/Test Plans/TEST-DASHBOARD.md` is the current, authoritative source** for which funders are supported, their indicative tier, and their testing/readiness status — see its "Active Funders", "Parked / Unavailable", and "Funder Readiness Standard" sections. This mirrors the same correction already made in `DR-FD-001` for `docs/target-funder-list.md`, which was retired for the same reason (drifted out of sync with the live directory).

---

## 4. Charity Profile — The Organisation Vault

### 4.1 Purpose

The charity profile is the organisation's permanent data store within Grant Pathway. It serves two functions:

1. **Context for AI** — the profile is passed to the AI on every application to ensure responses reflect the charity's voice, mission, and track record.
2. **Pre-fill source for the profile itself** — the profile's own identity and financial fields (Section 4.2) are populated from the Charity Commission register. As of 2026-07-04, this does _not_ extend to pre-filling non-narrative _questions on a funder's application form_ — see Section 3.2/5.5 for the current gap.

### 4.2 Profile fields

#### Identity

**Primary data source: Charity Commission for England and Wales (v1); OSCR and CCNI planned**

The Charity Commission for England and Wales publishes a publicly accessible register of all UK registered charities. Grant Pathway currently integrates with this register via the charity profile lookup (the charity searches by name or registration number on the profile page). The register provides: registered name, registration number, date of registration, registered address, and charity type. The charity confirms and may edit these values after lookup — the register is the starting point, not the final word.

**UK-wide register coverage — current position and roadmap:**

Grant Pathway is built for the whole of the United Kingdom. Charities registered in Scotland use the OSCR register (oscr.org.uk — approximately 24,000 charities); those in Northern Ireland use the Charity Commission NI (charitycommissionni.org.uk — approximately 7,000 charities). These are independent registers with their own APIs, separate from the England and Wales Charity Commission.

The v1 build integrates the England and Wales Charity Commission only. This is a technical sequencing decision, not a policy of exclusion. Scottish and Northern Irish charities are fully welcome to use Grant Pathway — they can create a profile by entering their details manually, and the full application workflow is available to them without restriction.

**OSCR (Scotland) and CCNI (Northern Ireland) lookup integration is planned and the strong intention is to deliver this before general release,** so that charities across the whole of the UK benefit from the same seamless register-lookup experience at profile setup. This will be scoped as a pre-launch task in the implementation plan.

| Field                      | Type   | Source (v1)                        | Source (planned)              | Notes                                                  |
| -------------------------- | ------ | ---------------------------------- | ----------------------------- | ------------------------------------------------------ |
| Charity name (common name) | Text   | Charity Commission lookup (E&W)    | + OSCR (Scotland) + CCNI (NI) | Name known by / brand name                             |
| Full legal name            | Text   | Charity Commission lookup (E&W)    | + OSCR + CCNI                 | As registered; may differ from common name             |
| Registration number        | Number | Charity Commission lookup (E&W)    | + OSCR + CCNI                 | England & Wales, Scottish, or NI number as appropriate |
| Organisation type          | Select | Charity Commission lookup (E&W)    | + OSCR + CCNI                 | UK Registered Charity / UK Publicly Exempt Charity     |
| Year established           | Year   | Charity Commission lookup (E&W)    | + OSCR + CCNI                 | Derived from registration date                         |
| Website                    | URL    | Charity Commission lookup / manual | + OSCR + CCNI                 | Register may hold this; charity confirms               |

#### Address and contact

| Field                         | Type    | Notes                           |
| ----------------------------- | ------- | ------------------------------- |
| Registered address            | Address | Full address including postcode |
| Main contact name             | Text    | Title, first name, last name    |
| Main contact role / job title | Text    |                                 |
| Main contact telephone        | Text    | Including dialling code         |
| Main contact email            | Email   |                                 |

#### Mission and work

| Field                       | Type      | Notes                                             |
| --------------------------- | --------- | ------------------------------------------------- |
| What the charity does       | Long text | AI context; existing field                        |
| Who the charity helps       | Long text | AI context; existing field                        |
| Where the charity works     | Text      | Geographic scope; existing field                  |
| Aims and objectives summary | Long text | Used for Q9-style "outline of org aims" questions |

#### Financial (from latest signed accounts)

**Primary data source: Charity Commission annual return submissions**

UK registered charities submit annual accounts and financial returns to the Charity Commission, which publishes summary financial data (income, expenditure, assets, employee count) on the public register. Grant Pathway can pre-populate financial fields by reading this published data at the point of profile setup. **However, this data is typically 12–18 months behind the charity's current position** — Charity Commission data reflects the last submitted accounts, not the current financial year.

The charity must therefore review and update every financial field against their latest signed accounts before using Grant Pathway for an application. The profile should prompt the charity to confirm the accounts date and flag if the Charity Commission data appears out of date. **All financial data in Grant Pathway must be verified and confirmed by the charity — ideally by the treasurer or finance lead.** The Charity Commission is a convenient starting point, not a source of truth for live financial figures.

| Field                                | Type                     | Source                      | Notes                                                                                             |
| ------------------------------------ | ------------------------ | --------------------------- | ------------------------------------------------------------------------------------------------- |
| Latest accounts date                 | Date                     | Charity Commission / manual | Charity confirms this is the correct reporting period                                             |
| Total income                         | Currency                 | Charity Commission / manual | From latest signed accounts; charity must verify                                                  |
| Total expenditure                    | Currency                 | Charity Commission / manual | From latest signed accounts; charity must verify                                                  |
| Surplus / deficit                    | Currency                 | Auto-calculated or entered  | Grant Pathway auto-calculates; charity confirms                                                   |
| Number of employees (FTE)            | Number                   | Charity Commission / manual | Full-time equivalent; charity must verify                                                         |
| Number of volunteers                 | Number                   | Manual                      | Not in Charity Commission data; charity enters directly                                           |
| Number of trustees                   | Number                   | Charity Commission / manual | Charity confirms                                                                                  |
| Average employee salary              | Currency                 | Manual                      | Not in Charity Commission data; calculated by charity (cost of salaries ÷ FTE, excl. employer NI) |
| Top salary band                      | Text                     | Manual                      | e.g. £40,000–£50,000; charity enters directly                                                     |
| Government / local authority funding | Currency                 | Manual                      | From latest accounts; charity enters directly                                                     |
| Main non-government funders          | Repeating text (up to 5) | Manual                      | Trust and foundation names; charity enters directly                                               |

#### Supporting document status

| Field                                    | Type    | Notes                                                |
| ---------------------------------------- | ------- | ---------------------------------------------------- |
| Safeguarding policy — held               | Boolean | Yes/No — charity confirms they have a current policy |
| Annual accounts — held                   | Boolean | Yes/No — confirms signed accounts available          |
| Management accounts — held               | Boolean | Yes/No                                               |
| Governing document / constitution — held | Boolean | Yes/No                                               |

### 4.3 Profile completeness indicator

The application creation screen shows which profile fields are missing and which funder questions cannot be pre-filled as a result. This prompts the charity to complete the profile before starting rather than encountering blank fields mid-application.

---

## 5. Application Workflow

### 5.1 Overview

Grant Pathway uses a five-step linear workflow. The steps are the same regardless of funder tier, but the behaviour at Step 3 (AI Summary) and Step 4 (Draft Answers) adapts based on what the AI extracts from the guidelines.

```
Step 1: Application Details
Step 2: Upload Guidelines
Step 3: AI Summary
Step 4: Draft Answers
Step 5: Review and Export
```

### 5.2 Step 1 — Application Details

The charity enters:

- Funder name
- Grant name / programme name

The charity selects the funder from a searchable picker of the approved funder directory (`DR-FD-001`) — no coverage tier is displayed here or anywhere else in the app (see Section 3.3).

### 5.3 Step 2 — Upload Guidelines

The charity uploads the funder's published guidelines document (PDF or Word) or pastes guidelines text directly. This is the source the AI analyses at Step 3.

**What to upload by funder tier:**

- Tier 1: The published question set PDF/Word document
- Tier 2: The question reference document from the funder's portal
- Tier 3: The funder's published narrative guidelines or headings document

### 5.4 Step 3 — AI Summary

The AI analyses the uploaded guidelines and produces a structured summary. The summary includes:

| Field                          | Description                                                        |
| ------------------------------ | ------------------------------------------------------------------ |
| About this grant               | 2–3 sentences: funder name, programme, purpose                     |
| Grant amount                   | Range as stated in guidelines                                      |
| Who can apply                  | Eligibility criteria as bullet points                              |
| What they're looking for       | Funding priorities as bullet points                                |
| Key requirements               | Important restrictions, exclusions, deadlines                      |
| Funder AI policy               | Verbatim or paraphrased if stated; null if not mentioned           |
| Application questions (Tier 1) | Narrative questions only — data-entry and non-text fields excluded |
| Application sections (Tier 3)  | Narrative themes/sections with guidance text per section           |

The charity reviews the summary and confirms it is accurate before proceeding to Step 4.

### 5.5 Step 4 — Draft Answers

#### Question-level typing

**⚠ As decided (2026-05-29) vs. as actually built (confirmed 2026-07-04) — these diverge significantly:**

As originally decided, every question extracted by the AI was to carry a `question_type`, with each type handled differently at Step 4:

| Type          | How it appears in Step 4                                                 | Pre-fill behaviour                       |
| ------------- | ------------------------------------------------------------------------ | ---------------------------------------- |
| `narrative`   | Writing card with textarea, word/character counter, AI assist button     | Blank — charity writes                   |
| `data_entry`  | Pre-filled read-only field with edit option                              | Auto-populated from profile if available |
| `financial`   | Pre-filled from profile financial fields; amber background; no AI assist | Auto-populated from profile              |
| `dropdown`    | Listed as "Select in portal" reminder; not editable                      | N/A                                      |
| `date`        | Listed as reminder; not editable                                         | N/A                                      |
| `file_upload` | Listed as supporting document reminder                                   | Profile doc-status flag shown            |

**What was actually built:** there is no `question_type` column in the database at all. The AI extraction prompt is instructed to extract narrative questions only — `data_entry`, `financial`, `dropdown`, `date`, and `file_upload` questions are explicitly excluded at extraction and never reach the application. The only refinement on top of plain narrative extraction is a boolean `is_budget_question` flag: a question that asks about finances but still carries its own word/character limit is extracted as a normal writing card, flagged amber, with AI assist disabled — the charity types the figures themselves, they are not pre-filled from the profile.

In practice, Step 4 today looks the same regardless of funder tier: a focused writing interface showing only narrative questions (plus any amber-flagged budget questions), with no visibility into whatever non-narrative fields the funder's actual form also requires. Whether to build the fuller typed-field behaviour above is an open decision — see Section 10 (BD-03/BD-04 amendment).

#### Limit handling

Every narrative question carries a `limit_value` (integer) and `limit_type` (`words` or `characters`). The Step 4 counter displays:

- "120 / 800 characters" for character-limited questions
- "85 / 200 words" for word-limited questions

Limits come from the guidelines. Where limits are not stated, no counter is shown.

#### AI assistance — assist, not generate

The "Help me improve this" button is available on all narrative questions. It is disabled on questions flagged as budget/financial (`is_budget_question`). **It refines structure, flow, and clarity — it does not add, invent, or generate new information.** The charity's words and facts remain the foundation; AI only improves how they are expressed. This means the application continues to reflect the charity's authentic voice — which is what funders assess and value.

**Known limitation (`PDR-AI-006`, 2026-07-04):** when an answer is over its word/character limit, the refine prompt is instructed to compress it to fit — but large language models cannot reliably hit an exact word or character count, since they generate text without literally counting as they go. Confirmed live during Clothworkers testing: a 344-word answer against a 250-word limit came back from AI assist almost completely unchanged. A fix improving compression reliability shipped the same day (`D-CW-02`), and a user-facing message for when a suggestion is still over the limit has been decided (`PDR-AI-006`) but not yet built. Do not assume AI assist reliably brings an over-limit answer within the stated limit — the charity must still check the counter after accepting a suggestion.

#### Preparation checklist

On first entry to Step 4, the charity is shown a preparation checklist covering:

- Financial documents needed (annual accounts, management accounts, budget)
- Safeguarding policy
- Any other supporting documents flagged by the AI from the guidelines

This is shown once per application and requires explicit dismissal.

#### Senior review prompt

Before assembling, the charity is prompted to involve a senior colleague (CEO, treasurer, or trustee) to review financial figures and confirm the application accurately represents the organisation. In the live product this is the "Before we put it together" screen, confirmed via the **Yes — assemble my draft** button.

### 5.6 Step 5 — Review and Export

**⚠ Revised significantly from the original design (D-WF-04, 2026-06-12) — the BRD was not updated to match at the time.**

The charity reviews the assembled draft, then ticks three confirmation checkboxes ("I have reviewed all responses...", "The information provided is accurate and complete...", "I understand this application was prepared with AI assistance..."). The download buttons are disabled until all three are ticked.

**There is no separate approval step.** Clicking **Download as Word document (.docx)** both approves the application and downloads it in a single action — the previous design (a separate Approve button and confirmation modal) was removed as redundant friction, since ticking three checkboxes already demonstrates intent. After the first download, a persistent "Application approved" banner replaces the checklist, and the application status changes to `exported`.

**Re-export:** clicking either download button again (Word or plain text) after the application has already been exported shows a warning dialog stating the prior export's timestamp, since the charity may already have submitted that version to the funder. The charity can cancel or proceed.

**Export formats:**

- **Word document (.docx)** — formatted, labelled, with disclaimer, attribution, and a "Page N of NN" footer line
- **Plain text (.txt)** — for copying into portals; same content and footer, no page numbers

**Not built:** per-question copy buttons for individual portal-field submission (originally envisioned for Tier 2) do not exist. The only export mechanisms are the two whole-document downloads above.

---

## 6. Limit Handling

### 6.1 Data model

`application_answers` table carries:

- `limit_value` — integer (the number); null if no limit stated
- `limit_type` — `words | characters | none`

### 6.2 AI extraction

The AI prompt extracts limit type and value from guidelines text. Common patterns:

- "no more than 800 characters" → `limit_value: 800, limit_type: characters`
- "maximum 200 words" → `limit_value: 200, limit_type: words`
- "up to 400 words" → `limit_value: 400, limit_type: words`
- No limit stated → `limit_value: null, limit_type: none`

### 6.3 Over-limit behaviour

**⚠ Reversed from the original design (`D-LBF-02`, 2026-06-04) — the BRD was not updated to match at the time.**

Exceeding a limit triggers a visible warning (counter turns red) and a message: "Please trim it or use AI to bring it within the limit before approving." Unlike the original design, this is now a **hard stop, not advisory**: the **Approve this answer** button is hidden while any answer is over its limit — the charity cannot approve, and therefore cannot proceed to assembly, until every answer is within limit. The original "warn but allow" behaviour was removed because grant portal systems uniformly reject over-limit submissions, so allowing approval in Grant Pathway would have given false confidence.

AI assist remains available on over-limit answers specifically to help bring them within the limit — see the known limitation on AI compression reliability in Section 5.5.

---

## 7. Multi-Stage Applications

Funders with two-stage processes (Stage 1 Expression of Interest → Stage 2 Full Application) are handled as separate, independent applications in Grant Pathway. The charity creates one application per stage, naming them clearly (e.g. "Henry Smith Foundation — Stage 1 EOI").

There is no automated linkage between stages in v1. The charity manages the relationship between stages themselves.

---

## 8. Out of Scope

The following are explicitly out of scope for Grant Pathway v1 and should not be built, implied, or promised:

| Out of scope                             | Reason                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Direct portal submission                 | Each funder's portal requires separate authentication and integration; not feasible at scale                                                                                                                                                                                                                                                                                                                                                                                     |
| Funder discovery / grant-finding         | Separate problem; well-served by existing tools (GrantFinder, GRANTIS)                                                                                                                                                                                                                                                                                                                                                                                                           |
| Comprehensive eligibility screening      | Grant Pathway does not confirm whether a charity is eligible; the charity must read the guidelines. Note: this is not contradicted by `FR-47` (added 2026-06-02, after this BRD's original decisions), which is a narrower, coarse hard stop for _clear, obvious_ mismatches (e.g. a Milton-Keynes-only funder and an applicant charity based in Surrey) — it does not attempt full eligibility confirmation, and has no override path other than correcting the charity profile |
| Supporting document storage              | Accounts, safeguarding policies etc. are held by the charity; Grant Pathway only tracks whether they exist                                                                                                                                                                                                                                                                                                                                                                       |
| Submission deadline tracking             | Calendar/CRM functionality; out of scope                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Reporting and monitoring                 | Post-award reporting to funders is a separate workflow                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Multi-user / team collaboration          | v1 is single-user per account; team features deferred                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Funder portal login / session management | Grant Pathway does not handle funder authentication                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Stage 1 → Stage 2 auto-population        | Separate applications; manual linking only                                                                                                                                                                                                                                                                                                                                                                                                                                       |

---

## 9. Success Metrics

### 9.1 Product metrics

| Metric                                    | Target (12 months post-launch) |
| ----------------------------------------- | ------------------------------ |
| Registered charities                      | 500                            |
| Applications started                      | 2,000                          |
| Applications exported (completed)         | 1,200                          |
| Completion rate (exported / started)      | ≥ 60%                          |
| AI requests used per exported application | ≤ 8                            |
| Monthly active users                      | 300                            |

### 9.2 Quality metrics

| Metric                                                 | Target                       |
| ------------------------------------------------------ | ---------------------------- |
| Step 3 parse error rate                                | < 1% of summary generations  |
| Step 3 success rate (questions/sections extracted)     | ≥ 90% of uploads             |
| Refine-answer satisfaction (user accepts refined text) | ≥ 70%                        |
| Support tickets related to errors                      | < 5% of monthly active users |

### 9.3 Charity outcome metrics (surveyed)

- % of users who report the application was stronger than one they would have written unaided
- % of completed applications that resulted in a grant award (tracked voluntarily)
- Average time from application start to export

---

## 10. Key Business Decisions Log

The following decisions were made in the design session of 2026-05-29 and underpin this document. Each should be revisited explicitly if circumstances change. The **Status** column reflects reality as confirmed on 2026-07-04 — see the notes below the table for BD-03, BD-04, and the new BD-08.

| #     | Decision                                                                                         | Rationale                                                                                                                           |
| ----- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| BD-01 | Grant Pathway is a preparation tool, not a submission platform                                   | Funder portals are proprietary and cannot be integrated generically; submission responsibility stays with the charity               | Built as decided                                                      |
| BD-02 | Charity profile is "thick" — stores full org data including financials and contact details       | Pre-fill requires a complete profile; without it the product delivers less value per application                                    | Built as decided                                                      |
| BD-03 | Non-narrative questions are pre-filled from profile where possible; shown as reminders otherwise | Data-entry questions are not a writing problem; AI should not be used on them                                                       | **Open decision resolved 2026-07-05 — superseded, see note below**    |
| BD-04 | Question-level typing replaces funder-level type as the primary classification                   | Funder type (structured/narrative) determines output format only; question type determines how each field is handled                | **Partially built; fully addressed by ADR-DATA-006 — see note below** |
| BD-05 | Both character limits and word limits are supported                                              | The majority of UK funders use character limits; supporting word limits only was a false assumption                                 | Built as decided                                                      |
| BD-06 | Multi-stage applications are separate records; no automated linkage in v1                        | Simplicity preferred; charities can manage stage linkage themselves                                                                 | Built as decided                                                      |
| BD-07 | Funders are actively marketed at the coverage tier they genuinely support                        | Honesty about partial coverage is better than implying uniform support; builds trust with users                                     | **Not built — no tier display exists (Section 3.3)**                  |
| BD-08 | Retired the funder-level "Structured"/"Narrative" picker badge                                   | Found not to reflect a stable property of any funder, and disconnected from the mechanism that actually drives Step 3/4/5 behaviour | Decided and built, 2026-07-04 (see note below)                        |

**BD-03 note:** Never implemented as originally specified. The AI extraction prompt discards non-narrative questions entirely rather than extracting them for pre-fill or reminder display. This surfaced during Clothworkers testing (`IT-CW-08`) and stood as an open decision — whether to build BD-03 as specified depended on whether Grant Pathway extends toward broader "any guideline or form" coverage or stays narrowly scoped to narrative writing assistance.

**Resolved 2026-07-05:** A structured review of nine funders (`docs/BRD plus decisions Mark Two/question-coverage-analysis.md`) found the underlying question wasn't really "pre-fill or remind on non-narrative fields" — it was twenty distinct ways the flat, narrative-only data model doesn't match real funder requirements (R1–R20, `docs/BRD plus decisions Mark Two/clean-slate-design-proposal.md`). **ADR-DATA-006** decides a typed item-graph model, populated via AI-drafted, human-reviewed playbooks per funder, that supersedes BD-03 rather than resolving it narrowly — non-narrative handling becomes one of several item types in that model, not a standalone patch. This commits Grant Pathway toward the broader "any guideline or form" direction. Not yet built; see `docs/BRD plus decisions Mark Two/build-plan-any-guideline-or-form.md` for phased sequencing. Section 3.2/5.5 should be revisited once that build lands, not before.

**BD-04 note:** The question-level typing mechanism itself was only partially built (see Section 5.5) — only `narrative` extraction exists in practice. Separately, "funder type (structured/narrative)" as referenced in this decision's own rationale turned out to be a _different, later-introduced_ concept than intended: it was decided in `DR-FD-001` (2026-06-01, two days after this BRD's design session) purely as a database convenience, never actually defined, and it collided in name with the unrelated, well-defined _question-level_ `narrative` type from this same BD-04. Reviewing the real guideline documents in `docs/Grant Org Guidelines/` found it didn't reflect a stable property of any funder either — several funders (Henry Smith, Idlewild) produce both a discrete-question form and free-form guidance, depending on which document is uploaded. This is what BD-08 retires.

**Resolved 2026-07-05:** BD-04's original instinct — question-level typing, not funder-level typing, as the primary classification — was correct, and is exactly what **ADR-DATA-006**'s item-graph model fully realises: every item (narrative, data, date, number, table, file, consent, eligibility gate, scoring criterion, manual action) is typed and classified individually. BD-04 does not need further direct amendment; it is subsumed into ADR-DATA-006 going forward.

**BD-08 note:** See `docs/decisions/DR-FD-001-funder-directory-model.md` (v1.0 → v1.2) for the full amendment. The `funders.funder_type` DB column is left in place, unused, as low-priority cleanup. The dynamic, per-application `structured`/`free_form` classification derived from each application's own AI summary (which genuinely drives Step 3/4/5 behaviour) is unaffected and was not part of this change.

---

## Document History

| Version | Date       | Author                    | Changes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------- | ---------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0.1     | 2026-05-29 | Rapidglobe Ltd / WJ Okhia | Initial draft — Mark Two BRD. Supersedes BRD-Grant-Pathway-v0.2.md. Based on testing session of May 2026 and seven business-level decisions agreed with WJ Okhia.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 0.2     | 2026-05-29 | Rapidglobe Ltd / WJ Okhia | Section 1.1 updated: AI assists, not generates — added as explicit product principle with reinforcement throughout. Section 1.4 substantially expanded: deep research (104 agents, 22 verified claims) identified 10 additional UK funders with published AI policies — Lloyds Bank Foundation, Paul Hamlyn Foundation, Arts Council England, BFI, Esmée Fairbairn, London Community Foundation, UKRI, RGS, Wellcome joint statement — all added with verbatim quotes and source URLs. Section 1.3 updated. Section 5.4 AI assistance paragraph strengthened.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 0.3     | 2026-05-29 | Rapidglobe Ltd / WJ Okhia | Section 2.1 bullet 4 reworded: pain point clarified as capacity and time, not lack of knowledge. Section 2.2 strengthened: senior staff involvement for financial sections stated as mandatory; treasurer/finance lead sign-off requirement made explicit. Section 3.2 Tier 1: Charity Commission pre-fill flow (register → profile → application) added. Section 4.2 Identity: Charity Commission as primary data source documented; OSCR/CCNI noted; source column added to table. Section 4.2 Financial: Charity Commission annual returns as starting-point source documented; 12–18 month data lag warning added; mandatory verification by treasurer/finance lead stated; source column added to table.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 0.4     | 2026-05-29 | Rapidglobe Ltd / WJ Okhia | Section 4.2 Identity and Section 3.2 Tier 1: UK register coverage policy clarified. v1 integrates England and Wales Charity Commission only — this is a technical sequencing decision, not a policy of exclusion. Scottish (OSCR) and Northern Irish (CCNI) charities are fully welcome to use Grant Pathway and can create a profile manually in v1. OSCR and CCNI lookup integration is planned with the strong intention to deliver before general release. Register coverage table updated with v1 and planned columns. Section 3.2 Tier 1 updated to reflect Scottish and NI manual-entry path in v1 with lookup planned.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 0.6     | 2026-07-05 | Rapidglobe Ltd / WJ Okhia | Section 10's BD-03 open decision resolved: a nine-funder review (`docs/BRD plus decisions Mark Two/question-coverage-analysis.md`) and design proposal (`clean-slate-design-proposal.md`) found the underlying problem was twenty distinct ways the flat, narrative-only data model doesn't match real funder requirements, not simply "pre-fill or remind." **ADR-DATA-006** decides a typed item-graph model, populated via AI-drafted, human-reviewed playbooks per funder — this supersedes BD-03 rather than resolving it narrowly, and commits Grant Pathway toward broader "any guideline or form" coverage. BD-04 marked as subsumed into the same decision (its question-level-typing instinct was correct; ADR-DATA-006 fully realises it). Not yet built — see `build-plan-any-guideline-or-form.md` for phased sequencing; Section 3.2/5.5 to be revisited once that lands, not before.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 0.5     | 2026-07-04 | Rapidglobe Ltd / WJ Okhia | Renamed from "BRD-Grant-Pathway-Mark-Two-v0.4.md" — this document is now the main, live BRD reference going forward, not a dated snapshot; the retired v0.4 (and the Mark One v0.2) are archived in `docs/Old/`. Substantially updated to reflect the service as actually built, following Phase 5 testing (MKCF, A B Charitable Trust, Clothworkers' Foundation) and a deep-dive into the funder-type/question-type terminology prompted by IT-CW-08: Section 3.2 corrected — non-narrative question pre-fill/reminder behaviour (BD-03) was never built; Section 3.3 corrected — the tier/coverage-level display was never built at all; Section 3.4 retired in favour of `TEST-DASHBOARD.md` as the canonical funder list; Section 5.5 question-typing table corrected to reflect narrative-only extraction plus the `is_budget_question` flag, and a known AI over-limit compression limitation added (`PDR-AI-006`); Section 5.6 rewritten to reflect the 2026-06-12 approve+download merge and re-export warning (`D-WF-04`), and the never-built per-question copy buttons removed; Section 6.3 reversed from "advisory" to "hard stop" to match the actual 2026-06-04 change (`D-LBF-02`); Section 8 clarified against `FR-47`; Section 10 given a Status column and notes on BD-03/BD-04's implementation gaps, plus new BD-08 recording the funder-picker badge retirement (`DR-FD-001` v1.2). Where a gap reflects an undecided product direction (BD-03/BD-04) rather than a simple correction, this is stated explicitly rather than resolved unilaterally. `docs/PRD decisions/PRD-DECISIONS-INDEX.md`'s dangling reference to a non-existent `business/BRD-Grant-Pathway-v1.md` corrected to point here. |
