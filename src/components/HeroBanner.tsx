import { motion } from "framer-motion";
import { ArrowDown, Truck, Shield, CreditCard } from "lucide-react";

const HeroBanner = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-secondary via-background to-secondary/50">
      <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 py-12 text-center md:px-8 md:py-20">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-display text-3xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl"
        >
          Sua experiência
          <br />
          <span className="text-gradient">pode mais.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-4 max-w-md text-base text-muted-foreground md:text-lg"
        >
          Os melhores pods, juices e acessórios de Campo Grande direto para você.
        </motion.p>

        <motion.a
          href="#categorias"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 flex items-center gap-2 rounded-full bg-primary px-8 py-3 font-display text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]"
        >
          Explorar Produtos
          <ArrowDown className="h-4 w-4" />
        </motion.a>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-6 md:gap-10"
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Truck className="h-5 w-5 text-primary" />
            <span>Envio para todo Brasil</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-5 w-5 text-primary" />
            <span>Produtos originais</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CreditCard className="h-5 w-5 text-primary" />
            <span>Parcele em até 3x</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroBanner;
