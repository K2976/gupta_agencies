'use client';

import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { createClient } from '@/lib/supabase/client';
import type { Order, SKU } from '@/lib/types';
import Link from 'next/link';
import { Eye, RotateCcw, X, ShoppingBag } from 'lucide-react';

export default function RetailerOrdersPage() {
    const { profile } = useAuth();
    const { addItem, totalItems } = useCart();
    const supabase = createClient();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const fetchOrders = useCallback(async () => {
        const { data } = await supabase
            .from('orders')
            .select('*, order_items(*, sku:skus(id, sku_code, variant_label, dealer_price, mrp, case_size, is_active, created_at, updated_at, product_id, product:products(name, brand_id, brands(name))))')
            .order('created_at', { ascending: false });
        if (data) setOrders(data as unknown as Order[]);
        setLoading(false);
    }, [supabase]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const handleReorder = (order: Order) => {
        if (!order.order_items) return;
        order.order_items.forEach(item => {
            const skuData = item.sku as unknown as SKU & { product?: { name: string; brand_id: string; brands?: { name: string } } };
            if (skuData) {
                addItem(
                    { id: skuData.id, product_id: skuData.product_id, sku_code: skuData.sku_code, variant_label: skuData.variant_label, case_size: skuData.case_size, mrp: skuData.mrp, dealer_price: skuData.dealer_price, is_active: skuData.is_active, created_at: skuData.created_at, updated_at: skuData.updated_at },
                    skuData.product?.name || '',
                    skuData.product?.brands?.name || '',
                    item.quantity
                );
            }
        });
        alert('Items added to cart!');
    };

    return (
        <DashboardLayout role="retailer">
            <div className="animate-fade-in">
                <div className="page-header"><h1 className="page-title">My Orders</h1></div>

                {loading ? (
                    <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
                ) : orders.length === 0 ? (
                    <div className="empty-state">
                        <p className="text-lg mb-1">No orders yet</p>
                        <p className="text-sm mb-4">Place your first order today</p>
                        <Link href="/retailer/brands" className="btn btn-primary">Browse Brands</Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {orders.map(order => (
                            <div key={order.id} className="card">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-mono text-xs text-[var(--text-muted)]">#{order.id.slice(0, 8)}</span>
                                            <span className={`badge badge-${order.status}`}>
                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </span>
                                        </div>
                                        <p className="font-semibold">₹{Number(order.total_amount).toLocaleString('en-IN')}</p>
                                        <p className="text-xs text-[var(--text-muted)]">
                                            {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            {' · '}{order.order_items?.length || 0} items
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => setSelectedOrder(order)} className="btn btn-ghost btn-sm"><Eye className="w-4 h-4" /></button>
                                        <button onClick={() => handleReorder(order)} className="btn btn-secondary btn-sm">
                                            <RotateCcw className="w-3.5 h-3.5" /> Reorder
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedOrder && (
                <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Order #{selectedOrder.id.slice(0, 8)}</h3>
                            <button onClick={() => setSelectedOrder(null)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-3">
                                <span className={`badge badge-${selectedOrder.status}`}>{selectedOrder.status}</span>
                                <span className="font-semibold">₹{Number(selectedOrder.total_amount).toLocaleString('en-IN')}</span>
                                <span className="text-[var(--text-muted)]">{new Date(selectedOrder.created_at).toLocaleString('en-IN')}</span>
                            </div>
                            {selectedOrder.notes && <p className="text-[var(--text-secondary)]">Notes: {selectedOrder.notes}</p>}
                            <div className="table-container">
                                <table>
                                    <thead><tr><th>Product / Variant</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
                                    <tbody>
                                        {selectedOrder.order_items?.map(item => {
                                            const skuData = item.sku as unknown as SKU & { product?: { name: string } };
                                            return (
                                                <tr key={item.id}>
                                                    <td>
                                                        <p className="font-medium">{skuData?.product?.name}</p>
                                                        <p className="text-xs text-[var(--text-muted)]">{skuData?.variant_label} · {skuData?.sku_code}</p>
                                                    </td>
                                                    <td>{item.quantity}</td>
                                                    <td>₹{Number(item.unit_price).toLocaleString('en-IN')}</td>
                                                    <td className="font-semibold">₹{Number(item.total_price).toLocaleString('en-IN')}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {totalItems > 0 && (
                <Link href="/retailer/cart" className="floating-cart"><ShoppingBag className="w-5 h-5" /> {totalItems} items</Link>
            )}
        </DashboardLayout>
    );
}
