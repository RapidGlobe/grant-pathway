'use client'

import Link from 'next/link'
import { Logo } from '@/components/logo'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronDown, Settings, LogOut, HelpCircle } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { signOut } from '@/actions/auth'
import { helpCentreUrl, helpPathForRoute } from '@/lib/help-centre'

interface NavAuthenticatedProps {
  firstName?: string
  email?: string
}

function getInitials(firstName?: string, email?: string): string {
  if (firstName) return firstName.charAt(0).toUpperCase()
  if (email) return email.charAt(0).toUpperCase()
  return 'U'
}

function getDisplayName(firstName?: string, email?: string): string {
  return firstName || email || 'Account'
}

export function NavAuthenticated({ firstName, email }: NavAuthenticatedProps) {
  const pathname = usePathname()
  const router = useRouter()
  const displayName = getDisplayName(firstName, email)
  const initials = getInitials(firstName, email)

  async function handleSignOut() {
    await signOut()
    router.push('/')
  }

  function navLinkClass(href: string): string {
    const isActive = pathname === href || pathname.startsWith(href + '/')
    return [
      'rounded-md px-3 py-1.5 text-[14px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-2',
      isActive
        ? 'bg-[#E6F4F4] font-semibold text-[#0D6E6E]'
        : 'font-medium text-[#64748B] hover:bg-[#E6F4F4] hover:text-[#1E293B]',
    ].join(' ')
  }

  return (
    <header className="sticky top-0 z-[100] flex h-16 items-center border-b border-[#EDE8E1] bg-white px-10">
      {/* Skip link — first focusable element on every authenticated page, inside
          the header landmark so axe-core "content not in landmark" rule is satisfied */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[200] focus:left-4 focus:top-4 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-[14px] focus:font-medium focus:text-[#0D6E6E] focus:shadow-md focus:ring-2 focus:ring-[#D97706]"
      >
        Skip to main content
      </a>
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between">
        {/* Left — logo + nav links */}
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            aria-label="Grant Pathway home"
            className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-2"
          >
            <Logo />
          </Link>

          {/* Vertical separator */}
          <div className="h-5 w-px bg-[#EDE8E1]" aria-hidden="true" />

          <nav aria-label="Main navigation">
            <ul className="flex items-center gap-1 list-none m-0 p-0">
              <li>
                <Link href="/dashboard" className={navLinkClass('/dashboard')}>
                  My applications
                </Link>
              </li>
              <li>
                <Link href="/profile" className={navLinkClass('/profile')}>
                  Charity profile
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Right — help link + account dropdown */}
        <div className="flex items-center gap-2">
          {/* Opens the help page for the current screen, falling back to the
              help centre root where no page applies (GAP-45). The footer and
              dashboard empty-state links stay on the root deliberately — they
              are general-purpose, whereas this button means "help me with
              *this* screen". */}
          <Link
            href={helpCentreUrl(helpPathForRoute(pathname))}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[14px] font-medium text-[#64748B] transition-colors hover:bg-[#E6F4F4] hover:text-[#1E293B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-2"
          >
            <HelpCircle className="h-4 w-4" aria-hidden="true" />
            Help<span className="sr-only"> (opens in a new tab)</span>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex items-center gap-2 rounded-md bg-[#E6F4F4] px-3 py-1.5 transition-all hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-2"
              aria-label="Account menu"
            >
              <div
                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#0D6E6E]"
                aria-hidden="true"
              >
                <span className="text-[11px] font-bold leading-none text-white">{initials}</span>
              </div>
              <span className="text-[14px] font-semibold text-[#0D6E6E]">{displayName}</span>
              <ChevronDown className="h-3.5 w-3.5 text-[#0D6E6E]" aria-hidden="true" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-auto min-w-40">
              <DropdownMenuItem>
                <Link href="/account" className="flex w-full items-center gap-2">
                  <Settings className="h-4 w-4 text-[#64748B]" aria-hidden="true" />
                  Account settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
