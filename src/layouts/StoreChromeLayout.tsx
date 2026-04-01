import { Outlet } from "react-router-dom";

import AddedToCartModal from "@/components/AddedToCartModal";
import BackToTopButton from "@/components/BackToTopButton";
import CartSidebar from "@/components/CartSidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import WhatsAppButton from "@/components/WhatsAppButton";

/**
 * Chrome global da loja: carrinho, modal, navegação móvel e utilitários.
 * Mantém uma única montagem por sessão de rotas (ver SKILL.md — contexto de navegação).
 */
const StoreChromeLayout = () => (
  <>
    <Outlet />
    <CartSidebar />
    <AddedToCartModal />
    <MobileBottomNav />
    <WhatsAppButton />
    <BackToTopButton />
  </>
);

export default StoreChromeLayout;
