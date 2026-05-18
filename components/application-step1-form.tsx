"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StepIndicator } from "@/components/step-indicator";

interface FieldErrors {
  funderName?: string;
  grantName?: string;
}

interface ApplicationStep1FormProps {
  // Provided when editing an existing application; undefined for /applications/new
  applicationId?: string;
  initialFunderName?: string;
  initialGrantName?: string;
}

// Mock application ID used for static navigation in the shell
const MOCK_ID = "123";

export function ApplicationStep1Form({
  applicationId,
  initialFunderName = "",
  initialGrantName = "",
}: ApplicationStep1FormProps) {
  const router = useRouter();
  const [funderName, setFunderName] = useState(initialFunderName);
  const [grantName, setGrantName] = useState(initialGrantName);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errors: FieldErrors = {};
    if (!funderName.trim()) errors.funderName = "Please enter the funder's name";
    if (!grantName.trim()) errors.grantName = "Please enter the grant name";
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    // Static shell: navigate to Step 2 with a mock or existing ID
    const id = applicationId ?? MOCK_ID;
    router.push(`/applications/${id}/step/2`);
  }

  return (
    <div className="mx-auto w-full max-w-[640px] px-4 py-10 sm:px-0">
      <StepIndicator currentStep={1} />

      <h1 className="mb-6 text-[24px] font-bold text-[#1E293B]">
        Start a new application
      </h1>

      <form noValidate onSubmit={handleSubmit}>
        {/* Who is offering this grant? */}
        <div className="mb-5">
          <Label
            htmlFor="funderName"
            className="mb-1.5 block text-[14px] font-medium text-[#1E293B]"
          >
            Who is offering this grant?{" "}
            <span className="text-[#DC2626]" aria-hidden="true">*</span>
          </Label>
          <Input
            id="funderName"
            type="text"
            placeholder="e.g. National Lottery Community Fund"
            value={funderName}
            onChange={(e) => setFunderName(e.target.value)}
            aria-invalid={!!fieldErrors.funderName || undefined}
            aria-describedby={fieldErrors.funderName ? "funderName-error" : undefined}
            className="h-10 text-[14px]"
          />
          {fieldErrors.funderName && (
            <p id="funderName-error" role="alert" className="mt-1.5 text-[13px] text-[#DC2626]">
              {fieldErrors.funderName}
            </p>
          )}
        </div>

        {/* What is the grant called? */}
        <div className="mb-8">
          <Label
            htmlFor="grantName"
            className="mb-1.5 block text-[14px] font-medium text-[#1E293B]"
          >
            What is the grant called?{" "}
            <span className="text-[#DC2626]" aria-hidden="true">*</span>
          </Label>
          <Input
            id="grantName"
            type="text"
            placeholder="e.g. Awards for All England"
            value={grantName}
            onChange={(e) => setGrantName(e.target.value)}
            aria-invalid={!!fieldErrors.grantName || undefined}
            aria-describedby={fieldErrors.grantName ? "grantName-error" : undefined}
            className="h-10 text-[14px]"
          />
          {fieldErrors.grantName && (
            <p id="grantName-error" role="alert" className="mt-1.5 text-[13px] text-[#DC2626]">
              {fieldErrors.grantName}
            </p>
          )}
        </div>

        {/* Cancel + Continue */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-[14px] text-[#64748B] transition-colors hover:text-[#1E293B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-1 rounded"
          >
            Cancel
          </Link>
          <Button
            type="submit"
            className="h-10 bg-[#0D6E6E] px-6 text-[15px] font-semibold text-white hover:bg-[#0A5A5A]"
          >
            Continue
          </Button>
        </div>
      </form>
    </div>
  );
}
