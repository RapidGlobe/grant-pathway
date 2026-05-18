import type { Metadata } from "next";
import { ForgotPasswordRequestForm } from "@/components/forgot-password-request-form";
import { ResetPasswordForm } from "@/components/reset-password-form";

export const metadata: Metadata = {
  title: "Reset your password",
};

interface Props {
  searchParams: Promise<{ state?: string }>;
}

export default async function ForgotPasswordPage({ searchParams }: Props) {
  const { state } = await searchParams;

  if (state === "reset") {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <ResetPasswordForm />
      </div>
    );
  }

  if (state === "expired") {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <ResetPasswordForm isExpired />
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12">
      <ForgotPasswordRequestForm />
    </div>
  );
}
