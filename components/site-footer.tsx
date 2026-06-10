import Link from 'next/link'

export function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-[#EDE8E1] bg-[#FDF9F5]">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-start justify-between gap-4 px-10 py-[22px]">
        <div>
          <p className="text-[13px] text-[#64748B]">© RapidGlobe Ltd {year}</p>
          <p className="mt-0.5 text-[12px] text-[#64748B]">
            Your free grant writing companion for UK charities
          </p>
        </div>

        <nav aria-label="Legal links">
          <ul className="flex items-center gap-4 list-none m-0 p-0">
            {/* Legal links open in a new tab so users are never pulled out of
                a form or an in-progress application to read a policy */}
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
