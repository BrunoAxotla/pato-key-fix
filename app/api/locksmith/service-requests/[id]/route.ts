import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error:'No autenticado.' }, { status:401 })
  if (user.user_metadata?.role !== 'locksmith') return NextResponse.json({ error:'No autorizado.' }, { status:403 })

  const { data, error } = await supabase.rpc('get_my_assigned_request', { p_request_id:id })
  if (error) return NextResponse.json({ error:'No se pudo consultar la solicitud.' }, { status:500 })
  if (!data?.length) return NextResponse.json({ error:'Solicitud no asignada a este cerrajero.' }, { status:404 })
  return NextResponse.json({ request:data[0] })
}
