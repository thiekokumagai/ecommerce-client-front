import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import WhatsAppButton from "@/components/WhatsAppButton";
import CartSidebar from "@/components/CartSidebar";
import AddedToCartModal from "@/components/AddedToCartModal";
import ProductImageModal from "@/components/ProductImageModal";
import ProductActions from "@/components/product/ProductActions";
import ProductContact from "@/components/product/ProductContact";
import ProductDesktopGallery from "@/components/product/ProductDesktopGallery";
import ProductFreightCalculator from "@/components/product/ProductFreightCalculator";
import ProductInfo from "@/components/product/ProductInfo";
import ProductMobileGallery from "@/components/product/ProductMobileGallery";
import ProductNotes from "@/components/product/ProductNotes";
import ProductStickyBar from "@/components/product/ProductStickyBar";
import { getProductById, getProductMockDetails } from "@/data/products";
import { useCart } from "@/contexts/CartContext";

const formatPrice = (price: number) => `R$ ${price.toFixed(2).replace(".", ",")}`;

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [zipCode, setZipCode] = useState("");
  const [addressNumber, setAddressNumber] = useState("");
  const [note, setNote] = useState("");
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [nicotineStrength, setNicotineStrength] = useState<string | null>(null);

  const product = useMemo(() => getProductById(Number(id)), [id]);

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

  const handleAddToCart = () => {
    if (!canAddToCart) return;

    for (let i = 0; i < quantity; i += 1) {
      addToCart({
        product,
        selectedVariation: nicotineStrength ?? undefined,
      });
    }
  };

  const handleBackToStore = () => navigate("/");
  const handleGoBack = () => navigate(-1);
  const handleDecreaseQuantity = () => setQuantity((current) => Math.max(1, current - 1));
  const handleIncreaseQuantity = () => setQuantity((current) => current + 1);

  return (
    <div className="min-h-screen bg-background pb-28 lg:pb-0">
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

            <ProductActions
              quantity={quantity}
              priceLabel={formatPrice(product.price)}
              canAddToCart={canAddToCart}
              isUnavailable={isUnavailable}
              onDecrease={handleDecreaseQuantity}
              onIncrease={handleIncreaseQuantity}
              onAddToCart={handleAddToCart}
              onBackToStore={handleBackToStore}
            />

            <ProductContact />
          </div>

          <ProductStickyBar
            canAddToCart={canAddToCart}
            isUnavailable={isUnavailable}
            onAddToCart={handleAddToCart}
          />
        </section>

        <section className="hidden lg:block">
          <div className="grid gap-8 lg:grid-cols-[540px_minmax(0,420px)] xl:justify-center">
            <ProductDesktopGallery
              productName={product.name}
              images={details.gallery}
              selectedImage={selectedImage}
              isNicSalt={isNicSalt}
              onSelectImage={setSelectedImage}
              onOpenModal={() => setIsImageModalOpen(true)}
            />

            <div className="max-w-[420px] pt-16">
              <h1 className="text-[27px] font-semibold leading-[1.15] text-[#545454]">
                {product.name}
              </h1>

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

              <ProductActions
                quantity={quantity}
                priceLabel={formatPrice(product.price)}
                canAddToCart={canAddToCart}
                isUnavailable={isUnavailable}
                isDesktop
                onDecrease={handleDecreaseQuantity}
                onIncrease={handleIncreaseQuantity}
                onAddToCart={handleAddToCart}
                onBackToStore={handleBackToStore}
              />

              <ProductContact isDesktop />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
      <div className="hidden lg:block">
        <WhatsAppButton />
      </div>
      <CartSidebar />
      <AddedToCartModal />
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