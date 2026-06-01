import type { Metadata } from "next";
import { ApplicationStep2Form } from "@/components/application-step2-form";
import { getApplicationOrRedirect } from "@/lib/application-guard";

export const metadata: Metadata = {
  title: "Upload Guidelines",
};

type UploadError = "format" | "size" | "scanned" | null;

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; warning?: string }>;
}

/**
 * Step 2 — Upload Guidelines (S3.3 step locking applied).
 *
 * getApplicationOrRedirect(id, 2) enforces that current_step >= 2 before
 * this page renders. If Step 1 hasn't been saved yet, the user is
 * redirected back to Step 1 automatically.
 */
export default async function Step2Page({ params, searchParams }: Props) {
  const { id } = await params;
  const { error, warning } = await searchParams;

  // Step locking: redirects to Step 1 if current_step < 2
  // currentStep tells the form whether the user has been past Step 2 before
  // so it can show the re-upload advisory when no sessionStorage entry exists (GAP-19).
  const { funderName, grantName, currentStep } = await getApplicationOrRedirect(id, 2);

  const errorMap: Record<string, UploadError> = {
    format: "format",
    size: "size",
    scanned: "scanned",
  };
  const initialError: UploadError =
    error && error in errorMap ? errorMap[error] : null;
  const showLargeWarning = warning === "large";

  return (
    <ApplicationStep2Form
      applicationId={id}
      funderName={funderName}
      grantName={grantName}
      currentStep={currentStep}
      initialError={initialError}
      showLargeWarning={showLargeWarning}
    />
  );
}
