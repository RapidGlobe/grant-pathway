'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function AuthenticatedError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-muted-foreground max-w-sm text-sm">
        An unexpected error occurred. Our team has been notified. Please try again or return to your
        dashboard.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
        >
          Try again
        </button>
        <a href="/dashboard" className="rounded-md border px-4 py-2 text-sm hover:bg-muted">
          Go to dashboard
        </a>
      </div>
    </div>
  )
}
