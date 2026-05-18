import type { Metadata } from "next";
import { SignInForm } from "@/components/sign-in-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function SignInPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12">
      <SignInForm />
    </div>
  );
}
