import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin' // 1. Agregas esta importación
import NewLocksmithForm from '../_components/NewLocksmithForm'

export const dynamic = 'force-dynamic'

export default async function NewLocksmithPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // 2. Usas supabaseAdmin aquí en lugar de supabase normal
  const { data: areas, error } = await supabaseAdmin
    .from('service_areas')
    .select('id, state, city, is_active')
    .eq('is_active', true)
    .order('state', { ascending: true })
    .order('city', { ascending: true })

  if (error) {
    return (
      <main className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-500/30 bg-red-500/5 p-5">
          No se pudieron cargar las zonas: {error.message}
        </div>
      </main>
    )
  }
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/dashboard/cerrajeros"
          className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a cerrajeros
        </Link>

        <div className="mt-6">
          <p className="text-sm font-semibold text-[#E53E3E]">PATO</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Alta de cerrajero</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Crea manualmente el acceso y define sus zonas de trabajo.
          </p>
        </div>

        <div className="mt-8">
          <NewLocksmithForm areas={areas ?? []} />
        </div>
      </div>
    </main>
  )
}
