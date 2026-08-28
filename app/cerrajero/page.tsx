import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function CerrajeroDashboard() {
  // ATENCIÓN: Aquí usamos el cliente normal, NO el supabaseAdmin
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Ejecutamos la función RPC que creaste en SQL
  const { data: requests, error } = await supabase.rpc('get_my_matching_requests')

  return (
    <main className="min-h-screen p-8 text-foreground bg-background">
      <h1 className="text-3xl font-extrabold text-[#E53E3E]">PATO - Vista de Cerrajero</h1>
      <p className="mt-2 text-sm text-muted-foreground">ID de usuario: {user.id}</p>

      <div className="mt-8">
        <h2 className="text-xl font-bold">Solicitudes compatibles encontradas: {requests?.length ?? 0}</h2>
        
        {error ? (
          <div className="mt-4 p-4 bg-red-500/10 text-red-600 rounded-xl border border-red-500/30">
            Error del RPC: {error.message}
          </div>
        ) : (
          <pre className="mt-4 p-4 bg-muted rounded-xl overflow-auto text-xs font-mono border">
            {/* Esto imprimirá los datos crudos en la pantalla para que podamos analizarlos */}
            {JSON.stringify(requests, null, 2)}
          </pre>
        )}
      </div>
    </main>
  )
}