import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Minus, Plus, Share2, ChevronRight, House, Play, Truck } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import WhatsAppButton from "@/components/WhatsAppButton";
import CartSidebar from "@/components/CartSidebar";
import AddedToCartModal from "@/components/AddedToCartModal";
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

  const product = useMemo(() => getProductById(Number(id)), [id]);

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto flex max-w-7xl flex-col items-center px-4 py-16 text-center md:px-8">
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

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i += 1) {
      addToCart(product);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="flex items-center gap-2 text-foreground">
            <House className="h-4 w-4" />
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span>{product.category}</span>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_430px]">
          <section className="space-y-5">
            <div className="grid gap-4 lg:grid-cols-[104px_minmax(0,1fr)]">
              <div className="order-2 flex gap-3 overflow-x-auto lg:order-1 lg:flex-col">
                <button
                  type="button"
                  className="flex h-[92px] w-[92px] shrink-0 flex-col items-center justify-center rounded-[28px] bg-[#5b36f2] px-3 text-white"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#5b36f2]">
                    <Play className="h-5 w-5 fill-current" />
                  </div>
                  <span className="mt-2 text-sm font-medium">Vídeo</span>
                </button>

                {details.gallery.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className={`h-[92px] w-[92px] shrink-0 overflow-hidden rounded-[28px] border ${selectedImage === index ? "border-primary" : "border-border"}`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>

              <div className="order-1 rounded-[36px] bg-[#f5f5f7] p-4 md:p-6 lg:order-2">
                <div className="relative rounded-[30px] bg-white p-4 md:p-6">
                  <button
                    type="button"
                    aria-label="Compartilhar produto"
                    className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#f3f3f5] text-muted-foreground"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>

                  <img
                    src={details.gallery[selectedImage]}
                    alt={product.name}
                    className="mx-auto aspect-square w-full max-w-[640px] object-contain"
                  />
                </div>
              </div>
            </div>

            <section className="rounded-[32px] border border-border bg-white p-6 md:p-8">
              <h2 className="text-[28px] font-semibold text-foreground md:text-[32px]">Descrição</h2>

              <div className="mt-6 space-y-6 text-[15px] leading-7 text-foreground md:text-base">
                <ul className="list-disc space-y-2 pl-5 marker:text-foreground">
                  {details.specs.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>

                <div>
                  <h3 className="text-xl font-semibold text-foreground">O que inclui?</h3>
                  <ul className="mt-3 list-disc space-y-2 pl-5 marker:text-foreground">
                    {details.includes.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <p className="text-base font-medium text-foreground">
                  Tag: <span className="text-primary">{details.tag}</span>
                </p>
              </div>
            </section>
          </section>

          <aside className="space-y-5 xl:sticky xl:top-24">
            <div className="rounded-[32px] border border-border bg-white p-6 md:p-8">
              <p className="text-sm font-medium text-muted-foreground">{product.category}</p>
              <h1 className="mt-3 text-3xl font-bold leading-tight text-foreground md:text-[40px] md:leading-[1.05]">
                {product.name}
              </h1>

              <div className="mt-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 rounded-full bg-[#f3f3f5] px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                    className="text-muted-foreground"
                    aria-label="Diminuir quantidade"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-8 text-center text-lg font-medium text-foreground">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((current) => current + 1)}
                    className="text-muted-foreground"
                    aria-label="Aumentar quantidade"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-muted-foreground">un</span>
                </div>

                <div className="text-3xl font-semibold text-foreground md:text-4xl">
                  {formatPrice(product.price)}
                </div>
              </div>

              <div className="mt-8 rounded-[28px] bg-[#f7f7f8] p-5">
                <div className="flex items-center gap-3 text-foreground">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-primary">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-semibold">Calcule o frete</h2>
                    <p className="text-sm text-muted-foreground">Informe o CEP e o número do endereço</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3">
                  <input
                    value={zipCode}
                    onChange={(event) => setZipCode(event.target.value.replace(/[^\d-]/g, ""))}
                    placeholder="Insira o CEP"
                    className="h-12 rounded-full border border-transparent bg-white px-5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                  <div className="grid grid-cols-[minmax(0,1fr)_120px] gap-3">
                    <input
                      value={addressNumber}
                      onChange={(event) => setAddressNumber(event.target.value.replace(/[^\d]/g, ""))}
                      placeholder="Número"
                      className="h-12 rounded-full border border-transparent bg-white px-5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                    <button
                      type="button"
                      className="h-12 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
                    >
                      Calcular
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Inclua algum detalhe para este produto (opcional)"
                  className="min-h-[130px] w-full rounded-[28px] bg-[#f7f7f8] p-5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>

              <div className="mt-5 space-y-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full rounded-full bg-primary px-6 py-4 text-base font-bold text-primary-foreground"
                >
                  Adicionar ao Pedido
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="w-full rounded-full border border-primary px-6 py-4 text-base font-medium text-primary"
                >
                  Voltar para a loja
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
      <WhatsAppButton />
      <CartSidebar />
      <AddedToCartModal />
    </div>
  );
};

export default ProductPage;
