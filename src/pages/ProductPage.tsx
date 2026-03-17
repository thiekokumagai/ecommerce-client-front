import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Minus, Plus, Share2 } from "lucide-react";
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
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10">
        <div className="grid gap-8 lg:grid-cols-[120px_minmax(0,1fr)_450px] lg:items-start">
          <div className="order-2 flex gap-3 overflow-x-auto lg:order-1 lg:flex-col">
            <div className="flex min-w-[96px] flex-col items-center justify-center rounded-2xl bg-secondary px-4 py-5 text-center text-primary">
              <div className="rounded-2xl bg-background p-3 text-primary shadow-sm">
                <Share2 className="h-6 w-6" />
              </div>
              <span className="mt-3 text-base font-medium">{details.videoLabel}</span>
            </div>

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
                  className="h-24 w-24 object-cover"
                />
              </button>
            ))}
          </div>

          <div className="order-1 lg:order-2">
            <div className="relative overflow-hidden rounded-[28px] bg-secondary/30 p-4 md:p-6">
              <img
                src={details.gallery[selectedImage]}
                alt={product.name}
                className="mx-auto aspect-square w-full max-w-[540px] rounded-[24px] object-contain"
              />
            </div>
          </div>

          <div className="order-3">
            <h1 className="text-3xl font-bold leading-tight text-foreground md:text-[44px] md:leading-[1.05]">
              {product.name}
            </h1>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 rounded-full bg-secondary px-4 py-3">
                <button
                  type="button"
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  className="text-lg font-semibold text-muted-foreground"
                  aria-label="Diminuir quantidade"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-6 text-center text-xl font-medium text-foreground">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((current) => current + 1)}
                  className="text-lg font-semibold text-muted-foreground"
                  aria-label="Aumentar quantidade"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <span className="ml-1 text-sm text-muted-foreground">un</span>
              </div>

              <div className="text-4xl font-semibold text-foreground md:text-5xl">
                {formatPrice(product.price)}
              </div>
            </div>

            <div className="mt-8 space-y-6 text-[15px] leading-7 text-foreground">
              <ul className="list-disc space-y-2 pl-5">
                {details.specs.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <div>
                <h2 className="text-2xl font-semibold text-foreground">O que inclui?</h2>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {details.includes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <p className="text-lg">
                <span className="text-foreground">Tag:</span>{" "}
                <span className="text-primary">{details.tag}</span>
              </p>
            </div>

            <div className="mt-10 border-t border-border pt-8">
              <h2 className="text-2xl font-semibold text-foreground">Calcule o frete</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_120px_120px]">
                <input
                  value={zipCode}
                  onChange={(event) => setZipCode(event.target.value.replace(/[^\d-]/g, ""))}
                  placeholder="Insira o CEP"
                  className="h-12 rounded-full bg-secondary px-5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <input
                  value={addressNumber}
                  onChange={(event) => setAddressNumber(event.target.value.replace(/[^\d]/g, ""))}
                  placeholder="Número"
                  className="h-12 rounded-full bg-secondary px-5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <button
                  type="button"
                  className="h-12 rounded-full border border-primary px-5 text-sm font-medium text-primary"
                >
                  Calcular
                </button>
              </div>
            </div>

            <div className="mt-8">
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Inclua algum detalhe para este produto (opcional)"
                className="min-h-[120px] w-full rounded-2xl bg-secondary p-5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>

            <div className="mt-8 space-y-3">
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full rounded-2xl bg-primary px-6 py-4 text-base font-bold text-primary-foreground"
              >
                Adicionar ao Pedido
              </button>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="w-full rounded-2xl border border-primary px-6 py-4 text-base font-medium text-primary"
              >
                Voltar para a loja
              </button>
            </div>
          </div>
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
