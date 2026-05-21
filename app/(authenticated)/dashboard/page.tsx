import type { Metadata } from "next";
import { DashboardEmpty } from "@/components/dashboard-empty";
import { DashboardPopulated } from "@/components/dashboard-populated";
import { createClient } from "@/lib/supabase/server";
import { getCharityProfile } from "@/actions/charity";

export const metadata: Metadata = {
  title: "My Applications",
};

interface Props {
  searchParams: Promise<{ state?: string }>;
}

/**
 * Dashboard page.
 * S1.4 — fetches real first name and profile existence to drive the
 *         profile incomplete banner on both empty and populated states.
 * S2.1 — will replace ?state=populated URL param with a real applications fetch.
 */
export default async function DashboardPage({ searchParams }: Props) {
  const { state } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const firstName = (user?.user_metadata?.first_name as string | undefined) ?? "";
  const profile = await getCharityProfile();
  const profileIncomplete = !profile;

  if (state === "populated") {
    return <DashboardPopulated profileIncomplete={profileIncomplete} />;
  }

  return <DashboardEmpty firstName={firstName} profileIncomplete={profileIncomplete} />;
}
