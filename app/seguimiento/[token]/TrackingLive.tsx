'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  Building2,
  Car,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  Send,
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
  disputed: {
    title: 'Reporte recibido',
    description: 'Recibimos tu reporte. El equipo de PATO deberá revisar lo ocurrido antes de cerrar el servicio.',
    tone: 'active',
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
  const [confirming, setConfirming] = useState(false)
  const [confirmationError, setConfirmationError] = useState('')
  const [reportFormOpen, setReportFormOpen] = useState(false)
  const [problemCategory, setProblemCategory] = useState('')
  const [problemDetails, setProblemDetails] = useState('')
  const [problemSubmitting, setProblemSubmitting] = useState(false)
  const [problemError, setProblemError] = useState('')

  const confirmService = async () => {
    if (confirming || request.status !== 'awaiting_customer_confirmation') return

    setConfirming(true)
    setConfirmationError('')

    try {
      const response = await fetch(
        `/api/seguimiento/${encodeURIComponent(token)}/confirm`,
        { method: 'POST', cache: 'no-store' }
      )
      const payload: { error?: string } = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(payload.error || 'No se pudo confirmar el servicio.')
      }

      setRequest((current) => ({ ...current, status: 'completed' }))
    } catch (error) {
      setConfirmationError(
        error instanceof Error ? error.message : 'No se pudo confirmar el servicio.'
      )
    } finally {
      setConfirming(false)
    }
  }


  const reportProblem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (problemSubmitting || request.status !== 'awaiting_customer_confirmation') return

    const details = problemDetails.trim()
    if (!problemCategory) {
      setProblemError('Selecciona el tipo de problema.')
      return
    }
    if (details.length < 10) {
      setProblemError('Describe qué ocurrió con al menos 10 caracteres.')
      return
    }
    if (details.length > 2000) {
      setProblemError('La descripción no puede superar los 2000 caracteres.')
      return
    }

    setProblemSubmitting(true)
    setProblemError('')
    try {
      const response = await fetch(
        `/api/seguimiento/${encodeURIComponent(token)}/problem`,
        {
          method: 'POST',
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category: problemCategory, details }),
        }
      )
      const payload: { error?: string } = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload.error || 'No se pudo registrar el reporte.')
      }

      setRequest((current) => ({ ...current, status: 'disputed' }))
      setReportFormOpen(false)
    } catch (error) {
      setProblemError(
        error instanceof Error ? error.message : 'No se pudo registrar el reporte.'
      )
    } finally {
      setProblemSubmitting(false)
    }
  }

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
          setRequest((current) => {
            // Evita que una consulta que comenzó antes de una acción del cliente
            // restaure un estado anterior después de confirmar o reportar.
            if (current.status === 'completed' && payload.request?.status !== 'completed') {
              return current
            }
            if (current.status === 'disputed' && payload.request?.status !== 'disputed') {
              return current
            }
            return payload.request as TrackingRequest
          })
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

          {locksmith && ['accepted', 'assigned', 'in_progress', 'awaiting_customer_confirmation', 'disputed', 'completed'].includes(request.status) && (
            <div className="mt-4 rounded-2xl border p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <UserRound className="h-4 w-4" /> Cerrajero asignado
              </div>
              <p className="mt-2 text-sm font-semibold">{locksmith}</p>
            </div>
          )}

          {request.status === 'awaiting_customer_confirmation' && (
            <div className="mt-4 rounded-2xl border border-green-600/30 bg-green-600/5 p-4">
              <h3 className="font-semibold">¿El trabajo quedó terminado?</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Confirma únicamente si el cerrajero terminó el servicio y quedaste conforme con el trabajo realizado.
              </p>
              <button
                type="button"
                onClick={confirmService}
                disabled={confirming}
                className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 font-bold text-white transition-opacity hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {confirming && <Loader2 className="h-4 w-4 animate-spin" />}
                {confirming ? 'Confirmando…' : 'Confirmar trabajo terminado'}
              </button>
              {confirmationError && (
                <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
                  {confirmationError}
                </p>
              )}
              <p className="mt-3 text-xs text-muted-foreground">
                Si el servicio no quedó resuelto, no lo confirmes todavía.
              </p>

              <button
                type="button"
                onClick={() => {
                  setReportFormOpen((open) => !open)
                  setProblemError('')
                }}
                disabled={confirming || problemSubmitting}
                className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-amber-500/40 px-4 font-semibold text-amber-700 hover:bg-amber-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:text-amber-300"
              >
                <AlertTriangle className="h-4 w-4" />
                {reportFormOpen ? 'Cerrar reporte' : 'Reportar un problema'}
              </button>

              {reportFormOpen && (
                <form onSubmit={reportProblem} className="mt-4 space-y-3 rounded-xl border bg-background p-4">
                  <div>
                    <label htmlFor="problem-category" className="mb-1 block text-sm font-semibold">
                      ¿Qué ocurrió?
                    </label>
                    <select
                      id="problem-category"
                      value={problemCategory}
                      onChange={(event) => setProblemCategory(event.target.value)}
                      required
                      disabled={problemSubmitting}
                      className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500/40"
                    >
                      <option value="">Selecciona una opción</option>
                      <option value="incomplete_work">El trabajo quedó incompleto</option>
                      <option value="issue_persists">El problema sigue igual</option>
                      <option value="damage">Hubo daños durante el servicio</option>
                      <option value="price_disagreement">El precio o cobro no coincide con lo acordado</option>
                      <option value="other">Otro problema</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="problem-details" className="mb-1 block text-sm font-semibold">
                      Cuéntanos brevemente qué ocurrió
                    </label>
                    <textarea
                      id="problem-details"
                      value={problemDetails}
                      onChange={(event) => setProblemDetails(event.target.value)}
                      required
                      minLength={10}
                      maxLength={2000}
                      rows={4}
                      disabled={problemSubmitting}
                      placeholder="Describe qué quedó pendiente o qué problema encontraste…"
                      className="w-full resize-y rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500/40"
                    />
                    <p className="mt-1 text-right text-xs text-muted-foreground">
                      {problemDetails.length}/2000
                    </p>
                  </div>

                  {problemError && (
                    <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                      {problemError}
                    </p>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Al enviarlo, el servicio quedará pendiente de revisión por PATO y ya no podrás confirmarlo desde este enlace.
                  </p>
                  <button
                    type="submit"
                    disabled={problemSubmitting || !problemCategory || problemDetails.trim().length < 10}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 font-bold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {problemSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    <Send className="h-4 w-4" />
                    {problemSubmitting ? 'Enviando reporte…' : 'Enviar reporte'}
                  </button>
                </form>
              )}
            </div>
          )}

          {request.status === 'disputed' && (
            <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm" role="status">
              <div className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="h-4 w-4" /> Reporte recibido
              </div>
              <p className="mt-2 text-muted-foreground">
                El equipo de PATO recibió tu reporte. El servicio queda pendiente de revisión y no se marcará como completado automáticamente mientras se atiende el caso.
              </p>
            </div>
          )}

          {request.status === 'completed' && (
            <div className="mt-4 rounded-2xl border border-green-600/30 bg-green-600/10 p-4 text-sm" role="status">
              <p className="font-semibold">Gracias por confirmar el servicio.</p>
              <p className="mt-1 text-muted-foreground">El trabajo quedó cerrado en PATO.</p>
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
