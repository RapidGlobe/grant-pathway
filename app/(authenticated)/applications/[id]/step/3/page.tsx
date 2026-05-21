import type { Metadata } from "next";
import { ApplicationStep3Summary } from "@/components/application-step3-summary";
import { getApplicationOrRedirect } from "@/lib/application-guard";

export const metadata: Metadata = {
  title: "AI Summary",
};

type DisplayState = "loading" | "content" | "failure" | "persistent-failure";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ state?: string; questions?: string }>;
}

/**
 * Step 3 — AI Summary (S3.3 step locking applied).
 *
 * getApplicationOrRedirect(id, 3) enforces that current_step >= 3 before
 * this page renders. If Step 2 hasn't been completed yet, the user is
 * redirected back to their current step automatically.
 */
export default async function Step3Page({ params, searchParams }: Props) {
  const { id } = await params;
  const { state, questions } = await searchParams;

  // Step locking: redirects to current step if current_step < 3
  await getApplicationOrRedirect(id, 3);

  const stateMap: Record<string, DisplayState> = {
    content: "content",
    failure: "failure",
    "persistent-failure": "persistent-failure",
  };
  const initialState: DisplayState =
    state && state in stateMap ? stateMap[state] : "loading";

  return (
    <ApplicationStep3Summary
      applicationId={id}
      initialState={initialState}
      questionsNotFound={questions === "none"}
    />
  );
}
