import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Clock3, FileText } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import LogoutButton from '../LogoutButton'
import RequestsDashboardClient, { type DashboardRequest } from './_components/RequestDashboardClient'

export const dynamic = 'force-dynamic'

export default async function ServiceRequestsDashboard() {
  // 1. Validar la sesión del usuario (Corregido a getUser)
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  const { data, error } = await supabaseAdmin
    .from('service_requests')
    .select(`
      id,
      service_type,
      service_needed,
      wants_additional_key,
      urgency,
      schedule_date,
      description,
      status,
      created_at,
      customers (
        first_name,
        last_name,
        phone,
        email
      ),
      addresses (
        cp,
        state,
        municipality,
        neighborhood,
        street_number,
        references_text
      ),
      vehicle_details (
        brand,
        model,
        year,
        has_key,
        vehicle_status,
        key_type
      ),
      domestic_details (
        door_locked,
        has_available_key,
        lock_damaged
      ),
      commercial_details (
        commercial_type
      ),
      service_photos (
        id
      )
    `)
    .order('created_at', { ascending: false })

  const requests = (data ?? []) as unknown as DashboardRequest[]

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#E53E3E]">PATO</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Solicitudes</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Central de administración de los servicios solicitados.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <LogoutButton />
            
            <div className="rounded-2xl border bg-card px-4 py-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock3 className="h-4 w-4" />
                <span>Última carga</span>
              </div>
              <p className="mt-1 font-semibold">
                {new Intl.DateTimeFormat('es-MX', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                }).format(new Date())}
              </p>
            </div>
          </div>
        </div>

        {error ? (
          <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/5 p-5 text-sm">
            <p className="font-semibold">No se pudieron cargar las solicitudes.</p>
            <p className="mt-1 text-muted-foreground">{error.message}</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="mt-8 rounded-2xl border bg-card p-10 text-center shadow-sm">
            <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
            <h2 className="mt-4 text-lg font-bold">Todavía no hay solicitudes</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Las solicitudes enviadas desde el formulario aparecerán aquí.
            </p>
            <Link
              href="/"
              className="mt-5 inline-flex rounded-xl bg-[#E53E3E] px-4 py-2 text-sm font-bold text-white"
            >
              Ir al inicio
            </Link>
          </div>
        ) : (
          <RequestsDashboardClient requests={requests} />
        )}
      </div>
    </main>
  )
}