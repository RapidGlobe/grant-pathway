import type { Metadata } from "next";
import { CharityProfileForm } from "@/components/charity-profile-form";

/**
 * Extend the Vercel serverless timeout to 60 seconds for this route.
 * The lookupCharity Server Action calls the Charity Commission API (up to 10 s
 * per call, two calls) and then Amazon Bedrock (up to 30 s), so the default
 * 10 s limit is insufficient. (S1.1 — ADR-AI-001)
 */
export const maxDuration = 60;

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
