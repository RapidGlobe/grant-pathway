'use client'

// Accessibility testing — development only (ADR-OPS-006, GAP-54)
//
// Drives axe-core directly, not through @axe-core/react. That wrapper's own
// React-integration glue is incompatible with React 19's read-only module
// exports (DEF-04, accessibility-test-plan.md) and silently produced an empty
// console on every page, violations included. axe-core itself has no such
// dependency — it is the same engine the manual DevTools sweep in
// accessibility-test-plan.md already drives via `window.axe.run()`.
//
// A MutationObserver re-scans after the DOM settles, so client-side updates
// (route changes, dialogs opening, validation errors appearing) are covered
// without patching React internals to detect re-renders. Violations are
// logged in the same format as the manual sweep's snippet, so the output is
// immediately recognisable. Dead code in production builds — Next.js
// tree-shakes the dynamic import via the NODE_ENV guard.

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

declare global {
  interface Window {
    // Exposed so accessibility-test-plan.md's manual DevTools snippet
    // (`window.axe.run()`) keeps working alongside the automatic scan below.
    axe?: typeof import('axe-core')
  }
}

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']
const SCAN_DEBOUNCE_MS = 1000

export default function AxeProvider() {
  const pathname = usePathname()

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return

    let cancelled = false
    let debounceTimer: ReturnType<typeof setTimeout> | undefined
    let observer: MutationObserver | undefined

    void (async () => {
      const { default: axe } = await import('axe-core')
      if (cancelled) return

      window.axe = axe

      const runScan = () => {
        void axe
          .run(document, { runOnly: { type: 'tag', values: WCAG_TAGS } })
          .then((results) => {
            const count = results.violations.reduce((n, v) => n + v.nodes.length, 0)
            if (count === 0) return

            console.group(
              `%caxe: ${count} problem(s) on ${location.pathname}`,
              'color: #DC2626; font-weight: bold',
            )
            results.violations.forEach((violation) =>
              violation.nodes.forEach((node) => {
                const detail = (node.failureSummary ?? '').split('\n').slice(1).join(' ').trim()
                console.error(
                  `${violation.id} (${violation.impact}): ${violation.help}\non ${node.target.join(' ')}${detail ? `\n${detail}` : ''}`,
                )
              }),
            )
            console.groupEnd()
          })
          .catch(() => {
            // axe-core can throw scanning a DOM mid-transition (e.g. a dialog
            // closing) — not worth crashing the dev session over a re-scan
          })
      }

      observer = new MutationObserver(() => {
        clearTimeout(debounceTimer)
        debounceTimer = setTimeout(runScan, SCAN_DEBOUNCE_MS)
      })
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
      })

      debounceTimer = setTimeout(runScan, SCAN_DEBOUNCE_MS)
    })()

    return () => {
      cancelled = true
      clearTimeout(debounceTimer)
      observer?.disconnect()
    }
  }, [pathname])

  return null
}
