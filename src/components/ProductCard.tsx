import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import ProductVariationModal from "@/components/ProductVariationModal";

interface ProductCardProps {
  product: Product;
  index: number;
}

const formatPrice = (price: number) =>
  `R$${price.toFixed(2).replace(".", ",")}`;

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const [selectedVariation, setSelectedVariation] = useState<string | null>(null);
  const [showVariationModal, setShowVariationModal] = useState(false);

  const handleBuy = () => {
    if (product.variationGroup) {
      setShowVariationModal(true);
      return;
    }

    addToCart(product);
  };

  const handleConfirmVariation = () => {
    if (!selectedVariation) return;

    addToCart(product);
    setShowVariationModal(false);
  };

  return (
    <>
      <div className="group relative flex flex-col overflow-hidden rounded-2xl">
        {product.isPromo && product.oldPrice && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
            -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
          </span>
        )}

        <Link to={`/produto/${product.id}`} className="block">
          <div className="relative overflow-hidden bg-secondary/30 p-4 pb-0">
            <img
              src={product.image}
              alt={product.name}
              className="mx-auto aspect-square w-full rounded-sm object-contain"
              loading="lazy"
            />
          </div>
        </Link>

        <div className="flex flex-1 flex-col justify-between gap-2 p-4 pt-2">
          <div>
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {product.category}
            </span>
            <Link to={`/produto/${product.id}`} className="block">
              <h3 className="mt-1 line-clamp-2 text-sm font-medium leading-snug text-foreground">
                {product.name}
              </h3>
            </Link>

            {product.variationGroup && (
              <div className="mt-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {product.variationGroup.name}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.variationGroup.options.map((option) => (
                    <span
                      key={option}
                      className="rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-foreground"
                    >
                      {option}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-1">
            {product.oldPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.oldPrice)}
              </span>
            )}
            <p className="text-lg font-bold text-primary">
              {formatPrice(product.price)}
            </p>
          </div>

          <button
            type="button"
            onClick={handleBuy}
            className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            <ShoppingCart className="h-4 w-4" />
            {product.variationGroup ? "Escolher opção" : "Comprar"}
          </button>
        </div>
      </div>

      {showVariationModal && (
        <ProductVariationModal
          product={product}
          selectedOption={selectedVariation}
          onSelect={setSelectedVariation}
          onClose={() => setShowVariationModal(false)}
          onConfirm={handleConfirmVariation}
        />
      )}
    </>
  );
};

export default ProductCard;