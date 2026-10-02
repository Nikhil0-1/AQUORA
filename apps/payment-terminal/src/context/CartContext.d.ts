import React from 'react';
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
export declare const CartProvider: React.FC<{
    children: React.ReactNode;
}>;
export declare const useCart: () => CartContextType;
export {};
