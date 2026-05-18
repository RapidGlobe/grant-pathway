import type { Metadata } from "next";
import Link from "next/link";
import { Mail, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Verify your email",
};

// Slice 0: email comes from auth session; mock used for Phase 1
const MOCK_EMAIL = "sarah@example.org";

interface Props {
  searchParams: Promise<{ state?: string }>;
}

export default async function VerifyEmailPage({ searchParams }: Props) {
  const { state } = await searchParams;

  if (state === "verified") {
    return <VerifiedState />;
  }

  if (state === "expired") {
    return <ExpiredState />;
  }

  return <AwaitingState email={MOCK_EMAIL} />;
}

// ── State 1: Awaiting verification ──────────────────────────────────────────

function AwaitingState({ email }: { email: string }) {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-[440px] text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E6F4F4]">
            <Mail className="h-8 w-8 text-[#0D6E6E]" aria-hidden="true" />
          </div>
        </div>

        <h1 className="mb-3 text-[22px] font-bold text-[#1E293B]">Check your email</h1>

        <p className="mb-1 text-[15px] text-[#64748B]">
          We&apos;ve sent a verification link to
        </p>
        <p className="mb-6 text-[15px] font-semibold text-[#1E293B]">{email}</p>
        <p className="mb-8 text-[15px] text-[#64748B]">
          Click the link in the email to activate your account.
        </p>

        {/* Resend button — action wired in Slice 0 */}
        <Button
          type="button"
          variant="outline"
          className="h-10 w-full border-[#0D6E6E] text-[14px] font-semibold text-[#0D6E6E] hover:bg-[#E6F4F4]"
        >
          Resend verification email
        </Button>

        <p className="mt-6 text-[14px] text-[#64748B]">
          Wrong email address?{" "}
          <Link
            href="/"
            className="font-medium text-[#0D6E6E] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-1 rounded"
          >
            Sign in with a different account
          </Link>
        </p>
      </div>
    </div>
  );
}

// ── State 2: Email verified ──────────────────────────────────────────────────

function VerifiedState() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-[440px] text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F0FDF4]">
            <CheckCircle className="h-8 w-8 text-[#16A34A]" aria-hidden="true" />
          </div>
        </div>

        <h1 className="mb-3 text-[22px] font-bold text-[#1E293B]">Email verified</h1>

        <p className="mb-8 text-[15px] text-[#64748B]">
          Your account is now active. Let&apos;s get started.
        </p>

        <Link
          href="/dashboard"
          className="inline-flex h-10 w-full items-center justify-center rounded-md bg-[#0D6E6E] px-4 text-[15px] font-semibold text-white transition-colors hover:bg-[#0A5A5A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-2"
        >
          Go to my dashboard
        </Link>
      </div>
    </div>
  );
}

// ── State 3: Link expired or invalid ────────────────────────────────────────

function ExpiredState() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-[440px] text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FEF3C7]">
            <Clock className="h-8 w-8 text-[#D97706]" aria-hidden="true" />
          </div>
        </div>

        <h1 className="mb-3 text-[22px] font-bold text-[#1E293B]">This link has expired</h1>

        <p className="mb-8 text-[15px] text-[#64748B]">
          Your verification link is no longer valid. Request a new one below.
        </p>

        {/* Resend button — action wired in Slice 0 */}
        <Button
          type="button"
          className="h-10 w-full bg-[#0D6E6E] text-[15px] font-semibold text-white hover:bg-[#0A5A5A]"
        >
          Send a new verification email
        </Button>
      </div>
    </div>
  );
}
