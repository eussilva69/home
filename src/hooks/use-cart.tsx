
'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useToast } from "@/hooks/use-toast";

export type CartItemType = {
  id: string; // Unique identifier for the cart item (e.g., product.id + options)
  name: string;
  price: number;
  quantity: number;
  image: string;
  options: string;
  weight: number; 
  width: number;
  height: number;
  length: number;
  customImages?: string[]; // Array of custom image URLs
};

export type ShippingInfo = {
  id: number;
  name: string;
  price: number;
  company: string;
} | null;

type CartContextType = {
  cartItems: CartItemType[];
  addToCart: (item: CartItemType) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType>({
  cartItems: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
});

const isClient = typeof window !== 'undefined';

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();

  const getInitialState = <T,>(key: string, fallback: T): T => {
    if (!isClient) return fallback;
    try {
      const storedValue = localStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) : fallback;
    } catch (error) {
      console.error(`Failed to parse ${key} from localStorage`, error);
      localStorage.removeItem(key);
      return fallback;
    }
  };

  const [cartItems, setCartItems] = useState<CartItemType[]>(() => getInitialState('cart', []));
  
  useEffect(() => {
    if(isClient) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems]);


  const addToCart = (itemToAdd: CartItemType) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === itemToAdd.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === itemToAdd.id ? { ...item, quantity: item.quantity + itemToAdd.quantity } : item
        );
      }
      return [...prevItems, { ...itemToAdd }];
    });
     toast({
      title: "Adicionado ao Carrinho!",
      description: `${itemToAdd.name} foi adicionado ao seu carrinho.`,
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems(prevItems => {
        const newItems = prevItems.filter(item => item.id !== id);
        return newItems;
    });
    toast({
      variant: "destructive",
      title: "Item Removido",
      description: `O item foi removido do seu carrinho.`,
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
        removeFromCart(id);
        return;
    };
    setCartItems(prevItems =>
      prevItems.map(item => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCartItems([]);
    if(isClient) {
      localStorage.removeItem('cart');
      localStorage.removeItem('shipping'); // Also clear shipping on cart clear
    }
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

    