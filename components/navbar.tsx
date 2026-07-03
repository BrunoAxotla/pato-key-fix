"use client"

import { useState } from "react"
import { KeyRound, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const navLinks = [
  { label: "Servicios", href: "#servicios" },
  { label: "Cómo funciona", href: "#como-funciona" },
  { label: "Para Cerrajeros", href: "#cerrajeros" },
]

export function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    // Se cambia el fondo a rojo sólido y los bordes para que armonicen con el nuevo diseño
    <header className="sticky top-0 z-50 border-b border-red-700 bg-[#E53E3E]">
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Principal"
      >
        <a href="#" className="flex items-center gap-2">
          {/* El contenedor del icono ahora es blanco con el icono rojo */}
          <span className="flex size-9 items-center justify-center rounded-lg bg-white text-[#E53E3E]">
            <KeyRound className="size-5" aria-hidden="true" />
          </span>
          {/* Nombre de la marca en texto blanco nítido */}
          <span className="text-lg font-semibold tracking-tight text-white">
            Pato Key Fix
          </span>
        </a>

        {/* Links de navegación con estados hover optimizados para fondo rojo */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-red-100 transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Botón de acción principal invertido (Fondo blanco, texto rojo) para resaltar */}
        <div className="hidden md:block">
          <Button
            size="lg"
            className="bg-white text-[#E53E3E] hover:bg-red-50 font-semibold shadow-sm"
            nativeButton={false}
            render={<a href="#solicitar" />}
          >
            Pedir Cerrajero
          </Button>
        </div>

        {/* Botón de menú móvil adaptado a color blanco */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex size-9 items-center justify-center rounded-lg text-white md:hidden"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
        >
          {open ? (
            <X className="size-5" aria-hidden="true" />
          ) : (
            <Menu className="size-5" aria-hidden="true" />
          )}
        </button>
      </nav>

      {/* Menú desplegable móvil */}
      {open && (
        <div className="border-t border-red-700 bg-[#E53E3E] md:hidden">
          <div className="flex flex-col gap-1 px-4 py-4 sm:px-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-red-100 transition-colors hover:bg-red-700 hover:text-white"
              >
                {link.label}
              </a>
            ))}
            <Button
              size="lg"
              className="mt-2 w-full bg-white text-[#E53E3E] hover:bg-red-50 font-semibold"
              nativeButton={false}
              render={<a href="#solicitar" />}
            >
              Pedir Cerrajero
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}