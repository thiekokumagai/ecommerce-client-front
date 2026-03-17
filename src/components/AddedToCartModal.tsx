import { useCart } from "@/contexts/CartContext";
import { X } from "lucide-react";

const formatPrice = (price: number) =>
  `R$${price.toFixed(2).replace(".", ",")}`;

const AddedToCartModal = () => {
  const { lastAdded, showAddedModal, setShowAddedModal, setIsCartOpen } = useCart();

  if (!showAddedModal || !lastAdded) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/40 backdrop-blur-sm" onClick={() => setShowAddedModal(false)}>
      <div className="relative mx-4 w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => setShowAddedModal(false)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </button>

        <h3 className="text-center text-lg font-bold text-primary">
          Produto adicionado ao seu carrinho
        </h3>

        <div className="mt-4 flex items-center gap-4">
          <img src={lastAdded.product.image} alt={lastAdded.product.name} className="h-16 w-16 rounded-lg object-contain bg-secondary/30" />
          <div>
            <p className="text-sm font-medium text-foreground">{lastAdded.product.name}</p>
            {lastAdded.selectedVariation && (
              <p className="mt-1 text-xs text-muted-foreground">
                {lastAdded.product.variationGroup?.name}: {lastAdded.selectedVariation}
              </p>
            )}
            <p className="text-sm font-bold text-primary">{formatPrice(lastAdded.product.price)}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={() => {
              setShowAddedModal(false);
              setIsCartOpen(true);
            }}
            className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90"
          >
            Ir para o carrinho
          </button>
          <button
            onClick={() => setShowAddedModal(false)}
            className="w-full rounded-xl border border-border py-3 text-sm font-medium text-foreground transition-all hover:bg-secondary"
          >
            Continuar comprando
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddedToCartModal;