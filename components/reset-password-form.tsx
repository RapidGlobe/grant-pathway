"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FieldErrors {
  password?: string;
  confirmPassword?: string;
}

interface ResetPasswordFormProps {
  isExpired?: boolean;
}

export function ResetPasswordForm({ isExpired = false }: ResetPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [success, setSuccess] = useState(false);

  // Expired link state
  if (isExpired) {
    return (
      <div className="w-full max-w-[440px] text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FEF3C7]">
            <Clock className="h-8 w-8 text-[#D97706]" aria-hidden="true" />
          </div>
        </div>

        <h1 className="mb-3 text-[22px] font-bold text-[#1E293B]">This link has expired</h1>

        <p className="mb-8 text-[15px] text-[#64748B]">
          Your reset link is no longer valid. Please request a new one.
        </p>

        <Link
          href="/forgot-password"
          className="inline-flex h-10 w-full items-center justify-center rounded-md bg-[#0D6E6E] px-4 text-[15px] font-semibold text-white transition-colors hover:bg-[#0A5A5A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-2"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="w-full max-w-[440px] text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F0FDF4]">
            <CheckCircle className="h-8 w-8 text-[#16A34A]" aria-hidden="true" />
          </div>
        </div>

        <h1 className="mb-3 text-[22px] font-bold text-[#1E293B]">Password updated</h1>

        <p className="mb-8 text-[15px] text-[#64748B]">Your password has been updated.</p>

        <Link
          href="/"
          className="inline-flex h-10 w-full items-center justify-center rounded-md bg-[#0D6E6E] px-4 text-[15px] font-semibold text-white transition-colors hover:bg-[#0A5A5A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-2"
        >
          Sign in
        </Link>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errors: FieldErrors = {};

    if (!password || password.length < 10) {
      errors.password = "Your password must be at least 10 characters";
    }
    if (!confirmPassword || confirmPassword !== password) {
      errors.confirmPassword = "Your passwords do not match";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setSuccess(true);
    // Slice 0: Supabase updateUser({ password }) call replaces the above
  }

  return (
    <div className="w-full max-w-[400px]">
      <h1 className="mb-8 text-[22px] font-bold text-[#1E293B]">Choose a new password</h1>

      <form noValidate onSubmit={handleSubmit}>
        {/* New password */}
        <div className="mb-5">
          <Label
            htmlFor="password"
            className="mb-1.5 block text-[14px] font-medium text-[#1E293B]"
          >
            New password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!fieldErrors.password || undefined}
              aria-describedby={fieldErrors.password ? "password-error" : "password-hint"}
              className="h-10 pr-10 text-[14px]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-[#64748B] hover:text-[#1E293B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-1"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
          {fieldErrors.password ? (
            <p id="password-error" role="alert" className="mt-1.5 text-[13px] text-[#DC2626]">
              {fieldErrors.password}
            </p>
          ) : (
            <p id="password-hint" className="mt-1.5 text-[13px] text-[#64748B]">
              At least 10 characters
            </p>
          )}
        </div>

        {/* Confirm new password */}
        <div className="mb-6">
          <Label
            htmlFor="confirm-password"
            className="mb-1.5 block text-[14px] font-medium text-[#1E293B]"
          >
            Confirm new password
          </Label>
          <div className="relative">
            <Input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              aria-invalid={!!fieldErrors.confirmPassword || undefined}
              aria-describedby={
                fieldErrors.confirmPassword ? "confirm-password-error" : undefined
              }
              className="h-10 pr-10 text-[14px]"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-[#64748B] hover:text-[#1E293B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-1"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
          {fieldErrors.confirmPassword && (
            <p id="confirm-password-error" role="alert" className="mt-1.5 text-[13px] text-[#DC2626]">
              {fieldErrors.confirmPassword}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="h-10 w-full bg-[#0D6E6E] text-[15px] font-semibold text-white hover:bg-[#0A5A5A]"
        >
          Save new password
        </Button>
      </form>
    </div>
  );
}
