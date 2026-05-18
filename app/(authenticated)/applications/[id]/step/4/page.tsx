import type { Metadata } from "next";
import { ApplicationStep4Draft } from "@/components/application-step4-draft";

export const metadata: Metadata = {
  title: "Draft Answers",
};

type DisplayState = "loading" | "content" | "failure" | "persistent-failure";
type UsageState = "normal" | "high" | "limit";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ state?: string; questions?: string; usage?: string }>;
}

export default async function Step4Page({ params, searchParams }: Props) {
  const { id } = await params;
  const { state, questions, usage } = await searchParams;

  const stateMap: Record<string, DisplayState> = {
    content: "content",
    failure: "failure",
    "persistent-failure": "persistent-failure",
  };
  const initialState: DisplayState =
    state && state in stateMap ? stateMap[state] : "loading";

  const usageMap: Record<string, UsageState> = {
    high: "high",
    limit: "limit",
  };
  const usageState: UsageState =
    usage && usage in usageMap ? usageMap[usage] : "normal";

  return (
    <ApplicationStep4Draft
      applicationId={id}
      initialState={initialState}
      questionsNotFound={questions === "none"}
      usageState={usageState}
    />
  );
}
