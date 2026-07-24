import Link from 'next/link'
import { getAppVersion } from '@/lib/version'
import { HELP_CENTRE_BASE_URL } from '@/lib/help-centre'

export function SiteFooter() {
  const year = new Date().getFullYear()
  const appVersion = getAppVersion()

  return (
    <footer className="border-t border-[#EDE8E1] bg-[#FDF9F5]">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-start justify-between gap-4 px-10 py-[22px]">
        <div>
          <p className="text-[13px] text-[#64748B]">© RapidGlobe Ltd {year}</p>
          <p className="mt-0.5 text-[12px] text-[#64748B]">
            Your free grant writing companion for UK charities
          </p>
          <p className="mt-0.5 text-[11px] text-[#94A3B8]">Grant Pathway v{appVersion}</p>
        </div>

        <nav aria-label="Legal links">
          <ul className="flex items-center gap-4 list-none m-0 p-0">
            {/* Help + legal links open in a new tab so users are never pulled
                out of a form or an in-progress application */}
            <li>
              <Link
                href={HELP_CENTRE_BASE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] text-[#64748B] transition-colors hover:text-[#1E293B]"
              >
                Help centre<span className="sr-only"> (opens in a new tab)</span>
              </Link>
            </li>
            <li>
              <Link
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] text-[#64748B] transition-colors hover:text-[#1E293B]"
              >
                Privacy policy<span className="sr-only"> (opens in a new tab)</span>
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] text-[#64748B] transition-colors hover:text-[#1E293B]"
              >
                Terms of service<span className="sr-only"> (opens in a new tab)</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  )
}
