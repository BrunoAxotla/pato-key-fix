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

    const { data, error } = await supabase.rpc('update_my_assignment_status', {
      p_request_id: id,
      p_action: 'in_progress',
    })

    if (error) {
      console.error('start service error:', error)
      const message = error.message

      if (message === 'ASSIGNMENT_NOT_ACTIVE' || message === 'INVALID_STATE_TRANSITION') {
        return NextResponse.json(
          { error: 'La acción ya no corresponde al estado actual del trabajo.' },
          { status: 409 }
        )
      }

      if (message === 'ASSIGNMENT_NOT_FOUND' || message === 'REQUEST_NOT_FOUND') {
        return NextResponse.json(
          { error: 'Trabajo no encontrado.' },
          { status: 404 }
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
        { error: 'No se pudo iniciar el servicio.', details: message },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('Unexpected start service error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 }
    )
  }
}
