import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

interface Zone { id: string; distance_km: number; price: number; }

export default function AdminDelivery() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [km, setKm] = useState("");
  const [price, setPrice] = useState("");

  const fetchData = async () => {
    const { data } = await supabase.from("delivery_zones").select("*").order("distance_km");
    if (data) setZones(data as Zone[]);
  };
  useEffect(() => { fetchData(); }, []);

  const add = async () => {
    const d = Number(km);
    if (!d || d > 32) { toast.error("Distância máxima: 32km"); return; }
    await supabase.from("delivery_zones").insert({ distance_km: d, price: Number(price) || 0 });
    toast.success("Faixa adicionada"); setKm(""); setPrice(""); fetchData();
  };

  const remove = async (id: string) => {
    await supabase.from("delivery_zones").delete().eq("id", id);
    toast.success("Removido"); fetchData();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Entregas</h2>
      <Card>
        <CardHeader><CardTitle className="text-base">Faixas de Entrega</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Máximo de 32km. O frete é calculado automaticamente pela distância.</p>
          <div className="flex gap-2">
            <Input type="number" placeholder="Distância (km)" value={km} onChange={(e) => setKm(e.target.value)} className="w-40" />
            <Input type="number" placeholder="Valor (R$)" value={price} onChange={(e) => setPrice(e.target.value)} className="w-40" />
            <Button onClick={add}><Plus className="h-4 w-4 mr-1" />Adicionar</Button>
          </div>
          <Table>
            <TableHeader><TableRow><TableHead>Até (km)</TableHead><TableHead>Valor</TableHead><TableHead>Ação</TableHead></TableRow></TableHeader>
            <TableBody>
              {zones.map((z) => (
                <TableRow key={z.id}>
                  <TableCell>{z.distance_km} km</TableCell>
                  <TableCell>R$ {Number(z.price).toFixed(2)}</TableCell>
                  <TableCell><Button variant="ghost" size="icon" onClick={() => remove(z.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                </TableRow>
              ))}
              {zones.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-4">Nenhuma faixa</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
