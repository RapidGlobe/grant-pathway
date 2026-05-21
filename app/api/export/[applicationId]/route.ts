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
//   Footer:     "Prepared using Grant Pathway v1 — grantpathway.org.uk" (9pt, centred)

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
} from 'docx'

// A4 page dimensions in twips (1 twip = 1/1440 inch)
const A4_WIDTH_TWIPS = 11906
const A4_HEIGHT_TWIPS = 16838
import { createClient } from '@/lib/supabase/server'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format a Date as "DD Month YYYY" */
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
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
    .select('id, funder_name, grant_name, status')
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
    .from('application_answers')
    .select('question_order, question_text, answer_text')
    .eq('application_id', applicationId)
    .eq('user_id', user.id)
    .order('question_order')

  if (answersError || !answers) {
    return NextResponse.json({ error: 'Could not fetch answers' }, { status: 500 })
  }

  // ── Fetch user profile (for disclaimer) ────────────────────────────────────
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('first_name, last_name')
    .eq('user_id', user.id)
    .single()

  const fullName =
    profile ? `${profile.first_name} ${profile.last_name}`.trim() : 'the applicant'

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

  // ── Plain text export ──────────────────────────────────────────────────────
  if (format === 'txt') {
    const lines: string[] = []
    lines.push(`${grantName} — Application`)
    lines.push(`Prepared for: ${funderName}`)
    lines.push(`Date: ${exportDate}`)
    lines.push('')
    lines.push(
      `Disclaimer: This application was drafted with AI assistance and reviewed by ${fullName}. All content has been checked for accuracy before submission.`,
    )
    lines.push('')
    lines.push('─'.repeat(72))
    lines.push('')

    for (const answer of answers) {
      const qNum = answer.question_order as number
      const qText = (answer.question_text as string) ?? ''
      const aText = (answer.answer_text as string) ?? ''
      lines.push(`Question ${qNum}: ${qText}`)
      lines.push('')
      lines.push(aText || '[No answer provided]')
      lines.push('')
      lines.push('─'.repeat(72))
      lines.push('')
    }

    lines.push('Prepared using Grant Pathway v1 — grantpathway.org.uk')

    const txtContent = lines.join('\n')
    const safeName = grantName.replace(/[^a-zA-Z0-9\s-]/g, '').trim().replace(/\s+/g, '_')

    return new Response(txtContent, {
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
                    text: 'Prepared using Grant Pathway v1 — grantpathway.org.uk',
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
                text: `Disclaimer: This application was drafted with AI assistance and reviewed by ${fullName}. All content has been checked for accuracy before submission.`,
                italics: true,
                font: 'Calibri',
                size: pt(10),
                color: '555555',
              }),
            ],
          }),

          // ── Q&A ────────────────────────────────────────────────────────────
          ...answers.flatMap((answer) => {
            const qNum = answer.question_order as number
            const qText = (answer.question_text as string) ?? ''
            const aText = (answer.answer_text as string) ?? ''

            return [
              // Question heading
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
              // Answer
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
          }),

          // ── End spacer ────────────────────────────────────────────────────
          new Paragraph({ spacing: { before: 480 } }),
        ],
      },
    ],
  })

  const buffer = await Packer.toBuffer(doc)
  const safeName = grantName.replace(/[^a-zA-Z0-9\s-]/g, '').trim().replace(/\s+/g, '_')

  // Convert Buffer → Uint8Array for BodyInit compatibility
  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${safeName}_Application.docx"`,
    },
  })
}
