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
import { getProductById, getProductMockDetails } from "@/data/products";
import { useCart } from "@/contexts/CartContext";

const formatPrice = (price: number) => `R$ ${price.toFixed(2).replace(".", ",")}`;

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items, addToCart, updateQuantity, removeFromCart, triggerAddedModal, totalItems } = useCart();
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

  const product = useMemo(() => getProductById(Number(id)), [id]);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto flex max-w-7xl flex-col items-center px-4 py-16 text-center lg:px-8">
          <h1 className="text-2xl font-bold text-foreground">Produto não encontrado</h1>
          <Link to="/" className="mt-6 rounded-xl border border-primary px-6 py-3 text-sm font-medium text-primary">
            Voltar para a loja
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const details = getProductMockDetails(product);
  const visibleSpecs = showFullDescription ? details.specs : details.specs.slice(0, 3);
  const isNicSalt = product.category === "NicSalt";
  const nicotineOptions = product.variationGroup?.options ?? [];
  const availableNicotineOptions = nicotineOptions.filter((option) => option.available);
  const canAddToCart = !isNicSalt || nicotineStrength !== null;
  const isUnavailable = isNicSalt && availableNicotineOptions.length === 0;
  const hasNicotineOptions = nicotineOptions.length > 0;
  const productDescription = isNicSalt ? "Hortelã gelada" : details.specs[0];
  const notePlaceholder = isNicSalt
    ? "Inclua algum detalhe para este produto (opcional)"
    : "Observações";

  const selectedVariation = nicotineStrength ?? undefined;
  const cartItem = items.find(
    (item) =>
      item.product.id === product.id &&
      item.selectedVariation === selectedVariation
  );
  const isInCart = !!cartItem;
  const totalPrice = product.price * quantity;

  useEffect(() => {
    if (cartItem) {
      setQuantity(cartItem.quantity);
      return;
    }

    setQuantity(1);
  }, [cartItem]);

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
      triggerAddedModal({
        product,
        selectedVariation,
      });
      setHasJustUpdated(true);
      handleNavigateToList();
      return;
    }

    for (let i = 0; i < quantity; i += 1) {
      addToCart({
        product,
        selectedVariation,
      });
    }

    triggerAddedModal({
      product,
      selectedVariation,
    });

    setHasJustUpdated(true);
    handleNavigateToList();
  };

  const handleRemoveFromCart = () => {
    if (!cartItem) return;

    removeFromCart(product.id, selectedVariation);
    setHasJustUpdated(false);
    setQuantity(1);
  };

  const handleBackToStore = () => navigate("/");
  const handleGoBack = () => navigate(-1);
  const handleDecreaseQuantity = () => setQuantity((current) => Math.max(1, current - 1));
  const handleIncreaseQuantity = () => setQuantity((current) => current + 1);

  const primaryButtonLabel = isUnavailable
    ? "Indisponível"
    : !canAddToCart
      ? "Selecione"
      : isInCart
        ? "Atualizar"
        : "Adicionar ao Pedido";
  let mobileBottom = "pb-[77px]";
  if (totalItems > 0) {
    mobileBottom = "pb-[calc(env(safe-area-inset-bottom)+133px)]";
  } 

  return (
    <div 
      className={`min-h-screen bg-background md:pb-0 ${mobileBottom}`}>
      <div className="hidden lg:block">
        <SiteHeader />
      </div>

      <main className="mx-auto max-w-[1220px] lg:px-8 lg:py-8">
        <section className="lg:hidden">
          <ProductMobileGallery
            productName={product.name}
            images={details.gallery}
            selectedImage={selectedImage}
            onBack={handleGoBack}
            onOpenModal={() => setIsImageModalOpen(true)}
          />

          <div className="-mt-6 rounded-t-[28px] bg-background px-5 pb-8 pt-7">
            <h1 className="text-[24px] font-medium leading-tight text-[#4b4b4b]">
              {product.name}
            </h1>

            <div className="mt-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 rounded-full bg-[#f2f0ef] px-4 py-2.5">
                <button
                  type="button"
                  onClick={handleDecreaseQuantity}
                  className="text-[#7a7a7a]"
                  aria-label="Diminuir quantidade"
                >
                  <span className="text-base">−</span>
                </button>
                <span className="min-w-5 text-center text-lg text-[#5c5c5c]">{quantity}</span>
                <button
                  type="button"
                  onClick={handleIncreaseQuantity}
                  className="text-[#7a7a7a]"
                  aria-label="Aumentar quantidade"
                >
                  <span className="text-base">+</span>
                </button>
                <span className="text-sm text-[#9b9b9b]">un</span>
              </div>

              <div className="text-[20px] font-semibold text-[#5a5a5a]">
                {formatPrice(totalPrice)}
              </div>
            </div>

            <ProductInfo
              productName={product.name}
              isNicSalt={isNicSalt}
              productDescription={productDescription}
              visibleSpecs={visibleSpecs}
              allSpecs={details.specs}
              includes={details.includes}
              tag={details.tag}
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
              placeholder={notePlaceholder}
              onChange={setNote}
            />

            {isInCart && (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleRemoveFromCart}
                  className="w-full rounded-xl bg-black px-6 py-3.5 text-base font-bold text-white"
                >
                  Remover do carrinho
                </button>
              </div>
            )}

            {!isInCart && (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleBackToStore}
                  className="w-full rounded-xl border border-primary px-6 py-3 text-center text-base font-medium text-primary"
                >
                  Voltar pra loja
                </button>
              </div>
            )}

            <ProductContact />
          </div>
        </section>

        <section className="hidden lg:block">
          <div className="grid gap-8 lg:grid-cols-[540px_minmax(0,420px)] xl:justify-left">
            <ProductDesktopGallery
              productName={product.name}
              images={details.gallery}
              selectedImage={selectedImage}
              isNicSalt={false}
              onSelectImage={setSelectedImage}
              onOpenModal={() => setIsImageModalOpen(true)}
            />

            <div className="max-w-[420px] pt-16">
              <h1 className="text-[27px] font-semibold leading-[1.15] text-[#545454]">
                {product.name}
              </h1>

              <div className="mt-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 rounded-full bg-[#f2f0ef] px-5 py-2.5 text-[#666666]">
                  <button
                    type="button"
                    onClick={handleDecreaseQuantity}
                    aria-label="Diminuir quantidade"
                  >
                    <span className="text-base">−</span>
                  </button>
                  <span className="min-w-4 text-center text-lg">{quantity}</span>
                  <button
                    type="button"
                    onClick={handleIncreaseQuantity}
                    aria-label="Aumentar quantidade"
                  >
                    <span className="text-base">+</span>
                  </button>
                  <span className="text-sm text-[#979797]">un</span>
                </div>

                <div className="text-[28px] font-semibold text-[#555555]">
                  {formatPrice(totalPrice)}
                </div>
              </div>

              <ProductInfo
                productName={product.name}
                isNicSalt={isNicSalt}
                productDescription={productDescription}
                visibleSpecs={visibleSpecs}
                allSpecs={details.specs}
                includes={details.includes}
                tag={details.tag}
                nicotineOptions={nicotineOptions}
                hasNicotineOptions={hasNicotineOptions}
                nicotineStrength={nicotineStrength}
                showFullDescription={showFullDescription}
                isDesktop
                onSelectNicotine={setNicotineStrength}
                onShowMore={() => setShowFullDescription(true)}
              />

              <ProductFreightCalculator
                zipCode={zipCode}
                addressNumber={addressNumber}
                isDesktop
                isNicSalt={isNicSalt}
                onZipCodeChange={setZipCode}
                onAddressNumberChange={setAddressNumber}
              />

              <ProductNotes
                note={note}
                placeholder="Inclua algum detalhe para este produto (opcional)"
                isDesktop
                isNicSalt={isNicSalt}
                onChange={setNote}
              />

              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={handleAddOrUpdateCart}
                  disabled={!canAddToCart || isUnavailable}
                  className={`w-full rounded-lg px-6 py-3.5 text-base font-bold ${
                    !canAddToCart || isUnavailable
                      ? "bg-[#bfbfbf] text-white"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {primaryButtonLabel}
                </button>

                {isInCart ? (
                  <button
                    type="button"
                    onClick={handleRemoveFromCart}
                    className="w-full rounded-lg bg-black px-6 py-3.5 text-base font-bold text-white"
                  >
                    Remover do carrinho
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleBackToStore}
                    className="w-full rounded-lg border border-primary px-6 py-3 text-base font-medium text-primary"
                  >
                    Voltar pra loja
                  </button>
                )}
              </div>

              <ProductContact isDesktop />
            </div>
          </div>
        </section>
      </main>

      <div
        className={`fixed inset-x-0 z-[79] border-t border-border bg-background px-5 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] md:hidden ${
          totalItems > 0 ? "bottom-[calc(env(safe-area-inset-bottom)+64px)]" : "bottom-0"
        }`}
      >
        <button
          type="button"
          onClick={handleAddOrUpdateCart}
          disabled={!canAddToCart || isUnavailable}
          className={`w-full rounded-xl px-6 py-3.5 text-base font-bold ${
            !canAddToCart || isUnavailable
              ? "bg-[#c7c7c7] text-white"
              : "bg-primary text-primary-foreground"
          }`}
        >
          {primaryButtonLabel}
        </button>
      </div>

      <SiteFooter />
      <WhatsAppButton />
      <BackToTopButton />
      <CartSidebar />
      <AddedToCartModal />
      <MobileBottomNav />
      {isImageModalOpen && (
        <ProductImageModal
          images={details.gallery}
          selectedIndex={selectedImage}
          onSelect={setSelectedImage}
          onClose={() => setIsImageModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ProductPage;