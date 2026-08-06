// GAP-41 — line-break fidelity in the Word export.
//
// A real applicant laid out a 215-word answer with blank lines, a hyphen
// bulleted list and a worked calculation. The .docx she downloaded rendered all
// of it as one continuous run of prose, because the `docx` library ignores
// `\n` inside a TextRun and the export passed each whole answer as one run.
//
// Two layers here, deliberately:
//
//   1. Unit assertions on the runs `answerRuns` produces.
//   2. A test that actually PACKS A DOCUMENT and reads the generated
//      WordprocessingML, because the defect was invisible at the level of
//      "we passed the right string" — the string was always right. It only
//      showed up in the file. An assertion that stops short of the file would
//      have passed against the broken code too, which is exactly how
//      regression-test-plan.md RT-09 passed over this bug on 2026-07-28.

import { describe, it, expect } from 'vitest'
import { Document, Packer, Paragraph } from 'docx'
import JSZip from 'jszip'
import { answerRuns } from '@/lib/docx-text'

const BLACK = { color: '000000', italics: false }

/** Pack a one-paragraph document and return its raw document.xml. */
async function documentXml(text: string): Promise<string> {
  const doc = new Document({
    sections: [{ children: [new Paragraph({ children: answerRuns(text, BLACK) })] }],
  })
  const zip = await JSZip.loadAsync(await Packer.toBuffer(doc))
  const xml = await zip.file('word/document.xml')?.async('string')
  if (!xml) throw new Error('document.xml missing from generated .docx')
  return xml
}

describe('answerRuns', () => {
  it('produces one run per line', () => {
    expect(answerRuns('one\ntwo\nthree', BLACK)).toHaveLength(3)
  })

  it('never puts a break on the first run', () => {
    // Otherwise every answer would open with a blank line under its heading.
    const [first] = answerRuns('one\ntwo', BLACK)
    expect(JSON.stringify(first)).not.toContain('"break"')
  })

  it('keeps a single-line answer as a single run', () => {
    expect(answerRuns('Just the one line.', BLACK)).toHaveLength(1)
  })

  it('preserves blank lines as their own runs', () => {
    // A blank line between paragraphs is the applicant's formatting, not noise.
    expect(answerRuns('para one\n\npara two', BLACK)).toHaveLength(3)
  })

  it('normalises CRLF so pasted Windows text gains no phantom blank lines', () => {
    expect(answerRuns('one\r\ntwo\r\nthree', BLACK)).toHaveLength(3)
    expect(answerRuns('one\rtwo', BLACK)).toHaveLength(2)
  })
})

describe('the generated .docx itself', () => {
  it('contains a real line break between lines', async () => {
    const xml = await documentXml('one\ntwo\nthree')
    // Three lines → two breaks. Under the old single-TextRun code this was
    // zero, and no assertion short of reading the file would have noticed.
    expect(xml.match(/<w:br\s*\/>/g) ?? []).toHaveLength(2)
    expect(xml).toContain('one')
    expect(xml).toContain('two')
    expect(xml).toContain('three')
  })

  it('reproduces a real applicant answer: blank lines, bullets and a calculation', async () => {
    // Shortened from the genuine Stony Stratford answer that exposed GAP-41.
    const answer = [
      'The Larder has been operating since February 2023.',
      '',
      'Since April 2025, York House has introduced a fee for:',
      '',
      '- Main Hall',
      '- Storage',
      '- Kitchen',
      '',
      '3.3 * 48 * £18.00 = £2,850',
    ].join('\n')

    const xml = await documentXml(answer)

    // 9 lines → 8 breaks. Before the fix: 0, and the whole answer arrived as
    // one paragraph of prose with the bullets run together mid-sentence.
    expect(xml.match(/<w:br\s*\/>/g) ?? []).toHaveLength(8)
    expect(xml).toContain('Main Hall')
    expect(xml).toContain('Storage')
  })

  it('emits no breaks at all for a single-line answer', async () => {
    const xml = await documentXml('One line only.')
    expect(xml.match(/<w:br\s*\/>/g) ?? []).toHaveLength(0)
  })

  it('keeps the empty-answer placeholder on one line', async () => {
    const xml = await documentXml('[No answer provided]')
    expect(xml.match(/<w:br\s*\/>/g) ?? []).toHaveLength(0)
  })
})
