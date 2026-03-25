import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Save, Upload } from "lucide-react";

const dayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

interface StoreSettings {
  id: string;
  store_name: string;
  logo_url: string | null;
  banner_url: string | null;
  whatsapp: string | null;
  instagram: string | null;
  address: string | null;
  hide_address: boolean;
  store_open: boolean;
  store_suspended: boolean;
}

interface BusinessHour {
  id: string;
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_active: boolean;
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [hours, setHours] = useState<BusinessHour[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const { data: s } = await supabase.from("store_settings").select("*").limit(1).single();
      if (s) setSettings(s as unknown as StoreSettings);
      const { data: h } = await supabase.from("business_hours").select("*").order("day_of_week");
      if (h) setHours(h as BusinessHour[]);
    };
    fetch();
  }, []);

  const uploadFile = async (file: File, folder: string) => {
    const path = `${folder}/${Date.now()}.${file.name.split(".").pop()}`;
    const { error } = await supabase.storage.from("store-assets").upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from("store-assets").getPublicUrl(path);
    return data.publicUrl;
  };

  const saveSettings = async () => {
    if (!settings) return;
    let logoUrl = settings.logo_url;
    let bannerUrl = settings.banner_url;

    try {
      if (logoFile) logoUrl = await uploadFile(logoFile, "logo");
      if (bannerFile) bannerUrl = await uploadFile(bannerFile, "banner");
    } catch { toast.error("Erro no upload"); return; }

    await supabase.from("store_settings").update({
      store_name: settings.store_name,
      logo_url: logoUrl,
      banner_url: bannerUrl,
      whatsapp: settings.whatsapp,
      instagram: settings.instagram,
      address: settings.address,
      hide_address: settings.hide_address,
      store_open: settings.store_open,
      store_suspended: settings.store_suspended,
      updated_at: new Date().toISOString(),
    }).eq("id", settings.id);

    toast.success("Configurações salvas!");
  };

  const saveHours = async () => {
    for (const h of hours) {
      await supabase.from("business_hours").update({ open_time: h.open_time, close_time: h.close_time, is_active: h.is_active }).eq("id", h.id);
    }
    toast.success("Horários salvos!");
  };

  const updateHour = (idx: number, field: string, value: unknown) => {
    setHours(prev => prev.map((h, i) => i === idx ? { ...h, [field]: value } : h));
  };

  if (!settings) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Configurações</h2>

      <Card>
        <CardHeader><CardTitle className="text-base">Dados da Loja</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Nome da loja" value={settings.store_name} onChange={(e) => setSettings(s => s ? { ...s, store_name: e.target.value } : s)} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-1 block">Logo</label>
              <Input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
              {settings.logo_url && <img src={settings.logo_url} alt="Logo" className="h-16 mt-2 rounded" />}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Banner</label>
              <Input type="file" accept="image/*" onChange={(e) => setBannerFile(e.target.files?.[0] || null)} />
              {settings.banner_url && <img src={settings.banner_url} alt="Banner" className="h-16 mt-2 rounded" />}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input placeholder="WhatsApp" value={settings.whatsapp || ""} onChange={(e) => setSettings(s => s ? { ...s, whatsapp: e.target.value } : s)} />
            <Input placeholder="Instagram" value={settings.instagram || ""} onChange={(e) => setSettings(s => s ? { ...s, instagram: e.target.value } : s)} />
          </div>
          <Input placeholder="Endereço" value={settings.address || ""} onChange={(e) => setSettings(s => s ? { ...s, address: e.target.value } : s)} />
          <div className="flex items-center gap-2">
            <Switch checked={settings.hide_address} onCheckedChange={(v) => setSettings(s => s ? { ...s, hide_address: v } : s)} />
            <span className="text-sm">Ocultar endereço da loja</span>
          </div>
          <Button onClick={saveSettings}><Save className="h-4 w-4 mr-2" />Salvar Configurações</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Status da Loja</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch checked={settings.store_open} onCheckedChange={(v) => setSettings(s => s ? { ...s, store_open: v } : s)} />
            <span className="text-sm font-medium">{settings.store_open ? "Loja Aberta" : "Loja Fechada"}</span>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={settings.store_suspended} onCheckedChange={(v) => setSettings(s => s ? { ...s, store_suspended: v } : s)} />
            <span className="text-sm font-medium text-destructive">Modo Suspensa</span>
          </div>
          <Button onClick={saveSettings} variant="outline"><Save className="h-4 w-4 mr-2" />Salvar Status</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Horário de Atendimento</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {hours.map((h, idx) => (
            <div key={h.id} className="flex items-center gap-3 flex-wrap">
              <Checkbox checked={h.is_active} onCheckedChange={(v) => updateHour(idx, "is_active", !!v)} />
              <span className="text-sm w-20">{dayNames[h.day_of_week]}</span>
              <Input type="time" value={h.open_time} onChange={(e) => updateHour(idx, "open_time", e.target.value)} className="w-28" disabled={!h.is_active} />
              <span className="text-sm text-muted-foreground">às</span>
              <Input type="time" value={h.close_time} onChange={(e) => updateHour(idx, "close_time", e.target.value)} className="w-28" disabled={!h.is_active} />
            </div>
          ))}
          <Button onClick={saveHours}><Save className="h-4 w-4 mr-2" />Salvar Horários</Button>
        </CardContent>
      </Card>
    </div>
  );
}
