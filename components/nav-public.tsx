import Link from "next/link";

export function NavPublic() {
  return (
    <header className="sticky top-0 z-[100] flex h-16 items-center border-b border-[#EDE8E1] bg-white px-10">
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between">
        {/* Logo — no link on unauthenticated nav (stays on current page) */}
        <div className="flex items-center gap-2">
          <div
            className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-lg bg-[#0D6E6E]"
            aria-hidden="true"
          >
            <span className="text-[15px] font-bold leading-none text-white">GP</span>
          </div>
          <span className="text-[16px] font-bold text-[#1E293B]">Grant Pathway</span>
        </div>

        {/* Right — nav actions */}
        <nav aria-label="Site navigation">
          <ul className="flex items-center gap-2 list-none m-0 p-0">
            <li>
              <Link
                href="/"
                className="px-3 py-2 text-[14px] font-medium text-[#64748B] transition-colors hover:text-[#1E293B]"
              >
                Sign in
              </Link>
            </li>
            <li>
              <Link
                href="/register"
                className="rounded-lg border border-[#0D6E6E] px-3 py-2 text-[14px] font-semibold text-[#0D6E6E] transition-colors hover:bg-[#E6F4F4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-2"
              >
                Register — it&apos;s free
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
