// The funder's own supporting-documents list (PDR-UI-007).
//
// Shown twice, deliberately, at the two moments it is actionable:
//
//   Step 4's "Before you begin writing"  — go and gather these
//   "Before we put it together"          — these are still outstanding
//
// WHY THE SECOND SHOWING EXISTS. Raised 2026-08-19 by WJ's wife, the only person
// to have completed a genuine application through the live service. Until then
// the list appeared once, before the user had written a word — the right moment
// to say "gather these", the wrong moment to say "this is still outstanding",
// because at that point nothing is. By the time the draft is ready to assemble
// the user has answered every question Grant Pathway asked, and the remaining
// steps are approve and export, which invite the belief that they have finished.
// They have not: the funder still wants accounts, policies, and — for a funder
// like A B Charitable Trust — a document Grant Pathway does not help them write.
//
// Shared rather than copied so the two showings cannot drift apart: they are the
// same list, and a reader who spots a difference would reasonably assume the
// difference is meaningful.
//
// No 'use client' — presentational only, no state, no server-only APIs. Both
// consumers are client components, so this joins their module graphs.

interface FunderDocumentsListProps {
  funderName?: string
  documents: string[]
}

export function FunderDocumentsList({ funderName, documents }: FunderDocumentsListProps) {
  if (documents.length === 0) return null

  return (
    <>
      <p className="mb-4 text-[0.9375rem] text-[#374151]">
        {funderName || 'This funder'} also asks you to submit:
      </p>
      <ul className="mb-5 space-y-3">
        {documents.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <span
              className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-[#0D6E6E] text-[0.6875rem] font-bold text-[#0D6E6E]"
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <span className="text-[0.875rem] text-[#374151]">{item}</span>
          </li>
        ))}
      </ul>
    </>
  )
}
