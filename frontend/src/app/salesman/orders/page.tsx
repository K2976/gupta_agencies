'use client';

import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { createClient } from '@/lib/supabase/client';
import type { Order } from '@/lib/types';
import { Eye, X } from 'lucide-react';

export default function SalesmanOrdersPage() {
    const supabase = createClient();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const fetchOrders = useCallback(async () => {
        const { data } = await supabase
            .from('orders')
            .select('*, retailer:users!orders_retailer_id_fkey(business_name, owner_name), order_items(*, product:products(product_name, sku_code))')
            .order('created_at', { ascending: false });
        if (data) setOrders(data as unknown as Order[]);
        setLoading(false);
    }, [supabase]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    return (
        <DashboardLayout role="salesman">
            <div className="animate-fade-in">
                <div className="page-header"><h1 className="page-title">Orders</h1></div>

                {loading ? (
                    <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
                ) : orders.length === 0 ? (
                    <div className="empty-state"><p>No orders from your retailers yet</p></div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr><th>Order ID</th><th>Retailer</th><th>Amount</th><th>Status</th><th>Date</th><th></th></tr>
                            </thead>
                            <tbody>
                                {orders.map(o => (
                                    <tr key={o.id}>
                                        <td className="font-mono text-xs">{o.id.slice(0, 8)}</td>
                                        <td className="font-medium">{(o as unknown as { retailer: { business_name: string } }).retailer?.business_name || '—'}</td>
                                        <td className="font-semibold">₹{Number(o.total_amount).toLocaleString('en-IN')}</td>
                                        <td><span className={`badge badge-${o.status}`}>{o.status.charAt(0).toUpperCase() + o.status.slice(1)}</span></td>
                                        <td className="text-xs text-[var(--text-muted)]">{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                                        <td><button onClick={() => setSelectedOrder(o)} className="btn btn-ghost btn-sm"><Eye className="w-3.5 h-3.5" /></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {selectedOrder && (
                <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Order Details</h3>
                            <button onClick={() => setSelectedOrder(null)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div className="grid grid-cols-2 gap-2">
                                <div><span className="text-[var(--text-muted)]">Status:</span> <span className={`badge badge-${selectedOrder.status} ml-1`}>{selectedOrder.status}</span></div>
                                <div><span className="text-[var(--text-muted)]">Total:</span> <span className="font-semibold">₹{Number(selectedOrder.total_amount).toLocaleString('en-IN')}</span></div>
                            </div>
                            <h4 className="font-semibold pt-2">Items</h4>
                            <div className="table-container">
                                <table>
                                    <thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
                                    <tbody>
                                        {selectedOrder.order_items?.map(item => (
                                            <tr key={item.id}>
                                                <td>{(item as unknown as { product: { product_name: string } }).product?.product_name}</td>
                                                <td>{item.quantity}</td>
                                                <td>₹{Number(item.unit_price).toLocaleString('en-IN')}</td>
                                                <td className="font-semibold">₹{Number(item.total_price).toLocaleString('en-IN')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
