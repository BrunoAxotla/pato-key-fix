import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, Mail, MapPin, Phone } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export default async function LocksmithProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { id } = await params
  const { data: locksmith, error } = await supabaseAdmin
    .from('locksmiths')
    .select(`
      id,
      first_name,
      last_name,
      phone,
      business_name,
      status,
      created_at,
      user_id,
      locksmith_service_areas (
        service_areas (
          id,
          state,
          city,
          is_active
        )
      ),
      locksmith_service_types (
        service_type
      )
    `)
    .eq('id', id)
    .single()

    // Vamos a buscar el correo real a la bóveda de Auth usando el ID
  let email = 'Correo no disponible'
  if (locksmith?.user_id) {
    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(locksmith.user_id)
    if (authUser?.user?.email) {
      email = authUser.user.email
    }
  }

  if (error || !locksmith) {
    return (
      <main className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-3xl rounded-2xl border p-6">
          No se encontró el cerrajero.
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/dashboard/cerrajeros" className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-muted">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>

        <div className="mt-6 rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#E53E3E]">PATO</p>
              <h1 className="mt-1 text-3xl font-extrabold">{locksmith.first_name} {locksmith.last_name}</h1>
              {locksmith.business_name && <p className="mt-1 text-muted-foreground">{locksmith.business_name}</p>}
            </div>
            <span className="rounded-full border px-3 py-1 text-xs font-semibold">{locksmith.status}</span>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border p-4">
              <p className="text-xs text-muted-foreground">Teléfono</p>
              <p className="mt-1 inline-flex items-center gap-2 font-medium"><Phone className="h-4 w-4" />{locksmith.phone}</p>
            </div>
            <div className="rounded-2xl border p-4">
              <p className="text-xs text-muted-foreground">Correo</p>
              <p className="mt-1 inline-flex items-center gap-2 font-medium">
                <Mail className="h-4 w-4" />
                {email} {/* <-- Cambiamos locksmith.user_id por email */}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">Ramas de cerrajería</h2>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {((locksmith as any).locksmith_service_types ?? []).map((item: any) => {
                const labels: Record<string, string> = { domestico: 'Doméstica', automotriz: 'Automotriz', comercial: 'Comercial' }
                return (
                  <span key={item.service_type} className="rounded-full border border-[#E53E3E]/20 bg-[#E53E3E]/5 px-3 py-1.5 text-sm font-medium text-[#E53E3E]">
                    {labels[item.service_type] ?? item.service_type}
                  </span>
                )
              })}
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[#E53E3E]" />
              <h2 className="text-lg font-bold">Zonas de trabajo</h2>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {(locksmith.locksmith_service_areas ?? []).map((item: any) => {
                const area = item.service_areas
                if (!area) return null
                return (
                  <span key={area.id} className="rounded-full border bg-background px-3 py-1.5 text-sm">
                    {area.city}, {area.state}
                  </span>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
