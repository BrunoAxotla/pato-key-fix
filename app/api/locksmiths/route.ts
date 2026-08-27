import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const auth = await createClient()
  const { data: { user: currentUser } } = await auth.auth.getUser()

  if (!currentUser) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  try {
    const body = await request.json()

    const firstName = String(body.firstName ?? '').trim()
    const lastName = String(body.lastName ?? '').trim()
    const email = String(body.email ?? '').trim().toLowerCase()
    const password = String(body.password ?? '')
    const phone = String(body.phone ?? '').trim()
    const businessName = body.businessName ? String(body.businessName).trim() : null
    const serviceAreaIds = Array.isArray(body.serviceAreaIds) 
  ? body.serviceAreaIds.filter((id: unknown): id is string => typeof id === 'string') 
  : []

    const serviceTypes = Array.isArray(body.serviceTypes) 
    ? body.serviceTypes.filter((type: unknown): type is string => typeof type === 'string') 
    : []

    if (!firstName || !lastName || !email || !password || !phone) {
      return NextResponse.json({ error: 'Faltan campos obligatorios.' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres.' }, { status: 400 })
    }

    if (serviceAreaIds.length === 0) {
      return NextResponse.json({ error: 'Debes asignar al menos una zona de trabajo.' }, { status: 400 })
    }

   // Le decimos explícitamente que es un Set de textos
    const allowedServiceTypes = new Set<string>(['domestico', 'automotriz', 'comercial'])
    
    // Le decimos explícitamente que el resultado será un arreglo de textos
    const normalizedServiceTypes: string[] = Array.from(new Set<string>(serviceTypes))

    if (normalizedServiceTypes.length === 0) {
      return NextResponse.json({ error: 'Debes asignar al menos una rama de cerrajería.' }, { status: 400 })
    }

    // Ahora TypeScript sabe 100% que "type" es un string
    if (normalizedServiceTypes.some((type: string) => !allowedServiceTypes.has(type))) {
      return NextResponse.json({ error: 'Una o más ramas de cerrajería no son válidas.' }, { status: 400 })
    }

    const { data: selectedAreas, error: areasError } = await supabaseAdmin
      .from('service_areas')
      .select('id')
      .in('id', serviceAreaIds)
      .eq('is_active', true)

    if (areasError) {
      console.error(areasError)
      return NextResponse.json({ error: 'No se pudieron validar las zonas.' }, { status: 500 })
    }

    if ((selectedAreas?.length ?? 0) !== new Set(serviceAreaIds).size) {
      return NextResponse.json({ error: 'Una o más zonas no son válidas o están inactivas.' }, { status: 400 })
    }

    // Auth + PostgreSQL no comparten una misma transacción ACID.
    // Si falla la creación del perfil o sus zonas, compensamos eliminando al usuario de Auth.
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: 'locksmith',
        first_name: firstName,
        last_name: lastName,
      },
    })

    if (authError || !authData.user) {
      console.error(authError)
      return NextResponse.json(
        { error: authError?.message ?? 'No se pudo crear la cuenta de acceso.' },
        { status: 400 }
      )
    }

    const authUserId = authData.user.id

    try {
      const { data: locksmith, error: locksmithError } = await supabaseAdmin
        .from('locksmiths')
        .insert({
          user_id: authUserId,
          first_name: firstName,
          last_name: lastName,
          phone,
          business_name: businessName,
          status: 'active',
        })
        .select('id')
        .single()

      if (locksmithError || !locksmith) {
        throw locksmithError ?? new Error('No se pudo crear el perfil de cerrajero.')
      }

      const assignments = selectedAreas!.map(area => ({
        locksmith_id: locksmith.id,
        service_area_id: area.id,
      }))

      const { error: assignmentError } = await supabaseAdmin
        .from('locksmith_service_areas')
        .insert(assignments)

      if (assignmentError) {
        throw assignmentError
      }

      const branchAssignments = normalizedServiceTypes.map(service_type => ({
        locksmith_id: locksmith.id,
        service_type,
      }))

      const { error: branchError } = await supabaseAdmin
        .from('locksmith_service_types')
        .insert(branchAssignments)

      if (branchError) {
        throw branchError
      }

      return NextResponse.json(
        {
          success: true,
          locksmithId: locksmith.id,
          userId: authUserId,
        },
        { status: 201 }
      )
    } catch (error) {
      console.error('Error creando perfil de cerrajero:', error)
      await supabaseAdmin.auth.admin.deleteUser(authUserId)

      return NextResponse.json(
        { error: 'No se pudo completar el alta del cerrajero.' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Unexpected locksmith API error:', error)
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 })
  }
}
