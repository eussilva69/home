
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

type CartContextType = {
  cartItems: CartItemType[];
  addToCart: (item: Omit<CartItemType, 'quantity'>) => void;
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

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);

  useEffect(() => {
    // Load cart from localStorage on initial render on the client
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    // Save cart to localStorage whenever it changes
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (itemToAdd: Omit<CartItemType, 'quantity'>) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === itemToAdd.id);
      if (existingItem) {
        // Se o item já existe, aumenta a quantidade
        return prevItems.map(item =>
          item.id === itemToAdd.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      // Se não, adiciona o novo item
      return [...prevItems, { ...itemToAdd, quantity: 1 }];
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

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
