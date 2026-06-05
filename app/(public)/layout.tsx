import { NavPublic } from '@/components/nav-public'
import { SiteFooter } from '@/components/site-footer'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavPublic />

      <main id="main-content" className="flex flex-1 flex-col">
        {children}
      </main>

      <SiteFooter />
    </>
  )
}
