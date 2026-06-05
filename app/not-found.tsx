import Link from 'next/link'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <FileQuestion className="mb-4 h-12 w-12 text-[#94A3B8]" aria-hidden="true" />
      <h1 className="mb-2 text-[24px] font-bold text-[#1E293B]">Page not found</h1>
      <p className="mb-8 max-w-sm text-[14px] text-[#64748B]">
        We couldn&apos;t find the page you were looking for. It may have been moved or deleted.
      </p>
      <Link
        href="/dashboard"
        className="inline-flex h-10 items-center rounded-md bg-[#0D6E6E] px-5 text-[14px] font-semibold text-white hover:bg-[#0A5A5A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-1"
      >
        Go to my dashboard
      </Link>
    </div>
  )
}
