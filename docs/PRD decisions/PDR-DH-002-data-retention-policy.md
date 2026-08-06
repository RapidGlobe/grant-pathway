---
id: PDR-DH-002
category: Data & File Handling
status: Decided
---

# PDR-DH-002 — Data Retention Policy

## Question

How long will saved applications and charity profile data be retained for inactive user accounts, and will users be notified before data is deleted?

## Context

The BRD establishes that data is retained while an account is active and deleted on account closure (FR-40 to FR-44). However, it does not define what happens to data belonging to users who register but then become inactive — for example, a volunteer who uses the app once and never returns. Retaining data indefinitely for inactive accounts increases storage costs and data protection obligations under UK GDPR. Deleting it without warning risks frustrating users who return after a gap. A clear retention policy with user notification strikes the right balance. This is a PRD decision because it affects the user-facing experience (notification emails, warnings) as well as compliance obligations.

## Options

- **Option A — Retain indefinitely:** Keep all data regardless of inactivity. Not compliant with UK GDPR data minimisation requirements.
- **Option B — Delete after 12 months, no warning:** Automatically delete inactive account data after 12 months with no prior notification. GDPR-compliant but damages trust for users who return after a gap.
- **Option C — Delete after 12 months, 30-day warning:** Send an email warning at 11 months of inactivity, delete at 12 months if still inactive. GDPR-compliant with fair notice.
- **Option D — Delete after 24 months, 30-day warning:** Same as Option C but with a 24-month inactivity window. More appropriate for grant writers who may only use the tool seasonally and could be inactive for 12–14 months between legitimate uses.

## Decision

**Option D — Delete after 24 months of inactivity, with a 30-day email warning.**

### Inactivity definition

An account is considered inactive if the user has not logged in for 24 consecutive months. Any login resets the inactivity clock.

### Notification sequence

1. **At 23 months of inactivity:** Send a warning email — _"Your Grant Pathway account will be deleted in 30 days due to inactivity. Log in at any time to keep your account and saved work."_
2. **At 24 months of inactivity (if no login):** Delete all account data — user profile, charity profile, all saved applications, uploaded files, and AI usage records. Send a final confirmation email notifying the user their account has been closed.

### Data deleted on inactivity closure

- User account and authentication record
- Charity profile
- All saved applications and associated content
- Uploaded funder guideline files (Supabase Storage)
- AI usage records

**Implementation note (2026-08-06, `GAP-47`) — this list is now accurate; it was not before.** The fourth item, uploaded funder guideline files, was named here from this decision's date but neither deletion path deleted anything from Supabase Storage: user-initiated deletion (`app/api/account/delete/route.ts`, S8.2) and the inactivity cron (`app/api/cron/inactivity-deletion/route.ts`, S8.3) both removed only database rows. The files were left entirely to the separate `cleanup-guidelines` job, which removes anything older than an hour every 30 minutes.

Because of that sweep, nothing was ever actually retained — which is why this was recorded as a spec/code mismatch rather than a data-protection incident. Both paths now delete the user's Storage objects explicitly, via `lib/storage-guidelines.ts`, before the table cascade.

The mismatch was resolved by changing the code to match this decision rather than by amending the decision to point at the cleanup job. The reasoning: once the account is deleted, nothing remains that ties an object to a person — the object name still embeds the user id, so it is still personal data, but there is no user left to ask about it and nothing to join it to. Every other way the sweep can fail is self-healing, because the owning account is still there to re-derive the link from. This is the single case where the fallback cannot recover, and it follows an explicit erasure request. Amending a decision that carries a UK GDPR commitment, to match code that was cheap to correct, was the worse direction of travel.

**No change to the deletion confirmation screen.** `AC-FR-41-03` deliberately omits uploaded guidelines from the list of deleted data shown to the user (corrected 2026-07-13, consistent with `FR-22`), and that remains right: the files are transient working storage that exists for seconds during extraction, not user-visible saved data. Listing them would imply a persistence the product does not have. This note exists so nobody reconciles the two lists by adding the item to the screen.

### Reactivation

There is no reactivation path — once deleted, the user must register again as a new account. This is clearly stated in the warning email.

## Rationale

Grant writing is a seasonal, infrequent activity. A volunteer who uses Grant Pathway in spring may not return for 12–14 months, not because they have left but simply because they have not needed it. A 12-month inactivity window (Option C) risks deleting the accounts of legitimate, returning users. A 24-month window (Option D) is more appropriate for this user behaviour pattern while still meeting UK GDPR data minimisation obligations. The 30-day warning email gives users a fair and transparent opportunity to preserve their data, and aligns with the honest, respectful tone of voice established in the branding guidelines.

## Date Decided

2026-04-16
