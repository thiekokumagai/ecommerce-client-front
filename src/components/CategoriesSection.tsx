import { motion } from "framer-motion";
import catDescartavel from "@/assets/cat-descartavel.webp";
import catLifepod from "@/assets/cat-lifepod.webp";
import catNicsalt from "@/assets/cat-nicsalt.webp";
import catResistencia from "@/assets/cat-resistencia.webp";
import catJuice from "@/assets/cat-juice.webp";
import catPodsystem from "@/assets/cat-podsystem.webp";
import catAcessorios from "@/assets/cat-acessorios.webp";

const categories = [
  { name: "Descartável", image: catDescartavel },
  { name: "Life Pod", image: catLifepod },
  { name: "NicSalt", image: catNicsalt },
  { name: "Resistência", image: catResistencia },
  { name: "Juice", image: catJuice },
  { name: "Pod System", image: catPodsystem },
  { name: "Acessórios", image: catAcessorios },
];

const CategoriesSection = () => {
  return (
    <section id="categorias" className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
          Categorias
        </h2>
        <div className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-7 md:gap-4">
          {categories.map((cat, i) => (
            <motion.a
              key={cat.name}
              href="#"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="group flex flex-col items-center gap-3"
            >
              <div className="overflow-hidden rounded-2xl border border-border bg-card transition-all duration-200 group-hover:border-primary/40 group-hover:shadow-lg group-hover:shadow-primary/5">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <span className="text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground md:text-sm">
                {cat.name}
              </span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
