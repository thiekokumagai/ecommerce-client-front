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

  const addressText = useMemo(() => {
    if (!savedAddress) return "Adicione seu endereço para calcular a entrega";
    return [savedAddress.mainText, savedAddress.secondaryText].filter(Boolean).join(", ");
  }, [savedAddress]);

  const totalWithDelivery = totalPrice + deliveryFee;

  if (!isCartRouteVisible || totalItems === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[80] border-t border-border bg-background/95 px-3 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-2 backdrop-blur md:hidden">
      <div className="mx-auto max-w-md space-y-1.5">
        <p className="truncate px-1 text-[10px] text-muted-foreground">{addressText}</p>
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="flex w-full items-center justify-between rounded-[20px] bg-background shadow-[0_-3px_14px_rgba(0,0,0,0.05)]"
        >
          <div className="flex min-w-0 flex-1 flex-col px-4 py-2.5 text-left">
            <span className="text-[11px] text-muted-foreground">Total com a entrega</span>
            <span className="truncate text-xl font-bold leading-tight text-foreground">
              {formatPrice(totalWithDelivery)}
              <span className="ml-1 text-sm font-medium text-muted-foreground">/ {totalItems} {totalItems === 1 ? "item" : "itens"}</span>
            </span>
          </div>
          <div className="m-2 flex min-h-[56px] min-w-[38%] items-center justify-center rounded-[18px] bg-primary px-5 text-base font-bold text-primary-foreground">
            Continuar
          </div>
        </button>
      </div>
    </div>
  );

};

export default MobileBottomNav;
