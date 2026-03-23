import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { totalItems } = useCart();
  const hasCartItems = totalItems > 0;

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-foreground/80 text-background shadow-md transition-all hover:bg-foreground active:scale-95 md:bottom-6 md:right-[88px] ${
        hasCartItems ? "bottom-[calc(env(safe-area-inset-bottom)+80px+60px)]" : "bottom-[76px]"
      }`}
      aria-label="Voltar ao topo"
    >
      <ChevronUp className="h-5 w-5" />
    </button>
  );
};

export default BackToTopButton;
