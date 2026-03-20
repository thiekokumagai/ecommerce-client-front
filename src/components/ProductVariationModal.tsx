import type { Product } from "@/data/products";
import { useMemo } from "react";
import { Minus, Plus, ShoppingCart, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

interface ProductVariationModalProps {
  product: Product;
  selectedOption: string | null;
  onSelect: (option: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

const ProductVariationModal = ({
  product,
  selectedOption,
  onSelect,
  onClose,
  onConfirm,
}: ProductVariationModalProps) => {
  const { items, updateQuantity, removeFromCart } = useCart();

  if (!product.variationGroup) return null;

  const availableOptions = product.variationGroup.options.filter((option) => option.available);

  const quantityInCart = useMemo(() => {
    if (!selectedOption) return 0;

    const cartItem = items.find(
      (item) =>
        item.product.id === product.id &&
        item.selectedVariation === selectedOption
    );

    return cartItem?.quantity ?? 0;
  }, [items, product.id, selectedOption]);

  const handleDecrease = () => {
    if (!selectedOption || quantityInCart === 0) return;

    if (quantityInCart === 1) {
      removeFromCart(product.id, selectedOption);
      return;
    }

    updateQuantity(product.id, quantityInCart - 1, selectedOption);
  };

  const handleIncrease = () => {
    if (!selectedOption) return;

    updateQuantity(product.id, quantityInCart + 1, selectedOption);
  };

  const handleBuy = () => {
    if (!selectedOption) return;
    onConfirm();
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
          aria-label="Fechar seleção de variação"
        >
          <X className="h-5 w-5" />
        </button>

        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Escolha a variação
        </p>
        <h3 className="mt-1 pr-8 text-lg font-bold text-foreground">{product.name}</h3>

        <div className="mt-5">
          <p className="text-sm font-medium text-foreground">{product.variationGroup.name}</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {product.variationGroup.options.map((option) => {
              const isSelected = selectedOption === option.label;

              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => option.available && onSelect(option.label)}
                  disabled={!option.available}
                  className={`rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                    option.available
                      ? isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-foreground hover:bg-secondary"
                      : "cursor-not-allowed border-border bg-muted text-muted-foreground line-through opacity-60"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {availableOptions.length === 0 && (
          <p className="mt-4 text-sm text-destructive">
            Nenhuma variação disponível no momento.
          </p>
        )}

        {quantityInCart > 0 ? (
          <div className="mt-6 flex items-center justify-between rounded-xl bg-primary px-4 py-3 text-primary-foreground">
            <button
              type="button"
              onClick={handleDecrease}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/20"
              aria-label="Diminuir quantidade"
            >
              <Minus className="h-4 w-4" />
            </button>

            <span className="text-base font-semibold">{quantityInCart}</span>

            <button
              type="button"
              onClick={handleIncrease}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/20"
              aria-label="Aumentar quantidade"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleBuy}
            disabled={!selectedOption || availableOptions.length === 0}
            className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold ${
              selectedOption && availableOptions.length > 0
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
            Comprar
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductVariationModal;