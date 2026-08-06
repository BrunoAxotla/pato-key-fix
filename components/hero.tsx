import Image from "next/image"
import { ShieldCheck, Clock, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section id="solicitar" className="relative overflow-hidden">
      {/* subtle red glow accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 -z-10 size-[40rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
      />

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:py-24">
        <div className="flex flex-col items-start gap-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <span className="flex size-2 animate-pulse rounded-full bg-primary" />
            Disponible 24/7 · Emergencias en minutos
          </span>

          <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            ¿Te quedaste fuera? Cerrajeros de confianza{" "}
            <span className="text-primary">24/7</span>
          </h1>

          <p className="max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Conectamos tu emergencia con cerrajeros certificados cerca de ti.
            Rápido, seguro y con cotización transparente antes de solicitar. Sin
            sorpresas, sin esperas eternas.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="h-12 bg-primary px-6 text-base text-primary-foreground hover:bg-primary/90"
              nativeButton={false}
              render={<a href="/login" />}
            >
              Solicitar Servicio Ahora
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-6 text-base"
              nativeButton={false}
              render={<a href="#servicios" />}
            >
              Ver servicios
            </Button>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <Clock className="size-4 text-primary" aria-hidden="true" />
              Llegada en 30 min o menos
            </span>
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
              Técnicos validados
            </span>
            <span className="inline-flex items-center gap-2">
              <Star className="size-4 text-primary" aria-hidden="true" />
              4.9/5 en 12,000+ servicios
            </span>
          </div>
        </div>

        <div className="relative flex justify-center lg:justify-end">
          <div className="absolute inset-0 -z-10 rounded-3xl bg-primary/10 blur-2xl" />
          <Image
            src="/app-mockup.png"
            alt="Aplicación de Pato Key Fix mostrando un cerrajero en camino con tiempo estimado de llegada y cotización"
            width={520}
            height={640}
            priority
            className="w-full max-w-md rounded-3xl border border-border/60 shadow-2xl"
          />
        </div>
      </div>
    </section>
  )
}
