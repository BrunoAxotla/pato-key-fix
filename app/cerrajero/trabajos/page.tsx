import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft } from 'lucide-react'

const labels: Record<string, string> = {
  apertura: 'Apertura',
  llave: 'Realización / duplicado de llave',
  programacion: 'Programación de llave o control',
  cambio: 'Cambio / instalación',
  reparacion: 'Reparación',
  otro: 'Otro',
}

const typeName = (t: string) =>
  t === 'automotriz' ? 'Automotriz' : t === 'domestico' ? 'Doméstica' : 'Comercial'

const statusLabel: Record<string, string> = {
  assigned: 'Asignado',
  in_progress: 'En progreso',
  completed: 'Realizado · esperando confirmación',
  cancelled: 'Cancelado',
}

export default async function MisTrabajosPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  if (user.user_metadata?.role !== 'locksmith') redirect('/dashboard')

  const { data: locksmith } = await supabase
    .from('locksmiths')
    .select('first_name, last_name, business_name, status')
    .eq('user_id', user.id)
    .single()

  if (!locksmith || locksmith.status !== 'active') redirect('/login')

  const { data: jobs, error } = await supabase.rpc('get_my_assigned_requests')

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-card/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">PATO · Cerrajero</p>
            <h1 className="font-bold text-lg">Historial de trabajos</h1>
            <p className="text-xs text-muted-foreground">{locksmith.business_name || `${locksmith.first_name} ${locksmith.last_name}`}</p>
          </div>
          <Link href="/cerrajero" className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-muted">
            <ArrowLeft className="w-4 h-4" /> Solicitudes
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {error && (
          <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
            No se pudieron cargar tus trabajos: {error.message}
          </div>
        )}

        {!jobs?.length ? (
          <div className="rounded-3xl border border-dashed p-10 text-center">
            <h2 className="text-xl font-bold">Todavía no tienes trabajos</h2>
            <p className="mt-2 text-sm text-muted-foreground">Cuando aceptes una solicitud aparecerá aquí.</p>
            <Link href="/cerrajero" className="inline-flex mt-5 rounded-xl bg-[#E53E3E] px-5 py-3 text-white font-bold">
              Ver solicitudes
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {jobs.map((job: any) => (
              <article key={job.assignment_id} className="rounded-3xl border bg-card/70 p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{typeName(job.service_type)}</p>
                    <h2 className="font-bold mt-1">{labels[job.service_needed] || job.service_needed}</h2>
                  </div>
                  <span className="text-xs rounded-full bg-muted px-3 py-1 font-semibold">
                    {statusLabel[job.assignment_status] || job.assignment_status}
                  </span>
                </div>

                {job.service_type === 'automotriz' && (
                  <div className="mt-4 rounded-2xl bg-muted/40 p-4">
                    <p className="font-semibold">{job.vehicle_brand} {job.vehicle_model} {job.vehicle_year}</p>
                    {job.key_type && <p className="text-xs text-muted-foreground mt-1">{job.key_type === 'presencia' ? 'Llave de presencia' : 'Llave normal'}</p>}
                  </div>
                )}

                <div className="mt-4 text-sm space-y-1">
                  <p><span className="font-semibold">Cliente:</span> {job.first_name} {job.last_name}</p>
                  <p><span className="font-semibold">Zona:</span> {job.municipality}, {job.state}</p>
                  <p><span className="font-semibold">Dirección:</span> {job.street_number}, {job.neighborhood}</p>
                </div>

                <p className="mt-4 text-sm text-muted-foreground line-clamp-3">{job.description}</p>

                <Link
                  href={`/cerrajero/solicitudes/${job.service_request_id}`}
                  className="mt-5 block w-full text-center rounded-xl border px-4 py-3 text-sm font-semibold hover:bg-muted"
                >
                  Ver trabajo
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
