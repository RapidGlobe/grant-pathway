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
//
// Resource bounds (POST-LAUNCH):
//   - PDF: capped at MAX_PDF_PAGES pages to prevent unbounded memory/CPU use
//   - Both types: hard 30-second extraction timeout to protect the Lambda budget
//
// Structural tagging (ADR-DATA-007, P6.2a): extraction preserves page (PDF)
// or heading (docx) boundaries as inline markers — `[PAGE N]` / `[SECTION: A
// > B]` — so a later citation can only ever point at a chunk of text that
// structurally exists in the source, rather than a free-typed guess. Nothing
// downstream consumes these markers yet (that's P6.3); lib/preprocess-text.ts
// is responsible for not stripping them.

import mammoth from 'mammoth'
import { extractText as unpdfExtractText, getDocumentProxy } from 'unpdf'

/** 100k tokens ≈ 400k characters at ~4 chars/token (ADR-AI-007) */
const LARGE_DOCUMENT_CHAR_THRESHOLD = 400_000

/** Minimum characters for a readable (non-scanned) PDF */
const SCANNED_PDF_CHAR_THRESHOLD = 100

/** Maximum pages extracted from a PDF (prevents DoS on very large documents) */
const MAX_PDF_PAGES = 200

/** Hard extraction timeout in milliseconds */
const EXTRACTION_TIMEOUT_MS = 30_000

export type ExtractionResult =
  | { ok: true; text: string; isLargeDocument: boolean }
  | { ok: false; reason: 'scanned_pdf' | 'extraction_failed' | 'extraction_timeout' }

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
  const timeoutPromise = new Promise<ExtractionResult>((resolve) =>
    setTimeout(() => resolve({ ok: false, reason: 'extraction_timeout' }), EXTRACTION_TIMEOUT_MS),
  )

  return Promise.race([doExtract(buffer, mimeType), timeoutPromise])
}

async function doExtract(buffer: Buffer, mimeType: string): Promise<ExtractionResult> {
  try {
    let text = ''

    if (mimeType === 'application/pdf') {
      const pdf = await getDocumentProxy(new Uint8Array(buffer))

      if (pdf.numPages > MAX_PDF_PAGES) {
        console.warn(
          `[extract-text] PDF has ${pdf.numPages} pages, exceeding cap of ${MAX_PDF_PAGES}`,
        )
        return { ok: false, reason: 'extraction_failed' }
      }

      // mergePages: false (P6.2a, ADR-DATA-007) — keep pages separate so each
      // one can be tagged with a `[PAGE N]` marker, rather than flattening
      // page boundaries away before a citation could ever point at one.
      const { text: pages } = await unpdfExtractText(pdf, { mergePages: false })
      text = pages.map((pageText, i) => `[PAGE ${i + 1}]\n${pageText}`).join('\n\n')

      // Scanned PDF detection — very little text extracted from image-only PDF
      if (text.trim().length < SCANNED_PDF_CHAR_THRESHOLD) {
        return { ok: false, reason: 'scanned_pdf' }
      }
    } else {
      // Word document (.docx via mammoth) — convertToHtml (not extractRawText)
      // so Word's heading styles survive as `[SECTION: ...]` markers instead
      // of being discarded (P6.2a, ADR-DATA-007). Docx has no fixed pages, so
      // headings are the fallback reference unit.
      const result = await mammoth.convertToHtml({ buffer })
      text = tagSectionsFromHtml(result.value ?? '')
    }

    const isLargeDocument = text.length > LARGE_DOCUMENT_CHAR_THRESHOLD

    return { ok: true, text, isLargeDocument }
  } catch {
    // Library error: corrupted file, unsupported encoding, etc.
    return { ok: false, reason: 'extraction_failed' }
  }
}

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

function stripTags(html: string): string {
  return decodeHtmlEntities(html.replace(/<[^>]+>/g, ''))
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Converts mammoth's HTML output into plain text with `[SECTION: A > B]`
 * markers inserted before each heading's content — preserving Word's heading
 * nesting (ADR-DATA-007) rather than extractRawText's flat, headingless
 * string. Not a full HTML parser: walks top-level block tags only, which is
 * all mammoth's default style map produces for headings/paragraphs/lists.
 */
function tagSectionsFromHtml(html: string): string {
  const blockPattern = /<(h[1-6]|p|li|td|th)[^>]*>([\s\S]*?)<\/\1>/gi
  const stack: { level: number; title: string }[] = []
  const lines: string[] = []
  let match: RegExpExecArray | null

  while ((match = blockPattern.exec(html)) !== null) {
    const tag = match[1].toLowerCase()
    const content = stripTags(match[2])
    if (!content) continue

    const headingLevel = /^h[1-6]$/.test(tag) ? parseInt(tag[1], 10) : null
    if (headingLevel !== null) {
      while (stack.length && stack[stack.length - 1].level >= headingLevel) stack.pop()
      stack.push({ level: headingLevel, title: content })
      lines.push(`[SECTION: ${stack.map((s) => s.title).join(' > ')}]`)
    } else {
      lines.push(content)
    }
  }

  return lines.join('\n\n')
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
