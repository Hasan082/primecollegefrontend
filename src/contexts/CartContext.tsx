import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";

export interface CartItem {
  id: string;
  qualificationId: string;
  slug: string;
  title: string;
  level: string | null;
  duration: string;
  price: string;
  currency: string;
  category: string | null;
  imageUrl?: string | null;
  qualificationSessionId?: string | null;
  qualificationSessionTitle?: string | null;
  isUpsell?: boolean;
  pricingNote?: string;
  bundleOriginalPrice?: number;
  bundleDiscountTotal?: number;
  priceValue: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (slug: string) => void;
  clearCart: () => void;
  isInCart: (slug: string) => boolean;
  totalPrice: number;
  itemCount: number;
}

const CART_STORAGE_KEY = "primecollege_cart";

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Failed to save cart to localStorage:", error);
    }
  }, [items]);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.slug === item.slug);
      if (existingIndex === -1) {
        return [...prev, item];
      }

      const next = [...prev];
      next[existingIndex] = item;
      return next;
    });
  }, []);

  const removeItem = useCallback((slug: string) => {
    setItems((prev) => prev.filter((i) => i.slug !== slug));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const isInCart = useCallback((slug: string) => {
    return items.some((i) => i.slug === slug);
  }, [items]);

  const totalPrice = items.reduce((sum, item) => sum + item.priceValue, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        clearCart,
        isInCart,
        totalPrice,
        itemCount: items.length,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
