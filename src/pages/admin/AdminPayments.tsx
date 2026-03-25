import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, Trash2, Save } from "lucide-react";

interface Installment { id: string; installments: number; interest_rate: number; }

export default function AdminPayments() {
  const [pixKey, setPixKey] = useState("");
  const [rules, setRules] = useState<Installment[]>([]);
  const [inst, setInst] = useState("");
  const [rate, setRate] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const { data: settings } = await supabase.from("store_settings").select("pix_key").limit(1).single();
      if (settings?.pix_key) setPixKey(settings.pix_key);
      const { data } = await supabase.from("installment_rules").select("*").order("installments");
      if (data) setRules(data as Installment[]);
    };
    fetch();
  }, []);

  const savePix = async () => {
    const { data: existing } = await supabase.from("store_settings").select("id").limit(1).single();
    if (existing) {
      await supabase.from("store_settings").update({ pix_key: pixKey, updated_at: new Date().toISOString() }).eq("id", existing.id);
    }
    toast.success("Chave PIX salva!");
  };

  const addRule = async () => {
    if (!inst) return;
    await supabase.from("installment_rules").insert({ installments: Number(inst), interest_rate: Number(rate) || 0 });
    toast.success("Adicionado"); setInst(""); setRate("");
    const { data } = await supabase.from("installment_rules").select("*").order("installments");
    if (data) setRules(data as Installment[]);
  };

  const removeRule = async (id: string) => {
    await supabase.from("installment_rules").delete().eq("id", id);
    const { data } = await supabase.from("installment_rules").select("*").order("installments");
    if (data) setRules(data as Installment[]);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Pagamentos</h2>
      <Card>
        <CardHeader><CardTitle className="text-base">PIX</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input placeholder="Chave PIX" value={pixKey} onChange={(e) => setPixKey(e.target.value)} />
            <Button onClick={savePix}><Save className="h-4 w-4 mr-1" />Salvar</Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Parcelas no Cartão</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input type="number" placeholder="Parcelas" value={inst} onChange={(e) => setInst(e.target.value)} className="w-32" />
            <Input type="number" placeholder="Juros (%)" value={rate} onChange={(e) => setRate(e.target.value)} className="w-32" />
            <Button onClick={addRule}><Plus className="h-4 w-4 mr-1" />Adicionar</Button>
          </div>
          <Table>
            <TableHeader><TableRow><TableHead>Parcelas</TableHead><TableHead>Juros</TableHead><TableHead>Ação</TableHead></TableRow></TableHeader>
            <TableBody>
              {rules.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.installments}x</TableCell>
                  <TableCell>{Number(r.interest_rate).toFixed(1)}%</TableCell>
                  <TableCell><Button variant="ghost" size="icon" onClick={() => removeRule(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
