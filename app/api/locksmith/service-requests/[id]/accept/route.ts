import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
    }

    if (user.user_metadata?.role !== 'locksmith') {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 403 })
    }

    const { data, error } = await supabase.rpc('accept_service_request', {
      p_request_id: id,
    })

    if (error) {
      console.error('accept_service_request error:', error)

      const message = error.message

      if (message === 'REQUEST_ALREADY_TAKEN') {
        return NextResponse.json(
          { error: 'Otro cerrajero acaba de aceptar esta solicitud.' },
          { status: 409 }
        )
      }

      if (
        message === 'LOCKSMITH_HAS_ACTIVE_JOB' ||
        message === 'LOCKSMITH_HAS_ACTIVE_JOB_OR_REQUEST_ALREADY_TAKEN'
      ) {
        return NextResponse.json(
          { error: 'Ya tienes un trabajo activo. Complétalo antes de aceptar otro.' },
          { status: 409 }
        )
      }

      if (message === 'REQUEST_NOT_FOUND') {
        return NextResponse.json({ error: 'Solicitud no encontrada.' }, { status: 404 })
      }

      if (
        message === 'SERVICE_TYPE_NOT_ALLOWED' ||
        message === 'SERVICE_AREA_NOT_ALLOWED'
      ) {
        return NextResponse.json(
          { error: 'Esta solicitud ya no corresponde a tu cobertura.' },
          { status: 403 }
        )
      }

      if (message === 'LOCKSMITH_NOT_ACTIVE') {
        return NextResponse.json(
          { error: 'Tu cuenta de cerrajero no está activa.' },
          { status: 403 }
        )
      }

      if (message === 'AUTH_REQUIRED') {
        return NextResponse.json({ error: 'Sesión no válida.' }, { status: 401 })
      }

      return NextResponse.json(
        { error: 'No se pudo aceptar el servicio.', details: message },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('Unexpected accept service error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 }
    )
  }
}
