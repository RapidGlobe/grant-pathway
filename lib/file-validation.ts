// File validation — server-side (ADR-FILE-002, GAP-08)
// Re-validates MIME type and file size before text extraction in
// POST /api/upload/process. Never rely on client-side validation alone.
//
// Usage in the process route:
//   const result = validateFile(mimeType, sizeBytes)
//   if (!result.ok) {
//     return NextResponse.json({ error: FILE_VALIDATION_MESSAGES[result.reason] }, { status: 422 })
//   }

export const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const

export type AcceptedMimeType = (typeof ACCEPTED_MIME_TYPES)[number]

/** 10MB in bytes — matches ADR-FILE-002 and PDR-DH-001 */
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

export type FileValidationResult =
  { ok: true; mimeType: AcceptedMimeType } | { ok: false; reason: 'invalid_type' | 'too_large' }

/**
 * Validates a file's MIME type and size server-side.
 * Returns { ok: true, mimeType } on success, or { ok: false, reason } on failure.
 * Called in POST /api/upload/process (ADR-FILE-002, GAP-08).
 */
export function validateFile(mimeType: string, sizeBytes: number): FileValidationResult {
  if (sizeBytes > MAX_FILE_SIZE_BYTES) {
    return { ok: false, reason: 'too_large' }
  }
  if (!ACCEPTED_MIME_TYPES.includes(mimeType as AcceptedMimeType)) {
    return { ok: false, reason: 'invalid_type' }
  }
  return { ok: true, mimeType: mimeType as AcceptedMimeType }
}

/**
 * User-facing error messages for file validation failures (FR-23).
 * Match the messages defined in screen-requirements.md Step 2 error states.
 */
export const FILE_VALIDATION_MESSAGES = {
  invalid_type:
    'We can only accept PDF or Word (.docx) files. Please convert your document or paste the text directly.',
  too_large: 'Your file is over 10MB. Please upload a smaller file or paste the text directly.',
} as const
