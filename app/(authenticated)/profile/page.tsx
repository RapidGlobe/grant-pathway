import type { Metadata } from "next";
import { CharityProfileForm } from "@/components/charity-profile-form";

export const metadata: Metadata = {
  title: "Charity Profile",
};

type LookupState = null | "match" | "no-match" | "unavailable";

interface Props {
  searchParams: Promise<{ state?: string; lookup?: string }>;
}

export default async function ProfilePage({ searchParams }: Props) {
  const { state, lookup } = await searchParams;

  const isEdit = state === "edit";

  const lookupMap: Record<string, LookupState> = {
    match: "match",
    "no-match": "no-match",
    unavailable: "unavailable",
  };
  const initialLookupState: LookupState =
    lookup && lookup in lookupMap ? lookupMap[lookup] : null;

  return (
    <CharityProfileForm isEdit={isEdit} initialLookupState={initialLookupState} />
  );
}
