import { promoProducts } from "@/data/products";
import ProductCard from "./ProductCard";
import { Flame } from "lucide-react";

const PromotionsSection = () => {
  return (
    <section id="promocoes" className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex items-center gap-3">
          <Flame className="h-6 w-6 text-primary" />
          <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
            Promoções
          </h2>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4">
          {promoProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromotionsSection;
