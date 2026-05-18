"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, CheckCircle, AlertCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type LookupState = null | "match" | "no-match" | "unavailable";

interface FieldErrors {
  charityName?: string;
  whatDoes?: string;
  whoHelps?: string;
  whereWorks?: string;
}

interface CharityProfileFormProps {
  isEdit?: boolean;
  initialLookupState?: LookupState;
}

// Mock data for edit state and lookup match
const MOCK_EDIT = {
  charityName: "Helping Hands UK",
  regNumber: "1234567",
  whatDoes:
    "We provide food, shelter, and support services to people experiencing homelessness and poverty across the North West.",
  whoHelps: "Adults and families experiencing homelessness, poverty, or social exclusion.",
  whereWorks: "Greater Manchester, Lancashire, and Cheshire",
};

const MOCK_MATCH = {
  charityName: "St Mary's Community Trust",
  regNumber: "1189345",
  whatDoesPara:
    "We provide community support services, food assistance, and social activities for people experiencing poverty and social isolation in Greater Manchester. We bring local people together through shared events and practical programmes that help them rebuild their lives.",
  whoHelpsPara:
    "People living in Greater Manchester who are experiencing poverty, financial hardship, or social isolation — including older adults living alone, families struggling to make ends meet, and individuals who are homeless or at risk of homelessness.",
};

export function CharityProfileForm({
  isEdit = false,
  initialLookupState = null,
}: CharityProfileFormProps) {
  const [lookupQuery, setLookupQuery] = useState("");
  const [lookupResult, setLookupResult] = useState<LookupState>(initialLookupState);

  const prefillMatch = initialLookupState === "match";

  const [charityName, setCharityName] = useState(
    isEdit ? MOCK_EDIT.charityName : prefillMatch ? MOCK_MATCH.charityName : ""
  );
  const [regNumber, setRegNumber] = useState(
    isEdit ? MOCK_EDIT.regNumber : prefillMatch ? MOCK_MATCH.regNumber : ""
  );
  const [whatDoes, setWhatDoes] = useState(
    isEdit ? MOCK_EDIT.whatDoes : prefillMatch ? MOCK_MATCH.whatDoesPara : ""
  );
  const [whoHelps, setWhoHelps] = useState(
    isEdit ? MOCK_EDIT.whoHelps : prefillMatch ? MOCK_MATCH.whoHelpsPara : ""
  );
  const [whereWorks, setWhereWorks] = useState(isEdit ? MOCK_EDIT.whereWorks : "");
  const [paraphrasedFromLookup, setParaphrasedFromLookup] = useState(prefillMatch);

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [saved, setSaved] = useState(false);

  function handleLookup() {
    if (!lookupQuery.trim()) return;
    // Static mock: always returns a match
    setLookupResult("match");
    setCharityName(MOCK_MATCH.charityName);
    setRegNumber(MOCK_MATCH.regNumber);
    setWhatDoes(MOCK_MATCH.whatDoesPara);
    setWhoHelps(MOCK_MATCH.whoHelpsPara);
    setParaphrasedFromLookup(true);
  }

  function handleLookupKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleLookup();
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errors: FieldErrors = {};
    if (!charityName.trim()) errors.charityName = "Please enter your charity name";
    if (!whatDoes.trim()) errors.whatDoes = "Please tell us what your charity does";
    if (!whoHelps.trim()) errors.whoHelps = "Please tell us who your charity helps";
    if (!whereWorks.trim()) errors.whereWorks = "Please tell us where your charity works";
    setFieldErrors(errors);
    if (Object.keys(errors).length === 0) {
      setSaved(true);
    }
  }

  // Setup success: replace the form with a success screen
  if (saved && !isEdit) {
    return (
      <div className="mx-auto w-full max-w-[640px] px-4 py-10 sm:px-0">
        <div className="rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] p-8 text-center">
          <CheckCircle className="mx-auto mb-4 h-12 w-12 text-[#16A34A]" aria-hidden="true" />
          <h1 className="mb-3 text-[22px] font-bold text-[#1E293B]">Profile saved</h1>
          <p className="mb-6 text-[15px] text-[#374151]">
            Your charity profile has been saved. You&apos;re ready to start your first application.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center rounded-md bg-[#0D6E6E] px-6 text-[15px] font-semibold text-white transition-colors hover:bg-[#0A5A5A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-2"
          >
            Go to my dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[640px] px-4 py-10 sm:px-0">
      {/* Edit success banner */}
      {saved && isEdit && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] p-4"
        >
          <CheckCircle
            className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#16A34A]"
            aria-hidden="true"
          />
          <p className="text-[14px] text-[#166534]">Your changes have been saved.</p>
        </div>
      )}

      <h1 className="mb-6 text-[24px] font-bold text-[#1E293B]">
        {isEdit ? "Your charity profile" : "Set up your charity profile"}
      </h1>

      {/* Charity Commission lookup */}
      <div className="mb-6 rounded-xl border border-[#EDE8E1] bg-[#FDF9F5] p-5">
          <p className="mb-3 text-[14px] font-medium text-[#1E293B]">
            Find your charity on the Charity Commission register
          </p>
          <div className="flex gap-2">
            <Input
              type="search"
              placeholder="Search by charity name or registration number"
              value={lookupQuery}
              onChange={(e) => setLookupQuery(e.target.value)}
              onKeyDown={handleLookupKeyDown}
              aria-label="Search by charity name or registration number"
              className="h-10 flex-1 text-[14px]"
            />
            <Button
              type="button"
              onClick={handleLookup}
              className="h-10 shrink-0 bg-[#0D6E6E] px-4 text-[14px] font-semibold text-white hover:bg-[#0A5A5A]"
            >
              <Search className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Look up charity
            </Button>
          </div>

          {/* Lookup result: match */}
          {lookupResult === "match" && (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-[#A7F3D0] bg-[#ECFDF5] p-3">
              <CheckCircle
                className="mt-0.5 h-4 w-4 shrink-0 text-[#059669]"
                aria-hidden="true"
              />
              <p className="text-[13px] text-[#065F46]">
                Details retrieved from the Charity Commission register. You can edit these fields
                before saving.
              </p>
            </div>
          )}

          {/* Lookup result: no match */}
          {lookupResult === "no-match" && (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-[#FDE68A] bg-[#FFFBEB] p-3">
              <AlertTriangle
                className="mt-0.5 h-4 w-4 shrink-0 text-[#B45309]"
                aria-hidden="true"
              />
              <p className="text-[13px] text-[#78350F]">
                We couldn&apos;t find that charity. Please enter your details manually.
              </p>
            </div>
          )}

          {/* Lookup result: API unavailable */}
          {lookupResult === "unavailable" && (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-[#FDE68A] bg-[#FFFBEB] p-3">
              <AlertCircle
                className="mt-0.5 h-4 w-4 shrink-0 text-[#B45309]"
                aria-hidden="true"
              />
              <p className="text-[13px] text-[#78350F]">
                We couldn&apos;t reach the Charity Commission right now. You can try again using
                the <span className="font-semibold">Look up charity</span> button above, or fill
                in your details manually in the fields below.
              </p>
            </div>
          )}
        </div>

      <form noValidate onSubmit={handleSubmit}>
        {/* Charity name */}
        <div className="mb-5">
          <Label
            htmlFor="charityName"
            className="mb-1.5 block text-[14px] font-medium text-[#1E293B]"
          >
            Charity name <span className="text-[#DC2626]" aria-hidden="true">*</span>
          </Label>
          <Input
            id="charityName"
            type="text"
            autoComplete="organization"
            value={charityName}
            onChange={(e) => setCharityName(e.target.value)}
            aria-invalid={!!fieldErrors.charityName || undefined}
            aria-describedby={fieldErrors.charityName ? "charityName-error" : undefined}
            className="h-10 text-[14px]"
          />
          {fieldErrors.charityName && (
            <p id="charityName-error" role="alert" className="mt-1.5 text-[13px] text-[#DC2626]">
              {fieldErrors.charityName}
            </p>
          )}
        </div>

        {/* Charity registration number */}
        <div className="mb-5">
          <Label
            htmlFor="regNumber"
            className="mb-1.5 block text-[14px] font-medium text-[#1E293B]"
          >
            Charity registration number{" "}
            <span className="text-[14px] font-normal text-[#64748B]">(optional)</span>
          </Label>
          <Input
            id="regNumber"
            type="text"
            value={regNumber}
            onChange={(e) => setRegNumber(e.target.value)}
            className="h-10 text-[14px]"
          />
        </div>

        {/* AI paraphrase banner — shown after a successful lookup */}
        {paraphrasedFromLookup && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-3 rounded-lg border border-[#FDE68A] bg-[#FFFBEB] p-4"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#B45309]" aria-hidden="true" />
            <p className="text-[13px] text-[#78350F]">
              <span className="font-semibold">AI-generated content below.</span> The two fields
              below have been pre-filled by AI using the description from your Charity Commission
              entry. The original legal language has been paraphrased into plain English to give you
              a starting point — please read carefully and edit to make sure it accurately reflects
              your charity&apos;s work before saving. You can edit any of the fields at any time
              before clicking <span className="font-semibold">Save profile</span>.
            </p>
          </div>
        )}

        {/* What does your charity do? */}
        <div className="mb-5">
          <Label
            htmlFor="whatDoes"
            className="mb-1 block text-[14px] font-medium text-[#1E293B]"
          >
            What does your charity do?{" "}
            <span className="text-[#DC2626]" aria-hidden="true">*</span>
          </Label>
          {!paraphrasedFromLookup && (
            <p id="whatDoes-hint" className="mb-1.5 text-[13px] text-[#64748B]">
              Your Charity Commission entry (see the lookup above) lists your charitable objects — this is a good starting point. Your website&apos;s &lsquo;About us&rsquo; page is another useful source.
            </p>
          )}
          <Textarea
            id="whatDoes"
            value={whatDoes}
            onChange={(e) => setWhatDoes(e.target.value)}
            rows={3}
            aria-invalid={!!fieldErrors.whatDoes || undefined}
            aria-describedby={[
              "whatDoes-hint",
              fieldErrors.whatDoes ? "whatDoes-error" : "",
            ].filter(Boolean).join(" ")}
            className="text-[14px]"
          />
          {fieldErrors.whatDoes && (
            <p id="whatDoes-error" role="alert" className="mt-1.5 text-[13px] text-[#DC2626]">
              {fieldErrors.whatDoes}
            </p>
          )}
        </div>

        {/* Who does your charity help? */}
        <div className="mb-5">
          <Label
            htmlFor="whoHelps"
            className="mb-1 block text-[14px] font-medium text-[#1E293B]"
          >
            Who does your charity help?{" "}
            <span className="text-[#DC2626]" aria-hidden="true">*</span>
          </Label>
          {!paraphrasedFromLookup && (
            <p id="whoHelps-hint" className="mb-1.5 text-[13px] text-[#64748B]">
              Think about the people your charity serves — their age, background, or circumstances. Your Charity Commission entry may also describe your beneficiaries.
            </p>
          )}
          <Textarea
            id="whoHelps"
            value={whoHelps}
            onChange={(e) => setWhoHelps(e.target.value)}
            rows={3}
            aria-invalid={!!fieldErrors.whoHelps || undefined}
            aria-describedby={[
              "whoHelps-hint",
              fieldErrors.whoHelps ? "whoHelps-error" : "",
            ].filter(Boolean).join(" ")}
            className="text-[14px]"
          />
          {fieldErrors.whoHelps && (
            <p id="whoHelps-error" role="alert" className="mt-1.5 text-[13px] text-[#DC2626]">
              {fieldErrors.whoHelps}
            </p>
          )}
        </div>

        {/* Where do you work? */}
        <div className="mb-8">
          <Label
            htmlFor="whereWorks"
            className="mb-1 block text-[14px] font-medium text-[#1E293B]"
          >
            Where do you work?{" "}
            <span className="text-[#DC2626]" aria-hidden="true">*</span>
          </Label>
          <p id="whereWorks-hint" className="mb-1.5 text-[13px] text-[#64748B]">
            Enter a town, county, or region — for example, &lsquo;Leeds&rsquo; or &lsquo;South Yorkshire&rsquo;. If you work across the whole country, enter &lsquo;National&rsquo;. If you&apos;re not sure, use the town or city where your charity is based.
          </p>
          <Input
            id="whereWorks"
            type="text"
            value={whereWorks}
            onChange={(e) => setWhereWorks(e.target.value)}
            aria-invalid={!!fieldErrors.whereWorks || undefined}
            aria-describedby={[
              "whereWorks-hint",
              fieldErrors.whereWorks ? "whereWorks-error" : "",
            ].filter(Boolean).join(" ")}
            className="h-10 text-[14px]"
          />
          {fieldErrors.whereWorks && (
            <p id="whereWorks-error" role="alert" className="mt-1.5 text-[13px] text-[#DC2626]">
              {fieldErrors.whereWorks}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="h-10 w-full bg-[#0D6E6E] text-[15px] font-semibold text-white hover:bg-[#0A5A5A]"
        >
          {isEdit ? "Save changes" : "Save profile"}
        </Button>
      </form>
    </div>
  );
}
