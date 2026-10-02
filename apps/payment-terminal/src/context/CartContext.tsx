import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@aquora/shared-types';

export interface CartItem {
  product: Product;
  quantity: number;
  volume_ml: number;
  unitPrice: number;
  totalPrice: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, volume_ml?: number, quantity?: number) => void;
  addItem: (product: Product, volume_ml?: number, quantity?: number) => void;
  removeFromCart: (product_id: string, volume_ml?: number) => void;
  updateQuantity: (product_id: string, volume_ml_or_delta: number, delta?: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('aquora_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('aquora_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, volume_ml: number = 250, quantity: number = 1) => {
    setItems((prev) => {
      const existingIdx = prev.findIndex(
        (i) => i.product.id === product.id && i.volume_ml === volume_ml
      );

      const basePrice = product.price || 50;
      const baseVol = product.volume_ml || 250;
      const unitPrice = Math.round(basePrice * (volume_ml / baseVol));

      if (existingIdx > -1) {
        const copy = [...prev];
        const newQty = copy[existingIdx].quantity + quantity;
        copy[existingIdx].quantity = newQty;
        copy[existingIdx].totalPrice = unitPrice * newQty;
        return copy;
      } else {
        return [
          ...prev,
          {
            product,
            quantity,
            volume_ml,
            unitPrice,
            totalPrice: unitPrice * quantity,
          },
        ];
      }
    });
    setIsCartOpen(true);
  };

  const addItem = addToCart;

  const removeFromCart = (product_id: string, volume_ml?: number) => {
    setItems((prev) => prev.filter((i) => {
      if (volume_ml !== undefined) {
        return !(i.product.id === product_id && i.volume_ml === volume_ml);
      }
      return i.product.id !== product_id;
    }));
  };

  const updateQuantity = (product_id: string, arg2: number, arg3?: number) => {
    let volume_ml: number | undefined;
    let delta: number;

    if (arg3 !== undefined) {
      volume_ml = arg2;
      delta = arg3;
    } else {
      delta = arg2;
    }

    setItems((prev) => {
      return prev
        .map((item) => {
          const isMatch = item.product.id === product_id && (volume_ml === undefined || item.volume_ml === volume_ml);
          if (isMatch) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              totalPrice: item.unitPrice * newQty,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, i) => sum + i.totalPrice, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        addItem,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
        itemCount,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
