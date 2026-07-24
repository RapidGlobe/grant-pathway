import type { Metadata } from 'next'
import { ApplicationStep3Summary } from '@/components/application-step3-summary'
import { getApplicationOrRedirect } from '@/lib/application-guard'
import { getDismissedTooltipIds } from '@/actions/tooltips'

export const metadata: Metadata = {
  title: 'AI Summary',
}

interface Props {
  params: Promise<{ id: string }>
}

/**
 * Step 3 — AI Summary (S3.3 step locking, S5.4).
 *
 * getApplicationOrRedirect(id, 3) enforces that current_step >= 3 before
 * this page renders. If the user hasn't completed Step 2 yet, they are
 * redirected back to their current step automatically.
 *
 * aiSummary from the database is passed to the component so it can display
 * a previously generated summary immediately (without re-calling Bedrock)
 * when the user navigates back to Step 3.
 */
export default async function Step3Page({ params }: Props) {
  const { id } = await params

  // Step locking: redirects to current step if current_step < 3
  const { funderName, grantName, aiSummary } = await getApplicationOrRedirect(id, 3)
  const dismissed = await getDismissedTooltipIds(['tt-summary-review'])

  return (
    <ApplicationStep3Summary
      applicationId={id}
      funderName={funderName}
      grantName={grantName}
      existingSummary={aiSummary}
      tooltipDismissed={dismissed.has('tt-summary-review')}
    />
  )
}
