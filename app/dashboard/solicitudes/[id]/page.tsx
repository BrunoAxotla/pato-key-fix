import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, Car, Clock3, Home, ImageIcon, KeyRound, MapPin, User, Wrench } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import StatusControl from '../_components/StatusControl'

export const dynamic = 'force-dynamic'

const serviceLabels: Record<string, string> = { automotriz: 'Automotriz', domestico: 'Doméstica', comercial: 'Comercial' }
const neededLabels: Record<string, string> = { apertura: 'Apertura', llave: 'Realización / duplicado de llave', programacion: 'Programación', cambio: 'Cambio / instalación', reparacion: 'Reparación', otro: 'Otro' }
const urgencyLabels: Record<string, string> = { ahora: 'Ahora', hoy: 'Hoy', programar: 'Programado' }

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export default async function ServiceRequestDetail({ params }: { params: Promise<{ id: string }> }) {
  // Validación de seguridad con getUser()
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/login')
  }

  const { id } = await params
  const { data, error } = await supabaseAdmin
    .from('service_requests')
    .select(`
      id, service_type, service_needed, wants_additional_key, urgency, schedule_date,
      description, legal_consent, status, created_at, updated_at,
      customers (first_name, last_name, phone, email),
      addresses (cp, state, municipality, neighborhood, street_number, references_text),
      vehicle_details (brand, model, year, has_key, vehicle_status, key_type),
      domestic_details (door_locked, has_available_key, lock_damaged),
      commercial_details (commercial_type),
      service_photos (id, storage_path, created_at)
    `)
    .eq('id', id)
    .single()

  if (error || !data) notFound()

  const customer = Array.isArray(data.customers) ? data.customers[0] : data.customers
  const address = Array.isArray(data.addresses) ? data.addresses[0] : data.addresses
  const vehicle = Array.isArray(data.vehicle_details) ? data.vehicle_details[0] : data.vehicle_details
  const domestic = Array.isArray(data.domestic_details) ? data.domestic_details[0] : data.domestic_details
  const commercial = Array.isArray(data.commercial_details) ? data.commercial_details[0] : data.commercial_details

  // Generar Signed URLs para las fotografías (válidas por 1 hora)
  const photosWithUrls = await Promise.all(
    (data.service_photos || []).map(async (photo: { id: string; storage_path: string }) => {
      const { data: signedUrlData } = await supabaseAdmin.storage
        .from('service-photos')
        .createSignedUrl(photo.storage_path, 3600)
        
      return {
        ...photo,
        url: signedUrlData?.signedUrl || null
      }
    })
  )

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/dashboard/solicitudes" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Volver a solicitudes
        </Link>

        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#E53E3E]">PATO</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Solicitud</h1>
            <p className="mt-2 break-all font-mono text-xs text-muted-foreground">{data.id}</p>
          </div>
          <StatusControl requestId={data.id} currentStatus={data.status} />
        </div>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-6">
            <section className="rounded-2xl border bg-card p-6 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#E53E3E]/10 px-3 py-1 text-xs font-semibold text-[#E53E3E]">{serviceLabels[data.service_type] ?? data.service_type}</span>
                <span className="rounded-full border px-3 py-1 text-xs font-medium">{neededLabels[data.service_needed] ?? data.service_needed}{data.wants_additional_key ? ' + llave' : ''}</span>
                <span className="rounded-full border px-3 py-1 text-xs font-medium">{urgencyLabels[data.urgency] ?? data.urgency}</span>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Info title="Creada" value={formatDate(data.created_at)} icon={<Clock3 className="h-4 w-4" />} />
                <Info title="Última actualización" value={formatDate(data.updated_at)} icon={<Clock3 className="h-4 w-4" />} />
              </div>
              <div className="mt-6 rounded-xl bg-muted/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Descripción</p>
                <p className="mt-2 text-sm leading-relaxed">{data.description}</p>
              </div>
            </section>

            {vehicle && (
              <section className="rounded-2xl border bg-card p-6 shadow-sm">
                <SectionTitle icon={<Car className="h-5 w-5" />} title="Información del vehículo" />
                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  <Info title="Vehículo" value={`${vehicle.brand} ${vehicle.model}`} />
                  <Info title="Año" value={String(vehicle.year)} />
                  <Info title="Tipo de llave" value={vehicle.key_type === 'presencia' ? 'Llave de presencia' : vehicle.key_type === 'tradicional' ? 'Llave normal' : 'No indicado'} icon={<KeyRound className="h-4 w-4" />} />
                  <Info title="Llave disponible" value={vehicle.has_key} />
                  <Info title="Estado del vehículo" value={vehicle.vehicle_status ?? 'No aplica'} />
                </div>
              </section>
            )}

            {domestic && (
              <section className="rounded-2xl border bg-card p-6 shadow-sm">
                <SectionTitle icon={<Home className="h-5 w-5" />} title="Información doméstica" />
                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  <Info title="Puerta cerrada con llave" value={domestic.door_locked ?? 'No indicado'} />
                  <Info title="Llave disponible" value={domestic.has_available_key ?? 'No indicado'} />
                  <Info title="Cerradura dañada" value={domestic.lock_damaged ?? 'No indicado'} />
                </div>
              </section>
            )}

            {commercial && (
              <section className="rounded-2xl border bg-card p-6 shadow-sm">
                <SectionTitle icon={<Wrench className="h-5 w-5" />} title="Información comercial" />
                <Info title="Establecimiento" value={commercial.commercial_type} />
              </section>
            )}

            <section className="rounded-2xl border bg-card p-6 shadow-sm">
              <SectionTitle icon={<ImageIcon className="h-5 w-5" />} title="Fotografías" />
              {photosWithUrls.length ? (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {photosWithUrls.map((photo) => (
                    <div key={photo.id} className="overflow-hidden rounded-xl border bg-muted/20">
                      {photo.url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img 
                          src={photo.url} 
                          alt="Fotografía del servicio" 
                          className="h-48 w-full object-cover transition-transform hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-48 items-center justify-center bg-muted">
                          <p className="text-xs text-muted-foreground">Error al cargar imagen</p>
                        </div>
                      )}
                      <div className="bg-background/50 p-2 text-center">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Foto adjunta</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="mt-4 text-sm text-muted-foreground">No hay fotografías asociadas.</p>}
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl border bg-card p-6 shadow-sm">
              <SectionTitle icon={<User className="h-5 w-5" />} title="Cliente" />
              <div className="mt-5 space-y-4">
                <Info title="Nombre" value={customer ? `${customer.first_name} ${customer.last_name}` : 'Sin cliente'} />
                <Info title="Teléfono" value={customer?.phone ?? 'Sin teléfono'} />
                <Info title="Correo" value={customer?.email ?? 'No proporcionado'} />
              </div>
            </section>

            <section className="rounded-2xl border bg-card p-6 shadow-sm">
              <SectionTitle icon={<MapPin className="h-5 w-5" />} title="Ubicación" />
              {address ? (
                <div className="mt-5 space-y-4">
                  <Info title="CP" value={address.cp} />
                  <Info title="Estado" value={address.state} />
                  <Info title="Alcaldía / Municipio" value={address.municipality} />
                  <Info title="Colonia" value={address.neighborhood} />
                  <Info title="Calle y número" value={address.street_number} />
                  <Info title="Referencias" value={address.references_text} multiline />
                </div>
              ) : <p className="mt-4 text-sm text-muted-foreground">Sin dirección registrada.</p>}
            </section>

            <section className="rounded-2xl border bg-card p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Consentimiento</p>
              <p className="mt-2 text-sm">{data.legal_consent ? 'Confirmado por el cliente.' : 'No confirmado.'}</p>
            </section>
          </div>
        </section>
      </div>
    </main>
  )
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return <h2 className="flex items-center gap-2 text-lg font-bold"><span className="text-[#E53E3E]">{icon}</span>{title}</h2>
}

function Info({ title, value, icon, multiline = false }: { title: string; value: string; icon?: React.ReactNode; multiline?: boolean }) {
  return <div><p className="flex items-center gap-1 text-xs text-muted-foreground">{icon}{title}</p><p className={`mt-1 text-sm font-medium ${multiline ? 'whitespace-pre-wrap leading-relaxed' : ''}`}>{value}</p></div>
}