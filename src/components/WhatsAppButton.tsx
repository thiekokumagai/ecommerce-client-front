import { MessageCircle } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const WhatsAppButton = () => {
  const { totalItems } = useCart();
  const hasCartItems = totalItems > 0;

  return (
    <a
      href="https://wa.me/5567991032937"
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(142,70%,45%)] shadow-lg shadow-[hsl(142,70%,45%,0.3)] transition-all hover:scale-110 active:scale-95 md:bottom-6 md:right-6 ${
        hasCartItems ? "bottom-[calc(env(safe-area-inset-bottom)+80px)]" : "bottom-6"
      }`}
      aria-label="Fale conosco no WhatsApp"
    >
      <MessageCircle className="h-6 w-6 text-white" />
    </a>
  );
};

export default WhatsAppButton;
