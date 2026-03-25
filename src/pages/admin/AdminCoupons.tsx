import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Coupon { id: string; code: string; discount_type: string; discount_value: number; expires_at: string | null; is_active: boolean; }

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [editing, setEditing] = useState<Partial<Coupon> | null>(null);
  const [open, setOpen] = useState(false);

  const fetchData = async () => {
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    if (data) setCoupons(data as Coupon[]);
  };
  useEffect(() => { fetchData(); }, []);

  const save = async () => {
    if (!editing?.code) { toast.error("Código obrigatório"); return; }
    const payload = {
      code: editing.code.toUpperCase(),
      discount_type: editing.discount_type || "percentage",
      discount_value: editing.discount_value || 0,
      expires_at: editing.expires_at || null,
      is_active: editing.is_active ?? true,
    };
    if (editing.id) {
      await supabase.from("coupons").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("coupons").insert(payload);
    }
    toast.success("Salvo!"); setOpen(false); setEditing(null); fetchData();
  };

  const remove = async (id: string) => {
    if (!confirm("Remover?")); return;
    await supabase.from("coupons").delete().eq("id", id);
    toast.success("Removido"); fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Cupons</h2>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditing({ discount_type: "percentage" })}><Plus className="h-4 w-4 mr-2" />Novo Cupom</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing?.id ? "Editar" : "Novo"} Cupom</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Código" value={editing?.code || ""} onChange={(e) => setEditing(p => ({ ...p, code: e.target.value }))} />
              <Select value={editing?.discount_type || "percentage"} onValueChange={(v) => setEditing(p => ({ ...p, discount_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentual (%)</SelectItem>
                  <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                </SelectContent>
              </Select>
              <Input type="number" placeholder="Valor do desconto" value={editing?.discount_value || ""} onChange={(e) => setEditing(p => ({ ...p, discount_value: Number(e.target.value) }))} />
              <Input type="date" value={editing?.expires_at?.split("T")[0] || ""} onChange={(e) => setEditing(p => ({ ...p, expires_at: e.target.value ? new Date(e.target.value).toISOString() : null }))} />
              <div className="flex items-center gap-2">
                <Switch checked={editing?.is_active ?? true} onCheckedChange={(v) => setEditing(p => ({ ...p, is_active: v }))} />
                <span className="text-sm">Ativo</span>
              </div>
              <Button onClick={save} className="w-full">Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Código</TableHead><TableHead>Desconto</TableHead><TableHead>Validade</TableHead><TableHead>Ativo</TableHead><TableHead>Ações</TableHead></TableRow></TableHeader>
            <TableBody>
              {coupons.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono font-medium">{c.code}</TableCell>
                  <TableCell>{c.discount_type === "percentage" ? `${c.discount_value}%` : `R$ ${Number(c.discount_value).toFixed(2)}`}</TableCell>
                  <TableCell className="text-sm">{c.expires_at ? new Date(c.expires_at).toLocaleDateString("pt-BR") : "Sem validade"}</TableCell>
                  <TableCell><Badge variant={c.is_active ? "default" : "secondary"}>{c.is_active ? "Ativo" : "Inativo"}</Badge></TableCell>
                  <TableCell className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { setEditing(c); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {coupons.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Nenhum cupom</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
