import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";

const SESSION_ADDRESS_KEY = "podemais-checkout-address";
const formatPrice = (price: number) => `R$ ${price.toFixed(2).replace(".", ",")}`;

interface StoredAddress {
  mainText: string;
  secondaryText: string;
  fullText: string;
  complement: string;
  reference: string;
  noComplement: boolean;
}

const MobileBottomNav = () => {
  const location = useLocation();
  const { totalPrice, totalItems, setIsCartOpen } = useCart();
  const [savedAddress, setSavedAddress] = useState<StoredAddress | null>(null);
  const [deliveryFee, setDeliveryFee] = useState(0);

  useEffect(() => {
    const syncAddress = async () => {
      const storedAddress = sessionStorage.getItem(SESSION_ADDRESS_KEY);
      if (!storedAddress) {
        setSavedAddress(null);
        setDeliveryFee(0);
        return;
      }

      try {
        const parsedAddress = JSON.parse(storedAddress) as StoredAddress;
        setSavedAddress(parsedAddress);

        const destination = [parsedAddress.fullText, parsedAddress.complement].filter(Boolean).join(", ");
        const { data } = await supabase.functions.invoke("calculate-freight", {
          body: { destination },
        });

        setDeliveryFee(typeof data?.freightPrice === "number" ? data.freightPrice : 0);
      } catch {
        setSavedAddress(null);
        setDeliveryFee(0);
      }
    };

    syncAddress();
    window.addEventListener("focus", syncAddress);

    return () => {
      window.removeEventListener("focus", syncAddress);
    };
  }, []);

  const isCartRouteVisible = location.pathname === "/" || location.pathname.startsWith("/produto/");

  const totalWithDelivery = totalPrice + deliveryFee;

  if (!isCartRouteVisible || totalItems === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[80] border-t border-border bg-background px-4 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-3 md:hidden">
      <div className="mx-auto flex max-w-md items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="flex w-full items-center justify-between"
        >
          <div className="min-w-0 flex-1 pr-3 text-left">
            <span className="block text-[12px] font-medium text-muted-foreground">{savedAddress ? "Total com a entrega" : "Total sem a entrega"}</span>
            <span className="truncate text-[23px] font-bold leading-tight text-foreground">
              {formatPrice(savedAddress ? totalWithDelivery : totalPrice)}
              <span className="ml-1 text-sm font-medium text-muted-foreground">/ {totalItems} {totalItems === 1 ? "item" : "itens"}</span>
            </span>
          </div>
          <div className="flex min-h-[52px] min-w-[36%] items-center justify-center rounded-[18px] bg-primary px-6 text-base font-bold text-primary-foreground">
            Ver sacola
          </div>
        </button>
      </div>
    </div>
  );

};

export default MobileBottomNav;
