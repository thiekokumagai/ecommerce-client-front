import { useState, useEffect, useRef, useCallback } from "react";
import ProductCard from "./ProductCard";
import { Package } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useProducts } from "@/hooks/useVendizapProducts";

const ITEMS_PER_PAGE = 12;

const AllProductsSection = () => {
  const { selectedCategory, searchTerm, selectedNicotineStrength } = useCart();
  const { data: allProducts = [] } = useProducts();
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const loaderRef = useRef<HTMLDivElement>(null);

  const filteredProducts = allProducts
    .filter((p) => !p.isPromo)
    .filter((product) => {
      const hasAvailableVariations = product.variationGroup
        ? product.variationGroup.options.some((option) => option.available)
        : true;
      const matchesCategory = selectedCategory
        ? product.category === selectedCategory
        : true;
      const matchesSearch = normalizedSearch
        ? product.name.toLowerCase().includes(normalizedSearch) ||
          product.description.toLowerCase().includes(normalizedSearch) ||
          product.category.toLowerCase().includes(normalizedSearch)
        : true;
      const matchesNicotine = selectedNicotineStrength
        ? product.variationGroup?.options.some(
            (option) =>
              option.available && option.label === selectedNicotineStrength
          ) ?? false
        : true;

      return hasAvailableVariations && matchesCategory && matchesSearch && matchesNicotine;
    });

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [selectedCategory, searchTerm, selectedNicotineStrength]);

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filteredProducts.length));
  }, [filteredProducts.length]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const loader = loaderRef.current;
    if (!loader) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(loader);
    return () => observer.disconnect();
  }, [loadMore]);

  if (filteredProducts.length === 0) return null;

  const visible = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  return (
    <section id="produtos" className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex items-center gap-3">
          <Package className="h-6 w-6 text-primary" />
          <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
            {normalizedSearch || selectedNicotineStrength
              ? "Resultados encontrados"
              : selectedCategory
                ? selectedCategory
                : "Todos os Produtos"}
          </h2>
          <span className="text-sm text-muted-foreground">
            ({filteredProducts.length})
          </span>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4">
          {visible.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>

        {hasMore && (
          <div ref={loaderRef} className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        )}
      </div>
    </section>
  );
};

export default AllProductsSection;
