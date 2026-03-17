import { useMemo, useState } from "react";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const formatPrice = (price: number) =>
  `R$${price.toFixed(2).replace(".", ",")}`;

type PaymentMethod = "pix" | "debito" | "credito" | "dinheiro";

const CartSidebar = () => {
  const { items, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, totalPrice, totalItems } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [needsChange, setNeedsChange] = useState("não");
  const [changeFor, setChangeFor] = useState("");

  const totalWithPixDiscount = useMemo(() => totalPrice * 0.95, [totalPrice]);

  if (!isCartOpen) return null;

  const checkoutMessage = encodeURIComponent(
    [
      "Olá! Gostaria de finalizar meu pedido:",
      "",
      ...items.map((item) => `${item.quantity}x ${item.product.name} - ${formatPrice(item.product.price * item.quantity)}`),
      "",
      `Nome: ${name || "-"}`,
      `Telefone: ${phone || "-"}`,
      `Endereço completo: ${address || "-"}`,
      "",
      paymentMethod === "pix"
        ? `Forma de pagamento: Pix (5% de desconto) - Total com desconto: ${formatPrice(totalWithPixDiscount)}`
        : paymentMethod === "debito"
          ? `Forma de pagamento: Débito - Total: ${formatPrice(totalPrice)}`
          : paymentMethod === "credito"
            ? `Forma de pagamento: Crédito - Total: ${formatPrice(totalPrice)}`
            : `Forma de pagamento: Dinheiro - Total: ${formatPrice(totalPrice)}`,
      ...(paymentMethod === "dinheiro"
        ? [`Precisa de troco: ${needsChange}`, ...(needsChange === "sim" ? [`Troco para: ${changeFor || "-"}`] : [])]
        : []),
    ].join("\n")
  );

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
      <div className="relative flex h-full w-full max-w-md flex-col bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border bg-primary px-5 py-4">
          <h2 className="text-lg font-bold text-primary-foreground">Confira seu pedido</h2>
          <button onClick={() => setIsCartOpen(false)} className="text-primary-foreground/80">
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
                  <div key={item.product.id} className="flex gap-3 rounded-xl border border-border bg-background p-3">
                    <img src={item.product.image} alt={item.product.name} className="h-16 w-16 rounded-lg object-contain bg-secondary/30" />
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <p className="line-clamp-2 text-sm font-medium text-foreground">{item.product.name}</p>
                        <button onClick={() => removeFromCart(item.product.id)} className="shrink-0 text-muted-foreground">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 rounded-lg border border-border">
                          <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="px-2 py-1 text-muted-foreground">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="min-w-[24px] text-center text-sm font-medium">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="px-2 py-1 text-muted-foreground">
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
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="Seu telefone"
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
                    Total com 5% de desconto: <span className="font-bold text-primary">{formatPrice(totalWithPixDiscount)}</span>
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
                          onChange={(event) => setChangeFor(event.target.value)}
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
            <div className="flex items-center justify-between text-base">
              <span className="font-medium text-muted-foreground">Total ({totalItems} {totalItems === 1 ? "item" : "itens"}):</span>
              <span className="text-xl font-bold text-primary">
                {paymentMethod === "pix" ? formatPrice(totalWithPixDiscount) : formatPrice(totalPrice)}
              </span>
            </div>
            <a
              href={`https://wa.me/5567991032937?text=${checkoutMessage}`}
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