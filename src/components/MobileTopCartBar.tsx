import { ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const formatPrice = (price: number) => `R$ ${price.toFixed(2).replace(".", ",")}`;

const MobileTopCartBar = () => {
  const { totalPrice, setIsCartOpen } = useCart();

  return (
    <button
      type="button"
      onClick={() => setIsCartOpen(true)}
      className="fixed inset-x-0 top-0 z-[75] flex h-10 items-center justify-between bg-primary px-4 text-sm text-primary-foreground md:hidden"
    >
      <div className="flex items-center gap-2">
        <ShoppingBag className="h-4 w-4" />
        <span>Ver sacola</span>
      </div>
      <span>{formatPrice(totalPrice)}</span>
    </button>
  );
};

export default MobileTopCartBar;
