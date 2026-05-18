"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SessionTimeoutModalProps {
  isOpen: boolean;
  minutesRemaining?: number;
  onExtend: () => void;
  onSignOut: () => void;
}

export function SessionTimeoutModal({
  isOpen,
  minutesRemaining = 5,
  onExtend,
  onSignOut,
}: SessionTimeoutModalProps) {
  const minuteLabel = minutesRemaining === 1 ? "minute" : "minutes";

  return (
    <Dialog open={isOpen}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[440px] rounded-xl p-8"
      >
        <DialogHeader>
          <DialogTitle className="text-[18px] font-bold tracking-tight text-[#1E293B]">
            Are you still there?
          </DialogTitle>
          <DialogDescription className="mt-2 text-[14px] leading-relaxed text-[#64748B]">
            You&apos;ll be signed out in {minutesRemaining} {minuteLabel} due to
            inactivity. Any unsaved work has been saved automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <Button
            variant="outline"
            size="default"
            onClick={onSignOut}
            className="text-[14px]"
          >
            Sign out now
          </Button>
          <Button
            size="default"
            onClick={onExtend}
            className="bg-[#0D6E6E] text-[14px] text-white hover:bg-[#0A5A5A]"
          >
            I&apos;m still here
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
