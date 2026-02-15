'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { createClient } from '@/lib/supabase/client';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Send } from 'lucide-react';

export default function CartPage() {
    const router = useRouter();
    const { profile } = useAuth();
    const { items, updateQuantity, removeItem, clearCart, totalItems, totalAmount } = useCart();
    const supabase = createClient();
    const [notes, setNotes] = useState('');
    const [placing, setPlacing] = useState(false);
    const [success, setSuccess] = useState(false);

    const placeOrder = async () => {
        if (items.length === 0 || !profile) return;
        setPlacing(true);

        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                retailer_id: profile.id,
                salesman_id: profile.assigned_salesman_id,
                status: 'pending',
                total_amount: totalAmount,
                notes: notes || null,
            })
            .select()
            .single();

        if (orderError || !order) {
            alert('Failed to place order: ' + (orderError?.message || 'Unknown error'));
            setPlacing(false);
            return;
        }

        const orderItems = items.map(item => ({
            order_id: order.id,
            sku_id: item.sku.id,
            quantity: item.quantity,
            unit_price: item.sku.dealer_price,
            total_price: item.quantity * item.sku.dealer_price,
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) {
            alert('Order created but failed to add items: ' + itemsError.message);
            setPlacing(false);
            return;
        }

        clearCart();
        setSuccess(true);
        setPlacing(false);
    };

    if (success) {
        return (
            <DashboardLayout role="retailer">
                <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                        style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                    >
                        <Send className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Order Placed!</h2>
                    <p className="text-[var(--text-muted)] mb-6">Your order has been submitted successfully.</p>
                    <div className="flex gap-3">
                        <Link href="/retailer/orders" className="btn btn-primary">View Orders</Link>
                        <Link href="/retailer/brands" className="btn btn-secondary">Continue Shopping</Link>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="retailer">
            <div className="animate-fade-in">
                <div className="page-header">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="page-title">Cart</h1>
                            <p className="text-sm text-[var(--text-muted)]">{totalItems} items</p>
                        </div>
                    </div>
                </div>

                {items.length === 0 ? (
                    <div className="empty-state">
                        <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-lg mb-1">Your cart is empty</p>
                        <p className="text-sm mb-4">Browse brands to add products</p>
                        <Link href="/retailer/brands" className="btn btn-primary">Browse Brands</Link>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-2">
                            {items.map(item => (
                                <div key={item.sku.id} className="card flex items-center gap-3 py-3 px-4">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm">{item.product_name} — {item.sku.variant_label}</p>
                                        <p className="text-xs text-[var(--text-muted)]">{item.brand_name} · {item.sku.sku_code}</p>
                                        <p className="text-sm font-semibold text-blue-600 mt-0.5">
                                            ₹{Number(item.sku.dealer_price).toLocaleString('en-IN')} × {item.quantity} = ₹{(item.quantity * item.sku.dealer_price).toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center bg-gray-50 rounded-lg">
                                            <button onClick={() => item.quantity === 1 ? removeItem(item.sku.id) : updateQuantity(item.sku.id, item.quantity - 1)}
                                                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-l-lg">
                                                <Minus className="w-3.5 h-3.5" />
                                            </button>
                                            <input
                                                type="number"
                                                min="0"
                                                value={item.quantity}
                                                onChange={e => {
                                                    const val = parseInt(e.target.value, 10);
                                                    if (isNaN(val) || val < 0) return;
                                                    if (val === 0) removeItem(item.sku.id);
                                                    else updateQuantity(item.sku.id, val);
                                                }}
                                                onBlur={e => { if (!e.target.value || parseInt(e.target.value) <= 0) removeItem(item.sku.id); }}
                                                className="w-10 text-center text-sm font-semibold bg-transparent border-none outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                            />
                                            <button onClick={() => updateQuantity(item.sku.id, item.quantity + 1)}
                                                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-r-lg">
                                                <Plus className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <button onClick={() => removeItem(item.sku.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="lg:col-span-1">
                            <div className="card sticky top-20">
                                <h3 className="font-semibold mb-4">Order Summary</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-[var(--text-secondary)]">Items ({totalItems})</span>
                                        <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="border-t border-[var(--border-color)] pt-2 flex justify-between font-bold text-lg">
                                        <span>Total</span>
                                        <span className="text-blue-600">₹{totalAmount.toLocaleString('en-IN')}</span>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <label className="label">Order Notes (optional)</label>
                                    <textarea className="input" rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any special instructions..." />
                                </div>

                                <button onClick={placeOrder} disabled={placing} className="btn btn-primary w-full mt-4" style={{ minHeight: '48px' }}>
                                    {placing ? (
                                        <span className="inline-flex items-center gap-2">
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Placing Order...
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-2">
                                            <Send className="w-4 h-4" /> Place Order
                                        </span>
                                    )}
                                </button>

                                <button onClick={clearCart} className="btn btn-ghost w-full mt-2 text-red-500">
                                    Clear Cart
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
