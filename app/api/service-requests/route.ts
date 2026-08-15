import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const {
      customer,
      service,
      vehicle,
      domestic,
      commercial,
      address,
    } = body

    if (!customer || !service || !address) {
      return NextResponse.json(
        {
          error: 'Faltan datos obligatorios de la solicitud.',
        },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin.rpc(
      'create_service_request',
      {
        p_customer: customer,
        p_service: service,
        p_vehicle: vehicle ?? null,
        p_domestic: domestic ?? null,
        p_commercial: commercial ?? null,
        p_address: address,
      }
    )

    if (error) {
      console.error('RPC create_service_request error:', error)

      return NextResponse.json(
        {
          error: 'No se pudo crear la solicitud.',
          details: error.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(data, {
      status: 201,
    })
  } catch (error) {
    console.error('Unexpected API error:', error)

    return NextResponse.json(
      {
        error: 'Error interno del servidor.',
      },
      { status: 500 }
    )
  }
}