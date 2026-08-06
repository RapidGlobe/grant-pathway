---
id: ADR-FILE-004
category: File Handling
status: Decided
---

# ADR-FILE-004 — Funder Guidelines Session Storage

## Context

Funder guidelines are not persisted to the database (ADR-DATA-002, FR-22). However, the extracted text from the guidelines must be available:

1. When the user submits Step 2 to trigger AI Summary generation (Step 3)
2. Potentially when the user re-enters Step 2 within the same browser session

If the user has successfully generated an AI summary in Step 3, the guidelines text is no longer needed — the summary is stored in the `applications` table. However, if the user navigates back to Step 2 within the same session, it is a better experience to show the previously uploaded guidelines rather than a blank upload field.

## Options Considered

### Option A — Pass guidelines text in the POST body to the AI API route only

- **What it is:** The client holds the extracted guidelines text in React state (in-memory) during the session. When the user submits Step 2, the text is sent to the AI API route in the POST body. After the API call returns, the text is discarded.
- **Strengths:** Simplest. No storage API calls. Text is only in memory during the upload flow.
- **Weaknesses:** If the user navigates away from Step 2 before submitting, the text is lost and they must re-upload. If the React component unmounts (e.g., navigating to a different page and back), the text is lost.

### Option B — Store extracted text in `sessionStorage`

- **What it is:** After extraction, the guidelines text is stored in the browser's `sessionStorage` keyed by `application_id`. It is read when the user returns to Step 2 within the same browser session. It is cleared once the AI summary is successfully generated.
- **Strengths:** Persists across page navigations within the same browser tab. Cleared automatically when the tab is closed (GDPR-friendly — no persistence beyond session).
- **Weaknesses:** `sessionStorage` is tab-specific — doesn't work if the user opens a new tab. Limited to ~5MB (sufficient for text).

### Option C — Store extracted text in `localStorage`

- **What it is:** Like Option B but persists across sessions until explicitly cleared.
- **Weaknesses:** Persists after the browser closes. Data lingers even after AI summary is generated if not explicitly cleared. Privacy concern for shared computers.

### Option D — Store extracted text temporarily in Supabase Storage with short TTL

- **What it is:** After extraction, the guidelines text (as a text file) is stored in Supabase Storage with a short expiry. Retrieved when needed.
- **Weaknesses:** Over-engineered for temporary in-session data. Requires storage cleanup. Contradicts the spirit of ADR-DATA-002.

## Decision

**Option B — `sessionStorage` keyed by `application_id`.**

Extracted guidelines text is stored in `sessionStorage` immediately after successful extraction. It survives page navigation within the same browser tab but is cleared when the tab closes — consistent with the spirit of ADR-DATA-002 (guidelines are not persisted).

**Key format:** `guidelines_text_${applicationId}` — includes the application ID to prevent data from one application appearing in another if the user has multiple tabs open.

**Lifecycle:**

1. Upload completes → write extracted text to `sessionStorage[guidelines_text_${applicationId}]`
2. User returns to Step 2 within the same tab → read from `sessionStorage` and restore the uploaded state
3. Step 3 AI summary completes successfully → clear the `sessionStorage` entry
4. Tab closes → browser clears `sessionStorage` automatically

**Fallback behaviour:**

- If `sessionStorage` is empty and no summary exists → show Step 2 in empty upload state, prompt user to re-upload
- If a summary already exists (Step 3 complete) → Step 2 shows completed state regardless of `sessionStorage`

**Implementation:** A utility `lib/guidelines-session.ts` exports `setGuidelines(applicationId, text)`, `getGuidelines(applicationId)`, and `clearGuidelines(applicationId)` — keeping `sessionStorage` access out of components and making it easy to test.

## Consequences

- A utility function should manage guidelines text in `sessionStorage` (get, set, clear).
- The Step 2 component must check `sessionStorage` on mount to restore any previously extracted text.
- The Step 3 completion handler must clear the `sessionStorage` entry.

## Source

ADR-DATA-002, FR-22, ADR-ARCH-004.

## Date Decided

2026-04-21

## Note — 2026-07-10

This ADR's `sessionStorage` approach is still exactly how the product works today and remains accurate as a description of current production behaviour. However, its premise — "consistent with the spirit of ADR-DATA-002" — no longer holds: `ADR-DATA-002` reversed the "guidelines are never stored" decision on 2026-07-10. Guideline text is now retained server-side in Postgres (extracted, page-tagged text, per the P6.2a groundwork), not merely held client-side for the duration of a session.

This ADR will need a real update once P6.2a ships. At that point, the client-side `sessionStorage` round-trip described above likely becomes unnecessary for returning to Step 2 — the retained server-side copy could be read directly instead, removing the need to restore state from the browser at all. Until P6.2a is built, nothing here changes: this note is a forward pointer, not a revision of the Decision.

This should be updated together with `ADR-ARCH-004`, which currently shares the same "guidelines can't be stored" assumption (see that ADR's matching 2026-07-10 note).

## Note — 2026-08-06 (`GAP-32`) — the 2026-07-10 note's trigger has been met

**DRAFT — pending WJ's sign-off.** `P6.2a` shipped on 2026-07-14, so the "will need a real update once P6.2a ships" condition above is satisfied. The correction below is stated here rather than edited into the Context, following this repository's convention of leaving superseded text intact (as `ADR-DATA-002` does with its original decision).

**Context correction.** The opening line reads: "Funder guidelines are not persisted to the database (ADR-DATA-002, FR-22)." **This is no longer true.** The extracted, marker-tagged guideline text is retained for the life of the application in `application_guidelines` (migration `20260714000001`). What is still never persisted is the uploaded **file** — it goes to the `guidelines-temp` bucket, is read once, and is deleted.

**Still true in production, for now.** The retention migration has reached `grant-pathway-dev` only. Until `P5.4` pushes migrations to `grant-pathway-prod`, the live service behaves exactly as this ADR originally described, `sessionStorage` and all.

### The open question — for WJ, not settled here

**Should the `sessionStorage` round-trip be removed now that the text can be re-read from the server?** This is a code change, not a documentation change, which is why this note stops short of deciding it. The trade-off:

- **Keep it.** It is built, it works, and it costs nothing per request. It is also the only mechanism that survives the dev/prod split described above — it works identically whether or not the retention migration has landed.
- **Remove it.** The client-side copy is the reason the Step 2 input area still appears empty on return (`AC-FR-22-04`), and the reason `GAP-34`'s "not saved" copy was misleading enough to need removing on 2026-07-25. Re-reading from `application_guidelines` would let Step 2 repopulate, which is the behaviour a user would expect.

**Recommendation: do not touch it before go-live.** The retention path is not yet in production and `P5.5` has not tested it there. Removing a working mechanism to fix a cosmetic gap, in the window before launch, trades a real risk for a small gain. Revisit once `P5.4` has pushed migrations and `P5.5` has exercised retention against production.

## Revision History

| Date       | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-08-06 | **DRAFT, pending WJ.** `GAP-32`: the 2026-07-10 note's trigger condition is met — `P6.2a` shipped 2026-07-14. Added a note correcting the Context's "not persisted to the database" without editing it in place, distinguishing the retained **text** from the never-persisted **file**, and recording that production still behaves as originally written until `P5.4` pushes migrations. States the open `sessionStorage` question in full for WJ, with a recommendation not to touch it before go-live. |
| 2026-07-10 | Added forward-looking note: `ADR-DATA-002`'s reversal means guideline text is now retained server-side, so the `sessionStorage` round-trip described here — still accurate today — likely becomes unnecessary once P6.2a ships. To be updated together with `ADR-ARCH-004`, which shares the same now-outdated "guidelines can't be stored" assumption.                                                                                                                                                    |
