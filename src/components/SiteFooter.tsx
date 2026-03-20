import { Clock, MapPin, CreditCard, BadgeDollarSign, MessageCircle } from "lucide-react";
import logo from "@/assets/logo.webp";

const SiteFooter = () => {
  return (
    <footer id="contato" className="border-t border-border bg-secondary/50">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
        <div className="rounded-2xl bg-background px-5 py-5 text-center shadow-sm">
          <h3 className="text-lg font-semibold text-foreground">Formas de pagamento aceitas</h3>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CreditCard className="h-7 w-7" />
              <span className="text-sm font-medium">Cartão</span>
            </div>
            <div className="flex items-center gap-2 text-[#32BCAD]">
              <BadgeDollarSign className="h-7 w-7" />
              <span className="text-sm font-medium">Pix</span>
            </div>
            <div className="flex items-center gap-2 text-[#2EAD4A]">
              <span className="text-3xl leading-none">💵</span>
              <span className="text-sm font-medium">Dinheiro</span>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-10 text-center md:grid-cols-2 md:text-left">
          <div className="flex flex-col items-center space-y-4 md:items-start">
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
            <a
              href="https://wa.me/5567991032937"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <MessageCircle className="h-4 w-4" />
              Fale com vendedor
            </a>
          </div>

          <div className="flex flex-col items-center space-y-4 md:items-start">
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

        <div className="mt-10 flex flex-col items-center justify-center gap-4 border-t border-border pt-8 text-center">
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