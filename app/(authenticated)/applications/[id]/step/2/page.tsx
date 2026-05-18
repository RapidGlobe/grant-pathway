import type { Metadata } from "next";
import { ApplicationStep2Form } from "@/components/application-step2-form";

export const metadata: Metadata = {
  title: "Upload Guidelines",
};

type UploadError = "format" | "size" | "scanned" | null;

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; warning?: string }>;
}

export default async function Step2Page({ params, searchParams }: Props) {
  const { id } = await params;
  const { error, warning } = await searchParams;

  const errorMap: Record<string, UploadError> = {
    format: "format",
    size: "size",
    scanned: "scanned",
  };
  const initialError: UploadError = error && error in errorMap ? errorMap[error] : null;
  const showLargeWarning = warning === "large";

  return (
    <ApplicationStep2Form
      applicationId={id}
      initialError={initialError}
      showLargeWarning={showLargeWarning}
    />
  );
}
