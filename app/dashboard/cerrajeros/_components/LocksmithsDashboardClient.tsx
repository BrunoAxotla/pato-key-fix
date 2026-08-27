'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Search, UserRound, MapPin, Phone, Building2 } from 'lucide-react'

export type ServiceArea = {
  id: string
  state: string
  city: string
  is_active: boolean
}

export type LocksmithRow = {
  id: string
  user_id: string
  first_name: string
  last_name: string
  phone: string
  business_name: string | null
  status: string
  created_at: string
  locksmith_service_areas: {
    service_areas: ServiceArea | null
  }[] | null
  locksmith_service_types: {
    service_type: string
  }[] | null
}

const statusLabels: Record<string, string> = {
  active: 'Activo',
  inactive: 'Inactivo',
  suspended: 'Suspendido',
}

const serviceTypeLabels: Record<string, string> = {
  domestico: 'Doméstica',
  automotriz: 'Automotriz',
  comercial: 'Comercial',
}

export default function LocksmithsDashboardClient({
  locksmiths,
  areas,
}: {
  locksmiths: LocksmithRow[]
  areas: ServiceArea[]
}) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()

    return locksmiths.filter((locksmith) => {
      const branchesText = (locksmith.locksmith_service_types ?? [])
        .map(item => serviceTypeLabels[item.service_type] ?? item.service_type)
        .join(' ')
        .toLowerCase()

      const areasText = (locksmith.locksmith_service_areas ?? [])
        .map((item) => item.service_areas ? `${item.service_areas.state} ${item.service_areas.city}` : '')
        .join(' ')
        .toLowerCase()

      const text = `${locksmith.first_name} ${locksmith.last_name} ${locksmith.phone} ${locksmith.business_name ?? ''} ${areasText} ${branchesText}`.toLowerCase()

      return (!term || text.includes(term)) && (status === 'all' || locksmith.status === status)
    })
  }, [locksmiths, search, status])

  const counts = {
    total: locksmiths.length,
    active: locksmiths.filter(x => x.status === 'active').length,
    inactive: locksmiths.filter(x => x.status === 'inactive').length,
    suspended: locksmiths.filter(x => x.status === 'suspended').length,
  }

  return (
    <>
      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Total', counts.total],
          ['Activos', counts.active],
          ['Inactivos', counts.inactive],
          ['Suspendidos', counts.suspended],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-2xl border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-bold">{value}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px_auto]">
          <label className="relative block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar nombre, teléfono, negocio o ciudad..."
              className="w-full rounded-xl border bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#E53E3E]/40"
            />
          </label>

          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="rounded-xl border bg-background px-3 py-2.5 text-sm outline-none"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
            <option value="suspended">Suspendidos</option>
          </select>

          <div className="self-center text-xs text-muted-foreground">
            {filtered.length} de {locksmiths.length}
          </div>
        </div>
      </section>

      <section className="mt-8 space-y-4">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border bg-card p-10 text-center shadow-sm">
            <UserRound className="mx-auto h-10 w-10 text-muted-foreground" />
            <h2 className="mt-4 font-bold">No hay cerrajeros que coincidan</h2>
            <p className="mt-1 text-sm text-muted-foreground">Prueba con otro término o registra un nuevo cerrajero.</p>
          </div>
        ) : filtered.map(locksmith => {
          const coveredAreas = (locksmith.locksmith_service_areas ?? [])
            .map(item => item.service_areas)
            .filter((area): area is ServiceArea => Boolean(area))

          return (
            <article key={locksmith.id} className="rounded-2xl border bg-card p-5 shadow-sm">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                      locksmith.status === 'active'
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600'
                        : locksmith.status === 'suspended'
                          ? 'border-red-500/30 bg-red-500/10 text-red-600'
                          : 'border-border bg-muted text-muted-foreground'
                    }`}>
                      {statusLabels[locksmith.status] ?? locksmith.status}
                    </span>
                  </div>

                  <h2 className="mt-3 text-xl font-bold">
                    {locksmith.first_name} {locksmith.last_name}
                  </h2>

                  {locksmith.business_name && (
                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      {locksmith.business_name}
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {locksmith.phone}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {coveredAreas.length} {coveredAreas.length === 1 ? 'zona' : 'zonas'}
                    </span>
                  </div>
                </div>

                <div className="lg:max-w-xl lg:min-w-[360px]">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Zonas de trabajo</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {coveredAreas.length === 0 ? (
                      <span className="text-sm text-muted-foreground">Sin zonas asignadas</span>
                    ) : coveredAreas.map(area => (
                      <span key={area.id} className="rounded-full border bg-background px-3 py-1.5 text-xs font-medium">
                        {area.city}, {area.state}
                      </span>
                    ))}
                  </div>

                  <Link
                    href={`/dashboard/cerrajeros/${locksmith.id}`}
                    className="mt-4 inline-flex rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-muted"
                  >
                    Ver perfil
                  </Link>
                </div>
              </div>
            </article>
          )
        })}
      </section>
    </>
  )
}
