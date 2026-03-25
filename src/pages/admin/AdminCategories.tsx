import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Category { id: string; name: string; sort_order: number; is_active: boolean; }

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Partial<Category> | null>(null);
  const [open, setOpen] = useState(false);

  const fetchData = async () => {
    const { data } = await supabase.from("categories").select("*").order("sort_order");
    if (data) setCategories(data as Category[]);
  };
  useEffect(() => { fetchData(); }, []);

  const save = async () => {
    if (!editing?.name) { toast.error("Nome obrigatório"); return; }
    const payload = { name: editing.name, sort_order: editing.sort_order || 0, is_active: editing.is_active ?? true };
    if (editing.id) {
      await supabase.from("categories").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("categories").insert(payload);
    }
    toast.success("Salvo!"); setOpen(false); setEditing(null); fetchData();
  };

  const remove = async (id: string) => {
    if (!confirm("Remover?")) return;
    await supabase.from("categories").delete().eq("id", id);
    toast.success("Removido"); fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Categorias</h2>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditing({})}><Plus className="h-4 w-4 mr-2" />Nova Categoria</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing?.id ? "Editar" : "Nova"} Categoria</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Nome" value={editing?.name || ""} onChange={(e) => setEditing(p => ({ ...p, name: e.target.value }))} />
              <Input type="number" placeholder="Ordem" value={editing?.sort_order || 0} onChange={(e) => setEditing(p => ({ ...p, sort_order: Number(e.target.value) }))} />
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
            <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Ordem</TableHead><TableHead>Ativo</TableHead><TableHead>Ações</TableHead></TableRow></TableHeader>
            <TableBody>
              {categories.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.sort_order}</TableCell>
                  <TableCell><Switch checked={c.is_active} onCheckedChange={async (v) => { await supabase.from("categories").update({ is_active: v }).eq("id", c.id); fetchData(); }} /></TableCell>
                  <TableCell className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { setEditing(c); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {categories.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Nenhuma categoria</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
