import { createContext, useContext, useState, ReactNode } from "react";

export interface CartItem {
  slug: string;
  title: string;
  level: string;
  duration: string;
  price: string;
  category: string;
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

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      if (prev.find((i) => i.slug === item.slug)) return prev;
      return [...prev, item];
    });
  };

  const removeItem = (slug: string) => {
    setItems((prev) => prev.filter((i) => i.slug !== slug));
  };

  const clearCart = () => setItems([]);

  const isInCart = (slug: string) => items.some((i) => i.slug === slug);

  const totalPrice = items.reduce(
    (sum, item) => sum + parseFloat(item.price.replace(/[^0-9.]/g, "")),
    0
  );

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, clearCart, isInCart, totalPrice, itemCount: items.length }}
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
