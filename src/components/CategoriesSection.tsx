import catDescartavel from "@/assets/cat-descartavel.webp";
import catLifepod from "@/assets/cat-lifepod.webp";
import catNicsalt from "@/assets/cat-nicsalt.webp";
import catResistencia from "@/assets/cat-resistencia.webp";
import catJuice from "@/assets/cat-juice.webp";
import catPodsystem from "@/assets/cat-podsystem.webp";
import catAcessorios from "@/assets/cat-acessorios.webp";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";

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
  const { selectedCategory, setSelectedCategory } = useCart();

  return (
    <section id="categorias" className="py-10 md:py-14">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
            Categorias
          </h2>
          {selectedCategory && (
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground"
            >
              Limpar filtro
            </button>
          )}
        </div>

        <div className="mt-6 flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-7 md:gap-4 md:overflow-visible">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.name;

            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => setSelectedCategory(isActive ? null : cat.name)}
                className="flex shrink-0 flex-col items-center gap-2"
              >
                <div
                  className={cn(
                    "overflow-hidden rounded-full border-2 bg-secondary p-1",
                    isActive ? "border-primary" : "border-transparent"
                  )}
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="aspect-square w-20 rounded-full object-cover md:w-24"
                  />
                </div>
                <span
                  className={cn(
                    "text-xs font-medium md:text-sm",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;