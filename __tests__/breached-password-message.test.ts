import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * GAP-106 — Supabase reports three distinct causes as one `weak_password`
 * code (`length`, `characters`, `pwned`). A breached password typically
 * already satisfies the length and character rules, so rendering the rule
 * message for the `pwned` case tells the user to do what they have already
 * done, with no way forward.
 *
 * These tests guard the mapping and the copy at the source level. The
 * behaviour itself cannot be unit-tested without a live GoTrue instance
 * holding the breach list — the end-to-end check belongs to P5.5 §3, which
 * registers with `Password123456` against production.
 */

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf-8')

describe('GAP-106 — breach-list password rejections are distinguished', () => {
  const auth = read('actions/auth.ts')

  it('reads the cause from the reasons array rather than the error code alone', () => {
    expect(auth).toContain('function isBreachedPassword')
    expect(auth).toContain("reasons.includes('pwned')")
  })

  it('maps the breach cause to its own state at every weak_password site', () => {
    // Only the `if` statements, not the comments above them that name the same
    // code — the first version of this test counted both and failed at 6.
    const sites = auth.match(/if \(\w+\.code === 'weak_password'\)/g) ?? []
    expect(sites.length).toBe(3)
    const branches = auth.match(/isBreachedPassword\(/g) ?? []
    // One guard definition plus one call per site.
    expect(branches.length).toBe(4)
  })

  it('carries breached_password in all three action result types', () => {
    for (const type of ['RegisterState', 'ResetPasswordState', 'ChangePasswordResult']) {
      const start = auth.indexOf(`export type ${type}`)
      expect(start, `${type} not found`).toBeGreaterThan(-1)
      const block = auth.slice(start, start + 400)
      expect(block, `${type} missing breached_password`).toContain('breached_password')
    }
  })
})

describe('GAP-106 — every form that can reject a password renders the message', () => {
  const forms = [
    'components/register-form.tsx',
    'components/reset-password-form.tsx',
    'components/account-settings-form.tsx',
  ]

  it.each(forms)('%s handles breached_password', (file) => {
    expect(read(file)).toContain('breached_password')
  })

  it.each(forms)('%s does not offer the rule advice for a breached password', (file) => {
    const src = read(file)
    const idx = src.indexOf('breached_password')
    expect(idx).toBeGreaterThan(-1)
    // The breach message must not repeat the length/characters instruction,
    // which is the defect this gap was raised for.
    const branch = src.slice(idx, idx + 700)
    expect(branch).not.toContain('at least 12 characters and include both letters and numbers.')
    expect(branch).toContain('data breach')
  })
})
