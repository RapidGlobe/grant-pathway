// Input-side fidelity for the extraction pipeline (GCM-06 precondition).
//
// WHY THIS EXISTS, AND WHAT IT IS NOT
//
// `GAP-39` (two substantive questions never extracted) and `GAP-40` (two
// adjacent sub-questions merged) were fixed by rewriting rules in
// `lib/prompts.ts`. Those fixes only mean anything if the questions in question
// actually SURVIVE extraction and preprocessing and reach the model in the
// first place. Nothing tested that layer, so a failure there would have been
// indistinguishable from a prompt that was not working — and the obvious next
// move would have been to keep editing the prompt.
//
// This file tests the pipeline UP TO the model: docx -> extractText ->
// preprocessText -> the string the prompt embeds. It deliberately says nothing
// about what the model then does with it, which only a live GCM-06 run can
// establish.
//
// Verified 2026-08-06: this document passes through at 8,998 characters
// unchanged, well under the preprocessing ceiling, with every probe below
// present. So the model demonstrably saw §4e and §4f and chose to drop them —
// which is what makes `GAP-39` a judgement problem in the prompt rather than an
// input problem, and is the single most useful fact for anyone debugging this
// later.

import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'node:fs'
import { extractText } from '@/lib/extract-text'
import { preprocessText } from '@/lib/preprocess-text'

const FIXTURE = 'docs/Grant Org Guidelines/Stony Stratford Grant-Application-Form-2026.docx'
const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

let raw = ''
let prepared = ''

beforeAll(async () => {
  const extracted = await extractText(readFileSync(FIXTURE), DOCX_MIME)
  // `ExtractionResult` is a discriminated union — a scanned PDF, a failure or a
  // timeout carries no text at all. Assert rather than cast: if this fixture
  // ever stops extracting, that is itself the finding, and every assertion
  // below would otherwise fail with a confusing "expected '' to contain…".
  if (!extracted.ok) {
    throw new Error(`Fixture failed to extract (${extracted.reason}): ${FIXTURE}`)
  }
  raw = extracted.text
  prepared = preprocessText(extracted.text).text
}, 60_000)

describe('Stony Stratford form — text reaching the model', () => {
  it('is not truncated by preprocessing', () => {
    // Comfortably under the ceiling. If this ever changes, questions could be
    // lost for a reason no prompt edit can fix.
    expect(prepared.length).toBe(raw.length)
    expect(prepared.length).toBeGreaterThan(5000)
  })

  it('carries all six of §4’s lettered sub-questions', () => {
    // a)–d) were extracted; e) and f) were not (GAP-39). All six are present in
    // the input, which is the whole point — the difference was the model's
    // judgement, not the text it was given.
    for (const probe of [
      'What particular need will this application meet in the parish?',
      'How have you identified the need?',
      'If users are to be involved in managing the project, briefly explain how.',
      'If users will not be involved in managing the project, briefly explain why.',
      'Please give an accurate figure for the number of people in the parish the project will serve.',
      'For how long will the project run?',
    ]) {
      expect(prepared).toContain(probe)
    }
  })

  it('carries §10’s shared stem and both of its lettered parts', () => {
    // This is the exact shape GAP-40's fix targets: neither part reads as a
    // complete question alone, so the stem has to be combined with each rather
    // than used as grounds to merge them.
    expect(prepared).toContain('Please state what you hope to have achieved:')
    expect(prepared).toContain('Six months after receiving a grant')
    expect(prepared).toContain('Twelve months after receiving a grant')
  })

  it('keeps §4e and §4f adjacent to the sub-questions that were extracted', () => {
    // Proximity matters to the diagnosis: the two dropped asks sit in the same
    // block as four that came through, so nothing about their position or
    // formatting explains the loss.
    const d = prepared.indexOf('If users will not be involved')
    const e = prepared.indexOf('accurate figure for the number of people')
    const f = prepared.indexOf('For how long will the project run')
    expect(d).toBeGreaterThan(-1)
    expect(e).toBeGreaterThan(d)
    expect(f).toBeGreaterThan(e)
    // All within a few hundred characters of each other, i.e. one contiguous run.
    expect(f - d).toBeLessThan(400)
  })

  it('tags the section headings the citations depend on', () => {
    expect(prepared).toContain('[SECTION: APPLICATION BACKGROUND.]')
    expect(prepared).toContain('[SECTION: 10. MONITORING PROGRESS.]')
  })

  it('retains the non-narrative material the prompt is expected to exclude', () => {
    // The exclusions must be the prompt's decision, not an accident of
    // preprocessing — otherwise a future prompt change could not reinstate
    // anything even if it should.
    expect(prepared).toContain('SUPPORTING DOCUMENTS')
    expect(prepared).toContain('CONTACT PERSON')
  })
})
