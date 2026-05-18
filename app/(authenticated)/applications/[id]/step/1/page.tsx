import type { Metadata } from "next";
import { ApplicationStep1Form } from "@/components/application-step1-form";

export const metadata: Metadata = {
  title: "Application Details",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Step1Page({ params }: Props) {
  const { id } = await params;

  // Static shell: mock pre-filled data for existing application
  return (
    <ApplicationStep1Form
      applicationId={id}
      initialFunderName="National Lottery Community Fund"
      initialGrantName="Awards for All England"
    />
  );
}
