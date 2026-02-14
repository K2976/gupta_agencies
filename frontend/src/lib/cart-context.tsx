'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { CartItem, Product } from '@/lib/types';

interface CartContextType {
    items: CartItem[];
    addItem: (product: Product, brandName: string, qty?: number) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, qty: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_KEY = 'gupta_cart';

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem(CART_KEY);
        if (saved) {
            try { setItems(JSON.parse(saved)); } catch { /* ignore */ }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(CART_KEY, JSON.stringify(items));
    }, [items]);

    const addItem = useCallback((product: Product, brandName: string, qty = 1) => {
        setItems(prev => {
            const existing = prev.find(i => i.product.id === product.id);
            if (existing) {
                return prev.map(i =>
                    i.product.id === product.id
                        ? { ...i, quantity: i.quantity + qty }
                        : i
                );
            }
            return [...prev, { product, brand_name: brandName, quantity: qty }];
        });
    }, []);

    const removeItem = useCallback((productId: string) => {
        setItems(prev => prev.filter(i => i.product.id !== productId));
    }, []);

    const updateQuantity = useCallback((productId: string, qty: number) => {
        if (qty <= 0) {
            removeItem(productId);
            return;
        }
        setItems(prev =>
            prev.map(i => (i.product.id === productId ? { ...i, quantity: qty } : i))
        );
    }, [removeItem]);

    const clearCart = useCallback(() => setItems([]), []);

    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
    const totalAmount = items.reduce(
        (sum, i) => sum + i.quantity * i.product.dealer_price,
        0
    );

    return (
        <CartContext.Provider
            value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalAmount }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) throw new Error('useCart must be used within CartProvider');
    return context;
}
