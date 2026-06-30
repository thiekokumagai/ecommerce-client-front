import { useState, useEffect, useRef, useCallback } from "react";
import ProductCard from "./ProductCard";
import { Package } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useProducts } from "@/hooks/useProducts";

const ITEMS_PER_PAGE = 12;

const AllProductsSection = () => {
  const { selectedCategory, selectedCategoryId, searchTerm, selectedNicotineStrength } = useCart();
  const { data: allProducts = [], isLoading } = useProducts(selectedCategoryId);
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const [visibleCount, setVisibleCount] = useState(() => {
    const saved = sessionStorage.getItem("store_visible_count");
    return saved ? parseInt(saved, 10) : ITEMS_PER_PAGE;
  });
  const loaderRef = useRef<HTMLDivElement>(null);

  const prevFiltersRef = useRef({ selectedCategory, searchTerm, selectedNicotineStrength });

  const filteredProducts = allProducts
    .filter((p) => !p.isPromo)
    .filter((product) => {
      const hasAvailableVariations = product.variationGroup
        ? product.variationGroup.options.some((option) => option.available)
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

      return hasAvailableVariations && matchesSearch && matchesNicotine;
    });

  // Reset visible count ONLY when filters ACTUALLY change
  useEffect(() => {
    const prev = prevFiltersRef.current;
    if (
      prev.selectedCategory !== selectedCategory ||
      prev.searchTerm !== searchTerm ||
      prev.selectedNicotineStrength !== selectedNicotineStrength
    ) {
      setVisibleCount(ITEMS_PER_PAGE);
      sessionStorage.setItem("store_visible_count", ITEMS_PER_PAGE.toString());
      prevFiltersRef.current = { selectedCategory, searchTerm, selectedNicotineStrength };
    }
  }, [selectedCategory, searchTerm, selectedNicotineStrength]);

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => {
      const next = Math.min(prev + ITEMS_PER_PAGE, filteredProducts.length);
      sessionStorage.setItem("store_visible_count", next.toString());
      return next;
    });
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

  if (isLoading) {
    return (
      <section className="py-24 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-medium">Carregando catálogo...</p>
        </div>
      </section>
    );
  }

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
