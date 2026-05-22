"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signOut } from "@/actions/auth";

const DATA_SUMMARY = [
  "Your charity profile",
  "All your grant applications and AI-generated content",
  "Your account and login details",
];

export function DeleteAccountForm() {
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [serverError, setServerError] = useState("");
  const [isPending, startTransition] = useTransition();

  const isConfirmed = confirmText === "DELETE";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isConfirmed) {
      setFieldError("Please type DELETE in capitals to confirm.");
      return;
    }
    setFieldError("");
    setServerError("");

    startTransition(async () => {
      const res = await fetch("/api/account/delete", { method: "POST" });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setServerError(
          (data as { error?: string }).error ?? "Something went wrong. Please try again.",
        );
        return;
      }

      // Clear the session cookie (fire and forget — deletion already succeeded)
      try {
        await signOut();
      } catch {
        // Ignore — the auth user is already deleted server-side
      }

      router.push("/?deleted=true");
    });
  }

  return (
    <div className="mx-auto w-full max-w-[640px] px-4 py-10 sm:px-0">
      <h1 className="mb-6 text-[24px] font-bold text-[#1E293B]">Delete your account</h1>

      {/* Warning banner */}
      <div className="mb-6 flex items-start gap-3 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-4 py-4">
        <AlertTriangle
          className="mt-0.5 h-5 w-5 shrink-0 text-[#DC2626]"
          aria-hidden="true"
        />
        <p className="text-[14px] text-[#991B1B]">
          <span className="font-semibold">This cannot be undone.</span> Deleting your account
          will permanently remove all your data from Grant Pathway.
        </p>
      </div>

      {/* Data summary */}
      <div className="mb-8 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-4">
        <p className="mb-3 text-[14px] font-semibold text-[#1E293B]">
          The following will be permanently deleted:
        </p>
        <ul className="space-y-2">
          {DATA_SUMMARY.map((item) => (
            <li key={item} className="flex items-start gap-2 text-[14px] text-[#374151]">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#DC2626]" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Server error */}
      {serverError && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-4 py-3"
        >
          <p className="text-[14px] text-[#991B1B]">{serverError}</p>
        </div>
      )}

      {/* Confirmation form */}
      <form noValidate onSubmit={handleSubmit}>
        <div className="mb-6">
          <Label
            htmlFor="confirmDelete"
            className="mb-1.5 block text-[14px] font-medium text-[#1E293B]"
          >
            Type <span className="font-mono font-bold">DELETE</span> to confirm
          </Label>
          <Input
            id="confirmDelete"
            type="text"
            autoComplete="off"
            value={confirmText}
            onChange={(e) => {
              setConfirmText(e.target.value);
              if (fieldError) setFieldError("");
            }}
            aria-invalid={!!fieldError || undefined}
            aria-describedby={fieldError ? "confirmDelete-error" : undefined}
            className="h-10 max-w-[240px] font-mono text-[14px]"
            placeholder="DELETE"
          />
          {fieldError && (
            <p id="confirmDelete-error" role="alert" className="mt-1.5 text-[13px] text-[#DC2626]">
              {fieldError}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            type="submit"
            disabled={isPending}
            className="h-10 bg-[#DC2626] px-5 text-[14px] font-semibold text-white hover:bg-[#B91C1C] disabled:opacity-60"
          >
            {isPending ? "Deleting…" : "Permanently delete my account"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => router.push("/account")}
            className="h-10 px-5 text-[14px] font-semibold"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
