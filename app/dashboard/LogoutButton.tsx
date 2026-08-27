'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton() {
  const router = useRouter()

  const logout = async () => {
    const supabase = createClient()

    await supabase.auth.signOut()

    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={logout}
      className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-muted"
    >
      Cerrar sesión
    </button>
  )
}