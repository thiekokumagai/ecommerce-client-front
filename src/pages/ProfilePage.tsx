import SiteFooter from "@/components/SiteFooter";
import CartSidebar from "@/components/CartSidebar";
import AddedToCartModal from "@/components/AddedToCartModal";
import MobileBottomNav from "@/components/MobileBottomNav";

const ProfilePage = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <main className="mx-auto max-w-3xl px-4 py-6">
        <div className="rounded-3xl border border-border bg-card p-6 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-foreground">Perfil</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Em breve você poderá acompanhar suas informações aqui.
          </p>
        </div>
      </main>
      <SiteFooter />
      <CartSidebar />
      <AddedToCartModal />
      <MobileBottomNav />
    </div>
  );
};

export default ProfilePage;
