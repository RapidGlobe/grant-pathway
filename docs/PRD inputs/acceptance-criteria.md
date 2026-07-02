# Acceptance Criteria — Grant Pathway v1

**Tier:** 1 — Always check after every task
**Volatility:** High
**Update when:** Any change to functional requirements that alters what "done" looks like

This document defines testable Given/When/Then acceptance criteria for every functional requirement in Grant Pathway v1. Criteria are grouped by the same sections used in the BRD (Section 9).

Each requirement is marked **Must Have** or **Should Have**. Should Have requirements are included for completeness — acceptance criteria for a Should Have requirement only apply if that requirement is built in v1.

---

## Status

| Section                         | FRs covered    | Status      |
| ------------------------------- | -------------- | ----------- |
| 9.1 Authentication & Accounts   | FR-01 to FR-08 | ✅ Complete |
| 9.2 Charity Profile             | FR-09 to FR-14 | ✅ Complete |
| 9.3 Application Management      | FR-15 to FR-20 | ✅ Complete |
| 9.4 Funder Guideline Handling   | FR-21 to FR-23 | ✅ Complete |
| 9.5 AI Guideline Summarisation  | FR-24 to FR-27 | ✅ Complete |
| 9.6 AI Draft Answer Generation  | FR-28 to FR-31 | ✅ Complete |
| 9.7 Mandatory Review & Approval | FR-32 to FR-36 | ✅ Complete |
| 9.8 Export                      | FR-37 to FR-39 | ✅ Complete |
| 9.9 Account Deletion            | FR-40 to FR-44 | ✅ Complete |

---

## 9.1 Authentication & Accounts

---

### FR-01 — Must Have

**Requirement:** The system shall allow new users to register with their full name, email address, and a password.

---

**AC-FR-01-01 — Successful registration**

- **Given** I am an unauthenticated user on `/register`
- **When** I enter a valid first name, last name, email address, and a password of 10 or more characters
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
- **When** I enter a new password of 10 or more characters
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

**AC-FR-05-06 — Expired reset link**

- **Given** I have received a password reset email
- **When** I click the reset link after 1 hour has passed
- **Then** I see the message: _"This reset link has expired. Please request a new one."_
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

---

**AC-FR-06-03 — Accessing a protected page after session expiry**

- **Given** my session has expired due to inactivity
- **When** I attempt to navigate to or access a protected page (e.g. `/dashboard`)
- **Then** I am redirected to `/`
- **And** I am not shown any protected content

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

_These criteria apply only if FR-08 is implemented in v1._

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

**Requirement:** Following account activation, the system shall prompt the user to enter their charity's registered number.

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

**Requirement:** The system shall query the Charity Commission for England and Wales public API and pre-fill the charity name, registered address, date of registration, and charitable objects.

---

**AC-FR-10-01 — Charity Commission lookup — match found**

- **Given** I am on `/profile`
- **When** I enter a charity name or registration number in the lookup field
- **And** I click the search button
- **And** the Charity Commission API returns a matching record
- **Then** the charity name and registration number fields are pre-populated with the returned data
- **And** I see the note: _"Details retrieved from the Charity Commission register."_
- **And** all pre-filled fields remain editable

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

### FR-13 — Must Have

**Requirement:** The system shall allow users to update their charity profile at any time from their account settings.

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

**Requirement:** The system shall allow a user to create a new grant application by selecting a funder from the approved directory and entering the grant name. **Revised 2026-06-01 (DR-FD-001):** Funder is selected via searchable picker, not free-text entry.

---

**AC-FR-15-01 — Successful application creation**

- **Given** I am a signed-in user with a completed charity profile
- **When** I click "+ New Application" or "Start your first application" on `/dashboard`
- **And** I select a funder from the searchable directory picker on Step 1
- **And** I enter a grant name
- **And** I click "Continue"
- **Then** a new application record is created with status `not_started`
- **And** the record is linked to the selected `funder_id`
- **And** I am advanced to Step 2 (Funder Guidelines)

---

**AC-FR-15-02 — Required fields enforced**

- **Given** I am on Step 1 of the application flow
- **When** I attempt to click "Continue" without selecting a funder or entering a grant name
- **Then** inline error messages are shown:
  - Funder: _"Please select a funder from the list"_
  - Grant name: _"Please enter the grant name"_
- **And** no application record is created

---

**AC-FR-15-05 — Unlisted funder request link present**

- **Given** I am on Step 1 of the application flow
- **When** I look below the funder picker
- **Then** I see the link _"My funder isn't listed — request it"_
- **And** clicking the link opens the funder request form
- **And** I cannot proceed with an unlisted funder name entered as free text

---

**AC-FR-15-03 — Cancel returns to dashboard without creating a record**

- **Given** I am on Step 1 of the application flow
- **When** I click "Cancel"
- **Then** I am returned to `/dashboard`
- **And** no application record has been created

---

**AC-FR-15-04 — Application page title set correctly**

- **Given** I am working on an application
- **When** I am on any step of the application flow
- **Then** the browser tab title reads _"[Grant name] — [Funder name] — Grant Pathway"_

---

### FR-16 — Must Have

**Requirement:** The system shall display all saved applications on a user dashboard, showing the grant name, funder name, and the date last edited.

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

**AC-FR-16-03 — Summary strip shows all four status counts**

- **Given** I have one or more saved applications
- **When** I view `/dashboard`
- **Then** the summary strip displays the count for all four statuses: Not started, In progress, Approved, Exported
- **And** all four status counts are shown even when some are zero
- **And** the format is: _"[n] applications — [n] not started · [n] in progress · [n] approved · [n] exported"_

---

**AC-FR-16-04 — Status labels are colour-coded correctly**

- **Given** I have applications at different statuses
- **When** I view the dashboard application cards
- **Then** each status label uses the correct colour:
  - Not started — Slate
  - In progress — Amber
  - Approved — Green
  - Exported — Teal

---

### FR-17 — Must Have

**Requirement:** The system shall allow a user to open and continue any saved application from their dashboard.

---

**AC-FR-17-01 — Continue button shown for not_started and in_progress applications**

- **Given** I have an application with status `not_started` or `in_progress`
- **When** I view its card on `/dashboard`
- **Then** I see a "Continue" button as the primary action on that card

---

**AC-FR-17-02 — View button shown for approved and exported applications**

- **Given** I have an application with status `approved` or `exported`
- **When** I view its card on `/dashboard`
- **Then** I see a "View" button as the primary action on that card

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

### FR-18 — Must Have

**Requirement:** The system shall auto-save application progress at regular intervals; manual save shall also be available.

---

**AC-FR-18-01 — Progress saved on Continue**

- **Given** I am working through the application flow
- **When** I click "Continue" to advance to the next step
- **Then** my progress on the current step is saved before the next step is shown

---

**AC-FR-18-02 — Background auto-save every 60 seconds**

- **Given** I am on an active step of the application flow with unsaved edits
- **When** 60 seconds pass without me clicking Continue
- **Then** my progress is saved silently in the background
- **And** no visible save indicator is shown to the user during the background save

---

**AC-FR-18-03 — No more than 60 seconds of work lost if browser is closed**

- **Given** I am actively editing content on a step of the application flow
- **When** I close my browser without clicking Continue
- **And** I return to the application
- **Then** content I had been editing is present, with at most 60 seconds of edits potentially lost

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

**Requirement:** Funder guidelines shall be used for AI processing only and shall not be permanently stored after the application session.

---

**AC-FR-22-01 — Guidelines not pre-populated when returning to Step 2**

- **Given** I uploaded or pasted guidelines during a previous session
- **When** I return to that application in a new session and navigate to Step 2
- **Then** the guidelines input area is empty
- **And** the previously uploaded file or pasted text is not displayed or retrievable

---

**AC-FR-22-02 — Guidelines not accessible outside the input step**

- **Given** I have submitted guidelines on Step 2 and advanced to Step 3 or beyond
- **When** I review my application at any step, on the dashboard, or in an export
- **Then** the raw guidelines text or file is not shown or accessible anywhere in the application

---

**AC-FR-22-03 — AI-generated outputs are retained; raw guidelines are not**

- **Given** I have generated an AI summary and draft answers from my guidelines
- **When** I return to the application in a future session
- **Then** the AI summary and draft answers are present
- **And** the original guidelines text or file is not available

---

### FR-23 — Must Have

**Requirement:** The system shall display a plain-language error message if an unsupported file format is uploaded, and shall prompt the user to paste the text instead.

---

**AC-FR-23-01 — Unsupported file format rejected**

- **Given** I am on Step 2 of the application flow
- **When** I attempt to upload a file in an unsupported format (e.g. .xlsx, .pptx, .jpg, .txt)
- **Then** the file is rejected
- **And** I see the error: _"We can only accept PDF or Word (.docx) files. Please convert your document or paste the text directly."_
- **And** I am not advanced to Step 3

---

**AC-FR-23-02 — File exceeding 10MB rejected**

- **Given** I am on Step 2 of the application flow
- **When** I attempt to upload a file larger than 10MB
- **Then** the file is rejected
- **And** I see the error: _"Your file is over 10MB. Please upload a smaller file or paste the text directly."_
- **And** I am not advanced to Step 3

---

**AC-FR-23-03 — Scanned or image-based PDF rejected**

- **Given** I am on Step 2 of the application flow
- **When** I upload a PDF that contains only scanned images with no extractable text
- **Then** the file is rejected
- **And** I see the error: _"We couldn't read the text in your PDF — it may be a scanned document. Please try copying and pasting the text directly instead."_
- **And** I am not advanced to Step 3

---

**AC-FR-23-04 — PDF exceeding 200 pages rejected** _(Added 2026-06-22)_

- **Given** I am on Step 2 of the application flow
- **When** I upload a PDF with more than 200 pages
- **Then** the file is rejected
- **And** I see the error: _"This PDF is too large to process (over 200 pages). Please upload a shorter document or paste the relevant sections as text."_
- **And** I am not advanced to Step 3

---

**AC-FR-23-05 — Extraction timeout handled gracefully** _(Added 2026-06-22)_

- **Given** I am on Step 2 of the application flow
- **When** I upload a file and text extraction takes longer than 30 seconds
- **Then** the upload is rejected
- **And** I see the error: _"We couldn't read your document in time. Please try again, or paste the text directly."_
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

**AC-FR-24-02 — Summary covers all required content areas**

- **Given** the AI summary has been generated on Step 3
- **When** I read the summary
- **Then** it includes plain-English coverage of:
  - What the grant is for
  - Who can apply (eligible organisations)
  - What the funder is looking for (priorities and funded project types)
  - Key evidence expectations
  - Each application question explained in plain English

---

**AC-FR-24-03 — Extracted application questions identified and counted**

- **Given** the AI summary has been generated
- **And** the guidelines contain identifiable application questions
- **When** I view Step 3
- **Then** I see a note in the format: _"We found [n] application questions in these guidelines. We'll use these to generate your draft answers in the next step."_
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

- **Given** I uploaded a guidelines document that was very long
- **And** the system pre-processed and truncated it before sending to the AI
- **When** the AI summary is displayed on Step 3
- **Then** I see an inline warning: _"Your guidelines document was very long, so only the most relevant sections were sent for summarisation. If anything looks incomplete, try pasting the key sections manually."_
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
- **Then** I see the message: _"The AI service is temporarily unavailable. Please try again later."_
- **And** a "Try again" button is shown
- **And** no AI request is logged against my monthly allowance
- **And** the application remains at `in_progress` status — no data is lost

---

**AC-FR-27-04 — AI kill-switch — service unavailable on Step 4 AI assist** _(Added 2026-06-29)_

- **Given** the AI service has been disabled via the `AI_ENABLED` kill-switch
- **When** I click "Help me improve this" on a question card in Step 4
- **Then** an inline error is shown on that card: _"The AI service is temporarily unavailable. Please try again later."_
- **And** no AI request is logged against my monthly allowance
- **And** my existing answer is preserved

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

**AC-FR-28-04 — Free-form funder shows narrative sections instead of discrete questions**

- **Given** the Step 3 summary identified the funder as a free-form narrative funder (no numbered questions)
- **When** I view the Q&A interface
- **Then** I see named narrative sections (e.g., "About your organisation", "Project description")
- **And** each section has a textarea for my own answer
- **And** a note is displayed: _"This funder requires a flowing narrative document. Write naturally — the assembly step will format your answers into a coherent document."_

---

**AC-FR-28-05 — Monthly limit warning shown when approaching limit**

- **Given** I have used 40 or more of my 50 monthly AI requests
- **When** I am on Step 4
- **Then** I see the soft warning banner: _"You've used most of your monthly AI allowance."_

---

**AC-FR-28-06 — AI assist blocked when monthly limit is reached**

- **Given** I have used all 50 of my monthly AI requests
- **When** I am on Step 4
- **Then** all "Help me improve this" buttons are disabled
- **And** I see the message: _"You've reached your monthly AI limit. This resets on [date]. If you need more, please get in touch."_
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

### FR-29 — Should Have

**Requirement:** Word limits extracted from the funder guidelines shall be displayed alongside each question, and answers shall display a word/character counter.

_Word limits are extracted automatically from the guidelines in Step 3 — they are not manually entered by the user._

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

**AC-FR-29-05 — Optional questions are excluded from the assembly gate** _(Added 2026-06-04, D-LBF-01/03)_

- **Given** a question is marked as optional — either by containing "(optional)" in its text or by beginning with "This question is optional"
- **When** I leave that question unanswered and unapproved
- **Then** the "Ready to assemble" button remains active (not greyed out)
- **And** the optional question shows an "Approve this answer" button even when empty, allowing the user to explicitly skip it

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

**AC-FR-31-01 — Budget questions are visually distinct**

- **Given** a question is identified as a budget or financial question
- **When** I view that question card on Step 4
- **Then** the card has a distinct visual style (e.g., amber background, "£" badge) that differentiates it from non-budget questions

---

**AC-FR-31-02 — AI assist disabled on budget questions**

- **Given** I am viewing a budget question on Step 4
- **When** I look at the AI assist area on that card
- **Then** the "Help me improve this" button is not present
- **And** a label is displayed: _"This section requires your actual financial data — do not use AI-generated figures"_

---

**AC-FR-31-03 — Budget questions require a user answer before assembly**

- **Given** I have not filled in a budget question
- **When** I attempt to click "Ready to assemble"
- **Then** I cannot proceed
- **And** I see the message: _"Please enter your actual budget figures before assembling"_

---

### FR-31A — Must Have

**Requirement:** Before the final assembly, the user shall see a senior review prompt recommending they check the budget figures and project description with a senior colleague.

---

**AC-FR-31A-01 — Senior review prompt shown before assembly**

- **Given** all questions are answered and I have clicked "Ready to assemble"
- **When** I view the next screen
- **Then** I see a prompt recommending I check with my CEO, treasurer, or a trustee that:
  - _"The budget figures are accurate and approved"_
  - _"The project description reflects your current priorities"_
  - _"You have authority to submit this application"_

---

**AC-FR-31A-02 — Assembly begins only after senior review confirmation**

- **Given** I am viewing the senior review prompt
- **When** I click _"I've reviewed this — assemble my draft"_
- **Then** the assembly API is called and the assembled draft is saved to the application

---

**AC-FR-31A-03 — Structured funder assembly produces a Q&A formatted draft**

- **Given** the funder is a structured funder (discrete questions)
- **When** the assembly API completes
- **Then** the assembled draft contains each answer formatted under its question heading

---

**AC-FR-31A-04 — Free-form assembly produces a flowing narrative**

- **Given** the funder is a free-form narrative funder
- **When** the assembly API completes
- **Then** the assembled draft is a coherent flowing narrative — not a Q&A list

---

---

## 9.7 Mandatory Review & Approval

---

### FR-32 — Must Have

**Requirement:** Every AI-generated draft answer shall be presented alongside three plain-language review prompts: (1) Does this accurately describe your charity and project? (2) Are all figures, dates, and facts correct? (3) Does this answer the question that was asked?

---

**AC-FR-32-01 — Three review prompts displayed on Step 5**

- **Given** I have generated draft answers and advanced to Step 5 (Review and approve)
- **When** I view the page
- **Then** I can see all three plain-language review prompts:
  1. _"Does this accurately describe your charity and project?"_
  2. _"Are all figures, dates, and facts correct?"_
  3. _"Does this answer the question that was asked?"_

---

**AC-FR-32-02 — Review prompts are visible before the approval action**

- **Given** I am on Step 5
- **When** I view the screen layout
- **Then** the three review prompts are displayed prominently alongside the content before the Approve button is reached

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
  - A footer: _"Prepared using Grant Pathway v[version number] — grantpathway.org.uk"_

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
- **Then** I see the re-export warning: _"You exported this application on [date]. If you have already submitted that version to the funder, please contact them to let them know a revised version is being submitted. Funders may treat multiple submissions as separate applications."_
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

_These criteria apply only if FR-38 is implemented in v1._

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

**AC-FR-41-02 — Full warning shown on the deletion confirmation screen**

- **Given** I am on `/account/delete`
- **When** I view the page
- **Then** I see the warning: _"This will permanently delete your account and all associated data, including your charity profile and all saved applications. This cannot be undone."_

---

**AC-FR-41-03 — Plain list of deleted data shown on confirmation screen**

- **Given** I am on `/account/delete`
- **When** I view the page
- **Then** I see a plain list of exactly what will be deleted:
  - _Your account and login details_
  - _Your charity profile_
  - _All saved applications and draft answers_
  - _Any uploaded funder guidelines_

---

### FR-42 — Must Have

**Requirement:** The user shall be required to confirm deletion by re-entering their email address.

_Note: the screen requirements specify that the user must type the word DELETE (uppercase, case-sensitive) rather than re-entering their email address. The screen requirements take precedence and the acceptance criteria below reflect the implemented behaviour._

---

**AC-FR-42-01 — DELETE confirmation input shown and delete button disabled by default**

- **Given** I am on `/account/delete`
- **When** I view the page
- **Then** I see a text input labelled: _"Type DELETE to confirm"_
- **And** the _"Permanently delete my account"_ button is disabled

---

**AC-FR-42-02 — Delete button enabled only when DELETE is typed exactly**

- **Given** I am on `/account/delete`
- **When** I type the exact string `DELETE` (all uppercase) in the confirmation input
- **Then** the _"Permanently delete my account"_ button becomes enabled

---

**AC-FR-42-03 — Delete button remains disabled for any other input**

- **Given** I am on `/account/delete`
- **When** I type anything other than the exact string `DELETE` (e.g. `delete`, `Delete`, `DELET`, or any other value)
- **Then** the _"Permanently delete my account"_ button remains disabled

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

**AC-FR-43-02 — Session ended immediately after deletion**

- **Given** my account deletion has completed
- **Then** my current session is ended immediately
- **And** I am redirected to `/` with the inline message: _"Your account has been deleted."_

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

_These criteria apply only if FR-44 is implemented in v1._

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
- **And** it includes a _"Register a new account"_ link for users who wish to use Grant Pathway again in the future

---

_Last updated: 2026-07-01_
_Status: Complete — all 9 sections done. Changes in this version: FR-07 (MFA) marked Won't Have — criteria retained for historical reference only, matching the 2026-06-12 removal already recorded in `docs/moscow-feature-register.md` (2026-07-01). FR-02 requirement updated (password 10→12 chars, letters + digits required); AC-FR-02-02 updated, AC-FR-02-02b added (2026-06-29). AC-FR-23-04 (200-page PDF cap) and AC-FR-23-05 (extraction timeout) added (2026-06-22). AC-FR-24-06 (truncation warning) added (2026-06-22). AC-FR-27-03 (kill-switch Step 3) and AC-FR-27-04 (kill-switch Step 4 AI assist) added (2026-06-29)._
