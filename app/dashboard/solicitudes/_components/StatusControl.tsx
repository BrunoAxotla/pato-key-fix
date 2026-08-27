'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

const statuses = [
  ['pending', 'Pendiente'],
  ['notified', 'Notificado'],
  ['accepted', 'Aceptado'],
  ['assigned', 'Asignado'],
  ['in_progress', 'En progreso'],
  ['completed', 'Completado'],
  ['cancelled', 'Cancelado'],
] as const

export default function StatusControl({ requestId, currentStatus }: { requestId: string; currentStatus: string }) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const updateStatus = async (nextStatus: string) => {
    if (nextStatus === status) return
    setSaving(true)
    setError('')
    try {
      const response = await fetch(`/api/service-requests/${requestId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      const payload = await response.json()
      if (!response.ok) {
        setError(payload.error ?? 'No se pudo actualizar el estado.')
        return
      }
      setStatus(nextStatus)
      router.refresh()
    } catch {
      setError('No se pudo conectar con el servidor.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-w-[220px]">
      <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Estado</label>
      <div className="relative mt-2">
        <select value={status} onChange={(e) => updateStatus(e.target.value)} disabled={saving} className="w-full appearance-none rounded-xl border bg-card px-3 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#E53E3E]/40 disabled:opacity-60">
          {statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        {saving && <Loader2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin" />}
      </div>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  )
}