import { MapPin, ReceiptText, KeyRound } from "lucide-react"

const steps = [
  {
    icon: MapPin,
    title: "Indica tu ubicación",
    description:
      "Comparte tu dirección y el tipo de cerradura. Encontramos al cerrajero certificado más cercano al instante.",
  },
  {
    icon: ReceiptText,
    title: "Cotiza el servicio",
    description:
      "Recibes una cotización clara y transparente. Apruebas el precio antes de que nadie se ponga en marcha.",
  },
  {
    icon: KeyRound,
    title: "El cerrajero llega a resolverlo",
    description:
      "Tu técnico llega en minutos, resuelve la emergencia y tú sigues con tu día. Pago seguro dentro de la app.",
  },
]

export function HowItWorks() {
  return (
    <section id="como-funciona" className="border-t border-border/60 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Cómo funciona
          </span>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Tres pasos para volver a entrar
          </h2>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title} className="relative flex flex-col items-start">
              <div className="flex items-center gap-4">
                <span className="flex size-12 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-lg font-bold text-primary">
                  {index + 1}
                </span>
                <step.icon className="size-7 text-foreground" aria-hidden="true" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
