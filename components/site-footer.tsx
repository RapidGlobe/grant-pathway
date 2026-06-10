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
            <li>
              <Link
                href="/privacy"
                className="text-[13px] text-[#64748B] transition-colors hover:text-[#1E293B]"
              >
                Privacy policy
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="text-[13px] text-[#64748B] transition-colors hover:text-[#1E293B]"
              >
                Terms of service
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  )
}
