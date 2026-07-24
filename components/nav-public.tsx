'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HelpCircle } from 'lucide-react'
import { Logo } from '@/components/logo'
import { HELP_CENTRE_BASE_URL } from '@/lib/help-centre'

export function NavPublic() {
  const pathname = usePathname()
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
        {/* Logo links home so pages reached directly (e.g. /terms or /privacy
            from a search result) are never a dead end. Signed-in visitors are
            redirected on to /dashboard by the auth middleware. */}
        <Link
          href="/"
          aria-label="Grant Pathway home"
          className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-2"
        >
          <Logo />
        </Link>

        {/* Right — nav actions. The Register button is hidden on /register
            (circular), /verify-email (the user has just registered), and legal
            pages where it is out of context. */}
        <nav aria-label="Site navigation">
          <ul className="flex items-center gap-2 list-none m-0 p-0">
            <li>
              <Link
                href={HELP_CENTRE_BASE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-md px-3 py-2 text-[14px] font-medium text-[#64748B] transition-colors hover:bg-[#E6F4F4] hover:text-[#1E293B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-2"
              >
                <HelpCircle className="h-4 w-4" aria-hidden="true" />
                Help<span className="sr-only"> (opens in a new tab)</span>
              </Link>
            </li>
            {pathname !== '/register' &&
              pathname !== '/verify-email' &&
              pathname !== '/privacy' &&
              pathname !== '/terms' && (
                <li>
                  <Link
                    href="/register"
                    className="rounded-lg border border-[#0D6E6E] px-3 py-2 text-[14px] font-semibold text-[#0D6E6E] transition-colors hover:bg-[#E6F4F4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-2"
                  >
                    Register — it&apos;s free
                  </Link>
                </li>
              )}
          </ul>
        </nav>
      </div>
    </header>
  )
}
