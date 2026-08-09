'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  KeyRound, 
  Mail, 
  User, 
  Phone, 
  Wrench, 
  FileText, 
  ShieldCheck, 
  LogIn 
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Solicitud de servicio enviada:', formData)
    // Aquí iría la lógica para enviar la solicitud al backend o por correo
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Botón Volver al inicio (Izquierda) */}
      <div className="absolute top-6 left-6 z-10 hidden sm:block">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-white hover:text-white/80 transition-all bg-[#E53E3E] hover:bg-[#E53E3E]/90 backdrop-blur-md px-4 py-2 rounded-full border border-[#E53E3E] shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
          <span>Volver al inicio</span>
        </Link>
      </div>

      {/* Botón Ya tienes cuenta (Derecha) */}
      <div className="absolute top-6 right-6 z-10 hidden sm:block">
        <Link
          href="/login" // Asegúrate de que esta sea la ruta real de tu login
          className="inline-flex items-center gap-2 text-sm font-medium text-[#E53E3E] hover:text-[#E53E3E]/80 transition-all bg-[#E53E3E]/10 hover:bg-[#E53E3E]/20 backdrop-blur-md px-4 py-2 rounded-full border border-[#E53E3E]/30 shadow-sm"
        >
          <span>¿Ya tienes cuenta?</span>
          <LogIn className="w-4 h-4" />
        </Link>
      </div>

      {/* Cabecera */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center z-10 px-4 mt-10 sm:mt-0">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#E53E3E] border border-[#E53E3E] mb-4 shadow-lg">
          <KeyRound className="w-7 h-7 text-white" />
        </div>

        <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Solicitar un Cerrajero
        </h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          Para solicitar un servicio, completa este formulario con los detalles de tu problema y te contactaremos de inmediato.
        </p>
      </div>

      {/* Contenedor del Formulario (Más ancho: sm:max-w-xl) */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl z-10 px-4">
        <div className="bg-card/60 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl border border-border sm:px-10">

          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* Fila: Nombre y Apellido alineados horizontalmente */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Nombre
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Tu nombre"
                    className="block w-full pl-10 pr-3 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#E53E3E]/50 focus:border-[#E53E3E] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Apellido
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Tu apellido"
                    className="block w-full pl-10 pr-3 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#E53E3E]/50 focus:border-[#E53E3E] transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Fila: Correo y Teléfono */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ejemplo@correo.com"
                    className="block w-full pl-10 pr-3 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#E53E3E]/50 focus:border-[#E53E3E] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Número de Teléfono
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="55 1234 5678"
                    className="block w-full pl-10 pr-3 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#E53E3E]/50 focus:border-[#E53E3E] transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Lista Desplegable: Tipo de Servicio */}
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Tipo de Servicio
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Wrench className="h-4 w-4" />
                </div>
                <select
                  name="serviceType"
                  required
                  value={formData.serviceType}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#E53E3E]/50 focus:border-[#E53E3E] transition-all appearance-none"
                >
                  <option value="" disabled>Selecciona una opción...</option>
                  <option value="automotriz">Cerrajeria Automotriz (Llaves, controles, ignición)</option>
                  <option value="domestico">Cerrajeria Doméstica (Casas, candados, chapas)</option>
                  <option value="comercial">Cerrajeria Comercial (Negocios, cajas fuertes)</option>
                </select>
                {/* Icono de flecha personalizado para el select */}
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-muted-foreground">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Campo de Texto Libre: Descripción */}
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Descripción del problema
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 flex items-start pointer-events-none text-muted-foreground">
                  <FileText className="h-4 w-4" />
                </div>
                <textarea
                  name="description"
                  required
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Ej. Perdí la llave de mi Jetta 2018 y necesito un duplicado..."
                  className="block w-full pl-10 pr-3 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#E53E3E]/50 focus:border-[#E53E3E] transition-all resize-none"
                />
              </div>
            </div>

            {/* Botón Enviar */}
            <button
              type="submit"
              className="w-full mt-4 h-12 rounded-xl bg-[#E53E3E] hover:bg-[#E53E3E]/90 text-white font-bold text-sm transition-all active:scale-[0.99] shadow-lg shadow-[#E53E3E]/20"
            >
              Enviar Solicitud de Servicio
            </button>
          </form>
          
          {/* Versión móvil de los botones de navegación (solo se muestran en pantallas pequeñas) */}
          <div className="mt-6 pt-6 border-t border-border/60 space-y-3 text-center sm:hidden">
            <p className="text-xs text-muted-foreground">
              <Link href="/login" className="font-semibold text-[#E53E3E] hover:text-[#E53E3E]/80 underline underline-offset-4">
                ¿Ya tienes una cuenta? Inicia sesión
              </Link>
            </p>
            <p className="text-xs text-muted-foreground">
              <Link href="/" className="font-semibold text-foreground hover:text-foreground/80 underline underline-offset-4">
                Volver al inicio
              </Link>
            </p>
          </div>

        </div>

        {/* Banner de Confianza */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground pb-8">
          <ShieldCheck className="w-4 h-4 text-[#E53E3E]" />
          <span>Tus datos están protegidos y solo se usan para tu servicio</span>
        </div>
      </div>
    </div>
  )
}