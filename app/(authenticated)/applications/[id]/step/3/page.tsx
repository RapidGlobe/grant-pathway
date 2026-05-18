import type { Metadata } from "next";
import { ApplicationStep3Summary } from "@/components/application-step3-summary";

export const metadata: Metadata = {
  title: "AI Summary",
};

type DisplayState = "loading" | "content" | "failure" | "persistent-failure";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ state?: string; questions?: string }>;
}

export default async function Step3Page({ params, searchParams }: Props) {
  const { id } = await params;
  const { state, questions } = await searchParams;

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
