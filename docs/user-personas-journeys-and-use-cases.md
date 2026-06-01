# User Personas, Journeys & Use Cases — AI Grant Accelerator v1
**Version:** 1.3
**Last updated:** 2026-06-01

---

## Part 1 — User Personas

Two personas are defined for v1. Both reflect the primary user type established in DR-TU-001 (volunteer/non-specialist) and the target charity size in DR-TU-002 (small and mid-size). A third persona is noted as a secondary user type relevant to future phases.

---

### Persona 1 — Margaret, the Volunteer Grant Writer

> *"I spend a whole weekend writing one application and still don't know if I've answered it properly."*

| Field | Detail |
|-------|--------|
| **Role** | Volunteer, 1–2 days per week |
| **Charity type** | Small community wellbeing charity |
| **Income band** | Under £100k |
| **Location** | Market town, North of England |
| **Age** | 58 |
| **Formal fundraising training** | None |

**Day-to-day responsibilities**
Margaret volunteers two days a week. Her time is split between coordinating other volunteers, running a weekly social group for isolated older adults, managing the charity's social media, and writing grant applications. Grant writing is one of many tasks — she has no dedicated time for it and no one to ask for help.

**Current grant application workflow**
1. Finds a grant (usually via a local CVS newsletter or word of mouth)
2. Downloads the application guidelines PDF — often 10–20 pages long
3. Reads through the guidelines, taking handwritten notes
4. Opens a blank Word document and starts writing from scratch
5. Refers back to old applications to copy sections about the charity
6. Struggles with sections asking for outcomes, theory of change, or evaluation methodology
7. Asks the charity's chair to review — who is also not a specialist
8. Submits and waits, often hearing nothing for months

**Pain points**
- Starts from scratch every time, even though the core information about the charity rarely changes
- Finds funder language confusing — terms like "theory of change", "outcomes framework", and "additionality" are intimidating
- Unsure whether her answers are actually addressing what the funder is asking
- Each application takes 2–3 full days, which she can rarely afford
- Low confidence in the quality of her writing despite significant effort

**Goals and motivations**
- Wants to submit more applications without spending more time
- Wants to feel confident the content is clear and funder-appropriate
- Motivated by the charity's impact on isolated older adults — frustrated that funding is a barrier
- Would like to build up a bank of reusable content over time

**Technical environment**
- Personal Windows laptop, 5–6 years old
- Google Chrome browser
- Good home broadband connection
- Comfortable with email, Google search, Facebook, and Word
- Has not used AI tools before; would be nervous but willing if the interface is simple

---

### Persona 2 — David, the Overloaded Charity Manager

> *"I end up writing applications at the weekend because there's no one else to do it, and I always feel like I'm reinventing the wheel."*

| Field | Detail |
|-------|--------|
| **Role** | Charity Manager / Operations Manager |
| **Charity type** | Youth services and early intervention charity |
| **Income band** | £250k–£600k |
| **Location** | Urban, Midlands |
| **Age** | 44 |
| **Formal fundraising training** | Attended one CPD course; largely self-taught |

**Day-to-day responsibilities**
David manages a team of eight, oversees programme delivery, handles HR, produces board reports, and manages funder relationships. Grant writing falls to him because the charity cannot afford a dedicated fundraiser. He writes 8–12 applications per year, mostly evenings and weekends.

**Current grant application workflow**
1. Identifies a grant from 360Giving searches, sector newsletters, or funder websites
2. Opens the online application portal or downloads a form
3. Reads requirements — often finds they overlap significantly with previous applications
4. Copies sections from previous successful applications in Word
5. Adapts and rewrites for the new funder's specific requirements and word limits
6. Asks a trustee to proofread
7. Submits; sometimes follows up but rarely has time

**Pain points**
- Spends significant time adapting the same content for different funders' formats
- Inconsistency between applications — different versions of the charity's mission statement creep in over time
- No capacity to improve the quality of writing; just gets things submitted on time
- Application portal interfaces are often clunky and time-consuming
- Feels like he could win more grants if applications were stronger but lacks the time to polish them

**Goals and motivations**
- Wants to reduce time per application without reducing quality
- Wants consistent, professional language across all submissions
- Motivated by the charity's outcomes for young people; frustrated by administrative overhead
- Would value a tool that learns the charity's story and adapts it efficiently for different funders

**Technical environment**
- Work-issued Windows laptop
- Chrome and Edge browsers
- Reliable office broadband; occasionally works from home on good Wi-Fi
- Proficient with Microsoft Office, uses a basic charity CRM (Salesforce Essentials)
- Has experimented with ChatGPT for drafting emails; comfortable with the concept of AI writing assistance

---

### Secondary Persona (Future Phase Reference) — Priya, the Part-Time Administrator

> *"I've been asked to take on grant writing but I've never done it before and I don't know where to start."*

Priya works 20 hours per week as an administrator at a small disability charity (income £180k). She has been asked to take on grant writing following a staff restructure. She has no prior experience and significant anxiety about the task. She represents users who are even less experienced than Margaret and will be an important persona for future UX research. Not a primary design target for v1 but the app should not exclude her.

---

## Part 2 — User Journeys

Two end-to-end journeys are mapped: one for a first-time user (Margaret) and one for a returning user (David).

---

### Journey 1 — First-Time User: Margaret Completes Her First Application

**Scenario:** Margaret has found a local grant from a community foundation. She has never used the app before.

| Step | Stage | Action | Thought / Feeling | Pain Point Addressed |
|------|-------|--------|-------------------|---------------------|
| 1 | Discovery | Sees a link to the app in the local CVS monthly newsletter | *"Free tool for charities? Sounds too good to be true."* | — |
| 2 | Registration | Opens the app, clicks Register, enters her name, email, and creates a password | *"This is straightforward — just like signing up for anything online."* | Low friction onboarding |
| 3 | Feedback opt-in | Sees a simple checkbox: *"Would you be willing to have a short call to help us improve this tool?"* — ticks yes | *"Happy to help if it doesn't take long."* | Enables user interview feedback (DR-SM-002) |
| 4 | Charity lookup | Prompted to enter her charity's registered number; app looks it up via Charity Commission API and pre-fills name, registered address, and charitable objects | *"Oh — it already knows about us! That's reassuring."* | Reduces data entry; builds trust |
| 5 | Profile completion | Completes the charity profile — adds mission narrative, beneficiaries, main activities, and typical project budget range | *"This is just describing what we do — I can do this."* | Foundation for personalised AI outputs |
| 6 | New application | Clicks "Start New Application", selects their funder from the searchable approved directory and enters the grant name | *"Oh — I can search for them. Good job they're listed."* | Prevents untested funder combinations; curated list builds trust |
| 7 | Guidelines input | Prompted to paste or upload the funder's guidelines; pastes the text from the PDF she downloaded | *"Good — I was going to read this anyway."* | Structured approach to reading guidelines |
| 8 | AI summarisation | App generates a plain-English summary of the funder's priorities, what they fund, and what each question is asking | *"That's exactly what I needed — I never understood what 'additionality' meant until now."* | Demystifies funder language for non-specialists |
| 9 | Question drafting | Writes her answers section by section (narrative funders) or responds to each numbered question in turn (structured funders); AI can help improve a written answer on request | *"I just write what I know about us — and I can ask the AI to help tidy it up if I need to."* | Reduces blank-page anxiety; keeps charity in control of content |
| 10 | Review step | Prompted to review her written content with three specific questions: Is it accurate? Are the figures correct? Does it answer what was asked? | *"I hadn't noticed the word count was over — good job it flagged that."* | Mandatory human review (DR-AI-003) |
| 11 | Edit and approve | Edits one sentence and approves the content | *"I feel confident this is ready."* | User remains in control |
| 12 | Saves progress | Clicks Save; told the application is saved to her account | *"Great — I can come back to this tomorrow."* | Persistent application history (DR-DP-001) |
| 13 | Returns next day | Logs back in, finds application where she left it, continues with remaining questions | *"This is so much easier than opening a dozen Word documents."* | Time-saving across sessions |
| 14 | Export | Completes all questions; clicks Export; downloads a clean Word document with all approved answers | *"I can copy this straight into the application form."* | Removes final formatting burden |

**Outcome:** Margaret submits a stronger, more consistent application in approximately half the time she would previously have spent.

---

### Journey 2 — Returning User: David Starts a New Application with an Existing Profile

**Scenario:** David has used the app before. His charity profile is already complete. He has a new application to write for a different funder.

| Step | Stage | Action | Thought / Feeling | Pain Point Addressed |
|------|-------|--------|-------------------|---------------------|
| 1 | Login | Opens the app, logs in with email and password | *"Quick and familiar."* | — |
| 2 | Dashboard | Sees his existing applications and a "Start New Application" button | *"Good — I can see my previous work is still here."* | Application history visible |
| 3 | New application | Clicks Start New Application; selects funder from the searchable approved directory; profile is already populated — no re-entry needed | *"This saves me 30 minutes straight away."* | Reuse of existing charity profile |
| 4 | Guidelines upload | Uploads the funder's PDF guidelines directly | *"Better than copy-paste — the whole document is in."* | Document handling |
| 5 | AI summarisation | Receives a summary tailored to his charity type; notices it has correctly identified the funder's focus on early intervention | *"It's picked up the most relevant parts for us."* | Relevant, charity-aware summaries |
| 6 | Answering questions | Works through each question systematically; writes his answers section by section (narrative funders) or responds to each numbered question in turn (structured funders); uses AI on request to help improve a written answer | *"I'd normally spend a whole evening on this — I've done three questions in 20 minutes."* | Significant time saving |
| 7 | Consistency check | Notices the AI has used the same mission statement phrasing as his previous application | *"Good — that's the version I want to use."* | Consistency across applications |
| 8 | Saves for later | Runs out of time; saves progress and closes the app | *"I'll finish this on Thursday."* | Persistent drafts |
| 9 | Returns and completes | Returns two days later; completes remaining questions; reviews and approves all content | *"Much less painful than usual."* | — |
| 10 | Export | Exports to Word; pastes into the funder's online portal | *"Done. That took me four hours total instead of a weekend."* | Time saving clearly felt |

**Outcome:** David completes an application in approximately 4 hours instead of a full weekend, with more consistent language and better-structured answers.

---

## Part 3 — Use Cases

Use cases define the specific interactions between users and the system. Each use case maps to one or more functional requirements.

---

### UC-01 — Register Account

| Field | Detail |
|-------|--------|
| **Actor** | New user (any) |
| **Precondition** | User has not previously registered |
| **Trigger** | User visits the app for the first time and clicks Register |

**Main Flow**
1. User enters full name, email address, and password
2. System validates email format and password strength
3. System sends a verification email
4. User clicks the verification link
5. Account is activated; user is directed to charity profile setup (UC-03)

**Alternative Flows**
- Email already registered → system prompts user to log in or reset password
- Verification link not clicked within 24 hours → system prompts user to resend

**Postcondition:** User has an active account and is prompted to complete their charity profile.

---

### UC-02 — Opt In to Feedback Interviews

| Field | Detail |
|-------|--------|
| **Actor** | New user |
| **Precondition** | User is completing registration |
| **Trigger** | Presented as part of the registration flow |

**Main Flow**
1. User sees a plain-language prompt: *"Would you be willing to have a short call (20–30 minutes) to help us improve this tool?"*
2. User selects Yes or No
3. Selection is recorded against the account
4. If Yes, user's email is flagged for outreach

**Postcondition:** Consent to feedback contact recorded; used for user interview scheduling.

---

### UC-03 — Look Up Charity via Charity Commission API

| Field | Detail |
|-------|--------|
| **Actor** | Registered user |
| **Precondition** | User has a registered account and is setting up their charity profile |
| **Trigger** | User enters their charity's registered number |

**Main Flow**
1. User enters their charity's registered number
2. System queries the Charity Commission for England and Wales public API
3. System pre-fills: charity name, registered address, date of registration, and charitable objects
4. User reviews pre-filled information and confirms or corrects it

**Alternative Flows**
- Charity not found (e.g. Scottish charity registered with OSCR) → user enters details manually; OSCR lookup to be added in future
- API unavailable → user enters all details manually; system displays a plain-language message

**Postcondition:** Basic charity registration data is pre-populated in the profile.

---

### UC-04 — Complete Charity Profile

| Field | Detail |
|-------|--------|
| **Actor** | Registered user |
| **Precondition** | Account created; Charity Commission lookup completed or skipped |
| **Trigger** | User is guided through profile setup after registration |

**Main Flow**
1. User completes or reviews pre-filled identity fields (charity name, registration number, year established, organisation type — from Charity Commission lookup where available)
2. User confirms or enters address and main contact details
3. User adds mission narrative fields: what the charity does, who it helps, where it works, aims and objectives
4. User enters or verifies financial fields from latest signed accounts (income, expenditure, employee count, volunteer count)
5. User confirms supporting document status (safeguarding policy, annual accounts, governing document)
6. Profile is saved

**Note:** This is the thick charity profile introduced in Mark Two (BD-02). Financial fields default from Charity Commission annual return data where available but must be reviewed and confirmed by the charity (ideally the treasurer or finance lead) before use in an application. OSCR (Scotland) and CCNI (Northern Ireland) register lookup is planned before general release; Scottish and NI charities enter details manually in v1.

**Alternative Flows**
- User skips optional fields → profile saved with partial data; AI outputs may be less personalised; user is prompted to complete missing fields before generating content

**Postcondition:** Charity profile is stored and available to personalise AI outputs across all future applications.

---

### UC-05 — Start a New Grant Application

| Field | Detail |
|-------|--------|
| **Actor** | Registered user with a completed charity profile |
| **Precondition** | User is logged in; charity profile exists |
| **Trigger** | User clicks "Start New Application" |

**Main Flow**
1. User selects the funder from a searchable curated directory (picker populated from the approved `funders` table)
2. User enters the name of the grant
3. If the user's funder is not listed, a "My funder isn't listed — request it" link is available below the picker
4. System creates a new application record linked to the charity profile and the selected funder
5. User is directed to input funder guidelines (UC-06)

**Alternative Flows**
- Funder not in directory → user clicks the request link; submits funder name via a simple form; is informed Rapidglobe will review and add it; cannot proceed with an unlisted funder

**Postcondition:** A new application record is created and saved to the user's account, linked to an approved funder from the directory.

---

### UC-06 — Input Funder Guidelines

| Field | Detail |
|-------|--------|
| **Actor** | Registered user |
| **Precondition** | New application created (UC-05) |
| **Trigger** | User is prompted to provide funder guidelines |

**Main Flow**
1. User is presented with two options: paste text or upload a file (PDF or Word)
2. User pastes or uploads the funder's guidelines document
3. System confirms the content has been received
4. User is prompted to proceed to AI summarisation (UC-07)

**Alternative Flows**
- File format not supported → system displays supported formats and prompts user to paste text instead
- No guidelines available → user can proceed without guidelines but AI outputs will be less targeted

**Postcondition:** Funder guidelines are associated with the application and available for AI processing.

---

### UC-07 — Generate AI Summary of Funder Guidelines

| Field | Detail |
|-------|--------|
| **Actor** | Registered user |
| **Precondition** | Funder guidelines have been provided (UC-06) |
| **Trigger** | User clicks "Summarise Guidelines" |

**Main Flow**
1. System sends funder guidelines and charity profile to Amazon Bedrock
2. System generates a plain-English summary covering: funder priorities, what they fund, who they fund, evidence expectations, and a plain-language explanation of each application question
3. Summary is displayed to the user
4. User reviews the summary

**Alternative Flows**
- API timeout or error → system displays a plain-language error message and prompts user to try again
- Guidelines too long for context window → system processes in sections and combines output

**Postcondition:** User has a clear understanding of the funder's requirements before writing begins.

---

### UC-08 — Write Draft Answer for an Application Question

| Field | Detail |
|-------|--------|
| **Actor** | Registered user |
| **Precondition** | Funder summary generated (UC-07); charity profile complete |
| **Trigger** | User begins writing their answer for a section or question |

**Main Flow**
1. User selects the current section or question (word limit displayed if extracted from guidelines)
2. User writes their answer in the text area (section by section for narrative funders; numbered Q&A for structured funders)
3. User optionally clicks "Help me improve this" to request AI assistance with structure or clarity — AI refines the charity's own text and may not add facts or change claims
4. Draft is displayed to the user alongside the mandatory review prompt (UC-09)

**Alternative Flows**
- API timeout or error on AI assist request → plain-language error message; user prompted to retry; user's own text is preserved
- Answer exceeds word limit → system displays word count and flags excess

**Postcondition:** A charity-authored draft answer is ready for mandatory human review. All content originates from the charity; AI has only refined it on request.

---

### UC-09 — Review and Approve Written Content

| Field | Detail |
|-------|--------|
| **Actor** | Registered user |
| **Precondition** | Charity-authored draft written (UC-08) |
| **Trigger** | Draft is displayed with the mandatory review prompt |

**Main Flow**
1. System displays the draft answer alongside three plain-language review prompts:
   - *Does this accurately describe your charity and project?*
   - *Are all figures, dates, and facts correct?*
   - *Does this answer the question that was asked?*
2. User reads the draft and considers the prompts
3. User may edit the content directly (UC-10)
4. User clicks "Approve" to confirm the content is ready to use

**Alternative Flows**
- User is not satisfied → user edits the content and re-approves, or discards and regenerates
- User tries to proceed without approving → system prevents progression and reminds user of the review step

**Postcondition:** Content is marked as approved by the user and saved to the application.

---

### UC-10 — Edit Application Content

| Field | Detail |
|-------|--------|
| **Actor** | Registered user |
| **Precondition** | Draft answer generated and displayed |
| **Trigger** | User clicks into the draft text to edit it |

**Main Flow**
1. User edits the draft text directly in an inline text editor
2. Changes are reflected in real time
3. User approves the edited content (UC-09) or discards changes

**Postcondition:** Edited content replaces the generated draft and is saved on approval.

---

### UC-11 — Save Application Progress

| Field | Detail |
|-------|--------|
| **Actor** | Registered user |
| **Precondition** | Application is in progress |
| **Trigger** | User clicks Save, or system auto-saves at intervals |

**Main Flow**
1. System saves all current application content, including approved and in-progress answers
2. User receives a confirmation that progress has been saved
3. User may safely close the application and return later

**Postcondition:** Application progress is preserved and retrievable from the user's dashboard.

---

### UC-12 — Return to a Saved Application

| Field | Detail |
|-------|--------|
| **Actor** | Registered user |
| **Precondition** | One or more saved applications exist |
| **Trigger** | User logs in and selects an existing application from their dashboard |

**Main Flow**
1. User sees a list of saved applications on their dashboard, showing grant name, funder, and last edited date
2. User selects an application
3. System loads the application, showing completed and pending questions
4. User continues from where they left off

**Postcondition:** User resumes work on a previously saved application.

---

### UC-13 — Export Application Content

| Field | Detail |
|-------|--------|
| **Actor** | Registered user |
| **Precondition** | One or more application questions have approved content |
| **Trigger** | User clicks "Export" |

**Main Flow**
1. User clicks Export
2. System compiles all approved content into a structured document
3. User selects export format: Word (.docx) or plain text (.txt)
4. File is downloaded to the user's device

**Alternative Flows**
- No approved content exists → system prompts user to complete at least one review step before exporting

**Postcondition:** User has a clean, formatted document ready to paste into a funder's application form or portal.

---

### UC-14 — Update Charity Profile

| Field | Detail |
|-------|--------|
| **Actor** | Registered user |
| **Precondition** | Charity profile exists |
| **Trigger** | User navigates to Profile Settings and edits a field |

**Main Flow**
1. User opens their charity profile
2. User edits one or more fields
3. User saves changes
4. Updated profile is used for all future AI generation

**Postcondition:** Charity profile reflects the latest organisational information; AI outputs in future applications will use updated data.

---

### UC-15 — Delete Account and All Data

| Field | Detail |
|-------|--------|
| **Actor** | Registered user |
| **Precondition** | User has an active account |
| **Trigger** | User navigates to Account Settings and selects Delete Account |

**Main Flow**
1. System presents a plain-language warning explaining that all data will be permanently deleted
2. User confirms deletion by entering their email address
3. System permanently deletes: user account, charity profile, all saved applications, and all generated content
4. User receives a confirmation email that their data has been deleted
5. Account is deactivated immediately

**Postcondition:** All user data is permanently and irreversibly deleted in line with DR-DP-003 and UK GDPR right to erasure.

---

## Summary

| Document section | Checklist items covered |
|---|---|
| Part 1 — User Personas | Items 8, 9, 10, 11, 12 |
| Part 2 — User Journeys | Items 13, 14, 15, 16, 17, 18, 19, 20, 21 |
| Part 3 — Use Cases | Items 22, 23, 24, 25, 26, 27, 28, 29 |

---

## Document History

| Version | Date | Author | Summary of changes |
|---------|------|--------|--------------------|
| 1.0 | 2026-04-16 | Rapidglobe Ltd | Initial version |
| 1.1 | 2026-05-29 | Rapidglobe Ltd | Step 4 journey description updated to reflect charity-authored Q&A model (section-by-section for narrative funders, numbered Q&A for structured funders). Document history table added. |
| 1.2 | 2026-05-29 | Rapidglobe Ltd | UC-04 updated to reflect thick charity profile (BD-02): identity, address and contact, mission and work, financial fields, and supporting document status. OSCR/CCNI note added. |
| 1.3 | 2026-06-01 | Rapidglobe Ltd | UC-05 updated to reflect funder directory model (DR-FD-001): funder is selected from searchable curated picker, not free-text entry. "Request a Funder" escape hatch documented. Journey 1 step 6 and Journey 2 step 3 updated accordingly. |
