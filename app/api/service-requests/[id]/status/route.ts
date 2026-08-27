import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

const allowedStatuses = new Set(['pending', 'notified', 'accepted', 'assigned', 'in_progress', 'completed', 'cancelled'])

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await createClient()
  const { data: claims } = await auth.auth.getClaims()
  if (!claims?.claims) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })

  try {
    const { id } = await context.params
    const body = await request.json()
    const nextStatus = body.status

    if (typeof nextStatus !== 'string' || !allowedStatuses.has(nextStatus)) {
      return NextResponse.json({ error: 'Estado no válido.' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('service_requests')
      .update({ status: nextStatus })
      .eq('id', id)
      .select('id, status, updated_at')
      .single()

    if (error) {
      console.error('Error actualizando estado:', error)
      return NextResponse.json({ error: 'No se pudo actualizar el estado.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, request: data })
  } catch (error) {
    console.error('Error inesperado:', error)
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 })
  }
}
