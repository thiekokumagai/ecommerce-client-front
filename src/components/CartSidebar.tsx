import { useMemo, useState, useCallback } from "react";
import { X, Minus, Plus, Trash2, ShoppingBag, Bike } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const formatPrice = (price: number) =>
  `R$${price.toFixed(2).replace(".", ",")}`;

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 2) return digits ? `(${digits}` : "";
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  return value;
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

type PaymentMethod = "pix" | "debito" | "credito" | "dinheiro";

const deliveryZones = [
  { keywords: ["centro", "jardim dos estados", "amambaí", "são francisco"], fee: 8 },
  { keywords: ["caiçara", "carandá bosque", "rita vieira", "tiradentes", "vila carlota"], fee: 10 },
  { keywords: ["universitário", "parati", "coronel antonino", "nova lima", "moreninhas"], fee: 12 },
  { keywords: ["indubrasil", "lageado", "anhanduizinho", "aero rancho", "noroeste"], fee: 15 },
];

const getDeliveryFee = (address: string) => {
  const normalizedAddress = address
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  const zone = deliveryZones.find((item) =>
    item.keywords.some((keyword) => normalizedAddress.includes(keyword))
  );

  return zone?.fee ?? 10;
};

const CartSidebar = () => {
  const { items, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, totalPrice, totalItems } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [needsChange, setNeedsChange] = useState("não");
  const [changeFor, setChangeFor] = useState("");

  const totalWithPixDiscount = useMemo(() => totalPrice * 0.95, [totalPrice]);
  const deliveryFee = useMemo(() => getDeliveryFee(address), [address]);
  const subtotal = paymentMethod === "pix" ? totalWithPixDiscount : totalPrice;
  const finalTotal = subtotal + deliveryFee;

  const closeCart = useCallback(() => setIsCartOpen(false), [setIsCartOpen]);

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
          `Endereço completo: ${address || "-"}`,
          "",
          paymentMethod === "pix"
            ? `Forma de pagamento: Pix (5% de desconto) - Subtotal com desconto: ${formatPrice(totalWithPixDiscount)}`
            : paymentMethod === "debito"
              ? `Forma de pagamento: Débito - Subtotal: ${formatPrice(totalPrice)}`
              : paymentMethod === "credito"
                ? `Forma de pagamento: Crédito - Subtotal: ${formatPrice(totalPrice)}`
                : `Forma de pagamento: Dinheiro - Subtotal: ${formatPrice(totalPrice)}`,
          ...(paymentMethod === "dinheiro"
            ? [`Precisa de troco: ${needsChange}`, ...(needsChange === "sim" ? [`Troco para: R$ ${changeFor || "-"}`] : [])]
            : []),
          `Taxa de entrega em Campo Grande - MS: ${formatPrice(deliveryFee)}`,
          "Prazo médio de entrega: 30 a 40 minutos",
          `Total final com entrega: ${formatPrice(finalTotal)}`,
        ].join("\n")
      ),
    [
      items,
      name,
      phone,
      address,
      paymentMethod,
      totalWithPixDiscount,
      totalPrice,
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
                        <button onClick={() => removeFromCart(item.product.id, item.selectedVariation)} className="shrink-0 text-muted-foreground">
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
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Seu nome"
                    className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Telefone</label>
                  <input
                    value={phone}
                    onChange={(event) => setPhone(formatPhone(event.target.value))}
                    placeholder="(67) 99999-9999"
                    className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Endereço completo</label>
                  <textarea
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    placeholder="Rua, número, bairro, complemento e referência"
                    className="min-h-[96px] w-full rounded-xl border border-border bg-background p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                  <div className="mt-3 rounded-xl bg-secondary p-3 text-sm text-foreground">
                    <div className="flex items-center gap-2">
                      <Bike className="h-4 w-4 text-primary" />
                      <span className="font-medium">Entrega em Campo Grande - MS</span>
                    </div>
                    <p className="mt-2">
                      Taxa do motoboy: <span className="font-bold text-primary">{formatPrice(deliveryFee)}</span>
                    </p>
                    <p className="text-muted-foreground">Prazo médio: 30 a 40 minutos</p>
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

                {paymentMethod === "pix" && (
                  <div className="rounded-xl bg-secondary p-3 text-sm text-foreground">
                    Subtotal com 5% de desconto: <span className="font-bold text-primary">{formatPrice(totalWithPixDiscount)}</span>
                  </div>
                )}

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

        {items.length > 0 && (
          <div className="border-t border-border p-5">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal ({totalItems} {totalItems === 1 ? "item" : "itens"})</span>
                <span className="font-medium text-foreground">
                  {paymentMethod === "pix" ? formatPrice(totalWithPixDiscount) : formatPrice(totalPrice)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Taxa do motoboy</span>
                <span className="font-medium text-foreground">{formatPrice(deliveryFee)}</span>
              </div>
              <div className="flex items-center justify-between text-base">
                <span className="font-medium text-muted-foreground">Total final:</span>
                <span className="text-xl font-bold text-primary">{formatPrice(finalTotal)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Entrega média de 30 a 40 minutos em Campo Grande - MS.</p>
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
        )}
      </div>
    </div>
  );
};

export default CartSidebar;