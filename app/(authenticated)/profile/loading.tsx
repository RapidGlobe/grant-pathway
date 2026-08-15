import { PageSkeleton } from '@/components/page-skeleton'

// Route loading state (GAP-23, ADR-ARCH-002). See dashboard/loading.tsx for why
// these sit per-route rather than once at the (authenticated) group level.
export default function Loading() {
  return <PageSkeleton />
}
