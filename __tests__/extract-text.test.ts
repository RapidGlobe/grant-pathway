import { describe, it, expect } from 'vitest'
import { tagSectionsFromHtml } from '@/lib/extract-text'

describe('tagSectionsFromHtml — real headings produce [SECTION: ...] markers (ADR-DATA-007, P6.2a)', () => {
  it('tags a single top-level heading', () => {
    const html = '<h1>Eligibility</h1><p>Who can apply.</p>'
    const out = tagSectionsFromHtml(html)
    expect(out).toContain('[SECTION: Eligibility]')
    expect(out).toContain('Who can apply.')
  })

  it('nests a sub-heading under its parent, matching Word heading levels', () => {
    const html = '<h1>Eligibility</h1><p>Intro.</p><h2>Who can refer a family</h2><p>Detail.</p>'
    const out = tagSectionsFromHtml(html)
    expect(out).toContain('[SECTION: Eligibility]')
    expect(out).toContain('[SECTION: Eligibility > Who can refer a family]')
  })

  it('pops back to the correct level when a heading of equal or higher level follows a nested one', () => {
    const html =
      '<h1>Eligibility</h1><h2>Referrals</h2><p>Detail.</p><h1>Financial information</h1><p>More detail.</p>'
    const out = tagSectionsFromHtml(html)
    expect(out).toContain('[SECTION: Eligibility > Referrals]')
    expect(out).toContain('[SECTION: Financial information]')
    expect(out).not.toContain('Eligibility > Referrals > Financial information')
  })

  it('leaves non-heading blocks (p/li/td/th) unmarked when at least one real heading exists', () => {
    const html = '<h1>Eligibility</h1><li>A bullet with no marker of its own.</li>'
    const out = tagSectionsFromHtml(html)
    expect(out).toContain('A bullet with no marker of its own.')
    expect(out).not.toMatch(/\[ITEM \d+\]/)
  })
})

describe('tagSectionsFromHtml — [ITEM N] fallback when a document has zero real headings (2026-07-21 amendment)', () => {
  // Confirmed by unzipping the actual Wolfson Foundation Health & Disability
  // docx: every paragraph uses Word's default "Normal" style (zero w:pStyle
  // Heading references anywhere in the file), so mammoth's convertToHtml
  // never produces an <h1>-<h6> tag for it — the whole document arrives here
  // as a flat sequence of <p>/<li> blocks with nothing to become a
  // [SECTION: ...] marker, and (being a docx, not a PDF) no [PAGE N] marker
  // either. Previously this meant zero citations were ever possible.
  it('numbers every paragraph/list block [ITEM N] when the html has no heading tags at all', () => {
    const html = [
      '<p>Applicant details</p>',
      '<li>Name and address of the organisation</li>',
      '<li>UK charity number, if applicable</li>',
      '<p>Project details</p>',
      '<li>Title of project (max 25 words) and project summary (max 400 words)</li>',
    ].join('')

    const out = tagSectionsFromHtml(html)

    expect(out).toContain('[ITEM 1]\nApplicant details')
    expect(out).toContain('[ITEM 2]\nName and address of the organisation')
    expect(out).toContain('[ITEM 3]\nUK charity number, if applicable')
    expect(out).toContain('[ITEM 4]\nProject details')
    expect(out).toContain(
      '[ITEM 5]\nTitle of project (max 25 words) and project summary (max 400 words)',
    )
    expect(out).not.toMatch(/\[SECTION:/)
  })

  it('skips empty blocks when numbering, so item numbers stay contiguous', () => {
    const html = ['<p>First real content.</p>', '<p></p>', '<p>Second real content.</p>'].join('')

    const out = tagSectionsFromHtml(html)

    expect(out).toContain('[ITEM 1]\nFirst real content.')
    expect(out).toContain('[ITEM 2]\nSecond real content.')
    expect(out).not.toMatch(/\[ITEM 3\]/)
  })

  it('produces an empty string for html with no content blocks at all', () => {
    const out = tagSectionsFromHtml('<div>no recognised block tags</div>')
    expect(out).toBe('')
  })
})
