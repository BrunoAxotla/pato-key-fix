import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import JobStatusActions from '../../_components/JobStatusActions'
import { ArrowLeft, CheckCircle2, Mail, Phone, MapPin, KeyRound, Car, Home, Building2 } from 'lucide-react'

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

function keyTypeLabel(value: string | null | undefined) {
  if (!value) return null
  return value === 'presencia' ? 'Llave de presencia' : 'Llave normal'
}

export default async function LocksmithRequestDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  if (user.user_metadata?.role !== 'locksmith') redirect('/dashboard')

  // === SERVER ACTION INTEGRADA ===
  // Esto reemplaza al formulario rebelde que te sacaba al JSON
  async function acceptAction() {
    'use server'
    const supabaseServer = await createClient()
    const { error } = await supabaseServer.rpc('accept_service_request', {
      p_request_id: id,
    })
    if (!error) {
      redirect(`/cerrajero/solicitudes/${id}`)
    }
  }

  const { data: assigned } = await supabase.rpc('get_my_assigned_request', {
    p_request_id: id,
  })

  if (!assigned?.length) {
    const [{ data: available }, { data: activeJobs }] = await Promise.all([
      supabase.rpc('get_my_matching_requests'),
      supabase.rpc('get_my_assigned_requests'),
    ])

    const r = available?.find((x: any) => x.service_request_id === id)

    if (!r) {
      return (
        <main className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md text-center">
            <h1 className="text-xl font-bold">Solicitud no disponible</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Puede que otro cerrajero ya la haya aceptado.
            </p>
            <Link
              href="/cerrajero"
              className="inline-flex items-center gap-2 mt-5 rounded-xl bg-[#E53E3E] px-4 py-3 text-white font-semibold"
            >
              <ArrowLeft className="w-4 h-4" /> Volver
            </Link>
          </div>
        </main>
      )
    }

    const hasActiveJob = (activeJobs ?? []).some((job: any) =>
      ['assigned', 'in_progress'].includes(job.assignment_status)
    )

    const requestKeyType = keyTypeLabel(r.key_type)

    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto p-6">
          <Link href="/cerrajero" className="inline-flex gap-2 text-sm text-muted-foreground">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>

          <div className="mt-5 rounded-3xl border bg-card p-6">
            <p className="text-xs uppercase text-muted-foreground">{typeName(r.service_type)}</p>
            <h1 className="text-2xl font-bold mt-1">{labels[r.service_needed] || r.service_needed}</h1>

            {r.service_type === 'automotriz' && (
              <div className="mt-6 rounded-2xl bg-muted/40 p-4">
                <div className="flex items-center gap-2 font-semibold">
                  <Car className="w-4 h-4 text-[#E53E3E]" />
                  {r.vehicle_brand} {r.vehicle_model} {r.vehicle_year}
                </div>

                {(requestKeyType || r.vehicle_has_key) && (
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {requestKeyType && (
                      <span className="inline-flex items-center gap-1">
                        <KeyRound className="w-3.5 h-3.5" />
                        {requestKeyType}
                      </span>
                    )}
                    {r.vehicle_has_key && (
                      <span>
                        · {r.vehicle_has_key === 'no' ? 'Sin llave disponible' : 'Llave disponible'}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {r.service_type === 'domestico' && (
              <div className="mt-6 rounded-2xl bg-muted/40 p-4 text-sm">
                <div className="flex items-center gap-2 font-semibold">
                  <Home className="w-4 h-4 text-[#E53E3E]" /> Información de la puerta
                </div>
                <p className="mt-2 text-muted-foreground">
                  Cerrada con llave: {r.domestic_door_locked || 'No especificado'}
                </p>
              </div>
            )}

            {r.service_type === 'comercial' && (
              <div className="mt-6 rounded-2xl bg-muted/40 p-4 text-sm">
                <div className="flex items-center gap-2 font-semibold">
                  <Building2 className="w-4 h-4 text-[#E53E3E]" /> Información del establecimiento
                </div>
                <p className="mt-2 text-muted-foreground">
                  Tipo: {r.commercial_type || 'No especificado'}
                </p>
              </div>
            )}

            <div className="mt-6 flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-[#E53E3E]" />
              {r.municipality}, {r.state}
            </div>

            <p className="mt-5 text-sm text-muted-foreground">{r.description}</p>

            <p className="mt-5 text-xs text-muted-foreground">
              Fotografías disponibles: {r.photo_count}
            </p>

            {/* AQUÍ SE APLICA LA SERVER ACTION */}
            <form action={acceptAction} className="mt-6">
              <button
                type="submit"
                disabled={hasActiveJob}
                title={hasActiveJob ? 'Ya tienes un trabajo activo. Complétalo antes de aceptar otro.' : undefined}
                className="w-full rounded-2xl bg-[#E53E3E] text-white py-4 font-bold transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {hasActiveJob ? 'Ya tienes un trabajo activo' : 'Aceptar servicio'}
              </button>
            </form>

            {hasActiveJob && (
              <div className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
                Completa o cancela tu trabajo actual antes de aceptar otra solicitud.
              </div>
            )}
          </div>
        </div>
      </main>
    )
  }

  const job = assigned[0]
  const requestKeyType = keyTypeLabel(job.key_type)

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto p-6">
        <Link href="/cerrajero" className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>

        <div className="mt-5 rounded-3xl border bg-card p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-green-500/10 text-green-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{job.assignment_status === 'completed' ? 'Servicio realizado' : job.assignment_status === 'cancelled' ? 'Trabajo cancelado' : 'Servicio asignado'}</h1>
              <p className="text-sm text-muted-foreground">
                Los datos privados del cliente están disponibles.
              </p>
            </div>
          </div>

          <section className="mt-6 rounded-2xl border p-4">
            <h2 className="font-bold">Cliente</h2>
            <p className="mt-2">{job.first_name} {job.last_name}</p>
            <a href={`tel:${job.phone}`} className="mt-2 flex items-center gap-2 text-sm text-[#E53E3E]">
              <Phone className="w-4 h-4" /> {job.phone}
            </a>
            {job.email && (
              <a href={`mailto:${job.email}`} className="mt-2 flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4" /> {job.email}
              </a>
            )}
          </section>

          <section className="mt-4 rounded-2xl border p-4">
            <h2 className="font-bold">Ubicación completa</h2>
            <p className="mt-2 text-sm">{job.street_number}</p>
            <p className="text-sm">{job.neighborhood}</p>
            <p className="text-sm">{job.municipality}, {job.state}</p>
            <p className="text-sm">CP {job.cp}</p>
            <p className="text-sm text-muted-foreground mt-3">{job.references_text}</p>
          </section>

          <section className="mt-4 rounded-2xl border p-4">
            <h2 className="font-bold">Servicio</h2>
            <p className="mt-2 text-sm">
              {typeName(job.service_type)} · {labels[job.service_needed] || job.service_needed}
            </p>

            {job.service_type === 'automotriz' && (
              <div className="mt-3 rounded-xl bg-muted/40 p-3">
                <p className="text-sm font-semibold">
                  {job.vehicle_brand} {job.vehicle_model} {job.vehicle_year}
                </p>
                {requestKeyType && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <KeyRound className="w-3.5 h-3.5" /> {requestKeyType}
                  </p>
                )}
                {job.vehicle_has_key && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {job.vehicle_has_key === 'no' ? 'Sin llave disponible' : 'Llave disponible'}
                  </p>
                )}
              </div>
            )}

            <p className="text-sm mt-3">{job.description}</p>
          </section>

          <JobStatusActions
            requestId={job.service_request_id}
            status={job.assignment_status}
          />
        </div>
      </div>
    </main>
  )
}