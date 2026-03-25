import { useProductDetail } from "@/hooks/useVendizapProducts";

interface CartItemImageProps {
  productId: string;
  productImage: string;
  productName: string;
  className?: string;
}

const CartItemImage = ({ productId, productImage, productName, className = "" }: CartItemImageProps) => {
  const { data: detail } = useProductDetail(productImage ? undefined : productId);
  const imageUrl = productImage || detail?.imagens?.[0] || "";

  if (!imageUrl) {
    return <div className={`bg-secondary/30 ${className}`} />;
  }

  return (
    <img
      src={imageUrl}
      alt={productName}
      className={`object-cover ${className}`}
      loading="lazy"
    />
  );
};

export default CartItemImage;
