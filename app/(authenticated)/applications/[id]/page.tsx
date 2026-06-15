import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function ApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const { data, error } = await supabase
    .from('applications')
    .select('current_step')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !data) redirect('/dashboard')

  redirect(`/applications/${id}/step/${data.current_step}`)
}
