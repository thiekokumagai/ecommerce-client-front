import type { Product } from "@/data/products";
import { X } from "lucide-react";

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
  if (!product.variationGroup) return null;

  const availableOptions = product.variationGroup.options.filter((option) => option.available);

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

        <button
          type="button"
          onClick={onConfirm}
          disabled={!selectedOption || availableOptions.length === 0}
          className={`mt-6 w-full rounded-xl py-3 text-sm font-bold ${
            selectedOption && availableOptions.length > 0
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          Adicionar ao carrinho
        </button>
      </div>
    </div>
  );
};

export default ProductVariationModal;