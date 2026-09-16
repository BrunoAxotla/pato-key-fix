'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { AlertTriangle, Building2, Car, Clock3, Home, Image as ImageIcon, KeyRound, LogOut, MapPin, Search, Wrench, BriefcaseBusiness } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export type MatchingRequest = {
  service_request_id: string
  created_at: string
  service_type: 'automotriz' | 'domestico' | 'comercial'
  service_needed: string
  wants_additional_key: boolean
  urgency: 'ahora' | 'hoy' | 'programar'
  schedule_date: string | null
  description: string
  status: string
  state: string
  municipality: string
  vehicle_brand: string | null
  vehicle_model: string | null
  vehicle_year: number | null
  vehicle_has_key: string | null
  vehicle_status: string | null
  key_type: string | null
  domestic_door_locked: string | null
  domestic_has_available_key: string | null
  domestic_lock_damaged: string | null
  commercial_type: string | null
  photo_count: number
}

const serviceLabels: Record<string, string> = {
  apertura: 'Apertura',
  llave: 'Realización / duplicado de llave',
  programacion: 'Programación de llave o control',
  cambio: 'Cambio / instalación',
  reparacion: 'Reparación',
  otro: 'Otro',
}

function typeName(type: MatchingRequest['service_type']) {
  return type === 'automotriz' ? 'Automotriz' : type === 'domestico' ? 'Doméstica' : 'Comercial'
}

function icon(type: MatchingRequest['service_type']) {
  return type === 'automotriz' ? <Car className="w-5 h-5" /> : type === 'domestico' ? <Home className="w-5 h-5" /> : <Building2 className="w-5 h-5" />
}

function urgency(u: string) {
  return u === 'ahora' ? 'Ahora' : u === 'hoy' ? 'Hoy' : 'Programado'
}

export default function LocksmithRequestsClient({
  locksmith,
  requests,
  activeJob,
  initialError,
}: {
  locksmith: any
  requests: MatchingRequest[]
  activeJob: any | null
  initialError: string | null
}) {
  const [query, setQuery] = useState('')
  const [error, setError] = useState(initialError)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return requests
    return requests.filter(r =>
      [
        typeName(r.service_type),
        serviceLabels[r.service_needed],
        r.vehicle_brand,
        r.vehicle_model,
        r.state,
        r.municipality,
        r.description,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    )
  }, [query, requests])

  async function accept(id: string) {
    if (activeJob) {
      setError('Ya tienes un trabajo activo. Complétalo antes de aceptar otro.')
      return
    }

    setLoadingId(id)
    setError(null)

    try {
      const res = await fetch(`/api/locksmith/service-requests/${id}/accept`, { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'No se pudo aceptar el servicio.')
        return
      }

      window.location.href = `/cerrajero/solicitudes/${id}`
    } catch {
      setError('No se pudo conectar con PATO.')
    } finally {
      setLoadingId(null)
    }
  }

  async function logout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b bg-card/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">PATO · Cerrajero</p>
            <h1 className="font-bold text-lg">Hola, {locksmith.first_name}</h1>
            <p className="text-xs text-muted-foreground">{locksmith.business_name || `${locksmith.first_name} ${locksmith.last_name}`}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/cerrajero/trabajos" className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-muted">
              <BriefcaseBusiness className="w-4 h-4" />
              <span className="hidden sm:inline">Historial de trabajos</span>
            </Link>
            <button onClick={logout} className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-muted">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {activeJob && (
          <div className="mb-6 rounded-3xl border border-[#E53E3E]/30 bg-[#E53E3E]/5 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#E53E3E]">Trabajo activo</p>
                <h2 className="font-bold text-lg mt-1">
                  {serviceLabels[activeJob.service_needed] || activeJob.service_needed}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {activeJob.service_type === 'automotriz' && `${activeJob.vehicle_brand} ${activeJob.vehicle_model} ${activeJob.vehicle_year} · `}
                  {activeJob.municipality}, {activeJob.state}
                </p>
              </div>
              <Link href={`/cerrajero/solicitudes/${activeJob.service_request_id}`} className="rounded-xl bg-[#E53E3E] px-4 py-3 text-center text-sm font-bold text-white">
                Ver mi trabajo
              </Link>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Ya tienes un trabajo activo. Puedes consultar solicitudes, pero no aceptar otra hasta completar o cancelar la actual.
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold">Solicitudes disponibles</h2>
            <p className="text-sm text-muted-foreground mt-1">Coinciden con tus ramas y zonas de trabajo.</p>
          </div>
          <div className="text-sm text-muted-foreground"><b className="text-foreground">{filtered.length}</b> disponibles</div>
        </div>

        <div className="relative mb-6 max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar vehículo, zona o servicio..." className="w-full rounded-xl border bg-card py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-[#E53E3E]/50" />
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!filtered.length ? (
          <div className="rounded-3xl border border-dashed p-10 text-center">
            <Wrench className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-bold text-lg">No hay solicitudes compatibles</h3>
            <p className="text-sm text-muted-foreground mt-2">Cuando llegue una solicitud compatible aparecerá aquí.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map(r => (
              <article key={r.service_request_id} className="rounded-3xl border bg-card/70 p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#E53E3E]/10 text-[#E53E3E] flex items-center justify-center">{icon(r.service_type)}</div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">{typeName(r.service_type)}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${r.urgency === 'ahora' ? 'bg-red-500/10 text-red-600' : 'bg-muted text-muted-foreground'}`}>{urgency(r.urgency)}</span>
                      </div>
                      <h3 className="font-bold mt-1">{serviceLabels[r.service_needed] || r.service_needed}</h3>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1"><Clock3 className="w-3.5 h-3.5" />{new Date(r.created_at).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}</div>
                </div>

                {r.service_type === 'automotriz' && (
                  <div className="mt-5 rounded-2xl bg-muted/40 p-4">
                    <div className="font-semibold">{r.vehicle_brand} {r.vehicle_model} {r.vehicle_year}</div>
                    <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
                      {r.key_type && <span className="inline-flex items-center gap-1"><KeyRound className="w-3.5 h-3.5" />{r.key_type === 'presencia' ? 'Llave de presencia' : 'Llave normal'}</span>}
                      {r.vehicle_has_key && <span>· {r.vehicle_has_key === 'no' ? 'Sin llave' : 'Con llave disponible'}</span>}
                    </div>
                  </div>
                )}

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm"><div className="flex items-start gap-2"><MapPin className="w-4 h-4 text-[#E53E3E] mt-0.5" />{r.municipality}, {r.state}</div><div className="flex items-center gap-2 text-muted-foreground"><ImageIcon className="w-4 h-4" />{r.photo_count} foto{r.photo_count === 1 ? '' : 's'}</div></div>
                <p className="mt-4 text-sm text-muted-foreground line-clamp-3">{r.description}</p>

                <div className="mt-5 flex flex-col sm:flex-row gap-2">
                  <Link href={`/cerrajero/solicitudes/${r.service_request_id}`} className="flex-1 text-center rounded-xl border px-4 py-3 text-sm font-semibold hover:bg-muted">Ver detalles</Link>
                  <button onClick={() => accept(r.service_request_id)} disabled={loadingId !== null || !!activeJob} className="flex-1 rounded-xl bg-[#E53E3E] px-4 py-3 text-sm font-bold text-white hover:bg-[#E53E3E]/90 disabled:opacity-50 disabled:cursor-not-allowed">{loadingId === r.service_request_id ? 'Aceptando...' : activeJob ? 'Tienes un trabajo activo' : 'Aceptar servicio'}</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
