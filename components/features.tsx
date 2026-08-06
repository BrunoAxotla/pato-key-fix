import { Zap, BadgeDollarSign, ShieldCheck } from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "Rapidez Extrema",
    description:
      "LLegada en menos de 20 minutos. Te conectamos con el cerrajero disponible más cercano a tu ubicación.",
  },
  {
    icon: BadgeDollarSign,
    title: "Precios Justos",
    description:
      "Cotización transparente antes de solicitar el servicio. Conoces el precio exacto, sin cargos ocultos ni sorpresas.",
  },
  {
    icon: ShieldCheck,
    title: "Técnicos Certificados",
    description:
      "Cerrajeros validados y asegurados. Verificamos identidad, antecedentes y experiencia de cada aliado nuestro.",
  },
]

export function Features() {
  return (
    <section id="servicios" className="border-t border-border/60 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            La forma más segura de resolver tu emergencia
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            Diseñamos cada detalle para darte tranquilidad cuando más lo
            necesitas.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-border/60 bg-card p-8 transition-colors hover:border-primary/50"
            >
              <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <feature.icon className="size-6" aria-hidden="true" />
              </span>
              <h3 className="mt-6 text-xl font-semibold text-card-foreground">
                {feature.title}
              </h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
