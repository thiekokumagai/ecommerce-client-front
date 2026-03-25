import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface CashRegister {
  id: string;
  opened_at: string;
  closed_at: string | null;
  opening_balance: number;
  closing_balance: number | null;
  is_open: boolean;
}

interface CashTransaction {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  created_at: string;
}

export default function AdminCashRegister() {
  const { user } = useAuth();
  const [currentRegister, setCurrentRegister] = useState<CashRegister | null>(null);
  const [transactions, setTransactions] = useState<CashTransaction[]>([]);
  const [history, setHistory] = useState<CashRegister[]>([]);
  const [openingBalance, setOpeningBalance] = useState("");
  const [txAmount, setTxAmount] = useState("");
  const [txDesc, setTxDesc] = useState("");
  const [txType, setTxType] = useState("income");

  const fetchData = async () => {
    const { data: registers } = await supabase.from("cash_registers").select("*").order("opened_at", { ascending: false });
    if (registers) {
      const open = (registers as CashRegister[]).find(r => r.is_open);
      setCurrentRegister(open || null);
      setHistory((registers as CashRegister[]).filter(r => !r.is_open));
      if (open) {
        const { data: txs } = await supabase.from("cash_transactions").select("*").eq("register_id", open.id).order("created_at", { ascending: false });
        if (txs) setTransactions(txs as CashTransaction[]);
      }
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openRegister = async () => {
    await supabase.from("cash_registers").insert({ opening_balance: Number(openingBalance) || 0, user_id: user?.id });
    toast.success("Caixa aberto!"); setOpeningBalance(""); fetchData();
  };

  const closeRegister = async () => {
    if (!currentRegister) return;
    const totalIncome = transactions.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
    const totalExpense = transactions.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
    const closing = Number(currentRegister.opening_balance) + totalIncome - totalExpense;
    await supabase.from("cash_registers").update({ is_open: false, closed_at: new Date().toISOString(), closing_balance: closing }).eq("id", currentRegister.id);
    toast.success("Caixa fechado!"); fetchData();
  };

  const addTransaction = async () => {
    if (!currentRegister || !txAmount) return;
    await supabase.from("cash_transactions").insert({ register_id: currentRegister.id, type: txType, amount: Number(txAmount), description: txDesc || null });
    toast.success("Lançamento adicionado"); setTxAmount(""); setTxDesc(""); fetchData();
  };

  const balance = currentRegister
    ? Number(currentRegister.opening_balance) +
      transactions.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0) -
      transactions.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0)
    : 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Caixa</h2>

      {!currentRegister ? (
        <Card>
          <CardHeader><CardTitle className="text-base">Abrir Caixa</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input type="number" placeholder="Saldo inicial (R$)" value={openingBalance} onChange={(e) => setOpeningBalance(e.target.value)} />
              <Button onClick={openRegister}>Abrir Caixa</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Saldo Atual</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold text-foreground">R$ {balance.toFixed(2)}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Status</CardTitle></CardHeader>
              <CardContent className="flex items-center gap-2">
                <Badge variant="default">Aberto</Badge>
                <Button variant="destructive" size="sm" onClick={closeRegister}>Fechar Caixa</Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">Novo Lançamento</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Select value={txType} onValueChange={setTxType}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Entrada</SelectItem>
                    <SelectItem value="expense">Saída</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="number" placeholder="Valor" value={txAmount} onChange={(e) => setTxAmount(e.target.value)} className="w-32" />
                <Input placeholder="Descrição" value={txDesc} onChange={(e) => setTxDesc(e.target.value)} className="flex-1 min-w-40" />
                <Button onClick={addTransaction}>Adicionar</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Lançamentos</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow><TableHead>Tipo</TableHead><TableHead>Valor</TableHead><TableHead>Descrição</TableHead><TableHead>Data</TableHead></TableRow></TableHeader>
                <TableBody>
                  {transactions.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell><Badge variant={t.type === "income" ? "default" : "destructive"}>{t.type === "income" ? "Entrada" : "Saída"}</Badge></TableCell>
                      <TableCell>R$ {Number(t.amount).toFixed(2)}</TableCell>
                      <TableCell>{t.description || "-"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(t.created_at).toLocaleString("pt-BR")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {history.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Histórico</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Abertura</TableHead><TableHead>Fechamento</TableHead><TableHead>Saldo Inicial</TableHead><TableHead>Saldo Final</TableHead></TableRow></TableHeader>
              <TableBody>
                {history.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell className="text-sm">{new Date(h.opened_at).toLocaleString("pt-BR")}</TableCell>
                    <TableCell className="text-sm">{h.closed_at ? new Date(h.closed_at).toLocaleString("pt-BR") : "-"}</TableCell>
                    <TableCell>R$ {Number(h.opening_balance).toFixed(2)}</TableCell>
                    <TableCell>R$ {Number(h.closing_balance || 0).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
