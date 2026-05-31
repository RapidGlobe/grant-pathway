# Grant Pathway — Business Requirements Document Mark Two

**Version:** 0.4
**Date:** 2026-05-29
**Status:** Draft — awaiting review and sign-off
**Author:** Rapidglobe Ltd / WJokhia
**Supersedes:** BRD-Grant-Pathway-v0.2.md (Mark One)

---

## Foreword — Why Mark Two Exists

The Mark One BRD was written before Grant Pathway had been tested against real funder documents. Testing in May 2026 against the consolidated 12-funder target list revealed that the assumptions underpinning the original design did not hold across the full range of UK grant-giving organisations. Specifically:

- Most funders use proprietary online portals for submission — Grant Pathway cannot submit on a charity's behalf and should not imply it can.
- The majority of questions on many funder forms are non-narrative (data-entry, financial, dropdown, file upload) — the AI can only genuinely assist with narrative text answers.
- Funder form structures vary enormously — not just structured vs. narrative but across a continuum of question types within a single form.
- Character limits are more common than word limits across UK funders — the Mark One data model only handled word limits.

Mark Two re-bases the product on what was actually observed, not on what was assumed. Where Mark One and Mark Two conflict, Mark Two takes precedence.

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

| Funder | Position | Key quote | Source |
|--------|----------|-----------|--------|
| **Henry Smith Foundation** | Cautious — structure only | *"If you use AI, let it help structure your application rather than the content. Your application should reflect your voice and experience. Applications written in your own words give a much better insight into your work."* | henrysmith.foundation |
| **National Lottery Community Fund** | Permissive — warns against generic content | *"You can use AI tools to help write your funding application. We will not reject an application just because AI was used. AI supported applications do not tell the unique story of your community."* | tnlcommunityfund.org.uk |
| **Lloyds Bank Foundation** | Permissive — warns about over-reliance | *"We read every single funding and job application we receive and do not use AI in any part of our decision making. It is often noticeable when AI has been over-relied on and, in many cases, this is not giving applicants the best chance of success. These applications are often generic, and do not bring out your own voice or uniqueness."* | lloydsbankfoundation.org.uk/about-us/ai-position-statement |
| **Paul Hamlyn Foundation** | Permissive — warns about distinctiveness | *"Using AI tools alone will not disadvantage your application. But be careful of how it is used. This can make it more difficult to understand what is different or special about an applicant, or the work they are describing. We do not use AI to assess grant applications or job applications."* | phf.org.uk/using-ai-in-your-work-with-us |
| **Arts Council England** | Permissive — applicants accountable | *"While generative AI can be useful for drafting applications and organising reporting material, applicants and grantholders are accountable for what they submit."* ACE also advises caution around bias, transparency, data protection, and the moral and legal rights of creators. | artscouncil.org.uk |
| **British Film Institute** | Permissive — transparency required | *"We do not prohibit the use of AI in funding applications, or in the projects we support, but we do require applicants to be transparent about the use of any AI. Using AI in your project, or to complete your application, could result in a project or application that looks remarkably similar to others. Losing the creative uniqueness of your project or application may mean it is less likely to stand out within the context of a competitive fund."* | bfi.org.uk |
| **Esmée Fairbairn Foundation** | No formal policy — applicant discretion | *"This is a decision for individual organisations to take and we have no preference."* Expects applications to honestly reflect the applicant's work. | esmeefairbairn.org.uk |
| **London Community Foundation** | Exploratory — content must be owned by applicant | *"We do not currently have formal AI guidelines, as we are still in the exploratory phase. The content included in your application or report, and the proposed or delivered activity, must be owned by you as the applicant doing the work."* | londoncf.org.uk/guidance-on-artificial-intelligence |
| **UKRI** | Permissive — transparency expected | *"Applicants and applications are expected to be transparent where they have used generative AI tools in the development of an application. This information will not affect the assessment process."* | ukri.org |
| **Royal Geographical Society** | Disclose use; prohibit AI in review | *"Disclose any use of generative AI tools. AI tools should not be used as part of the review process — for reasons of academic rigour and confidentiality."* | rgs.org |
| **Wellcome Trust + joint statement** | Cross-funder consensus (September 2023) | Co-signed by UKRI, Cancer Research UK, NIHR, British Heart Foundation, Royal Academy of Engineering, Royal Society, and Association of Medical Research Charities. Established shared position that AI use in application preparation must be cited and acknowledged, and that AI must not be used in peer review. | wellcome.org |

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

The funder publishes narrative questions with explicit word or character limits. Grant Pathway extracts all narrative questions, pre-fills data-entry answers from the charity profile, presents each narrative question as a guided writing card, and produces copy-ready output for every answer.

Data-entry fields (charity name, registration number, address, financial figures, staff counts) are pre-filled automatically from the charity profile. Where the charity profile was itself populated from the Charity Commission register (see Section 4.2), this creates a seamless flow: Charity Commission → profile → application pre-fill, with the charity reviewing and confirming each value.

For charities registered in Scotland (OSCR) or Northern Ireland (CCNI), the same pre-fill flow applies once their profile is complete — they enter their details manually in v1, with register lookup planned before general release (see Section 4.2).

**Characteristics:**
- Published question set (PDF, Word, or accessible web page)
- Narrative text questions with stated limits
- Non-narrative fields pre-fillable from charity profile (England and Wales: auto-populated from Charity Commission register; Scotland and NI: manual profile entry in v1, register lookup planned)

**Examples:** Henry Smith Foundation (Stage 1), Wolfson Foundation (Stage 1), Lloyds Bank Foundation CI

#### Tier 2 — Partial coverage

The funder uses a portal-based form where the majority of fields are non-narrative (data-entry, financial, dropdown, file upload). Grant Pathway extracts and assists with the narrative subset only. Non-narrative fields are presented as a pre-fill checklist the charity completes from their profile or manually.

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

The coverage level for each supported funder is displayed:
- On the new application creation screen (before the charity starts)
- In the funder summary card at Step 3
- In the export screen with appropriate framing per tier

### 3.4 Initial supported funder list

The following funders are targeted for v1 support. Coverage level is indicative pending full review of each funder's published materials.

| Funder | Indicative tier | Grant range | Notes |
|--------|----------------|-------------|-------|
| Henry Smith Foundation | Tier 1 | £10k–£100k | Stage 1 only for v1; Stage 2 separate application |
| Wolfson Foundation | Tier 1 | £30k–£250k+ | Stage 1 only for v1 |
| Lloyds Bank Foundation CI | Tier 1 | £5k–£50k | PDF Advice Note — textbook fit |
| Clothworkers' Foundation | Tier 1 | Up to £15k+ | Verify word/character limits |
| Foyle Foundation | Tier 1 / Tier 3 | £10k–£75k | Verify — may be narrative per sector |
| Walton Charity | Tier 1 | Up to £10k+ | Verify guidelines structure |
| Nationwide BS Community Grants | Tier 1 | £10k–£60k | Verify question structure |
| Motability Foundation | Tier 1 | £50k–£1m | Larger grants; verify |
| Garfield Weston Foundation | Tier 3 | Up to £100k | Primary free-form test case |
| City Bridge Foundation | Tier 3 | £75k–£450k | Word sample form |
| Idlewild Trust | Tier 2 | £10k–£30k | Portal; character limits; mixed types |
| A B Charitable Trust | Tier 2 | £10k–£40k/yr | Portal; mostly non-narrative; verify |

---

## 4. Charity Profile — The Organisation Vault

### 4.1 Purpose

The charity profile is the organisation's permanent data store within Grant Pathway. It serves two functions:
1. **Context for AI** — the profile is passed to the AI on every application to ensure responses reflect the charity's voice, mission, and track record.
2. **Pre-fill source** — data-entry questions on funder forms (address, charity number, financial figures, staff counts etc.) are answered automatically from the profile wherever possible.

### 4.2 Profile fields

#### Identity

**Primary data source: Charity Commission for England and Wales (v1); OSCR and CCNI planned**

The Charity Commission for England and Wales publishes a publicly accessible register of all UK registered charities. Grant Pathway currently integrates with this register via the charity profile lookup (the charity searches by name or registration number on the profile page). The register provides: registered name, registration number, date of registration, registered address, and charity type. The charity confirms and may edit these values after lookup — the register is the starting point, not the final word.

**UK-wide register coverage — current position and roadmap:**

Grant Pathway is built for the whole of the United Kingdom. Charities registered in Scotland use the OSCR register (oscr.org.uk — approximately 24,000 charities); those in Northern Ireland use the Charity Commission NI (charitycommissionni.org.uk — approximately 7,000 charities). These are independent registers with their own APIs, separate from the England and Wales Charity Commission.

The v1 build integrates the England and Wales Charity Commission only. This is a technical sequencing decision, not a policy of exclusion. Scottish and Northern Irish charities are fully welcome to use Grant Pathway — they can create a profile by entering their details manually, and the full application workflow is available to them without restriction.

**OSCR (Scotland) and CCNI (Northern Ireland) lookup integration is planned and the strong intention is to deliver this before general release,** so that charities across the whole of the UK benefit from the same seamless register-lookup experience at profile setup. This will be scoped as a pre-launch task in the implementation plan.

| Field | Type | Source (v1) | Source (planned) | Notes |
|-------|------|-------------|------------------|-------|
| Charity name (common name) | Text | Charity Commission lookup (E&W) | + OSCR (Scotland) + CCNI (NI) | Name known by / brand name |
| Full legal name | Text | Charity Commission lookup (E&W) | + OSCR + CCNI | As registered; may differ from common name |
| Registration number | Number | Charity Commission lookup (E&W) | + OSCR + CCNI | England & Wales, Scottish, or NI number as appropriate |
| Organisation type | Select | Charity Commission lookup (E&W) | + OSCR + CCNI | UK Registered Charity / UK Publicly Exempt Charity |
| Year established | Year | Charity Commission lookup (E&W) | + OSCR + CCNI | Derived from registration date |
| Website | URL | Charity Commission lookup / manual | + OSCR + CCNI | Register may hold this; charity confirms |

#### Address and contact
| Field | Type | Notes |
|-------|------|-------|
| Registered address | Address | Full address including postcode |
| Main contact name | Text | Title, first name, last name |
| Main contact role / job title | Text | |
| Main contact telephone | Text | Including dialling code |
| Main contact email | Email | |

#### Mission and work
| Field | Type | Notes |
|-------|------|-------|
| What the charity does | Long text | AI context; existing field |
| Who the charity helps | Long text | AI context; existing field |
| Where the charity works | Text | Geographic scope; existing field |
| Aims and objectives summary | Long text | Used for Q9-style "outline of org aims" questions |

#### Financial (from latest signed accounts)

**Primary data source: Charity Commission annual return submissions**

UK registered charities submit annual accounts and financial returns to the Charity Commission, which publishes summary financial data (income, expenditure, assets, employee count) on the public register. Grant Pathway can pre-populate financial fields by reading this published data at the point of profile setup. **However, this data is typically 12–18 months behind the charity's current position** — Charity Commission data reflects the last submitted accounts, not the current financial year.

The charity must therefore review and update every financial field against their latest signed accounts before using Grant Pathway for an application. The profile should prompt the charity to confirm the accounts date and flag if the Charity Commission data appears out of date. **All financial data in Grant Pathway must be verified and confirmed by the charity — ideally by the treasurer or finance lead.** The Charity Commission is a convenient starting point, not a source of truth for live financial figures.

| Field | Type | Source | Notes |
|-------|------|--------|-------|
| Latest accounts date | Date | Charity Commission / manual | Charity confirms this is the correct reporting period |
| Total income | Currency | Charity Commission / manual | From latest signed accounts; charity must verify |
| Total expenditure | Currency | Charity Commission / manual | From latest signed accounts; charity must verify |
| Surplus / deficit | Currency | Auto-calculated or entered | Grant Pathway auto-calculates; charity confirms |
| Number of employees (FTE) | Number | Charity Commission / manual | Full-time equivalent; charity must verify |
| Number of volunteers | Number | Manual | Not in Charity Commission data; charity enters directly |
| Number of trustees | Number | Charity Commission / manual | Charity confirms |
| Average employee salary | Currency | Manual | Not in Charity Commission data; calculated by charity (cost of salaries ÷ FTE, excl. employer NI) |
| Top salary band | Text | Manual | e.g. £40,000–£50,000; charity enters directly |
| Government / local authority funding | Currency | Manual | From latest accounts; charity enters directly |
| Main non-government funders | Repeating text (up to 5) | Manual | Trust and foundation names; charity enters directly |

#### Supporting document status
| Field | Type | Notes |
|-------|------|-------|
| Safeguarding policy — held | Boolean | Yes/No — charity confirms they have a current policy |
| Annual accounts — held | Boolean | Yes/No — confirms signed accounts available |
| Management accounts — held | Boolean | Yes/No |
| Governing document / constitution — held | Boolean | Yes/No |

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

If the funder is on the supported list, the coverage tier is displayed here. The charity can still proceed with any funder regardless of tier.

### 5.3 Step 2 — Upload Guidelines

The charity uploads the funder's published guidelines document (PDF or Word) or pastes guidelines text directly. This is the source the AI analyses at Step 3.

**What to upload by funder tier:**
- Tier 1: The published question set PDF/Word document
- Tier 2: The question reference document from the funder's portal
- Tier 3: The funder's published narrative guidelines or headings document

### 5.4 Step 3 — AI Summary

The AI analyses the uploaded guidelines and produces a structured summary. The summary includes:

| Field | Description |
|-------|-------------|
| About this grant | 2–3 sentences: funder name, programme, purpose |
| Grant amount | Range as stated in guidelines |
| Who can apply | Eligibility criteria as bullet points |
| What they're looking for | Funding priorities as bullet points |
| Key requirements | Important restrictions, exclusions, deadlines |
| Funder AI policy | Verbatim or paraphrased if stated; null if not mentioned |
| Application questions (Tier 1) | Narrative questions only — data-entry and non-text fields excluded |
| Application sections (Tier 3) | Narrative themes/sections with guidance text per section |

The charity reviews the summary and confirms it is accurate before proceeding to Step 4.

### 5.5 Step 4 — Draft Answers

#### Question-level typing

Every question or section extracted by the AI carries a `question_type`:

| Type | How it appears in Step 4 | Pre-fill behaviour |
|------|--------------------------|-------------------|
| `narrative` | Writing card with textarea, word/character counter, AI assist button | Blank — charity writes |
| `data_entry` | Pre-filled read-only field with edit option | Auto-populated from profile if available |
| `financial` | Pre-filled from profile financial fields; amber background; no AI assist | Auto-populated from profile |
| `dropdown` | Listed as "Select in portal" reminder; not editable | N/A |
| `date` | Listed as reminder; not editable | N/A |
| `file_upload` | Listed as supporting document reminder | Profile doc-status flag shown |

This means Step 4 for a Tier 1 funder is a focused writing interface. For a Tier 2 funder it is a combination of pre-filled data and a smaller set of writing cards. For a Tier 3 funder it is a section-by-section writing canvas.

#### Limit handling

Every narrative question carries a `limit_value` (integer) and `limit_type` (`words` or `characters`). The Step 4 counter displays:
- "120 / 800 characters" for character-limited questions
- "85 / 200 words" for word-limited questions

Limits come from the guidelines. Where limits are not stated, no counter is shown.

#### AI assistance — assist, not generate

The "Help me improve this" button is available on all `narrative` questions. It is disabled on `financial` questions. **It refines structure, flow, and clarity — it does not add, invent, or generate new information.** The charity's words and facts remain the foundation; AI only improves how they are expressed. This means the application continues to reflect the charity's authentic voice — which is what funders assess and value.

It cannot be used on `data_entry`, `dropdown`, `date`, or `file_upload` types.

#### Preparation checklist

On first entry to Step 4, the charity is shown a preparation checklist covering:
- Financial documents needed (annual accounts, management accounts, budget)
- Safeguarding policy
- Any other supporting documents flagged by the AI from the guidelines

This is shown once per application and requires explicit dismissal.

#### Senior review prompt

Before assembling, the charity is prompted to involve a senior colleague (CEO, treasurer, or trustee) to review financial figures and confirm the application accurately represents the organisation.

### 5.6 Step 5 — Review and Export

The charity reviews the assembled draft. The assembled content includes all `narrative` and `data_entry` answers. `dropdown`, `date`, and `file_upload` reminders are shown as a checklist separate from the draft.

**Export formats:**
- **Word document (.docx)** — formatted, labelled, with disclaimer and attribution
- **Plain text (.txt)** — for copying into portals
- **Per-question copy** — individual copy buttons per question for portal submission (Tier 2)

The charity approves the draft before export is enabled. After export, the application status changes to `exported`.

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

Exceeding a limit triggers a visible warning (counter turns red). It does not block the charity from saving or proceeding — over-limit is advisory, not a hard stop. This matches real funder portal behaviour.

---

## 7. Multi-Stage Applications

Funders with two-stage processes (Stage 1 Expression of Interest → Stage 2 Full Application) are handled as separate, independent applications in Grant Pathway. The charity creates one application per stage, naming them clearly (e.g. "Henry Smith Foundation — Stage 1 EOI").

There is no automated linkage between stages in v1. The charity manages the relationship between stages themselves.

---

## 8. Out of Scope

The following are explicitly out of scope for Grant Pathway v1 and should not be built, implied, or promised:

| Out of scope | Reason |
|-------------|--------|
| Direct portal submission | Each funder's portal requires separate authentication and integration; not feasible at scale |
| Funder discovery / grant-finding | Separate problem; well-served by existing tools (GrantFinder, GRANTIS) |
| Eligibility screening | Grant Pathway does not confirm whether a charity is eligible; the charity must read the guidelines |
| Supporting document storage | Accounts, safeguarding policies etc. are held by the charity; Grant Pathway only tracks whether they exist |
| Submission deadline tracking | Calendar/CRM functionality; out of scope |
| Reporting and monitoring | Post-award reporting to funders is a separate workflow |
| Multi-user / team collaboration | v1 is single-user per account; team features deferred |
| Funder portal login / session management | Grant Pathway does not handle funder authentication |
| Stage 1 → Stage 2 auto-population | Separate applications; manual linking only |

---

## 9. Success Metrics

### 9.1 Product metrics

| Metric | Target (12 months post-launch) |
|--------|-------------------------------|
| Registered charities | 500 |
| Applications started | 2,000 |
| Applications exported (completed) | 1,200 |
| Completion rate (exported / started) | ≥ 60% |
| AI requests used per exported application | ≤ 8 |
| Monthly active users | 300 |

### 9.2 Quality metrics

| Metric | Target |
|--------|--------|
| Step 3 parse error rate | < 1% of summary generations |
| Step 3 success rate (questions/sections extracted) | ≥ 90% of uploads |
| Refine-answer satisfaction (user accepts refined text) | ≥ 70% |
| Support tickets related to errors | < 5% of monthly active users |

### 9.3 Charity outcome metrics (surveyed)

- % of users who report the application was stronger than one they would have written unaided
- % of completed applications that resulted in a grant award (tracked voluntarily)
- Average time from application start to export

---

## 10. Key Business Decisions Log

The following decisions were made in the design session of 2026-05-29 and underpin this document. Each should be revisited explicitly if circumstances change.

| # | Decision | Rationale |
|---|----------|-----------|
| BD-01 | Grant Pathway is a preparation tool, not a submission platform | Funder portals are proprietary and cannot be integrated generically; submission responsibility stays with the charity |
| BD-02 | Charity profile is "thick" — stores full org data including financials and contact details | Pre-fill requires a complete profile; without it the product delivers less value per application |
| BD-03 | Non-narrative questions are pre-filled from profile where possible; shown as reminders otherwise | Data-entry questions are not a writing problem; AI should not be used on them |
| BD-04 | Question-level typing replaces funder-level type as the primary classification | Funder type (structured/narrative) determines output format only; question type determines how each field is handled |
| BD-05 | Both character limits and word limits are supported | The majority of UK funders use character limits; supporting word limits only was a false assumption |
| BD-06 | Multi-stage applications are separate records; no automated linkage in v1 | Simplicity preferred; charities can manage stage linkage themselves |
| BD-07 | Funders are actively marketed at the coverage tier they genuinely support | Honesty about partial coverage is better than implying uniform support; builds trust with users |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2026-05-29 | Rapidglobe Ltd / WJ Okhia | Initial draft — Mark Two BRD. Supersedes BRD-Grant-Pathway-v0.2.md. Based on testing session of May 2026 and seven business-level decisions agreed with WJ Okhia. |
| 0.2 | 2026-05-29 | Rapidglobe Ltd / WJ Okhia | Section 1.1 updated: AI assists, not generates — added as explicit product principle with reinforcement throughout. Section 1.4 substantially expanded: deep research (104 agents, 22 verified claims) identified 10 additional UK funders with published AI policies — Lloyds Bank Foundation, Paul Hamlyn Foundation, Arts Council England, BFI, Esmée Fairbairn, London Community Foundation, UKRI, RGS, Wellcome joint statement — all added with verbatim quotes and source URLs. Section 1.3 updated. Section 5.4 AI assistance paragraph strengthened. |
| 0.3 | 2026-05-29 | Rapidglobe Ltd / WJ Okhia | Section 2.1 bullet 4 reworded: pain point clarified as capacity and time, not lack of knowledge. Section 2.2 strengthened: senior staff involvement for financial sections stated as mandatory; treasurer/finance lead sign-off requirement made explicit. Section 3.2 Tier 1: Charity Commission pre-fill flow (register → profile → application) added. Section 4.2 Identity: Charity Commission as primary data source documented; OSCR/CCNI noted; source column added to table. Section 4.2 Financial: Charity Commission annual returns as starting-point source documented; 12–18 month data lag warning added; mandatory verification by treasurer/finance lead stated; source column added to table. |
| 0.4 | 2026-05-29 | Rapidglobe Ltd / WJ Okhia | Section 4.2 Identity and Section 3.2 Tier 1: UK register coverage policy clarified. v1 integrates England and Wales Charity Commission only — this is a technical sequencing decision, not a policy of exclusion. Scottish (OSCR) and Northern Irish (CCNI) charities are fully welcome to use Grant Pathway and can create a profile manually in v1. OSCR and CCNI lookup integration is planned with the strong intention to deliver before general release. Register coverage table updated with v1 and planned columns. Section 3.2 Tier 1 updated to reflect Scottish and NI manual-entry path in v1 with lookup planned. |
