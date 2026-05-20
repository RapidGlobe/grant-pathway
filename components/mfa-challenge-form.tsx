"use client";

import { useActionState } from "react";
import { verifyMfaSignIn, type VerifyMfaState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

const INITIAL_STATE: VerifyMfaState = { error: null };

interface MfaChallengeFormProps {
  factorId: string;
}

/**
 * Renders the TOTP challenge form shown after a successful password sign-in
 * when the user has an enrolled MFA factor (AC-FR-07-03).
 * Submits to the verifyMfaSignIn Server Action which, on success, redirects
 * to /dashboard with an aal2 session.
 */
export function MfaChallengeForm({ factorId }: MfaChallengeFormProps) {
  const [state, action, isPending] = useActionState(verifyMfaSignIn, INITIAL_STATE);

  return (
    <div className="w-full max-w-[400px]">
      <h1 className="mb-2 text-[24px] font-bold text-[#1E293B]">
        Two-factor authentication
      </h1>
      <p className="mb-6 text-[14px] text-[#64748B]">
        Enter the 6-digit code from your authenticator app.
      </p>

      {state.error === "invalid_code" && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-4 py-3"
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

      {state.error === "unknown" && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-4 py-3"
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

      <form action={action}>
        {/* Hidden factor ID passed to the Server Action */}
        <input type="hidden" name="factorId" value={factorId} />

        <div className="mb-5">
          <Label
            htmlFor="code"
            className="mb-1.5 block text-[14px] font-medium text-[#1E293B]"
          >
            Authentication code
          </Label>
          <Input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9 ]*"
            maxLength={7}
            placeholder="000 000"
            className="h-10 text-center text-[18px] tracking-widest"
            disabled={isPending}
          />
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="h-10 w-full bg-[#0D6E6E] text-[14px] font-semibold text-white hover:bg-[#0A5A5A]"
        >
          {isPending ? "Verifying…" : "Verify code"}
        </Button>
      </form>
    </div>
  );
}
