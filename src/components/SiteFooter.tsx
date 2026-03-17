import { Phone, Mail, Clock, MapPin } from "lucide-react";
import logo from "@/assets/logo.webp";

const SiteFooter = () => {
  return (
    <footer id="contato" className="border-t border-border bg-secondary/50">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Pod & Mais" className="h-12 w-12 object-contain" />
              <span className="font-display text-lg font-bold text-foreground">
                Pod <span className="text-gradient">&</span> Mais
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              Campo Grande - MS
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">
              Atendimento
            </h3>
            <div className="space-y-3">
              <a href="tel:+5567991032937" className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary">
                <Phone className="h-4 w-4 shrink-0" />
                (67) 99103-2937
              </a>
              <a href="mailto:podemaiscg@gmail.com" className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary">
                <Mail className="h-4 w-4 shrink-0" />
                podemaiscg@gmail.com
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">
              Horário de Funcionamento
            </h3>
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Clock className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p>Segunda à Sábado</p>
                <p>08:00 – 12:00 | 13:00 – 20:00</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Pod & Mais. Todos os direitos reservados.
          </p>
          <a
            href="https://instagram.com/podemais.cg"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            @podemais.cg
          </a>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;