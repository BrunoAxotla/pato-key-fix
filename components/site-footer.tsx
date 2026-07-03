import { KeyRound } from "lucide-react"

const footerLinks = [
  {
    title: "Servicio",
    links: [
      { label: "Apertura de puertas", href: "#servicios" },
      { label: "Cambio de cerraduras", href: "#servicios" },
      { label: "Cerrajería automotriz", href: "#servicios" },
      { label: "Emergencias 24/7", href: "#solicitar" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Cómo funciona", href: "#como-funciona" },
      { label: "Para Cerrajeros", href: "#cerrajeros" },
      { label: "Sobre nosotros", href: "#" },
      { label: "Contacto", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Términos y condiciones", href: "#" },
      { label: "Aviso de privacidad", href: "#" },
      { label: "Cookies", href: "#" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-4">
          <div>
            <a href="#" className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <KeyRound className="size-5" aria-hidden="true" />
              </span>
              <span className="text-lg font-semibold tracking-tight text-foreground">
                Pato Key Fix
              </span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Cerrajeros de confianza, disponibles 24/7. Resolvemos tu
              emergencia en minutos.
            </p>
          </div>

          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="text-sm font-semibold text-foreground">
                {group.title}
              </h4>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Pato Key Fix. Todos los derechos
            reservados.
          </p>
          <p className="text-sm text-muted-foreground">
            Hecho con cuidado para tus emergencias.
          </p>
        </div>
      </div>
    </footer>
  )
}
