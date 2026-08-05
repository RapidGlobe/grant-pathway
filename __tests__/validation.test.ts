import { describe, it, expect } from 'vitest'
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_MESSAGE,
  passwordSchema,
  emailSchema,
  uuidSchema,
  requiredText,
  optionalText,
  nameSchema,
  answerTextSchema,
} from '@/lib/validation'

// Tests for the shared Server Action validation schemas (GAP-25, ADR-ARCH-003).
//
// These exist because the schemas are now the security boundary for every
// Server Action in actions/auth.ts and actions/applications.ts. The actions
// themselves are not unit-tested here — they need a Supabase session, and
// cross-user behaviour is GAP-17's job in P5.2. What is tested is the layer
// that decides what reaches the database at all.

describe('passwordSchema — the application password policy', () => {
  it('states the policy the three client forms already show', () => {
    // If this drifts, the server rejects passwords the client accepted (or the
    // reverse) -- the exact inconsistency the PRD's 0.3/0.4 revisions record
    // being found live and fixed once already.
    expect(PASSWORD_MIN_LENGTH).toBe(12)
    expect(PASSWORD_MESSAGE).toBe(
      'Your password must be at least 12 characters and include both letters and numbers',
    )
  })

  it('accepts a password with 12+ characters, a letter and a digit', () => {
    expect(passwordSchema.safeParse('correct1horse').success).toBe(true)
  })

  it('rejects a password shorter than 12 characters', () => {
    expect(passwordSchema.safeParse('short1abc').success).toBe(false)
  })

  it('rejects a 12-character password with no digit', () => {
    expect(passwordSchema.safeParse('abcdefghijkl').success).toBe(false)
  })

  it('rejects a 12-character password with no letter', () => {
    expect(passwordSchema.safeParse('123456789012').success).toBe(false)
  })

  it('does not trim the password — a space is a legitimate character', () => {
    // Sign-in trims defensively against clipboard whitespace (2026-07-28), but
    // the policy schema must not silently alter a password the user chose.
    const withInnerSpace = 'my pass word1'
    const parsed = passwordSchema.safeParse(withInnerSpace)
    expect(parsed.success).toBe(true)
    if (parsed.success) expect(parsed.data).toBe(withInnerSpace)
  })

  it('reports the single user-facing message rather than three separate ones', () => {
    const parsed = passwordSchema.safeParse('abc')
    expect(parsed.success).toBe(false)
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        expect(issue.message).toBe(PASSWORD_MESSAGE)
      }
    }
  })
})

describe('emailSchema', () => {
  it('trims surrounding whitespace before validating', () => {
    // A trailing space or newline from a mobile clipboard paste must not turn a
    // correct address into a validation failure.
    const parsed = emailSchema.safeParse('  someone@example.org \n')
    expect(parsed.success).toBe(true)
    if (parsed.success) expect(parsed.data).toBe('someone@example.org')
  })

  it('rejects a value with no @', () => {
    expect(emailSchema.safeParse('not-an-email').success).toBe(false)
  })

  it('rejects an empty string', () => {
    expect(emailSchema.safeParse('').success).toBe(false)
  })

  it('rejects a non-string', () => {
    expect(emailSchema.safeParse(null).success).toBe(false)
    expect(emailSchema.safeParse(42).success).toBe(false)
  })
})

describe('uuidSchema — the guard on every row id crossing the action boundary', () => {
  it('accepts a real UUID', () => {
    expect(uuidSchema.safeParse('3f2504e0-4f89-11d3-9a0c-0305e82c3301').success).toBe(true)
  })

  it('rejects a non-UUID string', () => {
    // Every id this app passes to a Server Action is a Postgres uuid column, so
    // anything else cannot name a real row and should never reach a query.
    expect(uuidSchema.safeParse('1').success).toBe(false)
    expect(uuidSchema.safeParse('../../etc/passwd').success).toBe(false)
    expect(uuidSchema.safeParse("' OR 1=1 --").success).toBe(false)
  })

  it('rejects undefined, null and objects', () => {
    expect(uuidSchema.safeParse(undefined).success).toBe(false)
    expect(uuidSchema.safeParse(null).success).toBe(false)
    expect(uuidSchema.safeParse({}).success).toBe(false)
  })
})

describe('requiredText', () => {
  const schema = requiredText('Please enter a value')

  it('trims and accepts real content', () => {
    const parsed = schema.safeParse('  Henry Smith Charity  ')
    expect(parsed.success).toBe(true)
    if (parsed.success) expect(parsed.data).toBe('Henry Smith Charity')
  })

  it('rejects a whitespace-only value', () => {
    // This is the case that matters: without the trim, '   ' is a non-empty
    // string and would be stored as a funder name.
    expect(schema.safeParse('   ').success).toBe(false)
  })

  it('rejects an empty string and carries the supplied message', () => {
    const parsed = schema.safeParse('')
    expect(parsed.success).toBe(false)
    if (!parsed.success) expect(parsed.error.issues[0]?.message).toBe('Please enter a value')
  })
})

describe('optionalText', () => {
  it('trims a supplied value', () => {
    const parsed = optionalText.safeParse('  Wolfson  ')
    expect(parsed.success).toBe(true)
    if (parsed.success) expect(parsed.data).toBe('Wolfson')
  })

  it('normalises null and undefined to an empty string', () => {
    // So callers can pass the result straight to a column without a null check.
    for (const value of [null, undefined]) {
      const parsed = optionalText.safeParse(value)
      expect(parsed.success).toBe(true)
      if (parsed.success) expect(parsed.data).toBe('')
    }
  })
})

describe('nameSchema', () => {
  it('accepts names with apostrophes, hyphens and non-Latin scripts', () => {
    // A charity worker whose name this rejects cannot register at all, so the
    // character set is deliberately permissive.
    for (const name of ["O'Brien", 'Anne-Marie', 'Siân', 'Ọlá', '张伟']) {
      expect(nameSchema.safeParse(name).success).toBe(true)
    }
  })

  it('rejects empty and whitespace-only names', () => {
    expect(nameSchema.safeParse('').success).toBe(false)
    expect(nameSchema.safeParse('  ').success).toBe(false)
  })

  it('rejects an absurdly long name', () => {
    expect(nameSchema.safeParse('a'.repeat(101)).success).toBe(false)
  })
})

describe('answerTextSchema', () => {
  it('accepts an empty answer', () => {
    // A blank answer is a legitimate intermediate state, saved constantly by
    // Step 4's debounced auto-save.
    expect(answerTextSchema.safeParse('').success).toBe(true)
  })

  it('accepts a long but plausible answer', () => {
    expect(answerTextSchema.safeParse('word '.repeat(2000)).success).toBe(true)
  })

  it('rejects an answer beyond the backstop ceiling', () => {
    expect(answerTextSchema.safeParse('x'.repeat(100_001)).success).toBe(false)
  })

  it('coerces a non-string to an empty string rather than throwing', () => {
    const parsed = answerTextSchema.safeParse(undefined)
    expect(parsed.success).toBe(true)
    if (parsed.success) expect(parsed.data).toBe('')
  })
})
