import { Star, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const reviews = [
  {
    name: "Mariana López",
    location: "Ciudad de México",
    quote:
      "Me quedé fuera de casa a medianoche con mi bebé. En 15 minutos llegó un cerrajero amable y profesional. La cotización fue exactamente la prometida.",
  },
  {
    name: "Carlos Méndez",
    location: "Guadalajara",
    quote:
      "Perdí las llaves del coche en el estacionamiento. La app me mostró el precio antes y el técnico resolvió todo sin dañar la cerradura. Excelente.",
  },
  {
    name: "Andrea Ruiz",
    location: "Monterrey",
    quote:
      "Lo mejor es la transparencia. Ver al cerrajero acercarse en el mapa y saber el costo exacto me dio muchísima tranquilidad.",
  },
]

export function SocialProof() {
  return (
    <section className="border-t border-border/60 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Miles de personas ya confían en Pato Key Fix
          </h2>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="size-5 fill-primary text-primary"
                  aria-hidden="true"
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              4.9/5 basado en más de 12,000 servicios
            </span>
          </div>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {reviews.map((review) => (
            <figure
              key={review.name}
              className="flex flex-col rounded-2xl border border-border/60 bg-card p-7"
            >
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="size-4 fill-primary text-primary"
                    aria-hidden="true"
                  />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 leading-relaxed text-card-foreground">
                {`"${review.quote}"`}
              </blockquote>
              <figcaption className="mt-6">
                <span className="block font-semibold text-foreground">
                  {review.name}
                </span>
                <span className="text-sm text-muted-foreground">
                  {review.location}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* Locksmith recruitment banner */}
        <div
          id="cerrajeros"
          className="mt-16 overflow-hidden rounded-3xl border border-primary/30 bg-primary/10 p-8 sm:p-12"
        >
          <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h3 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Únete como cerrajero aliado
              </h3>
              <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
                Recibe solicitudes de clientes cerca de ti, define tu
                disponibilidad y haz crecer tu negocio con pagos seguros y
                garantizados. Sin cuotas de inscripción.
              </p>
            </div>
            <Button
              size="lg"
              className="h-12 shrink-0 bg-primary px-6 text-base text-primary-foreground hover:bg-primary/90"
              nativeButton={false}
              render={<a href="/aliados/login" />}
            >
              Quiero ser aliado
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
