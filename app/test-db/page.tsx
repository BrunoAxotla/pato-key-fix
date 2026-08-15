'use client'

import { useState } from 'react'

export default function TestCustomerPage() {
  const [message, setMessage] = useState('')

  const createCustomer = async () => {
    setMessage('Creando cliente...')

    const response = await fetch('/api/customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: 'Bruno',
        lastName: 'Prueba',
        email: 'prueba@example.com',
        phone: '5512345678',
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      setMessage(`Error: ${data.error}`)
      return
    }

    setMessage(
      `Cliente creado correctamente. ID: ${data.customer.id}`
    )

    console.log(data)
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md rounded-2xl border p-6">
        <h1 className="text-xl font-bold mb-4">
          Prueba de API
        </h1>

        <button
          onClick={createCustomer}
          className="w-full rounded-xl bg-[#E53E3E] px-4 py-3 text-white font-bold"
        >
          Crear cliente de prueba
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