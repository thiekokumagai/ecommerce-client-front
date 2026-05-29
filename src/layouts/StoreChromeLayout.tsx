import { useEffect } from "react";
import { Outlet } from "react-router-dom";

import AddedToCartModal from "@/components/AddedToCartModal";
import BackToTopButton from "@/components/BackToTopButton";
import CartSidebar from "@/components/CartSidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useStoreSettings } from "@/hooks/useStoreSettings";

/**
 * Chrome global da loja: carrinho, modal, navegação móvel e utilitários.
 * Mantém uma única montagem por sessão de rotas (ver SKILL.md — contexto de navegação).
 */
const StoreChromeLayout = () => {
  const { data: settings } = useStoreSettings();

  useEffect(() => {
    if (!settings) return;

    if (settings.storeName) {
      document.title = settings.storeName;
    }

    if (settings.faviconUrl) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.getElementsByTagName("head")[0].appendChild(link);
      }
      link.href = settings.faviconUrl;
    }
  }, [settings]);

  return (
    <>
      <Outlet />
      <CartSidebar />
      <AddedToCartModal />
      <MobileBottomNav />
      <WhatsAppButton />
      <BackToTopButton />
    </>
  );
};

export default StoreChromeLayout;
