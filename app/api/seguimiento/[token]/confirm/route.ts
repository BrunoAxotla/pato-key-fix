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

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  // crypto.randomBytes(32).toString('base64url') produce tokens de 43 caracteres.
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) {
    return NextResponse.json(
      { error: 'No fue posible confirmar el servicio. Verifica el enlace de seguimiento.' },
      { status: 404, headers: privateHeaders }
    )
  }

  const { error } = await supabaseAdmin.rpc(
    'confirm_customer_tracking_by_hash',
    { p_token_hash: hashTrackingToken(token) }
  )

  if (error) {
    const message = error.message ?? ''

    if (message.includes('TOKEN_INVALID') || message.includes('NOT_CONFIRMABLE')) {
      return NextResponse.json(
        {
          error: 'No se pudo confirmar. El enlace pudo vencer o el servicio ya no está esperando confirmación.',
        },
        { status: 409, headers: privateHeaders }
      )
    }

    console.error('Customer service confirmation failed:', message)
    return NextResponse.json(
      { error: 'No se pudo registrar la confirmación. Inténtalo de nuevo.' },
      { status: 500, headers: privateHeaders }
    )
  }

  return NextResponse.json(
    { success: true, status: 'completed' },
    { status: 200, headers: privateHeaders }
  )
}
