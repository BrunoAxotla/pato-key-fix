import Link from 'next/link'

import { redirect } from 'next/navigation'

import { Plus, Users } from 'lucide-react'

import { createClient } from '@/lib/supabase/server'

import { supabaseAdmin } from '@/lib/supabase/admin' // <-- Agregamos el admin client

import LocksmithsDashboardClient, { type LocksmithRow, type ServiceArea } from './_components/LocksmithsDashboardClient'



export const dynamic = 'force-dynamic'



export default async function LocksmithsDashboardPage() {

  const supabase = await createClient()

  // Usamos el cliente normal solo para validar que haya sesión activa

  const { data: { user } } = await supabase.auth.getUser()



  if (!user) redirect('/login')



  // Usamos supabaseAdmin para las consultas, saltando el RLS de forma segura en el servidor

  const [{ data: locksmiths, error: locksmithsError }, { data: areas, error: areasError }] = await Promise.all([

    supabaseAdmin

      .from('locksmiths')

      .select(`

        id,

        user_id,

        first_name,

        last_name,

        phone,

        business_name,

        status,

        created_at,

        locksmith_service_areas (

          service_areas (

            id,

            state,

            city,

            is_active

          )

        ),

        locksmith_service_types (

          service_type

        )

      `)

      .order('created_at', { ascending: false }),

    supabaseAdmin

      .from('service_areas')

      .select('id, state, city, is_active')

      .order('state', { ascending: true })

      .order('city', { ascending: true }),

  ])



  const error = locksmithsError ?? areasError





  return (

    <main className="min-h-screen bg-background text-foreground">

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <p className="text-sm font-semibold text-[#E53E3E]">PATO</p>

            <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Cerrajeros</h1>

            <p className="mt-2 text-sm text-muted-foreground">

              Administra perfiles, acceso y zonas de trabajo de los cerrajeros.

            </p>

          </div>



          <Link

            href="/dashboard/cerrajeros/nuevo"

            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E53E3E] px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#E53E3E]/90"

          >

            <Plus className="h-4 w-4" />

            Nuevo cerrajero

          </Link>

        </div>



        {error ? (

          <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/5 p-5 text-sm">

            <p className="font-semibold">No se pudo cargar el módulo de cerrajeros.</p>

            <p className="mt-1 text-muted-foreground">{error.message}</p>

          </div>

        ) : (

          <LocksmithsDashboardClient

            locksmiths={(locksmiths ?? []) as unknown as LocksmithRow[]}

            areas={(areas ?? []) as unknown as ServiceArea[]}

          />

        )}

      </div>

    </main>

  )

}