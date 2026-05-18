"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RefreshCw, AlertCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { StepIndicator } from "@/components/step-indicator";

type DisplayState = "loading" | "content" | "failure" | "persistent-failure";
type UsageState = "normal" | "high" | "limit";

interface ApplicationStep4DraftProps {
  applicationId: string;
  initialState?: DisplayState;
  questionsNotFound?: boolean;
  usageState?: UsageState;
}

// Staged loading messages keyed to progress thresholds
const LOADING_MESSAGES = [
  { threshold: 0, text: "Reviewing your guidelines and charity profile…" },
  { threshold: 40, text: "Writing your draft answers…" },
  { threshold: 75, text: "Almost there…" },
];

const REVIEW_PROMPTS = [
  "Does this accurately describe your charity and project?",
  "Are all figures, dates, and facts correct?",
  "Does this answer the question that was asked?",
];

// Mock questions + AI-generated draft answers
const MOCK_QUESTIONS = [
  {
    id: 1,
    text: "Describe your project and who it will help. What problem are you addressing?",
    wordLimit: 400,
    answer:
      "Helping Hands UK runs Community Kitchens, a programme providing free hot meals and social activities for adults experiencing homelessness and social isolation in Greater Manchester.\n\nWe address a dual crisis: food poverty and loneliness. Many people who are homeless or at risk of homelessness have few social connections, which compounds the effects of poverty and makes it harder to rebuild their lives. Our Community Kitchens sessions provide more than food — they create a space where people feel seen, valued, and part of a community.\n\nOver the next 12 months we will deliver 156 meal sessions, reaching over 500 unique individuals across Greater Manchester, Lancashire, and Cheshire. Each session is attended by around 40 participants and facilitated by trained volunteers.",
  },
  {
    id: 2,
    text: "How does your project meet our funding priorities?",
    wordLimit: 300,
    answer:
      "Community Kitchens directly meets the National Lottery Community Fund's Awards for All priorities by bringing people together, building connections, and enabling communities to take more active roles.\n\nOur sessions are co-designed with participants, many of whom go on to volunteer themselves — creating a clear pathway from isolation to community involvement. We actively recruit volunteers from the communities we serve, which builds local capacity and strengthens the social fabric of the areas we work in.\n\nThe project also supports people to become more active in community life by connecting participants with local groups, activities, and services they may not have been aware of.",
  },
  {
    id: 3,
    text: "How will you know your project has been successful?",
    wordLimit: 200,
    answer:
      "We will measure success through a combination of quantitative and qualitative indicators. Quantitatively, we will track attendance at each session, the number of unique individuals reached, and volunteer hours contributed.\n\nQualitatively, we will collect short feedback forms from participants every quarter, asking about their sense of belonging, social connections, and wellbeing. We will also carry out follow-up conversations with a sample of 20 participants to understand the longer-term impact of the project.",
  },
];

export function ApplicationStep4Draft({
  applicationId,
  initialState = "loading",
  questionsNotFound = false,
  usageState = "normal",
}: ApplicationStep4DraftProps) {
  const router = useRouter();
  const [displayState, setDisplayState] = useState<DisplayState>(initialState);
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0].text);
  const [answers, setAnswers] = useState<Record<number, string>>(
    Object.fromEntries(MOCK_QUESTIONS.map((q) => [q.id, q.answer]))
  );
  const [manualQuestion, setManualQuestion] = useState("");

  // Auto-animate loading → content
  useEffect(() => {
    if (displayState !== "loading") return;

    setProgress(0);
    setLoadingMessage(LOADING_MESSAGES[0].text);

    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 6 + 2;
      const msg =
        [...LOADING_MESSAGES].reverse().find((m) => p >= m.threshold)?.text ??
        LOADING_MESSAGES[0].text;
      setLoadingMessage(msg);

      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => setDisplayState("content"), 300);
      } else {
        setProgress(p);
      }
    }, 160);

    return () => clearInterval(interval);
  }, [displayState]);

  const limitReached = usageState === "limit";

  function handleRegenerate() {
    if (limitReached) return;
    setDisplayState("loading");
  }

  function handleTryAgain() {
    setDisplayState("loading");
  }

  // ── Loading state ───────────────────────────────────────────────────────────
  if (displayState === "loading") {
    return (
      <div className="mx-auto w-full max-w-[640px] px-4 py-10 sm:px-0">
        <StepIndicator currentStep={4} />
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-8">
          <p className="mb-4 text-[15px] font-medium text-[#1E293B]">{loadingMessage}</p>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
            <div
              className="h-full rounded-full bg-[#0D6E6E] transition-all duration-200"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Generating draft answers"
            />
          </div>
        </div>
      </div>
    );
  }

  // ── API failure state ───────────────────────────────────────────────────────
  if (displayState === "failure") {
    return (
      <div className="mx-auto w-full max-w-[640px] px-4 py-10 sm:px-0">
        <StepIndicator currentStep={4} />
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] p-4"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#DC2626]" aria-hidden="true" />
          <div>
            <p className="text-[14px] text-[#991B1B]">
              We couldn&apos;t generate your draft answers right now. This is usually temporary —
              please try again.
            </p>
            <Button
              type="button"
              onClick={handleTryAgain}
              className="mt-3 h-9 bg-[#0D6E6E] px-4 text-[14px] font-semibold text-white hover:bg-[#0A5A5A]"
            >
              Try again
            </Button>
          </div>
        </div>
        <div className="mt-6">
          <Link
            href={`/applications/${applicationId}/step/3`}
            className="rounded text-[14px] text-[#64748B] transition-colors hover:text-[#1E293B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-1"
          >
            Back
          </Link>
        </div>
      </div>
    );
  }

  // ── Persistent failure state ────────────────────────────────────────────────
  if (displayState === "persistent-failure") {
    return (
      <div className="mx-auto w-full max-w-[640px] px-4 py-10 sm:px-0">
        <StepIndicator currentStep={4} />
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] p-4"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#DC2626]" aria-hidden="true" />
          <p className="text-[14px] text-[#991B1B]">
            If this keeps happening, please try again later. Your work has been saved.
          </p>
        </div>
        <div className="mt-6">
          <Link
            href={`/applications/${applicationId}/step/3`}
            className="rounded text-[14px] text-[#64748B] transition-colors hover:text-[#1E293B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-1"
          >
            Back
          </Link>
        </div>
      </div>
    );
  }

  // ── Content state ───────────────────────────────────────────────────────────
  return (
    <div className="mx-auto w-full max-w-[980px] px-4 py-10 sm:px-6">
      {/* Step indicator constrained to main column width */}
      <div className="max-w-[640px]">
        <StepIndicator currentStep={4} />
      </div>

      <div className="flex items-start gap-8">
        {/* ── Left: main content ── */}
        <div className="w-full min-w-0 max-w-[640px]">
          <h1 className="mb-6 text-[24px] font-bold text-[#1E293B]">Your draft answers</h1>

          {/* Approaching-limit banner */}
          {usageState === "high" && (
            <div
              role="alert"
              className="mb-6 flex items-start gap-3 rounded-lg border border-[#FDE68A] bg-[#FFFBEB] p-4"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#B45309]" aria-hidden="true" />
              <p className="text-[13px] text-[#78350F]">
                You&apos;ve used most of your monthly AI allowance.
              </p>
            </div>
          )}

          {/* Limit-reached banner */}
          {limitReached && (
            <div
              role="alert"
              className="mb-6 flex items-start gap-3 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] p-4"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#DC2626]" aria-hidden="true" />
              <p className="text-[13px] text-[#991B1B]">
                You&apos;ve reached your monthly AI limit. You can still edit your answers manually,
                but you won&apos;t be able to regenerate them until next month.
              </p>
            </div>
          )}

          {/* Manual question entry (no questions extracted in Step 3) */}
          {questionsNotFound ? (
            <div className="mb-8">
              <div className="mb-5">
                <Label
                  htmlFor="manualQuestion"
                  className="mb-1.5 block text-[14px] font-medium text-[#1E293B]"
                >
                  Enter your application question
                </Label>
                <Input
                  id="manualQuestion"
                  type="text"
                  value={manualQuestion}
                  onChange={(e) => setManualQuestion(e.target.value)}
                  placeholder="e.g. Describe your project and who it will help."
                  className="h-10 text-[14px]"
                />
              </div>
              <div>
                <Label
                  htmlFor="manualAnswer"
                  className="mb-1.5 block text-[14px] font-medium text-[#1E293B]"
                >
                  Your answer
                </Label>
                <Textarea
                  id="manualAnswer"
                  rows={8}
                  className="text-[14px]"
                  placeholder="Write your answer here…"
                />
              </div>
            </div>
          ) : (
            /* AI-generated draft answers */
            <div className="mb-6 space-y-8">
              {MOCK_QUESTIONS.map((q) => (
                <div key={q.id}>
                  <p className="mb-2 text-[15px] font-semibold text-[#1E293B]">
                    {q.id}. {q.text}
                    <span className="ml-2 text-[13px] font-normal text-[#64748B]">
                      ({q.wordLimit} words)
                    </span>
                  </p>
                  <Textarea
                    id={`answer-${q.id}`}
                    value={answers[q.id]}
                    onChange={(e) =>
                      setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                    }
                    rows={7}
                    aria-label={`Answer for question ${q.id}`}
                    className="text-[14px]"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Regenerate all answers link */}
          <div className="mb-8">
            <button
              type="button"
              onClick={handleRegenerate}
              disabled={limitReached}
              className="flex items-center gap-1.5 rounded text-[14px] text-[#64748B] underline hover:text-[#1E293B] hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40 disabled:no-underline"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              Regenerate all answers
            </button>
          </div>

          {/* Back + Continue */}
          <div className="flex items-center justify-between">
            <Link
              href={`/applications/${applicationId}/step/3`}
              className="rounded text-[14px] text-[#64748B] transition-colors hover:text-[#1E293B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-1"
            >
              Back
            </Link>
            <Button
              type="button"
              onClick={() => router.push(`/applications/${applicationId}/step/5`)}
              className="h-10 bg-[#0D6E6E] px-6 text-[15px] font-semibold text-white hover:bg-[#0A5A5A]"
            >
              I&apos;ve reviewed my answers — continue
            </Button>
          </div>
        </div>

        {/* ── Right: sticky review prompts sidebar ── */}
        <aside
          aria-label="Review checklist"
          className="hidden w-[280px] shrink-0 lg:block"
        >
          <div className="sticky top-8 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-5">
            <h2 className="mb-4 text-[12px] font-semibold uppercase tracking-wide text-[#64748B]">
              Before you continue
            </h2>
            <ul className="space-y-4">
              {REVIEW_PROMPTS.map((prompt, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0D6E6E] text-[11px] font-bold text-white"
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <p className="text-[13px] leading-snug text-[#374151]">{prompt}</p>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
