import { MonitorSmartphone } from 'lucide-react'

export function MobileViewportBanner() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-4 bg-[#FDF9F5] px-6 text-center md:hidden">
      <MonitorSmartphone className="h-12 w-12 text-[#0D6E6E]" aria-hidden="true" />
      <h1 className="max-w-xs text-[1.25rem] font-bold text-[#1E293B]">
        Please use a desktop or laptop
      </h1>
      <p className="max-w-xs text-[0.875rem] leading-relaxed text-[#64748B]">
        Grant Pathway is designed for bigger screens, with space for funder guidelines and your
        draft answers side by side. Switch to a desktop or laptop browser to carry on.
      </p>
    </div>
  )
}
