import { describe, it, expect } from 'vitest'

// Unit tests for the path-prefix ownership check in app/api/upload/process/route.ts.
// These mirror the guard: `if (!path.startsWith(user.id + '_')) return 403`

function isPathOwned(userId: string, path: string): boolean {
  return path.startsWith(userId + '_')
}

const USER_A = 'aaaaaaaa-0000-0000-0000-000000000001'
const USER_B = 'bbbbbbbb-0000-0000-0000-000000000002'

describe('upload path prefix ownership check (IDOR guard)', () => {
  it('allows a path that starts with the caller user id', () => {
    expect(isPathOwned(USER_A, `${USER_A}_guidelines.pdf`)).toBe(true)
  })

  it('rejects a path belonging to a different user', () => {
    expect(isPathOwned(USER_A, `${USER_B}_guidelines.pdf`)).toBe(false)
  })

  it('rejects an empty path', () => {
    expect(isPathOwned(USER_A, '')).toBe(false)
  })

  it('rejects a path that contains the user id but does not start with it', () => {
    expect(isPathOwned(USER_A, `prefix_${USER_A}_guidelines.pdf`)).toBe(false)
  })

  it('rejects a path where underscore separator is missing', () => {
    // Path starts with userId but no underscore — not a valid owned path
    expect(isPathOwned(USER_A, `${USER_A}guidelines.pdf`)).toBe(false)
  })

  it('rejects a path that is just the user id with no filename', () => {
    // No underscore after the id means no filename component
    expect(isPathOwned(USER_A, USER_A)).toBe(false)
  })
})
