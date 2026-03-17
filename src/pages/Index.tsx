import SiteHeader from "@/components/SiteHeader";
import HeroBanner from "@/components/HeroBanner";
import CategoriesSection from "@/components/CategoriesSection";
import PromotionsSection from "@/components/PromotionsSection";
import BestSellersSection from "@/components/BestSellersSection";
import SiteFooter from "@/components/SiteFooter";
import WhatsAppButton from "@/components/WhatsAppButton";
import CartSidebar from "@/components/CartSidebar";
import AddedToCartModal from "@/components/AddedToCartModal";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <HeroBanner />
      <CategoriesSection />
      <PromotionsSection />
      <BestSellersSection />
      <SiteFooter />
      <WhatsAppButton />
      <CartSidebar />
      <AddedToCartModal />
    </div>
  );
};

export default Index;
