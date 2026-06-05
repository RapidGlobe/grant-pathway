// Text extraction utility — used by POST /api/upload/process (ADR-FILE-003, S4.1)
//
// PDF extraction: unpdf (wraps pdfjs-dist)
// Word extraction: mammoth
//
// Scanned PDF detection: if extracted text is < 100 characters, the PDF is
// likely a scanned image and cannot be read programmatically.
//
// Token estimation: 1 token ≈ 4 characters (Anthropic convention).
// The large-document threshold is 100,000 tokens ≈ 400,000 characters.
// This triggers a soft advisory warning to the user (PDR-AI-004, ADR-AI-007) —
// there is no hard truncation; Claude Sonnet 4.6 handles up to 1M tokens.

import mammoth from 'mammoth'
import { extractText as unpdfExtractText, getDocumentProxy } from 'unpdf'

/** 100k tokens ≈ 400k characters at ~4 chars/token (ADR-AI-007) */
const LARGE_DOCUMENT_CHAR_THRESHOLD = 400_000

/** Minimum characters for a readable (non-scanned) PDF */
const SCANNED_PDF_CHAR_THRESHOLD = 100

export type ExtractionResult =
  | { ok: true; text: string; isLargeDocument: boolean }
  | { ok: false; reason: 'scanned_pdf' | 'extraction_failed' }

/**
 * Extracts plain text from a PDF or Word (.docx) buffer.
 *
 * Returns `{ ok: true, text, isLargeDocument }` on success.
 * Returns `{ ok: false, reason }` when extraction fails:
 *   - `scanned_pdf`:       PDF is likely image-only; < 100 characters extracted
 *   - `extraction_failed`: library error or unreadable/corrupted file
 *
 * Called in POST /api/upload/process after retrieving the file from
 * Supabase Storage. The caller is responsible for deleting the file.
 */
export async function extractText(buffer: Buffer, mimeType: string): Promise<ExtractionResult> {
  try {
    let text = ''

    if (mimeType === 'application/pdf') {
      const pdf = await getDocumentProxy(new Uint8Array(buffer))
      const { text: extracted } = await unpdfExtractText(pdf, { mergePages: true })
      text = extracted ?? ''

      // Scanned PDF detection — very little text extracted from image-only PDF
      if (text.trim().length < SCANNED_PDF_CHAR_THRESHOLD) {
        return { ok: false, reason: 'scanned_pdf' }
      }
    } else {
      // Word document (.docx via mammoth)
      const result = await mammoth.extractRawText({ buffer })
      text = result.value ?? ''
    }

    const isLargeDocument = text.length > LARGE_DOCUMENT_CHAR_THRESHOLD

    return { ok: true, text, isLargeDocument }
  } catch {
    // Library error: corrupted file, unsupported encoding, etc.
    return { ok: false, reason: 'extraction_failed' }
  }
}

/**
 * Detects the MIME type of a file buffer using magic bytes.
 * Used for server-side MIME type verification (ADR-FILE-002).
 *
 * PDF:  first 4 bytes = 25 50 44 46 (%PDF)
 * DOCX: first 4 bytes = 50 4B 03 04 (ZIP/PK signature — .docx is a ZIP archive)
 *
 * Returns the detected MIME type, or 'application/octet-stream' if unrecognised.
 * The caller must pass this to validateFile() rather than trusting the client's
 * reported Content-Type.
 */
export function detectMimeType(buffer: Buffer): string {
  if (buffer.length >= 4) {
    // PDF magic bytes: %PDF
    if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
      return 'application/pdf'
    }
    // DOCX magic bytes: PK\x03\x04 (ZIP archive signature)
    if (buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04) {
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    }
  }
  return 'application/octet-stream'
}
