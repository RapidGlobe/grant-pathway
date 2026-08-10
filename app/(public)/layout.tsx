import { NavPublic } from '@/components/nav-public'
import { SiteFooter } from '@/components/site-footer'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavPublic />

      <main id="main-content" tabIndex={-1} className="flex flex-1 flex-col outline-none">
        {children}
      </main>

      <SiteFooter />
    </>
  )
}
