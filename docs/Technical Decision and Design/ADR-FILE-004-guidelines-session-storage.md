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
