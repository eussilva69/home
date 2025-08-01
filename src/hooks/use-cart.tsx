
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
};

export type ShippingInfo = {
  id: number;
  name: string;
  price: number;
  company: string;
} | null;

type CartContextType = {
  cartItems: CartItemType[];
  shipping: ShippingInfo;
  addToCart: (item: CartItemType) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateShipping: (shippingInfo: ShippingInfo) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType>({
  cartItems: [],
  shipping: null,
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  updateShipping: () => {},
  clearCart: () => {},
});

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [shipping, setShipping] = useState<ShippingInfo>(null);
  
  // Load state from localStorage on client-side
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      const savedShipping = localStorage.getItem('shipping');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
      if (savedShipping) {
        setShipping(JSON.parse(savedShipping));
      }
    } catch (error) {
        console.error("Failed to parse cart/shipping from localStorage", error);
        // Clear corrupted data
        localStorage.removeItem('cart');
        localStorage.removeItem('shipping');
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);
  
  // Save shipping to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('shipping', JSON.stringify(shipping));
  }, [shipping]);


  const addToCart = (itemToAdd: CartItemType) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === itemToAdd.id);
      if (existingItem) {
        // Se o item já existe, aumenta a quantidade
        return prevItems.map(item =>
          item.id === itemToAdd.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      // Se não, adiciona o novo item com quantidade 1
      return [...prevItems, { ...itemToAdd }];
    });
     toast({
      title: "Adicionado ao Carrinho!",
      description: `${itemToAdd.name} foi adicionado ao seu carrinho.`,
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
     toast({
      variant: "destructive",
      title: "Item Removido",
      description: `O item foi removido do seu carrinho.`,
    });
  };
  
  const removeItem = (id: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };


  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
        removeItem(id);
        return;
    };
    setCartItems(prevItems =>
      prevItems.map(item => (item.id === id ? { ...item, quantity } : item))
    );
  };
  
  const updateShipping = (shippingInfo: ShippingInfo) => {
    setShipping(shippingInfo);
  };

  const clearCart = () => {
    setCartItems([]);
    setShipping(null);
    localStorage.removeItem('cart');
    localStorage.removeItem('shipping');
  };

  return (
    <CartContext.Provider value={{ cartItems, shipping, addToCart, removeFromCart, updateQuantity, updateShipping, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
