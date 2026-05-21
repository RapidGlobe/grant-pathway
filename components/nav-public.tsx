import Link from "next/link";
import { Logo } from "@/components/logo";

export function NavPublic() {
  return (
    <header className="sticky top-0 z-[100] flex h-16 items-center border-b border-[#EDE8E1] bg-white px-10">
      {/* Skip link — first focusable element on every public page, inside the
          header landmark so axe-core "content not in landmark" rule is satisfied */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[200] focus:left-4 focus:top-4 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-[14px] focus:font-medium focus:text-[#0D6E6E] focus:shadow-md focus:ring-2 focus:ring-[#D97706]"
      >
        Skip to main content
      </a>
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between">
        {/* Logo — no link on unauthenticated nav */}
        <Logo />

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
