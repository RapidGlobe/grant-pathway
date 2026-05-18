import type { Metadata } from "next";
import { ApplicationStep5Approve } from "@/components/application-step5-approve";

export const metadata: Metadata = {
  title: "Approve & Export",
};

type ApprovalStatus = "pending" | "approved" | "exported";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ state?: string }>;
}

export default async function Step5Page({ params, searchParams }: Props) {
  const { id } = await params;
  const { state } = await searchParams;

  const statusMap: Record<string, ApprovalStatus> = {
    approved: "approved",
    exported: "exported",
  };
  const initialStatus: ApprovalStatus =
    state && state in statusMap ? statusMap[state] : "pending";

  return <ApplicationStep5Approve applicationId={id} initialStatus={initialStatus} />;
}
