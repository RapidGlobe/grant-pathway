import type { Metadata } from "next";
import { DashboardEmpty } from "@/components/dashboard-empty";
import { DashboardPopulated } from "@/components/dashboard-populated";

export const metadata: Metadata = {
  title: "My Applications",
};

interface Props {
  searchParams: Promise<{ state?: string }>;
}

export default async function DashboardPage({ searchParams }: Props) {
  const { state } = await searchParams;

  if (state === "populated") {
    return <DashboardPopulated />;
  }

  return <DashboardEmpty />;
}
