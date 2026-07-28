'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SessionTimeoutModal } from '@/components/session-timeout-modal'
import { signOut } from '@/actions/auth'

// Inactivity thresholds (FR-06 / AC-FR-06-01)
// TEMPORARY — shortened for RT-15 diagnostic re-test (2026-07-28). Revert to
// 55 * 60 * 1000 / 60 * 60 * 1000 once the sign-out logic is confirmed working.
const WARNING_MS = 1 * 60 * 1000 // Show modal at 1 minute
const TIMEOUT_MS = 2 * 60 * 1000 // Sign out at 2 minutes

// Countdown length is derived from the gap above, so it stays accurate whether
// the real 5-minute gap or this shortened test gap is in effect.
const COUNTDOWN_MINUTES = Math.max(1, Math.round((TIMEOUT_MS - WARNING_MS) / 60_000))

// Events that count as user activity (AC-FR-06-02)
const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'click', 'touchstart'] as const

/**
 * Mounts invisibly inside the authenticated layout and manages the
 * inactivity session timeout (FR-06). Thresholds are currently shortened for
 * diagnostic testing — see WARNING_MS/TIMEOUT_MS above.
 *
 * - Any user activity (mouse, keyboard, touch) resets the timer.
 * - At WARNING_MS of inactivity the warning modal opens with a countdown.
 * - At TIMEOUT_MS signOut() is called and the user is sent to /.
 * - "I'm still here" resets the timer and closes the modal.
 * - "Sign out now" signs out immediately.
 */
export function SessionTimeoutProvider() {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [minutesLeft, setMinutesLeft] = useState(COUNTDOWN_MINUTES)

  const warningTimerId = useRef<ReturnType<typeof setTimeout> | null>(null)
  const signoutTimerId = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownId = useRef<ReturnType<typeof setInterval> | null>(null)

  const doSignOut = useCallback(async () => {
    // Clear all timers before navigating — prevents a second sign-out call
    if (warningTimerId.current) clearTimeout(warningTimerId.current)
    if (signoutTimerId.current) clearTimeout(signoutTimerId.current)
    if (countdownId.current) clearInterval(countdownId.current)
    setShowModal(false)
    await signOut()
    router.push('/')
  }, [router])

  const resetTimers = useCallback(() => {
    // Cancel any in-flight timers
    if (warningTimerId.current) clearTimeout(warningTimerId.current)
    if (signoutTimerId.current) clearTimeout(signoutTimerId.current)
    if (countdownId.current) clearInterval(countdownId.current)

    setShowModal(false)
    setMinutesLeft(COUNTDOWN_MINUTES)

    // Warning modal fires once WARNING_MS of inactivity has elapsed
    warningTimerId.current = setTimeout(() => {
      setShowModal(true)
      let mins = COUNTDOWN_MINUTES
      countdownId.current = setInterval(() => {
        mins -= 1
        setMinutesLeft(mins)
        if (mins <= 0) {
          clearInterval(countdownId.current!)
          countdownId.current = null
        }
      }, 60_000)
    }, WARNING_MS)

    // Auto sign-out once TIMEOUT_MS of inactivity has elapsed
    signoutTimerId.current = setTimeout(() => {
      void doSignOut()
    }, TIMEOUT_MS)
  }, [doSignOut])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initialising timers on mount via stable callback
    resetTimers()

    const onActivity = () => resetTimers()
    ACTIVITY_EVENTS.forEach((ev) => document.addEventListener(ev, onActivity, { passive: true }))

    return () => {
      if (warningTimerId.current) clearTimeout(warningTimerId.current)
      if (signoutTimerId.current) clearTimeout(signoutTimerId.current)
      if (countdownId.current) clearInterval(countdownId.current)
      ACTIVITY_EVENTS.forEach((ev) => document.removeEventListener(ev, onActivity))
    }
  }, [resetTimers])

  return (
    <SessionTimeoutModal
      isOpen={showModal}
      minutesRemaining={minutesLeft}
      onExtend={resetTimers}
      onSignOut={() => void doSignOut()}
    />
  )
}
