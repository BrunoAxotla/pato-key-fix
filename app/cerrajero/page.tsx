import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LocksmithRequestsClient from './_components/LocksmithRequestsClient'

export default async function CerrajeroPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if (user.user_metadata?.role !== 'locksmith') redirect('/dashboard')

  const { data: locksmith, error: locksmithError } = await supabase
    .from('locksmiths')
    .select('id, first_name, last_name, business_name, status')
    .eq('user_id', user.id)
    .single()

  if (locksmithError || !locksmith || locksmith.status !== 'active') redirect('/login')

  const { data: requests, error } = await supabase.rpc('get_my_matching_requests')
  const { data: activeJobs, error: activeJobsError } = await supabase.rpc('get_my_assigned_requests')
  const activeJob = (activeJobs ?? []).find((job: any) => ['assigned', 'in_progress'].includes(job.assignment_status)) ?? null

  return <LocksmithRequestsClient locksmith={locksmith} requests={requests ?? []} activeJob={activeJob} initialError={[error?.message, activeJobsError?.message].filter(Boolean).join(' | ') || null} />
}
