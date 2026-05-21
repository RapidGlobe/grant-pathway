import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ApplicationStep1Form } from '@/components/application-step1-form'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Application Details',
}

interface Props {
  params: Promise<{ id: string }>
}

/**
 * Step 1 page (S2.2 / S3.2).
 *
 * Loads the application's existing funder_name and grant_name from the
 * database so the form is pre-filled when the user returns to Step 1.
 * For a brand-new application (created by /applications/new) these will
 * be empty strings — the user fills them in and saves in S3.1.
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

  const { data: application, error } = await supabase
    .from('applications')
    .select('funder_name, grant_name')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !application) {
    redirect('/dashboard')
  }

  return (
    <ApplicationStep1Form
      applicationId={id}
      initialFunderName={application.funder_name}
      initialGrantName={application.grant_name}
    />
  )
}
