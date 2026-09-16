'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function JobStatusActions({
  requestId,
  status,
}: {
  requestId: string
  status: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState<'in_progress' | 'completed' | 'cancelled' | null>(null)

  const runAction = async (action: 'in_progress' | 'completed' | 'cancelled') => {
    if (action === 'cancelled') {
      const confirmed = window.confirm(
        '¿Seguro que quieres cancelar este trabajo? La solicitud volverá a estar disponible para otros cerrajeros.'
      )
      if (!confirmed) return
    }

    if (action === 'completed') {
      const confirmed = window.confirm(
        '¿Confirmas que el servicio fue realizado? El cliente podrá confirmar después que el trabajo terminó.'
      )
      if (!confirmed) return
    }

    setLoading(action)

    const endpoint = action === 'in_progress' ? 'start' : action === 'completed' ? 'complete' : 'cancel'

    try {
      const response = await fetch(
        `/api/locksmith/service-requests/${requestId}/${endpoint}`,
        { method: 'POST' }
      )

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.error || 'No se pudo actualizar el trabajo.')
      }

      router.refresh()
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'No se pudo actualizar el trabajo.')
    } finally {
      setLoading(null)
    }
  }

  if (status === 'assigned') {
    return (
      <div className="mt-6 space-y-3">
        <button
          type="button"
          onClick={() => runAction('in_progress')}
          disabled={loading !== null}
          className="w-full rounded-2xl bg-[#E53E3E] text-white py-4 font-bold transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading === 'in_progress' ? 'Iniciando servicio...' : 'Iniciar servicio'}
        </button>

        <button
          type="button"
          onClick={() => runAction('cancelled')}
          disabled={loading !== null}
          className="w-full rounded-2xl border border-red-500/40 text-red-600 py-3 font-semibold transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading === 'cancelled' ? 'Cancelando...' : 'Cancelar trabajo'}
        </button>

        <p className="text-xs text-muted-foreground text-center">
          Puedes iniciar el servicio cuando llegues con el cliente. Si lo cancelas, la solicitud volverá a estar disponible.
        </p>
      </div>
    )
  }

  if (status === 'in_progress') {
    return (
      <div className="mt-6 space-y-3">
        <button
          type="button"
          onClick={() => runAction('completed')}
          disabled={loading !== null}
          className="w-full rounded-2xl bg-green-600 text-white py-4 font-bold transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading === 'completed' ? 'Marcando como realizado...' : 'Marcar servicio como realizado'}
        </button>

        <button
          type="button"
          onClick={() => runAction('cancelled')}
          disabled={loading !== null}
          className="w-full rounded-2xl border border-red-500/40 text-red-600 py-3 font-semibold transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading === 'cancelled' ? 'Cancelando...' : 'Cancelar trabajo'}
        </button>

        <p className="text-xs text-muted-foreground text-center">
          Al marcarlo como realizado, el cliente podrá confirmar la finalización.
        </p>
      </div>
    )
  }

  if (status === 'completed') {
    return (
      <div className="mt-6 rounded-2xl border border-green-500/30 bg-green-500/10 p-4 text-sm">
        <p className="font-semibold">Servicio marcado como realizado</p>
        <p className="mt-1 text-muted-foreground">
          Queda pendiente la confirmación final del cliente.
        </p>
      </div>
    )
  }

  if (status === 'cancelled') {
    return (
      <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
        <p className="font-semibold">Trabajo cancelado</p>
        <p className="mt-1 text-muted-foreground">
          La solicitud ya quedó disponible nuevamente para que otro cerrajero la acepte.
        </p>
      </div>
    )
  }

  return null
}
