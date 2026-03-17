import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
interface ProductCardProps {
  product: Product;
  index: number;
}

const formatPrice = (price: number) =>
  `R$${price.toFixed(2).replace(".", ",")}`;

const ProductCard = ({ product, index }: ProductCardProps) => {
  const { addToCart } = useCart();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl  transition-all duration-200 hover:-translate-y-1 "
    >
      {product.isPromo && product.oldPrice && (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
          -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
        </span>
      )}

      <div className="relative overflow-hidden bg-secondary/30 p-4 pb-0 ">
        <img
          src={product.image}
          alt={product.name}
          className="mx-auto aspect-square w-full object-contain rounded-sm"
          loading="lazy"
        />
      </div>

      <div className="flex flex-1 flex-col justify-between gap-2 p-4 pt-2">
        <div>
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {product.category}
          </span>
          <h3 className="mt-1 line-clamp-2 text-sm font-medium leading-snug text-foreground">
            {product.name}
          </h3>
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
          onClick={() => addToCart(product)}
          className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary/90 active:scale-[0.98]"
        >
          <ShoppingCart className="h-4 w-4" />
          Comprar
        </button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
