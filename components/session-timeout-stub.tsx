"use client";

import { SessionTimeoutModal } from "@/components/session-timeout-modal";

// Phase 1 stub — timer and sign-out logic wired in Slice 0 (S0.5)
export function SessionTimeoutStub() {
  return (
    <SessionTimeoutModal
      isOpen={false}
      onExtend={() => {}}
      onSignOut={() => {}}
    />
  );
}
