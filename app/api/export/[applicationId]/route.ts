// GET /api/export/[applicationId] (S7.2, S7.3)
//
// Generates and streams a Word (.docx) or plain-text export of an approved
// application. Returns a downloadable file response.
//
// Query parameters:
//   format=docx  (default) — Word document per PDR-DH-003
//   format=txt            — plain-text version
//
// Auth: caller must be signed in and own the application.
// Status: application must be 'approved' or 'exported'.
//
// On every successful export:
//   - applications.status   → 'exported'
//   - applications.last_exported_at → now()
//
// Document format (PDR-DH-003):
//   A4 page (11906 × 16838 twips), 2.54 cm margins (1440 twips)
//   Default font: Calibri 11pt
//   Title:      [Grant Name] — Application (18pt bold, centred)
//   Sub-header: Prepared for: [Funder Name] | Date: [export date] (11pt, centred)
//   Separator:  horizontal rule
//   Disclaimer: italic disclaimer paragraph (11pt)
//   Q&A:        Question N (14pt bold) followed by answer paragraph (11pt)
//   Footer:     "Prepared using Grant Pathway v[version] — grantpathway.org.uk" (9pt, centred),
//               "Page N of NN" on the line below (Word only)
//   NOTE (2026-07-02): the version number is intentional -- see PDR-DH-003 --
//   it exists for support/issue-reporting traceability. Do not remove it
//   without checking that decision record first. Auto-derived from Vercel's
//   build-time Git metadata (lib/version.ts) -- not a manually-bumped number.

import { NextRequest, NextResponse } from 'next/server'
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
  UnderlineType,
  Footer,
  PageNumber,
} from 'docx'

// A4 page dimensions in twips (1 twip = 1/1440 inch)
const A4_WIDTH_TWIPS = 11906
const A4_HEIGHT_TWIPS = 16838
import { createClient } from '@/lib/supabase/server'
import { getAppVersion } from '@/lib/version'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format a Date as "DD Month YYYY, HH:MM" (24-hour, London time) */
function formatDate(date: Date): string {
  const datePart = date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/London',
  })
  const timePart = date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Europe/London',
  })
  return `${datePart}, ${timePart}`
}

/** Convert points to half-points (docx size unit) */
function pt(points: number): number {
  return points * 2
}

/** Twips per centimetre (1 twip = 1/1440 inch; 1 inch = 2.54 cm) */
const TWIPS_PER_CM = 1440 / 2.54

/** Build a horizontal-rule paragraph (thin top border) */
function hrParagraph(): Paragraph {
  return new Paragraph({
    border: {
      top: {
        style: BorderStyle.SINGLE,
        size: 6,
        color: 'AAAAAA',
        space: 6,
      },
    },
    spacing: { before: 120, after: 120 },
  })
}

/**
 * Parses the assembled_draft text (produced by assembleAndAdvance) into
 * sections. Each section has a heading (the question line, e.g. "1. Question")
 * and body (the answer text). Sections are separated by "\n\n---\n\n".
 */
type DraftSection = { heading: string; body: string }

function parseAssembledDraft(text: string): DraftSection[] {
  if (!text.trim()) return []
  return text
    .split('\n\n---\n\n')
    .map((block) => {
      const idx = block.indexOf('\n\n')
      if (idx === -1) return { heading: block.trim(), body: '' }
      return {
        heading: block.slice(0, idx).trim(),
        body: block.slice(idx + 2).trim(),
      }
    })
    .filter((s) => s.heading)
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

interface RouteParams {
  params: Promise<{ applicationId: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { applicationId } = await params
  const format = request.nextUrl.searchParams.get('format') ?? 'docx'

  const supabase = await createClient()

  // ── Auth check ─────────────────────────────────────────────────────────────
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Fetch application (ownership check via user_id) ─────────────────────
  const { data: application, error: appError } = await supabase
    .from('applications')
    .select('id, funder_name, grant_name, status, assembled_draft')
    .eq('id', applicationId)
    .eq('user_id', user.id)
    .single()

  if (appError || !application) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 })
  }

  // ── Status check ───────────────────────────────────────────────────────────
  if (application.status !== 'approved' && application.status !== 'exported') {
    return NextResponse.json(
      { error: 'Application must be approved before export' },
      { status: 422 },
    )
  }

  // ── Fetch answers ──────────────────────────────────────────────────────────
  const { data: answers, error: answersError } = await supabase
    .from('application_items')
    .select('item_order, item_label, answer_text')
    .eq('application_id', applicationId)
    .eq('user_id', user.id)
    .order('item_order')

  if (answersError || !answers) {
    return NextResponse.json({ error: 'Could not fetch answers' }, { status: 500 })
  }

  // ── Fetch user profile (for disclaimer) ────────────────────────────────────
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('first_name, last_name')
    .eq('user_id', user.id)
    .single()

  const fullName = profile ? `${profile.first_name} ${profile.last_name}`.trim() : 'the applicant'

  // ── Mark as exported ────────────────────────────────────────────────────────
  await supabase
    .from('applications')
    .update({
      status: 'exported',
      last_exported_at: new Date().toISOString(),
    })
    .eq('id', applicationId)
    .eq('user_id', user.id)

  const exportDate = formatDate(new Date())
  const funderName = application.funder_name as string
  const grantName = application.grant_name as string
  const assembledDraft = (application.assembled_draft as string | null) ?? null
  const appVersion = getAppVersion()

  const disclaimer = `Disclaimer: This application was prepared with AI assistance and reviewed by ${fullName}. All content has been checked for accuracy before submission.`
  const safeName = grantName
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '_')

  // ── Plain text export ──────────────────────────────────────────────────────
  if (format === 'txt') {
    const lines: string[] = []
    lines.push(`${grantName} — Application`)
    lines.push(`Prepared for: ${funderName}`)
    lines.push(`Date: ${exportDate}`)
    lines.push('')
    lines.push(disclaimer)
    lines.push('')
    lines.push('─'.repeat(72))
    lines.push('')

    if (assembledDraft) {
      lines.push(assembledDraft)
    } else {
      for (const answer of answers) {
        const qNum = answer.item_order as number
        const qText = (answer.item_label as string) ?? ''
        const aText = (answer.answer_text as string) ?? ''
        lines.push(`Question ${qNum}: ${qText}`)
        lines.push('')
        lines.push(aText || '[No answer provided]')
        lines.push('')
        lines.push('─'.repeat(72))
        lines.push('')
      }
    }

    lines.push('')
    lines.push(`Prepared using Grant Pathway v${appVersion} — grantpathway.org.uk`)

    return new Response(lines.join('\n'), {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="${safeName}_Application.txt"`,
      },
    })
  }

  // ── Word (.docx) export ────────────────────────────────────────────────────
  const marginTwips = Math.round(2.54 * TWIPS_PER_CM) // 1440

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'Calibri',
            size: pt(11),
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              width: A4_WIDTH_TWIPS,
              height: A4_HEIGHT_TWIPS,
            },
            margin: {
              top: marginTwips,
              bottom: marginTwips,
              left: marginTwips,
              right: marginTwips,
            },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `Prepared using Grant Pathway v${appVersion} — grantpathway.org.uk`,
                    font: 'Calibri',
                    size: pt(9),
                    color: '888888',
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'Page ', font: 'Calibri', size: pt(9), color: '888888' }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: 'Calibri',
                    size: pt(9),
                    color: '888888',
                  }),
                  new TextRun({ text: ' of ', font: 'Calibri', size: pt(9), color: '888888' }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    font: 'Calibri',
                    size: pt(9),
                    color: '888888',
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          // ── Title ──────────────────────────────────────────────────────────
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 160 },
            children: [
              new TextRun({
                text: `${grantName} — Application`,
                bold: true,
                font: 'Calibri',
                size: pt(18),
              }),
            ],
          }),

          // ── Sub-header: funder + date ──────────────────────────────────────
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 80 },
            children: [
              new TextRun({
                text: `Prepared for: ${funderName}`,
                font: 'Calibri',
                size: pt(11),
              }),
              new TextRun({
                text: `   |   Date: ${exportDate}`,
                font: 'Calibri',
                size: pt(11),
                color: '555555',
              }),
            ],
          }),

          // ── Horizontal rule ────────────────────────────────────────────────
          hrParagraph(),

          // ── Disclaimer ────────────────────────────────────────────────────
          new Paragraph({
            spacing: { after: 240 },
            children: [
              new TextRun({
                text: disclaimer,
                italics: true,
                font: 'Calibri',
                size: pt(10),
                color: '555555',
              }),
            ],
          }),

          // ── Q&A (from assembled_draft if available, else from answer rows) ─
          ...(assembledDraft
            ? parseAssembledDraft(assembledDraft).flatMap(({ heading, body }) => [
                new Paragraph({
                  spacing: { before: 320, after: 120 },
                  children: [
                    new TextRun({
                      text: heading,
                      bold: true,
                      font: 'Calibri',
                      size: pt(14),
                      underline: { type: UnderlineType.SINGLE },
                    }),
                  ],
                }),
                new Paragraph({
                  spacing: { after: 200 },
                  children: [
                    new TextRun({
                      text: body || '[No answer provided]',
                      font: 'Calibri',
                      size: pt(11),
                      color: body ? '000000' : '888888',
                      italics: !body,
                    }),
                  ],
                }),
              ])
            : answers.flatMap((answer) => {
                const qNum = answer.item_order as number
                const qText = (answer.item_label as string) ?? ''
                const aText = (answer.answer_text as string) ?? ''
                return [
                  new Paragraph({
                    spacing: { before: 320, after: 120 },
                    children: [
                      new TextRun({
                        text: `Question ${qNum}: ${qText}`,
                        bold: true,
                        font: 'Calibri',
                        size: pt(14),
                        underline: { type: UnderlineType.SINGLE },
                      }),
                    ],
                  }),
                  new Paragraph({
                    spacing: { after: 200 },
                    children: [
                      new TextRun({
                        text: aText || '[No answer provided]',
                        font: 'Calibri',
                        size: pt(11),
                        color: aText ? '000000' : '888888',
                        italics: !aText,
                      }),
                    ],
                  }),
                ]
              })),

          // ── End spacer ────────────────────────────────────────────────────
          new Paragraph({ spacing: { before: 480 } }),
        ],
      },
    ],
  })

  const buffer = await Packer.toBuffer(doc)

  // Convert Buffer → Uint8Array for BodyInit compatibility
  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${safeName}_Application.docx"`,
    },
  })
}
