import { Skeleton } from '@/components/ui/skeleton'

export function PageSkeleton() {
  return (
    <div
      className="mx-auto w-full max-w-[640px] px-4 py-10 sm:px-0"
      aria-label="Loading…"
      aria-busy="true"
    >
      {/* Page heading */}
      <Skeleton className="mb-8 h-8 w-56" />

      {/* Section block 1 */}
      <div className="mb-6 space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Section block 2 */}
      <div className="mb-6 space-y-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Section block 3 — larger content area */}
      <div className="mb-6 space-y-3">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-32 w-full" />
      </div>

      {/* Action button */}
      <Skeleton className="h-10 w-36" />
    </div>
  )
}
