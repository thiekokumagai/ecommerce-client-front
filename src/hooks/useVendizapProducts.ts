import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Product, ProductVariationGroup } from "@/data/products";

interface VendizapEstoqueCombinacao {
  combinacao: Record<string, string>;
  quantidade: number;
}

interface VendizapProduct {
  id: string;
  descricao: string;
  preco: number;
  exibir: boolean;
  destaque: boolean;
  categorias_old?: string[];
  tags?: string[];
  detalhesFormatado?: string;
  promocaoAplicada?: {
    existe: boolean;
    precoPromocional?: number;
    percentual?: number;
  };
  estoque?: {
    combinacoes?: VendizapEstoqueCombinacao[];
  };
}

function buildVariationGroup(product: VendizapProduct): ProductVariationGroup | undefined {
  const combos = product.estoque?.combinacoes;
  if (!combos || combos.length === 0) return undefined;

  // Get variation group name from the first combo's key
  const firstCombo = combos[0]?.combinacao;
  if (!firstCombo) return undefined;

  const variationName = Object.keys(firstCombo)[0];
  if (!variationName) return undefined;

  const options = combos.map((c) => ({
    label: c.combinacao[variationName] || "",
    available: c.quantidade > 0,
  }));

  return { name: variationName, options };
}

export function transformProduct(raw: VendizapProduct): Product {
  const hasPromo = raw.promocaoAplicada?.existe === true && raw.promocaoAplicada.precoPromocional;
  const variationGroup = buildVariationGroup(raw);

  return {
    id: raw.id,
    name: raw.descricao,
    image: "", // Will be loaded from detail
    category: raw.categorias_old?.[0] || "",
    description: raw.detalhesFormatado || raw.descricao,
    price: hasPromo ? raw.promocaoAplicada!.precoPromocional! : raw.preco,
    oldPrice: hasPromo ? raw.preco : undefined,
    isPromo: hasPromo ? true : undefined,
    variationGroup,
  };
}

export function useProducts() {
  return useQuery({
    queryKey: ["vendizap-products"],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase.functions.invoke("vendizap-api", {
        body: { action: "products" },
      });

      if (error) throw error;

      const products = (data as VendizapProduct[]).map(transformProduct);
      
      // Filter out products where all variations are unavailable (if has variations)
      return products.filter((p) => {
        if (!p.variationGroup) return true;
        return p.variationGroup.options.some((o) => o.available);
      });
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000,
  });
}

export function useProductDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["vendizap-product", id],
    queryFn: async () => {
      if (!id) throw new Error("ID required");

      const { data, error } = await supabase.functions.invoke("vendizap-api", {
        body: { action: "product", id },
      });

      if (error) throw error;
      return data as any;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["vendizap-categories"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("vendizap-api", {
        body: { action: "categories" },
      });

      if (error) throw error;
      return data as Array<{
        id: string;
        nome: string;
        imagem?: string;
        produtosAtivos: number;
      }>;
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}
