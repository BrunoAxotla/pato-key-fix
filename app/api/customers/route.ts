import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

type CreateCustomerBody = {
  firstName: string
  lastName: string
  email?: string
  phone: string
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateCustomerBody

    const firstName = body.firstName?.trim()
    const lastName = body.lastName?.trim()
    const email = body.email?.trim() || null
    const phone = body.phone?.trim()

    if (!firstName || !lastName || !phone) {
      return NextResponse.json(
        {
          error: 'Nombre, apellido y teléfono son obligatorios.',
        },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('customers')
      .insert({
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)

      return NextResponse.json(
        {
          error: 'No se pudo crear el cliente.',
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        customer: data,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Unexpected error:', error)

    return NextResponse.json(
      {
        error: 'Error interno del servidor.',
      },
      { status: 500 }
    )
  }
}