import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { MfaChallengeForm } from "@/components/mfa-challenge-form";

export const metadata: Metadata = {
  title: "Two-factor authentication",
};

/**
 * MFA challenge page — reached after successful password sign-in when the
 * user's account has an enrolled TOTP factor (AC-FR-07-03).
 *
 * Reads the first verified TOTP factor for the current session and passes its
 * ID to MfaChallengeForm.  If no factor exists the user shouldn't be here, so
 * they are redirected to /dashboard.
 */
export default async function MfaPage() {
  const supabase = await createClient();

  const { data } = await supabase.auth.mfa.listFactors();
  const totpFactor = data?.totp?.[0];

  if (!totpFactor) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <MfaChallengeForm factorId={totpFactor.id} />
    </div>
  );
}
