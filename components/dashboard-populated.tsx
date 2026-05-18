"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

type ApplicationStatus = "not_started" | "in_progress" | "approved" | "exported";

interface Application {
  id: string;
  funderName: string;
  grantName: string;
  status: ApplicationStatus;
  lastUpdated: string;
}

// Mock data — replaced by real Supabase fetch in Slice 0
const MOCK_APPLICATIONS: Application[] = [
  {
    id: "1",
    funderName: "National Lottery Community Fund",
    grantName: "Community Garden Project",
    status: "in_progress",
    lastUpdated: "2026-05-15",
  },
  {
    id: "2",
    funderName: "Heritage Lottery Fund",
    grantName: "Local History Archive",
    status: "not_started",
    lastUpdated: "2026-05-10",
  },
  {
    id: "3",
    funderName: "Arts Council England",
    grantName: "Youth Theatre Programme",
    status: "approved",
    lastUpdated: "2026-05-08",
  },
  {
    id: "4",
    funderName: "Comic Relief",
    grantName: "Mental Health Support Initiative",
    status: "exported",
    lastUpdated: "2026-04-30",
  },
];

const MOCK_AI_REQUESTS_USED = 3;
const AI_REQUESTS_LIMIT = 20;
const MOCK_PROFILE_INCOMPLETE = true;

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; bg: string; text: string }
> = {
  not_started: { label: "Not started", bg: "#F1F5F9", text: "#64748B" },
  in_progress: { label: "In progress", bg: "#FEF3C7", text: "#D97706" },
  approved: { label: "Approved", bg: "#DCFCE7", text: "#16A34A" },
  exported: { label: "Exported", bg: "#E6F4F4", text: "#0D6E6E" },
};

function deleteModalText(status: ApplicationStatus): string {
  if (status === "approved") {
    return "Are you sure you want to delete this approved application? Your answers will be permanently removed and cannot be recovered.";
  }
  if (status === "exported") {
    return "Are you sure you want to delete this application? Your answers will be permanently removed. Make sure you have kept a copy of your exported document.";
  }
  return "Are you sure you want to delete this application? This cannot be undone.";
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function DashboardPopulated() {
  const [deleteTarget, setDeleteTarget] = useState<Application | null>(null);
  const [reopenTarget, setReopenTarget] = useState<Application | null>(null);

  const apps = MOCK_APPLICATIONS;

  const counts = {
    not_started: apps.filter((a) => a.status === "not_started").length,
    in_progress: apps.filter((a) => a.status === "in_progress").length,
    approved: apps.filter((a) => a.status === "approved").length,
    exported: apps.filter((a) => a.status === "exported").length,
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] px-10 py-10">
      {/* Heading + New Application button */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-[24px] font-bold text-[#1E293B]">My Applications</h1>
        <Link
          href="/applications/new"
          className="inline-flex h-10 items-center gap-1.5 rounded-md bg-[#0D6E6E] px-4 text-[14px] font-semibold text-white transition-colors hover:bg-[#0A5A5A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-2"
        >
          + New Application
        </Link>
      </div>

      {/* Summary strip */}
      <div className="mb-4 flex flex-wrap items-center gap-x-2 text-[14px] text-[#64748B]">
        <span className="font-semibold text-[#1E293B]">{apps.length} applications</span>
        <span aria-hidden="true">—</span>
        <span>{counts.not_started} not started</span>
        <span aria-hidden="true">·</span>
        <span>{counts.in_progress} in progress</span>
        <span aria-hidden="true">·</span>
        <span>{counts.approved} approved</span>
        <span aria-hidden="true">·</span>
        <span>{counts.exported} exported</span>
        <span aria-hidden="true" className="mx-2">|</span>
        <span className="text-[13px]">
          {MOCK_AI_REQUESTS_USED} of {AI_REQUESTS_LIMIT} AI requests used this month
        </span>
      </div>

      {/* Charity profile incomplete banner */}
      {MOCK_PROFILE_INCOMPLETE && (
        <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-[#EDE8E1] bg-[#FEF9F5] px-5 py-4">
          <p className="text-[14px] text-[#1E293B]">
            Before you start, add your charity details — we&apos;ll use these to personalise your
            applications.
          </p>
          <Link
            href="/profile"
            className="flex-shrink-0 rounded-md border border-[#0D6E6E] px-3 py-1.5 text-[13px] font-semibold text-[#0D6E6E] transition-colors hover:bg-[#E6F4F4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-2"
          >
            Set up charity profile
          </Link>
        </div>
      )}

      {/* Application cards */}
      <div className="flex flex-col gap-4">
        {apps.map((app) => {
          const pill = STATUS_CONFIG[app.status];
          const isViewMode = app.status === "approved" || app.status === "exported";

          return (
            <div
              key={app.id}
              className="flex items-center justify-between gap-6 rounded-xl border border-[#E2E8F0] bg-white px-6 py-5"
            >
              {/* Left: app details */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[16px] font-bold text-[#1E293B]">{app.funderName}</p>
                <p className="mt-0.5 truncate text-[14px] text-[#64748B]">{app.grantName}</p>
                <div className="mt-3 flex items-center gap-3">
                  <span
                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-semibold"
                    style={{ backgroundColor: pill.bg, color: pill.text }}
                  >
                    {pill.label}
                  </span>
                  <span className="text-[13px] text-[#94A3B8]">
                    Last updated {formatDate(app.lastUpdated)}
                  </span>
                </div>
              </div>

              {/* Right: actions */}
              <div className="flex flex-shrink-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(app)}
                  className="text-[13px] font-medium text-[#DC2626] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-1 rounded"
                >
                  Delete
                </button>

                <Button
                  type="button"
                  onClick={() => {
                    if (isViewMode) {
                      setReopenTarget(app);
                    }
                    // Continue: Slice 0 navigates to /applications/[id] → current step
                  }}
                  className={
                    isViewMode
                      ? "h-9 border border-[#0D6E6E] bg-white px-4 text-[13px] font-semibold text-[#0D6E6E] hover:bg-[#E6F4F4]"
                      : "h-9 bg-[#0D6E6E] px-4 text-[13px] font-semibold text-white hover:bg-[#0A5A5A]"
                  }
                >
                  {isViewMode ? "View" : "Continue"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete confirmation modal */}
      <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent showCloseButton={false} className="max-w-[440px]">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-[16px] font-bold text-[#1E293B]">
              Delete application
            </DialogTitle>
            <DialogDescription className="mt-2 text-[14px] text-[#64748B]">
              {deleteTarget ? deleteModalText(deleteTarget.status) : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="px-6 py-4">
            <DialogClose
              render={
                <Button
                  variant="outline"
                  className="border-[#E2E8F0] text-[14px] font-semibold text-[#1E293B]"
                />
              }
            >
              Cancel
            </DialogClose>
            <Button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="bg-[#DC2626] text-[14px] font-semibold text-white hover:bg-[#B91C1C]"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Re-open confirmation modal */}
      <Dialog open={reopenTarget !== null} onOpenChange={(open) => !open && setReopenTarget(null)}>
        <DialogContent showCloseButton={false} className="max-w-[440px]">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-[16px] font-bold text-[#1E293B]">
              Re-open application
            </DialogTitle>
            <DialogDescription className="mt-2 text-[14px] text-[#64748B]">
              Re-opening this application will remove your approval. You will need to review and
              approve your answers again before you can export.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="px-6 py-4">
            <DialogClose
              render={
                <Button
                  variant="outline"
                  className="border-[#E2E8F0] text-[14px] font-semibold text-[#1E293B]"
                />
              }
            >
              Cancel
            </DialogClose>
            <Button
              type="button"
              onClick={() => setReopenTarget(null)}
              className="bg-[#0D6E6E] text-[14px] font-semibold text-white hover:bg-[#0A5A5A]"
            >
              Re-open
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DialogHeader({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={`flex flex-col gap-1 ${className ?? ""}`} {...props}>
      {children}
    </div>
  );
}
