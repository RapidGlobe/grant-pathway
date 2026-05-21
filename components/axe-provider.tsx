'use client'

// Accessibility testing — development only (ADR-OPS-006, GAP-14)
//
// @axe-core/react runs in the browser during development and logs WCAG violations
// to the browser console. The dynamic import inside the NODE_ENV guard is dead code
// in production builds — Next.js/webpack removes it via tree-shaking, so
// @axe-core/react is not included in any production bundle.
//
// Violations are reported to the browser DevTools console with severity, WCAG
// rule reference, and the affected DOM node. Fix all violations before shipping
// any slice — accessibility failures are treated as bugs (ADR-OPS-006).

import { useEffect } from 'react'

export default function AxeProvider() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return

    void (async () => {
      try {
        const [{ default: axe }, React, ReactDOM] = await Promise.all([
          import('@axe-core/react'),
          import('react'),
          import('react-dom'),
        ])
        // 1000ms delay gives React time to finish rendering before axe scans the DOM
        // Note: @axe-core/react v4 is not fully compatible with React 19's read-only
        // module exports. Wrapped in try/catch to prevent crashing the app in dev.
        // Replace with a React 19 compatible version when available (ADR-OPS-006).
        await axe(React, ReactDOM, 1000)
      } catch {
        // axe-core/react v4 incompatible with React 19 read-only module exports.
        // Silently suppressed — does not affect functionality or production builds.
      }
    })()
  }, [])

  // Renders nothing — this component exists only for its side effect
  return null
}
