import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@/data/products";

interface ProductCardProps {
  product: Product;
  index: number;
}

const ProductCard = ({ product, index }: ProductCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
    >
      {product.isPromo && (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-brand-gradient px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
          Promo
        </span>
      )}

      <div className="relative overflow-hidden bg-secondary/50 p-4">
        <img
          src={product.image}
          alt={product.name}
          className="mx-auto aspect-square w-full max-w-[180px] object-contain transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      <div className="flex flex-1 flex-col justify-between gap-3 p-4">
        <div>
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {product.category}
          </span>
          <h3 className="mt-1 line-clamp-2 text-sm font-medium leading-snug text-foreground">
            {product.name}
          </h3>
        </div>

        <button className="flex items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:opacity-90 active:scale-[0.98]">
          <ShoppingCart className="h-4 w-4" />
          Comprar
        </button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
