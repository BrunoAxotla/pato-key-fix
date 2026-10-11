import { createHash, randomBytes } from 'node:crypto'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

const privateHeaders = {
  'Cache-Control': 'private, no-store, max-age=0',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function hashTrackingToken(token: string) {
  return createHash('sha256').update(token, 'utf8').digest('hex')
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json()
    if (!isRecord(body)) {
      return NextResponse.json(
        { error: 'El formato de la solicitud no es válido.' },
        { status: 400, headers: privateHeaders }
      )
    }

    const { customer, service, vehicle, domestic, commercial, address } = body
    if (!isRecord(customer) || !isRecord(service) || !isRecord(address)) {
      return NextResponse.json(
        { error: 'Faltan datos obligatorios de la solicitud.' },
        { status: 400, headers: privateHeaders }
      )
    }

    if (
      (vehicle !== null && vehicle !== undefined && !isRecord(vehicle)) ||
      (domestic !== null && domestic !== undefined && !isRecord(domestic)) ||
      (commercial !== null && commercial !== undefined && !isRecord(commercial))
    ) {
      return NextResponse.json(
        { error: 'Los detalles del servicio no tienen un formato válido.' },
        { status: 400, headers: privateHeaders }
      )
    }

    const token = randomBytes(32).toString('base64url')
    const tokenHash = hashTrackingToken(token)

    const { data, error } = await supabaseAdmin.rpc(
      'create_service_request_with_tracking',
      {
        p_customer: customer,
        p_service: service,
        p_vehicle: vehicle ?? null,
        p_domestic: domestic ?? null,
        p_commercial: commercial ?? null,
        p_address: address,
        p_token_hash: tokenHash,
      }
    )

    if (error) {
      console.error('Tracked request creation failed:', error.message)
      return NextResponse.json(
        { error: 'No se pudo crear la solicitud y preparar su seguimiento.' },
        { status: 500, headers: privateHeaders }
      )
    }

    return NextResponse.json(
      { ...data, tracking_token: token },
      { status: 201, headers: privateHeaders }
    )
  } catch (error) {
    console.error(
      'Unexpected tracked request creation error:',
      error instanceof Error ? error.message : 'Unknown error'
    )
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500, headers: privateHeaders }
    )
  }
}
