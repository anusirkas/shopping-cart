import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // lisa toode ostukorvi
  const addToCart = (product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  // uuenda kogust
  const updateQuantity = (id, quantity) => {
    setCart(prev =>
      prev.map(item => (item.id === id ? { ...item, quantity } : item))
    );
  };

  // eemalda korvist
  const removeFromCart = id => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // korvi kogus kokku
  const getCartCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };
    const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    };

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, getCartCount, getCartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
