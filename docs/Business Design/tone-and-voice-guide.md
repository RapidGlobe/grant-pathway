# Tone & Voice Guide — Grant Pathway v1

This guide defines how Grant Pathway communicates with its users across every screen, message, button, and error state. It is a reference for anyone writing copy for the product — whether for the UI, email notifications, help text, or any future marketing content.

---

## Related Documents

| Document                              | Location                                                                                           |
| ------------------------------------- | -------------------------------------------------------------------------------------------------- |
| App Name & Branding (colours, fonts)  | `docs/app-name-and-branding.md`                                                                    |
| Screen Specifications (copy examples) | `docs/PRD-Grant-Pathway.md` (Section 7 -- previously `screen-requirements.md`, retired 2026-07-13) |
| User Personas                         | `docs/user-personas-journeys-and-use-cases.md` (Parts 1 and 3 — journeys removed 2026-07-30)       |
| Email Notifications                   | `docs/PRD inputs/email-notifications.md`                                                           |

---

## 1. Who We Are Writing For

Every word in Grant Pathway is written for two people.

**Margaret** is a 58-year-old volunteer writing grant applications for a small charity in a market town. She gives up two days a week to help isolated older adults in her community. She has never used an AI tool before. She is competent, committed, and experienced in her charity's work -- but she lacks confidence when it comes to grant writing, finds funder jargon intimidating, and is worried about getting it wrong. Each application takes her a full weekend.

**David** is a 44-year-old charity manager writing 8--12 applications a year on evenings and weekends because no one else can do it. He has used ChatGPT. He is time-pressured, efficient by necessity, and frustrated by the repetition of adapting the same core content for different funders. He needs tools that respect his time.

Both Margaret and David are experts in their charity's work. Neither is a professional fundraiser. Neither should ever feel like Grant Pathway is talking down to them, confusing them, or treating them as a problem to be managed.

---

## 2. Voice Pillars

Grant Pathway's voice is built on five pillars. These are not a checklist -- they are a way of thinking about every line of copy.

---

### Plain English

**What it means:** Write as if explaining something to a capable colleague who is not a specialist in fundraising or AI. No jargon, no technical language, no AI-speak.

**In practice:**

- "Here's a draft answer" -- not "AI-generated output has been synthesised"
- "We couldn't reach the Charity Commission right now" -- not "API request failed with status 503"
- "Check your spam folder" -- not "Verify your email client's junk mail filters"

**Test:** If Margaret would need to look up a word or phrase, rewrite it.

---

### Encouraging

**What it means:** Grant writing is hard work done for important reasons. Acknowledge that. The product should feel like a supportive presence, not a passive tool.

**In practice:**

- "You're making great progress on this application"
- "You're ready to start your first application"
- "Let's get started" -- not just "Continue"

**Test:** Would this message make Margaret feel confident and capable, or would it feel transactional and cold?

---

### Honest

**What it means:** Be clear and upfront about what the product does and does not do. Never oversell the AI. Never make promises about funding outcomes. Users who feel misled will not come back.

**In practice:**

- "This is a starting point -- please review carefully before using"
- "We found [n] questions in these guidelines" -- not "We found all the questions"
- Loading messages: "Reading your funder guidelines..." -- not "Instantly analysing..."

**Test:** Is this claim accurate in all circumstances? Could it ever mislead a user who takes it literally?

---

### Respectful

**What it means:** Margaret and David know their charities and their beneficiaries far better than Grant Pathway does. The product supports them -- it does not instruct them. Avoid over-explaining, condescending reassurances, or excessive hand-holding.

**In practice:**

- "Review before using" -- not "You must carefully check every word before you submit this to any funder"
- "Your application" -- not "the application" (it belongs to them)
- Error messages that explain what happened and what to do -- not messages that apologise excessively or imply the user made a mistake

**Test:** Would a competent professional find this message patronising?

---

### Concise

**What it means:** Every word must earn its place. Short sentences. Active voice. No padding, no preamble, no unnecessary qualifiers.

**In practice:**

- "Check your email" -- not "Please be sure to check your email inbox for the message we have sent to you"
- "Your password must be at least 10 characters" -- not "For security purposes, we require that all passwords contain a minimum of 10 characters"
- Buttons: one to four words maximum

**Test:** Can any word be removed without changing the meaning? If yes, remove it.

---

## 3. Tone in Context

The voice pillars stay constant. The tone -- the emotional register of the writing -- shifts depending on what is happening on screen. The same product should feel different when welcoming a new user vs. warning them about data deletion.

| Context                               | Tone                                | Notes                                                                                |
| ------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------ |
| Onboarding and first use              | Warm, welcoming, gently guiding     | Margaret is nervous. Make her feel she is in the right place.                        |
| Active task (form filling, uploading) | Clear, focused, unobtrusive         | David is efficient. Get out of his way.                                              |
| AI generation (loading states)        | Calm, reassuring, forward-moving    | A 60-second wait needs active reassurance. Use staged messages that signal progress. |
| Success messages                      | Positive, brief, actionable         | Celebrate milestone moments. Keep transactional saves quiet and efficient.           |
| Errors and failures                   | Calm, explanatory, solution-focused | Never alarming. Always say what happened and what the user can do next.              |
| Warnings (re-export, AI limit)        | Direct, honest, non-alarmist        | State the fact. Give the user control. Don't catastrophise.                          |
| Destructive actions (deletion)        | Serious, clear, friction-creating   | The tone should communicate gravity without panic.                                   |
| Email notifications                   | Personal, warm, concise             | Uses the user's first name. No marketing language.                                   |

---

## 4. UI Copy Patterns

### Page Headings

Page headings are written in sentence case (capitalise the first word only, plus proper nouns). They state what the page is for -- they do not try to be clever or clever.

| Context                     | Example                                  |
| --------------------------- | ---------------------------------------- |
| Simple statement of purpose | "Account settings"                       |
| User-centred welcome        | "Welcome to Grant Pathway, [first name]" |
| Task in progress            | "Add the funder's guidelines"            |
| Output ready                | "Your funder guidelines -- summary"      |

---

### Buttons

Buttons describe the action that will happen when clicked. They are written in sentence case. They do not use vague labels like "OK", "Submit", or "Proceed".

| Type                  | Pattern                     | Examples                                                |
| --------------------- | --------------------------- | ------------------------------------------------------- |
| Primary action        | Verb + object               | "Save profile", "Continue", "Download as Word document" |
| Confirmation          | Qualifier + verb            | "Yes, approve", "Send a new verification email"         |
| Escape / cancel       | Single word or short phrase | "Cancel", "Back"                                        |
| Destructive (Level 1) | Verb + object               | "Delete"                                                |
| Destructive (Level 2) | Adverb + verb + object      | "Permanently delete my account"                         |

**Never use:** OK, Submit, Proceed, Click here, Go, Next (use Continue instead).

---

### Placeholder Text

Placeholder text appears inside empty form fields as a hint. It should give a concrete example of what to enter -- not a restatement of the label.

| Label                         | Good placeholder                                                                                           | Bad placeholder                       |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| "Who is offering this grant?" | "e.g. National Lottery Community Fund"                                                                     | "Enter funder name"                   |
| "What does your charity do?"  | "e.g. We support elderly people living alone in rural areas by providing companionship and practical help" | "Describe your charitable activities" |
| "Where do you work?"          | "e.g. South Yorkshire, or National"                                                                        | "Enter location"                      |

---

### Validation and Inline Errors

Validation errors appear inline, next to the field that needs attention. They are written in plain English and tell the user exactly what to do -- they do not blame.

**Pattern:** "[What is wrong]. [What to do]" -- or simply "[What to do]."

| Situation                | Good message                                        | Bad message              |
| ------------------------ | --------------------------------------------------- | ------------------------ |
| Required field empty     | "Please enter your charity name"                    | "This field is required" |
| Password too short       | "Your password must be at least 10 characters"      | "Invalid password"       |
| Passwords don't match    | "Your passwords do not match"                       | "Confirmation error"     |
| Email already registered | "An account with this email address already exists" | "Duplicate email"        |

---

### Error Messages (API and System Failures)

Error messages appear inline on the page. They never use technical language, error codes, or jargon. They always include a clear next action.

**Pattern:** "[What happened in plain English]. [What the user can do]."

| Situation                          | Message                                                                                                                            |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Charity Commission API unavailable | "We couldn't reach the Charity Commission right now. Please try again in a few moments, or enter your charity details manually."   |
| AI generation failed               | "We couldn't generate your content right now. This is usually temporary -- please try again."                                      |
| AI generation failed after retry   | "If this keeps happening, please try again later. Your work has been saved."                                                       |
| File format not accepted           | "We can only accept PDF or Word (.docx) files. Please convert your document or paste the text directly."                           |
| File too large                     | "Your file is over 10MB. Please upload a smaller file or paste the text directly."                                                 |
| Scanned PDF                        | "We couldn't read the text in your PDF -- it may be a scanned document. Please try copying and pasting the text directly instead." |

**Never use:** "Error", "Something went wrong", "Oops", "Uh oh", technical status codes, stack traces.

---

### Success Messages

Success messages confirm that something worked. Milestone saves get more warmth; transactional saves are brief and efficient.

| Situation                           | Message                                                                              |
| ----------------------------------- | ------------------------------------------------------------------------------------ |
| First-time profile save (milestone) | "Your charity profile has been saved. You're ready to start your first application." |
| Profile updated (transactional)     | "Your changes have been saved."                                                      |
| Password changed (transactional)    | "Your password has been updated."                                                    |
| Account deleted (redirect message)  | "Your account has been deleted."                                                     |

---

### Warning Messages

Warnings are informational -- they tell the user something they need to know, without creating alarm.

| Situation                        | Message                                                                                                                                                                                                                                                       |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Approaching AI usage limit (80%) | "You've used most of your monthly AI allowance."                                                                                                                                                                                                              |
| AI limit reached                 | "You've reached your monthly AI limit. This resets on [date]. If you need more, please get in touch."                                                                                                                                                         |
| Re-export warning                | "You exported this application on [date]. If you have already submitted that version to the funder, please contact them to let them know a revised version is being submitted. Funders may treat multiple submissions as separate applications."              |
| Large document warning           | "Your guidelines document is quite long. For the best results, we recommend uploading only the core sections -- such as eligibility criteria, application questions, and assessment criteria. Very long documents may reduce the quality of your AI summary." |

---

### Confirmation Copy

Confirmation messages accompany actions that need a deliberate second step.

| Situation                              | Message                                                                                                                                                |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Approve application (inline expansion) | "Are you sure you want to approve this application? You can re-open it to make changes at any time."                                                   |
| Delete application (modal)             | "Are you sure you want to delete [Grant Name] -- [Funder Name]? This cannot be undone."                                                                |
| Account deletion screen                | "This will permanently delete your account and all associated data, including your charity profile and all saved applications. This cannot be undone." |

---

### Loading States (AI Generation)

Loading messages are staged -- they update as processing continues. They use active, present-tense language that makes the AI feel like it is doing useful work, not just waiting.

**Step 3 (AI Summary):**

1. "Reading your funder guidelines..."
2. "Almost there..."

**Step 4 (Draft Answers):**

1. "Reviewing your guidelines and charity profile..."
2. "Writing your draft answers..."
3. "Almost there..."

**Never use:** "Processing...", "Loading...", "Please wait...", "Generating AI output..."

---

## 5. Words to Use and Avoid

### Use these

| Preferred term       | Instead of                                |
| -------------------- | ----------------------------------------- |
| Draft answer         | AI output, generated content, AI response |
| Funder guidelines    | Prompt, input document, source material   |
| Your application     | The application                           |
| Review before using  | Validate, verify, check accuracy          |
| We couldn't...       | Error:, Failed to..., Unable to...        |
| Get in touch         | Contact support, raise a ticket           |
| Your charity profile | The charity profile                       |
| Approve              | Sign off, finalise, lock                  |
| Re-open              | Unlock, reset                             |
| Monthly AI allowance | Token limit, API quota, usage cap         |

### Avoid these

| Avoid                                    | Why                                                                              |
| ---------------------------------------- | -------------------------------------------------------------------------------- |
| AI, artificial intelligence (in UI copy) | Keep AI in the background -- the product is the companion, not the technology    |
| Prompt, token, model, inference, API     | Technical language Margaret and David will not understand                        |
| "AI will now..."                         | Makes AI the subject; keep the user as the subject                               |
| "Please note that..."                    | Padding -- just say the thing                                                    |
| "In order to..."                         | Just use "to"                                                                    |
| "We apologise for any inconvenience"     | Empty corporate phrase; say what happened and what to do                         |
| Passive voice where active is clearer    | "Your data will be deleted" vs. "We'll delete all your data"                     |
| Promises about funding outcomes          | We help with writing -- we cannot promise funding success                        |
| "Simply", "just", "easy"                 | Implies the task is trivial; may make users feel inadequate if they find it hard |

---

## 6. Accessibility and Inclusive Language

- Use plain English that is readable at a Year 9 reading level (approximately age 13--14). The Hemingway Editor is a useful free tool for checking this.
- Avoid idioms that may not translate across UK regions or for users whose first language is not English.
- Do not use colour alone to convey meaning in copy -- always include a text label alongside any colour-coded status.
- Screen reader users will hear button labels, form labels, and error messages read aloud. Test that every label makes sense in isolation, out of visual context.
- Error messages must identify the problem field by name, not just by position ("the third field" is not accessible).

---

## 7. Grant Pathway Is Not...

A few things Grant Pathway should never sound like, to keep the voice distinct.

| Not this                    | Because                                                                    |
| --------------------------- | -------------------------------------------------------------------------- |
| A corporate SaaS tool       | "Leverage your organisation's data assets to optimise submission outcomes" |
| An overpromising AI product | "Our cutting-edge AI will transform your grant writing forever"            |
| A government service        | Authoritative to the point of being cold or bureaucratic                   |
| A consumer app              | Casual to the point of being flippant about what is serious work           |
| A charity itself            | We support charities; we are not one                                       |

Grant Pathway sounds like a knowledgeable friend who works in the sector -- warm, direct, honest, and useful.

---

_Last updated: 2026-07-30 — the three paths in Related Documents above were corrected from a stale `business/…` prefix to `docs/…`; none of the three had resolved. Found while assessing whether `user-personas-journeys-and-use-cases.md` still earns its place (Opus audit L1 follow-on). The same stale prefix survives in 36 further references across five other live documents — logged, not fixed here._
_Status: Complete_
_Sources: app-name-and-branding.md (BR-04), PRD-Grant-Pathway.md Section 7 (previously screen-requirements.md, retired 2026-07-13), user-personas-journeys-and-use-cases.md, PDR-UI-006, design decision records DDR-CS-005, DDR-IP-001, DDR-IP-002_
