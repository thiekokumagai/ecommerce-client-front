import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pendente", variant: "outline" },
  preparing: { label: "Em preparo", variant: "secondary" },
  delivering: { label: "Saiu p/ entrega", variant: "default" },
  completed: { label: "Finalizado", variant: "default" },
  cancelled: { label: "Cancelado", variant: "destructive" },
};

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string | null;
  address: string | null;
  payment_method: string | null;
  total: number;
  status: string;
  created_at: string;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  notes: string | null;
}

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  const fetchOrders = async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (data) setOrders(data as Order[]);
  };

  useEffect(() => {
    fetchOrders();
    const channel = supabase
      .channel("orders-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => fetchOrders())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) toast.error("Erro ao atualizar status");
    else toast.success("Status atualizado");
  };

  const viewDetails = async (order: Order) => {
    setSelectedOrder(order);
    const { data } = await supabase.from("order_items").select("*").eq("order_id", order.id);
    if (data) setOrderItems(data as OrderItem[]);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Pedidos</h2>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.customer_name}</TableCell>
                  <TableCell>R$ {Number(order.total).toFixed(2)}</TableCell>
                  <TableCell>
                    <Select defaultValue={order.status} onValueChange={(v) => updateStatus(order.id, v)}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusMap).map(([key, val]) => (
                          <SelectItem key={key} value={key}>{val.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => viewDetails(order)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Detalhes do Pedido</DialogTitle>
                        </DialogHeader>
                        {selectedOrder && (
                          <div className="space-y-4 text-sm">
                            <div className="grid grid-cols-2 gap-2">
                              <div><span className="font-medium">Cliente:</span> {selectedOrder.customer_name}</div>
                              <div><span className="font-medium">Telefone:</span> {selectedOrder.customer_phone || "-"}</div>
                              <div className="col-span-2"><span className="font-medium">Endereço:</span> {selectedOrder.address || "-"}</div>
                              <div><span className="font-medium">Pagamento:</span> {selectedOrder.payment_method || "-"}</div>
                              <div><span className="font-medium">Status:</span> <Badge variant={statusMap[selectedOrder.status]?.variant}>{statusMap[selectedOrder.status]?.label}</Badge></div>
                            </div>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Produto</TableHead>
                                  <TableHead>Qtd</TableHead>
                                  <TableHead>Preço</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {orderItems.map((item) => (
                                  <TableRow key={item.id}>
                                    <TableCell>{item.product_name}</TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell>R$ {Number(item.total_price).toFixed(2)}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                            <div className="space-y-1 text-right">
                              <p>Subtotal: R$ {Number(selectedOrder.subtotal).toFixed(2)}</p>
                              <p>Entrega: R$ {Number(selectedOrder.delivery_fee).toFixed(2)}</p>
                              <p>Desconto: -R$ {Number(selectedOrder.discount).toFixed(2)}</p>
                              <p className="font-bold text-lg">Total: R$ {Number(selectedOrder.total).toFixed(2)}</p>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Nenhum pedido</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
