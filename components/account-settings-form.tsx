"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MfaSetupPanel } from "@/components/mfa-setup-panel";
import { changePassword } from "@/actions/auth";

interface FieldErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

interface AccountSettingsFormProps {
  /** Real email address from auth.users — passed from the Server Component. */
  email: string;
  /** Whether the user has a verified TOTP factor. */
  mfaEnabled?: boolean;
  /** Factor ID of the enrolled TOTP factor (empty string if not enabled). */
  mfaFactorId?: string;
}

export function AccountSettingsForm({
  email,
  mfaEnabled = false,
  mfaFactorId = "",
}: AccountSettingsFormProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [passwordUpdated, setPasswordUpdated] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");

    const errors: FieldErrors = {};
    if (!currentPassword) errors.currentPassword = "Please enter your current password";
    if (!newPassword) {
      errors.newPassword = "Please enter a new password";
    } else if (newPassword.length < 10) {
      errors.newPassword = "Your password must be at least 10 characters";
    }
    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your new password";
    } else if (confirmPassword !== newPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    startTransition(async () => {
      const result = await changePassword(currentPassword, newPassword);
      if (result.status === "success") {
        setPasswordUpdated(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setFieldErrors({});
      } else if (result.status === "wrong_password") {
        setFieldErrors({ currentPassword: "Your current password is incorrect" });
      } else {
        setServerError("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <div className="mx-auto w-full max-w-[640px] px-4 py-10 sm:px-0">
      <h1 className="mb-8 text-[24px] font-bold text-[#1E293B]">Account settings</h1>

      {/* ── Email address ──────────────────────────────────────────────────── */}
      <section aria-labelledby="email-heading" className="mb-8">
        <h2
          id="email-heading"
          className="mb-4 text-[16px] font-semibold text-[#1E293B]"
        >
          Email address
        </h2>
        <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
          <p className="text-[14px] text-[#374151]">
            <span className="font-medium">Your email address:</span>{" "}
            <span>{email}</span>
          </p>
        </div>
      </section>

      <hr className="mb-8 border-[#E2E8F0]" />

      {/* ── Change password ────────────────────────────────────────────────── */}
      <section aria-labelledby="password-heading" className="mb-8">
        <h2
          id="password-heading"
          className="mb-4 text-[16px] font-semibold text-[#1E293B]"
        >
          Change your password
        </h2>

        {/* Success message */}
        {passwordUpdated && (
          <div
            role="alert"
            className="mb-5 flex items-center gap-2 rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3"
          >
            <CheckCircle className="h-4 w-4 shrink-0 text-[#16A34A]" aria-hidden="true" />
            <p className="text-[14px] text-[#166534]">Your password has been updated.</p>
          </div>
        )}

        {/* Server error */}
        {serverError && (
          <div
            role="alert"
            className="mb-5 flex items-center gap-2 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-4 py-3"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-[#DC2626]" aria-hidden="true" />
            <p className="text-[14px] text-[#991B1B]">{serverError}</p>
          </div>
        )}

        <form noValidate onSubmit={handlePasswordSubmit}>
          {/* Current password */}
          <div className="mb-4">
            <Label
              htmlFor="currentPassword"
              className="mb-1.5 block text-[14px] font-medium text-[#1E293B]"
            >
              Current password
            </Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrent ? "text" : "password"}
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                aria-invalid={!!fieldErrors.currentPassword || undefined}
                aria-describedby={fieldErrors.currentPassword ? "currentPassword-error" : undefined}
                className="h-10 pr-10 text-[14px]"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                aria-label={showCurrent ? "Hide current password" : "Show current password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-[#64748B] hover:text-[#1E293B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-1"
              >
                {showCurrent ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
              </button>
            </div>
            {fieldErrors.currentPassword && (
              <p id="currentPassword-error" role="alert" className="mt-1.5 text-[13px] text-[#DC2626]">
                {fieldErrors.currentPassword}
              </p>
            )}
          </div>

          {/* New password */}
          <div className="mb-4">
            <Label
              htmlFor="newPassword"
              className="mb-1.5 block text-[14px] font-medium text-[#1E293B]"
            >
              New password
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNew ? "text" : "password"}
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                aria-invalid={!!fieldErrors.newPassword || undefined}
                aria-describedby={
                  fieldErrors.newPassword
                    ? "newPassword-error"
                    : "newPassword-hint"
                }
                className="h-10 pr-10 text-[14px]"
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                aria-label={showNew ? "Hide new password" : "Show new password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-[#64748B] hover:text-[#1E293B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-1"
              >
                {showNew ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
              </button>
            </div>
            {fieldErrors.newPassword ? (
              <p id="newPassword-error" role="alert" className="mt-1.5 text-[13px] text-[#DC2626]">
                {fieldErrors.newPassword}
              </p>
            ) : (
              <p id="newPassword-hint" className="mt-1.5 text-[13px] text-[#64748B]">
                At least 10 characters
              </p>
            )}
          </div>

          {/* Confirm new password */}
          <div className="mb-5">
            <Label
              htmlFor="confirmPassword"
              className="mb-1.5 block text-[14px] font-medium text-[#1E293B]"
            >
              Confirm new password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                aria-invalid={!!fieldErrors.confirmPassword || undefined}
                aria-describedby={fieldErrors.confirmPassword ? "confirmPassword-error" : undefined}
                className="h-10 pr-10 text-[14px]"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-[#64748B] hover:text-[#1E293B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-1"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p id="confirmPassword-error" role="alert" className="mt-1.5 text-[13px] text-[#DC2626]">
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="h-10 bg-[#0D6E6E] px-5 text-[14px] font-semibold text-white hover:bg-[#0A5A5A] disabled:opacity-60"
          >
            {isPending ? "Updating…" : "Update password"}
          </Button>
        </form>
      </section>

      <hr className="mb-8 border-[#E2E8F0]" />

      {/* ── Two-factor authentication ──────────────────────────────────────── */}
      <section aria-labelledby="mfa-heading" className="mb-8">
        <h2
          id="mfa-heading"
          className="mb-1 text-[16px] font-semibold text-[#1E293B]"
        >
          Two-factor authentication
        </h2>
        <p className="mb-4 text-[14px] text-[#64748B]">
          Status:{" "}
          <span
            className={
              mfaEnabled ? "font-medium text-[#16A34A]" : "text-[#64748B]"
            }
          >
            {mfaEnabled ? "Enabled" : "Not enabled"}
          </span>
        </p>

        <MfaSetupPanel mfaEnabled={mfaEnabled} mfaFactorId={mfaFactorId} />
      </section>

      <hr className="mb-8 border-[#E2E8F0]" />

      {/* ── Delete account ─────────────────────────────────────────────────── */}
      <section aria-labelledby="delete-heading">
        <h2
          id="delete-heading"
          className="mb-2 text-[16px] font-semibold text-[#1E293B]"
        >
          Delete your account
        </h2>
        <p className="mb-5 text-[14px] text-[#374151]">
          Deleting your account will permanently remove all your data, including your charity
          profile and saved applications. This cannot be undone.
        </p>
        <Link href="/account/delete">
          <Button
            type="button"
            className="h-10 bg-[#DC2626] px-5 text-[14px] font-semibold text-white hover:bg-[#B91C1C]"
          >
            Delete my account
          </Button>
        </Link>
      </section>
    </div>
  );
}
