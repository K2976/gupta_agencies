'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { CartItem, SKU } from '@/lib/types';

interface CartContextType {
    items: CartItem[];
    addItem: (sku: SKU, productName: string, brandName: string, qty?: number) => void;
    removeItem: (skuId: string) => void;
    updateQuantity: (skuId: string, qty: number) => void;
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

    const addItem = useCallback((sku: SKU, productName: string, brandName: string, qty = 1) => {
        setItems(prev => {
            const existing = prev.find(i => i.sku.id === sku.id);
            if (existing) {
                return prev.map(i =>
                    i.sku.id === sku.id
                        ? { ...i, quantity: i.quantity + qty }
                        : i
                );
            }
            return [...prev, { sku, product_name: productName, brand_name: brandName, quantity: qty }];
        });
    }, []);

    const removeItem = useCallback((skuId: string) => {
        setItems(prev => prev.filter(i => i.sku.id !== skuId));
    }, []);

    const updateQuantity = useCallback((skuId: string, qty: number) => {
        if (qty <= 0) {
            removeItem(skuId);
            return;
        }
        setItems(prev =>
            prev.map(i => (i.sku.id === skuId ? { ...i, quantity: qty } : i))
        );
    }, [removeItem]);

    const clearCart = useCallback(() => setItems([]), []);

    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
    const totalAmount = items.reduce(
        (sum, i) => sum + i.quantity * i.sku.dealer_price,
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
