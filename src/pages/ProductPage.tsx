import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import WhatsAppButton from "@/components/WhatsAppButton";
import BackToTopButton from "@/components/BackToTopButton";
import CartSidebar from "@/components/CartSidebar";
import AddedToCartModal from "@/components/AddedToCartModal";
import ProductImageModal from "@/components/ProductImageModal";
import MobileBottomNav from "@/components/MobileBottomNav";
import ProductContact from "@/components/product/ProductContact";
import ProductDesktopGallery from "@/components/product/ProductDesktopGallery";
import ProductFreightCalculator from "@/components/product/ProductFreightCalculator";
import ProductInfo from "@/components/product/ProductInfo";
import ProductMobileGallery from "@/components/product/ProductMobileGallery";
import ProductNotes from "@/components/product/ProductNotes";
import { useProducts, useProductDetail } from "@/hooks/useVendizapProducts";
import { useCart } from "@/contexts/CartContext";
import { Loader2 } from "lucide-react";

const formatPrice = (price: number) =>
  `R$ ${price.toFixed(2).replace(".", ",")}`;

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    items,
    addToCart,
    updateQuantity,
    removeFromCart,
    triggerAddedModal,
    totalItems,
  } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [zipCode, setZipCode] = useState("");
  const [addressNumber, setAddressNumber] = useState("");
  const [note, setNote] = useState("");
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [nicotineStrength, setNicotineStrength] = useState<string | null>(null);
  const [hasJustUpdated, setHasJustUpdated] = useState(false);
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: allProducts = [] } = useProducts();
  const product = useMemo(
    () => allProducts.find((p) => p.id === id),
    [allProducts, id]
  );

  const { data: productDetail } = useProductDetail(id);

  const gallery = useMemo(() => {
    if (productDetail?.imagens?.length) {
      return productDetail.imagens as string[];
    }
    return product?.image ? [product.image] : [];
  }, [productDetail, product]);

  // ❌ REMOVIDO descrição completamente
  const specs = useMemo(() => {
    if (!product) return [];
    return [
      `Categoria: ${product.category}`,
      "Design pensado para uso confortável no dia a dia",
      "Acabamento premium com foco em praticidade e desempenho",
    ];
  }, [product]);

  const includes = useMemo(() => {
    if (!product) return [];
    return [
      `1x ${product.name}`,
      "1x item principal pronto para uso",
      "1x cabo USB-C",
      "1x manual",
    ];
  }, [product]);

  const tag = product?.name.split(" ")[0]?.toLowerCase() || "";

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  if (!product && allProducts.length > 0) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto flex max-w-7xl flex-col items-center px-4 py-16 text-center lg:px-8">
          <h1 className="text-2xl font-bold">Produto não encontrado</h1>
          <Link to="/" className="mt-6 border px-6 py-3">
            Voltar para a loja
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const visibleSpecs = showFullDescription ? specs : specs.slice(0, 3);

  const isNicSalt = product.category === "NicSalt";
  const nicotineOptions = product.variationGroup?.options ?? [];
  const availableNicotineOptions = nicotineOptions.filter(
    (o) => o.available
  );

  const canAddToCart = !isNicSalt || nicotineStrength !== null;
  const isUnavailable = isNicSalt && availableNicotineOptions.length === 0;
  const hasNicotineOptions = nicotineOptions.length > 0;

  const selectedVariation = nicotineStrength ?? undefined;

  const cartItem = items.find(
    (item) =>
      item.product.id === product.id &&
      item.selectedVariation === selectedVariation
  );

  const isInCart = !!cartItem;
  const totalPrice = product.price * quantity;

  const handleNavigateToList = () => {
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
    }
    redirectTimeoutRef.current = setTimeout(() => {
      navigate("/");
    }, 1200);
  };

  const handleAddOrUpdateCart = () => {
    if (!canAddToCart || isUnavailable) return;

    if (cartItem) {
      updateQuantity(product.id, quantity, selectedVariation);
    } else {
      for (let i = 0; i < quantity; i++) {
        addToCart({ product, selectedVariation });
      }
    }

    triggerAddedModal({ product, selectedVariation });
    setHasJustUpdated(true);
    handleNavigateToList();
  };

  const handleRemoveFromCart = () => {
    if (!cartItem) return;
    removeFromCart(product.id, selectedVariation);
    setQuantity(1);
  };

  let mobileBottom = "pb-[77px]";
  if (totalItems > 0) {
    mobileBottom = "pb-[calc(env(safe-area-inset-bottom)+133px)]";
  }

  return (
    <div className={`min-h-screen ${mobileBottom}`}>
      <div className="hidden lg:block">
        <SiteHeader />
      </div>

      <main className="mx-auto max-w-[1220px] lg:px-8 lg:py-8">
        {/* MOBILE */}
        <section className="lg:hidden">
          <ProductMobileGallery
            productName={product.name}
            images={gallery}
            selectedImage={selectedImage}
            onBack={() => navigate(-1)}
            onOpenModal={() => setIsImageModalOpen(true)}
          />

          <div className="px-5 pb-8 pt-7">
            <h1 className="text-[24px] font-medium">{product.name}</h1>

            <div className="mt-6 flex justify-between">
              <div>
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>-</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity((q) => q + 1)}>+</button>
              </div>
              <div>{formatPrice(totalPrice)}</div>
            </div>

            <ProductInfo
              productName={product.name}
              productDescription={product.description}
              isNicSalt={isNicSalt}
              visibleSpecs={visibleSpecs}
              allSpecs={specs}
              includes={includes}
              tag={tag}
              nicotineOptions={nicotineOptions}
              hasNicotineOptions={hasNicotineOptions}
              nicotineStrength={nicotineStrength}
              showFullDescription={showFullDescription}
              onSelectNicotine={setNicotineStrength}
              onShowMore={() => setShowFullDescription(true)}
            />

            <ProductFreightCalculator
              zipCode={zipCode}
              addressNumber={addressNumber}
              onZipCodeChange={setZipCode}
              onAddressNumberChange={setAddressNumber}
            />

            <ProductNotes
              note={note}
              placeholder="Observações"
              onChange={setNote}
            />

            <button onClick={handleAddOrUpdateCart}>
              {isInCart ? "Atualizar" : "Adicionar ao Pedido"}
            </button>
          </div>
        </section>

        {/* DESKTOP */}
        <section className="hidden lg:block">
          <div className="grid gap-8 lg:grid-cols-2">
            <ProductDesktopGallery
              productName={product.name}
              images={gallery}
              selectedImage={selectedImage}
              isNicSalt={isNicSalt}
              onSelectImage={setSelectedImage}
              onOpenModal={() => setIsImageModalOpen(true)}
            />

            <div>
              <h1 className="text-[27px]">{product.name}</h1>

              <div className="mt-6 flex justify-between">
                <div>
                  <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>-</button>
                  <span>{quantity}</span>
                  <button onClick={() => setQuantity((q) => q + 1)}>+</button>
                </div>
                <div>{formatPrice(totalPrice)}</div>
              </div>

              <ProductInfo
                productName={product.name}
                productDescription={product.description}
                isNicSalt={isNicSalt}
                visibleSpecs={visibleSpecs}
                allSpecs={specs}
                includes={includes}
                tag={tag}
                nicotineOptions={nicotineOptions}
                hasNicotineOptions={hasNicotineOptions}
                nicotineStrength={nicotineStrength}
                showFullDescription={showFullDescription}
                isDesktop
                onSelectNicotine={setNicotineStrength}
                onShowMore={() => setShowFullDescription(true)}
              />

              <button onClick={handleAddOrUpdateCart}>
                {isInCart ? "Atualizar" : "Adicionar ao Pedido"}
              </button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
      <WhatsAppButton />
      <BackToTopButton />
      <CartSidebar />
      <AddedToCartModal />
      <MobileBottomNav />

      {isImageModalOpen && (
        <ProductImageModal
          images={gallery}
          selectedIndex={selectedImage}
          onSelect={setSelectedImage}
          onClose={() => setIsImageModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ProductPage;