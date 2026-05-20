"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerUser } from "@/actions/auth";

interface FieldErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

export function RegisterForm() {
  const [state, action, isPending] = useActionState(registerUser, { error: null });

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [terms, setTerms] = useState(false);
  const [feedbackOptIn, setFeedbackOptIn] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const errors: FieldErrors = {};

    if (!firstName.trim()) {
      errors.firstName = "Please enter your first name";
    }
    if (!lastName.trim()) {
      errors.lastName = "Please enter your last name";
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!password || password.length < 10) {
      errors.password = "Your password must be at least 10 characters";
    }
    if (!confirmPassword || confirmPassword !== password) {
      errors.confirmPassword = "Your passwords do not match";
    }
    if (!terms) {
      errors.terms = "Please accept the Terms of Service and Privacy Policy to continue";
    }

    if (Object.keys(errors).length > 0) {
      // Prevent the Server Action from firing; show errors inline instead
      e.preventDefault();
      setFieldErrors(errors);
      return;
    }

    // Validation passed — clear any previous field errors and let the
    // Server Action (action={action} on the form) handle the submission
    setFieldErrors({});
    void feedbackOptIn; // value is in FormData via the named checkbox input
  }

  return (
    <div className="w-full max-w-[400px]">
      <h1 className="mb-8 text-center text-[22px] font-bold text-[#1E293B]">
        Create your free account
      </h1>

      {/* Form-level error: email already registered */}
      {state.error === "email_exists" && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] p-4"
        >
          <AlertCircle
            className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#DC2626]"
            aria-hidden="true"
          />
          <p className="text-[14px] text-[#991B1B]">
            An account with this email address already exists.{" "}
            <Link
              href="/"
              className="font-medium underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-1 rounded"
            >
              Sign in instead?
            </Link>
          </p>
        </div>
      )}

      {/* Form-level error: unexpected server failure */}
      {state.error === "unknown" && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] p-4"
        >
          <AlertCircle
            className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#DC2626]"
            aria-hidden="true"
          />
          <p className="text-[14px] text-[#991B1B]">
            Something went wrong. Please try again in a moment.
          </p>
        </div>
      )}

      <form noValidate action={action} onSubmit={handleSubmit}>
        {/* First name */}
        <div className="mb-5">
          <Label
            htmlFor="first-name"
            className="mb-1.5 block text-[14px] font-medium text-[#1E293B]"
          >
            First name
          </Label>
          <Input
            id="first-name"
            name="firstName"
            type="text"
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            aria-invalid={!!fieldErrors.firstName || undefined}
            aria-describedby={fieldErrors.firstName ? "first-name-error" : undefined}
            className="h-10 text-[14px]"
          />
          {fieldErrors.firstName && (
            <p id="first-name-error" role="alert" className="mt-1.5 text-[13px] text-[#DC2626]">
              {fieldErrors.firstName}
            </p>
          )}
        </div>

        {/* Last name */}
        <div className="mb-5">
          <Label
            htmlFor="last-name"
            className="mb-1.5 block text-[14px] font-medium text-[#1E293B]"
          >
            Last name
          </Label>
          <Input
            id="last-name"
            name="lastName"
            type="text"
            autoComplete="family-name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            aria-invalid={!!fieldErrors.lastName || undefined}
            aria-describedby={fieldErrors.lastName ? "last-name-error" : undefined}
            className="h-10 text-[14px]"
          />
          {fieldErrors.lastName && (
            <p id="last-name-error" role="alert" className="mt-1.5 text-[13px] text-[#DC2626]">
              {fieldErrors.lastName}
            </p>
          )}
        </div>

        {/* Email address */}
        <div className="mb-5">
          <Label
            htmlFor="email"
            className="mb-1.5 block text-[14px] font-medium text-[#1E293B]"
          >
            Email address
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!fieldErrors.email || undefined}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
            className="h-10 text-[14px]"
          />
          {fieldErrors.email && (
            <p id="email-error" role="alert" className="mt-1.5 text-[13px] text-[#DC2626]">
              {fieldErrors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="mb-5">
          <Label
            htmlFor="password"
            className="mb-1.5 block text-[14px] font-medium text-[#1E293B]"
          >
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
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

        {/* Confirm password */}
        <div className="mb-6">
          <Label
            htmlFor="confirm-password"
            className="mb-1.5 block text-[14px] font-medium text-[#1E293B]"
          >
            Confirm password
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

        {/* Terms of Service + Privacy Policy checkbox (required) */}
        <div className="mb-4">
          <div className="flex items-start gap-3">
            <input
              id="terms"
              type="checkbox"
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
              aria-invalid={!!fieldErrors.terms || undefined}
              aria-describedby={fieldErrors.terms ? "terms-error" : undefined}
              className="mt-0.5 h-4 w-4 flex-shrink-0 cursor-pointer accent-[#0D6E6E]"
            />
            <Label
              htmlFor="terms"
              className="cursor-pointer text-[14px] font-normal leading-snug text-[#1E293B]"
            >
              I have read and agree to the{" "}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#0D6E6E] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-1 rounded"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#0D6E6E] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-1 rounded"
              >
                Privacy Policy
              </a>
            </Label>
          </div>
          {fieldErrors.terms && (
            <p id="terms-error" role="alert" className="mt-1.5 text-[13px] text-[#DC2626]">
              {fieldErrors.terms}
            </p>
          )}
        </div>

        {/* Feedback opt-in checkbox (FR-08 — Should Have; optional) */}
        <div className="mb-6">
          <div className="flex items-start gap-3">
            <input
              id="feedback-opt-in"
              name="feedbackConsent"
              type="checkbox"
              checked={feedbackOptIn}
              onChange={(e) => setFeedbackOptIn(e.target.checked)}
              className="mt-0.5 h-4 w-4 flex-shrink-0 cursor-pointer accent-[#0D6E6E]"
            />
            <Label
              htmlFor="feedback-opt-in"
              className="cursor-pointer text-[14px] font-normal leading-snug text-[#64748B]"
            >
              I&apos;m happy to be contacted occasionally to share feedback about Grant Pathway
            </Label>
          </div>
        </div>

        {/* Create account — full width, primary teal */}
        <Button
          type="submit"
          disabled={isPending}
          className="h-10 w-full bg-[#0D6E6E] text-[15px] font-semibold text-white hover:bg-[#0A5A5A] disabled:opacity-60"
        >
          {isPending ? "Creating account…" : "Create account"}
        </Button>
      </form>

      {/* Sign in prompt */}
      <p className="mt-6 text-center text-[14px] text-[#64748B]">
        Already have an account?{" "}
        <Link href="/" className="font-medium text-[#0D6E6E] hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
