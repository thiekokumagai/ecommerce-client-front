import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { X, Minus, Plus, Trash2, ShoppingBag, MapPin, Pencil } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";

const SESSION_ADDRESS_KEY = "podemais-checkout-address";
const SESSION_NAME_KEY = "podemais-checkout-name";
const SESSION_PHONE_KEY = "podemais-checkout-phone";

const STORE_ORIGIN = "Rua Glauce Rocha, 539, Campo Grande - MS";

const formatPrice = (price: number) =>
  `R$${price.toFixed(2).replace(".", ",")}`;

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 2) return digits ? `(${digits}` : "";
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
};

const formatCurrencyInput = (value: string) => {
  const digits = value.replace(/\D/g, "");

  if (!digits) return "";

  const numberValue = Number(digits) / 100;

  return numberValue.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const normalizeAddress = (address: string) =>
  address
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const estimateDistanceFromAddress = (destinationAddress: string) => {
  const normalizedDestination = normalizeAddress(destinationAddress);
  const normalizedOrigin = normalizeAddress(STORE_ORIGIN);

  if (!normalizedDestination.trim()) return 0;

  const zones = [
    { keywords: ["centro", "amambai", "sao francisco", "jardim dos estados"], distance: 3 },
    { keywords: ["caiçara", "caicara", "caranda bosque", "vila carlota", "rita vieira"], distance: 5 },
    { keywords: ["tiradentes", "universitario", "parati", "nova lima", "coronel antonino"], distance: 7 },
    { keywords: ["moreninhas", "aero rancho", "anhanduizinho", "noroeste", "lageado"], distance: 10 },
    { keywords: ["indubrasil"], distance: 13 },
  ];

  const matchedZone = zones.find((zone) =>
    zone.keywords.some(
      (keyword) =>
        normalizedDestination.includes(keyword) && !normalizedOrigin.includes(keyword)
    )
  );

  return matchedZone?.distance ?? 6;
};

const getDynamicDeliveryFee = (distanceKm: number) => {
  if (distanceKm <= 0) return 0;
  if (distanceKm <= 4) return 10;
  if (distanceKm <= 6) return 12;
  if (distanceKm <= 8) return 15;
  if (distanceKm <= 12) return 20;
  if (distanceKm <= 15) return 22;
  if (distanceKm <= 17) return 25;
  if (distanceKm <= 20) return 30;
  if (distanceKm <= 32) return 35;
  return 35;
};

type PaymentMethod = "pix" | "debito" | "credito" | "dinheiro";

const CartSidebar = () => {
  const { items, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, totalPrice, totalItems } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [savedAddress, setSavedAddress] = useState("");
  const [isEditingAddress, setIsEditingAddress] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [needsChange, setNeedsChange] = useState("não");
  const [changeFor, setChangeFor] = useState("");
  const previousTotalItems = useRef(totalItems);

  useEffect(() => {
    const storedAddress = sessionStorage.getItem(SESSION_ADDRESS_KEY) ?? "";
    const storedName = sessionStorage.getItem(SESSION_NAME_KEY) ?? "";
    const storedPhone = sessionStorage.getItem(SESSION_PHONE_KEY) ?? "";

    if (storedAddress) {
      setSavedAddress(storedAddress);
      setAddress(storedAddress);
      setIsEditingAddress(false);
    }

    if (storedName) {
      setName(storedName);
    }

    if (storedPhone) {
      setPhone(storedPhone);
    }
  }, []);

  useEffect(() => {
    if (previousTotalItems.current > 0 && totalItems === 0) {
      toast.info("Seu carrinho ficou vazio. Escolha os produtos para continuar.");
    }

    previousTotalItems.current = totalItems;
  }, [totalItems]);

  const pixDiscount = useMemo(() => totalPrice * 0.05, [totalPrice]);
  const totalWithPixDiscount = useMemo(() => totalPrice - pixDiscount, [totalPrice, pixDiscount]);
  const discountedProductsTotal = paymentMethod === "pix" ? totalWithPixDiscount : totalPrice;
  const estimatedDistanceKm = useMemo(
    () => estimateDistanceFromAddress(savedAddress || address),
    [savedAddress, address]
  );
  const deliveryFee = useMemo(
    () => getDynamicDeliveryFee(estimatedDistanceKm),
    [estimatedDistanceKm]
  );
  const finalTotal = discountedProductsTotal + deliveryFee;

  const closeCart = useCallback(() => setIsCartOpen(false), [setIsCartOpen]);

  const handleNameChange = (value: string) => {
    setName(value);
    sessionStorage.setItem(SESSION_NAME_KEY, value);
  };

  const handlePhoneChange = (value: string) => {
    const formattedPhone = formatPhone(value);
    setPhone(formattedPhone);
    sessionStorage.setItem(SESSION_PHONE_KEY, formattedPhone);
  };

  const handleSaveAddress = () => {
    const trimmedAddress = address.trim();

    if (!trimmedAddress) return;

    sessionStorage.setItem(SESSION_ADDRESS_KEY, trimmedAddress);
    setSavedAddress(trimmedAddress);
    setIsEditingAddress(false);
  };

  const handleEditAddress = () => {
    setAddress(savedAddress);
    setIsEditingAddress(true);
  };

  const handleRemoveItem = (productId: number, selectedVariation?: string) => {
    removeFromCart(productId, selectedVariation);

    if (totalItems <= 1) {
      toast.info("Escolha os produtos para continuar.");
    }
  };

  const checkoutMessage = useMemo(
    () =>
      encodeURIComponent(
        [
          "Olá! Gostaria de finalizar meu pedido:",
          "",
          ...items.map((item) =>
            `${item.quantity}x ${item.product.name}${item.selectedVariation ? ` (${item.product.variationGroup?.name}: ${item.selectedVariation})` : ""} - ${formatPrice(item.product.price * item.quantity)}`
          ),
          "",
          `Nome: ${name || "-"}`,
          `Telefone: ${phone || "-"}`,
          `Endereço completo: ${savedAddress || "-"}`,
          "",
          `Subtotal dos produtos: ${formatPrice(totalPrice)}`,
          ...(paymentMethod === "pix" ? [`Desconto Pix: -${formatPrice(pixDiscount)}`] : []),
          paymentMethod === "pix"
            ? `Forma de pagamento: Pix - Total dos produtos com desconto: ${formatPrice(totalWithPixDiscount)}`
            : paymentMethod === "debito"
              ? `Forma de pagamento: Débito`
              : paymentMethod === "credito"
                ? `Forma de pagamento: Crédito`
                : `Forma de pagamento: Dinheiro`,
          ...(paymentMethod === "dinheiro"
            ? [`Precisa de troco: ${needsChange}`, ...(needsChange === "sim" ? [`Troco para: R$ ${changeFor || "-"}`] : [])]
            : []),
          `Taxa do motoboy: ${formatPrice(deliveryFee)}`,
          `Total final com entrega: ${formatPrice(finalTotal)}`,
        ].join("\n")
      ),
    [
      items,
      name,
      phone,
      savedAddress,
      totalPrice,
      paymentMethod,
      pixDiscount,
      totalWithPixDiscount,
      needsChange,
      changeFor,
      deliveryFee,
      finalTotal,
    ]
  );

  const whatsappHref = useMemo(
    () => `https://wa.me/5567991032937?text=${checkoutMessage}`,
    [checkoutMessage]
  );

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={closeCart} />
      <div className="relative flex h-full w-full max-w-md flex-col bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border bg-primary px-5 py-4">
          <h2 className="text-lg font-bold text-primary-foreground">Confira seu pedido</h2>
          <button onClick={closeCart} className="text-primary-foreground/80">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
              <ShoppingBag className="h-12 w-12" />
              <p className="text-sm">Seu carrinho está vazio</p>
              <p className="text-center text-sm">Escolha os produtos para continuar.</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={`${item.product.id}-${item.selectedVariation ?? "default"}`} className="flex gap-3 rounded-xl border border-border bg-background p-3">
                    <img src={item.product.image} alt={item.product.name} className="h-16 w-16 rounded-lg bg-secondary/30 object-contain" loading="lazy" />
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="line-clamp-2 text-sm font-medium text-foreground">{item.product.name}</p>
                          {item.selectedVariation && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {item.product.variationGroup?.name}: {item.selectedVariation}
                            </p>
                          )}
                        </div>
                        <button onClick={() => handleRemoveItem(item.product.id, item.selectedVariation)} className="shrink-0 text-muted-foreground">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 rounded-lg border border-border">
                          <button onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.selectedVariation)} className="px-2 py-1 text-muted-foreground">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="min-w-[24px] text-center text-sm font-medium">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedVariation)} className="px-2 py-1 text-muted-foreground">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="text-sm font-bold text-primary">{formatPrice(item.product.price * item.quantity)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 rounded-2xl border border-border p-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Nome</label>
                  <input
                    value={name}
                    onChange={(event) => handleNameChange(event.target.value)}
                    placeholder="Seu nome"
                    className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Telefone</label>
                  <input
                    value={phone}
                    onChange={(event) => handlePhoneChange(event.target.value)}
                    placeholder="(67) 99999-9999"
                    className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Endereço completo</label>

                  {isEditingAddress ? (
                    <div className="space-y-3">
                      <textarea
                        value={address}
                        onChange={(event) => setAddress(event.target.value)}
                        placeholder="Rua, número, bairro, complemento e referência"
                        className="min-h-[96px] w-full rounded-xl border border-border bg-background p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleSaveAddress}
                        disabled={!address.trim()}
                        className={`w-full rounded-xl py-3 text-sm font-semibold ${
                          address.trim()
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        Salvar endereço
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-border bg-background p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex gap-3">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <div>
                            <p className="text-sm text-foreground">{savedAddress}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleEditAddress}
                          className="inline-flex items-center gap-1 text-sm font-medium text-primary"
                        >
                          <Pencil className="h-4 w-4" />
                          Alterar
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="mt-3 rounded-xl bg-secondary p-3 text-sm text-foreground">
                    <p>
                      Taxa do motoboy: <span className="font-bold text-primary">{formatPrice(deliveryFee)}</span>
                    </p>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Forma de pagamento</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("pix")}
                      className={`rounded-xl border px-3 py-3 text-sm font-medium ${paymentMethod === "pix" ? "border-primary bg-primary text-primary-foreground" : "border-border text-foreground"}`}
                    >
                      Pix (5% off)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("debito")}
                      className={`rounded-xl border px-3 py-3 text-sm font-medium ${paymentMethod === "debito" ? "border-primary bg-primary text-primary-foreground" : "border-border text-foreground"}`}
                    >
                      Débito
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("credito")}
                      className={`rounded-xl border px-3 py-3 text-sm font-medium ${paymentMethod === "credito" ? "border-primary bg-primary text-primary-foreground" : "border-border text-foreground"}`}
                    >
                      Crédito
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("dinheiro")}
                      className={`rounded-xl border px-3 py-3 text-sm font-medium ${paymentMethod === "dinheiro" ? "border-primary bg-primary text-primary-foreground" : "border-border text-foreground"}`}
                    >
                      Dinheiro
                    </button>
                  </div>
                </div>

                {paymentMethod === "dinheiro" && (
                  <div className="space-y-3">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground">Precisa de troco?</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setNeedsChange("sim")}
                          className={`rounded-xl border px-3 py-3 text-sm font-medium ${needsChange === "sim" ? "border-primary bg-primary text-primary-foreground" : "border-border text-foreground"}`}
                        >
                          Sim
                        </button>
                        <button
                          type="button"
                          onClick={() => setNeedsChange("não")}
                          className={`rounded-xl border px-3 py-3 text-sm font-medium ${needsChange === "não" ? "border-primary bg-primary text-primary-foreground" : "border-border text-foreground"}`}
                        >
                          Não
                        </button>
                      </div>
                    </div>

                    {needsChange === "sim" && (
                      <div>
                        <label className="mb-2 block text-sm font-medium text-foreground">Troco para quanto?</label>
                        <input
                          value={changeFor}
                          onChange={(event) => setChangeFor(formatCurrencyInput(event.target.value))}
                          placeholder="Ex: 100,00"
                          className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {items.length > 0 ? (
          <div className="border-t border-border p-5">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Produtos ({totalItems} {totalItems === 1 ? "item" : "itens"})</span>
                <span className="font-medium text-foreground">{formatPrice(totalPrice)}</span>
              </div>

              {paymentMethod === "pix" && (
                <div className="mx-[-20px] flex items-center justify-between bg-primary px-5 py-3 text-sm font-medium text-primary-foreground">
                  <span>Desconto PIX:</span>
                  <span>-{formatPrice(pixDiscount)}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Taxa do motoboy</span>
                <span className="font-medium text-foreground">{formatPrice(deliveryFee)}</span>
              </div>

              <div className="flex items-center justify-between text-base">
                <span className="font-medium text-muted-foreground">Total final:</span>
                <span className="text-xl font-bold text-primary">{formatPrice(finalTotal)}</span>
              </div>
            </div>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground"
            >
              Finalizar Pedido via WhatsApp
            </a>
          </div>
        ) : (
          <div className="border-t border-border p-5">
            <button
              type="button"
              onClick={() => toast.info("Escolha os produtos para continuar.")}
              className="w-full rounded-xl bg-muted py-3.5 text-sm font-bold text-muted-foreground"
            >
              Escolha os produtos para continuar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSidebar;