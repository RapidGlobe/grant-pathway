import { NavAuthenticated } from "@/components/nav-authenticated";
import { SiteFooter } from "@/components/site-footer";
import { SessionTimeoutProvider } from "@/components/session-timeout-provider";
import { createClient } from "@/lib/supabase/server";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Read the authenticated user's name for the nav.
  // first_name is stored in user_metadata (set via options.data in signUp).
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const firstName = (user?.user_metadata?.first_name as string | undefined) ?? "";
  const email = user?.email ?? "";

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[200] focus:left-4 focus:top-4 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-[14px] focus:font-medium focus:text-[#0D6E6E] focus:shadow-md focus:ring-2 focus:ring-[#D97706]"
      >
        Skip to main content
      </a>

      <NavAuthenticated firstName={firstName} email={email} />

      <main id="main-content" className="flex flex-1 flex-col">
        {children}
      </main>

      <SiteFooter />

      {/* 60-minute inactivity session timeout (FR-06 / S0.5) */}
      <SessionTimeoutProvider />
    </>
  );
}
