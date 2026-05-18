"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StepIndicator } from "@/components/step-indicator";

type ApprovalStatus = "pending" | "approved" | "exported";

interface ApplicationStep5ApproveProps {
  applicationId: string;
  initialStatus?: ApprovalStatus;
}

const REVIEW_PROMPTS = [
  "Check that your answers are accurate and reflect your charity's work.",
  "Make sure you have answered every question the funder asked.",
  "Read through as if you were the funder — does your application make a strong case?",
];

// Same mock questions/answers as Step 4
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

const MOCK_EXPORT_DATE = "18 May 2026";

export function ApplicationStep5Approve({
  applicationId,
  initialStatus = "pending",
}: ApplicationStep5ApproveProps) {
  const router = useRouter();
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>(initialStatus);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showReExportDialog, setShowReExportDialog] = useState(false);
  const [showReOpenDialog, setShowReOpenDialog] = useState(false);

  const isApproved = approvalStatus === "approved" || approvalStatus === "exported";
  const isExported = approvalStatus === "exported";

  function handleApproveConfirm() {
    setApprovalStatus("approved");
    setShowApproveDialog(false);
  }

  function handleDownloadClick() {
    if (isExported) {
      setShowReExportDialog(true);
    } else {
      // First download — mark as exported (static shell simulates the action)
      setApprovalStatus("exported");
    }
  }

  function handleReOpenConfirm() {
    setShowReOpenDialog(false);
    router.push(`/applications/${applicationId}/step/4`);
  }

  return (
    <div className="mx-auto w-full max-w-[640px] px-4 py-10 sm:px-0">
      <StepIndicator currentStep={5} />

      <h1 className="mb-6 text-[24px] font-bold text-[#1E293B]">
        Review and approve your application
      </h1>

      {/* Three review prompts */}
      <div className="mb-8 space-y-3">
        {REVIEW_PROMPTS.map((prompt, i) => (
          <div
            key={i}
            className="flex items-start gap-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4"
          >
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0D6E6E] text-[12px] font-bold text-white"
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <p className="text-[14px] text-[#374151]">{prompt}</p>
          </div>
        ))}
      </div>

      {/* Read-only answers */}
      <div className="mb-8 space-y-5">
        {MOCK_QUESTIONS.map((q) => (
          <div key={q.id} className="rounded-xl border border-[#E2E8F0] bg-white p-5">
            <p className="mb-3 text-[14px] font-semibold text-[#1E293B]">
              {q.id}.&nbsp;{q.text}
              <span className="ml-2 text-[12px] font-normal text-[#64748B]">
                ({q.wordLimit} words)
              </span>
            </p>
            <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-[#374151]">
              {q.answer}
            </p>
          </div>
        ))}
      </div>

      {/* Approved indicator */}
      {isApproved && (
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] p-4">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-[#16A34A]" aria-hidden="true" />
          <p className="text-[14px] font-medium text-[#166534]">
            {isExported ? "Application approved and exported." : "Application approved."}
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="mb-6 space-y-3">
        {/* Approve button — shown only when pending */}
        {!isApproved && (
          <Button
            type="button"
            onClick={() => setShowApproveDialog(true)}
            className="h-10 w-full bg-[#0D6E6E] text-[15px] font-semibold text-white hover:bg-[#0A5A5A]"
          >
            Approve my application
          </Button>
        )}

        {/* Download button */}
        <Button
          type="button"
          onClick={handleDownloadClick}
          disabled={!isApproved}
          variant="outline"
          className="h-10 w-full border-[#0D6E6E] text-[15px] font-semibold text-[#0D6E6E] hover:bg-[#E6F4F4] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Download className="mr-2 h-4 w-4" aria-hidden="true" />
          Download as Word document
        </Button>
      </div>

      {/* Re-open link — shown after approval */}
      {isApproved && (
        <div className="mb-8">
          <button
            type="button"
            onClick={() => setShowReOpenDialog(true)}
            className="rounded text-[14px] text-[#64748B] underline hover:text-[#1E293B] hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-1"
          >
            Re-open application
          </button>
        </div>
      )}

      {/* Back link */}
      <div>
        <Link
          href={`/applications/${applicationId}/step/4`}
          className="rounded text-[14px] text-[#64748B] transition-colors hover:text-[#1E293B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-1"
        >
          Back
        </Link>
      </div>

      {/* ── Approve confirmation dialog ───────────────────────────────────── */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve this application?</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this application? You can re-open it to make changes
              at any time.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowApproveDialog(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleApproveConfirm}
              className="bg-[#0D6E6E] text-white hover:bg-[#0A5A5A]"
            >
              Approve my application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Re-export warning dialog ──────────────────────────────────────── */}
      <Dialog open={showReExportDialog} onOpenChange={setShowReExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Download again?</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-2 text-[14px] text-[#374151]">
                <p>
                  You exported this application on {MOCK_EXPORT_DATE}. If you have already
                  submitted that version to the funder, please contact them to let them know a
                  revised version is being submitted.
                </p>
                <p>Funders may treat multiple submissions as separate applications.</p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowReExportDialog(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => setShowReExportDialog(false)}
              className="bg-[#0D6E6E] text-white hover:bg-[#0A5A5A]"
            >
              Download anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Re-open confirmation dialog ───────────────────────────────────── */}
      <Dialog open={showReOpenDialog} onOpenChange={setShowReOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Re-open this application?</DialogTitle>
            <DialogDescription>
              Re-opening this application will remove your approval. You will need to review and
              approve your answers again before you can export.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowReOpenDialog(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleReOpenConfirm}
              className="bg-[#0D6E6E] text-white hover:bg-[#0A5A5A]"
            >
              Re-open application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
