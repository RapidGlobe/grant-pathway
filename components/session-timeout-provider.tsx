'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SessionTimeoutModal } from '@/components/session-timeout-modal'
import { signOut } from '@/actions/auth'

// Inactivity thresholds (FR-06 / AC-FR-06-01)
const WARNING_MS = 55 * 60 * 1000 // Show modal at 55 minutes
const TIMEOUT_MS = 60 * 60 * 1000 // Sign out at 60 minutes

// Countdown length is derived from the gap above rather than hardcoded, so it
// stays accurate if the thresholds above are ever changed.
const COUNTDOWN_MINUTES = Math.max(1, Math.round((TIMEOUT_MS - WARNING_MS) / 60_000))

// Events that count as user activity (AC-FR-06-02)
const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'click', 'touchstart'] as const

/**
 * Mounts invisibly inside the authenticated layout and manages the
 * 60-minute inactivity session timeout (FR-06).
 *
 * - Any user activity (mouse, keyboard, touch) resets the timer.
 * - At 55 minutes of inactivity the warning modal opens with a countdown.
 * - At 60 minutes signOut() is called and the user is sent to /?timeout=true,
 *   where the sign-in page explains why (GAP-22).
 * - "I'm still here" resets the timer and closes the modal.
 * - "Sign out now" signs out immediately — and also lands on /?timeout=true.
 *   That is deliberate and specified: technical-design.md §5 says the message
 *   is shown whether the modal is dismissed via "Sign out now" OR ignored to
 *   the 60-minute mark. Both paths run through doSignOut() below, so there is
 *   nothing to branch on here.
 * - While the modal is open, ambient activity is ignored — only its own
 *   buttons can end the warning state (see modalOpenRef below).
 */
export function SessionTimeoutProvider() {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [minutesLeft, setMinutesLeft] = useState(COUNTDOWN_MINUTES)

  const warningTimerId = useRef<ReturnType<typeof setTimeout> | null>(null)
  const signoutTimerId = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownId = useRef<ReturnType<typeof setInterval> | null>(null)
  // Tracks whether the modal is open without waiting for a re-render, so the
  // activity listener below can check it synchronously on every event.
  const modalOpenRef = useRef(false)

  const doSignOut = useCallback(async () => {
    // Clear all timers before navigating — prevents a second sign-out call
    if (warningTimerId.current) clearTimeout(warningTimerId.current)
    if (signoutTimerId.current) clearTimeout(signoutTimerId.current)
    if (countdownId.current) clearInterval(countdownId.current)
    modalOpenRef.current = false
    setShowModal(false)
    await signOut()
    // GAP-22: the param is what tells the sign-in page to explain the sign-out.
    // Without it the user is dumped on / with no indication of what happened —
    // which is what shipped, and is why technical-design.md §5's stated message
    // had no way to appear.
    router.push('/?timeout=true')
  }, [router])

  const resetTimers = useCallback(() => {
    // Cancel any in-flight timers
    if (warningTimerId.current) clearTimeout(warningTimerId.current)
    if (signoutTimerId.current) clearTimeout(signoutTimerId.current)
    if (countdownId.current) clearInterval(countdownId.current)

    modalOpenRef.current = false
    setShowModal(false)
    setMinutesLeft(COUNTDOWN_MINUTES)

    // Warning modal fires once WARNING_MS of inactivity has elapsed
    warningTimerId.current = setTimeout(() => {
      modalOpenRef.current = true
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

    // While the warning modal is open, ignore ambient activity (moving the
    // mouse toward its buttons would otherwise dismiss it before it can be
    // clicked) — only the modal's own "I'm still here" / "Sign out now"
    // actions should end the warning state at that point.
    const onActivity = () => {
      if (modalOpenRef.current) return
      resetTimers()
    }
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
