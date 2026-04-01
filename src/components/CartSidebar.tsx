import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import {
  X,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  MapPin,
  Pencil,
  ChevronLeft,
  Check,
  User,
  Phone,
  Ticket,
  ChevronRight,
  Loader2,
  CreditCard,
  Wallet,
  Receipt,
  Store,
  Copy,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { useFreight } from "@/hooks/use-calculator-freight";


import AddressSearch, { type StructuredAddress } from "@/components/checkout/AddressSearch";
import SavedAddressesList from "@/components/checkout/SavedAddressesList";
import CartItemImage from "@/components/CartItemImage";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const SESSION_ADDRESS_KEY = "podemais-checkout-address";
const SESSION_ADDRESSES_KEY = "podemais-checkout-addresses";
const SESSION_NAME_KEY = "podemais-checkout-name";
const SESSION_PHONE_KEY = "podemais-checkout-phone";
const PIX_KEY = "(67) 99213-0201";
const PIX_HOLDER = "Wesley Thieko de Aguiar Kumagai";

const CREDIT_INSTALLMENTS = [
  { value: 1, interest: 0 },
  { value: 2, interest: 5.95 },
  { value: 3, interest: 6.5 },
  { value: 4, interest: 7.05 },
  { value: 5, interest: 7.99 },
  { value: 6, interest: 8.99 },
] as const;

const formatPrice = (price: number) => `R$ ${price.toFixed(2).replace(".", ",")}`;

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

const parseCurrencyInput = (value: string) => {
  const normalized = value.replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

type PaymentMethod = "pix" | "debito" | "credito" | "dinheiro";
type CheckoutStep = "cart" | "delivery" | "payment" | "confirmation";
type CreditMode = "avista" | "parcelado";

type FinalizedOrder = {
  id: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  orderNote: string;
  paymentMethod: PaymentMethod;
  paymentLabel: string;
  deliveryFee: number;
  subtotal: number;
  total: number;
  pixDiscount: number;
  creditMode: CreditMode;
  creditInstallments: number;
  creditInterest: number;
  savedCouponCode: string;
  needsChange: string;
  changeFor: string;
  items: Array<{
    product: {
      id: string;
      name: string;
      image: string;
      price: number;
      variationGroup?: { name: string; options: { label: string; available: boolean }[] };
    };
    quantity: number;
    selectedVariation?: string;
  }>;
};

const STEPS: { key: CheckoutStep; label: string }[] = [
  { key: "cart", label: "Sacola" },
  { key: "delivery", label: "Entrega" },
  { key: "payment", label: "Pagamento" },
  { key: "confirmation", label: "Revisão" },
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
              <div className={`mx-1 h-0.5 w-5 sm:w-10 ${isDone ? "bg-primary" : "bg-border"}`} />
            )}
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${isDone || isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
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

const paymentOptions: {
  value: PaymentMethod;
  title: string;
  subtitle: string;
  icon: typeof Wallet;
  highlight?: string;
}[] = [
    {
      value: "pix",
      title: "Pix",
      subtitle: "Pagamento instantâneo com 5% de desconto",
      icon: Wallet,
      highlight: "5% OFF",
    },
    {
      value: "debito",
      title: "Cartão de débito",
      subtitle: "Pague na entrega",
      icon: CreditCard,
    },
    {
      value: "credito",
      title: "Cartão de crédito",
      subtitle: "Pague na entrega",
      icon: CreditCard,
    },
    {
      value: "dinheiro",
      title: "Dinheiro",
      subtitle: "Leve troco se precisar",
      icon: Receipt,
    },
  ];

const CartSidebar = () => {
  const { calculate } = useFreight();
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    totalPrice,
    totalItems,
    addOrder,
    clearCart,
  } = useCart();

  const [step, setStep] = useState<CheckoutStep>("cart");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [structuredAddress, setStructuredAddress] = useState<StructuredAddress | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<StructuredAddress[]>([]);
  const [editingAddress, setEditingAddress] = useState<StructuredAddress | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isShowingSavedAddresses, setIsShowingSavedAddresses] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [deliveryDistanceKm, setDeliveryDistanceKm] = useState<number | null>(null);
  const [deliveryError, setDeliveryError] = useState<string>("");
  const [orderNote, setOrderNote] = useState("");
  const [isCalculatingFee, setIsCalculatingFee] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [creditMode, setCreditMode] = useState<CreditMode>("avista");
  const [creditInstallments, setCreditInstallments] = useState(1);
  const [needsChange, setNeedsChange] = useState("não");
  const [changeFor, setChangeFor] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [savedCouponCode, setSavedCouponCode] = useState("");
  const [isEditingCoupon, setIsEditingCoupon] = useState(false);
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [hasCopiedPix, setHasCopiedPix] = useState(false);
  const [finalizedOrder, setFinalizedOrder] = useState<FinalizedOrder | null>(null);
  const previousTotalItems = useRef(totalItems);
  useEffect(() => {
    const storedAddress = sessionStorage.getItem(SESSION_ADDRESS_KEY);
    const storedAddresses = sessionStorage.getItem(SESSION_ADDRESSES_KEY);
    const storedName = sessionStorage.getItem(SESSION_NAME_KEY) ?? "";
    const storedPhone = sessionStorage.getItem(SESSION_PHONE_KEY) ?? "";
    if (storedAddresses) {
      try {
        const parsedAddresses = JSON.parse(storedAddresses) as StructuredAddress[];
        setSavedAddresses(parsedAddresses);
      } catch {
        setSavedAddresses([]);
      }
    }
    if (storedAddress) {
      try {
        const parsed = JSON.parse(storedAddress) as StructuredAddress;
        setStructuredAddress(parsed);

        const fullDest = [parsed.fullText, parsed.complement]
          .filter(Boolean)
          .join(", ");
        calculate(fullDest).then((result) => {
          if (!result) return;
          if (result.error) {
            setDeliveryFee(0);
            setDeliveryDistanceKm(result.distanceKm ?? null);
            setDeliveryError(result.error || "");
            return;
          }
          if ('freightPrice' in result && typeof result.freightPrice === "number") {
            setDeliveryFee(result.freightPrice);
            setDeliveryDistanceKm(result.distanceKm ?? null);
            setDeliveryError("");
          } else {
            setDeliveryFee(0);
            setDeliveryDistanceKm(result.distanceKm ?? null);
            setDeliveryError(result.error || "");
          }
        });
      } catch {
      }
    }

    if (storedName) setName(storedName);
    if (storedPhone) setPhone(storedPhone);
    if (storedName && storedPhone) setIsEditingContact(false);
  }, [calculate]);

  useEffect(() => {
    if (!isCartOpen && !isFinishModalOpen) {
      setStep("cart");
      setPaymentMethod(null);
      setCreditMode("avista");
      setCreditInstallments(1);
      setNeedsChange("não");
      setChangeFor("");
      setEditingAddress(null);
      setIsAddressModalOpen(false);
      setIsShowingSavedAddresses(false);
      setHasCopiedPix(false);
    }
  }, [isCartOpen, isFinishModalOpen]);

  useEffect(() => {
    if (previousTotalItems.current > 0 && totalItems === 0) {
      setStep("cart");
    }
    previousTotalItems.current = totalItems;
  }, [totalItems]);

  const pixDiscount = useMemo(() => totalPrice * 0.05, [totalPrice]);
  const totalWithPixDiscount = useMemo(() => totalPrice - pixDiscount, [totalPrice, pixDiscount]);
  const effectiveCreditInstallments = paymentMethod === "credito" && creditMode === "parcelado" ? creditInstallments : 1;
  const selectedInstallment =
    CREDIT_INSTALLMENTS.find((installment) => installment.value === effectiveCreditInstallments) ?? CREDIT_INSTALLMENTS[0];

  const creditTotal = useMemo(() => {
    if (paymentMethod !== "credito") return totalPrice;
    return totalPrice * (1 + selectedInstallment.interest / 100);
  }, [paymentMethod, selectedInstallment.interest, totalPrice]);

  const discountedProductsTotal = useMemo(() => {
    if (paymentMethod === "pix") return totalWithPixDiscount;
    if (paymentMethod === "credito") return creditTotal;
    return totalPrice;
  }, [paymentMethod, totalWithPixDiscount, creditTotal, totalPrice]);

  const finalTotal = discountedProductsTotal + deliveryFee;
  const parsedChangeFor = parseCurrencyInput(changeFor);
  const isChangeEnough = needsChange === "não" || parsedChangeFor >= finalTotal;
  const isContactValid = name.trim().length > 0 && phone.replace(/\D/g, "").length >= 10;
  const isAddressValid = structuredAddress !== null;
  const hasValidDeliveryFee = deliveryFee > 0 && !deliveryError;

  const savedAddressDisplay = useMemo(() => {
    if (!structuredAddress) return "";
    const parts = [structuredAddress.mainText, structuredAddress.secondaryText];
    if (structuredAddress.complement) parts.push(`Complemento: ${structuredAddress.complement}`);
    if (structuredAddress.reference) parts.push(`Referência: ${structuredAddress.reference}`);
    return parts.join(", ");
  }, [structuredAddress]);

  const paymentLabel =
    paymentMethod === "pix"
      ? "PIX"
      : paymentMethod === "debito"
        ? "Cartão de débito"
        : paymentMethod === "credito"
          ? creditMode === "parcelado"
            ? `Cartão de crédito - ${effectiveCreditInstallments}x`
            : "Cartão de crédito à vista"
          : paymentMethod === "dinheiro"
            ? "Dinheiro"
            : "-";

  const persistAddresses = (addresses: StructuredAddress[]) => {
    setSavedAddresses(addresses);
    sessionStorage.setItem(SESSION_ADDRESSES_KEY, JSON.stringify(addresses));
  };

  const calculateDeliveryFee = useCallback(
    async (addr: StructuredAddress) => {
      setIsCalculatingFee(true);
      setDeliveryError("");

      try {
        const fullDest = [addr.fullText, addr.complement]
          .filter(Boolean)
          .join(", ");
        const result = await calculate(fullDest);

        if (!result) return;
        if (result.error) {
          setDeliveryFee(0);
          setDeliveryDistanceKm(result.distanceKm ?? null);
          setDeliveryError(result.error || "Não foi possível calcular a entrega.");
          return;
        }
        if ('freightPrice' in result && typeof result.freightPrice === "number") {
          setDeliveryFee(result.freightPrice);
          setDeliveryDistanceKm(result.distanceKm ?? null);
          setDeliveryError("");
          return;
        }

        setDeliveryFee(0);
        setDeliveryDistanceKm(result.distanceKm ?? null);
        setDeliveryError(result.error || "Não foi possível calcular a entrega.");

        if (result.error) {
          toast.info(result.error);
        }
      } catch {
        setDeliveryFee(0);
        setDeliveryDistanceKm(null);
        setDeliveryError("Não foi possível calcular a entrega.");
        toast.info("Não foi possível calcular a entrega.");
      } finally {
        setIsCalculatingFee(false);
      }
    },
    [calculate]
  );

  const hasSelectedPaymentMethod = paymentMethod !== null;
  const isPaymentValid =
    hasSelectedPaymentMethod &&
    (paymentMethod !== "dinheiro" || needsChange === "não" || (changeFor.trim().length > 0 && isChangeEnough));
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

  const handleSaveAddress = useCallback((addr: StructuredAddress) => {
    const nextAddress = {
      ...addr,
      id: addr.id || crypto.randomUUID(),
    };

    const nextAddresses = [...savedAddresses.filter((item) => item.id !== nextAddress.id), nextAddress];
    persistAddresses(nextAddresses);
    setStructuredAddress(nextAddress);
    sessionStorage.setItem(SESSION_ADDRESS_KEY, JSON.stringify(nextAddress));
    setEditingAddress(null);
    setIsAddressModalOpen(false);
    setIsShowingSavedAddresses(false);
    calculateDeliveryFee(nextAddress);
  }, [calculateDeliveryFee, savedAddresses]);

  const handleSelectSavedAddress = useCallback((addr: StructuredAddress) => {
    setStructuredAddress(addr);
    sessionStorage.setItem(SESSION_ADDRESS_KEY, JSON.stringify(addr));
    setEditingAddress(null);
    setIsAddressModalOpen(false);
    setIsShowingSavedAddresses(false);
    calculateDeliveryFee(addr);
  }, [calculateDeliveryFee]);

  const handleEditSavedAddress = (addr: StructuredAddress) => {
    setEditingAddress(addr);
    setIsShowingSavedAddresses(false);
  };

  const handleDeleteSavedAddress = (addressId: string) => {
    const nextAddresses = savedAddresses.filter((address) => address.id !== addressId);
    persistAddresses(nextAddresses);

    if (structuredAddress?.id === addressId) {
      setStructuredAddress(null);
      sessionStorage.removeItem(SESSION_ADDRESS_KEY);
      setDeliveryFee(0);
      setDeliveryDistanceKm(null);
      setDeliveryError("");
    }
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

  const handleRemoveItem = (productId: string, selectedVariation?: string) => {
    removeFromCart(productId, selectedVariation);
  };

  const handleClearCart = () => {
    clearCart();
  };

  const goToDelivery = () => {
    if (!items.length) return;
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

    if (!isAddressValid) {
      toast.info("Selecione um endereço de entrega para continuar.");
      return;
    }

    if (!hasValidDeliveryFee) {
      toast.info(deliveryError || "A entrega precisa ser calculada antes de continuar.");
      return;
    }

    setPaymentMethod(null);
    setCreditMode("avista");
    setCreditInstallments(1);
    setNeedsChange("não");
    setChangeFor("");
    setStep("payment");
  };

  const goToConfirmation = () => {
    if (!hasSelectedPaymentMethod) {
      toast.info("Selecione uma forma de pagamento para continuar.");
      return;
    }

    if (paymentMethod === "dinheiro" && needsChange === "sim" && !changeFor.trim()) {
      toast.info("Informe o valor do troco para continuar.");
      return;
    }

    if (paymentMethod === "dinheiro" && needsChange === "sim" && !isChangeEnough) {
      toast.info("O troco precisa ser para um valor maior ou igual ao total com entrega.");
      return;
    }

    if (!isPaymentValid) {
      toast.info("Informe o troco para continuar.");
      return;
    }

    setStep("confirmation");
  };

  const checkoutItems = finalizedOrder?.items ?? items;
  const checkoutName = finalizedOrder?.customerName ?? name;
  const checkoutPhone = finalizedOrder?.customerPhone ?? phone;
  const checkoutAddress = finalizedOrder?.customerAddress ?? savedAddressDisplay;
  const checkoutOrderNote = finalizedOrder?.orderNote ?? orderNote;
  const checkoutSubtotal = finalizedOrder?.subtotal ?? totalPrice;
  const checkoutDeliveryFee = finalizedOrder?.deliveryFee ?? deliveryFee;
  const checkoutTotal = finalizedOrder?.total ?? finalTotal;
  const checkoutPixDiscount = finalizedOrder?.pixDiscount ?? pixDiscount;
  const checkoutSavedCouponCode = finalizedOrder?.savedCouponCode ?? savedCouponCode;
  const checkoutPaymentMethod = finalizedOrder?.paymentMethod ?? paymentMethod;
  const checkoutPaymentLabel = finalizedOrder?.paymentLabel ?? paymentLabel;
  const checkoutCreditMode = finalizedOrder?.creditMode ?? creditMode;
  const checkoutCreditInstallments = finalizedOrder?.creditInstallments ?? effectiveCreditInstallments;
  const checkoutCreditInterest = finalizedOrder?.creditInterest ?? selectedInstallment.interest;
  const checkoutNeedsChange = finalizedOrder?.needsChange ?? needsChange;
  const checkoutChangeFor = finalizedOrder?.changeFor ?? changeFor;

  const checkoutMessage = useMemo(() => encodeURIComponent([
    "Olá! Gostaria de finalizar meu pedido:",
    "",
    ...checkoutItems.map((item) => `${item.quantity}x ${item.product.name}${item.selectedVariation ? ` (${item.product.variationGroup?.name}: ${item.selectedVariation})` : ""} - ${formatPrice(item.product.price * item.quantity)}`),
    "",
    `Nome: ${checkoutName || "-"}`,
    `Telefone: ${checkoutPhone || "-"}`,
    `Endereço completo: ${checkoutAddress || "-"}`,
    ...(checkoutOrderNote.trim() ? [`Observação do pedido: ${checkoutOrderNote.trim()}`] : []),
    ...(checkoutSavedCouponCode ? [`Cupom: ${checkoutSavedCouponCode}`] : []),
    "",
    `Subtotal dos produtos: ${formatPrice(checkoutSubtotal)}`,
    ...(checkoutPaymentMethod === "pix" ? [`Desconto Pix: -${formatPrice(checkoutPixDiscount)}`] : []),
    ...(checkoutPaymentMethod === "credito" ? [
      `Crédito: ${checkoutCreditMode === "avista" ? "À vista" : "Parcelado"}`,
      ...(checkoutCreditMode === "parcelado" ? [
        `Parcelamento: ${checkoutCreditInstallments}x`,
        ...(checkoutCreditInterest > 0 ? [`Juros do crédito: +${checkoutCreditInterest.toFixed(2).replace(".", ",")}%`] : []),
      ] : []),
    ] : []),
    checkoutPaymentMethod === "pix"
      ? `Forma de pagamento: Pix - Total com desconto: ${formatPrice(checkoutSubtotal - checkoutPixDiscount)}`
      : checkoutPaymentMethod === "debito"
        ? "Forma de pagamento: Débito"
        : checkoutPaymentMethod === "credito"
          ? checkoutCreditMode === "parcelado"
            ? `Forma de pagamento: Crédito parcelado - ${checkoutCreditInstallments}x de ${formatPrice(checkoutTotal / checkoutCreditInstallments)}`
            : "Forma de pagamento: Crédito à vista"
          : "Forma de pagamento: Dinheiro",
    ...(checkoutPaymentMethod === "dinheiro" ? [
      `Precisa de troco: ${checkoutNeedsChange}`,
      ...(checkoutNeedsChange === "sim" ? [`Troco para: R$ ${checkoutChangeFor}`] : []),
    ] : []),
    ...(checkoutPaymentMethod === "pix" ? [`Chave PIX: ${PIX_KEY}`, `Titular PIX: ${PIX_HOLDER}`] : []),
    `Taxa do motoboy: ${formatPrice(checkoutDeliveryFee)}`,
    `Total final com entrega: ${formatPrice(checkoutTotal)}`,
  ].join("\n")), [
    checkoutAddress,
    checkoutChangeFor,
    checkoutCreditInstallments,
    checkoutCreditInterest,
    checkoutCreditMode,
    checkoutDeliveryFee,
    checkoutItems,
    checkoutName,
    checkoutNeedsChange,
    checkoutOrderNote,
    checkoutPaymentMethod,
    checkoutPhone,
    checkoutPixDiscount,
    checkoutSavedCouponCode,
    checkoutSubtotal,
    checkoutTotal,
  ]);

  const finalizeOrder = () => {
    if (!isContactValid || !isAddressValid || !isPaymentValid || items.length === 0 || !paymentMethod || !hasValidDeliveryFee) {
      toast.info("Preencha todas as etapas obrigatórias para finalizar.");
      return;
    }

    if (paymentMethod === "dinheiro" && needsChange === "sim" && !isChangeEnough) {
      toast.info("O troco precisa ser para um valor maior ou igual ao total com entrega.");
      return;
    }

    const orderItems = items.map((item) => ({ ...item }));
    const orderId = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    addOrder({
      id: orderId,
      createdAt,
      customerName: name.trim(),
      customerPhone: phone.trim(),
      customerAddress: savedAddressDisplay,
      paymentMethod,
      deliveryFee,
      subtotal: totalPrice,
      total: finalTotal,
      items: orderItems,
    });

    setFinalizedOrder({
      id: orderId,
      createdAt,
      customerName: name.trim(),
      customerPhone: phone.trim(),
      customerAddress: savedAddressDisplay,
      orderNote,
      paymentMethod,
      paymentLabel,
      deliveryFee,
      subtotal: totalPrice,
      total: finalTotal,
      pixDiscount,
      creditMode,
      creditInstallments: effectiveCreditInstallments,
      creditInterest: selectedInstallment.interest,
      savedCouponCode,
      needsChange,
      changeFor,
      items: orderItems,
    });

    clearCart();
    setHasCopiedPix(paymentMethod !== "pix");
    setIsCartOpen(false);
    setIsFinishModalOpen(true);
  };

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(PIX_KEY);
      setHasCopiedPix(true);
    } catch {
      toast.error("Não foi possível copiar a chave PIX.");
    }
  };

  const handleSendWhatsApp = () => {
    const numero = "5567991032937";
    const urlApp = `whatsapp://send?phone=${numero}&text=${checkoutMessage}`;
    const urlWeb = `https://wa.me/${numero}?text=${checkoutMessage}`;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    setIsFinishModalOpen(false);
    setIsCartOpen(false);
    if (isMobile) {
      window.location.href = urlApp;
      setTimeout(() => {
        if (document.visibilityState === "visible") {
          window.open(urlWeb, "_blank", "noopener,noreferrer");
        }
      }, 1500);
    } else {
      window.open(urlWeb, "_blank", "noopener,noreferrer");
    }
  };

  const canContinueDelivery = isContactValid && isAddressValid && !isEditingContact && hasValidDeliveryFee;
  const finishOrderNumber = finalizedOrder ? finalizedOrder.id.slice(-4) : Date.now().toString().slice(-4);
  const finishDate = finalizedOrder ? new Date(finalizedOrder.createdAt) : new Date();

  return (
    <>
      {isCartOpen && (
        <div className="fixed inset-0 z-[90] flex justify-end">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={closeCart} />
          <div className="relative flex h-full w-full max-w-md flex-col bg-[#f7f7f7] shadow-2xl">
            <div className="flex items-center justify-between bg-primary px-5 py-4 text-primary-foreground">
              <div className="flex items-center gap-2">
                {step !== "cart" && (
                  <button
                    onClick={() => {
                      const stepOrder: CheckoutStep[] = ["cart", "delivery", "payment", "confirmation"];
                      const idx = stepOrder.indexOf(step);
                      if (idx > 0) setStep(stepOrder[idx - 1]);
                    }}
                    className="rounded-full p-1 text-primary-foreground/90"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                )}
                <div>
                  <p className="text-xs font-medium text-primary-foreground/80">Entrega rápida</p>
                  <h2 className="text-lg font-bold">{step === "cart" ? "Sua Sacola" : "Finalizar pedido"}</h2>
                </div>
              </div>
              <button onClick={closeCart} className="rounded-full p-1 text-primary-foreground/90">
                <X className="h-5 w-5" />
              </button>
            </div>

            {step !== "cart" && items.length > 0 && (
              <div className="border-b border-border bg-card">
                <StepIndicator currentStep={step} />
              </div>
            )}

            <div className="flex-1 overflow-y-auto">
              {step === "cart" && (
                <div className="space-y-4 p-4">
                  <div className="rounded-3xl bg-card p-4 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <Store className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">Seu pedido</p>
                          <p className="text-xs text-muted-foreground">Revise os itens antes de continuar</p>
                        </div>
                      </div>
                      {items.length > 0 && (
                        <button
                          type="button"
                          onClick={handleClearCart}
                          className="text-sm font-medium text-destructive transition-colors hover:text-destructive/80"
                        >
                          Limpar
                        </button>
                      )}
                    </div>

                    {items.length === 0 ? (
                      <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
                        <ShoppingBag className="h-12 w-12" />
                        <p className="text-sm font-medium">Sua sacola está vazia</p>
                        <p className="text-center text-sm">Adicione produtos para iniciar o checkout.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {items.map((item) => (
                          <div
                            key={`${item.product.id}-${item.selectedVariation ?? "default"}`}
                            className="rounded-2xl border border-border bg-background p-3"
                          >
                            <div className="flex gap-3">
                              <CartItemImage
                                productId={item.product.id}
                                productImage={item.product.image}
                                productName={item.product.name}
                                className="h-16 w-16 rounded-xl bg-secondary/30"
                              />
                              <div className="flex flex-1 flex-col justify-between gap-2">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <p className="line-clamp-2 text-sm font-semibold text-foreground">{item.product.name}</p>
                                    {item.selectedVariation && (
                                      <p className="mt-1 text-xs text-muted-foreground">
                                        {item.product.variationGroup?.name}: {item.selectedVariation}
                                      </p>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => handleRemoveItem(item.product.id, item.selectedVariation)}
                                    className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-secondary"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1 rounded-full border border-border bg-card px-1 py-1">
                                    <button
                                      onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.selectedVariation)}
                                      className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary"
                                    >
                                      <Minus className="h-3 w-3" />
                                    </button>
                                    <span className="min-w-[28px] text-center text-sm font-semibold text-foreground">
                                      {item.quantity}
                                    </span>
                                    <button
                                      onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedVariation)}
                                      className="rounded-full bg-primary p-1.5 text-primary-foreground"
                                    >
                                      <Plus className="h-3 w-3" />
                                    </button>
                                  </div>
                                  <p className="text-sm font-bold text-foreground">
                                    {formatPrice(item.product.price * item.quantity)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === "delivery" && (
                <div className="space-y-4 p-4">
                  <div className="rounded-3xl bg-card p-4 shadow-sm">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">Seus dados</h3>
                        <p className="text-xs text-muted-foreground">Quem vai receber o pedido?</p>
                      </div>
                    </div>

                    {isEditingContact ? (
                      <div className="space-y-3">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-foreground">Nome</label>
                          <input
                            value={name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            placeholder="Seu nome"
                            className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-base text-foreground placeholder:text-muted-foreground outline-none focus:outline-none md:text-sm"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-foreground">Telefone</label>
                          <input
                            type="tel"
                            inputMode="numeric"
                            autoComplete="tel"
                            value={phone}
                            onChange={(e) => handlePhoneChange(e.target.value)}
                            placeholder="(67) 99999-9999"
                            className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-base text-foreground placeholder:text-muted-foreground outline-none focus:outline-none md:text-sm"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleSaveContact}
                          disabled={!isContactValid}
                          className={`w-full rounded-2xl py-3 text-sm font-semibold ${isContactValid ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                            }`}
                        >
                          Salvar contato
                        </button>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-border bg-background p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-foreground">
                              <User className="h-4 w-4 text-primary" />
                              {name}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-foreground">
                              <Phone className="h-4 w-4 text-primary" />
                              {phone}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsEditingContact(true)}
                            className="inline-flex items-center gap-1 text-sm font-medium text-primary"
                          >
                            <Pencil className="h-4 w-4" />
                            Editar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="rounded-3xl bg-card p-4 shadow-sm">
                    {structuredAddress ? (
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex gap-3">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
                          <div>
                            <p className="text-sm font-semibold text-foreground">{structuredAddress.mainText}</p>
                            <p className="text-xs text-muted-foreground">{structuredAddress.secondaryText}</p>
                            {structuredAddress.complement && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                Complemento: {structuredAddress.complement}
                              </p>
                            )}
                            {structuredAddress.reference && (
                              <p className="text-xs text-muted-foreground">
                                Referência: {structuredAddress.reference}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingAddress(null);
                            setIsShowingSavedAddresses(savedAddresses.length > 0);
                            setIsAddressModalOpen(true);
                          }}
                          className="text-sm font-medium text-primary"
                        >
                          Trocar
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAddress(null);
                          setIsShowingSavedAddresses(false);
                          setIsAddressModalOpen(true);
                        }}
                        className="flex w-full items-center justify-between rounded-2xl border border-border bg-background px-4 py-4 text-left"
                      >
                        <div>
                          <p className="text-sm font-semibold text-foreground">Cadastrar endereço</p>
                          <p className="text-xs text-muted-foreground">Informe onde deseja receber seu pedido</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    )}
                  </div>

                  <div className="rounded-3xl bg-card p-4 shadow-sm">
                    <div className="mb-4">
                      <label className="mb-2 block text-sm font-medium text-foreground">Observação do pedido</label>
                      <textarea
                        value={orderNote}
                        onChange={(e) => setOrderNote(e.target.value)}
                        placeholder="Ex: tocar interfone, entregar na portaria, sem pressa..."
                        rows={3}
                        className="w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground outline-none focus:outline-none md:text-sm"
                      />
                    </div>

                    {isCalculatingFee ? (
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span>Calculando total com entrega...</span>
                      </div>
                    ) : deliveryError ? (
                      <p className="text-sm font-semibold text-destructive">{deliveryError}</p>
                    ) : (
                      <div className="flex items-center justify-between text-base">
                        <span className="font-medium text-muted-foreground">Total com entrega</span>
                        <span className="text-lg font-bold text-primary">{formatPrice(totalPrice + deliveryFee)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === "payment" && (
                <div className="space-y-4 p-4">
                  <div className="rounded-3xl bg-card p-4 shadow-sm">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Wallet className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">Pagamento</h3>
                        <p className="text-xs text-muted-foreground">Escolha como deseja pagar</p>
                      </div>
                    </div>

                    {isEditingCoupon ? (
                      <div className="mb-4 rounded-2xl border border-border bg-background p-4">
                        <label className="mb-2 block text-sm font-medium text-foreground">Cupom</label>
                        <input
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="Digite seu cupom"
                          className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-base text-foreground placeholder:text-muted-foreground outline-none focus:outline-none md:text-sm"
                        />
                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={handleSaveCoupon}
                            disabled={!couponCode.trim()}
                            className={`flex-1 rounded-2xl py-3 text-sm font-semibold ${couponCode.trim() ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                              }`}
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
                            className="rounded-2xl border border-border px-4 py-3 text-sm font-medium text-foreground"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : savedCouponCode ? (
                      <div className="mb-4 rounded-2xl border border-border bg-background p-4">
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
                        className="mb-4 flex w-full items-center justify-between rounded-2xl border border-border bg-background px-4 py-3 text-left transition-colors hover:bg-secondary/60"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                            <Ticket className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="text-sm font-medium text-foreground">Adicionar cupom</p>
                            <p className="text-xs text-muted-foreground">Se você tiver um código promocional</p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    )}

                    <div className="space-y-3">
                      {paymentOptions.map((option) => {
                        const Icon = option.icon;
                        const isSelected = paymentMethod === option.value;

                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setPaymentMethod(option.value);
                              if (option.value === "credito") {
                                setCreditMode("avista");
                                setCreditInstallments(1);
                              }
                            }}
                            className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition-colors ${isSelected ? "border-primary bg-primary/5" : "border-border bg-background"
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-10 w-10 items-center justify-center rounded-xl ${isSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                                  }`}
                              >
                                <Icon className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-semibold text-foreground">{option.title}</p>
                                  {option.highlight && (
                                    <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                                      {option.highlight}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">{option.subtitle}</p>
                              </div>
                            </div>
                            <div
                              className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${isSelected ? "border-primary bg-primary" : "border-muted-foreground/30"
                                }`}
                            >
                              {isSelected && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {paymentMethod === "credito" && (
                      <div className="mt-4 rounded-2xl bg-secondary p-4">
                        <label className="mb-2 block text-sm font-medium text-foreground">No crédito</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setCreditMode("avista");
                              setCreditInstallments(1);
                            }}
                            className={`rounded-2xl border px-3 py-3 text-sm font-medium ${creditMode === "avista"
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background text-foreground"
                              }`}
                          >
                            À vista
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCreditMode("parcelado");
                              if (creditInstallments < 2) setCreditInstallments(2);
                            }}
                            className={`rounded-2xl border px-3 py-3 text-sm font-medium ${creditMode === "parcelado"
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background text-foreground"
                              }`}
                          >
                            Parcelado
                          </button>
                        </div>

                        {creditMode === "parcelado" && (
                          <div className="mt-4 space-y-2">
                            {CREDIT_INSTALLMENTS.filter((installment) => installment.value >= 2).map((installment) => {
                              const totalInstallmentPrice = totalPrice * (1 + installment.interest / 100);
                              const perInstallment = totalInstallmentPrice / installment.value;
                              const isSelected = creditInstallments === installment.value;

                              return (
                                <button
                                  key={installment.value}
                                  type="button"
                                  onClick={() => setCreditInstallments(installment.value)}
                                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left ${isSelected ? "border-primary bg-background" : "border-border bg-background/70"
                                    }`}
                                >
                                  <div>
                                    <p className="text-sm font-semibold text-foreground">
                                      {installment.value}x de {formatPrice(perInstallment)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      + {installment.interest.toFixed(2).replace(".", ",")}%
                                    </p>
                                  </div>
                                  <span className="text-sm font-medium text-foreground">
                                    {formatPrice(totalInstallmentPrice)}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {paymentMethod === "dinheiro" && (
                      <div className="mt-4 space-y-3 rounded-2xl bg-secondary p-4">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-foreground">Precisa de troco?</label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setNeedsChange("sim")}
                              className={`rounded-2xl border px-3 py-3 text-sm font-medium ${needsChange === "sim"
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background text-foreground"
                                }`}
                            >
                              Sim
                            </button>
                            <button
                              type="button"
                              onClick={() => setNeedsChange("não")}
                              className={`rounded-2xl border px-3 py-3 text-sm font-medium ${needsChange === "não"
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background text-foreground"
                                }`}
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
                              onChange={(e) => setChangeFor(formatCurrencyInput(e.target.value))}
                              inputMode="numeric"
                              pattern="[0-9]*"
                              placeholder="Ex: 100,00"
                              className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-base text-foreground placeholder:text-muted-foreground outline-none focus:outline-none md:text-sm"
                            />
                            {!isChangeEnough && changeFor.trim().length > 0 && (
                              <p className="mt-2 text-sm text-destructive">
                                O valor do troco deve ser maior ou igual a {formatPrice(finalTotal)}.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="rounded-3xl bg-card p-4 text-sm shadow-sm">
                    <h3 className="mb-3 text-sm font-semibold text-foreground">Resumo</h3>
                    <div className="space-y-2">
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
                      {paymentMethod === "credito" && creditMode === "parcelado" && selectedInstallment.interest > 0 && (
                        <div className="flex justify-between text-primary">
                          <span>Juros do parcelamento</span>
                          <span className="font-medium">+{selectedInstallment.interest.toFixed(2).replace(".", ",")}%</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Entrega</span>
                        <span className="font-medium text-foreground">{formatPrice(deliveryFee)}</span>
                      </div>
                      <div className="border-t border-border pt-3">
                        <div className="flex justify-between text-base">
                          <span className="font-semibold text-foreground">Total</span>
                          <span className="text-lg font-bold text-primary">{formatPrice(finalTotal)}</span>
                        </div>
                        {paymentMethod === "credito" && creditMode === "parcelado" && (
                          <p className="mt-1 text-right text-xs text-muted-foreground">
                            {effectiveCreditInstallments}x de {formatPrice((discountedProductsTotal + deliveryFee) / effectiveCreditInstallments)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === "confirmation" && (
                <div className="space-y-4 p-4">
                  <div className="rounded-3xl bg-card p-4 shadow-sm">
                    <h3 className="mb-3 text-sm font-semibold text-foreground">Entrega</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-foreground">
                        <User className="h-4 w-4 text-primary" />
                        <span>{name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-foreground">
                        <Phone className="h-4 w-4 text-primary" />
                        <span>{phone}</span>
                      </div>
                      <div className="flex items-start gap-2 text-foreground">
                        <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                        <span>{savedAddressDisplay || "-"}</span>
                      </div>
                      {orderNote.trim() && (
                        <div className="flex items-start gap-2 text-foreground">
                          <Pencil className="mt-0.5 h-4 w-4 text-primary" />
                          <span>{orderNote.trim()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-3xl bg-card p-4 shadow-sm">
                    <h3 className="mb-3 text-sm font-semibold text-foreground">Itens do pedido</h3>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div
                          key={`${item.product.id}-${item.selectedVariation ?? "default"}`}
                          className="flex items-center justify-between text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">{item.quantity}x</span>
                            <span className="text-foreground">{item.product.name}</span>
                          </div>
                          <span className="font-medium text-foreground">
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-3xl bg-card p-4 text-sm shadow-sm">
                    <h3 className="mb-3 text-sm font-semibold text-foreground">Pagamento e total</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Forma de pagamento</span>
                        <span className="font-medium text-foreground">{paymentLabel}</span>
                      </div>
                      {paymentMethod === "credito" && creditMode === "parcelado" && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Parcelamento</span>
                          <span className="font-medium text-foreground">
                            {effectiveCreditInstallments}x de {formatPrice(finalTotal / effectiveCreditInstallments)}
                          </span>
                        </div>
                      )}
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
                      {paymentMethod === "credito" && creditMode === "parcelado" && selectedInstallment.interest > 0 && (
                        <div className="flex justify-between text-primary">
                          <span>Juros do parcelamento</span>
                          <span className="font-medium">+{selectedInstallment.interest.toFixed(2).replace(".", ",")}%</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Entrega</span>
                        <span className="font-medium text-foreground">{formatPrice(deliveryFee)}</span>
                      </div>
                      {paymentMethod === "dinheiro" && needsChange === "sim" && changeFor && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Troco para</span>
                          <span className="font-medium text-foreground">R$ {changeFor}</span>
                        </div>
                      )}
                      <div className="border-t border-border pt-3">
                        <div className="flex justify-between text-base">
                          <span className="font-semibold text-foreground">Total</span>
                          <span className="text-lg font-bold text-primary">{formatPrice(finalTotal)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-border bg-card p-4">
              {step === "cart" &&
                (items.length > 0 ? (
                  <div>
                    <div className="mb-3 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Subtotal ({totalItems} {totalItems === 1 ? "item" : "itens"})
                      </span>
                      <span className="text-lg font-bold text-primary">{formatPrice(totalPrice)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={goToDelivery}
                      className="w-full rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground"
                    >
                      Continuar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="w-full rounded-2xl bg-muted py-3.5 text-sm font-bold text-muted-foreground"
                  >
                    Escolha os produtos para continuar
                  </button>
                ))}

              {step === "delivery" && (
                <button
                  type="button"
                  onClick={goToPayment}
                  disabled={!canContinueDelivery}
                  className={`w-full rounded-2xl py-3.5 text-sm font-bold ${canContinueDelivery ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                >
                  Ir para pagamento
                </button>
              )}

              {step === "payment" && (
                <button
                  type="button"
                  onClick={goToConfirmation}
                  disabled={!isPaymentValid}
                  className={`w-full rounded-2xl py-3.5 text-sm font-bold ${isPaymentValid ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                >
                  Revisar pedido
                </button>
              )}

              {step === "confirmation" && (
                <button
                  type="button"
                  onClick={finalizeOrder}
                  className="w-full rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground"
                >
                  Finalizar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {isAddressModalOpen && (
        <div className="fixed inset-0 z-[95] bg-black/40 backdrop-blur-sm md:flex md:justify-end">
          <div className="h-full w-full bg-background md:relative md:mr-0 md:w-full md:max-w-md md:shadow-2xl">
            <div className="mx-auto flex h-full w-full max-w-md flex-col">
              {isShowingSavedAddresses ? (
                <>
                  <div className="flex items-center gap-3 border-b border-border px-4 py-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddressModalOpen(false);
                        setIsShowingSavedAddresses(false);
                      }}
                      className="rounded-full p-1 text-muted-foreground"
                      aria-label="Voltar"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <h3 className="text-base font-semibold text-foreground">Endereços</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto bg-[#f7f7f7] p-4">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAddress(null);
                        setIsShowingSavedAddresses(false);
                      }}
                      className="mb-4 flex w-full items-center justify-between rounded-2xl border border-border bg-background px-4 py-4 text-left"
                    >
                      <div>
                        <p className="text-sm font-semibold text-foreground">Buscar novo endereço</p>
                        <p className="text-xs text-muted-foreground">Digite e selecione pelo Google</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <SavedAddressesList
                      addresses={savedAddresses}
                      selectedAddressId={structuredAddress?.id}
                      onSelect={handleSelectSavedAddress}
                      onEdit={handleEditSavedAddress}
                      onDelete={handleDeleteSavedAddress}
                    />
                  </div>
                </>
              ) : (
                <AddressSearch
                  onSave={handleSaveAddress}
                  onCancel={() => {
                    if (savedAddresses.length > 0 && !editingAddress) {
                      setIsShowingSavedAddresses(true);
                      return;
                    }
                    setEditingAddress(null);
                    setIsAddressModalOpen(false);
                  }}
                  initialAddress={editingAddress}
                />
              )}
            </div>
          </div>
        </div>
      )}

      <Dialog
        open={isFinishModalOpen}
        onOpenChange={(open) => {
          if (paymentMethod === "pix" && !hasCopiedPix && !open) {
            return;
          }
          setIsFinishModalOpen(open);
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="z-[120] h-[100dvh] w-screen max-w-none rounded-none border-0 bg-[#5d5d5d]/85 p-0 shadow-none sm:h-auto sm:w-full sm:max-w-md sm:rounded-[32px] sm:border sm:border-border sm:bg-background sm:p-0 sm:shadow-2xl"
          onPointerDownOutside={(event) => {
            if (paymentMethod === "pix" && !hasCopiedPix) event.preventDefault();
          }}
          onEscapeKeyDown={(event) => {
            if (paymentMethod === "pix" && !hasCopiedPix) event.preventDefault();
          }}
        >
          <div className="flex h-full w-full items-center justify-center p-0 sm:p-0">
            <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-background sm:h-full sm:max-h-[90vh] sm:max-w-md sm:rounded-[32px] sm:shadow-2xl">
              <div className="flex-1 overflow-y-auto px-6 pb-6 pt-8 sm:px-8">
                <div className="mx-auto max-w-[320px] text-center">
                  <h3 className="text-[22px] font-bold leading-tight text-[#686868]">
                    Agora é só enviar seu pedido via WhatsApp
                  </h3>
                </div>

                <div className="mt-7">
                  <p className="text-[18px] font-bold text-[#666666]">Pedido #{finishOrderNumber}</p>
                  <p className="mt-1 text-[15px] text-[#7d7d7d]">
                    {finishDate.toLocaleDateString("pt-BR")} -{" "}
                    {finishDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <p className="mt-2 text-[16px] text-[#666666]">{checkoutName}</p>
                  <p className="text-[16px] text-[#666666]">
                    Contato: <span className="font-semibold">{checkoutPhone}</span>
                  </p>
                </div>

                <div className="mt-5 border-t border-[#e6e6e6] pt-5">
                  <div className="space-y-4">
                    {checkoutItems.map((item) => (
                      <div
                        key={`${item.product.id}-${item.selectedVariation ?? "default"}`}
                        className="flex items-start gap-3"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#7b00ff] text-sm font-bold text-white">
                          {item.quantity}
                        </div>

                        <CartItemImage
                          productId={item.product.id}
                          productImage={item.product.image}
                          productName={item.product.name}
                          className="h-16 w-16 shrink-0 rounded-2xl bg-[#f4f4f4]"
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <p className="line-clamp-1 text-[15px] text-[#666666]">{item.product.name}</p>
                            <span className="shrink-0 text-[15px] font-semibold text-[#666666]">
                              {formatPrice(item.product.price * item.quantity)}
                            </span>
                          </div>
                          {item.selectedVariation && (
                            <p className="mt-1 text-[15px] text-[#8b8b8b]">1x {item.selectedVariation}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {checkoutOrderNote.trim() && (
                  <div className="mt-5 rounded-2xl bg-[#f7f7f7] p-4 text-[15px] text-[#666666]">
                    <p className="font-semibold">Observação do pedido</p>
                    <p className="mt-1 leading-[1.35]">{checkoutOrderNote.trim()}</p>
                  </div>
                )}

                <div className="mt-6 border-t border-[#e6e6e6] pt-5 text-[15px] text-[#666666]">
                  <div className="flex items-center justify-between gap-4">
                    <span>Total dos itens ({checkoutItems.length})</span>
                    <span className="font-semibold">{formatPrice(checkoutSubtotal)}</span>
                  </div>

                  <div className="mt-1 flex items-center justify-between gap-4">
                    <span>Frete</span>
                    <span className="font-semibold">{formatPrice(checkoutDeliveryFee)}</span>
                  </div>

                  {checkoutPaymentMethod === "pix" && (
                    <div className="mt-1 flex items-center justify-between gap-4">
                      <span>Desconto PIX</span>
                      <span className="font-semibold">-{formatPrice(checkoutPixDiscount)}</span>
                    </div>
                  )}

                  <div className="mt-1 flex items-center justify-between gap-4 text-[16px] font-bold">
                    <span>Total pedido</span>
                    <span>{formatPrice(checkoutTotal)}</span>
                  </div>
                </div>

                <div className="mt-6 space-y-1 text-[15px] text-[#666666]">
                  <p>
                    Pagamento: <span className="font-medium">{checkoutPaymentMethod === "pix" ? "Online" : "Na entrega"}</span>
                  </p>
                  <p>
                    Forma de pagamento: <span className="font-medium">{checkoutPaymentLabel}</span>
                  </p>
                  {checkoutPaymentMethod === "pix" && (
                    <p>
                      Chave PIX: <span className="font-semibold">{PIX_KEY}</span>{" "}
                      <button
                        type="button"
                        onClick={handleCopyPix}
                        className="inline-flex items-center gap-1 text-[15px] text-[#666666] underline underline-offset-2"
                      >
                        copiar
                      </button>
                    </p>
                  )}
                </div>

                <p className="mx-auto mt-8 max-w-[290px] text-center text-[15px] leading-[1.35] text-[#7a7a7a]">
                  Clique no botão abaixo para encaminhar o pedido para o WhatsApp do vendedor.
                </p>
              </div>

              <div className="border-t border-[#e6e6e6] px-6 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-4 sm:px-8 sm:pb-6">
                {checkoutPaymentMethod === "pix" && !hasCopiedPix ? (
                  <button
                    type="button"
                    onClick={handleCopyPix}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground"
                  >
                    <Copy className="h-5 w-5" />
                    Copiar PIX
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendWhatsApp}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0f766e] py-4 text-base font-bold text-white"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Enviar via WhatsApp
                  </button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CartSidebar;
