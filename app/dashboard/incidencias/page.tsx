import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AlertTriangle, ArrowLeft, Clock3, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

const categoryLabels: Record<string, string> = {
  incomplete_work: 'Trabajo incompleto',
  issue_persists: 'El problema persiste',
  damage: 'Daños durante el servicio',
  price_disagreement: 'Diferencia de precio o cobro',
  other: 'Otro problema',
}

const issueStatusLabels: Record<string, string> = {
  open: 'Abierto',
  in_review: 'En revisión',
  resolved: 'Resuelto',
  dismissed: 'Descartado',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function IncidenciasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  if (user.user_metadata?.role !== 'admin') redirect('/cerrajero')

  const { data: issues, error } = await supabaseAdmin
    .from('service_request_issues')
    .select('id, service_request_id, category, details, status, reported_at, resolved_at')
    .order('reported_at', { ascending: false })

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6">
      <div className="mx-auto max-w-5xl">
        <Link href="/dashboard/solicitudes" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Volver a solicitudes
        </Link>

        <header className="mt-5 flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Reportes de problemas</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Reportes enviados por clientes que indican que el servicio necesita revisión.
            </p>
          </div>
        </header>

        {error ? (
          <section className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/5 p-5 text-sm">
            No se pudieron cargar los reportes. Verifica que la migración 008 esté aplicada.
          </section>
        ) : !issues?.length ? (
          <section className="mt-8 rounded-2xl border bg-card p-8 text-center">
            <Clock3 className="mx-auto h-8 w-8 text-muted-foreground" />
            <h2 className="mt-3 font-semibold">No hay reportes todavía</h2>
            <p className="mt-1 text-sm text-muted-foreground">Cuando un cliente reporte un problema, aparecerá aquí.</p>
          </section>
        ) : (
          <section className="mt-8 space-y-4">
            {issues.map((issue) => (
              <article key={issue.id} className="rounded-2xl border bg-card p-5 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold">{categoryLabels[issue.category] ?? issue.category}</h2>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${issue.status === 'open' ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300' : 'bg-muted text-muted-foreground'}`}>
                        {issueStatusLabels[issue.status] ?? issue.status}
                      </span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap break-words text-sm">{issue.details}</p>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Reportado: {new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(issue.reported_at))}
                    </p>
                    <p className="mt-1 break-all text-xs text-muted-foreground">Solicitud: {issue.service_request_id}</p>
                  </div>
                  <Link
                    href={`/dashboard/solicitudes/${issue.service_request_id}`}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold hover:bg-muted"
                  >
                    Abrir solicitud <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </section>
        )}

        <p className="mt-6 text-xs text-muted-foreground">
          Esta vista permite consultar reportes. Las acciones administrativas para resolver o descartar casos se añadirán en un bloque posterior.
        </p>
      </div>
    </main>
  )
}
