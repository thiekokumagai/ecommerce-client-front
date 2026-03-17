import { motion } from "framer-motion";
import { ArrowDown, Zap } from "lucide-react";

const HeroBanner = () => {
  return (
    <section className="relative overflow-hidden border-b border-border">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(0_85%_50%/0.08),transparent_60%)]" />

      <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 py-16 text-center md:px-8 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5"
        >
          <Zap className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-muted-foreground">Envio para todo o Brasil</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-6 font-display text-4xl font-bold leading-tight text-foreground md:text-6xl lg:text-7xl"
        >
          Sua experiência
          <br />
          <span className="text-gradient">pode mais.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-5 max-w-md text-base text-muted-foreground md:text-lg"
        >
          Os melhores pods, juices e acessórios de Campo Grande direto para você.
        </motion.p>

        <motion.a
          href="#categorias"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex items-center gap-2 rounded-xl bg-brand-gradient px-6 py-3 font-display text-sm font-bold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
        >
          Explorar Produtos
          <ArrowDown className="h-4 w-4" />
        </motion.a>
      </div>
    </section>
  );
};

export default HeroBanner;
