import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ApplicationStep1Form } from '@/components/application-step1-form'
import { createClient } from '@/lib/supabase/server'
import { getActiveFunders } from '@/actions/applications'

export const metadata: Metadata = {
  title: 'Application Details',
}

interface Props {
  params: Promise<{ id: string }>
}

/**
 * Step 1 page (S2.2 / S3.2 / P5.FD4).
 *
 * Loads the application's existing funder_id, funder_name and grant_name
 * from the database so the form is pre-filled when the user returns to Step 1.
 * For a brand-new application (created by /applications/new) these will be
 * empty — the user selects a funder from the picker and saves in S3.1.
 *
 * Also fetches the approved funder list (getActiveFunders) server-side so
 * the picker is populated on first render with no client-side waterfall.
 *
 * Redirects to /dashboard if the application does not exist or belongs
 * to a different user (RLS also enforces this at the DB layer).
 */
export default async function Step1Page({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/')

  // Fetch application and funder list in parallel
  const [applicationResult, funders] = await Promise.all([
    supabase
      .from('applications')
      .select('funder_id, funder_name, grant_name')
      .eq('id', id)
      .eq('user_id', user.id)
      .single(),
    getActiveFunders(),
  ])

  if (applicationResult.error || !applicationResult.data) redirect('/dashboard')

  const application = applicationResult.data

  // isNew: both fields empty means the application was just created
  const isNew = !application.funder_name && !application.grant_name

  return (
    <ApplicationStep1Form
      applicationId={id}
      funders={funders}
      initialFunderId={application.funder_id ?? ''}
      initialFunderName={application.funder_name}
      initialGrantName={application.grant_name}
      isNew={isNew}
    />
  )
}
