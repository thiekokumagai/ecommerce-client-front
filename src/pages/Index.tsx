import SiteHeader from "@/components/SiteHeader";
import HeroBanner from "@/components/HeroBanner";
import CategoriesSection from "@/components/CategoriesSection";
import NicotineFilter from "@/components/NicotineFilter";
import PromotionsSection from "@/components/PromotionsSection";
import BestSellersSection from "@/components/BestSellersSection";
import SiteFooter from "@/components/SiteFooter";
import WhatsAppButton from "@/components/WhatsAppButton";
import CartSidebar from "@/components/CartSidebar";
import AddedToCartModal from "@/components/AddedToCartModal";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useCart } from "@/contexts/CartContext";
import { allProducts } from "@/data/products";

const Index = () => {
  const {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedNicotineStrength,
    setSelectedNicotineStrength,
  } = useCart();
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const showBanner = !selectedCategory && !normalizedSearch && !selectedNicotineStrength;

  const hasResults = allProducts.some((product) => {
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

    return matchesSearch && matchesNicotine;
  });

  const handleClearSearch = () => {
    setSearchTerm("");
    setSelectedCategory(null);
    setSelectedNicotineStrength(null);
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <SiteHeader />
      <HeroBanner />
      <CategoriesSection />
      <NicotineFilter />
      {!hasResults && (normalizedSearch || selectedNicotineStrength) && (
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
      <BestSellersSection />
      <SiteFooter />
      <div className="hidden md:block">
        <WhatsAppButton />
      </div>
      <CartSidebar />
      <AddedToCartModal />
      <MobileBottomNav />
    </div>
  );
};

export default Index;
