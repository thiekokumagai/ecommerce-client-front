import { Home, Package, ShoppingBag, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";

const navLinks = [
  { to: "/", label: "Home", icon: Home },
  { to: "/pedidos", label: "Pedidos", icon: Package },
  { to: "/perfil", label: "Perfil", icon: User },
];

const formatPrice = (price: number) => `R$ ${price.toFixed(2).replace(".", ",")}`;

const MobileBottomNav = () => {
  const location = useLocation();
  const { totalPrice, setIsCartOpen } = useCart();

  return (
    <div className="fixed inset-x-0 bottom-0 z-[80] md:hidden">
      <button
        type="button"
        onClick={() => setIsCartOpen(true)}
        className="flex h-10 w-full items-center justify-between bg-primary px-4 text-sm text-primary-foreground"
      >
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-4 w-4" />
          <span>Ver sacola</span>
        </div>
        <span>{formatPrice(totalPrice)}</span>
      </button>

      <nav className="border-t border-border bg-background">
        <div className="grid grid-cols-3">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;

            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2 text-xs",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default MobileBottomNav;
