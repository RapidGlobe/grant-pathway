// @vitest-environment happy-dom
//
// DEF-02 — the show/hide-password toggle.
//
// AC-01 found the toggle rendering at exactly its icon's size, 16×16, against
// the 24×24 minimum WCAG 2.2 SC 2.5.8 requires. It was reported as six
// instances in one component. Both halves of that were wrong:
//
//   - Eight instances, not six. reset-password-form.tsx has two more that the
//     sweep never saw, because reaching that page needs a real reset link from
//     an email.
//   - Four copies of the same markup, not one component. sign-in (1),
//     register (2), reset-password (2), account settings (3).
//
// So the fix was an extraction rather than a patch, and these tests exist to
// hold the two properties that were silently wrong in all eight copies and
// would be silently wrong again in a ninth: the target size, and a distinct
// accessible name.
//
// Size is asserted from the Tailwind classes rather than getBoundingClientRect,
// because happy-dom does not apply Tailwind's stylesheet — a layout assertion
// here would read 0×0 and pass or fail for reasons unconnected to the code.
// The real geometry is checked in the browser and recorded in DEF-02's entry.

import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { PasswordInput } from '@/components/ui/password-input'

afterEach(cleanup)

describe('DEF-02 — PasswordInput toggle', () => {
  it('starts masked', () => {
    render(<PasswordInput id="p" aria-label="Password" />)
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password')
  })

  it('reveals and re-masks the value', () => {
    render(<PasswordInput id="p" aria-label="Password" />)
    const field = screen.getByLabelText('Password')

    fireEvent.click(screen.getByRole('button', { name: 'Show password' }))
    expect(field).toHaveAttribute('type', 'text')

    fireEvent.click(screen.getByRole('button', { name: 'Hide password' }))
    expect(field).toHaveAttribute('type', 'password')
  })

  it('meets the 24x24 minimum target size (SC 2.5.8)', () => {
    render(<PasswordInput id="p" aria-label="Password" />)
    const button = screen.getByRole('button', { name: 'Show password' })

    // h-7 w-7 = 28x28, comfortably over the 24x24 floor. The failing original
    // set no size at all, so the button collapsed to its 16x16 icon.
    expect(button.className).toContain('h-7')
    expect(button.className).toContain('w-7')
    expect(button.className).not.toContain('h-4')
  })

  it('keeps the icon decorative so the button has one accessible name', () => {
    const { container } = render(<PasswordInput id="p" aria-label="Password" />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
  })

  it('names the toggle distinctly when a screen has several password fields', () => {
    // The failure this prevents: three buttons all announcing "Show password"
    // on /account, where a screen-reader user cannot tell which field each
    // belongs to. All three copies there had distinct labels by hand; nothing
    // enforced it.
    render(
      <>
        <PasswordInput id="a" aria-label="Current" toggleLabel="current password" />
        <PasswordInput id="b" aria-label="New" toggleLabel="new password" />
        <PasswordInput id="c" aria-label="Confirm" toggleLabel="confirm password" />
      </>,
    )
    expect(screen.getByRole('button', { name: 'Show current password' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Show new password' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Show confirm password' })).toBeInTheDocument()
  })

  it('toggles only its own field', () => {
    render(
      <>
        <PasswordInput id="a" aria-label="First" toggleLabel="new password" />
        <PasswordInput id="b" aria-label="Second" toggleLabel="confirm password" />
      </>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Show new password' }))
    expect(screen.getByLabelText('First')).toHaveAttribute('type', 'text')
    expect(screen.getByLabelText('Second')).toHaveAttribute('type', 'password')
  })

  it('does not submit the form it sits in', () => {
    // type="button" matters: without it the toggle defaults to submit and
    // revealing the password would post a half-filled registration form.
    render(<PasswordInput id="p" aria-label="Password" />)
    expect(screen.getByRole('button', { name: 'Show password' })).toHaveAttribute('type', 'button')
  })

  it('passes through the props each form relies on', () => {
    render(
      <PasswordInput
        id="password"
        name="password"
        aria-label="Password"
        autoComplete="new-password"
        aria-invalid
        aria-describedby="password-error"
      />,
    )
    const field = screen.getByLabelText('Password')
    expect(field).toHaveAttribute('name', 'password')
    expect(field).toHaveAttribute('autocomplete', 'new-password')
    expect(field).toHaveAttribute('aria-invalid', 'true')
    expect(field).toHaveAttribute('aria-describedby', 'password-error')
  })
})

describe('DEF-02 — no inline copies remain', () => {
  it('every password field in the app uses the shared component', async () => {
    // The extraction is only worth anything if a ninth copy cannot appear.
    // Eight instances across four files went unnoticed for months precisely
    // because nothing looked for them.
    const { readFileSync, readdirSync } = await import('node:fs')
    const { join, extname } = await import('node:path')

    const dir = join(process.cwd(), 'components')
    const files: string[] = []
    const walk = (d: string) => {
      for (const e of readdirSync(d, { withFileTypes: true })) {
        const full = join(d, e.name)
        if (e.isDirectory()) walk(full)
        else if (extname(e.name) === '.tsx') files.push(full)
      }
    }
    walk(dir)

    const offenders = files.filter((f) => {
      if (f.endsWith('password-input.tsx')) return false
      const src = readFileSync(f, 'utf8')
      return /type=\{\s*show\w*\s*\?\s*'text'\s*:\s*'password'\s*\}/.test(src)
    })

    expect(offenders).toEqual([])
  })
})
