import { PageSkeleton } from '@/components/page-skeleton'

// Route loading state (GAP-23, ADR-ARCH-002). Next.js wraps page.tsx and any
// children below in a <Suspense> boundary using this as the fallback.
//
// Placed per-route rather than once at `app/(authenticated)/loading.tsx`
// deliberately: that layout is async and calls `supabase.auth.getUser()`, and
// Next.js does not show a loading fallback for runtime data read in a layout —
// navigation blocks until the layout finishes. A boundary above it would
// therefore never render. See the `loading.js` file-convention docs, "Good to
// know".
export default function Loading() {
  return <PageSkeleton />
}
