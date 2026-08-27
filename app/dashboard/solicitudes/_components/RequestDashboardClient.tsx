'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Car, CheckCircle2, Clock3, Home, ImageIcon, MapPin, Search, Wrench } from 'lucide-react'

export type DashboardRequest = {
  id: string
  service_type: string
  service_needed: string
  wants_additional_key: boolean
  urgency: string
  schedule_date: string | null
  description: string
  status: string
  created_at: string
  customers:
    | {
        first_name: string
        last_name: string
        phone: string
        email: string | null
      }
    | null
  addresses:
    | {
        cp: string
        state: string
        municipality: string
        neighborhood: string
        street_number: string
        references_text: string
      }
    | null
  vehicle_details:
    | {
        brand: string
        model: string
        year: number
        has_key: string
        vehicle_status: string | null
        key_type: string | null
      }
    | null
  domestic_details:
    | {
        door_locked: string | null
        has_available_key: string | null
        lock_damaged: string | null
      }
    | null
  commercial_details:
    | {
        commercial_type: string
      }
    | null
  service_photos: { id: string }[] | null
}

const serviceLabels: Record<string, string> = {
  automotriz: 'Automotriz',
  domestico: 'Doméstica',
  comercial: 'Comercial',
}

const neededLabels: Record<string, string> = {
  apertura: 'Apertura',
  llave: 'Realización / duplicado de llave',
  programacion: 'Programación',
  cambio: 'Cambio / instalación',
  reparacion: 'Reparación',
  otro: 'Otro',
}

const urgencyLabels: Record<string, string> = {
  ahora: 'Ahora',
  hoy: 'Hoy',
  programar: 'Programado',
}

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  notified: 'Notificado',
  accepted: 'Aceptado',
  assigned: 'Asignado',
  in_progress: 'En progreso',
  completed: 'Completado',
  cancelled: 'Cancelado',
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function getServiceIcon(type: string) {
  if (type === 'automotriz') return <Car className="h-4 w-4" />
  if (type === 'domestico') return <Home className="h-4 w-4" />
  return <Wrench className="h-4 w-4" />
}

function getContextLabel(request: DashboardRequest) {
  if (request.vehicle_details) {
    const vehicle = request.vehicle_details
    const keyType = vehicle.key_type
      ? ` · ${vehicle.key_type === 'presencia' ? 'Presencia' : 'Normal'}`
      : ''
    return `${vehicle.brand} ${vehicle.model} ${vehicle.year}${keyType}`
  }

  if (request.domestic_details) {
    const damaged = request.domestic_details.lock_damaged
    return damaged === 'si' ? 'Cerradura reportada como dañada' : 'Servicio doméstico'
  }

  if (request.commercial_details) {
    const types: Record<string, string> = {
      local: 'Local / negocio',
      oficina: 'Oficina',
      bodega: 'Bodega',
      otro: 'Otro establecimiento',
    }
    return types[request.commercial_details.commercial_type] ?? 'Establecimiento comercial'
  }

  return 'Sin información adicional'
}

export default function RequestsDashboardClient({ requests }: { requests: DashboardRequest[] }) {
  const [search, setSearch] = useState('')
  const [serviceFilter, setServiceFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [urgencyFilter, setUrgencyFilter] = useState('all')

  const filteredRequests = useMemo(() => {
    const term = search.trim().toLowerCase()

    return requests.filter((request) => {
      const customerText = request.customers
        ? `${request.customers.first_name} ${request.customers.last_name} ${request.customers.phone} ${request.customers.email ?? ''}`
        : ''
      const addressText = request.addresses
        ? `${request.addresses.state} ${request.addresses.municipality} ${request.addresses.neighborhood}`
        : ''
      const vehicleText = request.vehicle_details
        ? `${request.vehicle_details.brand} ${request.vehicle_details.model} ${request.vehicle_details.year}`
        : ''

      const haystack = `${request.description} ${customerText} ${addressText} ${vehicleText} ${request.service_type} ${request.service_needed}`.toLowerCase()

      return (
        (!term || haystack.includes(term)) &&
        (serviceFilter === 'all' || request.service_type === serviceFilter) &&
        (statusFilter === 'all' || request.status === statusFilter) &&
        (urgencyFilter === 'all' || request.urgency === urgencyFilter)
      )
    })
  }, [requests, search, serviceFilter, statusFilter, urgencyFilter])

  const counts = {
    total: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    active: requests.filter((r) => ['notified', 'accepted', 'assigned', 'in_progress'].includes(r.status)).length,
    completed: requests.filter((r) => r.status === 'completed').length,
  }

  return (
    <>
      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Total', counts.total, 'Solicitudes registradas'],
          ['Pendientes', counts.pending, 'Esperando atención'],
          ['Activas', counts.active, 'En proceso'],
          ['Completadas', counts.completed, 'Servicios terminados'],
        ].map(([label, value, description]) => (
          <div key={String(label)} className="rounded-2xl border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-bold">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <label className="relative block">
            <span className="sr-only">Buscar</span>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar cliente, teléfono, vehículo, colonia..."
              className="w-full rounded-xl border bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#E53E3E]/40"
            />
          </label>

          <select value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)} className="rounded-xl border bg-background px-3 py-2.5 text-sm outline-none">
            <option value="all">Todos los servicios</option>
            <option value="automotriz">Automotriz</option>
            <option value="domestico">Doméstica</option>
            <option value="comercial">Comercial</option>
          </select>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border bg-background px-3 py-2.5 text-sm outline-none">
            <option value="all">Todos los estados</option>
            {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>

          <select value={urgencyFilter} onChange={(e) => setUrgencyFilter(e.target.value)} className="rounded-xl border bg-background px-3 py-2.5 text-sm outline-none">
            <option value="all">Toda urgencia</option>
            {Object.entries(urgencyLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>

        <div className="mt-3 text-xs text-muted-foreground">
          Mostrando {filteredRequests.length} de {requests.length} solicitudes.
        </div>
      </section>

      <section className="mt-8 space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="rounded-2xl border bg-card p-10 text-center shadow-sm">
            <p className="font-semibold">No encontramos solicitudes con esos filtros.</p>
            <p className="mt-1 text-sm text-muted-foreground">Prueba con otro término o limpia los filtros.</p>
          </div>
        ) : filteredRequests.map((request) => {
          const customer = request.customers
          const photoCount = request.service_photos?.length ?? 0
          const location = request.addresses
            ? `${request.addresses.municipality}, ${request.addresses.state}`
            : 'Sin dirección'

          return (
            <article key={request.id} className="rounded-2xl border bg-card p-5 shadow-sm transition hover:shadow-md">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E53E3E]/10 px-2.5 py-1 text-xs font-semibold text-[#E53E3E]">
                      {getServiceIcon(request.service_type)}
                      {serviceLabels[request.service_type] ?? request.service_type}
                    </span>
                    <span className="rounded-full border px-2.5 py-1 text-xs font-medium">
                      {statusLabels[request.status] ?? request.status}
                    </span>
                    <span className="rounded-full border px-2.5 py-1 text-xs font-medium">
                      {urgencyLabels[request.urgency] ?? request.urgency}
                    </span>
                  </div>

                  <h2 className="mt-3 text-lg font-bold">
                    {neededLabels[request.service_needed] ?? request.service_needed}
                    {request.wants_additional_key ? ' + llave' : ''}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">{getContextLabel(request)}</p>

                  <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Cliente</p>
                      <p className="mt-1 font-medium">{customer ? `${customer.first_name} ${customer.last_name}` : 'Sin cliente'}</p>
                      <p className="text-xs text-muted-foreground">{customer?.phone ?? 'Sin teléfono'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Ubicación</p>
                      <p className="mt-1 flex items-center gap-1 font-medium"><MapPin className="h-3.5 w-3.5" />{location}</p>
                      <p className="text-xs text-muted-foreground">{request.addresses?.neighborhood ?? 'Sin colonia'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Fotografías</p>
                      <p className="mt-1 flex items-center gap-1 font-medium"><ImageIcon className="h-3.5 w-3.5" />{photoCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Creada</p>
                      <p className="mt-1 font-medium">{formatDate(request.created_at)}</p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl bg-muted/40 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Descripción</p>
                    <p className="mt-2 text-sm leading-relaxed">{request.description}</p>
                  </div>
                </div>

                <div className="shrink-0 lg:w-52">
                  <div className="rounded-xl border bg-background px-4 py-3 text-xs text-muted-foreground">
                    <p className="font-semibold text-foreground">ID de solicitud</p>
                    <p className="mt-1 break-all font-mono">{request.id}</p>
                  </div>
                  <Link
                    href={`/dashboard/solicitudes/${request.id}`}
                    className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-[#E53E3E] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#E53E3E]/90"
                  >
                    Ver solicitud
                  </Link>
                </div>
              </div>
            </article>
          )
        })}
      </section>

      <footer className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground pb-8">
        <CheckCircle2 className="h-4 w-4" />
        Datos cargados desde PostgreSQL mediante Supabase.
      </footer>
    </>
  )
}
