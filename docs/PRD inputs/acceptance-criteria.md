# Acceptance Criteria — Grant Pathway v1

**Tier:** 1 — Always check after every task
**Volatility:** High
**Update when:** Any change to functional requirements that alters what "done" looks like

This document defines testable Given/When/Then acceptance criteria for every functional requirement in Grant Pathway v1. Criteria are grouped by the same sections used in the BRD (Section 9).

Each requirement is marked **Must Have** or **Should Have**. Should Have requirements are included for completeness — acceptance criteria for a Should Have requirement only apply if that requirement is built in v1. Where a Must Have requirement's criteria describe behaviour that is not confirmed as built, this is flagged explicitly at the start of that FR's section — such criteria should not be treated as currently passing, and test plans should not report against them as defects until the flag is resolved.

---

## Status

| Section                                                      | FRs covered            | Status                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------------------------------------------------ | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 9.1 Authentication & Accounts                                | FR-01 to FR-08         | ✅ Reviewed 2026-07-13 — FR-08 status corrected to "Confirmed built"; AC-FR-05-06 expired-link message corrected (found during PRD cross-check); AC-FR-06-04 added for the 55-minute warning dialog before auto-logout (previously undocumented, found during PRD Section 12 review). Updated 2026-07-28 — new AC-FR-06-05 for D-013 (ambient activity no longer dismisses the open warning dialog; only its own two buttons can), found via a documentation freshness audit; new AC-FR-04-05 for D-015 (leading/trailing whitespace on email or password no longer blocks sign-in), found live on an iPhone ahead of an external demo |
| 9.2 Charity Profile                                          | FR-09 to FR-14, FR-12A | ✅ Reviewed 2026-07-13 — FR-10 corrected, FR-12A added, FR-09/FR-13 wording corrected. Updated 2026-07-15 — FR-12A re-sited from `/profile` to Step 4, then made guideline-driven per `PDR-AI-008` later the same day (all 3 ACs rewritten twice), then gained AC-FR-12A-04 for the manual-add fallback built the same day; see `ADR-DATA-006`'s two matching amendments                                                                                                                                                                                                                                                               |
| 9.3 Application Management                                   | FR-15 to FR-20         | ✅ Reviewed 2026-07-13 — AC-FR-15-04 corrected, FR-16 mismatch tally fixed (code + doc), FR-17 View→Re-open renamed with new criteria. Updated 2026-07-15 — FR-15 rewritten for DR-FD-001 v1.4: curated funder picker/directory removed, free-text field restored; AC-FR-15-01/02 updated; AC-FR-15-05 rewritten from "unlisted funder request link" to the new name-based reuse-match behaviour                                                                                                                                                                                                                                       |
| 9.4 Funder Guideline Handling                                | FR-21 to FR-23         | ✅ Reviewed 2026-07-13; updated 2026-07-14 — FR-22 built (GAP-33 fix): retention (AC-01/02) confirmed built; AC-03 (playbook-independent retention) permanently superseded, not pending — see `ADR-DATA-006`'s 2026-07-14 amendment; AC-04 reworded to flag the resulting stale UI copy (GAP-34)                                                                                                                                                                                                                                                                                                                                       |
| 9.5 AI Guideline Summarisation                               | FR-24 to FR-27         | ✅ Reviewed 2026-07-13 — AC-FR-24-02 corrected (found during PRD cross-check), AC-FR-27-05 added. AC-FR-24-06 quote corrected and mechanism note updated 2026-07-14 now `P6.2a` has landed                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 9.6 Q&A Interview and Application Assembly                   | FR-28 to FR-31, FR-31A | ✅ Reviewed 2026-07-13 — FR-31 badge/label/gating corrected (three ACs); FR-28–30, FR-31A confirmed accurate                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 9.7 Mandatory Review & Approval                              | FR-32 to FR-36         | ✅ Reviewed 2026-07-13 — FR-32 rewritten to match real checkboxes; re-open dialog wording reconciled (code)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 9.8 Export                                                   | FR-37 to FR-39         | ✅ Reviewed 2026-07-13 — no findings, confirmed accurate                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 9.9 Account Deletion                                         | FR-40 to FR-44         | ✅ Reviewed 2026-07-13 — AC-FR-41-02/03 and AC-FR-43-02 corrected to match live page content; AC-FR-42-01/02/03 corrected (disabled-until-match button behaviour was wrong, found during a PRD/BRD/AC cross-document sweep)                                                                                                                                                                                                                                                                                                                                                                                                            |
| 9.10 Question Typing, Funder Coverage & Eligibility Mismatch | FR-45 to FR-47         | ✅ Reviewed 2026-07-13 — FR-45 confirmed not built as specified (own citations); FR-46 withdrawn (Won't Have, 2026-07-11); FR-47 confirmed built                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 9.11 Guideline Source-Reference (Citations)                  | FR-48                  | ✅ Reviewed 2026-07-13, updated 2026-07-14, updated 2026-07-21 — `P6.2a`/`P6.3`/GAP-33/`P6.4` (first milestone) now built and confirmed visible on Step 4 (AC-02/03); a third citation type (`[ITEM N]`, a numbered-item fallback for guidelines with no page or heading structure) built 2026-07-21 after live-testing found the Wolfson Foundation's guidelines produced zero citations; summary-bullet citations remain not built; human curator confirmation (`P6.5`) is permanently superseded, not pending — see `ADR-DATA-007`'s amendments                                                                                     |
| 9.12 Help Centre Link & Contextual Tooltips                  | FR-49                  | ✅ Added 2026-07-25 — `PDR-UI-008` built 2026-07-24 (persistence mechanism reversed 2026-07-25); live-tested against `docs/Test Plans/help-and-tooltips-test-plan.md` v2.0 (HT-01 to HT-04 Pass, HT-05 Pass on axe-core/keyboard/focus-order, NVDA/VoiceOver pass deferred by WJ)                                                                                                                                                                                                                                                                                                                                                      |

---

## 9.1 Authentication & Accounts

---

### FR-01 — Must Have

**Requirement:** The system shall allow new users to register with their full name, email address, and a password.

---

**AC-FR-01-01 — Successful registration**

- **Given** I am an unauthenticated user on `/register`
- **When** I enter a valid first name, last name, email address, and a password of 12 or more characters containing both letters and digits
- **And** I check the Terms of Service and Privacy Policy checkbox
- **And** I click "Create account"
- **Then** my account is created in the system
- **And** a verification email is sent to the email address I provided
- **And** I am redirected to `/verify-email`

---

**AC-FR-01-02 — Required fields enforced**

- **Given** I am on `/register`
- **When** I submit the form with one or more required fields left empty
- **Then** an inline error message is shown against each empty required field
- **And** the form data I have entered is preserved
- **And** my account is not created

---

**AC-FR-01-03 — Authenticated user cannot access registration**

- **Given** I am already signed in
- **When** I navigate to `/register`
- **Then** I am redirected to `/dashboard`

---

### FR-02 — Must Have

**Requirement:** The system shall validate email format and enforce a minimum password length of 12 characters containing both letters and digits at registration. _(Updated 2026-06-29: minimum raised from 10 to 12 characters; complexity requirement added.)_

---

**AC-FR-02-01 — Invalid email format rejected**

- **Given** I am on `/register`
- **When** I enter an email address in an invalid format (e.g. "notanemail" or "missing@domain")
- **And** I submit the form
- **Then** I see the inline error: _"Please enter a valid email address"_
- **And** my account is not created

---

**AC-FR-02-02 — Password below minimum length rejected**

- **Given** I am on `/register`
- **When** I enter a password with fewer than 12 characters
- **And** I submit the form
- **Then** I see the inline error: _"Your password must be at least 12 characters and include both letters and numbers"_
- **And** my account is not created

---

**AC-FR-02-02b — Password without letters and digits rejected** _(Added 2026-06-29)_

- **Given** I am on `/register`
- **When** I enter a password of 12 or more characters that does not contain both letters and digits (e.g. all letters, all digits, or special characters only)
- **And** I submit the form
- **Then** I see the inline error: _"Your password must be at least 12 characters and include both letters and numbers"_
- **And** my account is not created

---

**AC-FR-02-03 — Password confirmation must match**

- **Given** I am on `/register`
- **When** I enter a valid password in the password field
- **And** I enter a different value in the password confirmation field
- **And** I submit the form
- **Then** I see the inline error: _"Your passwords do not match"_
- **And** my account is not created

---

**AC-FR-02-04 — Duplicate email address rejected**

- **Given** an account already exists for a given email address
- **When** I attempt to register with that same email address
- **Then** I see the inline error: _"An account with this email address already exists"_
- **And** no new account is created

---

**AC-FR-02-05 — Terms checkbox required**

- **Given** I am on `/register`
- **When** I submit the form without checking the Terms of Service and Privacy Policy checkbox
- **Then** I see the inline error: _"Please accept the Terms of Service and Privacy Policy to continue"_
- **And** my account is not created

---

### FR-03 — Must Have

**Requirement:** The system shall send a verification email upon registration; accounts shall not be activated until the email link is clicked.

---

**AC-FR-03-01 — Verification email sent on registration**

- **Given** I have successfully submitted the registration form
- **Then** I receive a verification email at my registered email address
- **And** the email contains a verification link
- **And** the link expires after 1 hour

---

**AC-FR-03-02 — Unverified account cannot sign in**

- **Given** I have registered but not yet clicked my verification link
- **When** I attempt to sign in with my email address and password
- **Then** I see the message: _"Please verify your email address before signing in."_
- **And** I am shown a "Resend verification email" link
- **And** I am not signed in

---

**AC-FR-03-03 — Valid verification link activates account**

- **Given** I have received my verification email
- **When** I click the verification link within 1 hour
- **Then** I am briefly routed through `/verify-email/confirm`, which confirms automatically with no action required from me (D-012)
- **And** I am then directed to `/verify-email` showing the heading _"Email verified"_
- **And** my account is now active
- **And** I am signed out (not left in an active session from the link)
- **And** I can sign in with my email address and password

---

**AC-FR-03-3a — Verification link cannot be completed by a page load alone (D-012)**

- **Given** an automated system (e.g. an email provider's link-scanning) requests the verification link before I do
- **Then** my account is not activated by that request alone
- **And** activation only completes when a real browser executes the confirmation page's JavaScript
- **When** I subsequently open the same link myself within the 1-hour window
- **Then** my account activates normally, exactly as if the automated request had not happened

---

**AC-FR-03-04 — Expired verification link**

- **Given** I have received a verification email
- **When** I click the verification link after 1 hour has passed
- **Then** I see the heading _"This link has expired"_
- **And** I see the message: _"Your verification link is no longer valid. Request a new one below."_
- **And** I am shown a "Send a new verification email" button
- **And** my account remains inactive

---

**AC-FR-03-05 — Resend verification email**

- **Given** I am on `/verify-email` in the awaiting verification state
- **When** I click "Resend verification email"
- **Then** a new verification email is sent to my registered email address
- **And** the previous link is invalidated

---

**AC-FR-03-06 — Resend rate limiting**

- **Given** I am on `/verify-email`
- **When** I have clicked "Resend verification email" 3 times within the same hour
- **And** I attempt to click it a fourth time within that hour
- **Then** the resend is blocked
- **And** I am shown a message indicating I have reached the resend limit

---

### FR-04 — Must Have

**Requirement:** The system shall allow registered users to log in with their email address and password.

---

**AC-FR-04-01 — Successful sign in**

- **Given** I am a registered and verified user on `/`
- **When** I enter my correct email address and password
- **And** I click "Sign in"
- **Then** I am signed in
- **And** I am redirected to `/dashboard`

---

**AC-FR-04-02 — Incorrect password**

- **Given** I am on `/`
- **When** I enter my registered email address with an incorrect password
- **And** I click "Sign in"
- **Then** I see the error: _"Your email address or password is incorrect. Please try again."_
- **And** I am not signed in

---

**AC-FR-04-03 — Unregistered email address — same error message shown**

- **Given** I am on `/`
- **When** I enter an email address that has no registered account
- **And** I click "Sign in"
- **Then** I see the same error: _"Your email address or password is incorrect. Please try again."_
- **And** the response does not confirm or deny whether the email address is registered

---

**AC-FR-04-04 — Authenticated user redirected away from sign-in**

- **Given** I am already signed in
- **When** I navigate to `/`
- **Then** I am redirected to `/dashboard`

---

**AC-FR-04-05 — Leading/trailing whitespace on email or password does not block sign-in (added 2026-07-28 -- fixes D-015, found live on an iPhone ahead of an external demo)**

- **Given** I am a registered and verified user on `/`
- **When** I paste my correct email address and/or password with an accidental leading or trailing space (e.g. picked up from a mobile clipboard or password manager)
- **And** I click "Sign in"
- **Then** the whitespace is trimmed before the credentials are checked
- **And** I am signed in and redirected to `/dashboard`, exactly as in AC-FR-04-01
- **Note:** before this fix, a trailing space on the password was sent to Supabase Auth untrimmed, causing a genuine credential match to fail with the same generic error as AC-FR-04-02 -- indistinguishable from an actually wrong password.

---

### FR-05 — Must Have

**Requirement:** The system shall provide a self-service password reset flow triggered by email.

---

**AC-FR-05-01 — Reset email sent for registered address**

- **Given** I am on `/forgot-password`
- **When** I enter my registered email address and submit
- **Then** I see the confirmation message: _"If an account exists for that email address, you'll receive a reset link shortly. Check your spam folder if it doesn't arrive within a few minutes."_
- **And** a password reset email (Email 2) is sent to my email address
- **And** the reset link in that email expires after 1 hour

---

**AC-FR-05-02 — Unregistered email — same message shown**

- **Given** I am on `/forgot-password`
- **When** I enter an email address that has no registered account and submit
- **Then** I see the same confirmation message as AC-FR-05-01
- **And** no email is sent
- **And** the response does not confirm or deny whether the email address is registered

---

**AC-FR-05-03 — Valid reset link — password form displayed**

- **Given** I have received a password reset email
- **When** I click the reset link within 1 hour
- **Then** I am presented with the "Choose a new password" form
- **And** the form contains a new password field and a confirm password field

---

**AC-FR-05-04 — Successful password reset**

- **Given** I am on the password reset form with a valid, unexpired link
- **When** I enter a new password of 12 or more characters containing both letters and digits
- **And** I enter the same value in the confirm password field
- **And** I click "Save new password"
- **Then** I see the confirmation: _"Your password has been updated."_
- **And** I am shown a "Sign in" button linking to `/`
- **And** I can sign in using my new password

---

**AC-FR-05-05 — Password reset — passwords do not match**

- **Given** I am on the password reset form
- **When** I enter a new password
- **And** I enter a different value in the confirm password field
- **And** I submit
- **Then** I see the inline error: _"Your passwords do not match"_
- **And** my password is not changed

---

**AC-FR-05-06 — Expired reset link** _(corrected 2026-07-13 — message text was wrong)_

- **Given** I have received a password reset email
- **When** I click the reset link after 1 hour has passed
- **Then** I see the heading _"This link has expired"_
- **And** the message: _"Your reset link is no longer valid. Please request a new one."_
- **And** I am shown a "Request a new link" button that takes me back to the reset request form
- **And** my password is not changed

---

### FR-06 — Must Have

**Requirement:** The system shall automatically log out users after 60 minutes of inactivity.

---

**AC-FR-06-01 — Auto-logout after 60 minutes of inactivity**

- **Given** I am signed in to the application
- **When** 60 minutes pass without any user interaction (no navigation, clicks, or form submissions)
- **Then** my session is ended
- **And** I am redirected to `/`

---

**AC-FR-06-02 — Interaction resets the inactivity timer**

- **Given** I am signed in and the inactivity timer is running
- **When** I interact with the application (e.g. navigate to a new page, submit a form, or click a button)
- **Then** the 60-minute inactivity timer is reset
- **Exception (added 2026-07-28):** this does not apply once the AC-FR-06-04 warning dialog is already open — see AC-FR-06-05

---

**AC-FR-06-03 — Accessing a protected page after session expiry**

- **Given** my session has expired due to inactivity
- **When** I attempt to navigate to or access a protected page (e.g. `/dashboard`)
- **Then** I am redirected to `/`
- **And** I am not shown any protected content

---

**AC-FR-06-04 — Warning dialog before auto-logout (added 2026-07-13 -- confirmed built in `components/session-timeout-provider.tsx`/`session-timeout-modal.tsx`, previously undocumented here)**

- **Given** I am signed in and have been inactive for 55 minutes
- **When** the warning threshold is reached
- **Then** I see a dialog headed "Are you still there?" telling me I'll be signed out in 5 minutes (counting down each minute) due to inactivity, with a reminder to save any work
- **And** I can click **"I'm still here"** to reset the inactivity timer and dismiss the dialog
- **And** I can click **"Sign out now"** to end my session immediately
- **And** if I take no action, I am automatically signed out and redirected to `/` once the 60-minute mark is reached (AC-FR-06-01)

---

**AC-FR-06-05 — Ambient activity does not dismiss the open warning dialog (added 2026-07-28 -- fixes D-013, a real defect found during `regression-test-plan.md` RT-15 diagnostic re-testing)**

- **Given** the warning dialog from AC-FR-06-04 is open
- **When** I move my mouse, press a key, or touch the screen anywhere on the page other than the dialog's own two buttons
- **Then** the dialog remains open and the inactivity timer is **not** reset
- **And** the dialog only closes (and the timer only resets) when I click **"I'm still here"** or **"Sign out now"**
- **Note:** before this fix, any ambient activity toward the dialog — including moving the mouse to click one of its own buttons — reset the inactivity timer via the same document-level listener AC-FR-06-02 describes, immediately closing the dialog before it could be clicked; it then reappeared a full warning-window later, making it effectively unusable. AC-FR-06-02 describes activity resetting the timer in general; this criterion is the specific exception that applies once the dialog is showing.

---

### ~~FR-07 — Should Have~~ FR-07 — Won't Have

**Requirement:** ~~The system shall provide optional multi-factor authentication (MFA) as an opt-in feature; MFA shall not be mandatory in v1.~~ **Removed 2026-06-12** — demoted to Won't Have. See `docs/moscow-feature-register.md` §9.1 for the risk-analysis rationale. May be reconsidered post-launch if demand warrants it.

_The criteria below are retained for historical reference only. FR-07 will not be built in v1._

---

**AC-FR-07-01 — MFA opt-in available in account settings**

- **Given** I am a signed-in user on `/account`
- **When** I view my account settings
- **Then** I can see an option to enable multi-factor authentication

---

**AC-FR-07-02 — MFA not enforced at sign-in**

- **Given** I have not enabled MFA on my account
- **When** I sign in with my correct email address and password
- **Then** I am signed in without being prompted for a second factor

---

**AC-FR-07-03 — MFA enabled — second factor required at sign-in**

- **Given** I have enabled MFA on my account
- **When** I sign in with my correct email address and password
- **Then** I am prompted to complete the second factor before being signed in

---

### FR-08 — Should Have

**Requirement:** During registration, the system shall present a plain-language prompt asking the user if they are willing to participate in a feedback interview; the response shall be recorded against the account.

**Confirmed built** — verified directly in `components/register-form.tsx` and `actions/auth.ts`. The feedback opt-in checkbox is live on `/register`, submitted as `feedbackConsent`, and persisted to `user_profiles.feedback_consent` via the signup trigger.

---

**AC-FR-08-01 — Feedback opt-in checkbox displayed at registration**

- **Given** I am on `/register`
- **When** the page loads
- **Then** I see an optional checkbox labelled: _"I'm happy to be contacted occasionally to share feedback about Grant Pathway"_
- **And** the checkbox is unchecked by default

---

**AC-FR-08-02 — Opting in — consent recorded**

- **Given** I am completing the registration form
- **When** I check the feedback opt-in checkbox
- **And** I complete registration successfully
- **Then** my consent to be contacted for feedback is recorded against my account

---

**AC-FR-08-03 — Not opting in — no consent recorded**

- **Given** I am completing the registration form
- **When** I leave the feedback opt-in checkbox unchecked
- **And** I complete registration successfully
- **Then** no feedback contact consent is recorded against my account
- **And** my registration is not affected by not opting in

---

---

## 9.2 Charity Profile

---

### FR-09 — Must Have

**Requirement (corrected 2026-07-13):** Following account activation, the system shall prompt the user to set up their charity profile. _(Previously said "prompt the user to enter their charity's registered number" — inaccurate; registration number is just one optional field among several on the profile, not the specific thing prompted for. The AC below was already correct.)_

---

**AC-FR-09-01 — Profile incomplete banner shown after email verification**

- **Given** I have just verified my email address and my charity profile has not yet been completed
- **When** I am directed to `/dashboard`
- **Then** I see the charity profile banner: _"Before you start, add your charity details — we'll use these to personalise your applications."_
- **And** I see a "Set up charity profile" button linking to `/profile`

---

**AC-FR-09-02 — Profile banner shown while profile remains incomplete**

- **Given** I am a signed-in user whose charity profile has not been fully saved
- **When** I visit `/dashboard`
- **Then** the charity profile incomplete banner is displayed

---

**AC-FR-09-03 — Profile banner dismissed once profile is complete**

- **Given** I have fully saved my charity profile
- **When** I visit `/dashboard`
- **Then** the charity profile incomplete banner is not shown

---

**AC-FR-09-04 — New application disabled until profile is complete**

- **Given** I am on `/dashboard` in the empty state
- **And** my charity profile has not been fully saved
- **When** I view the "Start your first application" button
- **Then** the button is disabled
- **And** a tooltip reads: _"Please set up your charity profile first"_

---

### FR-10 — Must Have

**Requirement (corrected 2026-07-13 — see revision note):** The system shall query the Charity Commission for England and Wales public API and pre-fill the charity name and registration number on a match. Where the charity's governing document contains charitable objects text, the system shall use AI to paraphrase it into plain-English "what the charity does" and "who it helps" descriptions, shown to the user for review before saving. Registered address and date of registration are not collected by the charity profile at all — see FR-12's note and `docs/moscow-feature-register.md`; date of registration is a possible future addition (Phase 6 replan), not built.

**Confirmed built** — verified directly in `actions/charity.ts` (`lookupCharity()`) and `components/charity-profile-form.tsx`.

---

**AC-FR-10-01 — Charity Commission lookup — match found, name and registration number pre-filled**

- **Given** I am on `/profile`
- **When** I enter a charity name or registration number in the lookup field
- **And** I click the search button
- **And** the Charity Commission API returns a matching record
- **Then** the charity name and registration number fields are pre-populated with the returned data
- **And** I see the note: _"Details retrieved from the Charity Commission register. You can edit these fields before saving."_
- **And** all pre-filled fields remain editable

---

**AC-FR-10-01b — AI-paraphrased descriptions pre-filled when available**

- **Given** a Charity Commission match is found and the governing document contains charitable objects text
- **When** the AI paraphrase (via Amazon Bedrock) succeeds
- **Then** "What does your charity do?" and "Who does your charity help?" are pre-filled with the AI-drafted text
- **And** I see the note: _"The descriptions below were drafted by AI from your Charity Commission entry. Please review and personalise them before saving."_
- **And** both fields remain editable
- **And** if the paraphrase fails or the governing document has no charitable objects text, these fields are left as they were (blank on first setup) with no error shown — the user fills them in manually

---

**AC-FR-10-02 — Charity Commission lookup — no match found**

- **Given** I am on `/profile`
- **When** I enter a charity name or registration number that returns no result from the Charity Commission API
- **Then** I see the message: _"We couldn't find that charity. Please enter your details manually."_
- **And** all profile fields remain available for manual entry

---

### FR-11 — Must Have

**Requirement:** Where the Charity Commission API is unavailable or the charity is not found, the system shall allow the user to enter all charity details manually and shall display a plain-language explanation.

---

**AC-FR-11-01 — API unavailable — manual entry available**

- **Given** I am on `/profile`
- **When** I attempt the Charity Commission lookup
- **And** the API is unavailable or returns an error
- **Then** I see the message: _"We couldn't reach the Charity Commission right now. Please enter your details manually."_
- **And** all profile fields remain available for manual entry
- **And** I can save my profile without using the lookup

---

**AC-FR-11-02 — Manual entry always available**

- **Given** I am on `/profile`
- **When** the page loads
- **Then** all profile fields are directly editable without needing to use the Charity Commission lookup first

---

### FR-12 — Must Have

**Requirement:** The charity profile shall include the following fields: registered charity number, charity name, registered address, charitable objects, mission narrative, beneficiary description, main activities and programmes, geographic area of operation, and annual income band.

_Note: the final set of profile fields was refined during screen requirements. The implemented fields are: charity name, registration number (optional), "What does your charity do?", "Who does your charity help?", and "Where do you work?". Annual income band was removed as it adds no essential AI context and may confuse non-specialist users._

---

**AC-FR-12-01 — All required profile fields present**

- **Given** I am on `/profile`
- **When** the page loads
- **Then** I can see the following fields:
  - Charity name (required)
  - Charity registration number (optional)
  - "What does your charity do?" (required)
  - "Who does your charity help?" (required)
  - "Where do you work?" (required)

---

**AC-FR-12-02 — Required field validation at save**

- **Given** I am on `/profile`
- **When** I attempt to save the profile with one or more required fields empty
- **Then** inline error messages are shown against each empty required field:
  - Charity name: _"Please enter your charity name"_
  - What does your charity do?: _"Please tell us what your charity does"_
  - Who does your charity help?: _"Please tell us who your charity helps"_
  - Where do you work?: _"Please tell us where your charity works"_
- **And** the profile is not saved

---

**AC-FR-12-03 — Registration number is optional**

- **Given** I am on `/profile`
- **When** I save the profile with the charity registration number field left empty
- **And** all other required fields are completed
- **Then** the profile saves successfully
- **And** no error is shown for the registration number field

---

**AC-FR-12-04 — First-time save — success message shown on profile page**

- **Given** I am completing my charity profile for the first time
- **When** I fill in all required fields and click "Save profile"
- **Then** I see the success message: _"Your charity profile has been saved. You're ready to start your first application."_
- **And** I see a "Go to my dashboard" button linking to `/dashboard`
- **And** I remain on `/profile` (I am not automatically redirected)

---

**AC-FR-12-05 — Editing existing profile — save changes**

- **Given** I have a saved charity profile and I am editing it on `/profile`
- **When** I update one or more fields and click "Save changes"
- **Then** I see the success message: _"Your changes have been saved."_
- **And** I remain on `/profile`
- **And** the updated values are displayed when I next visit `/profile`

---

### FR-12A — Should Have (provisional)

**Requirement (revised 2026-07-15, twice the same day — moved from `/profile` to Step 4, then made guideline-driven per `PDR-AI-008`):** The application flow shall capture financial and governance facts — total annual expenditure, reserves, whether any trustees are related to each other, the number of authorised bank signatories, and whether any bank signatories are related to each other or to a trustee — **only when a funder's guidelines actually raise the relevant topic**, to support eligibility checks specific funders require.

**Originally added 2026-07-13** as a `/profile`-page feature (P6.1, `ADR-DATA-006` R13, migration `20260705000000`, 2026-07-05). **Re-sited 2026-07-15**: investigation found the five `charity_profiles` columns were never actually consumed anywhere — not by Step 3's summary/eligibility logic, not by P6.5's clone — so the original AC-FR-12A-01's "helps Grant Pathway flag issues before you apply" claim was untrue. WJ chose to represent these facts as `application_items` rows instead (Option C — the item-graph, matching how narrative questions already work), over keeping them at profile level. That first pass was placement only — all 5 always shown, unconditionally.

**Reworked again 2026-07-15, later the same day (`PDR-AI-008`)**: live testing of the always-on version found it disjointed from the rest of Step 4 (no citation, shown regardless of relevance). Now a fact is extracted and shown only when the funder's guidelines raise the topic at all — a deliberately **lower** bar than ordinary narrative "questions" (a general eligibility/policy statement counts, not just a discrete question) — with an optional citation exactly as narrative questions/sections already have. See `ADR-DATA-006`'s two 2026-07-15 amendments and `data-model.md` §4c for full detail.

**Manual-add fallback built (2026-07-15, same day, fast-follow):** for the residual zero-signal case, a quiet link lets a charity add one of the 5 facts themselves — new AC-FR-12A-04 below. **Priority still marked "Should Have" provisionally** — same unresolved MoSCoW-registration gap as before.

**Confirmed built** — verified directly in `lib/governance-items.ts`, `lib/prompts.ts`, `app/api/generate-summary/route.ts`, `actions/applications.ts`, `app/(authenticated)/applications/[id]/step/4/page.tsx`, and `components/application-step4-draft.tsx`.

---

**AC-FR-12A-01 — Governance and reserves items shown only when a funder's guidelines raise the topic, no dedicated heading**

- **Given** I am on Step 4 of an application for a funder whose guidelines raise one or more of the 5 facts (total annual expenditure, reserves, trustee-relatedness, bank-signatory count, bank-signatories-relatedness)
- **When** the page loads
- **Then** I see only the items the guidelines actually raised — as an ordinary-looking card at its fixed sort position, with no separate "Governance and reserves" heading or grouping
- **And** each shown item carries a citation badge exactly like any other extracted question, when the AI found one to cite
- **And** each label's "(optional)" suffix means a shown item never blocks the approval/assembly gate when left blank, via the same mechanism as any other optional question
- **Given** instead a funder whose guidelines raise none of the 5 facts
- **When** the page loads
- **Then** none of the 5 items appear — no gap, no placeholder, no indication anything is missing

---

**AC-FR-12A-02 — Governance items never carried forward between applications, including P6.5 reuse**

- **Given** I have previously entered values for these facts on another application (to any funder, including the same one)
- **When** I start a brand-new application, whether from scratch or via "Start from your last application to [Funder]" (P6.5)
- **Then** any governance and reserves items shown on the new application start blank
- **And** this is deliberate, not a bug: these facts must be re-entered and re-attested fresh for every application, unlike this application's own narrative answers (which P6.5 does carry over, marked "Carried over — please review")

---

**AC-FR-12A-03 — Governance and reserves items save successfully when left blank; orphan cleanup matches ordinary questions**

- **Given** I am on Step 4 of an application with one or more governance and reserves items shown
- **When** I leave one or more of them blank and navigate away
- **Then** the application saves successfully with no validation error
- **And** returning to Step 4 later, or regenerating the Step 3 summary (with the same facts still detected), does not delete these blank items or any values already entered in them
- **And** if regenerating the Step 3 summary produces a different extraction that no longer detects a given fact, an unanswered item for that fact is removed (exactly like a dropped narrative question), while an already-answered one is kept

---

**AC-FR-12A-04 — Manual-add fallback for facts the guidelines don't raise (built 2026-07-15, fast-follow)**

- **Given** I am on Step 4 and at least one of the 5 governance facts is not currently shown
- **When** I look below the question list
- **Then** I see a quiet link: "Need to add something about your finances or governance that wasn't asked above? Add it."
- **When** I click it
- **Then** I see a checkbox for each fact not already shown, each with a short plain-English explanation of why a funder might ask about it (not just a restatement of its name)
- **When** I select one or more and click "Add selected"
- **Then** the item(s) are created and appear in the question list with an "Added by you" label instead of a citation badge
- **Given** instead all 5 governance facts are already shown
- **When** the page loads
- **Then** the manual-add link does not appear at all — there is nothing left to add
- **And** this link is never proactively suggested or highlighted — it is a quiet, low-key affordance, not a prompt

---

### FR-13 — Must Have

**Requirement (corrected 2026-07-13):** The system shall allow users to update their charity profile at any time via a "Charity profile" link in the main navigation. _(Previously said "from their account settings" — inaccurate; it's a top-level nav link (`components/nav-authenticated.tsx`), not nested under account settings. The AC below was already correct.)_

---

**AC-FR-13-01 — Profile accessible via navigation at any time**

- **Given** I am a signed-in user on any authenticated screen
- **When** I click "Charity Profile" in the navigation bar
- **Then** I am taken to `/profile`
- **And** my current saved profile data is pre-populated in the form fields

---

**AC-FR-13-02 — Updated profile values are persisted**

- **Given** I have a saved charity profile
- **When** I navigate to `/profile`, update one or more fields, and click "Save changes"
- **Then** the updated values are saved
- **And** the updated values are displayed when I return to `/profile` in a future session

---

### FR-14 — Must Have

**Requirement:** The charity profile shall be used as an input to all AI-generated content to personalise outputs to the charity's context.

---

**AC-FR-14-01 — AI summary reflects charity profile context**

- **Given** I have a completed charity profile
- **And** I am generating an AI summary of funder guidelines (Step 3 of the application flow)
- **When** the summary is returned
- **Then** the summary content is relevant to the type of work and people described in my charity profile

---

**AC-FR-14-02 — AI draft answers reflect charity profile context**

- **Given** I have a completed charity profile
- **And** I am generating draft answers for an application (Step 4 of the application flow)
- **When** the draft answers are returned
- **Then** the draft content uses language and detail consistent with the charity's profile (e.g. what it does, who it helps, where it works)

---

**AC-FR-14-03 — AI cannot be invoked without a completed charity profile**

- **Given** my charity profile has not been fully saved
- **When** I attempt to start a new application from the dashboard
- **Then** the new application button is disabled
- **And** I am prompted to complete my charity profile first

---

---

## 9.3 Application Management

---

### FR-15 — Must Have

**Requirement (revised 2026-07-15, DR-FD-001 v1.4):** The system shall allow a user to create a new grant application by entering the funder's name as free text and entering the grant name. The 2026-06-01 curated directory picker (DR-FD-001 v1.0), and its 2026-07-11 free-text-fallback amendment (v1.3, never actually built), have both been superseded — the picker has been removed entirely rather than merely relaxed, since Step 3/4/5 processing is driven per-application by the uploaded guidelines, not by funder identity, so a curated directory no longer served a purpose. `applications.funder_id` (FK to `funders`) is left in place, unused; only `funder_name` is populated going forward.

---

**AC-FR-15-01 — Successful application creation**

- **Given** I am a signed-in user with a completed charity profile
- **When** I click "+ New Application" or "Start your first application" on `/dashboard`
- **And** I type the funder's name on Step 1
- **And** I enter a grant name
- **And** I click "Continue"
- **Then** a new application record is created with status `not_started`
- **And** the record's `funder_name` is saved (no `funder_id` is set — the field is dormant since 2026-07-15)
- **And** I am advanced to Step 2 (Funder Guidelines)

---

**AC-FR-15-02 — Required fields enforced**

- **Given** I am on Step 1 of the application flow
- **When** I attempt to click "Continue" without entering a funder name or grant name
- **Then** inline error messages are shown:
  - Funder: _"Please enter the funder's name"_
  - Grant name: _"Please enter the grant name"_
- **And** no application record is created

---

**AC-FR-15-05 — Reuse-match is name-based, not a stable identity** _(rewritten 2026-07-15 — the curated picker and its "unlisted funder" request link this AC previously described were removed; see FR-15's requirement note)_

- **Given** I have a previous application to a funder I've applied to before
- **When** I start a new application and type that funder's name on Step 1
- **Then** the app offers "Start from your last application to [Funder]" if, and only if, the typed name matches the previous application's `funder_name` on a case-insensitive, trimmed basis
- **And** if I type the funder's name even slightly differently between the two applications (e.g. "Henry Smith Charity" vs "The Henry Smith Charity"), the reuse offer is not shown — this is an accepted soft-miss trade-off (WJ, 2026-07-15), not a bug: the app never wrongly matches two different funders as if they were the same one

---

**AC-FR-15-03 — Cancel returns to dashboard without creating a record**

- **Given** I am on Step 1 of the application flow
- **When** I click "Cancel"
- **Then** I am returned to `/dashboard`
- **And** no application record has been created

---

**AC-FR-15-04 — Application page title set correctly** _(corrected 2026-07-13 — previously described a dynamic grant/funder title that was never built)_

- **Given** I am working on an application
- **When** I am on any step of the application flow
- **Then** the browser tab title reads _"[Step name] — Grant Pathway"_, where [Step name] is fixed per step: "Application Details" (Step 1), "Upload Guidelines" (Step 2), "AI Summary" (Step 3), "Draft Answers" (Step 4), "Approve & Export" (Step 5)
- **And** the title does not include the grant name or funder name

---

### FR-16 — Must Have

**Requirement (corrected 2026-07-13):** The system shall display all saved applications on a user dashboard, showing the grant name, funder name, and the date last edited. A fifth status, `mismatch` ("Ineligible" — set by FR-47's eligibility hard stop), also appears on the dashboard alongside the original four (`not_started`, `in_progress`, `approved`, `exported`) and is counted in the summary strip so its numbers tally against the total. _(Previously this FR and AC-FR-16-03 only accounted for four statuses; `mismatch` applications appeared as cards but were silently excluded from the summary strip's breakdown, so the four counts didn't sum to the total shown whenever a mismatch application existed. Fixed in `components/dashboard-populated.tsx` the same day.)_

---

**AC-FR-16-01 — All saved applications displayed as cards**

- **Given** I have one or more saved applications
- **When** I visit `/dashboard`
- **Then** each application is shown as a card displaying:
  - Funder name (bold, prominent)
  - Grant name
  - Status label (colour-coded)
  - Date last updated, formatted as DD Month YYYY

---

**AC-FR-16-02 — Applications sorted by most recently updated**

- **Given** I have multiple saved applications updated at different times
- **When** I visit `/dashboard`
- **Then** the application most recently updated is shown first
- **And** the remaining cards are ordered by last updated date descending

---

**AC-FR-16-03 — Summary strip shows all five status counts, and they tally**

- **Given** I have one or more saved applications, at any combination of statuses including `mismatch`
- **When** I view `/dashboard`
- **Then** the summary strip displays the count for all five statuses: Not started, In progress, Approved, Exported, Ineligible (`mismatch`)
- **And** all five status counts are shown even when some are zero
- **And** the format is: _"[n] applications — [n] not started · [n] in progress · [n] approved · [n] exported · [n] ineligible"_
- **And** the five counts always sum to the total number of applications shown

---

**AC-FR-16-04 — Status labels are colour-coded correctly**

- **Given** I have applications at different statuses
- **When** I view the dashboard application cards
- **Then** each status label uses the correct colour:
  - Not started — Slate
  - In progress — Amber
  - Approved — Green
  - Exported — Teal
  - Ineligible (`mismatch`) — Red

---

### FR-17 — Must Have

**Requirement:** The system shall allow a user to open and continue any saved application from their dashboard.

---

**AC-FR-17-01 — Continue button shown for not_started and in_progress applications**

- **Given** I have an application with status `not_started` or `in_progress`
- **When** I view its card on `/dashboard`
- **Then** I see a "Continue" button as the primary action on that card

---

**AC-FR-17-02 — Re-open button shown for approved and exported applications** _(renamed from "View" 2026-07-13 — see AC-FR-17-05/06 below; the action is not read-only)_

- **Given** I have an application with status `approved` or `exported`
- **When** I view its card on `/dashboard`
- **Then** I see a "Re-open" button as the primary action on that card

---

**AC-FR-17-03 — Returning user taken to their last reached step**

- **Given** I have an in-progress application where I last reached Step 3
- **When** I click "Continue" on that application from `/dashboard`
- **Then** I am taken directly to Step 3 of the application flow
- **And** I am not required to re-complete Steps 1 or 2

---

**AC-FR-17-04 — Application content preserved across sessions**

- **Given** I have a saved application with content entered in previous sessions
- **When** I sign out and sign back in
- **And** I return to that application from `/dashboard`
- **Then** all previously saved content is present and unchanged

---

**AC-FR-17-05 — Re-open shows a confirmation before making any change** _(added 2026-07-13 — previously undocumented)_

- **Given** I have an application with status `approved` or `exported`
- **When** I click "Re-open" on its card
- **Then** I see a confirmation dialog headed _"Re-open application"_
- **And** it reads: _"Re-opening this application will remove your approval. You will need to review and approve your answers again before you can export."_
- **And** I am presented with "Re-open" and "Cancel" actions
- **And** nothing about the application changes until I confirm

---

**AC-FR-17-06 — Confirming re-open reverts the application to an editable draft** _(added 2026-07-13 — previously undocumented)_

- **Given** I am viewing the re-open confirmation dialog for an approved or exported application
- **When** I click "Re-open"
- **Then** the application's status is set back to `in_progress`
- **And** its `current_step` is set to 4 (Draft Answers)
- **And** its `draft_status` is reset to `in_progress`, clearing any assembled draft
- **And** every answer's approval is revoked (`is_approved` set to false on all questions)
- **And** I am taken directly to the Step 4 Q&A interface
- **And** clicking "Cancel" instead leaves the application entirely unchanged

---

**AC-FR-17-07 — Mismatch applications offer no Continue or Re-open action** _(added 2026-07-13 — previously undocumented)_

- **Given** I have an application with status `mismatch`
- **When** I view its card on `/dashboard`
- **Then** I see only a "Delete" action on that card
- **And** no "Continue" or "Re-open" button is shown
- **And** there is no route back into the application flow for it — per `DR-EL-001`, I must correct my charity profile and start a new application to proceed

---

### FR-18 — Must Have

**Requirement:** The system shall auto-save application progress at regular intervals; manual save shall also be available.

---

**AC-FR-18-01 — Progress saved on Continue**

- **Given** I am working through the application flow
- **When** I click "Continue" to advance to the next step
- **Then** my progress on the current step is saved before the next step is shown

---

**AC-FR-18-02 — Background auto-save every 60 seconds** _(amended 2026-08-06 after user feedback — see note below)_

- **Given** I am on an active step of the application flow with unsaved edits
- **When** 60 seconds pass without me clicking Continue
- **Then** my progress is saved in the background without interrupting my work
- **And** the save is visibly confirmed to me, per AC-FR-18-05

**Amendment note (2026-08-06, WJ).** This criterion previously read "my progress is saved **silently** in the background" and "**no visible save indicator** is shown to the user during the background save". **That requirement is withdrawn, and the reason is user feedback rather than a change of technical opinion.**

WJ observed a first-time user — a charity worker completing a real Stony Stratford Town Council application — and found that nothing on Step 4 gave her any reason to believe her work was safe if she left the screen. The original rule was written to avoid nagging the user with a periodic indicator firing regardless of what they were doing. Weighed against a real applicant's hesitancy to close a browser tab containing hours of writing, that concern is the lesser one: **silence reads as "nothing is happening", not as "everything is fine".** A nervous user given no signal assumes the worst.

Two options were put to WJ (see the earlier draft of AC-FR-18-05). The narrower one — confirm only blur and explicit saves, keep the 60-second sweep silent — would have satisfied this criterion unamended. **WJ chose the broader option deliberately**, on the grounds that a user who steps away mid-sentence without moving focus is precisely the nervous user this is for, and they are the one the narrower option leaves with no signal at all.

**What is preserved:** the confirmation must not interrupt. It is an unobtrusive indication that a save happened, not a modal, a toast that steals focus, or anything requiring dismissal. The original criterion's underlying intent — do not get in the user's way — survives; only the assumption that silence is the way to achieve it has been dropped.

---

**AC-FR-18-03 — No more than 60 seconds of work lost if browser is closed**

- **Given** I am actively editing content on a step of the application flow
- **When** I close my browser without clicking Continue
- **And** I return to the application
- **Then** content I had been editing is present, with at most 60 seconds of edits potentially lost

---

**AC-FR-18-04 — A save that cannot reach the server is reported, not swallowed** _(added 2026-07-29, Opus audit M8)_

- **Given** I am writing answers on Step 4
- **And** the page has become stale — a new version has been deployed since I loaded it, or my session has timed out
- **When** an auto-save is attempted on blur or by the 60-second background sweep
- **And** the save fails at transport level, returning no result at all
- **Then** a visible alert appears in the sticky progress bar reading "**Not saved.**" followed by an explanation that the app may have been updated or the session timed out
- **And** I am told my text is still on screen and can be copied
- **And** a "Reload now" action is offered
- **And** the alert cannot be scrolled out of view while I continue typing
- **And** the alert clears automatically if a later save succeeds

**Note on the relationship to AC-FR-18-02.** _(Rewritten 2026-08-06 — this note previously described AC-FR-18-04 as a deliberate **exception** to AC-FR-18-02's silence rule. That rule has since been withdrawn, so there is no longer an exception to describe.)_ When this criterion was added on 2026-07-29, AC-FR-18-02 required background saves to be silent, and success was deliberately left silent while failure was carved out. The problem being solved was that a failed save was **also** silent, so a user could write for a long period believing their work was saved when nothing was persisting — found in production (Sentry `GRANT-PATHWAY-6`, 8 events over three weeks, 88% on Step 4), where the rejection reached the browser's global unhandled-rejection handler and nothing surfaced in the UI. As of AC-FR-18-02's 2026-08-06 amendment, **both** outcomes are now surfaced: success under AC-FR-18-05, failure under this criterion. The two must remain visually distinct — a failure is an alert the user has to act on, a success is an unobtrusive confirmation they do not.

---

**AC-FR-18-05 — A successful save is visibly confirmed** _(added 2026-08-06, `GAP-44`; decided by WJ the same day — AC-FR-18-02 amended to permit it)_

- **Given** I am writing answers on Step 4
- **When** an answer of mine is saved — whether on blur, by the 60-second background sweep, or on an explicit action
- **And** the save succeeds
- **Then** a visible confirmation appears against that answer
- **And** the confirmation does not interrupt my typing, steal focus, or require dismissal
- **And** it is visually distinct from the "**Not saved.**" alert of AC-FR-18-04

**Why this exists.** Step 4 gave the user no positive signal of any kind: the only save-related feedback in the entire component was the failure path from AC-FR-18-04. Without a success signal, the resumability reassurance added under `GAP-42` — "your answers are saved automatically, you can close this page at any time" — is an assertion the screen never demonstrates.

**Why it covers background saves too, which required amending AC-FR-18-02.** WJ was offered a narrower option that would have left the 60-second sweep silent and needed no criterion changed. He chose the broader one deliberately: **a nervous user who steps away mid-sentence without moving focus is exactly the user this is for**, and the narrower option leaves that user with no signal at all. See AC-FR-18-02's amendment note for the full reasoning and for what was preserved from the original rule.

**Built 2026-08-06** (`GAP-44`) — a per-answer "Saved" tick on every save path, governance fields included, clearing itself after 2.5s. Covered by `__tests__/step4-save-reassurance.test.tsx`; live confirmation is `help-and-tooltips-test-plan.md` HT-06 plus a look at Step 4.

---

### FR-19 — Must Have

**Requirement:** The system shall allow a user to delete a saved application.

---

**AC-FR-19-01 — Delete action available at all statuses**

- **Given** I have an application at any status (not_started, in_progress, approved, or exported)
- **When** I view its card on `/dashboard`
- **Then** I see a Delete option (red text link)

---

**AC-FR-19-02 — Confirmation prompt for not_started and in_progress applications**

- **Given** I have an application with status `not_started` or `in_progress`
- **When** I click the Delete link on its card
- **Then** I see the confirmation prompt: _"Are you sure you want to delete this application? This cannot be undone."_
- **And** I am presented with Confirm and Cancel actions

---

**AC-FR-19-03 — Confirmation prompt for approved applications**

- **Given** I have an application with status `approved`
- **When** I click the Delete link on its card
- **Then** I see the confirmation prompt: _"Are you sure you want to delete this approved application? Your answers will be permanently removed and cannot be recovered."_
- **And** I am presented with Confirm and Cancel actions

---

**AC-FR-19-04 — Confirmation prompt for exported applications**

- **Given** I have an application with status `exported`
- **When** I click the Delete link on its card
- **Then** I see the confirmation prompt: _"Are you sure you want to delete this application? Your answers will be permanently removed. Make sure you have kept a copy of your exported document."_
- **And** I am presented with Confirm and Cancel actions

---

**AC-FR-19-05 — Deletion confirmed — application permanently removed**

- **Given** I am viewing a deletion confirmation prompt for an application
- **When** I click Confirm
- **Then** the application is permanently deleted
- **And** it no longer appears on `/dashboard`
- **And** the deletion cannot be undone

---

**AC-FR-19-06 — Deletion cancelled — application unchanged**

- **Given** I am viewing a deletion confirmation prompt for an application
- **When** I click Cancel
- **Then** I am returned to `/dashboard`
- **And** the application remains at its previous status with all content intact

---

### FR-20 — Must Have

**Requirement:** A single user account shall support multiple saved applications simultaneously.

---

**AC-FR-20-01 — Multiple applications can coexist on one account**

- **Given** I am a signed-in user with a completed charity profile
- **When** I create two or more separate applications
- **Then** all applications appear simultaneously on `/dashboard`
- **And** each application shows its own funder name, grant name, status, and last updated date

---

**AC-FR-20-02 — Each application maintains its own content independently**

- **Given** I have two or more saved applications
- **When** I edit the content of one application
- **Then** the content and status of all other applications are unchanged

---

**AC-FR-20-03 — Summary strip totals reflect all applications**

- **Given** I have multiple applications across different statuses
- **When** I view `/dashboard`
- **Then** the summary strip counts accurately reflect the total number of applications at each status across my entire account

---

---

## 9.4 Funder Guideline Handling

---

### FR-21 — Must Have

**Requirement:** The system shall allow users to input funder guidelines by either pasting text directly or uploading a file in PDF or Microsoft Word format.

---

**AC-FR-21-01 — Pasted text accepted**

- **Given** I am on Step 2 of the application flow
- **When** I paste text into the guidelines textarea
- **And** I click "Continue"
- **Then** my guidelines are accepted
- **And** the application status updates to `in_progress`
- **And** I advance to Step 3 (AI Summary)

---

**AC-FR-21-02 — PDF file upload accepted**

- **Given** I am on Step 2 of the application flow
- **When** I upload a valid, text-based PDF file of 10MB or under
- **And** I click "Continue"
- **Then** the file is accepted
- **And** I advance to Step 3

---

**AC-FR-21-03 — Word (.docx) file upload accepted**

- **Given** I am on Step 2 of the application flow
- **When** I upload a valid .docx file of 10MB or under
- **And** I click "Continue"
- **Then** the file is accepted
- **And** I advance to Step 3

---

**AC-FR-21-04 — Large document warning displayed**

- **Given** I am on Step 2 of the application flow
- **When** I upload or paste a guidelines document that exceeds 100,000 tokens
- **Then** I see the warning: _"Your guidelines document is quite long. For the best results, we recommend uploading only the core sections — such as eligibility criteria, application questions, and assessment criteria. Very long documents may reduce the quality of your AI summary."_
- **And** I can still proceed with the full document without being blocked

---

**AC-FR-21-05 — Guidelines required before advancing to Step 3**

- **Given** I am on Step 2 of the application flow
- **When** I click "Continue" without uploading a file or entering any pasted text
- **Then** I am not advanced to Step 3
- **And** I am prompted to provide the guidelines

---

### FR-22 — Must Have

**Requirement:** Funder guideline text shall be retained for the life of the application it belongs to (cascade-deleting with that application, per `ADR-DATA-003`). Only extracted, page/section-tagged text is stored in Postgres — the raw uploaded PDF or Word file is never stored in Supabase Storage. (The original "or indefinitely where it backs an approved playbook" clause described a shared, curator-approved playbook concept superseded before build — see `ADR-DATA-006`'s 2026-07-14 amendment. `P6.5`'s reuse feature copies a fresh, independent, still application-scoped copy into each new application a charity chooses to carry it into, rather than one record living indefinitely.)

_Revised 2026-07-10 — see `ADR-DATA-002`'s "Revised Decision — 2026-07-10" section, which formally reverses this ADR's original 2026-04-17 "never store" decision (kept intact in that ADR for the historical record, not rewritten). The original claim that funder guidelines "may contain commercially sensitive information provided by the funder" was checked against the real corpus of funder documents Grant Pathway processes (`docs/Grant Org Guidelines/`; corrected 2026-07-13 — previously cited a stale "21-document" count) and found unsupported — these are funders' own publicly published application guidance, not confidential material._

**Partially built as of 2026-07-14 (GAP-33 fix) — retention itself now exists; the playbook-independence half does not.** New `application_guidelines` table (migration `20260714000001`) retains the extracted, marker-tagged guideline text per application, cascade-deleting with it — verified by direct SQL round-trip (RLS, insert, upsert-refresh, delete). AC-FR-22-01 and AC-FR-22-02 below are now confirmed built. AC-FR-22-03 (playbook-independent retention) is not — `P6.5` (playbook infrastructure) doesn't exist yet. **User-visible behaviour is unchanged**, per GAP-34: nothing in the UI shows or uses the retained text yet (that's `P6.4`), so from a user's perspective Step 2 still behaves exactly as AC-FR-22-04 describes, even though the underlying data is no longer discarded server-side.

---

**AC-FR-22-01 — Guideline text retained for the life of the application, not the raw file** _(confirmed built 2026-07-14 — GAP-33 fix)_

- **Given** I uploaded or pasted guidelines on Step 2
- **When** the guideline text is processed
- **Then** the extracted, page/section-tagged guideline text is stored in Postgres, linked to my application
- **And** the original uploaded PDF or Word file is never stored in Supabase Storage — only its extracted text is retained

---

**AC-FR-22-02 — Retained guideline text is deleted when its application is deleted** _(confirmed built 2026-07-14 — GAP-33 fix)_

- **Given** I have an application with retained guideline text
- **When** I delete that application (FR-19)
- **Then** the retained guideline text is cascade-deleted along with it, the same way `application_items` rows are (`app/api/account/delete/route.ts` deletes it explicitly, and the FK's `on delete cascade` covers it regardless)

---

**AC-FR-22-03 — Reused guideline text survives deletion of the application it was copied from** _(built 2026-07-14, `P6.5` — corrected from the original 2026-07-10 "approved playbook" version of this AC, permanently superseded)_

- **Given** a charity chose "start from your last application to [Funder]" (`P6.5`) when starting a new application, carrying that previous application's guideline text across
- **When** the original (source) application is later deleted
- **Then** the new application's own copy of the guideline text is unaffected — it is a full, independent copy, not a reference to the original
- **And** this relies on no shared, funder-wide "playbook" record — the original 2026-07-10 version of this AC described that concept, which was superseded before build (`ADR-DATA-006`'s 2026-07-14 amendment)

---

**AC-FR-22-04 — Current UI behaviour: the guidelines input area still appears empty on return, even though the text is now retained server-side** _(corrected 2026-07-14 — GAP-33 fix changed what's true underneath this AC; see GAP-34)_

- **Given** I uploaded or pasted guidelines during a previous session
- **When** I return to that application in a new session and navigate to Step 2
- **Then** the guidelines input area is empty, and the previously uploaded file or pasted text is not displayed or re-editable — `sessionStorage` (client-side) still discards it once the AI summary call returns
- **And** this is now misleading, not strictly accurate: as of 2026-07-14, the extracted text IS retained server-side (`application_guidelines`), and **since `P6.4` shipped that same day it is surfaced back to the user — in Step 4, through the citation badge and the "view original guidelines" panel.** What remains true is only the narrow statement above: the **Step 2 input area** is still not repopulated from the retained text, because `sessionStorage` discards its copy once the summary call returns. _Corrected 2026-08-06 (`GAP-32`) — this clause read "it simply isn't surfaced back to the user anywhere yet (`P6.4` builds the viewer that will)", written the same day P6.4 built it and never updated. `GAP-34` (the stale "not saved" UI copy) was resolved on 2026-07-25._

---

### FR-23 — Must Have

**Requirement:** The system shall display a plain-language error message if an unsupported file format is uploaded, and shall prompt the user to paste the text instead.

---

**AC-FR-23-01 — Unsupported file format rejected**

- **Given** I am on Step 2 of the application flow
- **When** I attempt to upload a file in an unsupported format (e.g. .xlsx, .pptx, .jpg, .txt)
- **Then** the file is rejected
- **And** I see the error: _"We can only accept PDF or Word (.docx) files. Check the funder's website for a version in one of these formats. If not, you can paste the key sections — such as eligibility criteria and application questions — into the text box below."_ (corrected 2026-07-10 to match live wording in `components/application-step2-form.tsx`)
- **And** I am not advanced to Step 3

---

**AC-FR-23-02 — File exceeding 10MB rejected**

- **Given** I am on Step 2 of the application flow
- **When** I attempt to upload a file larger than 10MB
- **Then** the file is rejected
- **And** I see the error: _"Your file is over 10MB. Some funders publish a shorter summary version of their guidelines — check their website first. If not, you can paste the key sections — such as eligibility criteria and application questions — into the text box below."_ (corrected 2026-07-10)
- **And** I am not advanced to Step 3

---

**AC-FR-23-03 — Scanned or image-based PDF rejected**

- **Given** I am on Step 2 of the application flow
- **When** I upload a PDF that contains only scanned images with no extractable text
- **Then** the file is rejected
- **And** I see the error: _"We couldn't read the text in your PDF — it looks like a scanned document rather than a digital one. Some funders also publish a Word version of their guidelines — check their website. If not, you can paste the key sections — such as eligibility criteria and application questions — into the text box below."_ (corrected 2026-07-10)
- **And** I am not advanced to Step 3

---

**AC-FR-23-04 — PDF exceeding 200 pages rejected** _(Added 2026-06-22)_

**Corrected 2026-07-10:** the specific message this AC previously quoted is never shown. Traced through the code (`lib/extract-text.ts` returns the generic `extraction_failed` reason for a >200-page PDF; `components/application-step2-form.tsx`'s error mapping has no case for `extraction_failed`, so it falls through to the generic `server` message, same as any other processing failure). Corrected below to match actual behaviour.

- **Given** I am on Step 2 of the application flow
- **When** I upload a PDF with more than 200 pages
- **Then** the file is rejected
- **And** I see the generic error: _"Something went wrong while processing your document. Please try again, or paste the guidelines text directly."_ — not a page-count-specific message
- **And** I am not advanced to Step 3

---

**AC-FR-23-05 — Extraction timeout handled gracefully** _(Added 2026-06-22)_

**Corrected 2026-07-10:** same issue as AC-FR-23-04 — `extraction_timeout` is not a case in the client's error mapping either, so it also falls through to the generic `server` message.

- **Given** I am on Step 2 of the application flow
- **When** I upload a file and text extraction takes longer than 30 seconds
- **Then** the upload is rejected
- **And** I see the generic error: _"Something went wrong while processing your document. Please try again, or paste the guidelines text directly."_ — not a timeout-specific message
- **And** I am not advanced to Step 3
- **And** no incomplete data is written to the database

---

---

## 9.5 AI Guideline Summarisation

---

### FR-24 — Must Have

**Requirement:** On user request, the system shall generate a plain-English summary of the funder's guidelines covering: funder priorities, types of projects funded, eligible organisations, evidence expectations, and a plain-language explanation of each application question.

---

**AC-FR-24-01 — Summary generation begins on arriving at Step 3**

- **Given** I have provided funder guidelines on Step 2 and clicked "Continue"
- **When** Step 3 loads
- **Then** the AI summary generation begins automatically
- **And** a staged progress indicator is shown while processing is underway
- **And** the "Continue" button is not available until the summary is complete

---

**AC-FR-24-02 — Summary covers all required content areas** _(corrected 2026-07-13 — two items were missing/wrong, and questions are not individually explained)_

- **Given** the AI summary has been generated on Step 3
- **When** I read the summary
- **Then** it includes:
  - What the grant is for
  - Grant amount, if stated (`summary.amount`)
  - Who can apply (eligible organisations)
  - What the funder is looking for (priorities and funded project types)
  - Key requirements (`summary.keyRequirements`) — not "key evidence expectations", the previous wording here
  - Each application question or section, shown **verbatim as extracted** with its word limit shown alongside where stated (`q.number`, `q.text`, `q.wordLimit`) — **not** a separate plain-English explanation per question; the previous version of this AC overstated what's built, matching the same correction already made in `PRD-Grant-Pathway.md` Section 6.5

---

**AC-FR-24-03 — Extracted application questions identified and counted**

- **Given** the AI summary has been generated
- **And** the guidelines contain identifiable application questions
- **When** I view Step 3
- **Then** I see a note in the format: _"We found [n] application questions in these guidelines. You'll answer each one in the next step."_ (corrected 2026-07-10 -- matched `components/application-step3-summary.tsx`; previously referenced "generate your draft answers," a holdover from the abandoned auto-draft model)
- **And** the extracted questions are listed within the summary

---

**AC-FR-24-04 — No questions found — fallback message shown**

- **Given** the AI summary has been generated
- **And** no specific application questions could be identified in the guidelines
- **When** I view Step 3
- **Then** I see the message: _"We couldn't identify specific application questions in this document. In the next step, you'll be able to enter your questions manually."_

---

**AC-FR-24-05 — Regenerate summary available**

- **Given** an AI summary is displayed on Step 3
- **When** I click "Regenerate summary"
- **Then** a new summary is generated from the same guidelines
- **And** this regeneration counts as one AI request against my monthly allowance

---

**AC-FR-24-06 — Truncation warning shown when guidelines were pre-processed** _(Added 2026-06-22)_

**Corrected 2026-07-14 — quote fixed to match the real component; mechanism note updated now that `P6.2a` has landed.** The message below is the real text in `components/application-step3-summary.tsx` (the previous quote, "only the most relevant sections were sent," incorrectly described relevance-based section selection — the actual mechanism is a first-portion character-ceiling cut, per the Section 9.5 2026-07-13 review finding). `PREPROCESS_CHAR_CEILING` truncation (`lib/preprocess-text.ts`) is now page/section-marker-aware as of `P6.2a` (2026-07-14) — it snaps back to the last complete `[PAGE N]`/`[SECTION: ...]` marker rather than the nearest newline, so a page/section is dropped in its entirety rather than left half-cut. This keeps a future citation (`P6.3` onward) from ever pointing at truncated-away content, but does **not** change the ceiling value (20,000 chars dev / 50,000 prod) or this warning's wording — both remain as below.

- **Given** I uploaded a guidelines document that was very long
- **And** the system pre-processed and truncated it before sending to the AI
- **When** the AI summary is displayed on Step 3
- **Then** I see an inline warning: _"Your guidelines document is very large and was partially summarised. The AI reviewed the first section of the document. If key questions or eligibility criteria appear near the end of the document, consider pasting the most relevant sections as text instead."_
- **And** the summary is still displayed in full

---

### FR-25 — Must Have

**Requirement:** AI summarisation shall use both the funder guidelines and the charity profile as inputs to the Claude API.

---

**AC-FR-25-01 — Summary is personalised to the charity's context**

- **Given** I have a completed charity profile
- **And** I have provided funder guidelines on Step 2
- **When** the AI summary is generated on Step 3
- **Then** the summary content is relevant to the type of work described in my charity profile
- **And** the summary addresses the actual content of the funder guidelines provided

---

**AC-FR-25-02 — Summary differs when charity profile content differs**

- **Given** two user accounts with different charity profiles using identical funder guidelines
- **When** each account generates an AI summary of those guidelines
- **Then** the two summaries are personalised to their respective charity profiles rather than being identical generic outputs

---

### FR-26 — Must Have

**Requirement:** The system shall display a visible progress indicator while AI processing is underway.

---

**AC-FR-26-01 — Staged progress messages shown during summary generation**

- **Given** I have arrived at Step 3 and summary generation is underway
- **When** I watch the screen during processing
- **Then** I see the first staged message: _"Reading your funder guidelines…"_
- **And** this transitions to _"Identifying key information…"_ partway through (added 2026-07-10 -- this AC previously omitted this middle stage, per `components/application-step3-summary.tsx`'s `LOADING_MESSAGES`)
- **And** this transitions to _"Almost there…"_ as processing nears completion

---

**AC-FR-26-02 — User cannot proceed during processing**

- **Given** the AI summary is being generated on Step 3
- **When** I view the screen
- **Then** the "Continue" button is not active or visible
- **And** I cannot advance to Step 4 until the summary is fully displayed

---

**AC-FR-26-03 — Progress indicator removed once summary is complete**

- **Given** the AI summary has finished generating
- **When** the summary is displayed on Step 3
- **Then** the progress indicator is no longer shown
- **And** the "Continue" button becomes available

---

### FR-27 — Must Have

**Requirement:** In the event of an API error or timeout, the system shall display a plain-language error message and allow the user to retry.

---

**AC-FR-27-01 — API error during summarisation — error message shown**

- **Given** I am on Step 3 and summary generation is underway
- **When** the Claude API returns an error or the request times out
- **Then** the progress indicator is replaced with the error message: _"We couldn't generate your summary right now. This is usually temporary — please try again."_
- **And** I see a "Try again" button
- **And** the application remains at `in_progress` status — no data is lost

---

**AC-FR-27-02 — Retry after API failure**

- **Given** an API error has occurred during summary generation
- **When** I click "Try again"
- **Then** the system makes a new attempt to generate the summary
- **And** the staged progress indicator is shown again during the retry

---

**AC-FR-27-03 — AI kill-switch — service unavailable on Step 3** _(Added 2026-06-29)_

- **Given** the AI service has been disabled via the `AI_ENABLED` kill-switch
- **When** I arrive at Step 3 and summary generation is attempted
- **Then** I see the message: _"The AI service is busy right now. Please try again in a moment."_ -- the same generic `overloaded` message as real overload, not a dedicated "temporarily unavailable" message (corrected 2026-07-10, matched `lib/ai-error-handler.ts`)
- **And** a "Try again" button is shown
- **And** no AI request is logged against my monthly allowance
- **And** the application remains at `in_progress` status — no data is lost

---

**AC-FR-27-04 — AI kill-switch — service unavailable on Step 4 AI assist** _(Added 2026-06-29)_

- **Given** the AI service has been disabled via the `AI_ENABLED` kill-switch
- **When** I click "Help me improve this" on a question card in Step 4
- **Then** an inline error is shown on that card: _"The AI service is busy right now. Please try again in a moment."_ -- same generic `overloaded` message, not dedicated (corrected 2026-07-10)
- **And** no AI request is logged against my monthly allowance
- **And** my existing answer is preserved

---

**AC-FR-27-05 — Second consecutive failure shows a different, non-retryable state** _(added 2026-07-13 — previously undocumented)_

- **Given** I clicked "Try again" after a first summary-generation failure on Step 3
- **When** that retry also fails
- **Then** the error message changes to: _"If this keeps happening, please try again later. Your work has been saved."_
- **And** no "Try again" button is shown — only a "Back" link to Step 2
- **And** the application remains at `in_progress` status with no data lost

---

---

## 9.6 Q&A Interview and Application Assembly

**Redesigned 2026-05-28.** The auto-generation model (AI writes everything on load) has been
replaced with a Q&A interview model. The charity writes all answer content; AI assists with
structure and clarity only on request. A final assembly step formats the charity's words into
the funder's required output. The old `/api/generate-draft` route is removed. See
`docs/Implementation Plan/archive/STEP4-REDESIGN-PROPOSAL.md` for the full design rationale.

---

### FR-28 — Must Have

**Requirement:** On arriving at Step 4 for the first time, the user shall see a preparation checklist before beginning the Q&A interview.

---

**AC-FR-28-01 — Preparation checklist shown on first entry to Step 4**

- **Given** I have completed Step 3 and clicked _"This looks right — continue"_
- **When** I arrive at Step 4 for the first time
- **Then** I see a preparation checklist before any questions are shown
- **And** the screen lists the financial documents I should gather before starting
- **And** there is a note: _"The financial sections cannot be completed by AI. It is worth involving a senior colleague before reaching the financial questions."_

---

**AC-FR-28-02 — Preparation checklist bypassed on return visits**

- **Given** I have previously passed the preparation checklist and started writing answers
- **When** I return to Step 4 (e.g. after navigating away and coming back)
- **Then** I go directly to the Q&A interface — the preparation checklist is not shown again

---

**AC-FR-28-03 — Q&A interface shows all questions from the Step 3 summary**

- **Given** I have clicked _"I have what I need — start writing"_ on the preparation checklist
- **When** I view the Q&A interface
- **Then** all questions extracted from the funder guidelines in Step 3 are shown
- **And** each question has an empty textarea where I can write my own answer from scratch

---

**AC-FR-28-04 — Free-form guidelines show narrative sections, now numbered like structured questions** _(Corrected 2026-07-16 — see note below)_

- **Given** this application's Step 3 AI summary classified the guidelines as free-form
- **When** I view the Q&A interface
- **Then** I see named narrative sections (e.g., "About your organisation", "Project description")
- **And** each section is prefixed with a sequential number, matching the treatment of structured questions and of governance items within either funder type
- **And** each section has a textarea for my own answer
- **And** each section shows its AI-extracted guidance text (`q.guidance`) where present, rather than a fixed static note

_Note (2026-07-16): this criterion previously read "no numbered questions" for free-form funders, matching the original design that only structured funders' Q&A cards were numbered. WJ live-tested Walton Charity (free-form) and asked for numbering to be extended to free-form sections too, for consistency with the same-day fix that added sequential numbers to governance items on structured funders. That review found the original "free-form is unnumbered narrative" premise pre-dated PDR-AI-008's governance facts (2026-07-15) — a governance item like "Are any of your trustees related to each other...?" reads as a discrete question regardless of the funder's own classification, not a narrative section title, so leaving it unnumbered inside a free-form funder's item list was inconsistent even before this request. `components/application-step4-draft.tsx`'s number span is no longer gated on `funderType === 'structured'` — every item in the ordered list gets a number, both funder types alike. See `AC-FR-31A-04`'s matching correction for the assembled draft._

_Note (2026-07-10): this criterion previously claimed a fixed static note is displayed -- *"This funder requires a flowing narrative document. Write naturally — the assembly step will format your answers into a coherent document."* This message does not exist anywhere in the codebase. The real per-section guidance is dynamic AI-extracted text (`q.guidance` in `components/application-step4-draft.tsx`), shown only when present and the section isn't a budget question -- there is no fixed narrative-document note. Separately, this criterion previously read "the Step 3 summary identified **the funder** as a free-form narrative funder", implying a stable trait of the funder itself. Per `ADR-DATA-006` and `docs/BRD plus decisions Mark Two/BRD-Grant-Pathway.md` (BD-08 note, confirmed 2026-07-04), the persistent funder-level "Structured"/"Narrative" badge (the `funders.funder_type` column, from `DR-FD-001`) was retired because it does not reflect a stable property of any funder. What actually drives this screen is a **per-application** classification derived dynamically from that application's own Step 3 AI summary (`applications.ai_summary.funder_type`) — corrected above accordingly. Separately, per `ADR-DATA-006` and moscow register FR-45: extraction is narrative-only in practice regardless of this classification — every extracted question defaults to `question_type = narrative`; the only other question-level distinction actually built is the `is_budget_question` flag (see FR-31, FR-45), not a broader structured/free-form question-type split._

---

**AC-FR-28-05 — Monthly limit warning shown when approaching limit**

- **Given** I have used 40 or more of my 50 monthly AI requests
- **When** I am on Step 4
- **Then** I see the soft warning banner: _"You've used most of your monthly AI allowance. 'Help me improve this' may not be available for all questions/sections."_ (corrected 2026-07-10 -- this AC previously quoted only the first sentence)

---

**AC-FR-28-06 — AI assist blocked when monthly limit is reached**

- **Given** I have used all 50 of my monthly AI requests
- **When** I am on Step 4
- **Then** all "Help me improve this" buttons are disabled
- **And** I see the message: _"You've reached your monthly AI limit. You can still write and edit your answers — AI writing assistance is unavailable until next month."_ (corrected 2026-07-10 -- previously claimed a specific reset date and a "get in touch" prompt, neither of which exist in `components/application-step4-draft.tsx`)
- **And** I can still write and save my own answers without restriction

---

**AC-FR-28-07 — Answers auto-saved on field blur**

- **Given** I am writing an answer on Step 4
- **When** I move focus away from the textarea (field blur)
- **Then** my answer is automatically saved to the database
- **And** no AI call is made — this is a pure database write

---

**AC-FR-28-08 — Progress indicators show answer status per question**

- **Given** I have started writing some answers but not all
- **When** I view the Q&A interface
- **Then** questions with a complete answer are shown in green
- **And** questions with a partial answer are shown in amber
- **And** questions not yet started are shown in grey

---

**AC-FR-28-09 — Preparation checklist shows funder-specific supporting documents** _(Added 2026-07-10)_

- **Given** the Step 3 AI summary extracted one or more supporting document categories for this funder
- **When** I arrive at the preparation checklist on first entry to Step 4
- **Then** I see a second checklist headed "[Funder name] also asks you to submit:" listing those categories, alongside the standing financial-prep checklist
- **And** if no supporting document categories were extracted, this second checklist is not shown

---

### FR-29 — Must Have

**Requirement:** Word limits extracted from the funder guidelines shall be displayed alongside each question, and answers shall display a word/character counter.

_Word limits are extracted automatically from the guidelines in Step 3 — they are not manually entered by the user._

_Priority corrected 2026-07-10: this FR was mislabelled "Should Have" in a previous version of this document. `docs/moscow-feature-register.md` §9.6 (row FR-29, "Revisions since initial publication" table) and `docs/PRD-Grant-Pathway.md` §6.6/Summary both record FR-29 as promoted to **Must Have** on 2026-05-28, once the charity-authored Q&A model made word/character limits integral to Step 4 rather than an optional extra. Corrected here to match both sources._

---

**AC-FR-29-01 — Word limit shown for each question that has one**

- **Given** a question has a word limit extracted from the funder guidelines
- **When** I view that question card on Step 4
- **Then** the word limit is displayed (e.g., "Max 300 words")

---

**AC-FR-29-02 — Word counter shown on each textarea**

- **Given** I am writing an answer on Step 4
- **When** I type in a textarea
- **Then** a word or character counter is displayed and updates as I type

---

**AC-FR-29-03 — Questions without word limits do not show a counter**

- **Given** a question has no word limit in the funder guidelines
- **When** I view that question card
- **Then** no word limit label is shown

---

**AC-FR-29-04 — Approve button hidden when answer exceeds word/character limit** _(Added 2026-06-04, D-LBF-02)_

- **Given** a question has a word or character limit
- **When** my answer exceeds that limit
- **Then** the "Approve this answer" panel and button are hidden
- **And** a red message is displayed: "Your answer exceeds the funder's word limit. Please trim it or use AI to bring it within the limit before approving."
- **And** the approve panel reappears as soon as the answer is brought back within the limit

---

**AC-FR-29-05 — Optional questions are excluded from the assembly gate** _(Added 2026-06-04, D-LBF-01/03; exception added 2026-07-16, see AC-FR-29-08)_

- **Given** a question is marked as optional — either by containing "(optional)" in its text or by beginning with "This question is optional"
- **When** I leave that question unanswered and unapproved
- **Then** the "Ready to assemble" button remains active (not greyed out)
- **And** the optional question shows an "Approve this answer" button even when empty, allowing the user to explicitly skip it
- **Unless** the item was added via the manual "Add a financial or governance detail" picker — see AC-FR-29-08, which is not skippable despite carrying the same "(optional)" text

---

**AC-FR-29-06 — Budget/financial questions over their limit get a deterministic trim, not the AI over-limit message** _(Added 2026-07-16, PDR-AI-007)_

- **Given** a question is flagged `is_budget_question` and its answer exceeds the funder's word or character limit
- **When** I view that question's card
- **Then** the "Help me improve this" AI-assist block (including AC-FR-29-04's narrative over-limit message, which references "use AI") is not shown for this question at all — it never was, since AI assist is disabled for budget/financial questions
- **And** instead I see: _"Your answer exceeds the funder's word/character limit. Please trim it — AI assist isn't available for financial figures, so this needs to be adjusted manually before approving."_ (wording matches the limit type — "word" or "character" — per the funder's `limitType`)
- **And** a "Trim to limit" button is shown alongside the message
- **When** I click "Trim to limit"
- **Then** my answer is mechanically cut to the last complete sentence that still fits within the limit — no AI/LLM call is made, and no figures, dates, or wording are altered by an AI
- **And** if even the first sentence alone exceeds the limit, the answer is instead hard-cut at the limit, snapped to the nearest word boundary so no word is left truncated mid-way
- **And** the "Approve this answer" panel and button remain hidden until the trimmed (or further manually edited) answer is within the limit, per AC-FR-29-04's existing gate

_Note (2026-07-16): this closes a gap first found live during Clothworkers Foundation testing (2026-07-04) and decided the same day as `PDR-AI-007`, formalised as a PDR on 2026-07-11 -- but never actually built. WJ re-discovered the exact same gap independently on 2026-07-16 while testing Henry Smith (a budget question, "If you have not raised all the money needed, what are your plans to do so?", 300-word limit, tested with a 503-word sample), not realising it had already been decided six days earlier. Confirmed via a repo-wide search that no trace of the decided message or "Trim to limit" button existed anywhere outside the PDR document itself -- the decision was never turned into a tracked implementation task in `IMPLEMENTATION-PLAN.md`/`IMPLEMENTATION-STATUS.md`, the same failure mode as `DR-FD-001`'s 2026-07-11 free-text-fallback amendment (also decided, never tracked, never built). Built exactly as `PDR-AI-007` specified: Option C (budget-specific message, no AI reference) + Option E (deterministic sentence-snap trim, no LLM call) -- Option F (AI assist scoped to budget questions) remains explicitly rejected for now._

---

**AC-FR-29-07 — "Trim to limit" also offered on ordinary narrative questions, alongside AI refine** _(Added 2026-07-16, PDR-AI-007 extension)_

- **Given** a non-budget narrative question's answer exceeds its word or character limit
- **When** I view that question's card
- **Then** I see the existing AC-FR-29-04 message and "Help me improve this" button, AND a "Trim to limit" button alongside them
- **When** I click "Trim to limit"
- **Then** my answer is mechanically cut the same way as AC-FR-29-06 describes for budget questions -- no AI/LLM call, last complete sentence within the limit, hard word-boundary cut as a fallback
- **And** clicking "Help me improve this" instead still behaves exactly as before (AC-FR-30 family) -- this is an additional option, not a replacement

_Note (2026-07-16): while testing the AC-FR-29-06 fix, WJ separately hit a non-budget narrative question over its limit and found "Help me improve this" declined to help at all -- correct behaviour, since the test answer was deliberately unrelated filler text and the refine prompt is instructed never to invent facts, but it left no way forward. Combined with `PDR-AI-006`'s already-documented finding that AI refine can undershoot and leave an answer still over limit, narrative questions had two known ways to leave a charity stuck, unlike budget questions which by this point always had a fallback. WJ agreed to extend the same deterministic trim as a secondary option here too. No new logic needed -- `trimToLimit()`/`handleTrimToLimit()` were already generic, keyed only on the question's limit type, never on `is_budget_question`._

---

**AC-FR-29-08 — A manually-added governance item is not exempt from the assembly gate** _(Added 2026-07-16)_

- **Given** a financial or governance item was added via the "Add a financial or governance detail" picker (`q.addedManually` true), not detected by the AI from the funder's guidelines
- **When** I leave it unanswered and unapproved
- **Then** the "Ready to assemble" button stays disabled, and the "Approve this answer" panel does not appear until an answer is entered — the item's `item_label` still carries the same "(optional)" suffix as the AI-detected form of the same fact, but that suffix is disregarded for the assembly gate once the item was added manually
- **And** this exception applies only to manually-added items — an AI-detected governance fact (with or without a citation) remains skippable-when-blank exactly as AC-FR-29-05 describes

_Note (2026-07-16): found live during Henry Smith testing — WJ ticked several governance facts via the manual-add picker, left them blank, and found "Ready to assemble" stayed active throughout, right up to reaching the senior-review gate with 5 blank added fields. Traced to `GOVERNANCE_ITEMS`' item_label carrying "(optional)" unconditionally (`lib/governance-items.ts`), written for the AI-auto-detected case per `PDR-AI-008` (a low-signal AI detection should never become a forced question for a novice user) but reused as-is for the manual-add path, where the opposite is true — the charity actively chose to add the item, so leaving it blank afterwards should not silently bypass approval. Fixed in `components/application-step4-draft.tsx`'s `allApproved` computation and its matching "show approve panel when empty" check, both now gated on `!q.addedManually` in addition to the existing "(optional)" text check. No database or `lib/governance-items.ts` change — the fix is entirely in how the existing `addedManually` flag (already used for the "Added by you" badge) is read._

---

**AC-FR-29-09 — A combined counter is shown when several free_form sections share one aggregate word limit** _(Added 2026-07-28, `PDR-AI-012`)_

- **Given** the funder's guidelines state a single word limit governing several extracted sections together (e.g. "keep your total response to 500 words"), rather than a limit on any one section individually
- **When** I view Step 4 for a free_form application
- **Then** none of the sections covered by that shared limit shows its own word-limit badge — instead, each shows a "Counts toward N-word total" badge
- **And** a combined counter is shown near the top of the page (alongside the approval progress bar), reading "Combined across `<count>` linked sections: `<live total>` / N words", updating live as I type in any of those sections
- **And** the combined counter turns amber near the limit and red once exceeded, but never disables "Approve this answer" or "Ready to assemble" — this is a soft nudge, not a hard block, matching how individual per-section/per-question limits already behave (AC-FR-29-04 only gates on a section's own stated limit, never on this aggregate one)
- **And** a section that carries its own separate stated word limit is excluded from the combined count and keeps its own individual badge and counter as before, unaffected by this feature

---

### FR-30 — Must Have

**Requirement:** The AI assist feature ("Help me improve this") shall improve the structure and clarity of the user's written answer without adding facts or changing the meaning.

---

**AC-FR-30-01 — "Help me improve this" button available on non-budget questions**

- **Given** I am viewing a non-budget question on Step 4
- **When** I view the question card
- **Then** I see a "Help me improve this" button

---

**AC-FR-30-02 — AI assist returns a structurally improved version of my answer**

- **Given** I have written an answer and clicked "Help me improve this"
- **When** the AI assist call completes
- **Then** I am shown a refined version of my answer alongside my original
- **And** the refined version does not contain facts, statistics, or claims not present in my original answer

---

**AC-FR-30-03 — I can choose to use the refined answer or keep my original**

- **Given** I have received a refined answer from the AI assist
- **When** I view the result
- **Then** I see both my original answer and the refined version
- **And** I can click "Use this improved version" to replace my answer with the refined text
- **And** I can click "Keep my original" to discard the refined version

---

**AC-FR-30-03A — Refined suggestion still over its limit shows an inline explanation** _(Added 2026-07-16, PDR-AI-006)_

- **Given** the question has a word or character limit
- **When** the AI's refined suggestion is itself still over that limit (LLMs cannot always hit an exact count when compressing)
- **Then** a message appears directly under the suggested text, naming the exact shortfall: _"This suggestion is still \[N\] words over the limit — AI can't always hit an exact word count. Check the counter and trim it further, or try again."_ (wording adapts "words"/"word count" to "characters"/"character count" per the funder's `limitType`, and pluralises correctly for a shortfall of exactly 1)
- **And** this message does not appear when the suggestion is within the limit — it is conditional, not a blanket disclaimer shown on every AI assist use
- **And** "Use this improved version" and "Keep my original" remain available regardless — the message is informational only, it does not block either action

_Note (2026-07-16): decided as `PDR-AI-006` on 2026-07-04 alongside the user-guide wording fix, but the in-app half of the decision sat unbuilt for 12 days — WJ raised it while testing the adjacent `PDR-AI-007` narrative-question trim extension and asked for it to be closed in the same pass._

---

**AC-FR-30-03B — Refine flags an answer that doesn't address the question, consistently regardless of word limit** _(Added 2026-07-17, PDR-AI-009)_

- **Given** I click "Help me improve this" on an answer that does not genuinely attempt to address the question (e.g. filler/placeholder text, boilerplate unrelated to the question, or content written for a different question)
- **When** the AI assist call completes
- **Then** I still see a refined version of my text — the AI never declines outright — but a clearly marked warning line appears at the top of the suggested text: "⚠️ This answer does not appear to address the question above — please check it carefully before approving."
- **And** this happens the same way whether my answer is over, under, or at the question's word/character limit — the warning's presence never depends on word count
- **And** a short, thin, or imperfect answer that is still a genuine attempt to address the question does NOT trigger the warning — it is not a quality or completeness check, only a relevance check
- **And** if I click "Use this improved version," the warning line is stripped before it is saved as my answer — it is never adopted as part of the application text itself
- **And** the "still over the limit" shortfall message (AC-FR-30-03A) is calculated on the suggestion text with the warning line excluded, so the warning's own length never inflates or falsely triggers that count

_Note (2026-07-17): WJ found "Help me improve this" declined outright on clearly irrelevant filler text when the answer was over its word limit, but passed the same content straight through unchanged when under limit — an emergent inconsistency, since `buildRefinePrompt()` had no relevance-check instruction at all before this fix; `DR-AI-003`'s human review checklist was the only actual safeguard. Two alternatives were considered and rejected: always declining outright (would need a new API/UI shape to represent "declined," not a prompt-only fix) and always polishing silently (removes the model's only existing signal, the opposite of WJ's "make it tighter" request). Built same day as decided; see `PDR-AI-009` for full rationale._

---

**AC-FR-30-04 — Using the AI assist counts as one AI request**

- **Given** I click "Help me improve this" for a question
- **When** the request completes successfully
- **Then** one AI request is added to my monthly usage count

---

**AC-FR-30-05 — Assembly formats the charity's answers without adding content**

- **Given** I have completed all questions and confirmed the senior review
- **When** the assembly API runs
- **Then** the assembled draft contains my words (or my AI-refined words where I chose to use them)
- **And** the assembly does not add facts, statistics, or claims not present in my answers

---

### FR-31 — Must Have

**Requirement:** Budget questions shall be visually distinct and the AI assist shall be disabled for them.

---

**AC-FR-31-01 — Budget questions are visually distinct** _(corrected 2026-07-13 — badge text was wrong)_

- **Given** a question is identified as a budget or financial question
- **When** I view that question card on Step 4
- **Then** the card has a distinct visual style — amber background and border, and a "Budget" badge (text label, no "£" symbol) — that differentiates it from non-budget questions

---

**AC-FR-31-02 — AI assist disabled on budget questions** _(corrected 2026-07-13 — quoted label text was wrong, and there are two variants)_

- **Given** I am viewing a budget question on Step 4
- **When** I look at the AI assist area on that card
- **Then** the "Help me improve this" button is not present
- **And** a warning label is displayed: for a structured funder, _"Budget questions must be completed using your own figures, as AI cannot assist you with this. Please ensure all numbers are accurate before proceeding."_; for a free-form funder, the same text with "Budget sections" in place of "Budget questions"

---

**AC-FR-31-03 — Assembly is gated by approval, not a budget-specific check** _(corrected 2026-07-13 — the quoted budget-specific message does not exist)_

- **Given** I have not approved every question, including any budget questions
- **When** I view the "Ready to assemble" button
- **Then** the button is disabled (not clickable) rather than showing an error on click
- **And** a tooltip reads: _"Approve all [N] questions/sections to continue"_ — the same generic message shown for any unapproved question, not a message specific to budget questions

---

### FR-31A — Must Have

**Requirement:** Before the final assembly, the user shall see a senior review prompt recommending they confirm that a senior colleague has reviewed the budget answers.

_Numbering note (2026-07-10): FR-31A is not present in the canonical FR-01 to FR-48 numbering used by `docs/moscow-feature-register.md` or `docs/PRD-Grant-Pathway.md` — both flag this as a gap in those documents (see `docs/PRD-Grant-Pathway.md`, note below the acceptance-criteria cross-reference), not something resolved here. It is kept as its own entry here, rather than folded into FR-30 or FR-31, because it is a real, built, separately-identified requirement: the screen exists in production (`components/application-step4-senior-review.tsx`, spec ref S6.7) and both that file and `actions/applications.ts` (`assembleAndAdvance()`) cite "AC-FR-31A" directly in code comments as the criteria the behaviour was built against. The four criteria below have been corrected to match what is actually implemented — the original three (AC-FR-31A-01 through -04) described a three-point checkbox-style prompt and a structured/free-form assembly split that do not match the shipped screen or the shipped `assembleAndAdvance()` logic. This is a judgement call: retiring the FR-31A label entirely was considered, but since it is already load-bearing in code comments, correcting its content in place was judged less disruptive than removing it and renumbering downstream FRs._

---

**AC-FR-31A-01 — Senior review prompt shown before assembly**

- **Given** I have answered all mandatory questions/sections and clicked "Ready to assemble" on Step 4
- **When** the senior review screen loads
- **Then** I see the heading _"Before we put it together"_
- **And** I see a prompt asking me to confirm that a senior colleague — such as my CEO, treasurer, or a trustee — has reviewed my budget answers
- **And** I see a supporting note explaining that inaccurate budget answers are a common reason grant applications are unsuccessful or withdrawn

---

**AC-FR-31A-02 — Assembly begins only after confirmation**

- **Given** I am viewing the senior review screen
- **When** I click _"Yes — assemble my draft"_
- **Then** the assembly action runs, formatting all answered questions into the application's `assembled_draft`
- **And** the application's `draft_status` is set to `assembled` and `current_step` advances to 5
- **And** I am redirected to Step 5

---

**AC-FR-31A-03 — Returning to editing from the senior review screen**

- **Given** I am viewing the senior review screen
- **When** I click _"Back to editing"_ instead
- **Then** the application's `draft_status` reverts to `in_progress`
- **And** I am returned to the Step 4 Q&A interface with no draft assembled

---

**AC-FR-31A-04 — Assembly formats each answered question under its numbered question or section text, verbatim**

- **Given** the assembly action runs
- **When** the `assembled_draft` is generated
- **Then** each answered question or section appears prefixed with its sequential number, followed by its question/section text, then the charity's own answer text, with entries separated by a divider
- **And** this applies uniformly — structured questions, free-form sections, and governance items alike, regardless of the application's Step 3 funder-type classification
- **And** unanswered questions are omitted from the assembled draft
- **And** no AI is used in this step — the charity's own words are reproduced exactly as written

_Note (2026-07-16): this criterion previously distinguished structured (numbered) from free-form (unnumbered) assembly. WJ asked for free-form numbering to be extended to match structured, for the same reason as `AC-FR-28-04`'s matching correction. `actions/applications.ts` `assembleAndAdvance()` no longer detects or branches on funder type at all — the entire "Detect funder type for assembly format" step was removed as dead code once both branches produced the same output; every answered item is now simply numbered by its position in the already-ordered list._

_Note (2026-07-10): this replaces the previous AC-FR-31A-03/04, which claimed free-form assembly produces "a coherent flowing narrative — not a Q&A list", distinct in kind from structured assembly. Per `actions/applications.ts` `assembleAndAdvance()`, both formats produce the same question-then-answer structure joined by the same `---` divider; the only actual difference was whether a number prefix is added (itself since removed — see the note above). This also corrects the earlier framing of "the funder is a structured/free-form funder" as an inherent funder trait — see the equivalent note on AC-FR-28-04 above; the same per-application, not per-funder, classification applies here._

---

---

## 9.7 Mandatory Review & Approval

---

### FR-32 — Must Have

**Requirement (corrected 2026-07-13):** Before the application content can be approved, the user shall be shown three plain-language confirmation checkboxes covering: having reviewed all responses in full, the information being accurate and complete, and accepting responsibility given the content was AI-assisted. _(Previously described three per-answer review "prompts" with invented text implying they were shown alongside each draft answer — neither the wording nor that per-answer structure exists in the codebase. Corrected to match `REVIEW_ITEMS` in `components/application-step5-approve.tsx`, which are shown once, together, at the top of Step 5 — the same three checkboxes FR-33 already refers to.)_

---

**AC-FR-32-01 — Three confirmation checkboxes displayed once at the top of Step 5**

- **Given** I have reached Step 5 (Review and approve) and have not yet approved the application
- **When** I view the page
- **Then** I see a panel headed _"Before you approve, please confirm:"_
- **And** it contains exactly three checkboxes:
  1. _"I have reviewed all responses in full and am satisfied with their content."_
  2. _"The information provided is accurate and complete to the best of my knowledge."_
  3. _"I understand that this application was prepared with AI assistance and accept full responsibility for all information submitted."_
- **And** all three are unchecked by default

---

**AC-FR-32-02 — Confirmation panel is shown before the download/approval action, and disappears once approved**

- **Given** I am on Step 5 and the application is not yet approved
- **When** I view the screen layout
- **Then** the confirmation checklist panel appears above the download buttons, before them in reading order
- **When** the application becomes approved (FR-33)
- **Then** the confirmation checklist panel is no longer shown — it is replaced by an approval status banner

---

### FR-33 — Must Have

**Requirement:** The system shall require explicit user approval before AI-generated content is saved to the application; this step cannot be bypassed.

---

**AC-FR-33-01 — Export not available until all checkboxes are ticked**

- **Given** I have draft answers on Step 4 and have advanced to Step 5
- **And** I have not yet ticked all three confirmation checkboxes
- **When** I view Step 5
- **Then** the _"Download as Word document"_ button is disabled
- **And** I cannot export the application content

---

**AC-FR-33-02 — Download triggers approval and export in a single action** _(Revised 2026-06-12: confirmation modal removed)_

- **Given** I am on Step 5 and have ticked all three confirmation checkboxes
- **When** I click _"Download as Word document"_ or _"Download as plain text"_
- **Then** the application status is set to `approved`
- **And** the download begins immediately with no intermediate confirmation modal

---

**AC-FR-33-03 — Application status set to approved on first download**

- **Given** I have ticked all three checkboxes and clicked a download button
- **When** the download completes
- **Then** the application status changes to `approved`
- **And** both download buttons remain enabled for subsequent exports

---

**AC-FR-33-04 — Approval cannot be bypassed by direct URL access**

- **Given** I have an in-progress application that has not been approved
- **When** I attempt to access the export function directly (e.g. via URL manipulation)
- **Then** the export is not available
- **And** I am required to complete the approval step first

---

### FR-34 — Must Have

**Requirement:** The user shall write their own answers in textareas on Step 4; writing does not consume AI credits.

_Note: Under the Q&A model, textareas start empty — the user writes from scratch. There is no AI-generated draft to edit. The "Help me improve this" AI assist (FR-30) is a separate optional action._

---

**AC-FR-34-01 — Answer textareas start empty**

- **Given** I have passed the preparation checklist and am on the Q&A interface
- **When** I view a question card for the first time
- **Then** the textarea is empty — there is no pre-filled AI-generated text

---

**AC-FR-34-02 — Written answers auto-saved and carried forward**

- **Given** I have written an answer on Step 4
- **When** the answer is auto-saved (on blur) and I later advance to Step 5
- **Then** the assembled draft reflects my written content

---

**AC-FR-34-03 — Writing answers does not consume an AI request**

- **Given** I am on Step 4
- **When** I type in any textarea and the answer is auto-saved
- **Then** this does not count as an AI request against my monthly allowance

---

### FR-35 — Must Have

**Requirement:** The user shall be able to clear and rewrite any answer at any time before assembly.

_Note: The "Regenerate all answers" action no longer exists. Users write their own content from scratch; there is no AI-generated content to regenerate._

---

**AC-FR-35-01 — User can clear and rewrite any answer**

- **Given** I have written an answer for a question on Step 4
- **When** I clear the textarea and type a new answer
- **Then** my new answer replaces the previous text
- **And** the updated answer is saved on blur

---

**AC-FR-35-02 — Answers can be updated any number of times before assembly**

- **Given** I have saved an answer for a question
- **When** I return to Step 4 before triggering assembly
- **Then** I can edit or replace my previous answer
- **And** the latest saved version is used for assembly

---

**AC-FR-35-03 — All answers (written or AI-assisted) treated equally at assembly**

- **Given** some of my answers were improved using the AI assist and some were not
- **When** I trigger assembly
- **Then** the assembly uses whichever version I chose (my original or the AI-refined version) for each question
- **And** there is no distinction in the assembled output between assisted and unassisted answers

---

### FR-36 — Must Have

**Requirement:** Approved content shall be visually marked as approved and saved to the application record.

---

**AC-FR-36-01 — Application card shows Approved status on dashboard**

- **Given** I have approved my application on Step 5
- **When** I navigate to `/dashboard`
- **Then** the application card displays a green _"Approved"_ status label

---

**AC-FR-36-02 — Approved status and content persist across sessions**

- **Given** I have approved my application
- **When** I sign out and sign back in
- **And** I return to the application from `/dashboard`
- **Then** all approved content is present
- **And** the application status remains `approved`

---

**AC-FR-36-03 — Re-opening an approved application requires confirmation and reverts status**

- **Given** I have an application with status `approved`
- **When** I open it from `/dashboard`
- **Then** I see the confirmation prompt: _"Re-opening this application will remove your approval. You will need to review and approve your answers again before you can export."_
- **And** on confirming, the application status reverts to `in_progress`
- **And** the export button is disabled until I complete the approval step again

---

**AC-FR-36-04 — Re-opening an exported application requires confirmation and reverts status**

- **Given** I have an application with status `exported`
- **When** I open it from `/dashboard`
- **Then** I see the same re-opening confirmation prompt
- **And** on confirming, the application status reverts to `in_progress`
- **And** I must complete the review and approval step again before I can export

---

**AC-FR-36-05 — Cancelling re-open leaves application unchanged**

- **Given** I am viewing the re-opening confirmation prompt for an approved or exported application
- **When** I click Cancel
- **Then** the application status and all content remain unchanged

---

---

## 9.8 Export

---

### FR-37 — Must Have

**Requirement:** The system shall allow users to export all approved application content as a Microsoft Word (.docx) file.

---

**AC-FR-37-01 — Word export button enabled after approval**

- **Given** my application has been approved and has status `approved` or `exported`
- **When** I view Step 5
- **Then** the _"Download as Word document"_ button is enabled and available

---

**AC-FR-37-02 — Word document downloaded successfully**

- **Given** my application has been approved
- **When** I click _"Download as Word document"_
- **Then** a .docx file is downloaded to my device
- **And** the file contains all approved application content

---

**AC-FR-37-03 — Exported document contains the correct structure**

- **Given** I have downloaded the Word document
- **When** I open the file
- **Then** it contains, in order:
  - The document title and grant name
  - The funder name
  - The date exported
  - An AI disclaimer
  - The Q&A body — each question followed by its approved answer
  - A footer: _"Prepared using Grant Pathway v[version number] — grantpathway.org.uk"_, plus a page number ("Page N of NN", added 2026-07-02 — see PDR-DH-003)

---

**AC-FR-37-03A — The date exported is the same across every export, format, and re-download** _(Added 2026-07-17)_

- **Given** an application has been exported at least once, in either format
- **When** I download the Word document and the plain text file, whether in the same session or on a later visit
- **Then** both show the identical "Date:" — the timestamp of this application's very first export, not the moment of each individual download
- **And** this is distinct from the re-export warning's date (AC-FR-37-05), which correctly always shows the most recent export instead

_Note (2026-07-17): WJ found a .txt export and a .docx export of the same application showed dates 2 minutes apart, since `exportDate` was previously computed live via `new Date()` on every request. Fixed with a new `applications.first_exported_at` column, set once and never overwritten. See `PDR-DH-003` revision history._

---

**AC-FR-37-04 — Application status set to exported on first download**

- **Given** my application has status `approved`
- **When** I download the Word document for the first time
- **Then** the application status changes to `exported`
- **And** the dashboard card shows the Teal _"Exported"_ status label

---

**AC-FR-37-05 — Re-export warning shown on subsequent downloads**

- **Given** my application has status `exported`
- **When** I click _"Download as Word document"_ again
- **Then** I see the re-export warning (titled "Download again?"): _"You last exported this application on [date]. If you have already submitted that version to the funder, please contact them if you intend to submit a revised version — funders may treat multiple submissions as separate applications."_ (corrected 2026-07-10 to match `application-step5-approve.tsx`)
- **And** I am presented with _"Download anyway"_ and _"Cancel"_ actions
- **And** the date shown in the warning is the date of the most recent previous export

---

**AC-FR-37-06 — Re-export proceeds on confirmation**

- **Given** I am viewing the re-export warning
- **When** I click _"Download anyway"_
- **Then** the .docx file is downloaded
- **And** the application status remains `exported`

---

**AC-FR-37-07 — Re-export cancelled — no download occurs**

- **Given** I am viewing the re-export warning
- **When** I click _"Cancel"_
- **Then** no file is downloaded
- **And** I remain on Step 5 with all content unchanged

---

### FR-38 — Should Have

**Requirement:** The system shall allow users to export all approved application content as a plain text (.txt) file.

**Confirmed built (2026-07-10)** -- live in `app/api/export/[applicationId]/route.ts` and `components/application-step5-approve.tsx`. The criteria below are not conditional; this note previously read "these criteria apply only if FR-38 is implemented in v1," which understated what's actually shipped.

---

**AC-FR-38-01 — Plain text export available after approval**

- **Given** my application has been approved
- **When** I view Step 5
- **Then** a plain text download option is available alongside the Word document download

---

**AC-FR-38-02 — Plain text file downloaded successfully**

- **Given** my application has been approved
- **When** I click the plain text download option
- **Then** a .txt file is downloaded to my device
- **And** the file contains all approved application content

---

**AC-FR-38-03 — Plain text export follows same approval and status rules**

- **Given** my application has status `approved`
- **When** I download the plain text file for the first time
- **Then** the application status changes to `exported` if it is not already
- **And** subsequent plain text downloads show the re-export warning, consistent with AC-FR-37-05

---

### FR-39 — Must Have

**Requirement:** The system shall prevent export where no content has been approved, and shall display a prompt directing the user to complete at least one review step.

---

**AC-FR-39-01 — Export button disabled before approval**

- **Given** my application has not yet been approved (status is `not_started` or `in_progress`)
- **When** I view Step 5
- **Then** the _"Download as Word document"_ button is disabled
- **And** I cannot download the application content

---

**AC-FR-39-02 — Prompt shown directing user to complete approval**

- **Given** I am on Step 5 with an unapproved application
- **When** I view the disabled export button
- **Then** I see a prompt directing me to review and approve my answers before exporting

---

**AC-FR-39-03 — Export remains blocked until approval is explicitly confirmed**

- **Given** I have draft answers on Step 4 but have not yet ticked all three confirmation checkboxes on Step 5
- **When** I view the export buttons on Step 5
- **Then** the buttons remain disabled regardless of how many answers have been drafted or edited
- **And** only ticking all three checkboxes enables the export buttons

---

---

## 9.9 Account Deletion

---

### FR-40 — Must Have

**Requirement:** The system shall allow users to permanently delete their account from Account Settings.

---

**AC-FR-40-01 — Account deletion option available in account settings**

- **Given** I am a signed-in user on `/account`
- **When** I view my account settings
- **Then** I can see a _"Delete my account"_ button in the delete account section
- **And** the button is styled as a destructive action in red

---

**AC-FR-40-02 — Delete button navigates to confirmation screen**

- **Given** I am on `/account`
- **When** I click _"Delete my account"_
- **Then** I am taken to `/account/delete`

---

**AC-FR-40-03 — Deletion confirmation screen accessible to authenticated users only**

- **Given** I am not signed in
- **When** I attempt to navigate directly to `/account/delete`
- **Then** I am redirected to `/`

---

### FR-41 — Must Have

**Requirement:** Before deletion, the system shall display a plain-language warning explaining that all data will be permanently and irreversibly deleted.

---

**AC-FR-41-01 — Warning shown on the account settings page**

- **Given** I am on `/account`
- **When** I view the delete account section
- **Then** I see the warning: _"Deleting your account will permanently remove all your data, including your charity profile and saved applications. This cannot be undone."_

---

**AC-FR-41-02 — Full warning shown on the deletion confirmation screen** _(corrected 2026-07-13 — quoted text was wrong)_

- **Given** I am on `/account/delete`
- **When** I view the page
- **Then** I see the warning: _"**This cannot be undone.** Deleting your account will permanently remove all your data from Grant Pathway."_

---

**AC-FR-41-03 — Plain list of deleted data shown on confirmation screen** _(corrected 2026-07-13 — wrong count, wording, and order; "uploaded funder guidelines" doesn't exist as a list item — consistent with FR-22, guidelines are not stored anywhere under the current model)_

- **Given** I am on `/account/delete`
- **When** I view the page
- **Then** I see a plain list headed _"The following will be permanently deleted:"_ with exactly three items:
  - _Your charity profile_
  - _All your grant applications and AI-generated content_
  - _Your account and login details_

---

### FR-42 — Must Have

**Requirement:** The user shall be required to confirm deletion by re-entering their email address.

_Note: the screen requirements specify that the user must type the word DELETE (uppercase, case-sensitive) rather than re-entering their email address. The screen requirements take precedence and the acceptance criteria below reflect the implemented behaviour._

---

**AC-FR-42-01 — DELETE confirmation input shown (corrected 2026-07-13 -- see AC-FR-42-02/03)**

- **Given** I am on `/account/delete`
- **When** I view the page
- **Then** I see a text input labelled: _"Type DELETE to confirm"_
- **And** the _"Permanently delete my account"_ button is present and enabled

---

**AC-FR-42-02 — Submitting with DELETE typed exactly proceeds (corrected 2026-07-13 -- confirmed against `components/delete-account-form.tsx`: the button is always enabled, not disabled/enabled by input state)**

- **Given** I am on `/account/delete`
- **When** I type the exact string `DELETE` (all uppercase) in the confirmation input and click _"Permanently delete my account"_
- **Then** the deletion request proceeds

---

**AC-FR-42-03 — Submitting with any other input shows an inline error, not a disabled button (corrected 2026-07-13)**

- **Given** I am on `/account/delete`
- **When** I click _"Permanently delete my account"_ after typing anything other than the exact string `DELETE` (e.g. `delete`, `Delete`, `DELET`, or leaving it blank)
- **Then** the deletion request does not proceed
- **And** I see an inline error: _"Please type DELETE in capitals to confirm."_

---

**AC-FR-42-04 — Cancel returns to account settings with no changes**

- **Given** I am on `/account/delete`
- **When** I click _"Cancel"_
- **Then** I am returned to `/account`
- **And** my account and all data remain unchanged

---

### FR-43 — Must Have

**Requirement:** On confirmation, the system shall permanently delete: the user account, charity profile, all saved applications, and all AI-generated content associated with that account.

---

**AC-FR-43-01 — All associated data permanently deleted on confirmation**

- **Given** I am on `/account/delete`
- **And** I have typed `DELETE` in the confirmation input
- **When** I click _"Permanently delete my account"_
- **Then** the following are permanently and irreversibly deleted:
  - My user account and login credentials
  - My charity profile
  - All saved applications and their content (draft answers and approved answers)
  - Any AI usage records associated with my account

---

**AC-FR-43-02 — Session ended immediately after deletion** _(corrected 2026-07-13 — quoted message was incomplete)_

- **Given** my account deletion has completed
- **Then** my current session is ended immediately
- **And** I am redirected to `/` with the inline message: _"Your account has been deleted. We've sent you a confirmation email."_

---

**AC-FR-43-03 — Deleted account cannot be used to sign in**

- **Given** my account has been deleted
- **When** I attempt to sign in with the email address and password of the deleted account
- **Then** I see the standard sign-in error: _"Your email address or password is incorrect. Please try again."_
- **And** I am not signed in

---

**AC-FR-43-04 — Re-registering with the same email starts a completely fresh account**

- **Given** my account has been deleted
- **When** I register a new account using the same email address
- **Then** no data from the deleted account is present
- **And** the new account begins with no charity profile and no applications

---

### FR-44 — Should Have

**Requirement:** The system shall send a confirmation email to the user once deletion is complete.

**Confirmed built (2026-07-10)** -- live in `app/api/account/delete/route.ts` via `lib/emails/account-deleted-user.ts`, sent on every deletion. The criteria below are not conditional; this note previously read "these criteria apply only if FR-44 is implemented in v1," consistent with `acceptance-criteria.md`'s own Status table already marking this section "✅ Complete."

---

**AC-FR-44-01 — Confirmation email sent after deletion**

- **Given** I have completed the account deletion flow
- **When** the deletion is processed
- **Then** I receive a confirmation email (Email 5) at my former registered email address
- **And** the email subject is: _"Your Grant Pathway account has been deleted"_

---

**AC-FR-44-02 — Confirmation email content is correct**

- **Given** I have received the account deletion confirmation email
- **When** I read the email
- **Then** it confirms that my account has been permanently deleted
- **And** it confirms that all associated data has been removed
- **And** it includes a _"Create a new account"_ link for users who wish to use Grant Pathway again in the future _(corrected 2026-07-10 -- previously said "Register a new account"; verified against `lib/emails/account-deleted-user.ts`)_

---

---

## 9.10 Question Typing, Funder Coverage & Eligibility Mismatch

_Added 2026-07-10. FR-45 to FR-47 were introduced into `docs/moscow-feature-register.md` and `docs/PRD-Grant-Pathway.md` between 2026-05-29 and 2026-06-02 but this document had not yet been updated with real acceptance criteria for them. The criteria below were written from a direct check of the live codebase (`app/`, `components/`, `lib/`, `supabase/migrations/`) against each FR's requirement text, not assumed from the requirement alone._

---

### FR-45 — Must Have

**Requirement:** Each extracted application question shall carry a `question_type` of `narrative`, `data_entry`, `financial`, `dropdown`, `date`, or `file_upload`, driving different handling per type — narrative questions show a writing card; data-entry and financial questions are pre-filled from the charity profile; dropdown, date, and file_upload questions are displayed as read-only reminders only.

**Not built as originally specified — see `docs/moscow-feature-register.md` FR-45 and `ADR-DATA-006` (2026-07-05).** Verified directly against `lib/prompts.ts`: the extraction prompt instructs the AI to extract "ONLY... questions that require a NARRATIVE TEXT answer" and explicitly lists data-entry fields, dropdown/selection questions, number fields, file-upload instructions, and consent questions as items that must NOT be extracted. `docs/data-model.md`'s `application_answers.question_type` column defaults to `narrative` "for backwards compatibility" — in practice no other value is ever produced. The only question-level distinction that is actually built and enforced is the boolean `is_budget_question` flag (amber styling, AI assist disabled — see FR-31). The criteria below describe the behaviour genuinely implemented today; they do not describe the multi-type `question_type` system as originally specified, which `ADR-DATA-006`'s item-graph model is intended to eventually replace it with (not yet built — see that ADR's Consequences).

---

**AC-FR-45-01 — Every extracted question defaults to narrative type**

- **Given** the AI has extracted application questions or sections from the funder guidelines on Step 3
- **When** the questions are saved to `application_answers`
- **Then** every row is saved with `question_type = narrative`
- **And** no row is ever saved with `question_type` of `data_entry`, `financial`, `dropdown`, `date`, or `file_upload`

---

**AC-FR-45-02 — Non-narrative fields are silently discarded, not shown as reminders**

- **Given** the funder's guidelines contain non-narrative fields (e.g. a dropdown for region, a date field, a file-upload instruction, a consent checkbox)
- **When** the AI summary is generated on Step 3
- **Then** those fields do not appear anywhere in the Q&A interface on Step 4 — neither as a writing card, a pre-filled field, nor a read-only reminder
- **And** nothing in the app indicates to the user that those fields exist in the original guidelines

---

**AC-FR-45-03 — Budget questions are distinguished by the `is_budget_question` flag, not a separate question type**

- **Given** an extracted question concerns budget, income, expenditure, or funding breakdown
- **When** the question is saved
- **Then** it is still saved with `question_type = narrative`
- **And** `is_budget_question` is set to `true`, which drives the amber styling and disabled AI assist described in FR-31 — this is the only per-question behavioural split that is actually built

---

### FR-46 — Won't Have (v1) — Withdrawn 2026-07-11

**Requirement (as originally specified, now withdrawn):** The system shall display a three-tier funder coverage model to the user: Tier 1 (Full) — narrative questions with profile pre-fill; Tier 2 (Partial) — a narrative subset of a portal form; Tier 3 (Guidance) — a free-form narrative document. The coverage tier shall be shown on the new-application screen, the Step 3 summary card, and the export screen.

**Withdrawn — not a build gap, a retired requirement.** Per `docs/moscow-feature-register.md` FR-46 (Won't Have (v1), withdrawn 2026-07-11) and BD-07 (BRD Section 10): the three-tier model assumed coverage level is a stable property of a funder, and that premise was disproven — the same funder can be fully or partially supported depending on which specific guidelines document is uploaded for a given application (see BD-04/BD-08), not the funder's identity. A static per-funder tier badge would repeat the exact mistake the retired "Structured/Narrative" badge made (`DR-FD-001` v1.0 → v1.2). Never built since being added 2026-05-29; a direct search of `app/`, `components/`, and `lib/` for "tier", "Tier 1/2/3", or "Full/Partial/Guidance coverage" returns no matches, and the `funders` table (`supabase/migrations/20260601000000_add_funders_table.sql`) has no tier or coverage-level column. Charities are no worse off — no such display has ever existed. The criteria below (AC-FR-46-01 to 03) describe the withdrawn requirement and are retained only for the historical record — they are not target behaviour and will not be built; test plans should not report against them at all.

---

**AC-FR-46-01 — Coverage tier shown on the new-application screen** _(withdrawn requirement — will not be built)_

- **Given** I am on Step 1 selecting a funder from the picker
- **When** I select a funder
- **Then** the funder's coverage tier (Tier 1 Full / Tier 2 Partial / Tier 3 Guidance) is shown alongside the selected funder

---

**AC-FR-46-02 — Coverage tier shown on the Step 3 summary card** _(withdrawn requirement — will not be built)_

- **Given** the AI summary has been generated on Step 3
- **When** I view the summary card
- **Then** I see the funder's coverage tier displayed, with a plain-language explanation of what that tier means for my application

---

**AC-FR-46-03 — Coverage tier shown on the export screen** _(withdrawn requirement — will not be built)_

- **Given** I am on Step 5 with an approved application
- **When** I view the export screen
- **Then** I see the funder's coverage tier displayed alongside the export options

---

**AC-FR-46-04 — No tier concept is exposed anywhere in the current build** _(reflects actual, and now permanent, behaviour)_

- **Given** I use Grant Pathway as it exists today, on any screen
- **When** I look for any mention of coverage tiers, "Tier 1/2/3", or "Full/Partial/Guidance coverage"
- **Then** I do not find one anywhere — the new-application screen, Step 3 summary card, and export screen show no tier or coverage-level indicator of any kind

---

### FR-47 — Must Have

**Requirement:** On Step 3, if the AI detects a clear mismatch between the charity's profile and the funder's eligibility criteria, the system shall display a hard stop: a red warning card, with the Continue button hidden.

**Confirmed built** — verified directly in `components/application-step3-summary.tsx`, `lib/prompts.ts`, and `actions/applications.ts`.

---

**AC-FR-47-01 — Eligibility mismatch warning shown on Step 3**

- **Given** I have a completed charity profile and have provided funder guidelines
- **When** the AI summary is generated on Step 3 and detects a clear, unambiguous mismatch between my charity's stated work and the funder's eligibility criteria
- **Then** I see a red warning card headed _"Eligibility mismatch — this application cannot proceed"_
- **And** a plain-language explanation is shown covering what the funder specifically supports, what my charity does, and why the two do not align
- **And** the "Continue" button is not shown

---

**AC-FR-47-02 — Acknowledging the mismatch sets a terminal status**

- **Given** I am viewing the eligibility mismatch warning on Step 3
- **When** I acknowledge the warning
- **Then** my application's status is set to `mismatch`
- **And** I am returned to `/dashboard`
- **And** the application card shows the _"Ineligible"_ status label

---

**AC-FR-47-03 — No override path exists**

- **Given** my application has status `mismatch`
- **When** I attempt to continue or re-open that application
- **Then** I cannot advance it to Step 4 or beyond
- **And** the only route forward is to correct my charity profile and start a new application

---

**AC-FR-47-04 — Mismatch is not flagged for borderline or partially-aligned cases**

- **Given** my charity's profile only partially aligns with the funder's focus, or the charity might plausibly qualify
- **When** the AI summary is generated
- **Then** `eligibilityMismatch` is not set to true
- **And** I am not blocked from proceeding to Step 4

---

**AC-FR-47-05 — A mismatch verdict is confirmed before the hard stop is shown (`PDR-AI-011`)**

- **Given** the first AI summary call returns `eligibilityMismatch: true`
- **When** the system issues a second, identical confirmation call
- **Then** the red warning card and hard stop are only shown if the second call also reports a mismatch
- **And** if the second call disagrees, the warning is not shown and I proceed to Step 4 as if no mismatch had been detected
- **And** if the second call fails outright (error or unparseable response), the first call's verdict is trusted unchanged

---

---

## 9.11 Guideline Source-Reference (Citations)

_Added 2026-07-10. FR-48 was introduced the same day this section was added — `PDR-DH-004` and `ADR-DATA-007` formalise the "Option 2" design and architecture; `ADR-DATA-006` hosts the citation field in the item-graph schema. **Updated 2026-07-14:** `P6.2a`, `P6.3`, GAP-33 (guideline-text retention), and `P6.4` (first milestone) have all landed the same day — citations are now genuinely visible to a user on Step 4. `P6.5` (human curator confirmation) has not started. Extracted-question citations (AC-FR-48-02/03) are now confirmed built; summary-bullet citations (AC-FR-48-01) and curator confirmation (AC-FR-48-04) remain target behaviour. **Updated 2026-07-21:** live-testing the Wolfson Foundation's guidelines found zero citations were ever produced — its docx has no real Word heading styles (plain "Normal"-style paragraphs only) and no page structure, so neither marker type the citation mechanism relied on was ever present. A third marker/citation type, `[ITEM N]`/`source_type: 'item'`, was built as a fallback for exactly this case — see `ADR-DATA-007`'s 2026-07-21 amendment._

### FR-48 — Must Have

**Requirement:** Each AI summary bullet, eligibility criterion, and extracted question shall carry a citation to a specific page (PDF), heading/section (docx, pasted text), or — when a guideline has neither page nor heading structure to anchor to — a numbered item of the funder's guidelines. A "view original guidelines" panel shall let the user click a citation to jump to and highlight the cited location.

**Partially built as of 2026-07-14, extended 2026-07-21 — extracted questions carry and display citations; summary bullets and curator confirmation do not yet.** `P6.2a` tags extraction with `[PAGE N]`/`[SECTION: A > B]` markers; `P6.3` asks the AI for a validated citation per question/section, written into `application_items.guideline_reference`; GAP-33 retains the marker-tagged text those citations were validated against (`application_guidelines`); `P6.4` (first milestone) makes it all visible — Step 4 shows a clickable badge (e.g. "Page 5") next to any question with a citation, opening a "view original guidelines" panel that highlights the cited quote in the retained text. **Corrected the same day:** this panel is a plain text panel, not a canvas-rendered PDF as three ADRs (`ADR-SEC-004`, `ADR-DATA-007`, `ADR-OPS-006`) originally assumed — only text is ever retained, never the raw file. **2026-07-21 fix:** live-testing the Wolfson Foundation's guidelines found zero citations were ever produced for it — its docx has no real Word heading styles and no page structure, so it carried no marker of either existing type at all. A third marker/citation type, `[ITEM N]`/`source_type: 'item'`, was added as a fallback used only when a document has neither page nor heading structure — see `ADR-DATA-007`'s 2026-07-21 amendment. **Still not built:** the Step 3 summary bullets (`aboutGrant`/`whoCanApply`/`lookingFor`/`keyRequirements`) are not citation-tagged at all (confirmed out of scope for `P6.3`'s first milestone) — this remains an open, unscheduled gap. **Permanently superseded, not pending:** a human curator confirmation step will not be built — `P6.5` (built 2026-07-14) turned out to be a private, per-charity reuse feature rather than a shared, curated playbook; see `ADR-DATA-007`'s 2026-07-14 amendment. Automated marker-validation (`P6.3`) remains the only guard against a hallucinated citation.

---

**AC-FR-48-01 — Summary bullets carry a page/section citation** _(target behaviour — not built)_

- **Given** the AI has generated a guideline summary on Step 3
- **When** I view a summary bullet
- **Then** it is shown alongside a citation to the specific page (PDF) or heading/section (docx, pasted text) of the guidelines it was drawn from
- **And** the citation references a chunk of guideline text that structurally exists — never a free-typed page number with no guarantee of correctness

---

**AC-FR-48-02 — Extracted questions carry a page/section/item citation** _(confirmed built 2026-07-14 — P6.4 first milestone; item fallback added 2026-07-21)_

- **Given** the AI has extracted application questions from the funder guidelines
- **When** I view a question on Step 4
- **Then** it is shown alongside a small citation badge (e.g. "Page 5", a heading trail for docx/pasted-text sources, or "Item 3 of the guidelines" when the source guideline has no page or heading structure at all) naming the specific location of the guidelines it was drawn from
- **And** no badge appears if the AI didn't offer a citation, or its citation failed validation against the real tagged markers (`P6.3`) — silently, not as an error

---

**AC-FR-48-03 — "View original guidelines" panel jumps to and highlights the cited location** _(confirmed built 2026-07-14 — P6.4 first milestone)_

- **Given** I am viewing a question with a citation badge on Step 4
- **When** I click the badge
- **Then** a "view original guidelines" panel opens, showing the retained guideline text (`application_guidelines`, GAP-33) in a scrollable panel
- **And** the panel scrolls to and highlights the specific cited quote, if it's found verbatim in the retained text — if not found, the full text is still shown, just without a highlight (a graceful degradation, not an error)
- **Note:** rendered as a plain text panel, not a rendered image of the original PDF page — only extracted text is ever retained (`ADR-DATA-002`), never the raw file, so there is nothing to render a page image from

---

**AC-FR-48-04 — A human curator has confirmed the citation before it reaches an application** _(permanently superseded, not pending — corrected 2026-07-14)_

- This criterion described a shared, curator-approved playbook concept that was designed but never built — see `ADR-DATA-006`'s and `ADR-DATA-007`'s 2026-07-14 amendments
- **What's built instead:** every citation is validated against a real structural marker in the guidelines (`P6.3`, `validateCitation()`) — there is no additional human-confirmation step, and none is planned
- This applies uniformly whether an application's questions were freshly extracted or carried across via `P6.5`'s "start from your last application" reuse feature — no application's citations are ever curator-reviewed

---

**AC-FR-48-05 — Summary bullets carry no source reference, and no citation is ever human-curated** _(reflects actual 2026-07-14 behaviour, corrected from the original 2026-07-10 version of this AC)_

- **Given** I use Grant Pathway as it exists today
- **When** I view the Step 3 summary bullets (about this grant, who can apply, what they're looking for, key requirements)
- **Then** I find no citation or page/section reference on any of them — only extracted questions on Step 4 carry one, and this remains an open, unscheduled gap
- **And** no citation is ever confirmed or corrected by a human curator, permanently, not just for now — every citation shown is validated only against real structural markers (`P6.3`), never against a curator's review; see AC-FR-48-04

---

## 9.12 Help Centre Link & Contextual Tooltips

_Added 2026-07-25. `PDR-UI-008` (help centre link + contextual tooltips) was built 2026-07-24 without corresponding acceptance criteria being written at the time; live testing was deliberately completed first (`docs/Test Plans/help-and-tooltips-test-plan.md`) since it surfaced a design reversal (dismissed-state persistence removed, see PDR v3.0) that would otherwise have required rewriting these criteria a second time._

### FR-49 — Should Have

**Requirement:** The system shall provide a persistent link to an external help centre, and contextual in-app tooltips at known points of friction.

**Confirmed built (2026-07-24, `PDR-UI-008`; simplified 2026-07-25, v3.0).** 10 of 11 spec'd tooltips built (`tt-register-password` skipped as redundant with an existing permanent hint on the Register page). No dismissed-state persistence — every tooltip is a plain hover/focus hint shown identically every time, for every user, with no memory and no dismiss control.

---

**AC-FR-49-01 — Help centre link present in all four locations, opens in a new tab**

- **Given** I am on any page of the application, signed in or signed out
- **When** I look for a way to get help
- **Then** I find a "Help" link in the relevant navigation (public nav when signed out, authenticated nav when signed in), in the global footer, and — when signed in with zero applications — in the dashboard empty-state copy
- **And** clicking any of these links opens the help centre in a **new browser tab**, leaving the Grant Pathway tab untouched
- **And** _(added 2026-08-06, `GAP-45`)_ the **authenticated nav** link opens the help page for the screen I am on — Step 4 opens "Writing and editing an answer", Step 2 opens "Uploading funder guidelines", and so on — falling back to the help centre root on any screen with no page of its own
- **And** the footer and dashboard empty-state links continue to open the **root**, deliberately: they are general-purpose, whereas the nav button means "help me with _this_ screen"

**Note on the deep-link map (`GAP-45`, built 2026-08-06).** Every route→page pair lives in `ROUTE_HELP_PAGES` in `lib/help-centre.ts`, and all eight targets were fetched live and confirmed to resolve before the mapping was written. **The residual risk is not in this codebase:** the help centre is an external GitBook, so a page renamed there silently 404s one route's Help button, nothing in CI can detect it, and no runtime fallback is possible because a GitBook 404 is invisible to the app. `help-and-tooltips-test-plan.md` HT-06 is the only check that catches it, and is a standing re-run whenever the help centre is restructured.

---

**AC-FR-49-02 — Contextual tooltips show on hover/focus, every time, with no dismiss control**

- **Given** I hover my mouse over, or move keyboard focus to, any of the 9 tooltip-wrapped elements (`tt-charity-lookup`, `tt-guidelines-choice`, `tt-summary-review`, `tt-budget-no-ai`, `tt-governance-add-it`, `tt-senior-review-confirm`, `tt-ai-help-limit`, `tt-download-docx`, `tt-delete-account`)
- **When** the tooltip appears
- **Then** it shows relevant, accurate guidance for that specific field or action, with no X or other dismiss control anywhere on it
- **And** reloading the page, or signing out and back in, never changes whether the tooltip appears — there is no per-user "already seen" state to persist
- **And** for `tt-ai-help-limit` and `tt-download-docx` specifically, clicking the wrapped button while its tooltip is showing still performs the button's real action (the AI refine request fires; the download starts)

---

**AC-FR-49-03 — "Ready to assemble" tooltip shows only while the button is genuinely disabled**

- **Given** I am on Step 4 with at least one question not yet approved, so the "Ready to assemble" button is disabled
- **When** I hover or tab to that button
- **Then** a tooltip explains what is still required before I can proceed, and inspecting the element confirms there is no native `title` attribute duplicating the same message
- **And** once every question is approved and the button becomes enabled, the tooltip no longer appears on hover or focus

---

**AC-FR-49-04 — Register page password hint is a permanent static hint, not a tooltip**

- **Given** I am on the Register page
- **When** I view the password field
- **Then** I see the requirements hint ("At least 12 characters, including letters and numbers") displayed permanently below the field, with no hover or focus needed to reveal it
- **And** there is no separate hover/focus-triggered tooltip duplicating the same text — this was a deliberate scope exclusion (`tt-register-password` was never built), not an oversight

---

**AC-FR-49-05 — Every tooltip trigger is reachable and operable by keyboard alone**

- **Given** I navigate the application using only Tab/Shift+Tab, no mouse
- **When** I tab through any page carrying a contextual tooltip
- **Then** every trigger element receives visible focus and its tooltip content appears, including triggers wrapping non-interactive elements (`tt-budget-no-ai`, `tt-guidelines-choice`, `tt-summary-review`) which gained an explicit `tabIndex` and focus-visible ring for this reason (`GAP-38`, fixed 2026-07-25 — found via live keyboard-only testing; WCAG 2.1.1)

---

---

_Last updated: 2026-08-06 (latest) — **`AC-FR-22-04`'s closing clause corrected** (`GAP-32`, item A). It claimed the retained guideline text "isn't surfaced back to the user anywhere yet (`P6.4` builds the viewer that will)" — written on 2026-07-14, the same day `P6.4` shipped that viewer, and never revisited. Since then the text **has** been surfaced, in Step 4, through the citation badge and the "view original guidelines" panel. What remains true is only the narrow claim the AC is actually about: the **Step 2 input area** is still not repopulated, because `sessionStorage` discards its copy once the summary call returns. The `GAP-34` reference was also stale — that gap was resolved on 2026-07-25. `AC-FR-22-01/02/03` needed no change; they were correctly reworded on 2026-07-10/14, which is how `GAP-32`'s own description came to be wrong about its own scope._

_Last updated: 2026-08-06 (later) — **AC-FR-18-05 built, and AC-FR-49-01 amended for `GAP-45`’s contextual help deep-links.** The authenticated nav Help button now opens the help page for the current screen (Step 4 → "Writing and editing an answer"), falling back to the root where no page applies; footer and dashboard empty-state links deliberately still open the root. All eight targets were fetched live and confirmed before the mapping was written; the residual risk is external GitBook renames, which only `help-and-tooltips-test-plan.md` HT-06 can catch._
_Last updated: 2026-08-06 — **AC-FR-18-02 amended and AC-FR-18-05 added, both on user feedback** (`GAP-44`). AC-FR-18-02's requirement that a background save show "no visible save indicator" is **withdrawn**; AC-FR-18-05 now requires every successful save to be visibly confirmed, including the 60-second sweep. WJ decided this after observing a real first-time user complete a Stony Stratford application with nothing on screen to suggest her work would survive leaving the page — **silence reads as "nothing is happening", not "everything is fine"**. He was offered a narrower option that would have left the sweep silent and changed no criterion, and chose the broader one deliberately, because a user who steps away mid-sentence without moving focus is exactly the nervous user this is for. What survives from the original rule: the confirmation must not interrupt, steal focus, or need dismissing. AC-FR-18-04's note rewritten — it described itself as an exception to a silence rule that no longer exists. Not built; logged as `GAP-44`._
_Last updated: 2026-07-25 — added Section 9.12 in full (FR-49, `PDR-UI-008`), five new acceptance criteria (AC-FR-49-01 to 05) covering the help centre link and all 9 built contextual tooltips, written after live testing completed (`help-and-tooltips-test-plan.md` v2.0) rather than at build time, so the criteria reflect the final simplified (no-persistence) behaviour rather than the reversed v1 design._
_Last updated: 2026-07-17_
_2026-07-17 second addendum: new AC-FR-37-03A added — export date fixed to one timestamp per application (`applications.first_exported_at`), not one per request._
_2026-07-17 addendum: new AC-FR-30-03B added — `PDR-AI-009`'s AI-refine relevance-check consistency fix._
_2026-07-15 addendum: FR-12A (Section 9.2) re-sited from `/profile` to Step 4 — the 5 governance/reserves fields were never actually consumed anywhere as `charity_profiles` columns, so AC-FR-12A-01's "helps flag issues before you apply" claim was untrue. All three ACs rewritten: AC-FR-12A-01 now describes the fixed 5-card group shown first on Step 4; AC-FR-12A-02 replaced (the live reserves-ratio calculation went with the profile-page fields) with a new criterion covering the deliberate no-seeding-between-applications behaviour, including P6.5 reuse; AC-FR-12A-03 updated for the new blank-item/orphan-cleanup mechanics. See `ADR-DATA-006`'s matching 2026-07-15 amendment and `data-model.md` §4c._

_2026-07-15 second addendum, later the same day: FR-12A reworked again per `PDR-AI-008` — live testing of the always-on version found it disjointed from the rest of Step 4. All three ACs rewritten again: AC-FR-12A-01 now describes conditional, citation-backed, no-heading display instead of an unconditional fixed group; AC-FR-12A-02 unchanged in substance (no seeding still applies) but reworded for the conditional case; AC-FR-12A-03 extended to cover orphan-cleanup now matching ordinary narrative questions (no more governance-specific carve-out). See `ADR-DATA-006`'s second 2026-07-15 amendment and `data-model.md` §4c._

_2026-07-15 third addendum, same day (fast-follow): PDR-AI-008's manual-add fallback built for the zero-signal case. New AC-FR-12A-04 added — a quiet link, hidden once all 5 facts are shown, revealing plain-English-explained checkboxes for only the missing ones; a manually-added item shows "Added by you" instead of a citation badge. See `data-model.md` §4c and `PDR-AI-008`'s updated status note._
_2026-07-14 addendum: `P6.2a` built (guideline extraction now tags PDF/docx/pasted-text structure with `[PAGE N]`/`[SECTION: ...]` markers, and `preprocessText`'s truncation is now marker-aware). Two stale claims fixed as a direct result: Section 9.11's "none of the build-plan tasks... have started" and "`unpdf` still calls `mergePages: true`" (both now false), and AC-FR-24-06's truncation-warning quote (corrected to match the real component text) and mechanism note (the deferred fix flagged 2026-07-13 is now done). **Same-day follow-up:** `P6.3` (first milestone) built — extraction now asks the AI for a citation per question/section, validated against real markers, and writes it into `application_items.guideline_reference`; Section 9.11 updated again to reflect this (citations recorded, still not displayed anywhere). **Further same-day follow-up:** GAP-33 fixed — guideline text is now actually retained (`application_guidelines` table), which FR-22's own acceptance criteria had been assuming was still unbuilt. AC-FR-22-01/02 flipped to confirmed-built; AC-FR-22-04 reworded to distinguish "data is retained" from "nothing shows the user it's retained" (new GAP-34 tracks that latter, UI-copy gap). **Final same-day follow-up:** `P6.4` (first milestone) built — Step 4 now genuinely shows a citation badge and a "view original guidelines" text panel. Section 9.11's FR-48 substantially rewritten: AC-FR-48-02/03 flipped from "target behaviour" to confirmed-built; the old AC-FR-48-05 ("no citation feature exists") retired and replaced with a corrected version scoped to what's still actually missing (summary-bullet citations, curator confirmation). Also live-verified `P6.3`'s citation accuracy against the real MK Community Foundation — Oak Grants PDF (WJ regenerated the summary; two newly-found questions cross-checked against the actual document and confirmed genuine, not hallucinated) — see `CHANGELOG.md`. Full detail in `docs/Implementation Plan/CHANGELOG.md` (2026-07-14, P6.2a/P6.3/GAP-33/P6.4 entries)._
_2026-07-28 addendum, found during a documentation freshness audit: new AC-FR-06-05 added — ambient mouse/keyboard/click/touch activity no longer dismisses the AC-FR-06-04 warning dialog once it's open; only its own "I'm still here"/"Sign out now" buttons can. This fixes D-013, a real, previously-invisible defect (found live during `regression-test-plan.md` RT-15 diagnostic re-testing, 2026-07-28) — the dialog had been dismissing itself the instant the mouse moved toward its own buttons, meaning it was never actually clickable, likely since it was first built 2026-07-13. AC-FR-06-02 cross-referenced to note the exception. See `CHANGELOG.md` (2026-07-28) for the fix itself._

_2026-07-28 second addendum, same day: new AC-FR-04-05 added — a leading or trailing space on the email or password (e.g. from a mobile clipboard) no longer blocks sign-in. This fixes D-015, found live when WJ tried to log in on an iPhone ahead of an external demo: a trailing space on the pasted password was sent to Supabase Auth untrimmed, so a genuine credential match failed with the same generic error as AC-FR-04-02. Fixed in `signIn()` (`actions/auth.ts`) and `SignInForm`'s client-side validation. See `CHANGELOG.md` (2026-07-28) for the fix itself._

_Status: Complete — full section-by-section review (all 11 sections) against live code completed 2026-07-13. Summary of this pass's findings, section by section: **9.1** — FR-08 re-marked "Confirmed built" (was hedged as conditional). **9.2** — FR-10 rewritten (invented pre-fill fields removed, real AI-paraphrase behaviour documented via new AC-FR-10-01b); new **FR-12A** added in full for the previously-undocumented "Governance and reserves" field group (P6.1/R13); FR-09/FR-13 requirement wording corrected to match their own (already-accurate) ACs. **9.3** — AC-FR-15-04's invented dynamic page-title format corrected to the real static per-step title; FR-16/AC-FR-16-03 corrected for the `mismatch` status, which the dashboard summary strip now also counts (code fix, `components/dashboard-populated.tsx`); FR-17's "View" button renamed to "Re-open" (code fix) with three new ACs (05/06/07) documenting its actual (consequential, not read-only) behaviour and the mismatch-status no-action case. **9.4** — no findings. **9.5** — AC-FR-24-06's truncation warning flagged as stale but deliberately not corrected yet (Option 2/`P6.2a` is expected to change the underlying mechanism — see `[[project_large_guideline_truncation_reeval]]`-equivalent note); new AC-FR-27-05 added for the previously-undocumented second-failure state. **9.6** — FR-31's badge text, AI-assist-disabled label, and assembly-gating mechanism all corrected to match the real code (three ACs). **9.7** — FR-32 substantially rewritten (invented per-answer "review prompts" replaced with the real three-checkbox confirmation panel); re-open dialog wording reconciled between two UI entry points (code fix, `components/application-step5-approve.tsx`). **9.8** — no findings. **9.9** — AC-FR-41-02/03 and AC-FR-43-02 corrected to match the real `/account/delete` page content and post-deletion banner text. **9.10** — no new findings (FR-46 already corrected earlier the same day, FR-45/47 confirmed accurate). **9.11** — no findings. Two related code-comment fixes made in the same session, unrelated to any AC content: two stale D-012 comments (`actions/auth.ts`, `app/auth/callback/route.ts`) describing an outdated "explicit button click" version of the email-confirmation fix, corrected to describe the real auto-submit-via-JavaScript behaviour. See `docs/Implementation Plan/CHANGELOG.md`'s 2026-07-13 entries for the full rationale behind the two code changes (dashboard tally + button rename, and the D-012 comments). Earlier changes in this version: Section 9.10 FR-46 updated to reflect its 2026-07-11 withdrawal (`docs/moscow-feature-register.md`, Won't Have (v1)) — re-marked from "Must Have, not confirmed built" to "Won't Have (v1) — Withdrawn", with the rationale (coverage level is not a stable per-funder property — see BD-04/BD-08) replacing the old "open product question" framing, and the dangling `BRD ... Section 3.3` citation (that section was deleted in full during the 2026-07-11 BRD review) replaced with BD-07 (BRD Section 10). AC-FR-46-01 to 03 re-annotated from "target behaviour — not built" to "withdrawn requirement — will not be built"; AC-FR-46-04 re-annotated as permanent, not provisional. Status table row for Section 9.10 updated to match. Previous changes: FR-29 corrected from Should Have to Must Have (matches `docs/moscow-feature-register.md` and `docs/PRD-Grant-Pathway.md`, both of which record the 2026-05-28 promotion). FR-31A's criteria corrected to match the actual built senior-review screen and `assembleAndAdvance()` logic, in place of the previous three-point-checkbox and structured/free-form-narrative description; FR-31A's numbering gap against the canonical FR-01–47 list is flagged, not resolved, in this pass. AC-FR-28-04 and FR-31A's assembly criteria corrected to stop describing "structured"/"free-form" as a property of the funder — it is a per-application classification (see `ADR-DATA-006`, BRD v0.6 BD-08 note). Section 9.10 added in full: real Given/When/Then criteria written for FR-45 (confirmed not built as originally specified — narrative-only extraction plus `is_budget_question` is what is actually built), FR-46 (confirmed not built anywhere in the codebase), and FR-47 (confirmed built). AC-FR-01-01 and AC-FR-05-04 corrected from "10 or more characters" to "12 or more characters containing both letters and digits", matching the actual validation in `components/register-form.tsx` and `components/reset-password-form.tsx` and the already-corrected FR-02. FR-22 and its acceptance criteria reworded from the old "never store" model to the retained-guidelines model per `ADR-DATA-002`'s 2026-07-10 reversal, with an explicit not-yet-built flag and a new AC-FR-22-04 describing actual current (still-discarding) behaviour, verified against `lib/guidelines-session.ts` and the absence of any guideline-storage migration. Section 9.11 added in full: FR-48 (guideline source-reference/citations, "Option 2") formalised in new `PDR-DH-004` and `ADR-DATA-007`, blended into Phase 6 — confirmed not built anywhere in the codebase (`unpdf` still flattens pages, no citation field, no viewer component). New AC-FR-28-09 added: the previously-extracted-but-unused `summary_json.supportingDocuments` field is now surfaced on the Step 4 preparation checklist as a funder-specific document list alongside the standing financial-prep checklist (`PDR-UI-007`). Later addition (2026-07-13, found during `PRD-Grant-Pathway.md` Section 12 review): new AC-FR-06-04 added for the 55-minute inactivity warning dialog ("Are you still there?" -- "I'm still here" / "Sign out now") before the 60-minute auto-logout -- confirmed built in `components/session-timeout-provider.tsx`/`session-timeout-modal.tsx`, previously undocumented in this section, the PRD's own FR-06 row, and the PRD's Section 12.4 Security table; all three corrected in the same pass. Later addition (2026-07-13, found during a full PRD/BRD/acceptance-criteria cross-document sweep): AC-FR-42-01/02/03 corrected -- claimed the delete-account button is disabled until `DELETE` is typed exactly; confirmed against `components/delete-account-form.tsx` that the button is always enabled and clicking it with the wrong text shows an inline error instead (the PRD's own Screen 9 review had already found and corrected this same fact, but this section was missed at the time)._
