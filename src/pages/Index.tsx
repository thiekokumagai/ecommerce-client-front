import SiteHeader from "@/components/SiteHeader";
import HeroBanner from "@/components/HeroBanner";
import CategoriesSection from "@/components/CategoriesSection";
import NicotineFilter from "@/components/NicotineFilter";
import PromotionsSection from "@/components/PromotionsSection";
import AllProductsSection from "@/components/AllProductsSection";
import SiteFooter from "@/components/SiteFooter";
import { useCart } from "@/contexts/CartContext";
import { useStoreMobilePadding } from "@/hooks/use-store-mobile-padding";
import { useProducts } from "@/hooks/useVendizapProducts";

const Index = () => {
  const {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    selectedCategoryId,
    setSelectedCategory,
    selectedNicotineStrength,
    setSelectedNicotineStrength,
  } = useCart();
  const mobileBottom = useStoreMobilePadding("home");
  const { data: allProducts = [], isLoading } = useProducts(selectedCategoryId);
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const showBanner = !selectedCategory && !normalizedSearch && !selectedNicotineStrength;

  const hasResults = allProducts.some((product) => {
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
          (option) => option.available && option.label === selectedNicotineStrength
        ) ?? false
      : true;

    return hasAvailableVariations && matchesSearch && matchesNicotine;
  });

  const handleClearSearch = () => {
    setSearchTerm("");
    setSelectedCategory(null);
    setSelectedNicotineStrength(null);
  };

  return (
    <div className={`min-h-screen bg-background md:pb-0 ${mobileBottom}`}>
      <SiteHeader />
      {showBanner && <HeroBanner />}
      <CategoriesSection />
      <NicotineFilter />
      {!isLoading && !hasResults && (normalizedSearch || selectedNicotineStrength) && (
        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 text-center md:px-8">
            <h2 className="text-2xl font-bold text-foreground">Nenhum produto encontrado</h2>
            <p className="mt-2 text-muted-foreground">
              Sua busca não retornou nenhum produto altere seus filtros ou seu termo de busca
            </p>
            <button
              type="button"
              onClick={handleClearSearch}
              className="mt-6 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Limpar busca
            </button>
          </div>
        </section>
      )}
      <PromotionsSection />
      <AllProductsSection />
      <SiteFooter />
    </div>
  );
};

export default Index;
