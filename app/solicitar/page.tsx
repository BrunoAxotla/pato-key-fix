'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, KeyRound, Mail, User, Phone, Wrench, FileText,
  ShieldCheck, MapPin, Hash, Building2, Home, Navigation, Loader2
} from 'lucide-react'

export default function ServiceRequestPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    serviceType: '',
    description: ''
  })

  const [address, setAddress] = useState({
    cp: '',
    estado: '',
    alcaldia: '',
    colonias: [] as string[],
    colonia: '',
    calleNumero: '',
    referencias: ''
  })
  
  const [loadingCp, setLoadingCp] = useState(false)

  // Optimización: Solo dispara el fetch si el CP tiene exactamente 5 dígitos
  useEffect(() => {
    if (address.cp.length !== 5) return

    const fetchCP = async () => {
      setLoadingCp(true)
      try {
        const res = await fetch(`https://api.zippopotam.us/mx/${address.cp}`)
        if (!res.ok) throw new Error('CP no encontrado')
        
        const data = await res.json()
        const places = data.places || []
        
        setAddress(prev => ({
          ...prev,
          estado: places[0]?.state || '',
          // Zippopotam no proporciona municipio/alcaldía para México.
          // Dejamos el campo libre o mantenemos lo que el usuario ya había escrito.
          alcaldia: prev.alcaldia, 
          colonias: places.map((p: any) => p['place name']),
          colonia: places.length === 1 ? places[0]['place name'] : ''
        }))
      } catch {
        // En caso de error, no borramos lo que el usuario escribió manualmente en estado/alcaldía
        setAddress(prev => ({ ...prev, colonias: [], colonia: '' }))
      } finally {
        setLoadingCp(false)
      }
    }
    
    // Pequeño retraso para evitar llamadas excesivas si pega el número muy rápido
    const timeoutId = setTimeout(() => fetchCP(), 300)
    return () => clearTimeout(timeoutId)
  }, [address.cp])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setAddress(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Solicitud completa:', { ...formData, ...address })
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">

      <div className="absolute top-6 left-6 z-10 hidden sm:block">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-white bg-[#E53E3E] px-4 py-2 rounded-full hover:bg-[#E53E3E]/90 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver al inicio
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center z-10 px-4 mt-10 sm:mt-0">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#E53E3E] mb-4 shadow-lg shadow-[#E53E3E]/20">
          <KeyRound className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight">Solicitar un Cerrajero</h2>
        <p className="mt-2 text-sm text-muted-foreground">Completa los detalles y te contactamos de inmediato.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl z-10 px-4">
        <div className="bg-card/60 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl border sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>

            {/* Nombre y Apellido */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium mb-1">Nombre</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input name="firstName" required value={formData.firstName} onChange={handleChange} placeholder="Tu nombre" className="block w-full pl-10 pr-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-[#E53E3E]/50 focus:border-[#E53E3E] outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Apellido</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input name="lastName" required value={formData.lastName} onChange={handleChange} placeholder="Tu apellido" className="block w-full pl-10 pr-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-[#E53E3E]/50 focus:border-[#E53E3E] outline-none transition-all" />
                </div>
              </div>
            </div>

            {/* Correo y Teléfono */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium mb-1">Correo</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="ejemplo@correo.com" className="block w-full pl-10 pr-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-[#E53E3E]/50 focus:border-[#E53E3E] outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Teléfono</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} placeholder="55 1234 5678" className="block w-full pl-10 pr-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-[#E53E3E]/50 focus:border-[#E53E3E] outline-none transition-all" />
                </div>
              </div>
            </div>

            {/* Tipo de servicio */}
            <div>
              <label className="block text-xs font-medium mb-1">Tipo de Servicio</label>
              <div className="relative">
                <Wrench className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <select name="serviceType" required value={formData.serviceType} onChange={handleChange} className="block w-full pl-10 pr-3 py-2.5 bg-background border border-border rounded-xl text-sm appearance-none focus:ring-2 focus:ring-[#E53E3E]/50 focus:border-[#E53E3E] outline-none transition-all">
                  <option value="" disabled>Selecciona una opción...</option>
                  <option value="automotriz">Cerrajería Automotriz</option>
                  <option value="domestico">Cerrajería Doméstica</option>
                  <option value="comercial">Cerrajería Comercial</option>
                </select>
              </div>
            </div>

            {/* DIRECCIÓN */}
            <div className="pt-6 border-t border-border/60">
              <h3 className="flex items-center gap-2 text-sm font-bold mb-4">
                <MapPin className="w-4 h-4 text-[#E53E3E]" /> ¿A dónde enviamos al cerrajero?
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-medium mb-1">CP *</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input name="cp" value={address.cp} onChange={e => handleAddressChange({ target: { name: 'cp', value: e.target.value.replace(/\D/g, '') } } as any)} maxLength={5} placeholder="03810" className="block w-full pl-10 pr-7 py-2.5 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-[#E53E3E]/50 focus:border-[#E53E3E] outline-none transition-all" />
                    {loadingCp && <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-[#E53E3E]" />}
                  </div>
                </div>
                {/* Campos liberados: Ya no son readOnly */}
                <div className="col-span-1">
                  <label className="block text-xs font-medium mb-1">Estado *</label>
                  <input name="estado" required value={address.estado} onChange={handleAddressChange} placeholder="CDMX / EdoMex" className="block w-full py-2.5 px-3 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-[#E53E3E]/50 focus:border-[#E53E3E] outline-none transition-all" />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-medium mb-1">Alcaldía / Municipio *</label>
                  <input name="alcaldia" required value={address.alcaldia} onChange={handleAddressChange} placeholder="Ej. Iztapalapa" className="block w-full py-2.5 px-3 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-[#E53E3E]/50 focus:border-[#E53E3E] outline-none transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Colonia *</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    {address.colonias.length > 0 ? (
                      <select name="colonia" required value={address.colonia} onChange={handleAddressChange} className="block w-full pl-10 pr-3 py-2.5 bg-background border border-border rounded-xl text-sm appearance-none focus:ring-2 focus:ring-[#E53E3E]/50 outline-none transition-all">
                        <option value="">Elige colonia</option>
                        {address.colonias.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    ) : (
                      // Fallback a input de texto si la API falla o no hay colonias
                      <input name="colonia" required value={address.colonia} onChange={handleAddressChange} placeholder="Nombre de tu colonia" className="block w-full pl-10 pr-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-[#E53E3E]/50 outline-none transition-all" />
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Calle y Número *</label>
                  <div className="relative">
                    <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input name="calleNumero" required value={address.calleNumero} onChange={handleAddressChange} placeholder="Av. Principal 45 Int 2" className="block w-full pl-10 pr-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-[#E53E3E]/50 outline-none transition-all" />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-medium mb-1">Referencias para llegar *</label>
                <div className="relative">
                  <Navigation className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                  <textarea name="referencias" required rows={2} value={address.referencias} onChange={handleAddressChange} placeholder="Ej. Portón negro, frente al OXXO, cerca del metro Tláhuac..." className="block w-full pl-10 pr-3 py-2.5 bg-background border border-border rounded-xl text-sm resize-none focus:ring-2 focus:ring-[#E53E3E]/50 outline-none transition-all" />
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-xs font-medium mb-1">Descripción del problema</label>
              <div className="relative">
                <FileText className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                <textarea name="description" required rows={3} value={formData.description} onChange={handleChange} placeholder="Ej. Perdí la llave de mi Jetta 2018..." className="block w-full pl-10 pr-3 py-2.5 bg-background border border-border rounded-xl text-sm resize-none focus:ring-2 focus:ring-[#E53E3E]/50 outline-none transition-all" />
              </div>
            </div>

            <button type="submit" className="w-full h-12 rounded-xl bg-[#E53E3E] hover:bg-[#E53E3E]/90 text-white font-bold text-sm shadow-lg active:scale-[0.99] transition-transform">
              Enviar Solicitud
            </button>
          </form>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground pb-8">
          <ShieldCheck className="w-4 h-4 text-[#E53E3E]" />
          <span>Tus datos están protegidos</span>
        </div>
      </div>
    </div>
  )
}