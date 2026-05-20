"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/actions/auth";

interface FieldErrors {
  email?: string;
  password?: string;
}

export function SignInForm() {
  const [state, action, isPending] = useActionState(signIn, { error: null });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const errors: FieldErrors = {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!password) {
      errors.password = "Please enter your password";
    }

    if (Object.keys(errors).length > 0) {
      // Prevent the Server Action from firing; show inline errors instead
      e.preventDefault();
      setFieldErrors(errors);
      return;
    }

    // Validation passed — clear any previous field errors and let the
    // Server Action (action={action} on the form) handle the submission
    setFieldErrors({});
  }

  return (
    <div className="w-full max-w-[400px]">
      {/* Tagline */}
      <p className="mb-8 text-center text-[16px] text-[#64748B]">
        Your free grant writing companion for UK charities
      </p>

      {/* Form-level error: wrong credentials (also covers unknown email — AC-FR-04-03) */}
      {state.error === "credentials" && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] p-4"
        >
          <AlertCircle
            className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#DC2626]"
            aria-hidden="true"
          />
          <p className="text-[14px] text-[#991B1B]">
            Your email address or password is incorrect. Please try again.
          </p>
        </div>
      )}

      {/* Form-level error: email not verified (AC-FR-03-02) */}
      {state.error === "unverified" && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] p-4"
        >
          <AlertCircle
            className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#DC2626]"
            aria-hidden="true"
          />
          <p className="text-[14px] text-[#991B1B]">
            Please verify your email address before signing in.{" "}
            <Link
              href={`/verify-email?email=${encodeURIComponent(email)}`}
              className="font-medium underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-1 rounded"
            >
              Resend verification email
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
            aria-describedby={fieldErrors.email ? "signin-email-error" : undefined}
            className="h-10 text-[14px]"
          />
          {fieldErrors.email && (
            <p id="signin-email-error" role="alert" className="mt-1.5 text-[13px] text-[#DC2626]">
              {fieldErrors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="mb-2">
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
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!fieldErrors.password || undefined}
              aria-describedby={fieldErrors.password ? "signin-password-error" : undefined}
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
          {fieldErrors.password && (
            <p id="signin-password-error" role="alert" className="mt-1.5 text-[13px] text-[#DC2626]">
              {fieldErrors.password}
            </p>
          )}
        </div>

        {/* Forgot password — right-aligned below password field */}
        <div className="mb-6 flex justify-end">
          <Link
            href="/forgot-password"
            className="text-[13px] text-[#64748B] transition-colors hover:text-[#1E293B]"
          >
            Forgot password?
          </Link>
        </div>

        {/* Sign in — full width, primary teal */}
        <Button
          type="submit"
          disabled={isPending}
          className="h-10 w-full bg-[#0D6E6E] text-[15px] font-semibold text-white hover:bg-[#0A5A5A] disabled:opacity-60"
        >
          {isPending ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      {/* Register prompt */}
      <p className="mt-6 text-center text-[14px] text-[#64748B]">
        New to Grant Pathway?{" "}
        <Link
          href="/register"
          className="font-medium text-[#0D6E6E] hover:underline"
        >
          Register for free
        </Link>
      </p>
    </div>
  );
}
