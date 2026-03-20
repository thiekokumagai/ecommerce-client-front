import { useState } from "react";
import { bestSellers } from "@/data/products";
import ProductCard from "./ProductCard";
import { TrendingUp } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const BestSellersSection = () => {
  const [showAll, setShowAll] = useState(false);
  const { selectedCategory, searchTerm, selectedNicotineStrength } = useCart();
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredProducts = bestSellers.filter((product) => {
    const hasAvailableVariations = product.variationGroup
      ? product.variationGroup.options.some((option) => option.available)
      : true;
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    const matchesSearch = normalizedSearch
      ? product.name.toLowerCase().includes(normalizedSearch) ||
        product.description.toLowerCase().includes(normalizedSearch) ||
        product.category.toLowerCase().includes(normalizedSearch)
      : true;
    const matchesNicotine = selectedNicotineStrength
      ? product.variationGroup?.options.some(
          (option) => option.available && option.label === selectedNicotineStrength
        ) ?? false
      : true;

    return hasAvailableVariations && matchesCategory && matchesSearch && matchesNicotine;
  });

  if (selectedCategory && filteredProducts.length === 0) return null;
  if (normalizedSearch && filteredProducts.length === 0) return null;
  if (selectedNicotineStrength && filteredProducts.length === 0) return null;
  if (!selectedCategory && !normalizedSearch && !selectedNicotineStrength && filteredProducts.length === 0) return null;

  const visible = showAll || normalizedSearch || selectedNicotineStrength ? filteredProducts : filteredProducts.slice(0, 8);

  return (
    <section id="produtos" className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
              {normalizedSearch || selectedNicotineStrength ? "Resultados encontrados" : "Mais Vendidos"}
            </h2>
          </div>
          {!normalizedSearch && !selectedNicotineStrength && filteredProducts.length > 8 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-sm font-medium text-primary"
            >
              {showAll ? "Ver menos" : "Ver todos"}
            </button>
          )}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4">
          {visible.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BestSellersSection;