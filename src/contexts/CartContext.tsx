import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Product, SelectedProduct } from "@/data/products";

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariation?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Product | SelectedProduct) => void;
  removeFromCart: (productId: number, selectedVariation?: string) => void;
  updateQuantity: (productId: number, quantity: number, selectedVariation?: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  lastAdded: CartItem | null;
  showAddedModal: boolean;
  setShowAddedModal: (show: boolean) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
}

const CartContext = createContext<CartContextType | null>(null);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};

const normalizeItem = (item: Product | SelectedProduct) => {
  if ("product" in item) {
    return item;
  }

  return { product: item };
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState<CartItem | null>(null);
  const [showAddedModal, setShowAddedModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const addToCart = useCallback((item: Product | SelectedProduct) => {
    const normalizedItem = normalizeItem(item);

    setItems((prev) => {
      const existing = prev.find(
        (cartItem) =>
          cartItem.product.id === normalizedItem.product.id &&
          cartItem.selectedVariation === normalizedItem.selectedVariation
      );

      if (existing) {
        return prev.map((cartItem) =>
          cartItem.product.id === normalizedItem.product.id &&
          cartItem.selectedVariation === normalizedItem.selectedVariation
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }

      return [
        ...prev,
        {
          product: normalizedItem.product,
          quantity: 1,
          selectedVariation: normalizedItem.selectedVariation,
        },
      ];
    });

    setLastAdded({
      product: normalizedItem.product,
      quantity: 1,
      selectedVariation: normalizedItem.selectedVariation,
    });
    setShowAddedModal(true);
  }, []);

  const removeFromCart = useCallback((productId: number, selectedVariation?: string) => {
    setItems((prev) =>
      prev.filter(
        (item) =>
          !(item.product.id === productId && item.selectedVariation === selectedVariation)
      )
    );
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number, selectedVariation?: string) => {
    if (quantity <= 0) {
      setItems((prev) =>
        prev.filter(
          (item) =>
            !(item.product.id === productId && item.selectedVariation === selectedVariation)
        )
      );
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.selectedVariation === selectedVariation
          ? { ...item, quantity }
          : item
      )
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
        lastAdded,
        showAddedModal,
        setShowAddedModal,
        selectedCategory,
        setSelectedCategory,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};