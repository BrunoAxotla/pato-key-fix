import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createHash } from 'node:crypto'
import { supabaseAdmin } from '@/lib/supabase/admin'
import TrackingLive from './TrackingLive'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Seguimiento de servicio | PATO',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
}

function hashTrackingToken(token: string) {
  return createHash('sha256').update(token, 'utf8').digest('hex')
}

export default async function TrackingPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) notFound()

  const { data, error } = await supabaseAdmin.rpc(
    'get_customer_tracking_request_by_hash',
    { p_token_hash: hashTrackingToken(token) }
  )

  if (error) {
    console.error('Initial tracking lookup failed:', error.message)
    notFound()
  }
  if (!data?.length) notFound()

  return <TrackingLive token={token} initialRequest={data[0]} />
}
