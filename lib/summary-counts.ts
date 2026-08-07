// The "what we found" line on Step 3.
//
// Extracted from `application-step3-summary.tsx` on 2026-08-07 (WJ's decision,
// from GCM-06's live re-run). It was two inline IIFEs, which is why the defect
// below survived: there was nothing importable to assert on.
//
// THE DEFECT. The line read "We found 21 application questions in these
// guidelines" directly above a list of 19. Both numbers were correct about
// different things — the total counted `questions + governanceFacts`, while the
// list rendered `questions` alone — and together they invited the applicant to
// think two questions had gone missing, on the one screen whose whole job is
// telling them what the AI found.
//
// THE FIX names the split rather than picking a number. That keeps faith with
// both the list and Step 4, and does a second job: it warns the applicant
// before they start that some items need their own figures, which is the same
// message the Step 4 "Before you begin writing" gate carries.

/**
 * @param questionCount  Narrative questions — the items actually listed above this line.
 * @param governanceCount  Budget/governance facts. Real Step 4 cards, but not
 *   listed on Step 3 and not answerable with AI help, so they are described
 *   rather than counted in silently.
 */
export function structuredSummaryCount(questionCount: number, governanceCount: number): string {
  const questions = `${questionCount} application ${questionCount === 1 ? 'question' : 'questions'}`

  if (governanceCount === 0) {
    return `We found ${questions} in these guidelines. You'll answer ${
      questionCount === 1 ? 'it' : 'each one'
    } in the next step.`
  }

  return `We found ${questions}, plus ${governanceCount} financial ${
    governanceCount === 1 ? 'detail' : 'details'
  } you'll complete with your own figures. You'll work through all ${
    questionCount + governanceCount
  } in the next step.`
}

/**
 * The free-form equivalent. Carried the identical mismatch — the total added
 * `sections + governanceFacts` — and is fixed the same way rather than left to
 * be rediscovered.
 */
export function freeFormSummaryCount(sectionCount: number, governanceCount: number): string {
  const sections = `${sectionCount} ${sectionCount === 1 ? 'section' : 'sections'}`

  if (governanceCount === 0) {
    return `We identified ${sections} to complete. In the next step, you'll write your content section by section.`
  }

  return `We identified ${sections} to complete, plus ${governanceCount} financial ${
    governanceCount === 1 ? 'detail' : 'details'
  } you'll complete with your own figures. You'll work through all ${
    sectionCount + governanceCount
  } in the next step.`
}
