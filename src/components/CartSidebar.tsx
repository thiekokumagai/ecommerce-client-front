import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { X, Minus, Plus, Trash2, ShoppingBag, MapPin, Pencil, ChevronLeft, Check, User, Phone, Ticket, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import AddressSearch, { type StructuredAddress } from "@/components/checkout/AddressSearch";

const SESSION_ADDRESS_KEY = "podemais-checkout-address";
const SESSION_NAME_KEY = "podemais-checkout-name";
const SESSION_PHONE_KEY = "podemais-checkout-phone";

const formatPrice = (price: number) => `R$${price.toFixed(2).replace(".", ",")}`;

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
  return numberValue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const normalizeAddress = (address: string) =>
  address.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

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
    zone.keywords.some((keyword) => normalizedDestination.includes(keyword) && !normalizedOrigin.includes(keyword))
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
type CheckoutStep = "cart" | "delivery" | "payment" | "confirmation";

const STEPS: { key: CheckoutStep; label: string }[] = [
  { key: "cart", label: "Sacola" },
  { key: "delivery", label: "Entrega" },
  { key: "payment", label: "Pagamento" },
  { key: "confirmation", label: "Conclusão" },
];

const StepIndicator = ({ currentStep }: { currentStep: CheckoutStep }) => {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center justify-between px-5 py-3">
      {STEPS.map((step, index) => {
        const isDone = index < currentIndex;
        const isActive = index === currentIndex;

        return (
          <div key={step.key} className="flex items-center gap-1">
            {index > 0 && (
              <div className={`mx-1 h-0.5 w-6 sm:w-10 ${isDone ? "bg-primary" : "bg-border"}`} />
            )}
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  isDone
                    ? "bg-primary text-primary-foreground"
                    : isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {isDone ? <Check className="h-3.5 w-3.5" /> : index + 1}
              </div>
              <span className={`text-[10px] font-medium ${isActive || isDone ? "text-primary" : "text-muted-foreground"}`}>
                {step.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const CartSidebar = () => {
  const {
    items, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart,
    totalPrice, totalItems, addOrder, clearCart,
  } = useCart();

  const [step, setStep] = useState<CheckoutStep>("cart");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [structuredAddress, setStructuredAddress] = useState<StructuredAddress | null>(null);
  const [isEditingAddress, setIsEditingAddress] = useState(true);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [isCalculatingFee, setIsCalculatingFee] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [needsChange, setNeedsChange] = useState("não");
  const [changeFor, setChangeFor] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [savedCouponCode, setSavedCouponCode] = useState("");
  const [isEditingCoupon, setIsEditingCoupon] = useState(false);
  const previousTotalItems = useRef(totalItems);

  useEffect(() => {
    const storedAddress = sessionStorage.getItem(SESSION_ADDRESS_KEY);
    const storedName = sessionStorage.getItem(SESSION_NAME_KEY) ?? "";
    const storedPhone = sessionStorage.getItem(SESSION_PHONE_KEY) ?? "";

    if (storedAddress) {
      try {
        const parsed = JSON.parse(storedAddress) as StructuredAddress;
        setStructuredAddress(parsed);
        setIsEditingAddress(false);
      } catch { /* ignore */ }
    }
    if (storedName) setName(storedName);
    if (storedPhone) setPhone(storedPhone);
    if (storedName && storedPhone) setIsEditingContact(false);
  }, []);

  useEffect(() => {
    if (!isCartOpen) {
      setStep("cart");
      setPaymentMethod(null);
      setNeedsChange("não");
      setChangeFor("");
    }
  }, [isCartOpen]);

  useEffect(() => {
    if (previousTotalItems.current > 0 && totalItems === 0) {
      toast.info("Seu carrinho ficou vazio. Escolha os produtos para continuar.");
      setStep("cart");
    }
    previousTotalItems.current = totalItems;
  }, [totalItems]);

  const pixDiscount = useMemo(() => totalPrice * 0.05, [totalPrice]);
  const totalWithPixDiscount = useMemo(() => totalPrice - pixDiscount, [totalPrice, pixDiscount]);
  const discountedProductsTotal = paymentMethod === "pix" ? totalWithPixDiscount : totalPrice;
  const finalTotal = discountedProductsTotal + deliveryFee;

  const isContactValid = name.trim().length > 0 && phone.replace(/\D/g, "").length >= 10;
  const isAddressValid = structuredAddress !== null;

  const savedAddressDisplay = useMemo(() => {
    if (!structuredAddress) return "";
    const parts = [structuredAddress.mainText, structuredAddress.secondaryText];
    if (structuredAddress.complement) parts.push(`Compl: ${structuredAddress.complement}`);
    if (structuredAddress.reference) parts.push(`Ref: ${structuredAddress.reference}`);
    return parts.join(", ");
  }, [structuredAddress]);

  const calculateDeliveryFee = useCallback(async (addr: StructuredAddress) => {
    setIsCalculatingFee(true);
    try {
      const fullDest = [addr.fullText, addr.complement].filter(Boolean).join(", ");
      const { data } = await supabase.functions.invoke("calculate-freight", {
        body: { destination: fullDest },
      });
      if (data?.freightPrice) {
        setDeliveryFee(data.freightPrice);
      } else {
        setDeliveryFee(0);
        if (data?.error) toast.info(data.error);
      }
    } catch {
      setDeliveryFee(0);
    } finally {
      setIsCalculatingFee(false);
    }
  }, []);
  const hasSelectedPaymentMethod = paymentMethod !== null;
  const isPaymentValid =
    hasSelectedPaymentMethod &&
    (paymentMethod !== "dinheiro" || needsChange === "não" || changeFor.trim().length > 0);

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
    if (!trimmedAddress) {
      toast.info("Preencha o endereço para continuar.");
      return;
    }

    sessionStorage.setItem(SESSION_ADDRESS_KEY, trimmedAddress);
    setSavedAddress(trimmedAddress);
    setIsEditingAddress(false);
  };

  const handleSaveContact = () => {
    if (!name.trim()) {
      toast.info("Preencha seu nome para continuar.");
      return;
    }

    if (phone.replace(/\D/g, "").length < 10) {
      toast.info("Preencha um telefone válido para continuar.");
      return;
    }

    setIsEditingContact(false);
  };

  const handleSaveCoupon = () => {
    const trimmedCoupon = couponCode.trim();

    if (!trimmedCoupon) {
      toast.info("Digite um cupom para salvar.");
      return;
    }

    setSavedCouponCode(trimmedCoupon);
    setCouponCode(trimmedCoupon);
    setIsEditingCoupon(false);
    toast.success("Cupom salvo.");
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setSavedCouponCode("");
    setIsEditingCoupon(false);
    toast.success("Cupom removido.");
  };

  const handleRemoveItem = (productId: number, selectedVariation?: string) => {
    removeFromCart(productId, selectedVariation);
    if (totalItems <= 1) toast.info("Escolha os produtos para continuar.");
  };

  const handleClearCart = () => {
    clearCart();
    toast.success("Sacola limpa.");
  };

  const goToDelivery = () => {
    if (!items.length) {
      toast.info("Escolha os produtos para continuar.");
      return;
    }
    setStep("delivery");
  };

  const goToPayment = () => {
    if (isEditingContact) {
      toast.info("Salve suas informações de contato para continuar.");
      return;
    }

    if (!isContactValid) {
      toast.info("Preencha nome e telefone válidos para continuar.");
      return;
    }

    if (isEditingAddress) {
      toast.info("Salve o endereço de entrega para continuar.");
      return;
    }

    if (!isAddressValid) {
      toast.info("Preencha o endereço de entrega para continuar.");
      return;
    }

    setPaymentMethod(null);
    setNeedsChange("não");
    setChangeFor("");
    setStep("payment");
  };

  const goToConfirmation = () => {
    if (!hasSelectedPaymentMethod) {
      toast.info("Selecione uma forma de pagamento para continuar.");
      return;
    }

    if (!isPaymentValid) {
      toast.info("Informe o troco para continuar.");
      return;
    }

    setStep("confirmation");
  };

  const checkoutMessage = useMemo(
    () =>
      encodeURIComponent(
        [
          "Olá! Gostaria de finalizar meu pedido:",
          "",
          ...items.map(
            (item) =>
              `${item.quantity}x ${item.product.name}${item.selectedVariation ? ` (${item.product.variationGroup?.name}: ${item.selectedVariation})` : ""} - ${formatPrice(item.product.price * item.quantity)}`
          ),
          "",
          `Nome: ${name || "-"}`,
          `Telefone: ${phone || "-"}`,
          `Endereço completo: ${savedAddress || "-"}`,
          ...(savedCouponCode ? [`Cupom: ${savedCouponCode}`] : []),
          "",
          `Subtotal dos produtos: ${formatPrice(totalPrice)}`,
          ...(paymentMethod === "pix" ? [`Desconto Pix: -${formatPrice(pixDiscount)}`] : []),
          paymentMethod === "pix"
            ? `Forma de pagamento: Pix - Total com desconto: ${formatPrice(totalWithPixDiscount)}`
            : paymentMethod === "debito"
              ? "Forma de pagamento: Débito"
              : paymentMethod === "credito"
                ? "Forma de pagamento: Crédito"
                : "Forma de pagamento: Dinheiro",
          ...(paymentMethod === "dinheiro"
            ? [
                `Precisa de troco: ${needsChange}`,
                ...(needsChange === "sim" ? [`Troco para: R$ ${changeFor}`] : []),
              ]
            : []),
          `Taxa do motoboy: ${formatPrice(deliveryFee)}`,
          `Total final com entrega: ${formatPrice(finalTotal)}`,
        ].join("\n")
      ),
    [items, name, phone, savedAddress, savedCouponCode, totalPrice, paymentMethod, pixDiscount, totalWithPixDiscount, needsChange, changeFor, deliveryFee, finalTotal]
  );

  const whatsappHref = useMemo(() => `https://wa.me/5567991032937?text=${checkoutMessage}`, [checkoutMessage]);

  const handleCheckout = () => {
    if (!isContactValid || !isAddressValid || !isPaymentValid || items.length === 0 || !paymentMethod) {
      toast.info("Preencha todas as etapas obrigatórias para finalizar.");
      return;
    }

    addOrder({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      customerName: name.trim(),
      customerPhone: phone.trim(),
      customerAddress: savedAddress || address,
      paymentMethod,
      deliveryFee,
      subtotal: totalPrice,
      total: finalTotal,
      items: items.map((item) => ({ ...item })),
    });

    window.open(whatsappHref, "_blank", "noopener,noreferrer");
    clearCart();
    setIsCartOpen(false);
    toast.success("Pedido enviado com sucesso!");
  };

  if (!isCartOpen) return null;

  const paymentLabel =
    paymentMethod === "pix" ? "Pix (5% desconto)" :
    paymentMethod === "debito" ? "Débito" :
    paymentMethod === "credito" ? "Crédito" :
    paymentMethod === "dinheiro" ? "Dinheiro" : "-";

  return (
    <div className="fixed inset-0 z-[90] flex justify-end">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={closeCart} />
      <div className="relative flex h-full w-full max-w-md flex-col bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border bg-primary px-5 py-4">
          <div className="flex items-center gap-2">
            {step !== "cart" && (
              <button
                onClick={() => {
                  const stepOrder: CheckoutStep[] = ["cart", "delivery", "payment", "confirmation"];
                  const idx = stepOrder.indexOf(step);
                  if (idx > 0) setStep(stepOrder[idx - 1]);
                }}
                className="text-primary-foreground/80"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            <h2 className="text-lg font-bold text-primary-foreground">
              {step === "cart" ? "Sua Sacola" : "Checkout"}
            </h2>
          </div>
          <button onClick={closeCart} className="text-primary-foreground/80">
            <X className="h-5 w-5" />
          </button>
        </div>

        {step !== "cart" && items.length > 0 && (
          <div className="border-b border-border">
            <StepIndicator currentStep={step} />
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {step === "cart" && (
            <div className="p-5">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
                  <ShoppingBag className="h-12 w-12" />
                  <p className="text-sm">Seu carrinho está vazio</p>
                  <p className="text-center text-sm">Escolha os produtos para continuar.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={handleClearCart}
                      className="text-sm font-medium text-destructive transition-colors hover:text-destructive/80"
                    >
                      Limpar sacola
                    </button>
                  </div>

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
              )}
            </div>
          )}

          {step === "delivery" && (
            <div className="space-y-5 p-5">
              <div className="space-y-4 rounded-2xl border border-border p-4">
                <h3 className="text-sm font-semibold text-foreground">Informações de contato</h3>

                {isEditingContact ? (
                  <>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground">Nome</label>
                      <input value={name} onChange={(e) => handleNameChange(e.target.value)} placeholder="Seu nome" className="h-11 w-full rounded-xl border border-border bg-background px-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none md:text-sm" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground">Telefone</label>
                      <input value={phone} onChange={(e) => handlePhoneChange(e.target.value)} placeholder="(67) 99999-9999" className="h-11 w-full rounded-xl border border-border bg-background px-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none md:text-sm" />
                    </div>
                    <button
                      type="button"
                      onClick={handleSaveContact}
                      disabled={!isContactValid}
                      className={`w-full rounded-xl py-3 text-sm font-semibold ${isContactValid ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                    >
                      Salvar contato
                    </button>
                  </>
                ) : (
                  <div className="rounded-xl border border-border bg-background p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <User className="h-4 w-4 text-primary" />
                          {name}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <Phone className="h-4 w-4 text-primary" />
                          {phone}
                        </div>
                      </div>
                      <button type="button" onClick={() => setIsEditingContact(true)} className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                        <Pencil className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4 rounded-2xl border border-border p-4">
                <h3 className="text-sm font-semibold text-foreground">Endereço de entrega</h3>

                {isEditingAddress ? (
                  <div className="space-y-3">
                    <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Rua, número, bairro, complemento e referência" className="min-h-[96px] w-full rounded-xl border border-border bg-background p-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none md:text-sm" />
                    <button
                      type="button"
                      onClick={handleSaveAddress}
                      disabled={!address.trim()}
                      className={`w-full rounded-xl py-3 text-sm font-semibold ${address.trim() ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                    >
                      Salvar endereço
                    </button>
                  </div>
                ) : (
                  <div className="rounded-xl border border-border bg-background p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex gap-3">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <p className="text-sm text-foreground">{savedAddress}</p>
                      </div>
                      <button type="button" onClick={() => { setAddress(savedAddress); setIsEditingAddress(true); }} className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                        <Pencil className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="rounded-xl bg-secondary p-3 text-sm text-foreground">
                  <p>
                    Taxa do motoboy: <span className="font-bold text-primary">{formatPrice(deliveryFee)}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === "payment" && (
            <div className="space-y-5 p-5">
              <div className="space-y-4 rounded-2xl border border-border p-4">
                <h3 className="text-sm font-semibold text-foreground">Forma de pagamento</h3>

                {isEditingCoupon ? (
                  <div className="rounded-xl border border-border bg-background p-4">
                    <label className="mb-2 block text-sm font-medium text-foreground">Cupom</label>
                    <input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Digite seu cupom"
                      className="h-11 w-full rounded-xl border border-border bg-background px-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none md:text-sm"
                    />
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={handleSaveCoupon}
                        disabled={!couponCode.trim()}
                        className={`flex-1 rounded-xl py-3 text-sm font-semibold ${couponCode.trim() ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                      >
                        Salvar cupom
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (savedCouponCode) {
                            setCouponCode(savedCouponCode);
                            setIsEditingCoupon(false);
                            return;
                          }
                          setCouponCode("");
                          setIsEditingCoupon(false);
                        }}
                        className="rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : savedCouponCode ? (
                  <div className="rounded-xl border border-border bg-background p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <Ticket className="h-4 w-4 text-primary" />
                        <span>{savedCouponCode}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setIsEditingCoupon(true)}
                          className="inline-flex items-center gap-1 text-sm font-medium text-primary"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="inline-flex items-center gap-1 text-sm font-medium text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditingCoupon(true)}
                    className="flex w-full items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-left transition-colors hover:bg-secondary/60"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                        <Ticket className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm font-medium text-foreground">Tem um cupom?</p>
                        <p className="text-xs text-muted-foreground">Clique e insira o código</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setPaymentMethod("pix")}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-sm font-medium transition-colors ${
                    paymentMethod === "pix" ? "border-primary bg-primary/5 text-foreground" : "border-border text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span>Pix</span>
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">5% desconto</span>
                  </div>
                  <div className={`h-5 w-5 rounded-full border-2 ${paymentMethod === "pix" ? "border-primary bg-primary" : "border-muted-foreground/30"}`}>
                    {paymentMethod === "pix" && <Check className="h-full w-full p-0.5 text-primary-foreground" />}
                  </div>
                </button>

                <div className="space-y-2">
                  <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Pagar na entrega</h4>

                  {(["debito", "credito", "dinheiro"] as const).map((method) => {
                    const labels = { debito: "Débito", credito: "Crédito", dinheiro: "Dinheiro" };
                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-sm font-medium transition-colors ${paymentMethod === method ? "border-primary bg-primary/5 text-foreground" : "border-border text-foreground"}`}
                      >
                        <span>{labels[method]}</span>
                        <div className={`h-5 w-5 rounded-full border-2 ${paymentMethod === method ? "border-primary bg-primary" : "border-muted-foreground/30"}`}>
                          {paymentMethod === method && <Check className="h-full w-full p-0.5 text-primary-foreground" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {paymentMethod === "dinheiro" && (
                  <div className="space-y-3 rounded-xl bg-secondary p-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-foreground">Precisa de troco?</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button type="button" onClick={() => setNeedsChange("sim")} className={`rounded-xl border px-3 py-3 text-sm font-medium ${needsChange === "sim" ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground"}`}>
                          Sim
                        </button>
                        <button type="button" onClick={() => setNeedsChange("não")} className={`rounded-xl border px-3 py-3 text-sm font-medium ${needsChange === "não" ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground"}`}>
                          Não
                        </button>
                      </div>
                    </div>
                    {needsChange === "sim" && (
                      <div>
                        <label className="mb-2 block text-sm font-medium text-foreground">Troco para quanto?</label>
                        <input value={changeFor} onChange={(e) => setChangeFor(formatCurrencyInput(e.target.value))} placeholder="Ex: 100,00" className="h-11 w-full rounded-xl border border-border bg-background px-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none md:text-sm" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2 rounded-2xl border border-border p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-foreground">{formatPrice(totalPrice)}</span>
                </div>
                {paymentMethod === "pix" && (
                  <div className="flex justify-between text-primary">
                    <span>Desconto Pix</span>
                    <span className="font-medium">-{formatPrice(pixDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxa de entrega</span>
                  <span className="font-medium text-foreground">{formatPrice(deliveryFee)}</span>
                </div>
                <div className="border-t border-border pt-2">
                  <div className="flex justify-between text-base">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="text-lg font-bold text-primary">{formatPrice(finalTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === "confirmation" && (
            <div className="space-y-5 p-5">
              <div className="rounded-2xl border border-border p-4">
                <h3 className="mb-3 text-sm font-semibold text-foreground">Informações para entrega</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <User className="h-4 w-4 text-primary" />
                    <span>{name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Phone className="h-4 w-4 text-primary" />
                    <span>{phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{savedAddress || address || "-"}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border p-4">
                <h3 className="mb-3 text-sm font-semibold text-foreground">Detalhes do pedido</h3>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={`${item.product.id}-${item.selectedVariation ?? "default"}`} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{item.quantity}x</span>
                        <span className="text-foreground">{item.product.name}</span>
                      </div>
                      <span className="font-medium text-foreground">{formatPrice(item.product.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 rounded-2xl border border-border p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pagamento</span>
                  <span className="font-medium text-foreground">{paymentLabel}</span>
                </div>
                {savedCouponCode && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cupom</span>
                    <span className="font-medium text-foreground">{savedCouponCode}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-foreground">{formatPrice(totalPrice)}</span>
                </div>
                {paymentMethod === "pix" && (
                  <div className="flex justify-between text-primary">
                    <span>Desconto Pix</span>
                    <span className="font-medium">-{formatPrice(pixDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxa de entrega</span>
                  <span className="font-medium text-foreground">{formatPrice(deliveryFee)}</span>
                </div>
                {paymentMethod === "dinheiro" && needsChange === "sim" && changeFor && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Troco para</span>
                    <span className="font-medium text-foreground">R$ {changeFor}</span>
                  </div>
                )}
                <div className="border-t border-border pt-2">
                  <div className="flex justify-between text-base">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="text-lg font-bold text-primary">{formatPrice(finalTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border p-5">
          {step === "cart" && (
            items.length > 0 ? (
              <div>
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal ({totalItems} {totalItems === 1 ? "item" : "itens"})</span>
                  <span className="text-lg font-bold text-primary">{formatPrice(totalPrice)}</span>
                </div>
                <button type="button" onClick={goToDelivery} className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground">
                  Continuar
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => toast.info("Escolha os produtos para continuar.")} className="w-full rounded-xl bg-muted py-3.5 text-sm font-bold text-muted-foreground">
                Escolha os produtos para continuar
              </button>
            )
          )}

          {step === "delivery" && (
            <button
              type="button"
              onClick={goToPayment}
              disabled={!isContactValid || !isAddressValid || isEditingContact || isEditingAddress}
              className={`w-full rounded-xl py-3.5 text-sm font-bold ${
                isContactValid && isAddressValid && !isEditingContact && !isEditingAddress
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              Continuar
            </button>
          )}

          {step === "payment" && (
            <button
              type="button"
              onClick={goToConfirmation}
              disabled={!isPaymentValid}
              className={`w-full rounded-xl py-3.5 text-sm font-bold ${
                isPaymentValid ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              Continuar
            </button>
          )}

          {step === "confirmation" && (
            <button type="button" onClick={handleCheckout} className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground">
              Enviar Pedido via WhatsApp
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartSidebar;