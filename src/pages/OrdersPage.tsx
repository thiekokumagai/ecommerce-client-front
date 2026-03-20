import { useMemo, useState } from "react";
import { Package, Phone } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CartSidebar from "@/components/CartSidebar";
import AddedToCartModal from "@/components/AddedToCartModal";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useCart } from "@/contexts/CartContext";

const SESSION_PHONE_KEY = "podemais-checkout-phone";

const formatPrice = (price: number) => `R$ ${price.toFixed(2).replace(".", ",")}`;

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 2) return digits ? `(${digits}` : "";
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
};

const OrdersPage = () => {
  const { orders } = useCart();
  const [phone, setPhone] = useState(() => sessionStorage.getItem(SESSION_PHONE_KEY) ?? "");
  const [submittedPhone, setSubmittedPhone] = useState(() => sessionStorage.getItem(SESSION_PHONE_KEY) ?? "");

  const visibleOrders = useMemo(() => {
    const digits = submittedPhone.replace(/\D/g, "");
    if (!digits) return [];

    return orders.filter((order) => order.customerPhone.replace(/\D/g, "") === digits);
  }, [orders, submittedPhone]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formatted = formatPhone(phone);
    setPhone(formatted);
    setSubmittedPhone(formatted);
    sessionStorage.setItem(SESSION_PHONE_KEY, formatted);
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <div className="hidden md:block">
        <SiteHeader />
      </div>

      <main className="mx-auto max-w-3xl px-4 py-6 md:px-8 md:py-10">
        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm md:p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Meus pedidos</h1>
              <p className="text-sm text-muted-foreground">Entre com seu telefone para ver os pedidos já feitos.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            <label className="block text-sm font-medium text-foreground">Telefone</label>
            <div className="flex gap-2">
              <div className="flex flex-1 items-center gap-2 rounded-2xl border border-border px-4">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <input
                  value={phone}
                  onChange={(event) => setPhone(formatPhone(event.target.value))}
                  placeholder="(67) 99999-9999"
                  className="h-12 w-full bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none md:text-sm"
                />
              </div>
              <button
                type="submit"
                className="rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground"
              >
                Entrar
              </button>
            </div>
          </form>

          {!submittedPhone ? (
            <div className="mt-8 rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Informe seu telefone para consultar seus pedidos.
            </div>
          ) : visibleOrders.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Nenhum pedido encontrado para esse telefone.
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              {visibleOrders.map((order) => (
                <article key={order.id} className="rounded-2xl border border-border p-4 md:p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Pedido #{order.id.slice(-6)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleString("pt-BR")}
                      </p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      Recebido
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    {order.items.map((item) => (
                      <div key={`${order.id}-${item.product.id}-${item.selectedVariation ?? "default"}`} className="flex items-center justify-between gap-3">
                        <span className="text-foreground">
                          {item.quantity}x {item.product.name}
                          {item.selectedVariation ? ` (${item.selectedVariation})` : ""}
                        </span>
                        <span className="font-medium text-foreground">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 border-t border-border pt-4 text-sm text-muted-foreground">
                    <p>Entrega: {order.customerAddress}</p>
                    <p>Pagamento: {order.paymentMethod}</p>
                    <div className="mt-2 flex items-center justify-between text-base">
                      <span>Total</span>
                      <span className="font-bold text-primary">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
      <CartSidebar />
      <AddedToCartModal />
      <MobileBottomNav />
    </div>
  );
};

export default OrdersPage;