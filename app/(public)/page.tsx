import type { Metadata } from "next";
import { SignInForm } from "@/components/sign-in-form";

export const metadata: Metadata = {
  title: "Sign in",
};

interface Props {
  searchParams: Promise<{ deleted?: string }>;
}

export default async function SignInPage({ searchParams }: Props) {
  const { deleted } = await searchParams;
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12">
      <SignInForm accountDeleted={deleted === "true"} />
    </div>
  );
}
