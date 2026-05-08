# Business Requirements Document
# Grant Pathway — Version 1

---

## Document Control

| Field | Detail |
|-------|--------|
| **Document title** | Business Requirements Document — Grant Pathway v1 |
| **Version** | 0.1 Draft |
| **Status** | Draft — Section 14 (Compliance) partially outstanding pending items 44–46 |
| **Author** | Rapidglobe Ltd |
| **Date created** | 2026-04-13 |
| **Last updated** | 2026-05-07 |
| **Review date** | Prior to development start |

### Revision History

| Version | Date | Author | Summary of Changes |
|---------|------|--------|--------------------|
| 0.1 | 2026-04-13 | Rapidglobe Ltd | Initial draft |
| 0.2 | 2026-05-07 | Rapidglobe Ltd | AI delivery mechanism changed from Anthropic direct API (US) to Amazon Bedrock Claude Sonnet 4.6 (eu-west-2, In-Region). Data residency updated: UK primary, EU/EEA Geo fallback. Anthropic DPA/SCCs replaced by AWS Data Processing Addendum. Sections 2.2, 5, 11, 13, 14, 15, and Appendix C updated for consistency. |

### Related Documents

| Document | Location |
|----------|----------|
| Decision Records Index | `business/decisions/DECISIONS-INDEX.md` |
| Vision Statement | `business/vision-statement.md` |
| Out of Scope Statement | `business/v1-out-of-scope.md` |
| Constraints & Assumptions | `business/constraints-and-assumptions.md` |
| User Personas, Journeys & Use Cases | `business/user-personas-journeys-and-use-cases.md` |
| Non-Functional Requirements | `business/non-functional-requirements.md` |
| Technology Stack | `business/technology-stack.md` |
| App Name & Branding | `business/app-name-and-branding.md` |
| Future Phases | `business/future-phases.md` |
| BRD Information Gathering Checklist | `business/BRD-Information-Gathering.xlsx` |

---

## 1. Executive Summary

Grant Pathway is a free, AI-assisted grant writing tool built for UK charities. It is designed to reduce the time, effort, and expertise required to write a strong grant application — enabling volunteers and non-specialist staff to produce clearer, more consistent applications without professional fundraising support.

The service is offered entirely free of charge. It is built and initially operated by an individual developer, with the intention of transferring ownership to a Community Interest Company once the product is established and funded.

Version 1 delivers two core AI capabilities — guideline summarisation and draft answer generation — wrapped in a structured workflow that requires human review and approval before any AI-generated content can be used. The app does not submit applications on behalf of charities, does not guarantee funding outcomes, and does not search for or recommend grants.

Grant Pathway is targeted at small and mid-size UK charities where grant writing falls to volunteers or generalist staff with no dedicated fundraising resource. The primary beneficiaries are the charities and the communities they serve.

The target launch date is 31 July 2026.

---

## 2. Business Context & Problem Statement

### 2.1 The Problem

UK charities rely heavily on grant funding, yet the process of applying for grants places a disproportionate burden on small organisations. Unlike larger charities with dedicated fundraising teams, small and mid-size charities typically rely on volunteers or generalist staff to write applications — people with deep knowledge of their work but little or no training in grant writing.

The consequences are significant:

- Applications are written from scratch for every grant, even when large portions of content are the same
- Funder language — theory of change, additionality, outcomes frameworks — creates confusion and anxiety for non-specialists
- Each application consumes days of volunteer time that could be spent on frontline activity
- Application quality is inconsistent, reducing the likelihood of success
- Charities with excellent work and genuine need lose out to better-resourced organisations with professional fundraisers

There is no free, accessible tool that directly addresses the writing burden for this audience. Existing AI tools are generic and require technical confidence to use effectively. Professional grant writing services are unaffordable for small charities. The gap is real, material, and addressable.

### 2.2 The Opportunity

Advances in large language model (LLM) capability — specifically Anthropic Claude, accessed via Amazon Bedrock — now make it possible to build a structured, guided writing tool that:

- Summarises funder guidelines in plain English
- Generates tailored draft answers using the charity's own information
- Enforces human review before content is used
- Builds a reusable charity profile that saves time across multiple applications

Delivered free of charge, such a tool could meaningfully improve the capacity of thousands of small UK charities to compete for grant funding.

---

## 3. Vision & Objectives

### 3.1 Vision Statement

> **To be the trusted, free writing companion for UK charities — helping non-specialists produce stronger, more consistent grant applications through AI-powered drafting, guideline summarisation, and mandatory human review.**

### 3.2 Objectives for v1

| Ref | Objective | Measure |
|-----|-----------|---------|
| OBJ-01 | Launch a stable, accessible web application by 31 July 2026 | Live deployment by target date |
| OBJ-02 | Enable any UK charity to register and complete an application within a single session | Confirmed through user testing |
| OBJ-03 | Reduce the time a non-specialist spends writing a grant application | Evidenced through user feedback interviews |
| OBJ-04 | Achieve WCAG 2.2 Level AA accessibility from day one | Internal testing and checklist review pre-launch |
| OBJ-05 | Operate within a monthly running cost of £100 | Monthly cost monitoring |
| OBJ-06 | Gather sufficient early user feedback to inform v2 planning | Feedback interviews with opted-in users post-launch |

### 3.3 Definition of Success at Launch

Grant Pathway v1 will be considered successful if:
- The application is live, stable, and accessible
- At least one charity completes a full application through the tool in the first month
- Returning users are observed (indicating the tool is genuinely useful)
- No material data protection incidents occur
- Running costs remain within the £100/month budget

---

## 4. Scope

### 4.1 In Scope for v1

| # | Capability |
|---|-----------|
| 1 | User registration, login, and account management |
| 2 | Charity profile creation with Charity Commission API lookup |
| 3 | Grant application creation and management (create, save, edit, delete, export) |
| 4 | Funder guideline input (paste or file upload) |
| 5 | AI-powered plain-English summarisation of funder guidelines |
| 6 | AI-powered draft answer generation for application questions |
| 7 | Mandatory human review and approval step for all AI-generated content |
| 8 | Export of approved content to Word (.docx) and plain text (.txt) |
| 9 | Full account and data deletion by the user |
| 10 | WCAG 2.2 Level AA accessibility |
| 11 | UK-region data hosting |
| 12 | Basic passive usage metrics (registrations, applications created, returning users) |
| 13 | Opt-in feedback interview consent at registration |

### 4.2 Explicitly Out of Scope for v1

| # | Item | Notes |
|---|------|-------|
| 1 | Grant discovery | Deferred to future phase (DR-PS-002) |
| 2 | Grant eligibility matching | Depends on grant database; deferred (DR-AI-001) |
| 3 | Grant tracking and pipeline management | Out of scope (DR-PS-001) |
| 4 | Post-grant impact reporting | May be considered in future phase (DR-PS-001) |
| 5 | EU and international grants | UK only (DR-PS-003) |
| 6 | Live grant database | No 360Giving, GrantNav, or other integration (DR-IN-002) |
| 7 | CRM and accounting integrations | Manual entry only (DR-IN-001) |
| 8 | Open-ended AI chat | Structured, form-driven AI only (DR-AI-001) |
| 9 | Automated AI output validation | Human review is the sole validation mechanism |
| 10 | Native mobile application | Responsive web only (C16) |
| 11 | Multi-region data hosting | UK region only (C13) |
| 12 | Full document store | Guidelines are not permanently stored |
| 13 | Formal feedback and survey infrastructure | User interviews only (DR-SM-001) |
| 14 | CIC formation | Post-launch (DR-OD-001) |
| 15 | Liability insurance | Post-CIC (DR-LC-002) |
| 16 | Independent accessibility audit | Pre-scaling milestone (DR-LC-003) |

### 4.3 Future Phases Summary

| Phase | Description |
|-------|-------------|
| v2 — Grant Discovery | Help charities find relevant grants using 360Giving integration |
| Post-launch | CIC formation and operational funding |
| Post-launch | Structured satisfaction survey and feedback framework |
| Pre-scaling | Independent accessibility audit |
| Post-CIC | Liability insurance review |

---

## 5. Stakeholders

| Stakeholder | Role | Interest |
|-------------|------|----------|
| Individual developer (Rapidglobe Ltd) | Builder and operator | Delivers the app; absorbs running costs until CIC is established |
| UK charities (primary users) | End users | Reduce grant writing burden; improve application quality |
| Charity volunteers and non-specialist staff | Direct users of the app | Save time; reduce anxiety; produce better applications |
| Amazon Web Services (AWS) | AI and infrastructure provider | Bedrock Claude model access (eu-west-2); data residency and compliance |
| Charity Commission for England and Wales | Data source | Charity register API for verification at onboarding |
| Future CIC | Long-term owner and operator | Continuity and sustainability of the service |
| Successor organisation (informal) | Contingency owner | Named informally before launch as continuity fallback |
| Sector funders (e.g. Nominet, Catalyst) | Potential CIC funders | Evidence of impact to unlock operational funding |

---

## 6. User Personas

Two primary personas are defined for v1. Both reflect the primary user type established in decision record DR-TU-001 (volunteer or non-specialist) and the target charity size in DR-TU-002 (small and mid-size).

### 6.1 Persona 1 — Margaret, the Volunteer Grant Writer

> *"I spend a whole weekend writing one application and still don't know if I've answered it properly."*

| Field | Detail |
|-------|--------|
| Role | Volunteer, 1–2 days per week |
| Charity type | Small community wellbeing charity |
| Income band | Under £100k |
| Location | Market town, North of England |
| Age | 58 |
| Fundraising training | None |
| Technical environment | Personal Windows laptop; Google Chrome; no prior AI tool experience |

**Pain points:** Starts from scratch every time; confused by funder jargon; each application takes 2–3 days; low confidence in quality.

**Goals:** Submit more applications in less time; build reusable content; feel confident the output is funder-appropriate.

### 6.2 Persona 2 — David, the Overloaded Charity Manager

> *"I end up writing applications at the weekend because there's no one else to do it, and I always feel like I'm reinventing the wheel."*

| Field | Detail |
|-------|--------|
| Role | Charity Manager / Operations Manager |
| Charity type | Youth services and early intervention charity |
| Income band | £250k–£600k |
| Location | Urban, Midlands |
| Age | 44 |
| Fundraising training | Largely self-taught; one CPD course |
| Technical environment | Work Windows laptop; Chrome and Edge; has used ChatGPT |

**Pain points:** Adapts same content repeatedly for different funders; inconsistency across applications; no time to improve quality.

**Goals:** Reduce time per application; achieve consistent language; submit stronger applications.

### 6.3 Secondary Persona — Priya (Future Phase Reference)

Priya is a part-time administrator at a small disability charity (£180k income) who has been asked to take on grant writing with no prior experience. She represents users who are less experienced than Margaret. The app should not exclude her, but v1 is designed around Margaret and David.

---

## 7. User Journeys

### 7.1 Journey 1 — First-Time User (Margaret)

Margaret has found a local grant and is using the app for the first time.

| Step | Stage | Action | Outcome |
|------|-------|--------|---------|
| 1 | Discovery | Sees app link in CVS newsletter | Lands on the app |
| 2 | Registration | Enters name, email, password | Account created |
| 3 | Feedback opt-in | Opts in to a feedback interview | Consent recorded |
| 4 | Charity lookup | Enters registered charity number | Charity Commission data pre-filled |
| 5 | Profile completion | Adds mission, beneficiaries, activities | Profile saved |
| 6 | New application | Enters grant name and funder | Application record created |
| 7 | Guidelines input | Pastes funder guidelines text | Guidelines ready for processing |
| 8 | AI summarisation | Clicks Summarise | Plain-English summary of funder priorities and questions |
| 9 | Question drafting | Selects a question; clicks Generate Draft | Tailored draft answer produced |
| 10 | Review step | Reviews draft against three prompts | Content checked |
| 11 | Edit and approve | Edits one sentence; clicks Approve | Content marked as approved |
| 12 | Save progress | Saves and closes | Application preserved |
| 13 | Return | Logs in next day; continues | Resumes from dashboard |
| 14 | Export | Exports to Word | Clean document downloaded |

**Outcome:** Margaret submits a stronger application in approximately half her usual time.

### 7.2 Journey 2 — Returning User (David)

David has used the app before. His charity profile is already complete.

| Step | Stage | Action | Outcome |
|------|-------|--------|---------|
| 1 | Login | Logs in | Directed to dashboard |
| 2 | Dashboard | Views existing applications | Previous work visible |
| 3 | New application | Starts new application | Profile auto-populated — no re-entry needed |
| 4 | Guidelines upload | Uploads PDF | Guidelines ready |
| 5 | AI summarisation | Receives summary | Funder priorities identified |
| 6 | Batch drafting | Works through questions systematically | Drafts generated quickly |
| 7 | Consistency | Notes consistent mission language | Same phrasing as previous application |
| 8 | Save for later | Saves and closes | Progress preserved |
| 9 | Return and complete | Finishes remaining questions | All content approved |
| 10 | Export | Exports to Word | Pastes into funder portal |

**Outcome:** David completes an application in approximately 4 hours instead of a full weekend.

---

## 8. Use Cases

| Ref | Use Case | Actor | Summary |
|-----|----------|-------|---------|
| UC-01 | Register Account | New user | Create account with email verification |
| UC-02 | Opt In to Feedback Interviews | New user | Record consent to feedback contact at registration |
| UC-03 | Look Up Charity via Charity Commission API | Registered user | Pre-fill profile from Charity Commission register |
| UC-04 | Complete Charity Profile | Registered user | Enter full organisational profile |
| UC-05 | Start a New Grant Application | Registered user | Create a new application record |
| UC-06 | Input Funder Guidelines | Registered user | Paste or upload funder guidelines |
| UC-07 | Generate AI Summary of Funder Guidelines | Registered user | Receive plain-English funder summary |
| UC-08 | Generate Draft Answer for an Application Question | Registered user | Receive AI-drafted answer for a question |
| UC-09 | Review and Approve AI-Generated Content | Registered user | Mandatory review before content is saved |
| UC-10 | Edit Application Content | Registered user | Edit draft text directly before approving |
| UC-11 | Save Application Progress | Registered user | Save application state; resume later |
| UC-12 | Return to a Saved Application | Registered user | Resume a previously saved application |
| UC-13 | Export Application Content | Registered user | Download approved content as Word or plain text |
| UC-14 | Update Charity Profile | Registered user | Edit profile fields; updates apply to future applications |
| UC-15 | Delete Account and All Data | Registered user | Permanently delete account and all associated data |

Full use case detail (preconditions, main flows, alternative flows, postconditions) is documented in `business/user-personas-journeys-and-use-cases.md`.

---

## 9. Functional Requirements

Functional requirements are numbered FR-01 onwards and are derived from the use cases in Section 8.

### 9.1 Authentication & Accounts

| Ref | Requirement |
|-----|-------------|
| FR-01 | The system shall allow new users to register with their full name, email address, and a password |
| FR-02 | The system shall validate email format and enforce a minimum password length of 10 characters at registration |
| FR-03 | The system shall send a verification email upon registration; accounts shall not be activated until the email link is clicked |
| FR-04 | The system shall allow registered users to log in with their email address and password |
| FR-05 | The system shall provide a self-service password reset flow triggered by email |
| FR-06 | The system shall automatically log out users after 60 minutes of inactivity |
| FR-07 | The system shall provide optional multi-factor authentication (MFA) as an opt-in feature; MFA shall not be mandatory in v1 |
| FR-08 | During registration, the system shall present a plain-language prompt asking the user if they are willing to participate in a feedback interview; the response shall be recorded against the account |

### 9.2 Charity Profile

| Ref | Requirement |
|-----|-------------|
| FR-09 | Following account activation, the system shall prompt the user to enter their charity's registered number |
| FR-10 | The system shall query the Charity Commission for England and Wales public API and pre-fill the charity name, registered address, date of registration, and charitable objects |
| FR-11 | Where the Charity Commission API is unavailable or the charity is not found, the system shall allow the user to enter all charity details manually and shall display a plain-language explanation |
| FR-12 | The charity profile shall include the following fields: registered charity number, charity name, registered address, charitable objects, mission narrative, beneficiary description, main activities and programmes, geographic area of operation, and annual income band |
| FR-13 | The system shall allow users to update their charity profile at any time from their account settings |
| FR-14 | The charity profile shall be used as an input to all AI-generated content to personalise outputs to the charity's context |

### 9.3 Application Management

| Ref | Requirement |
|-----|-------------|
| FR-15 | The system shall allow a user to create a new grant application by entering the grant name, funder name, and an optional application deadline |
| FR-16 | The system shall display all saved applications on a user dashboard, showing the grant name, funder name, and the date last edited |
| FR-17 | The system shall allow a user to open and continue any saved application from their dashboard |
| FR-18 | The system shall auto-save application progress at regular intervals; manual save shall also be available |
| FR-19 | The system shall allow a user to delete a saved application |
| FR-20 | A single user account shall support multiple saved applications simultaneously |

### 9.4 Funder Guideline Handling

| Ref | Requirement |
|-----|-------------|
| FR-21 | The system shall allow users to input funder guidelines by either pasting text directly or uploading a file in PDF or Microsoft Word format |
| FR-22 | Funder guidelines shall be used for AI processing only and shall not be permanently stored after the application session |
| FR-23 | The system shall display a plain-language error message if an unsupported file format is uploaded, and shall prompt the user to paste the text instead |

### 9.5 AI Guideline Summarisation

| Ref | Requirement |
|-----|-------------|
| FR-24 | On user request, the system shall generate a plain-English summary of the funder's guidelines covering: funder priorities, types of projects funded, eligible organisations, evidence expectations, and a plain-language explanation of each application question |
| FR-25 | AI summarisation shall use both the funder guidelines and the charity profile as inputs to the Claude API |
| FR-26 | The system shall display a visible progress indicator while AI processing is underway |
| FR-27 | In the event of an API error or timeout, the system shall display a plain-language error message and allow the user to retry |

### 9.6 AI Draft Answer Generation

| Ref | Requirement |
|-----|-------------|
| FR-28 | On user request, the system shall generate a draft answer for a selected application question |
| FR-29 | Before generating a draft, the user shall be able to specify a word limit for the answer |
| FR-30 | AI draft generation shall use the application question, word limit (if specified), funder summary, and charity profile as inputs to the Claude API |
| FR-31 | If the generated draft significantly exceeds the specified word limit, the system shall flag this prominently to the user |

### 9.7 Mandatory Review & Approval

| Ref | Requirement |
|-----|-------------|
| FR-32 | Every AI-generated draft answer shall be presented alongside three plain-language review prompts: (1) Does this accurately describe your charity and project? (2) Are all figures, dates, and facts correct? (3) Does this answer the question that was asked? |
| FR-33 | The system shall require explicit user approval before AI-generated content is saved to the application; this step cannot be bypassed |
| FR-34 | The user shall be able to edit the draft text directly within the review interface before approving |
| FR-35 | The user shall be able to discard a generated draft and either regenerate a new draft or write their own answer |
| FR-36 | Approved content shall be visually marked as approved and saved to the application record |

### 9.8 Export

| Ref | Requirement |
|-----|-------------|
| FR-37 | The system shall allow users to export all approved application content as a Microsoft Word (.docx) file |
| FR-38 | The system shall allow users to export all approved application content as a plain text (.txt) file |
| FR-39 | The system shall prevent export where no content has been approved, and shall display a prompt directing the user to complete at least one review step |

### 9.9 Account Deletion

| Ref | Requirement |
|-----|-------------|
| FR-40 | The system shall allow users to permanently delete their account from Account Settings |
| FR-41 | Before deletion, the system shall display a plain-language warning explaining that all data will be permanently and irreversibly deleted |
| FR-42 | The user shall be required to confirm deletion by re-entering their email address |
| FR-43 | On confirmation, the system shall permanently delete: the user account, charity profile, all saved applications, and all AI-generated content associated with that account |
| FR-44 | The system shall send a confirmation email to the user once deletion is complete |

---

## 10. Non-Functional Requirements

### 10.1 Performance

| Metric | Target |
|--------|--------|
| Page loads and navigation | Under 3 seconds |
| AI guideline summarisation | Under 30 seconds |
| AI draft answer generation | Under 60 seconds |

### 10.2 Availability

| Metric | Target |
|--------|--------|
| Uptime | 99.5% |
| Maximum annual downtime | ~44 hours |

### 10.3 Scalability

| Phase | Expected Concurrent Users |
|-------|--------------------------|
| At launch | ~10 |
| At scale (12–18 months) | ~100 |

### 10.4 Security

| Control | Requirement |
|---------|-------------|
| Encryption in transit | TLS 1.2 or higher; HTTPS enforced across all pages and API calls |
| Encryption at rest | Database-level encryption enabled on all data stores |
| Passwords | Minimum 10 characters; no mandatory complexity rules (NCSC guidance) |
| MFA | Available as opt-in; not mandatory in v1 |
| Session timeout | Automatic logout after 60 minutes of inactivity |
| Security baseline | OWASP Top 10 |
| Secrets management | No credentials or API keys committed to the public repository |

### 10.5 Browser & Device Support

| Category | Supported |
|----------|-----------|
| Desktop browsers | Chrome, Edge, Firefox, Safari (latest 2 versions each) |
| Mobile browsers | Chrome on Android; Safari on iOS |
| Minimum screen width | 320px — fully responsive |
| Internet Explorer | Not supported |

### 10.6 Accessibility

- The application shall meet **WCAG 2.2 Level AA** from day one
- Accessibility is a design-in requirement, not a post-build retrofit
- Testing approach: automated scanning (axe DevTools / Lighthouse), keyboard-only navigation testing, screen reader testing (NVDA + Chrome), manual WCAG 2.2 AA checklist review pre-launch
- An independent third-party accessibility audit is deferred to a pre-scaling milestone

---

## 11. Technology Stack

| Concern | Technology |
|---------|-----------|
| Language | TypeScript |
| Framework | Next.js |
| Database | PostgreSQL via Supabase (London region) |
| Authentication | Supabase Auth |
| File storage | Supabase Storage (London region) |
| Application hosting | Vercel |
| AI API | Anthropic Claude Sonnet 4.6 via Amazon Bedrock (eu-west-2) |
| Charity register | Charity Commission for England and Wales public API |
| Source control | GitHub (public repository — MIT licence) |
| Development environment | VS Code |
| Domain | Grantpathway.org.uk |

**Hosting and data residency:** All charity data is stored exclusively in Supabase (London region), satisfying the UK-region data storage requirement (C13). The application layer is hosted on Vercel's global edge network; no persistent data is held at the application layer. AI processing uses Amazon Bedrock Claude Sonnet 4.6 in eu-west-2 (London) In-Region; in the event of a capacity or availability issue, Bedrock Geo EU routing may process data within up to 7 AWS regions, all within the EEA and covered by UK adequacy decisions. This arrangement will be disclosed in the Privacy Policy.

**Fallback:** If the UK data residency interpretation requires the compute layer to also be UK-hosted, AWS eu-west-2 (London) is the alternative for the Next.js application hosting.

---

## 12. Branding

| Element | Decision |
|---------|----------|
| **Official product name** | Grant Pathway |
| **Working title (retired)** | AI Grant Accelerator |
| **Domain** | Grantpathway.org.uk |

### Colour Palette

| Role | Colour | Hex |
|------|--------|-----|
| Primary | Deep teal | `#0D6E6E` |
| Primary light | Soft teal | `#E6F4F4` |
| Accent | Warm amber | `#D97706` |
| Success | Muted green | `#16A34A` |
| Neutral dark | Slate | `#1E293B` |
| Neutral light | Off-white | `#F8FAFC` |
| White | White | `#FFFFFF` |

### Typography

| Role | Font | Weight | Minimum Size |
|------|------|--------|-------------|
| Headings | Inter | Bold (700) | 20px |
| Sub-headings | Inter | Semi-bold (600) | 16px |
| Body text | Inter | Regular (400) | 16px |
| Labels & captions | Inter | Medium (500) | 14px |

### Tone of Voice

| Principle | In Practice |
|-----------|-------------|
| Plain English | "Here's a draft answer" not "AI-generated output" |
| Encouraging | Acknowledge the user is doing something valuable |
| Honest | Clear that this is a starting point requiring review |
| Respectful | Non-patronising; charities know their work |
| Concise | Short sentences; active voice; no padding |

---

## 13. Constraints & Assumptions

### 13.1 Constraints

| Ref | Constraint | Description | Implication for v1 |
|-----|-----------|-------------|-------------------|
| C1 | Monthly running cost budget | Maximum £100/month personally absorbed before CIC is established | Feature scope or usage limits must be reviewed if costs approach this threshold |
| C2 | Target launch date | 31 July 2026 | BRD completed May 2026; two weeks reserved pre-launch for compliance checks |
| C3 | UK-only coverage | Limited to UK charities and UK grant applications | Content and terminology must reflect the UK grant landscape only |
| C4 | Single developer | Built and maintained by one developer | Feature scope and timeline must remain realistic for a solo build |
| C5 | Free access model | Free of charge to all eligible UK charities; no subscriptions or freemium tiers | No payment infrastructure required in v1 |
| C6 | Writing-only focus | Grant writing tool only; discovery deferred | Charities must already know which grant they are applying for |
| C7 | No live grant data | No integration with external grant databases | No 360Giving, GrantNav, or Funding Central dependency |
| C8 | Limited integrations | Charity Commission register only; no CRM or finance system links | All charity information beyond basic registration data is entered manually |
| C9 | AI capability limits | AI limited to text generation and document summarisation only | No eligibility matching, open-ended chat, or automated validation |
| C10 | Mandatory human review | All AI-generated content must be reviewed and approved before use | The review step is enforced and cannot be bypassed |
| C11 | No liability for AI content | Service acts as a writing aid only | Terms of Service must state the app does not guarantee funding, does not submit applications, and makes no representations to funders |
| C12 | No AI training use | Charity data will never be used to train any AI model | Covered by the Amazon Bedrock service terms (no training on customer data); must be stated in the Privacy Policy |
| C13 | UK-region data hosting | All app data stored in UK-region infrastructure; AI processing in UK/EEA via Amazon Bedrock | Primary AI processing in eu-west-2 (London); EU/EEA Geo fallback covered by UK adequacy decisions — no data leaves UK/EEA |
| C14 | Regulatory compliance | Must comply with UK GDPR, DPA 2018, and Charity Commission guidance | Compliance in place before launch |
| C15 | Accessibility standard | WCAG 2.2 Level AA from day one | Independent audit deferred to pre-scaling |
| C16 | Web application only | No native mobile app | Must be responsive and usable on mobile browsers |
| C17 | MIT open source licence | Codebase released under MIT licence | No secrets committed to the repository |
| C18 | Open, documented codebase | Publicly hosted and documented for handover continuity | Named potential successor organisation identified informally before launch |
| C19 | Defined sunset process | Minimum three months' notice, full data export, clean decommission if service must end | Last-resort fallback; primary plan is handover |
| C20 | Minimal metrics infrastructure | Basic passive usage metrics only via database counts | No analytics platform or survey tooling required |

### 13.2 Assumptions

| Ref | Assumption | Impact if Wrong |
|-----|-----------|----------------|
| A1 | Charity Commission API is freely available and stable | Alternative verification methods needed |
| A2 | Anthropic Claude via Amazon Bedrock remains capable and available | Provider or usage model may need to change |
| A3 | Amazon Bedrock Claude pricing remains stable within £100/month budget | Cost controls or usage limits may be needed |
| A4 | Amazon Bedrock (eu-west-2 In-Region, EU Geo fallback) satisfies UK GDPR data residency requirements | Alternative AI provider or hosting configuration may be required |
| A5 | Application content is organisational data, not personal data | Additional GDPR controls required if beneficiary personal data is included |
| A6 | Target users have basic digital skills (email, web forms, copy-paste) | Core UX flows would need significant redesign |
| A7 | Charities have already identified the grant before using the app | Core product scope would need to change |
| A8 | Funder guidelines are accessible in a pasteable or uploadable format | Document handling would need to be redesigned |
| A9 | Charities already hold the organisational, project, and budget information needed | Onboarding flow and AI quality would be significantly affected |
| A10 | All information is entered manually by the charity | Integration scope would need to expand |
| A11 | Users will genuinely engage with the mandatory review step | Review UX and liability position may need revisiting |
| A12 | Charities place high value on data ownership and no-AI-training commitments | Adoption may be significantly lower without prominent data ownership assurances |
| A13 | Early usage volumes stay within the £100/month constraint | Cost controls or usage limits would need to be introduced |
| A14 | The charity sector will adopt a free tool with minimal onboarding friction | A more formal onboarding or endorsement route may be needed |
| A15 | Basic metrics (registrations, applications, returning users) are sufficient initially | Analytics infrastructure may need to be brought forward |
| A16 | Advanced metrics are appropriate for a later phase | A formal impact reporting requirement could accelerate this |
| A17 | WCAG 2.2 AA is achievable in the chosen stack without specialist tooling | Stack selection may need to be revisited |
| A18 | Charity Commission register is sufficient for basic charity verification | Additional verification methods may be needed |
| A19 | CIC formation is achievable within a reasonable timeframe post-launch | Long-term ownership plan would need revisiting |
| A20 | CIC operational funding will be available from sector funders once evidenced | A cost recovery or sustainability model would be needed |
| A21 | Sufficient opted-in users will be available for feedback interviews | Alternative feedback mechanisms would need to be introduced sooner |

---

## 14. Compliance & Legal

### 14.1 Data Protection & UK GDPR

Grant Pathway must comply with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018. Key obligations include:

| Obligation | How it is met in v1 |
|-----------|---------------------|
| Lawful basis for processing | Legitimate interests and/or contract performance (to be confirmed in Privacy Policy) |
| Data minimisation | Only data necessary for the service is collected |
| Storage limitation | Data is retained only as long as the account is active; full deletion on account closure |
| Right to erasure | Full account and data deletion available at any time (FR-40 to FR-44) |
| Data subject rights | Accessible via account settings and contact |
| International transfers | AI processing via Amazon Bedrock occurs in UK/EEA (eu-west-2 primary, EU Geo fallback); no transfer outside UK/EEA occurs; no SCCs required — see 14.2 |
| Privacy Policy | Must be published before launch; must cover data storage, hosting arrangement, and no-AI-training commitment |

### 14.2 AI Data Processing — Amazon Bedrock *(Item 44 — Updated)*

Grant Pathway uses Anthropic Claude Sonnet 4.6 accessed via Amazon Bedrock (eu-west-2, In-Region). This means AI processing occurs within the UK (AWS London region) as the primary configuration. In the event of a capacity or availability issue, Amazon Bedrock Geo EU routing may process data within up to 7 AWS regions, all of which are within the EEA and covered by UK adequacy decisions. Data is never transferred to Anthropic's servers directly and does not leave the UK/EEA. No Standard Contractual Clauses (SCCs) are required.

The AWS Customer Agreement and AWS Data Processing Addendum (DPA) govern the Bedrock arrangement and satisfy UK GDPR obligations. Amazon Bedrock's service terms confirm that customer data is not used to train foundation models.

**Pre-launch action:** Confirm that the applicable AWS Data Processing Addendum covers the Amazon Bedrock use case and satisfies UK GDPR obligations before 31 July 2026.

**Status:** Architecture confirmed (DR-AI-002, DR-DP-002 — revised 2026-05-07). AWS DPA review to be completed prior to launch.

### 14.3 Terms of Service *(Item 45 — To Be Drafted)*

A Terms of Service document must be published before launch. At minimum it must include the following statements, as established in DR-LC-002:

1. Grant Pathway does not guarantee or promise funding outcomes
2. Grant Pathway does not submit applications on behalf of charities
3. Grant Pathway makes no representations to funders on behalf of any charity

**Status:** To be drafted. Terms of Service to be published before 31 July 2026.

### 14.4 Privacy Policy *(Item 46 — To Be Drafted)*

A Privacy Policy must be published before launch covering:

- What data is collected and why
- Where data is stored (Supabase, London region)
- That application layer processing uses a global delivery network (Vercel)
- That AI processing uses Anthropic Claude Sonnet 4.6 via Amazon Bedrock (eu-west-2, London) as the primary configuration, with EU/EEA Geo fallback; data does not leave the UK/EEA
- That charity data will **never** be used to train, fine-tune, or improve any AI model — by the app operator or any third party including Anthropic
- How users can access, correct, and delete their data
- Retention periods

**Status:** To be drafted. Privacy Policy to be published before 31 July 2026.

### 14.5 Accessibility Compliance

The application must meet WCAG 2.2 Level AA before launch. The testing approach is defined in Section 10.6. An independent audit is deferred to a pre-scaling milestone (DR-LC-003).

---

## 15. Risks

| Ref | Risk | Likelihood | Impact | Mitigation |
|-----|------|-----------|--------|-----------|
| R-01 | Monthly running costs exceed £100 | Medium | High | Monitor API usage from day one; implement usage monitoring; introduce rate limits if needed (C1, A13) |
| R-02 | Charity Commission API is unavailable or deprecated | Low | Medium | Manual entry fallback built into the onboarding flow (FR-11, A1) |
| R-03 | Amazon Bedrock Claude pricing increases significantly | Low | High | Monitor pricing; evaluate alternative providers or models if needed (A3, DR-AI-002) |
| R-04 | AWS Bedrock arrangement does not satisfy UK GDPR requirements | Very Low | High | Review AWS DPA before launch; Bedrock eu-west-2 In-Region eliminates international transfer risk; EU Geo fallback covered by UK adequacy decisions (A4, DR-DP-002) |
| R-05 | Users treat mandatory review as a click-through | Medium | Medium | Review UX designed to prompt genuine engagement; three specific prompts required (FR-32, A11) |
| R-06 | Low adoption at launch | Medium | Medium | Free and frictionless; promoted via CVS newsletters and sector networks; no procurement barrier for small charities (A14) |
| R-07 | Solo developer unavailability | Low | High | Open, documented codebase; named successor organisation identified informally before launch (C4, C18, DR-BM-002) |
| R-08 | CIC formation delayed or not achieved | Medium | Medium | Sunset process defined with minimum three months' notice and full data export (C19, DR-BM-002) |
| R-09 | Security vulnerability in open source codebase | Low | High | OWASP Top 10 baseline; no secrets committed to repository; monitored proactively (C17, NFR-04) |
| R-10 | AI-generated content causes reputational harm | Low | Medium | Mandatory human review enforced; Terms of Service clearly limits liability; app described as writing aid only (C10, C11) |

---

## 16. Future Phases & Roadmap

| Phase | Item | Trigger |
|-------|------|---------|
| Post-launch | Grant discovery (v2) | Stable user base established; 360Giving integration evaluated (DR-PS-002, DR-IN-002) |
| Post-launch | CIC formation | After v1 launch and initial evidencing of impact (DR-OD-001) |
| Post-launch | Satisfaction survey and feedback framework | Once meaningful user base exists (DR-SM-001, DR-SM-002) |
| Post-launch | Operational funding bid | Once CIC established and usage data available (DR-OD-002) |
| Pre-scaling | Independent accessibility audit | Before the app scales significantly beyond early user base (DR-LC-003) |
| Post-CIC | Liability insurance review | When CIC is established (DR-LC-002) |

Full detail on each deferred item is recorded in `business/future-phases.md`.

---

## 17. Appendices

### Appendix A — Decision Records

All 28 business decision records are held in `business/decisions/`. The index is at `business/decisions/DECISIONS-INDEX.md`. Decisions cover: product scope, target users, ownership and distribution, AI capabilities, data protection, integrations, grant knowledge, success metrics, legal and compliance, build and maintenance.

### Appendix B — BRD Information Gathering Checklist

The full checklist of 53 information items gathered prior to writing this BRD is held in `business/BRD-Information-Gathering.xlsx`.

### Appendix C — Glossary

| Term | Definition |
|------|-----------|
| AWS DPA | AWS Data Processing Addendum — the contractual document governing how Amazon Web Services (including Bedrock) processes customer data, and satisfying UK GDPR obligations |
| Charity Commission API | The public API provided by the Charity Commission for England and Wales, used to look up registered charity details |
| CIC | Community Interest Company — the intended long-term legal structure for owning and operating Grant Pathway |
| CVS | Council for Voluntary Service — local infrastructure bodies that support charities and voluntary organisations |
| GDPR | General Data Protection Regulation; in this context, the UK GDPR as retained in UK law following the EU exit |
| LLM | Large Language Model — the type of AI model underpinning the Anthropic Claude API |
| NCSC | National Cyber Security Centre — source of UK password guidance referenced in NFR-04 |
| OSCR | Office of the Scottish Charity Regulator — the charity register for Scotland, not covered by the Charity Commission API |
| OWASP Top 10 | Open Worldwide Application Security Project's list of the ten most critical web application security risks |
| SCCs | Standard Contractual Clauses — contractual mechanisms used to legitimise international data transfers under UK GDPR |
| WCAG 2.2 AA | Web Content Accessibility Guidelines version 2.2, Level AA — the accessibility standard the app must meet |
| 360Giving | A charity that promotes open grant data; its GrantNav tool is the intended data source for the future grant discovery phase |

---

*Document status: Version 0.2 Draft*
*Section 14 (Compliance) is partially outstanding pending AWS DPA review (item 44), Terms of Service drafting (item 45), and Privacy Policy drafting (item 46).*
*Last updated: 2026-05-07*
