import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Upload } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category_id: string | null;
  stock: number;
  is_active: boolean;
  youtube_url: string | null;
}

interface Category { id: string; name: string; }

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<File[]>([]);

  const fetchData = async () => {
    const [p, c] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("id, name").eq("is_active", true),
    ]);
    if (p.data) setProducts(p.data as Product[]);
    if (c.data) setCategories(c.data as Category[]);
  };

  useEffect(() => { fetchData(); }, []);

  const save = async () => {
    if (!editing?.name) { toast.error("Nome obrigatório"); return; }
    const payload = {
      name: editing.name,
      description: editing.description || null,
      price: editing.price || 0,
      category_id: editing.category_id || null,
      stock: editing.stock || 0,
      is_active: editing.is_active ?? true,
      youtube_url: editing.youtube_url || null,
      updated_at: new Date().toISOString(),
    };

    let productId = editing.id;
    if (editing.id) {
      const { error } = await supabase.from("products").update(payload).eq("id", editing.id);
      if (error) { toast.error("Erro ao salvar"); return; }
    } else {
      const { data, error } = await supabase.from("products").insert(payload).select("id").single();
      if (error) { toast.error("Erro ao criar"); return; }
      productId = data.id;
    }

    // Upload images
    if (images.length > 0 && productId) {
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        const path = `products/${productId}/${Date.now()}_${i}.${file.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage.from("store-assets").upload(path, file);
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from("store-assets").getPublicUrl(path);
          await supabase.from("product_images").insert({ product_id: productId, image_url: urlData.publicUrl, sort_order: i });
        }
      }
    }

    toast.success("Produto salvo!");
    setOpen(false);
    setEditing(null);
    setImages([]);
    fetchData();
  };

  const remove = async (id: string) => {
    if (!confirm("Remover produto?")) return;
    await supabase.from("products").delete().eq("id", id);
    toast.success("Removido");
    fetchData();
  };

  const toggleActive = async (id: string, is_active: boolean) => {
    await supabase.from("products").update({ is_active }).eq("id", id);
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Produtos</h2>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setImages([]); } }}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditing({})}><Plus className="h-4 w-4 mr-2" />Novo Produto</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing?.id ? "Editar" : "Novo"} Produto</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Nome" value={editing?.name || ""} onChange={(e) => setEditing(p => ({ ...p, name: e.target.value }))} />
              <Textarea placeholder="Descrição" value={editing?.description || ""} onChange={(e) => setEditing(p => ({ ...p, description: e.target.value }))} />
              <div className="grid grid-cols-2 gap-4">
                <Input type="number" placeholder="Preço" value={editing?.price || ""} onChange={(e) => setEditing(p => ({ ...p, price: Number(e.target.value) }))} />
                <Input type="number" placeholder="Estoque" value={editing?.stock || ""} onChange={(e) => setEditing(p => ({ ...p, stock: Number(e.target.value) }))} />
              </div>
              <Select value={editing?.category_id || ""} onValueChange={(v) => setEditing(p => ({ ...p, category_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input placeholder="YouTube URL" value={editing?.youtube_url || ""} onChange={(e) => setEditing(p => ({ ...p, youtube_url: e.target.value }))} />
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Imagens (até 6)</label>
                <Input type="file" multiple accept="image/*" onChange={(e) => setImages(Array.from(e.target.files || []).slice(0, 6))} />
                {images.length > 0 && <p className="text-xs text-muted-foreground mt-1">{images.length} arquivo(s) selecionado(s)</p>}
              </div>
              <Button onClick={save} className="w-full">Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Ativo</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>R$ {Number(p.price).toFixed(2)}</TableCell>
                  <TableCell>{p.stock}</TableCell>
                  <TableCell><Switch checked={p.is_active} onCheckedChange={(v) => toggleActive(p.id, v)} /></TableCell>
                  <TableCell className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { setEditing(p); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {products.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Nenhum produto</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
