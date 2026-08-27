'use client'

import { FormEvent, useMemo, useState } from 'react'
import { Car, Home, Loader2, MapPin, ShieldCheck, Store } from 'lucide-react'
import { useRouter } from 'next/navigation'

export type NewLocksmithArea = {
  id: string
  state: string
  city: string
  is_active: boolean
}

export default function NewLocksmithForm({ areas }: { areas: NewLocksmithArea[] }) {
  const router = useRouter()
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    businessName: '',
  })
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])
  const [selectedServiceTypes, setSelectedServiceTypes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const groupedAreas = useMemo(() => {
    return areas.reduce<Record<string, NewLocksmithArea[]>>((groups, area) => {
      groups[area.state] ??= []
      groups[area.state].push(area)
      return groups
    }, {})
  }, [areas])

  const serviceTypes = [
    { value: 'domestico', label: 'Cerrajería doméstica', description: 'Casas, departamentos y cerraduras residenciales.', icon: Home },
    { value: 'automotriz', label: 'Cerrajería automotriz', description: 'Llaves, aperturas, programación y controles de vehículos.', icon: Car },
    { value: 'comercial', label: 'Cerrajería comercial', description: 'Locales, oficinas, bodegas y negocios.', icon: Store },
  ]

  const toggleServiceType = (value: string) => {
    setSelectedServiceTypes(prev =>
      prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
    )
  }

  const toggleArea = (id: string) => {
    setSelectedAreas(prev =>
      prev.includes(id) ? prev.filter(value => value !== id) : [...prev, id]
    )
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.firstName || !form.lastName || !form.email || !form.password || !form.phone) {
      setError('Completa todos los campos obligatorios.')
      return
    }

    if (form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    if (selectedServiceTypes.length === 0) {
      setError('Selecciona al menos una rama de cerrajería.')
      return
    }

    if (selectedAreas.length === 0) {
      setError('Selecciona al menos una zona de trabajo.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/locksmiths', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          phone: form.phone,
          businessName: form.businessName || null,
          serviceAreaIds: selectedAreas,
          serviceTypes: selectedServiceTypes,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error ?? 'No se pudo crear el cerrajero.')
        return
      }

      router.push('/dashboard/cerrajeros')
      router.refresh()
    } catch {
      setError('No se pudo conectar con el servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
      <section>
        <h2 className="text-lg font-bold">Datos del cerrajero</h2>
        <p className="mt-1 text-sm text-muted-foreground">Estos datos se usarán para su perfil y contacto.</p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Nombre *" value={form.firstName} onChange={value => setForm(prev => ({ ...prev, firstName: value }))} placeholder="Juan" />
          <Field label="Apellido *" value={form.lastName} onChange={value => setForm(prev => ({ ...prev, lastName: value }))} placeholder="Pérez" />
          <Field label="Correo de acceso *" type="email" value={form.email} onChange={value => setForm(prev => ({ ...prev, email: value }))} placeholder="juan@ejemplo.com" />
          <Field label="Teléfono *" type="tel" value={form.phone} onChange={value => setForm(prev => ({ ...prev, phone: value }))} placeholder="55 1234 5678" />
          <Field label="Nombre comercial" value={form.businessName} onChange={value => setForm(prev => ({ ...prev, businessName: value }))} placeholder="Cerrajería Pérez" />
          <Field label="Contraseña temporal *" type="password" value={form.password} onChange={value => setForm(prev => ({ ...prev, password: value }))} placeholder="Mínimo 8 caracteres" />
        </div>
      </section>

      <section className="border-t pt-6">
        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 h-5 w-5 text-[#E53E3E]" />
          <div>
            <h2 className="text-lg font-bold">Zonas de trabajo</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Selecciona las ciudades donde este cerrajero puede recibir solicitudes.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-5">
          {Object.entries(groupedAreas).map(([state, stateAreas]) => (
            <div key={state} className="rounded-2xl border bg-background p-4">
              <h3 className="font-semibold">{state}</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {stateAreas.map(area => {
                  const checked = selectedAreas.includes(area.id)

                  return (
                    <label
                      key={area.id}
                      className={`cursor-pointer rounded-xl border p-3 transition ${checked ? 'border-[#E53E3E] bg-[#E53E3E]/10' : 'hover:border-[#E53E3E]/50'}`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={checked}
                        onChange={() => toggleArea(area.id)}
                      />
                      <span className="font-medium text-sm">{area.city}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t pt-6">
        <div>
          <h2 className="text-lg font-bold">Ramas de cerrajería</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Define qué tipos de servicios puede recibir este cerrajero. Puede trabajar en una, dos o las tres ramas.
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {serviceTypes.map(branch => {
            const Icon = branch.icon
            const checked = selectedServiceTypes.includes(branch.value)

            return (
              <label
                key={branch.value}
                className={`cursor-pointer rounded-2xl border p-4 transition ${checked ? 'border-[#E53E3E] bg-[#E53E3E]/10 ring-1 ring-[#E53E3E]/20' : 'hover:border-[#E53E3E]/50'}`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={checked}
                  onChange={() => toggleServiceType(branch.value)}
                />
                <div className="flex items-start gap-3">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#E53E3E]" />
                  <span>
                    <span className="block text-sm font-semibold">{branch.label}</span>
                    <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{branch.description}</span>
                  </span>
                </div>
              </label>
            )
          })}
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-[#E53E3E]/20 bg-[#E53E3E]/5 p-4 text-sm text-muted-foreground">
        <div className="flex gap-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#E53E3E]" />
          <p>
            El alta es manual. PATO creará el acceso del cerrajero y lo marcará como activo de forma predeterminada.
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-[#E53E3E] py-3 text-sm font-bold text-white shadow-sm hover:bg-[#E53E3E]/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Creando cerrajero...
          </span>
        ) : 'Crear cerrajero'}
      </button>
    </form>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  type?: string
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium">{label}</span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#E53E3E]/40"
      />
    </label>
  )
}
