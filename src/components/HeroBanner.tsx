import { ArrowDown, Truck, Shield, CreditCard } from "lucide-react";

const HeroBanner = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-secondary via-background to-secondary/50">
      <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 py-12 text-center md:px-8 md:py-20">
        <h1 className="font-display text-3xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl">
          Sua experiência
          <br />
          <span className="text-gradient">pod & mais.</span>
        </h1>

        <p className="mt-4 max-w-md text-base text-muted-foreground md:text-lg">
          Os melhores pods, juices e acessórios de Campo Grande direto para você.
        </p>

        <a
          href="#categorias"
          className="mt-6 flex items-center gap-2 rounded-full bg-primary px-8 py-3 font-display text-sm font-bold text-primary-foreground"
        >
          Explorar Produtos
          <ArrowDown className="h-4 w-4" />
        </a>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 md:gap-10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Truck className="h-5 w-5 text-primary" />
            <span>Envio para toda Campo Grande - MS</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-5 w-5 text-primary" />
            <span>Produtos originais</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CreditCard className="h-5 w-5 text-primary" />
            <span>Parcele em até 6x</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
