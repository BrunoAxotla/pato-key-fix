'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Building2,
  Car,
  CheckCircle2,
  Clock3,
  Home,
  Loader2,
  MapPin,
  UserRound,
  Wrench,
} from 'lucide-react'

type TrackingRequest = {
  status: string
  service_type: string
  service_needed: string
  state: string
  municipality: string
  vehicle_brand: string | null
  vehicle_model: string | null
  vehicle_year: number | null
  key_type: string | null
  locksmith_first_name: string | null
  locksmith_last_name: string | null
  locksmith_business_name: string | null
}

type StatusMeta = {
  title: string
  description: string
  tone: 'neutral' | 'active' | 'success'
}

const pendingStatus: StatusMeta = {
  title: 'Buscando cerrajero',
  description: 'Tu solicitud está en proceso de asignación.',
  tone: 'active',
}

const statusMeta: Record<string, StatusMeta> = {
  pending: pendingStatus,
  notified: pendingStatus,
  accepted: {
    title: 'Cerrajero asignado',
    description: 'Un cerrajero aceptó tu solicitud.',
    tone: 'active',
  },
  assigned: {
    title: 'Cerrajero asignado',
    description: 'Un cerrajero aceptó tu solicitud.',
    tone: 'active',
  },
  in_progress: {
    title: 'Servicio en proceso',
    description: 'El cerrajero indicó que comenzó a trabajar.',
    tone: 'active',
  },
  awaiting_customer_confirmation: {
    title: 'Trabajo realizado',
    description: 'El cerrajero indicó que terminó el servicio.',
    tone: 'success',
  },
  completed: {
    title: 'Servicio completado',
    description: 'Este servicio ya quedó cerrado.',
    tone: 'success',
  },
  cancelled: {
    title: 'Solicitud cancelada',
    description: 'Esta solicitud ya no está activa.',
    tone: 'neutral',
  },
}

const serviceLabels: Record<string, string> = {
  automotriz: 'Automotriz',
  domestico: 'Doméstica',
  comercial: 'Comercial',
}

const neededLabels: Record<string, string> = {
  apertura: 'Apertura',
  llave: 'Realización / duplicado de llave',
  programacion: 'Programación de llave o control',
  cambio: 'Cambio / instalación de cerradura',
  reparacion: 'Reparación de cerradura',
  otro: 'Otro',
}

function IconForService({ type }: { type: string }) {
  if (type === 'automotriz') return <Car className="h-5 w-5" />
  if (type === 'domestico') return <Home className="h-5 w-5" />
  return <Building2 className="h-5 w-5" />
}

function locksmithName(request: TrackingRequest) {
  return request.locksmith_business_name ||
    [request.locksmith_first_name, request.locksmith_last_name]
      .filter(Boolean)
      .join(' ') ||
    null
}

export default function TrackingLive({
  token,
  initialRequest,
}: {
  token: string
  initialRequest: TrackingRequest
}) {
  const [request, setRequest] = useState(initialRequest)
  const [loading, setLoading] = useState(false)
  const [expired, setExpired] = useState(false)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    let active = true
    let inFlight = false
    let controller: AbortController | undefined

    const refresh = async () => {
      if (inFlight) return
      inFlight = true
      controller = new AbortController()
      setLoading(true)

      try {
        const response = await fetch(`/api/seguimiento/${encodeURIComponent(token)}`, {
          cache: 'no-store',
          signal: controller.signal,
        })

        if (!active) return
        if (response.status === 404) {
          setExpired(true)
          return
        }
        if (!response.ok) {
          setLoadError(true)
          return
        }

        const payload: { request?: TrackingRequest } = await response.json()
        if (active && payload.request) {
          setRequest(payload.request)
          setExpired(false)
          setLoadError(false)
        }
      } catch {
        if (active && !controller.signal.aborted) setLoadError(true)
      } finally {
        inFlight = false
        if (active) setLoading(false)
      }
    }

    void refresh()
    const intervalId = window.setInterval(() => void refresh(), 15000)

    return () => {
      active = false
      controller?.abort()
      window.clearInterval(intervalId)
    }
  }, [token])

  const meta = useMemo(
    () => statusMeta[request.status] ?? {
      title: 'Estado en actualización',
      description: 'Estamos actualizando el estado de tu servicio.',
      tone: 'neutral' as const,
    },
    [request.status]
  )
  const locksmith = locksmithName(request)

  if (expired) {
    return (
      <main className="min-h-screen bg-background px-4 py-10 text-foreground">
        <div className="mx-auto max-w-xl rounded-3xl border bg-card p-6 text-center shadow-sm">
          <h1 className="text-xl font-bold">Este enlace venció o fue revocado</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Solicita al equipo de PATO un nuevo enlace de seguimiento.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground">
      <div className="mx-auto max-w-xl">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E53E3E] shadow-lg shadow-[#E53E3E]/20">
            <Wrench className="h-7 w-7 text-white" />
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">PATO</p>
          <h1 className="mt-1 text-3xl font-extrabold">Seguimiento de tu servicio</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            El estado se actualiza automáticamente.
          </p>
        </div>

        <section className="mt-8 rounded-3xl border bg-card p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-muted p-3">
              {meta.tone === 'success'
                ? <CheckCircle2 className="h-6 w-6" />
                : <Clock3 className="h-6 w-6" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-bold">{meta.title}</h2>
                {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{meta.description}</p>
            </div>
          </div>

          {loadError && (
            <p role="status" className="mt-4 text-sm text-amber-700 dark:text-amber-300">
              No pudimos actualizar el seguimiento. Volveremos a intentarlo.
            </p>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground">Servicio</p>
              <p className="mt-1 text-sm font-semibold">
                {serviceLabels[request.service_type] ?? 'Servicio'}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {neededLabels[request.service_needed] ?? 'Servicio solicitado'}
              </p>
            </div>

            <div className="rounded-2xl bg-muted/50 p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> Zona general
              </div>
              <p className="mt-1 text-sm font-semibold">{request.municipality}</p>
              <p className="mt-1 text-xs text-muted-foreground">{request.state}</p>
            </div>
          </div>

          {request.service_type === 'automotriz' && request.vehicle_brand && (
            <div className="mt-4 rounded-2xl border p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <IconForService type={request.service_type} /> Vehículo
              </div>
              <p className="mt-2 text-sm">
                {[request.vehicle_brand, request.vehicle_model, request.vehicle_year]
                  .filter(Boolean)
                  .join(' ')}
              </p>
              {request.key_type && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {request.key_type === 'presencia' ? 'Llave de presencia' : 'Llave normal'}
                </p>
              )}
            </div>
          )}

          {locksmith && ['accepted', 'assigned', 'in_progress', 'awaiting_customer_confirmation', 'completed'].includes(request.status) && (
            <div className="mt-4 rounded-2xl border p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <UserRound className="h-4 w-4" /> Cerrajero asignado
              </div>
              <p className="mt-2 text-sm font-semibold">{locksmith}</p>
            </div>
          )}

          <div className="mt-4 rounded-2xl bg-muted/30 p-4 text-sm">
            <p className="font-semibold">Cuida este enlace</p>
            <p className="mt-1 text-muted-foreground">
              Quien tenga este enlace puede consultar el estado del servicio.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
