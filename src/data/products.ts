export interface ProductVariationOption {
  label: string;
  available: boolean;
}

export interface ProductVariationGroup {
  name: string;
  options: ProductVariationOption[];
}

export interface Product {
  id: string;
  name: string;
  image: string;
  category: string;
  description: string;
  price: number;
  oldPrice?: number;
  isPromo?: boolean;
  variationGroup?: ProductVariationGroup;
}

export interface SelectedProduct {
  product: Product;
  selectedVariation?: string;
}
