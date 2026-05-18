import { NavPublic } from "@/components/nav-public";
import { SiteFooter } from "@/components/site-footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[200] focus:left-4 focus:top-4 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-[14px] focus:font-medium focus:text-[#0D6E6E] focus:shadow-md focus:ring-2 focus:ring-[#D97706]"
      >
        Skip to main content
      </a>

      <NavPublic />

      <main id="main-content" className="flex flex-1 flex-col">
        {children}
      </main>

      <SiteFooter />
    </>
  );
}
