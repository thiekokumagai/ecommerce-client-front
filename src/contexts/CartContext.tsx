import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import type { Product, SelectedProduct } from "@/data/products";

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariation?: string;
}

export interface SavedOrder {
  id: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  paymentMethod: "pix" | "debito" | "credito" | "dinheiro";
  deliveryFee: number;
  subtotal: number;
  total: number;
  items: CartItem[];
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
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedNicotineStrength: string | null;
  setSelectedNicotineStrength: (strength: string | null) => void;
  orders: SavedOrder[];
  addOrder: (order: SavedOrder) => void;
}

const CartContext = createContext<CartContextType | null>(null);
const ORDERS_STORAGE_KEY = "podemais-orders";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNicotineStrength, setSelectedNicotineStrength] = useState<string | null>(null);
  const [orders, setOrders] = useState<SavedOrder[]>([]);
  const addedModalTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const storedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!storedOrders) return;

    try {
      const parsedOrders = JSON.parse(storedOrders) as SavedOrder[];
      setOrders(parsedOrders);
    } catch {
      setOrders([]);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (addedModalTimeoutRef.current) {
        clearTimeout(addedModalTimeoutRef.current);
      }
    };
  }, []);

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

    setShowAddedModal(false);

    if (addedModalTimeoutRef.current) {
      clearTimeout(addedModalTimeoutRef.current);
    }

    addedModalTimeoutRef.current = setTimeout(() => {
      setShowAddedModal(true);
      addedModalTimeoutRef.current = null;
    }, 3000);
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

  const clearCart = useCallback(() => {
    if (addedModalTimeoutRef.current) {
      clearTimeout(addedModalTimeoutRef.current);
      addedModalTimeoutRef.current = null;
    }
    setShowAddedModal(false);
    setItems([]);
  }, []);

  const addOrder = useCallback((order: SavedOrder) => {
    setOrders((prev) => {
      const nextOrders = [order, ...prev];
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(nextOrders));
      return nextOrders;
    });
  }, []);

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
        searchTerm,
        setSearchTerm,
        selectedNicotineStrength,
        setSelectedNicotineStrength,
        orders,
        addOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};