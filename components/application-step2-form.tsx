"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Upload, FileText, X, AlertTriangle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StepIndicator } from "@/components/step-indicator";

type UploadState = "idle" | "uploading" | "uploaded";
type UploadError = "format" | "size" | "scanned" | null;

interface ApplicationStep2FormProps {
  applicationId: string;
  initialError?: UploadError;
  showLargeWarning?: boolean;
}

const ACCEPTED_EXTENSIONS = [".pdf", ".docx"];
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

export function ApplicationStep2Form({
  applicationId,
  initialError = null,
  showLargeWarning = false,
}: ApplicationStep2FormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [uploadError, setUploadError] = useState<UploadError>(initialError);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [largeWarning, setLargeWarning] = useState(showLargeWarning);
  const [pasteText, setPasteText] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  // Animate mock upload progress
  useEffect(() => {
    if (uploadState !== "uploading") return;

    let progress = 0;
    const tick = setInterval(() => {
      progress += Math.random() * 25 + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(tick);
        setUploadProgress(100);
        setTimeout(() => setUploadState("uploaded"), 250);
      } else {
        setUploadProgress(progress);
      }
    }, 180);

    return () => clearInterval(tick);
  }, [uploadState]);

  function processFile(file: File) {
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      setUploadError("format");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setUploadError("size");
      return;
    }
    setUploadError(null);
    setUploadedFileName(file.name);
    setUploadProgress(0);
    setUploadState("uploading");
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  function handleRemove() {
    setUploadState("idle");
    setUploadError(null);
    setUploadedFileName(null);
    setUploadProgress(0);
    setLargeWarning(false);
  }

  const hasContent = uploadState === "uploaded" || pasteText.trim().length > 0;

  return (
    <div className="mx-auto w-full max-w-[640px] px-4 py-10 sm:px-0">
      <StepIndicator currentStep={2} />

      <h1 className="mb-2 text-[24px] font-bold text-[#1E293B]">
        Add the funder&apos;s guidelines
      </h1>
      <p className="mb-6 text-[15px] text-[#64748B]">
        Upload the funder&apos;s guidelines document, or paste the text directly below.
      </p>

      {/* ── File upload area ── */}
      <div className="mb-4">

        {/* Idle — dropzone */}
        {uploadState === "idle" && !uploadError && (
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload file — click to browse or drag and drop"
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
            }}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-2 ${
              isDragOver
                ? "border-[#0D6E6E] bg-[#E6F4F4]"
                : "border-[#CBD5E1] bg-[#F8FAFC] hover:border-[#0D6E6E] hover:bg-[#F0F9F9]"
            }`}
          >
            <Upload
              className={`h-8 w-8 ${isDragOver ? "text-[#0D6E6E]" : "text-[#94A3B8]"}`}
              aria-hidden="true"
            />
            <div className="text-center">
              <p className="text-[14px] font-medium text-[#1E293B]">
                Drag and drop your document here, or{" "}
                <span className="text-[#0D6E6E] underline">click to browse</span>
              </p>
              <p className="mt-1 text-[13px] text-[#64748B]">PDF or Word (.docx) · max 10MB</p>
            </div>
          </div>
        )}

        {/* Uploading — progress bar */}
        {uploadState === "uploading" && (
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
            <div className="mb-3 flex items-center gap-3">
              <FileText className="h-5 w-5 shrink-0 text-[#64748B]" aria-hidden="true" />
              <span className="truncate text-[14px] text-[#1E293B]">{uploadedFileName}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
              <div
                className="h-full rounded-full bg-[#0D6E6E] transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
                role="progressbar"
                aria-valuenow={Math.round(uploadProgress)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Upload progress"
              />
            </div>
            <p className="mt-2 text-[12px] text-[#64748B]">Uploading…</p>
          </div>
        )}

        {/* Uploaded — success */}
        {uploadState === "uploaded" && (
          <div className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-white p-4">
            <FileText className="h-5 w-5 shrink-0 text-[#0D6E6E]" aria-hidden="true" />
            <span className="flex-1 truncate text-[14px] text-[#1E293B]">{uploadedFileName}</span>
            <button
              type="button"
              onClick={handleRemove}
              aria-label={`Remove ${uploadedFileName}`}
              className="rounded text-[#64748B] transition-colors hover:text-[#DC2626] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706]"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Error state */}
        {uploadError && (
          <div>
            <div
              role="alert"
              className="flex items-start gap-3 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] p-4"
            >
              <AlertCircle
                className="mt-0.5 h-4 w-4 shrink-0 text-[#DC2626]"
                aria-hidden="true"
              />
              <p className="text-[14px] text-[#991B1B]">
                {uploadError === "format" &&
                  "We can only accept PDF or Word (.docx) files. Please convert your document or paste the text directly."}
                {uploadError === "size" &&
                  "Your file is over 10MB. Some funders publish a shorter summary version of their guidelines — check their website first. If not, you can paste the key sections — such as eligibility criteria and application questions — into the text box below."}
                {uploadError === "scanned" &&
                  "We couldn't read the text in your PDF — it may be a scanned document. Please try copying and pasting the text directly instead."}
              </p>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="mt-2 rounded text-[13px] text-[#64748B] underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-1"
            >
              Try a different file
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileChange}
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>

      {/* Large document warning */}
      {largeWarning && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-3 rounded-lg border border-[#FDE68A] bg-[#FFFBEB] p-4"
        >
          <AlertTriangle
            className="mt-0.5 h-4 w-4 shrink-0 text-[#B45309]"
            aria-hidden="true"
          />
          <p className="text-[13px] text-[#78350F]">
            Your guidelines document is quite long. For the best results, we recommend uploading
            only the core sections — such as eligibility criteria, application questions, and
            assessment criteria. Very long documents may reduce the quality of your AI summary.
          </p>
        </div>
      )}

      {/* Paste text area */}
      <div className="mb-8">
        <Label
          htmlFor="pasteText"
          className="mb-1.5 block text-[14px] font-medium text-[#1E293B]"
        >
          Or paste the guidelines text here
        </Label>
        <Textarea
          id="pasteText"
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          rows={8}
          placeholder="Paste the full text of the funder's guidelines here…"
          className="text-[14px]"
        />
      </div>

      {/* Back + Continue */}
      <div className="flex items-center justify-between">
        <Link
          href={`/applications/${applicationId}/step/1`}
          className="rounded text-[14px] text-[#64748B] transition-colors hover:text-[#1E293B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-1"
        >
          Back
        </Link>
        <Button
          type="button"
          disabled={!hasContent}
          onClick={() => router.push(`/applications/${applicationId}/step/3`)}
          className="h-10 bg-[#0D6E6E] px-6 text-[15px] font-semibold text-white hover:bg-[#0A5A5A] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
