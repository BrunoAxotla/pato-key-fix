import { createHash } from 'node:crypto'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

const privateHeaders = {
  'Cache-Control': 'private, no-store, max-age=0',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
}

const allowedCategories = new Set([
  'incomplete_work',
  'issue_persists',
  'damage',
  'price_disagreement',
  'other',
])

type ProblemPayload = {
  category?: unknown
  details?: unknown
}

function hashTrackingToken(token: string) {
  return createHash('sha256').update(token, 'utf8').digest('hex')
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    if (!/^[A-Za-z0-9_-]{43}$/.test(token)) {
      return NextResponse.json(
        { error: 'Enlace de seguimiento no encontrado o vencido.' },
        { status: 404, headers: privateHeaders }
      )
    }

    const body: unknown = await request.json().catch(() => null)
    if (!isRecord(body)) {
      return NextResponse.json(
        { error: 'El formato del reporte no es válido.' },
        { status: 400, headers: privateHeaders }
      )
    }

    const payload = body as ProblemPayload
    if (typeof payload.category !== 'string' || !allowedCategories.has(payload.category)) {
      return NextResponse.json(
        { error: 'Selecciona el tipo de problema.' },
        { status: 400, headers: privateHeaders }
      )
    }

    if (typeof payload.details !== 'string') {
      return NextResponse.json(
        { error: 'Describe brevemente qué ocurrió.' },
        { status: 400, headers: privateHeaders }
      )
    }

    const details = payload.details.trim()
    if (details.length < 10) {
      return NextResponse.json(
        { error: 'Cuéntanos qué ocurrió con al menos 10 caracteres.' },
        { status: 400, headers: privateHeaders }
      )
    }
    if (details.length > 2000) {
      return NextResponse.json(
        { error: 'La descripción no puede superar los 2000 caracteres.' },
        { status: 400, headers: privateHeaders }
      )
    }

    const { data, error } = await supabaseAdmin.rpc(
      'report_customer_tracking_problem_by_hash',
      {
        p_token_hash: hashTrackingToken(token),
        p_category: payload.category,
        p_details: details,
      }
    )

    if (error) {
      const message = error.message ?? ''
      if (message.includes('TOKEN_INVALID') || message.includes('TRACKING_TOKEN_INVALID')) {
        return NextResponse.json(
          { error: 'Enlace de seguimiento no encontrado o vencido.' },
          { status: 404, headers: privateHeaders }
        )
      }
      if (message.includes('PROBLEM_ALREADY_REPORTED')) {
        return NextResponse.json(
          { error: 'Ya recibimos un reporte para este servicio.' },
          { status: 409, headers: privateHeaders }
        )
      }
      if (message.includes('REQUEST_NOT_REPORTABLE')) {
        return NextResponse.json(
          { error: 'Este servicio ya no está esperando confirmación y no admite un nuevo reporte desde esta pantalla.' },
          { status: 409, headers: privateHeaders }
        )
      }
      if (message.includes('PROBLEM_CATEGORY_INVALID') || message.includes('PROBLEM_DETAILS_REQUIRED') || message.includes('PROBLEM_DETAILS_TOO_LONG')) {
        return NextResponse.json(
          { error: 'Revisa el tipo de problema y su descripción.' },
          { status: 400, headers: privateHeaders }
        )
      }

      console.error('Customer problem report failed:', message)
      return NextResponse.json(
        { error: 'No se pudo registrar el reporte. Inténtalo de nuevo.' },
        { status: 500, headers: privateHeaders }
      )
    }

    return NextResponse.json(
      { success: true, status: 'disputed', issue: data },
      { status: 201, headers: privateHeaders }
    )
  } catch (error) {
    console.error(
      'Unexpected customer problem report error:',
      error instanceof Error ? error.message : 'Unknown error'
    )
    return NextResponse.json(
      { error: 'Ocurrió un error interno al registrar el reporte.' },
      { status: 500, headers: privateHeaders }
    )
  }
}
