import { MessageCircle } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useLocation } from "react-router-dom";

const WhatsAppButton = () => {
  const { totalItems } = useCart();
  const location = useLocation();
  const hasCartItems = totalItems > 0;
  const isProductPage = location.pathname.startsWith("/produto/");

  // On product page mobile: sticky "Adicionar" bar (~60px) + if cart items, bottom nav (~64px)
  // On home mobile: if cart items, bottom nav (~64px)
  let mobileBottom = "bottom-6";
  if (isProductPage && hasCartItems) {
    mobileBottom = "bottom-[calc(env(safe-area-inset-bottom)+140px)]";
  } else if (isProductPage) {
    mobileBottom = "bottom-[calc(env(safe-area-inset-bottom)+72px)]";
  } else if (hasCartItems) {
    mobileBottom = "bottom-[calc(env(safe-area-inset-bottom)+80px)]";
  }

  return (
    <a
      href="https://wa.me/5567991032937"
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(142,70%,45%)] shadow-lg shadow-[hsl(142,70%,45%,0.3)] transition-all hover:scale-110 active:scale-95 md:bottom-6 md:right-6 ${mobileBottom}`}
      aria-label="Fale conosco no WhatsApp"
    >
      <MessageCircle className="h-5 w-5 text-white" />
    </a>
  );
};

export default WhatsAppButton;
