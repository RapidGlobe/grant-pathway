import type { Metadata } from "next";
import { AccountSettingsForm } from "@/components/account-settings-form";

export const metadata: Metadata = {
  title: "Account Settings",
};

interface Props {
  searchParams: Promise<{ mfa?: string }>;
}

export default async function AccountPage({ searchParams }: Props) {
  const { mfa } = await searchParams;
  return <AccountSettingsForm mfaEnabled={mfa === "enabled"} />;
}
