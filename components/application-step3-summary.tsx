"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RefreshCw, AlertCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StepIndicator } from "@/components/step-indicator";

type DisplayState = "loading" | "content" | "failure" | "persistent-failure";

interface ApplicationStep3SummaryProps {
  applicationId: string;
  initialState?: DisplayState;
  questionsNotFound?: boolean;
  approachingLimit?: boolean;
}

// Staged loading messages keyed to progress thresholds
const LOADING_MESSAGES = [
  { threshold: 0, text: "Reading your funder guidelines…" },
  { threshold: 60, text: "Almost there…" },
];

// Mock AI summary content
const MOCK_SUMMARY = {
  aboutGrant:
    "Awards for All England is a small grants programme run by The National Lottery Community Fund. It supports local communities to thrive by funding projects that bring people together and build strong, connected communities.",
  amount: "Between £300 and £10,000.",
  whoCanApply: [
    "Voluntary or community organisations",
    "Constituted groups and charitable incorporated organisations (CIOs)",
    "Registered charities and community interest companies (CICs) not distributing profit",
    "Organisations based in England with an annual income under £500,000",
  ],
  lookingFor: [
    "Projects that bring people together in their local community",
    "Activities that help people become more active in community life",
    "Initiatives that build connections between people who might otherwise be isolated",
    "Work that enables communities to take on more active and visible roles",
  ],
  questions: [
    {
      number: 1,
      text: "Describe your project and who it will help. What problem are you addressing?",
      wordLimit: 400,
    },
    {
      number: 2,
      text: "How does your project meet our funding priorities?",
      wordLimit: 300,
    },
    {
      number: 3,
      text: "How will you know your project has been successful?",
      wordLimit: 200,
    },
  ],
  keyRequirements: [
    "Activities must take place in England",
    "Project must be completed within 12 months of receiving funding",
    "You must demonstrate how communities will be involved in your project",
    "Funds cannot be used for activities that have already taken place",
  ],
};

export function ApplicationStep3Summary({
  applicationId,
  initialState = "loading",
  questionsNotFound = false,
  approachingLimit = false,
}: ApplicationStep3SummaryProps) {
  const router = useRouter();
  const [displayState, setDisplayState] = useState<DisplayState>(initialState);
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0].text);

  // Auto-animate loading → content
  useEffect(() => {
    if (displayState !== "loading") return;

    setProgress(0);
    setLoadingMessage(LOADING_MESSAGES[0].text);

    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 7 + 3;
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

  function handleRegenerate() {
    setDisplayState("loading");
  }

  function handleTryAgain() {
    setDisplayState("loading");
  }

  // ── Loading state ───────────────────────────────────────────────────────────
  if (displayState === "loading") {
    return (
      <div className="mx-auto w-full max-w-[640px] px-4 py-10 sm:px-0">
        <StepIndicator currentStep={3} />
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
              aria-label="Generating AI summary"
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
        <StepIndicator currentStep={3} />
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] p-4"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#DC2626]" aria-hidden="true" />
          <div>
            <p className="text-[14px] text-[#991B1B]">
              We couldn&apos;t generate your summary right now. This is usually temporary — please
              try again.
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
            href={`/applications/${applicationId}/step/2`}
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
        <StepIndicator currentStep={3} />
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
            href={`/applications/${applicationId}/step/2`}
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
    <div className="mx-auto w-full max-w-[640px] px-4 py-10 sm:px-0">
      <StepIndicator currentStep={3} />

      <h1 className="mb-6 text-[24px] font-bold text-[#1E293B]">
        Your funder guidelines — summary
      </h1>

      {/* Approaching limit banner */}
      {approachingLimit && (
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

      {/* AI summary content */}
      <div className="mb-6 space-y-5 rounded-xl border border-[#E2E8F0] bg-white p-6">
        <Section title="About this grant">
          <p className="text-[14px] text-[#374151]">{MOCK_SUMMARY.aboutGrant}</p>
        </Section>

        <Section title="Grant amount">
          <p className="text-[14px] text-[#374151]">{MOCK_SUMMARY.amount}</p>
        </Section>

        <Section title="Who can apply">
          <BulletList items={MOCK_SUMMARY.whoCanApply} />
        </Section>

        <Section title="What the funder is looking for">
          <BulletList items={MOCK_SUMMARY.lookingFor} />
        </Section>

        <Section title="Application questions">
          {MOCK_SUMMARY.questions.map((q) => (
            <div key={q.number} className="mb-2 last:mb-0">
              <p className="text-[14px] text-[#374151]">
                <span className="font-medium">{q.number}.</span> {q.text}{" "}
                <span className="text-[#64748B]">({q.wordLimit} words)</span>
              </p>
            </div>
          ))}
        </Section>

        <Section title="Key requirements">
          <BulletList items={MOCK_SUMMARY.keyRequirements} />
        </Section>
      </div>

      {/* Questions extracted / not found note */}
      {questionsNotFound ? (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4">
          <AlertTriangle
            className="mt-0.5 h-4 w-4 shrink-0 text-[#64748B]"
            aria-hidden="true"
          />
          <p className="text-[13px] text-[#475569]">
            We couldn&apos;t identify specific application questions in this document. In the next
            step, you&apos;ll be able to enter your questions manually.
          </p>
        </div>
      ) : (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-[#A7F3D0] bg-[#ECFDF5] p-4">
          <span
            className="mt-0.5 h-4 w-4 shrink-0 text-center text-[13px] font-bold leading-4 text-[#059669]"
            aria-hidden="true"
          >
            ✓
          </span>
          <p className="text-[13px] text-[#065F46]">
            We found {MOCK_SUMMARY.questions.length} application questions in these guidelines.
            We&apos;ll use these to generate your draft answers in the next step.
          </p>
        </div>
      )}

      {/* Regenerate link */}
      <div className="mb-8">
        <button
          type="button"
          onClick={handleRegenerate}
          className="flex items-center gap-1.5 rounded text-[14px] text-[#64748B] underline hover:text-[#1E293B] hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-1"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          Regenerate summary
        </button>
      </div>

      {/* Back + Continue */}
      <div className="flex items-center justify-between">
        <Link
          href={`/applications/${applicationId}/step/2`}
          className="rounded text-[14px] text-[#64748B] transition-colors hover:text-[#1E293B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-1"
        >
          Back
        </Link>
        <Button
          type="button"
          onClick={() => router.push(`/applications/${applicationId}/step/4`)}
          className="h-10 bg-[#0D6E6E] px-6 text-[15px] font-semibold text-white hover:bg-[#0A5A5A]"
        >
          This looks right — continue
        </Button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-[#64748B]">
        {title}
      </h2>
      {children}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-[14px] text-[#374151]">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0D6E6E]" aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  );
}
