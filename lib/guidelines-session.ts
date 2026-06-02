// Guidelines session storage — client-side only (ADR-FILE-004, GAP-09)
// Exports: setGuidelines, getGuidelines, clearGuidelines, setGuidelinesFilename, getGuidelinesFilename
//
// Manages extracted funder guidelines text in sessionStorage.
// Guidelines are keyed by application ID so multiple open tabs cannot
// cross-contaminate data between different applications.
//
// Lifecycle (ADR-FILE-004):
//   1. Upload/paste completes  → setGuidelines(applicationId, text)
//   2. User returns to Step 2  → getGuidelines(applicationId) to restore state
//   3. AI summary saved to DB  → clearGuidelines(applicationId)          [GAP-10]
//   4. Tab closes              → browser clears sessionStorage automatically
//
// All sessionStorage access for guidelines text MUST go through these functions.
// Never access sessionStorage for guidelines directly in components.
// This keeps the storage key consistent and makes the logic easy to test.

const storageKey = (applicationId: string) => `guidelines_text_${applicationId}`
const filenameKey = (applicationId: string) => `guidelines_filename_${applicationId}`

/**
 * Stores extracted guidelines text for the given application.
 * Called after successful file upload and text extraction (Step 2).
 * Fails silently if sessionStorage is unavailable (private mode, quota exceeded).
 */
export function setGuidelines(applicationId: string, text: string): void {
  try {
    sessionStorage.setItem(storageKey(applicationId), text)
  } catch {
    // sessionStorage may be unavailable in certain browser configurations.
    // Fail silently — the user will be prompted to re-upload if the entry is missing.
  }
}

/**
 * Retrieves stored guidelines text for the given application.
 * Returns null if no entry exists or sessionStorage is unavailable.
 * Called on Step 2 mount to restore the previously extracted text (ADR-FILE-004).
 */
export function getGuidelines(applicationId: string): string | null {
  try {
    return sessionStorage.getItem(storageKey(applicationId))
  } catch {
    return null
  }
}

/**
 * Clears the stored guidelines text for the given application.
 * Called by the Step 3 AI summary handler once the summary is successfully
 * saved to the database (GAP-10, ADR-FILE-004).
 * Guidelines text must not persist in the browser once a summary exists.
 */
export function clearGuidelines(applicationId: string): void {
  try {
    sessionStorage.removeItem(storageKey(applicationId))
    sessionStorage.removeItem(filenameKey(applicationId))
  } catch {
    // Fail silently — a missing entry has no consequence.
  }
}

/**
 * Stores the guidelines source label for the given application.
 * Pass the file name for uploads, or "Pasted text" for the paste path.
 */
export function setGuidelinesFilename(applicationId: string, filename: string): void {
  try {
    sessionStorage.setItem(filenameKey(applicationId), filename)
  } catch {
    // Fail silently.
  }
}

/**
 * Retrieves the stored guidelines source label for the given application.
 * Returns null if no entry exists or sessionStorage is unavailable.
 */
export function getGuidelinesFilename(applicationId: string): string | null {
  try {
    return sessionStorage.getItem(filenameKey(applicationId))
  } catch {
    return null
  }
}
