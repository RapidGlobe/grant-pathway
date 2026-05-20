import type { Metadata } from "next";
import { CharityProfileForm } from "@/components/charity-profile-form";

export const metadata: Metadata = {
  title: "Charity Profile",
};

interface Props {
  searchParams: Promise<{ state?: string }>;
}

/**
 * Charity Profile page.
 * S1.1 — lookup wired to real Charity Commission API.
 * S1.2 — form save wired to Supabase.
 * S1.3 — pre-fills from existing profile when isEdit=true.
 */
export default async function ProfilePage({ searchParams }: Props) {
  const { state } = await searchParams;
  const isEdit = state === "edit";
  return <CharityProfileForm isEdit={isEdit} />;
}
