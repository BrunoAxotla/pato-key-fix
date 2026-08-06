'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Wrench, Mail, Lock, ShieldCheck, Phone } from 'lucide-react'

export default function PartnerLoginPage() {
  const [emailOrPhone, setEmailOrPhone] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí conectarás con tu backend especificando el ROL de cerrajero/aliado
    console.log('Login aliado:', { emailOrPhone, password })
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Botón Volver al inicio */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-white hover:text-white/80 transition-all bg-[#E53E3E] hover:bg-[#E53E3E]/90 backdrop-blur-md px-4 py-2 rounded-full border border-[#E53E3E] shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
          <span>Volver al inicio</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 px-4">
        {/* Icono diferenciador para el técnico (Herramienta/Llave de tuercas) */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#E53E3E] border border-[#E53E3E] mb-4 shadow-lg">
          <Wrench className="w-7 h-7 text-white" />
        </div>

        <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Portal de Aliados
        </h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
          Inicia sesión para recibir solicitudes de servicio en tiempo real y gestionar tu disponibilidad.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-card/60 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl border border-border sm:px-10">

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Correo o Teléfono Registrado
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="cerrajero@ejemplo.com o 5512345678"
                  className="block w-full pl-10 pr-3 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#E53E3E]/50 focus:border-[#E53E3E] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#E53E3E]/50 focus:border-[#E53E3E] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 h-12 rounded-xl bg-[#E53E3E] hover:bg-[#E53E3E]/90 text-white font-bold text-sm transition-all active:scale-[0.99] shadow-lg shadow-[#E53E3E]/20"
            >
              Acceder al Panel de Aliado
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border/60 space-y-3 text-center">
            <p className="text-xs text-muted-foreground">
              ¿Quieres unirte como cerrajero aliado?{' '}
              <Link href="/aliados/registro" className="font-semibold text-[#E53E3E] hover:text-[#E53E3E]/80 underline underline-offset-4">
                Postula tu taller aquí
              </Link>
            </p>
            <p className="text-xs text-muted-foreground">
              ¿Buscas solicitar un servicio?{' '}
              <Link href="/login" className="font-semibold text-[#E53E3E] hover:text-[#E53E3E]/80 underline underline-offset-4">
                Acceso para Clientes
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="w-4 h-4 text-[#E53E3E]" />
          <span>Acceso restringido a personal técnico verificado</span>
        </div>
      </div>
    </div>
  )
}