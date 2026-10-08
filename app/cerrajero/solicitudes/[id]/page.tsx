import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import JobStatusActions from '../../_components/JobStatusActions'
import { ArrowLeft, CheckCircle2, Phone, MapPin, Camera } from 'lucide-react'

const labels: Record<string, string> = {
  apertura: 'Apertura',
  llave: 'Realización / duplicado de llave',
  programacion: 'Programación de llave o control',
  cambio: 'Cambio / instalación',
  reparacion: 'Reparación',
  otro: 'Otro',
}
const typeName = (t: string) => t === 'automotriz'? 'Automotriz' : t === 'domestico'? 'Doméstica' : 'Comercial'

type ServicePhoto = {
  id: string
  storage_path: string | null
  created_at: string
  url: string | null
}

async function loadServicePhotos(serviceRequestId: string) {
  const { data: photoRows, error: photosError } = await supabaseAdmin
    .from('service_photos')
    .select('id, storage_path, created_at')
    .eq('service_request_id', serviceRequestId)
    .order('created_at', { ascending: true })

  if (photosError) {
    console.error('No se pudieron consultar las fotos del servicio:', photosError.message)
    return { photos: [] as ServicePhoto[], error: true }
  }

  let hasError = false
  const photos = await Promise.all(
    (photoRows ?? []).map(async (photo): Promise<ServicePhoto> => {
      if (!photo.storage_path) {
        hasError = true
        return { ...photo, url: null }
      }

      const { data, error } = await supabaseAdmin.storage
        .from('service-photos')
        .createSignedUrl(photo.storage_path, 3600)

      if (error || !data?.signedUrl) {
        hasError = true
        console.error('No se pudo generar el enlace temporal de una foto:', error?.message)
        return { ...photo, url: null }
      }

      return { ...photo, url: data.signedUrl }
    })
  )

  return { photos, error: hasError }
}

function PhotoGallery({
  photos,
  expectedCount,
  error,
  title,
}: {
  photos: ServicePhoto[]
  expectedCount?: number | null
  error: boolean
  title: string
}) {
  const photoCount = Math.max(photos.length, expectedCount ?? 0)

  return (
    <section className="mt-6 rounded-2xl border p-4">
      <h2 className="font-bold flex items-center gap-2">
        <Camera className="w-4 h-4 text-[#E53E3E]" /> {title} ({photoCount})
      </h2>
      {photos.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((photo) => (
            photo.url ? (
              <a
                key={photo.id}
                href={photo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group aspect-square overflow-hidden rounded-xl border bg-muted"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt="Fotografía del servicio"
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
              </a>
            ) : (
              <div key={photo.id} className="flex aspect-square items-center justify-center rounded-xl border bg-muted p-3 text-center text-xs text-muted-foreground">
                No se pudo generar el enlace de esta foto.
              </div>
            )
          ))}
        </div>
      )}
      {error ? (
        <p className="mt-3 text-xs text-amber-700 dark:text-amber-300">
          No se pudieron cargar las fotos. Intenta de nuevo más tarde.
        </p>
      ) : photos.length === 0 && photoCount > 0 ? (
        <p className="mt-3 text-xs text-amber-700 dark:text-amber-300">
          Hay fotos registradas, pero no se pudieron leer.
        </p>
      ) : photos.length === 0 ? (
        <p className="mt-3 text-xs text-muted-foreground">Este cliente no subió fotos.</p>
      ) : null}
    </section>
  )
}

export default async function LocksmithRequestDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if (user.user_metadata?.role!== 'locksmith') redirect('/dashboard')

  async function acceptAction() {
    'use server'
    const supabaseServer = await createClient()
    const { error } = await supabaseServer.rpc('accept_service_request', { p_request_id: id })
    if (!error) redirect(`/cerrajero/solicitudes/${id}`)
  }

  const { data: assigned } = await supabase.rpc('get_my_assigned_request', { p_request_id: id })

  if (!assigned?.length) {
    const [{ data: available }, { data: activeJobs }] = await Promise.all([
      supabase.rpc('get_my_matching_requests'),
      supabase.rpc('get_my_assigned_requests'),
    ])
    const r = available?.find((request: { service_request_id: string }) => request.service_request_id === id)
    if (!r) {
      return (
        <main className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md text-center">
            <h1 className="text-xl font-bold">Solicitud no disponible</h1>
            <Link href="/cerrajero" className="inline-flex items-center gap-2 mt-5 rounded-xl bg-[#E53E3E] px-4 py-3 text-white font-semibold"><ArrowLeft className="w-4 h-4" /> Volver</Link>
          </div>
        </main>
      )
    }
    const hasActiveJob = (activeJobs?? []).some((job: { assignment_status: string }) => ['assigned', 'in_progress'].includes(job.assignment_status))
    const { photos, error: photosError } = await loadServicePhotos(id)

    return (
      <main className="min-h-screen bg-background"><div className="max-w-3xl mx-auto p-6">
        <Link href="/cerrajero" className="inline-flex gap-2 text-sm text-muted-foreground"><ArrowLeft className="w-4 h-4" /> Volver</Link>
        <div className="mt-5 rounded-3xl border bg-card p-6">
          <p className="text-xs uppercase text-muted-foreground">{typeName(r.service_type)}</p>
          <h1 className="text-2xl font-bold mt-1">{labels[r.service_needed] || r.service_needed}</h1>
          <div className="mt-6 flex items-center gap-2 text-sm"><MapPin className="w-4 h-4 text-[#E53E3E]" />{r.municipality}, {r.state}</div>
          <p className="mt-5 text-sm text-muted-foreground">{r.description}</p>

          <PhotoGallery photos={photos} expectedCount={r.photo_count} error={photosError} title="Fotos" />

          <form action={acceptAction} className="mt-6">
            <button type="submit" disabled={hasActiveJob} className="w-full rounded-2xl bg-[#E53E3E] text-white py-4 font-bold disabled:opacity-50">{hasActiveJob? 'Ya tienes un trabajo activo' : 'Aceptar servicio'}</button>
          </form>
        </div></div></main>
    )
  }

  const job = assigned[0]
  const { photos, error: photosError } = await loadServicePhotos(job.service_request_id)

  return (
    <main className="min-h-screen bg-background"><div className="max-w-3xl mx-auto p-6">
      <Link href="/cerrajero" className="inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft className="w-4 h-4" /> Volver</Link>
      <div className="mt-5 rounded-3xl border bg-card p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-green-500/10 text-green-600 flex items-center justify-center"><CheckCircle2 className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-bold">{job.assignment_status === 'completed'? 'Servicio realizado' : job.assignment_status === 'cancelled'? 'Trabajo cancelado' : 'Servicio asignado'}</h1></div>
        </div>

        <section className="mt-6 rounded-2xl border p-4"><h2 className="font-bold">Cliente</h2><p className="mt-2">{job.first_name} {job.last_name}</p><a href={`tel:${job.phone}`} className="mt-2 flex items-center gap-2 text-sm text-[#E53E3E]"><Phone className="w-4 h-4" /> {job.phone}</a></section>
        <section className="mt-4 rounded-2xl border p-4"><h2 className="font-bold">Ubicación completa</h2><p className="mt-2 text-sm">{job.street_number}</p><p className="text-sm">{job.neighborhood}</p><p className="text-sm">{job.municipality}, {job.state}</p><p className="text-sm">CP {job.cp}</p></section>
        <section className="mt-4 rounded-2xl border p-4"><h2 className="font-bold">Servicio</h2><p className="mt-2 text-sm">{typeName(job.service_type)} · {labels[job.service_needed] || job.service_needed}</p><p className="text-sm mt-3">{job.description}</p></section>

        <PhotoGallery photos={photos} error={photosError} title="Fotos del trabajo" />

        <JobStatusActions requestId={job.service_request_id} status={job.assignment_status} />
      </div></div></main>
  )
}
