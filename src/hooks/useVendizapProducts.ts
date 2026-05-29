import { useQuery } from "@tanstack/react-query";
import type { Product, ProductVariationGroup } from "@/data/products";

interface NewApiProduct {
  id: string;
  title: string;
  categoryId: string;
  description?: string;
  descriptionFormated?: string;
  price?: number;
  promotionalPrice?: number;
  imageUrl?: string;
  isVisible?: boolean;
  category?: { title: string };
  variations?: {
    id: string;
    variation: {
      id: string;
      title: string;
      options: { id: string; value: string }[];
    };
  }[];
  items?: {
    stock: number;
    options: { option: { value: string } }[];
  }[];
}

function buildImageUrl(path?: string) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${import.meta.env.VITE_MINIO_PUBLIC_URL}/${import.meta.env.VITE_MINIO_BUCKET || 'podemaismidia'}/products/${path}`;
}

function buildCategoryImageUrl(path?: string) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${import.meta.env.VITE_MINIO_PUBLIC_URL}/${import.meta.env.VITE_MINIO_BUCKET || 'podemaismidia'}/categories/${path}`;
}

function buildVariationGroupFromNewApi(product: NewApiProduct): ProductVariationGroup | undefined {
  if (!product.variations || product.variations.length === 0) return undefined;

  const firstVariation = product.variations[0].variation;
  
  if (!firstVariation) return undefined;

  const linkedOptions = firstVariation.options.filter(opt => {
    return product.items?.some(item => 
      item.options.some(o => o.option.value === opt.value)
    ) ?? false;
  });

  const options = linkedOptions.map(opt => {
    // Check if there is any item with this option value that has stock > 0
    const available = product.items?.some(item => 
      item.stock > 0 && item.options.some(o => o.option.value === opt.value)
    ) ?? false;
    
    return {
      label: opt.value,
      available,
    };
  });

  return { name: firstVariation.title, options };
}

export function transformNewApiProduct(raw: NewApiProduct): Product & { isVisible?: boolean } {
  const variationGroup = buildVariationGroupFromNewApi(raw);
  
  const totalStock = raw.items?.reduce((acc, item) => acc + item.stock, 0) || 0;

  const promoPriceNum = raw.promotionalPrice ? Number(raw.promotionalPrice) : undefined;
  const priceNum = raw.price ? Number(raw.price) : 0;

  return {
    id: raw.id,
    name: raw.title,
    image: buildImageUrl(raw.imageUrl),
    category: raw.category?.title || raw.categoryId,
    description: raw.descriptionFormated || raw.description || "",
    price: promoPriceNum || priceNum,
    oldPrice: promoPriceNum ? priceNum : undefined,
    isPromo: !!promoPriceNum,
    variationGroup,
    isVisible: raw.isVisible,
  };
}

export function useProducts(categoryId?: string | null) {
  return useQuery({
    queryKey: categoryId ? ["api-products-category", categoryId] : ["api-products"],
    queryFn: async (): Promise<Product[]> => {
      let url = `${import.meta.env.VITE_ADMIN_API}/store/products?limit=9999`;
      if (categoryId) {
        url += `&categoryId=${categoryId}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      
      // Handle the new paginated wrapper or raw array
      const productList: NewApiProduct[] = Array.isArray(data) ? data : (data.data || []);

      const products = productList.map(transformNewApiProduct);
      
      return products.filter((p) => {
        if (p.isVisible === false) return false;
        
        if (!p.variationGroup) {
          // If no variations, check if total stock > 0. But for now, we assume simple products are available if they were returned active.
          return true;
        }
        return p.variationGroup.options.some((o) => o.available);
      });
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}


export function useCategories() {
  return useQuery({
    queryKey: ["api-categories"],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_ADMIN_API}/store/categories`);
      if (!response.ok) throw new Error("Failed to fetch categories");
      
      const data = await response.json();
      
      return data.map((c: any) => ({
        id: c.id,
        nome: c.title,
        imagem: buildCategoryImageUrl(c.image),
        produtosAtivos: 0, // We don't have this straight from the API right now
      }));
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}
