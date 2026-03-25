import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, TrendingUp, Users } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ todayTotal: 0, monthTotal: 0, orderCount: 0, avgTicket: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const today = new Date().toISOString().split("T")[0];
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

      const { data: orders } = await supabase.from("orders").select("total, created_at");
      if (!orders) return;

      const todayOrders = orders.filter(o => o.created_at?.startsWith(today));
      const monthOrders = orders.filter(o => o.created_at && o.created_at >= monthStart);

      setStats({
        todayTotal: todayOrders.reduce((s, o) => s + Number(o.total), 0),
        monthTotal: monthOrders.reduce((s, o) => s + Number(o.total), 0),
        orderCount: orders.length,
        avgTicket: orders.length > 0 ? orders.reduce((s, o) => s + Number(o.total), 0) / orders.length : 0,
      });
    };
    fetchStats();
  }, []);

  const cards = [
    { title: "Vendas Hoje", value: `R$ ${stats.todayTotal.toFixed(2)}`, icon: DollarSign, color: "text-green-600" },
    { title: "Vendas no Mês", value: `R$ ${stats.monthTotal.toFixed(2)}`, icon: TrendingUp, color: "text-blue-600" },
    { title: "Total de Pedidos", value: stats.orderCount.toString(), icon: ShoppingCart, color: "text-orange-600" },
    { title: "Ticket Médio", value: `R$ ${stats.avgTicket.toFixed(2)}`, icon: Users, color: "text-purple-600" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
