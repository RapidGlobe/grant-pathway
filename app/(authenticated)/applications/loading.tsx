import { PageSkeleton } from '@/components/page-skeleton'

// Route loading state (GAP-23, ADR-ARCH-002).
//
// `app/(authenticated)/applications/` has no page.tsx of its own, so this
// boundary exists purely to serve its children — `/applications/new`,
// `/applications/[id]`, and all five `/applications/[id]/step/N` routes. Next.js
// wraps "page.js and any children below" in the Suspense boundary, and there is
// no nested layout anywhere beneath this point, so a boundary here replaces
// exactly the same region of the screen that seven separate boundaries would.
//
// See dashboard/loading.tsx for why these sit per-route rather than once at the
// (authenticated) group level.
export default function Loading() {
  return <PageSkeleton />
}
