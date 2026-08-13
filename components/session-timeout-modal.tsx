'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface SessionTimeoutModalProps {
  isOpen: boolean
  minutesRemaining?: number
  onExtend: () => void
  onSignOut: () => void
}

export function SessionTimeoutModal({
  isOpen,
  minutesRemaining = 5,
  onExtend,
  onSignOut,
}: SessionTimeoutModalProps) {
  const minuteLabel = minutesRemaining === 1 ? 'minute' : 'minutes'

  return (
    // Escape is the only way Base UI can close a controlled dialog without a
    // dedicated button; per design-requirements.md §8.5 ("Escape key closes
    // all modals") it must do something, and per this modal's own reasoning
    // (see session-timeout-provider.tsx) closing without extending the
    // session would be worse than not closing at all — so Escape here is
    // treated identically to "I'm still here".
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onExtend()
      }}
    >
      <DialogContent showCloseButton={false} className="max-w-[440px] rounded-xl p-8">
        <DialogHeader>
          <DialogTitle className="text-[1.125rem] font-bold tracking-tight text-[#1E293B]">
            Are you still there?
          </DialogTitle>
          <DialogDescription className="mt-2 text-[0.875rem] leading-relaxed text-[#64748B]">
            {`You'll be signed out in ${minutesRemaining} ${minuteLabel} due to inactivity. Make sure you've saved any work before your session ends.`}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <Button variant="outline" size="default" onClick={onSignOut} className="text-[0.875rem]">
            Sign out now
          </Button>
          <Button
            size="default"
            onClick={onExtend}
            className="bg-[#0D6E6E] text-[0.875rem] text-white hover:bg-[#0A5A5A]"
          >
            I&apos;m still here
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
