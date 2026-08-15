'use client'

import { useState } from 'react'

export default function TestServiceRequestPage() {
  const [message, setMessage] = useState('')

  const createRequest = async () => {
    setMessage('Creando solicitud...')

    const response = await fetch('/api/service-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer: {
          firstName: 'Bruno',
          lastName: 'Cliente de Prueba',
          email: 'bruno-test@example.com',
          phone: '5512345678',
        },

        service: {
          serviceType: 'automotriz',
          serviceNeeded: 'llave',
          wantsAdditionalKey: false,
          urgency: 'ahora',
          scheduleDate: '',
          description:
            'Solicitud de prueba para Nissan Versa 2018.',
        },

        vehicle: {
          vehicleBrand: 'Nissan',
          vehicleModel: 'Versa',
          vehicleYear: 2018,
          hasKey: 'no',
          vehicleStatus: 'cerrado',
          keyType: 'presencia',
        },

        domestic: null,

        commercial: null,

        address: {
          cp: '03810',
          estado: 'Ciudad de México',
          alcaldia: 'Benito Juárez',
          colonia: 'Del Valle',
          calleNumero: 'Av. de Prueba 123',
          referencias: 'Frente a un edificio de prueba.',
        },
      }),
    })

    const data = await response.json()

    console.log(data)

    if (!response.ok) {
      setMessage(`Error: ${data.error}`)
      return
    }

    setMessage(
      `Solicitud creada correctamente. ID: ${data.service_request_id}`
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md rounded-2xl border p-6">
        <h1 className="text-xl font-bold mb-4">
          Prueba de Service Request
        </h1>

        <button
          onClick={createRequest}
          className="w-full rounded-xl bg-[#E53E3E] px-4 py-3 text-white font-bold"
        >
          Crear solicitud de prueba
        </button>

        {message && (
          <p className="mt-4 text-sm">
            {message}
          </p>
        )}
      </div>
    </main>
  )
}