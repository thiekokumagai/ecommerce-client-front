import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Minus,
  Plus,
  Share2,
  ChevronLeft,
  Play,
  Search,
  Truck,
  MessageCircle,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import WhatsAppButton from "@/components/WhatsAppButton";
import CartSidebar from "@/components/CartSidebar";
import AddedToCartModal from "@/components/AddedToCartModal";
import ProductImageModal from "@/components/ProductImageModal";
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
  const hasNicotineOptions = nicotineOptions.length > 0;

  const productDescription = isNicSalt
    ? "Hortelã gelada"
    : details.specs[0];

  const handleAddToCart = () => {
    if (!canAddToCart) return;

    for (let i = 0; i < quantity; i += 1) {
      addToCart({
        product,
        selectedVariation: nicotineStrength ?? undefined,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-28 lg:pb-0">
      <div className="hidden lg:block">
        <SiteHeader />
      </div>

      <main className="mx-auto max-w-[1220px] lg:px-8 lg:py-8">
        <section className="lg:hidden">
          <div className="relative bg-[#f5f5f5]">
            <button
              type="button"
              onClick={() => setIsImageModalOpen(true)}
              className="block w-full"
            >
              <div className="aspect-square w-full">
                <img
                  src={details.gallery[selectedImage]}
                  alt={product.name}
                  className="h-full w-full object-contain"
                />
              </div>
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Voltar"
              className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white text-primary"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => setIsImageModalOpen(true)}
              aria-label="Ampliar imagem"
              className="absolute right-0 top-0 flex h-14 w-14 items-center justify-center rounded-bl-[28px] bg-black/20 text-white backdrop-blur-sm"
            >
              <Search className="h-5 w-5" />
            </button>

            <button
              type="button"
              className="absolute bottom-5 left-4 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#e10600]"
            >
              <Play className="h-4 w-4 fill-current" />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-[#cfc4ba] px-3 py-0.5 text-sm text-foreground/80">
              {selectedImage + 1} de {details.gallery.length}
            </div>

            <button
              type="button"
              aria-label="Compartilhar produto"
              className="absolute bottom-3 right-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#e10600] shadow-lg"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>

          <div className="-mt-6 rounded-t-[28px] bg-background px-5 pb-8 pt-7">
            <h1 className="text-[24px] font-medium leading-tight text-[#4b4b4b]">
              {product.name}
            </h1>

            <div className="mt-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 rounded-full bg-[#f2f0ef] px-4 py-2.5">
                <button
                  type="button"
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  className="text-[#7a7a7a]"
                  aria-label="Diminuir quantidade"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-5 text-center text-lg text-[#5c5c5c]">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((current) => current + 1)}
                  className="text-[#7a7a7a]"
                  aria-label="Aumentar quantidade"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <span className="text-sm text-[#9b9b9b]">un</span>
              </div>

              <div className="text-[20px] font-semibold text-[#5a5a5a]">{formatPrice(product.price)}</div>
            </div>

            {isNicSalt ? (
              <div className="mt-5 space-y-5 text-[16px] text-[#7a7a7a]">
                <p>{productDescription}</p>
                <p>
                  Tags: <span className="text-primary">BLVK</span> | <span className="text-primary">hortela</span>
                </p>

                <div className="border-t border-[#ececec] pt-4">
                  <p className="text-sm uppercase tracking-wide text-[#7f7f7f]">Teor de nicotina :</p>
                  <div className="mt-3 space-y-3">
                    {hasNicotineOptions &&
                      nicotineOptions.map((option) => (
                        <button
                          key={option.label}
                          type="button"
                          onClick={() => option.available && setNicotineStrength(option.label)}
                          disabled={!option.available}
                          className={`flex items-center gap-3 text-left ${
                            option.available ? "" : "cursor-not-allowed opacity-50"
                          }`}
                        >
                          <span
                            className={`h-5 w-5 rounded-full border ${
                              nicotineStrength === option.label
                                ? "border-primary bg-primary"
                                : option.available
                                  ? "border-[#c9c9c9] bg-[#d9d9d9]"
                                  : "border-[#d8d8d8] bg-[#eeeeee]"
                            }`}
                          />
                          <span className={`text-[16px] ${option.available ? "text-[#555555]" : "text-[#9a9a9a] line-through"}`}>
                            {option.label}
                          </span>
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-5 text-[16px] leading-[1.25] text-[#7a7a7a]">
                <ul className="list-disc pl-5">
                  {visibleSpecs.map((item, index) => (
                    <li key={item} className={index === 0 ? "font-semibold text-[#666666]" : ""}>
                      {item}
                    </li>
                  ))}
                </ul>

                {!showFullDescription && details.specs.length > visibleSpecs.length && (
                  <button
                    type="button"
                    onClick={() => setShowFullDescription(true)}
                    className="mt-1 text-[#4b4b4b]"
                  >
                    Ver mais
                  </button>
                )}
              </div>
            )}

            {!isNicSalt && (
              <p className="mt-3 text-[16px] text-[#7a7a7a]">
                Tag: <span className="text-primary">{details.tag}</span>
              </p>
            )}

            <div className="mt-5 border-t border-[#ececec] pt-4">
              <h2 className="text-[18px] font-semibold text-[#676767]">Calcule o frete</h2>
              <div className="mt-4 grid grid-cols-[minmax(0,1fr)_88px_92px] gap-2">
                <input
                  value={zipCode}
                  onChange={(event) => setZipCode(event.target.value.replace(/[^\d-]/g, ""))}
                  placeholder="Insira o CEP"
                  className="h-10 rounded-full bg-[#f3f2f2] px-4 text-sm text-foreground placeholder:text-[#c0c0c0] focus:outline-none"
                />
                <input
                  value={addressNumber}
                  onChange={(event) => setAddressNumber(event.target.value.replace(/[^\d]/g, ""))}
                  placeholder="Nº"
                  className="h-10 rounded-full bg-[#f3f2f2] px-4 text-sm text-foreground placeholder:text-[#c0c0c0] focus:outline-none"
                />
                <button
                  type="button"
                  className="h-10 rounded-full border border-primary text-sm font-medium text-primary"
                >
                  Calcular
                </button>
              </div>
            </div>

            <div className="mt-6 border-t border-[#ececec] pt-5">
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder={isNicSalt ? "Inclua algum detalhe para este produto (opcional)" : "Observações"}
                className="min-h-[72px] w-full rounded-2xl bg-[#f3f2f2] p-4 text-sm text-foreground placeholder:text-[#b6b6b6] focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!canAddToCart || (isNicSalt && availableNicotineOptions.length === 0)}
              className={`mt-6 w-full rounded-xl px-6 py-3 text-center text-base font-medium ${
                canAddToCart && (!isNicSalt || availableNicotineOptions.length > 0)
                  ? "bg-primary text-primary-foreground"
                  : "bg-[#c7c7c7] text-white"
              }`}
            >
              {isNicSalt && availableNicotineOptions.length === 0
                ? "Indisponível"
                : canAddToCart
                  ? "Adicionar ao Pedido"
                  : "Selecione"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="mx-auto mt-4 block w-full rounded-xl border border-primary px-6 py-3 text-center text-base font-medium text-primary"
            >
              Voltar pra loja
            </button>

            <div className="mt-10 text-center">
              <p className="text-[14px] text-[#7f7f7f]">Ficou com alguma dúvida?</p>
              <a
                href="https://wa.me/5567991032937"
                target="_blank"
                rel="noopener noreferrer"
                className="mx-auto mt-3 inline-flex rounded-xl border border-primary px-5 py-2.5 text-base text-primary"
              >
                Falar com o vendedor
              </a>
            </div>

            <div className="mx-[-20px] mt-10 bg-[#f3f3f3] px-5 py-8">
              <h3 className="text-[16px] font-semibold text-[#666666]">Fale com o vendedor</h3>
              <a
                href="https://wa.me/5567991032937"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center gap-3 text-[#8b8b8b]"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-primary text-primary">
                  <MessageCircle className="h-4 w-4" />
                </span>
                Pod & Mais
              </a>
            </div>
          </div>

          <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background px-5 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-4 shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!canAddToCart || (isNicSalt && availableNicotineOptions.length === 0)}
              className="mx-auto block w-full max-w-[240px] rounded-xl bg-primary px-6 py-3.5 text-base font-bold text-primary-foreground disabled:bg-[#c7c7c7] disabled:text-white"
            >
              {isNicSalt && availableNicotineOptions.length === 0
                ? "Indisponível"
                : canAddToCart
                  ? "Adicionar ao Pedido"
                  : "Selecione"}
            </button>
          </div>
        </section>

        <section className="hidden lg:block">
          <div className="grid gap-8 lg:grid-cols-[540px_minmax(0,420px)] xl:justify-center">
            <div className={`grid items-start gap-4 pt-16 ${isNicSalt ? "grid-cols-1" : "grid-cols-[82px_1fr]"}`}>
              {!isNicSalt && (
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    className="flex h-20 flex-col items-center justify-center rounded-2xl bg-[#f3f3f3] text-primary"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
                      <Play className="h-5 w-5 fill-current" />
                    </span>
                    <span className="mt-1 text-sm">Vídeo</span>
                  </button>

                  {details.gallery.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() => setSelectedImage(index)}
                      className={`overflow-hidden rounded-2xl border-2 ${selectedImage === index ? "border-primary" : "border-transparent"}`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="aspect-square w-[78px] object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              <div className={`relative w-full overflow-hidden bg-[#f6f5f3] ${isNicSalt ? "max-w-[450px] rounded-[18px]" : "max-w-[440px] rounded-[14px]"}`}>
                <button
                  type="button"
                  onClick={() => setIsImageModalOpen(true)}
                  className="block w-full"
                >
                  <div className="aspect-square w-full">
                    <img
                      src={details.gallery[selectedImage]}
                      alt={product.name}
                      className="h-full w-full object-contain"
                    />
                  </div>
                </button>

                <button
                  type="button"
                  aria-label="Compartilhar produto"
                  className="absolute right-[-10px] top-[-10px] flex h-12 w-12 items-center justify-center rounded-full bg-white text-primary shadow-md"
                >
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="max-w-[420px] pt-16">
              <h1 className="text-[27px] font-semibold leading-[1.15] text-[#545454]">
                {product.name}
              </h1>

              <div className="mt-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 rounded-full bg-[#f2f0ef] px-5 py-2.5 text-[#666666]">
                  <button
                    type="button"
                    onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                    aria-label="Diminuir quantidade"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-4 text-center text-lg">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((current) => current + 1)}
                    aria-label="Aumentar quantidade"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-[#979797]">un</span>
                </div>

                <div className="text-[28px] font-semibold text-[#555555]">{formatPrice(product.price)}</div>
              </div>

              {isNicSalt ? (
                <div className="mt-6 space-y-5 text-[15px] leading-[1.25] text-[#6f6f6f]">
                  <p className="text-[16px] text-[#666666]">{productDescription}</p>

                  <p className="text-[16px]">
                    Tags: <span className="text-primary">BLVK</span> | <span className="text-primary">hortela</span>
                  </p>

                  <div className="border-t border-[#ececec] pt-4">
                    <div className="flex items-center gap-4">
                      <p className="text-sm uppercase tracking-wide text-[#7f7f7f]">Teor de nicotina :</p>
                      <div className="h-px flex-1 bg-[#ececec]" />
                    </div>

                    <div className="mt-3 space-y-3">
                      {hasNicotineOptions &&
                        nicotineOptions.map((option) => (
                          <button
                            key={option.label}
                            type="button"
                            onClick={() => option.available && setNicotineStrength(option.label)}
                            disabled={!option.available}
                            className={`flex items-center gap-3 text-left ${
                              option.available ? "" : "cursor-not-allowed opacity-50"
                            }`}
                          >
                            <span
                              className={`h-5 w-5 rounded-full border ${
                                nicotineStrength === option.label
                                  ? "border-primary bg-primary"
                                  : option.available
                                    ? "border-[#c9c9c9] bg-[#d9d9d9]"
                                    : "border-[#d8d8d8] bg-[#eeeeee]"
                              }`}
                            />
                            <span className={`text-[16px] ${option.available ? "text-[#555555]" : "text-[#9a9a9a] line-through"}`}>
                              {option.label}
                            </span>
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-5 space-y-5 text-[15px] leading-[1.25] text-[#6f6f6f]">
                  <ul className="list-disc pl-5">
                    {details.specs.map((item, index) => (
                      <li key={item} className={index === 0 ? "font-semibold text-[#666666]" : ""}>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div>
                    <h2 className="font-semibold text-[#4f4f4f]">O que inclui?</h2>
                    <ul className="mt-1 list-disc pl-5">
                      {details.includes.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <p>
                    Tag: <span className="text-primary">{details.tag}</span>
                  </p>
                </div>
              )}

              <div className="mt-8 border-t border-[#ececec] pt-4">
                <div className="flex items-center gap-2 text-[18px] font-semibold text-[#676767]">
                  {!isNicSalt && <Truck className="h-5 w-5 text-primary" />}
                  <h2>Calcule o frete</h2>
                </div>
                <div className="mt-4 grid grid-cols-[minmax(0,1fr)_96px_108px] gap-2">
                  <input
                    value={zipCode}
                    onChange={(event) => setZipCode(event.target.value.replace(/[^\d-]/g, ""))}
                    placeholder="Insira o CEP"
                    className="h-10 rounded-full bg-[#f3f2f2] px-4 text-sm text-foreground placeholder:text-[#c0c0c0] focus:outline-none"
                  />
                  <input
                    value={addressNumber}
                    onChange={(event) => setAddressNumber(event.target.value.replace(/[^\d]/g, ""))}
                    placeholder="Número"
                    className="h-10 rounded-full bg-[#f3f2f2] px-4 text-sm text-foreground placeholder:text-[#c0c0c0] focus:outline-none"
                  />
                  <button
                    type="button"
                    className="h-10 rounded-xl border border-primary text-sm font-medium text-primary"
                  >
                    Calcular
                  </button>
                </div>
              </div>

              <div className="mt-6 border-t border-[#ececec] pt-5">
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Inclua algum detalhe para este produto (opcional)"
                  className={`w-full bg-[#f3f2f2] p-4 text-sm text-foreground placeholder:text-[#b6b6b6] focus:outline-none ${isNicSalt ? "min-h-[92px] rounded-2xl" : "min-h-[106px] rounded-lg"}`}
                />
              </div>

              <div className="mt-5 space-y-2.5">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!canAddToCart || (isNicSalt && availableNicotineOptions.length === 0)}
                  className={`w-full px-6 py-3.5 text-base font-bold ${
                    canAddToCart && (!isNicSalt || availableNicotineOptions.length > 0)
                      ? "rounded-lg bg-primary text-primary-foreground"
                      : "rounded-xl bg-[#bfbfbf] text-white"
                  }`}
                >
                  {isNicSalt && availableNicotineOptions.length === 0
                    ? "Indisponível"
                    : canAddToCart
                      ? "Adicionar ao Pedido"
                      : "Selecione"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="w-full rounded-lg border border-primary px-6 py-3 text-base font-medium text-primary"
                >
                  Voltar pra loja
                </button>
              </div>

              {isNicSalt && (
                <div className="mt-10 text-center">
                  <p className="text-[14px] text-[#7f7f7f]">Ficou com alguma dúvida?</p>
                  <a
                    href="https://wa.me/5567991032937"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mx-auto mt-3 inline-flex rounded-xl border border-primary px-5 py-2.5 text-base text-primary"
                  >
                    Falar com o vendedor
                  </a>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
      <WhatsAppButton />
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