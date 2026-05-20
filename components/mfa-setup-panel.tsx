"use client";

import { useState, useTransition, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  mfaEnroll,
  mfaVerifyEnrollment,
  mfaUnenroll,
  type MfaVerifyEnrollmentState,
  type MfaUnenrollState,
} from "@/actions/auth";

const INITIAL_VERIFY_STATE: MfaVerifyEnrollmentState = { status: "idle" };
const INITIAL_UNENROLL_STATE: MfaUnenrollState = { status: "idle" };

interface MfaSetupPanelProps {
  /** Whether the user already has a verified TOTP factor. */
  mfaEnabled: boolean;
  /** The factor ID of the enrolled TOTP factor (empty string if not enabled). */
  mfaFactorId: string;
}

/**
 * Handles the full MFA setup/removal flow in Account Settings (AC-FR-07-01).
 *
 * Not enabled:
 *   "Set up" button → calls mfaEnroll() (useTransition) → shows QR code +
 *   manual code → verify form (useActionState(mfaVerifyEnrollment)).
 *
 * Enabled:
 *   "Remove" submit button → useActionState(mfaUnenroll).
 *
 * On success in either direction: router.refresh() re-reads the server
 * component and the panel switches state automatically.
 */
export function MfaSetupPanel({ mfaEnabled, mfaFactorId }: MfaSetupPanelProps) {
  const router = useRouter();

  // Enrollment state
  const [enrolling, setEnrolling] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [newFactorId, setNewFactorId] = useState("");
  const [enrollError, setEnrollError] = useState("");
  const [isEnrolling, startEnrollTransition] = useTransition();

  // useActionState hooks
  const [verifyState, verifyAction, isVerifyPending] = useActionState(
    mfaVerifyEnrollment,
    INITIAL_VERIFY_STATE,
  );
  const [unenrollState, unenrollAction, isUnenrollPending] = useActionState(
    mfaUnenroll,
    INITIAL_UNENROLL_STATE,
  );

  // Refresh server data when either action succeeds so the parent
  // re-renders with updated mfaEnabled / mfaFactorId props.
  useEffect(() => {
    if (verifyState.status === "success" || unenrollState.status === "success") {
      router.refresh();
    }
  }, [verifyState.status, unenrollState.status, router]);

  function handleSetUp() {
    setEnrollError("");
    startEnrollTransition(async () => {
      const result = await mfaEnroll();
      if (!result.ok) {
        setEnrollError(result.error);
        return;
      }
      setQrCode(result.qrCode);
      setSecret(result.secret);
      setNewFactorId(result.factorId);
      setEnrolling(true);
    });
  }

  // ── MFA not yet enabled ──────────────────────────────────────────────────
  if (!mfaEnabled) {
    // Step 1: prompt to start setup
    if (!enrolling) {
      return (
        <>
          {enrollError && (
            <div
              role="alert"
              className="mb-3 flex items-start gap-2 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-4 py-3"
            >
              <AlertCircle
                className="mt-0.5 h-4 w-4 shrink-0 text-[#DC2626]"
                aria-hidden="true"
              />
              <p className="text-[14px] text-[#991B1B]">{enrollError}</p>
            </div>
          )}
          <Button
            type="button"
            variant="outline"
            disabled={isEnrolling}
            onClick={handleSetUp}
            className="h-10 border-[#0D6E6E] px-5 text-[14px] font-semibold text-[#0D6E6E] hover:bg-[#E6F4F4]"
          >
            {isEnrolling ? "Starting setup…" : "Set up two-factor authentication"}
          </Button>
        </>
      );
    }

    // Step 2: show QR code and verify form
    return (
      <div className="rounded-lg border border-[#E2E8F0] p-5">
        <p className="mb-4 text-[14px] text-[#374151]">
          Scan the QR code below with your authenticator app (e.g. Google
          Authenticator, Authy), then enter the 6-digit code shown in the app to
          complete setup.
        </p>

        {/* QR code — Supabase returns an SVG data URL */}
        <div className="mb-4 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrCode}
            alt="QR code for your authenticator app"
            className="h-40 w-40"
          />
        </div>

        {/* Manual entry fallback */}
        <details className="mb-5">
          <summary className="cursor-pointer text-[13px] text-[#0D6E6E] underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-1">
            Can&apos;t scan the QR code? Enter the setup key manually
          </summary>
          <p className="mt-2 break-all rounded bg-[#F8FAFC] px-3 py-2 font-mono text-[13px] text-[#374151]">
            {secret}
          </p>
        </details>

        {verifyState.status === "invalid_code" && (
          <div
            role="alert"
            className="mb-3 flex items-start gap-2 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-4 py-3"
          >
            <AlertCircle
              className="mt-0.5 h-4 w-4 shrink-0 text-[#DC2626]"
              aria-hidden="true"
            />
            <p className="text-[14px] text-[#991B1B]">
              That code is incorrect or has expired. Please try again.
            </p>
          </div>
        )}

        {verifyState.status === "error" && (
          <div
            role="alert"
            className="mb-3 flex items-start gap-2 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-4 py-3"
          >
            <AlertCircle
              className="mt-0.5 h-4 w-4 shrink-0 text-[#DC2626]"
              aria-hidden="true"
            />
            <p className="text-[14px] text-[#991B1B]">
              Something went wrong. Please try again.
            </p>
          </div>
        )}

        <form action={verifyAction}>
          <input type="hidden" name="factorId" value={newFactorId} />

          <div className="mb-4">
            <Label
              htmlFor="mfa-setup-code"
              className="mb-1.5 block text-[14px] font-medium text-[#1E293B]"
            >
              Authentication code
            </Label>
            <Input
              id="mfa-setup-code"
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9 ]*"
              maxLength={7}
              placeholder="000 000"
              className="h-10 max-w-[160px] text-center text-[16px] tracking-widest"
              disabled={isVerifyPending}
            />
          </div>

          <Button
            type="submit"
            disabled={isVerifyPending}
            className="h-10 bg-[#0D6E6E] px-5 text-[14px] font-semibold text-white hover:bg-[#0A5A5A]"
          >
            {isVerifyPending
              ? "Activating…"
              : "Activate two-factor authentication"}
          </Button>
        </form>
      </div>
    );
  }

  // ── MFA already enabled: show removal option ─────────────────────────────
  return (
    <>
      {unenrollState.status === "error" && (
        <div
          role="alert"
          className="mb-3 flex items-start gap-2 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-4 py-3"
        >
          <AlertCircle
            className="mt-0.5 h-4 w-4 shrink-0 text-[#DC2626]"
            aria-hidden="true"
          />
          <p className="text-[14px] text-[#991B1B]">
            Failed to remove two-factor authentication. Please try again.
          </p>
        </div>
      )}

      <form action={unenrollAction}>
        <input type="hidden" name="factorId" value={mfaFactorId} />
        <button
          type="submit"
          disabled={isUnenrollPending}
          className="rounded text-[14px] text-[#DC2626] underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-1 disabled:opacity-50"
        >
          {isUnenrollPending
            ? "Removing…"
            : "Remove two-factor authentication"}
        </button>
      </form>
    </>
  );
}
