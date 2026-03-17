export interface Product {
  id: number;
  name: string;
  image: string;
  category: string;
  price: number;
  oldPrice?: number;
  isPromo?: boolean;
}

export const promoProducts: Product[] = [
  { id: 1, name: "BLVK Fruit Ice Sweet Lychee 30ml 35/50mg", image: "https://cdn.vendizap.com/vendizap-produtos-thumbs/a146a326c20df0714d5e244f5d730ff2.webp", category: "NicSalt", price: 59.90, oldPrice: 79.90, isPromo: true },
  { id: 2, name: "BLVK Fruit Ice Watermelon Apple 30ml 35/50mg", image: "https://cdn.vendizap.com/vendizap-produtos-thumbs/b2798a148b37aa712887c63d6c116041.webp", category: "NicSalt", price: 59.90, oldPrice: 79.90, isPromo: true },
  { id: 3, name: "BLVK Fusion Grape Apple Ice 30ml 35/50mg", image: "https://cdn.vendizap.com/vendizap-produtos-thumbs/6f6d333d82efe70c974f4c8bd6e631f3.webp", category: "NicSalt", price: 59.90, oldPrice: 79.90, isPromo: true },
  { id: 4, name: "BLVK Fusion Lemon Tangerine Ice 30ml 35/50mg", image: "https://cdn.vendizap.com/vendizap-produtos-thumbs/118e2d75df8180b561906ac08cf4b9a0.webp", category: "NicSalt", price: 59.90, oldPrice: 79.90, isPromo: true },
  { id: 5, name: "BLVK Fusion Passion Grape Ice 30ml 35/50mg", image: "https://cdn.vendizap.com/vendizap-produtos-thumbs/7b3430efbf7e8ebb07613442a2d23409.webp", category: "NicSalt", price: 59.90, oldPrice: 79.90, isPromo: true },
  { id: 6, name: "ElfBar GH Grape Ice 23k Puffs", image: "https://cdn.vendizap.com/vendizap-produtos-thumbs/cf22d93971bccd82e6bdd65974785954.webp", category: "Descartável", price: 149.90, oldPrice: 189.90, isPromo: true },
  { id: 7, name: "IGNITE V80 Banana Ice 8k Puffs", image: "https://cdn.vendizap.com/vendizap-produtos-thumbs/02a731a0d2f31bfa2bd5446d055925cb.webp", category: "Descartável", price: 89.90, oldPrice: 119.90, isPromo: true },
  { id: 8, name: "Ignite V50 Blue Raspberry Ice 5k Puffs", image: "https://cdn.vendizap.com/vendizap-produtos-thumbs/812c783e3a66227f310687fea16002cf.webp", category: "Descartável", price: 69.90, oldPrice: 89.90, isPromo: true },
];

export const bestSellers: Product[] = [
  { id: 10, name: "Pod System Vaporesso Xros 4 Mini Camo Red", image: "https://cdn.vendizap.com/vendizap-produtos-thumbs/58b08bcc4f467d8b62abbf892d138604.webp", category: "Pod System", price: 189.90 },
  { id: 11, name: "Pod System Vaporesso Xros 4 Mini Camo Silver", image: "https://cdn.vendizap.com/vendizap-produtos-thumbs/1b9d8a6e9b32076b7f73ffa3a6bca4d5.webp", category: "Pod System", price: 189.90 },
  { id: 12, name: "Pod System Vaporesso Xros 4 Mini Space Grey", image: "https://cdn.vendizap.com/vendizap-produtos-thumbs/d903167b2c2f76b7ded9ab6a516deae5.webp", category: "Pod System", price: 189.90 },
  { id: 13, name: "Pod System Vaporesso Xros 4 Mini Camo Yellow", image: "https://cdn.vendizap.com/vendizap-produtos-thumbs/9b070b7828e5e83a577167ae6374fbd6.webp", category: "Pod System", price: 189.90 },
  { id: 14, name: "Pod System Vaporesso Xros 5 Mini Retro Pink", image: "https://cdn.vendizap.com/vendizap-produtos-thumbs/1098f645b5f63159289260784503cd7c.webp", category: "Pod System", price: 199.90 },
  { id: 15, name: "Pod System Vaporesso Xros 5 Mini Retro Orange", image: "https://cdn.vendizap.com/vendizap-produtos-thumbs/3ce9758c92a33aa4c94ed646c8d54d1d.webp", category: "Pod System", price: 199.90 },
  { id: 16, name: "Pod System Vaporesso Xros 5 Mini Mist White", image: "https://cdn.vendizap.com/vendizap-produtos-thumbs/65d5113bad210cb461af9d436ba89ce8.webp", category: "Pod System", price: 199.90 },
  { id: 17, name: "Pod System Vaporesso Xros Pro Black", image: "https://cdn.vendizap.com/vendizap-produtos-thumbs/1d979edcde424facdb78d7112117d706.webp", category: "Pod System", price: 229.90 },
  { id: 18, name: "Ignite V55 Grape Apple Acai 5.5k Puffs", image: "https://cdn.vendizap.com/vendizap-produtos-thumbs/0be5a9d0a082f114902ed729d7830fbd.webp", category: "Descartável", price: 79.90 },
  { id: 19, name: "Ignite V55 Watermelon Ice 5.5k Puffs", image: "https://cdn.vendizap.com/vendizap-produtos-thumbs/5a9c18ffbedbf9d6aec44d8a55e9cc44.webp", category: "Descartável", price: 79.90 },
  { id: 20, name: "IGNITE V80 Blueberry Lemon 8k Puffs", image: "https://cdn.vendizap.com/vendizap-produtos-thumbs/d35e41d4f2394f55ecb8065b1e925a4a.webp", category: "Descartável", price: 89.90 },
  { id: 21, name: "IGNITE V80 Artic Gum 8k Puffs", image: "https://cdn.vendizap.com/vendizap-produtos-thumbs/d1e3168647b7a2e293f3f303b2142e59.webp", category: "Descartável", price: 89.90 },
];

export const allProducts: Product[] = [...promoProducts, ...bestSellers];

export const getProductById = (id: number) =>
  allProducts.find((product) => product.id === id);

export const getProductMockDetails = (product: Product) => {
  const normalizedTag = product.name
    .split(" ")
    .slice(0, 1)
    .join("")
    .toLowerCase();

  return {
    gallery: [product.image, product.image],
    videoLabel: "Vídeo",
    specs: [
      `Dimensões aproximadas do produto na categoria ${product.category}`,
      `Design pensado para uso confortável no dia a dia`,
      `Acabamento premium com foco em praticidade e desempenho`,
      `Modelo com excelente custo-benefício para quem busca qualidade`,
    ],
    includes: [
      `1x ${product.name}`,
      "1x item principal pronto para uso",
      "1x cabo USB-C",
      "1x manual",
    ],
    tag: normalizedTag,
  };
};
