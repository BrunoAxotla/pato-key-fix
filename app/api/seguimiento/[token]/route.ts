import { createHash } from 'node:crypto'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

const privateHeaders = {
  'Cache-Control': 'private, no-store, max-age=0',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
}

function hashTrackingToken(token: string) {
  return createHash('sha256').update(token, 'utf8').digest('hex')
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) {
    return NextResponse.json(
      { error: 'Enlace de seguimiento no encontrado o vencido.' },
      { status: 404, headers: privateHeaders }
    )
  }

  const { data, error } = await supabaseAdmin.rpc(
    'get_customer_tracking_request_by_hash',
    { p_token_hash: hashTrackingToken(token) }
  )

  if (error) {
    console.error('Tracking lookup failed:', error.message)
    return NextResponse.json(
      { error: 'No se pudo consultar el seguimiento.' },
      { status: 500, headers: privateHeaders }
    )
  }

  if (!data?.length) {
    return NextResponse.json(
      { error: 'Enlace de seguimiento no encontrado o vencido.' },
      { status: 404, headers: privateHeaders }
    )
  }

  return NextResponse.json(
    { request: data[0] },
    { status: 200, headers: privateHeaders }
  )
}
