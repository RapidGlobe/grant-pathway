"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SessionTimeoutModal } from "@/components/session-timeout-modal";
import { signOut } from "@/actions/auth";

// Inactivity thresholds (FR-06 / AC-FR-06-01)
const WARNING_MS = 55 * 60 * 1000; // Show modal at 55 minutes
const TIMEOUT_MS = 60 * 60 * 1000; // Sign out at 60 minutes

// Events that count as user activity (AC-FR-06-02)
const ACTIVITY_EVENTS = [
  "mousemove",
  "keydown",
  "click",
  "touchstart",
] as const;

/**
 * Mounts invisibly inside the authenticated layout and manages the
 * 60-minute inactivity session timeout (FR-06).
 *
 * - Any user activity (mouse, keyboard, touch) resets the timer.
 * - At 55 minutes of inactivity the warning modal opens with a 5-minute
 *   countdown.
 * - At 60 minutes signOut() is called and the user is sent to /.
 * - "I'm still here" resets the timer and closes the modal.
 * - "Sign out now" signs out immediately.
 */
export function SessionTimeoutProvider() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [minutesLeft, setMinutesLeft] = useState(5);

  const warningTimerId = useRef<ReturnType<typeof setTimeout> | null>(null);
  const signoutTimerId = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownId = useRef<ReturnType<typeof setInterval> | null>(null);

  const doSignOut = useCallback(async () => {
    // Clear all timers before navigating — prevents a second sign-out call
    if (warningTimerId.current) clearTimeout(warningTimerId.current);
    if (signoutTimerId.current) clearTimeout(signoutTimerId.current);
    if (countdownId.current) clearInterval(countdownId.current);
    setShowModal(false);
    await signOut();
    router.push("/");
  }, [router]);

  const resetTimers = useCallback(() => {
    // Cancel any in-flight timers
    if (warningTimerId.current) clearTimeout(warningTimerId.current);
    if (signoutTimerId.current) clearTimeout(signoutTimerId.current);
    if (countdownId.current) clearInterval(countdownId.current);

    setShowModal(false);
    setMinutesLeft(5);

    // Warning modal at 55 minutes
    warningTimerId.current = setTimeout(() => {
      setShowModal(true);
      let mins = 5;
      countdownId.current = setInterval(() => {
        mins -= 1;
        setMinutesLeft(mins);
        if (mins <= 0) {
          clearInterval(countdownId.current!);
          countdownId.current = null;
        }
      }, 60_000);
    }, WARNING_MS);

    // Auto sign-out at 60 minutes
    signoutTimerId.current = setTimeout(() => {
      void doSignOut();
    }, TIMEOUT_MS);
  }, [doSignOut]);

  useEffect(() => {
    resetTimers();

    const onActivity = () => resetTimers();
    ACTIVITY_EVENTS.forEach((ev) =>
      document.addEventListener(ev, onActivity, { passive: true }),
    );

    return () => {
      if (warningTimerId.current) clearTimeout(warningTimerId.current);
      if (signoutTimerId.current) clearTimeout(signoutTimerId.current);
      if (countdownId.current) clearInterval(countdownId.current);
      ACTIVITY_EVENTS.forEach((ev) =>
        document.removeEventListener(ev, onActivity),
      );
    };
  }, [resetTimers]);

  return (
    <SessionTimeoutModal
      isOpen={showModal}
      minutesRemaining={minutesLeft}
      onExtend={resetTimers}
      onSignOut={() => void doSignOut()}
    />
  );
}
