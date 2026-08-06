'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, KeyRound, Mail, Lock, ShieldCheck } from 'lucide-react'

export default function ClientLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleGoogleLogin = () => {
    console.log('Iniciando sesión con Google...')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Login cliente:', { email, password })
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
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
        
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#E53E3E] border border-[#E53E3E] mb-4 shadow-lg">
          <KeyRound className="w-7 h-7 text-white" />
        </div>

        <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Solicitar un Cerrajero
        </h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
          Inicia sesión para solicitar un cerrajero de inmediato o dar seguimiento a tus servicios.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-card/60 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl border border-border sm:px-10">

          <button
            onClick={handleGoogleLogin}
            type="button"
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-border rounded-xl bg-background/80 hover:bg-muted text-foreground font-medium text-sm transition-all shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Continuar con Google
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground font-medium">
                o con tu correo
              </span>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
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
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
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
              Ingresar
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border/60 space-y-3 text-center">
            <p className="text-xs text-muted-foreground">
              ¿Aún no tienes cuenta?{' '}
              <Link href="/registro" className="font-semibold text-[#E53E3E] hover:text-[#E53E3E]/80 underline underline-offset-4">
                Regístrate aquí
              </Link>
            </p>
            <p className="text-xs text-muted-foreground">
              ¿Eres cerrajero profesional?{' '}
              <Link href="/aliados/login" className="font-semibold text-[#E53E3E] hover:text-[#E53E3E]/80 underline underline-offset-4">
                Acceso para Aliados
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="w-4 h-4 text-[#E53E3E]" />
          <span>Servicio 100% verificado y seguro</span>
        </div>
      </div>
    </div>
  )
}