'use client'

// A password field with a show/hide toggle.
//
// Extracted 2026-08-07 (`DEF-02`, WJ's decision). This markup had been
// copy-pasted into four form components — sign-in (1), register (2),
// reset-password (2) and account settings (3), eight instances in all — and
// every copy carried the same WCAG 2.2 failure: the toggle was exactly as big
// as its 16×16 icon, against the 24×24 minimum SC 2.5.8 requires.
//
// The duplication is why extracting was chosen over patching each copy. This
// project has already been bitten once by the same shape: `GAP-25` found the
// password *policy* written out separately in three of these same four files,
// and the PRD records a live client/server divergence that resulted. The parts
// most likely to drift here are the accessible name and the target size —
// both invisible until somebody tests with a keyboard or a screen reader,
// which is precisely how these eight went unnoticed.
//
// Note the button is 28×28 rather than the bare 24×24 minimum. The icon stays
// 16×16 and does not move: the button's right offset is set so the icon's
// centre sits where it always did, 20px from the field's right edge.

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface PasswordInputProps extends Omit<React.ComponentProps<typeof Input>, 'type'> {
  /**
   * The noun used in the toggle's accessible name, giving "Show current
   * password", "Hide confirm password" and so on. Screens with more than one
   * password field must pass distinct values, or a screen-reader user hears
   * several identically-named buttons and cannot tell which is which.
   */
  toggleLabel?: string
}

export function PasswordInput({
  toggleLabel = 'password',
  className,
  ...inputProps
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false)
  const Icon = visible ? EyeOff : Eye

  return (
    <div className="relative">
      <Input
        {...inputProps}
        type={visible ? 'text' : 'password'}
        className={cn('h-10 pr-10 text-[14px]', className)}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={`${visible ? 'Hide' : 'Show'} ${toggleLabel}`}
        className="absolute top-1/2 right-1.5 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded text-[#64748B] transition-colors hover:text-[#1E293B] focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-1 focus-visible:outline-none"
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}
