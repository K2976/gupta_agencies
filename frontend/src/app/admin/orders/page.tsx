'use client';

import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { createClient } from '@/lib/supabase/client';
import type { Order } from '@/lib/types';
import { Check, X as XIcon, Truck, Eye, X } from 'lucide-react';

export default function AdminOrdersPage() {
    const supabase = createClient();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const fetchOrders = useCallback(async () => {
        let query = supabase
            .from('orders')
            .select('*, retailer:users!orders_retailer_id_fkey(business_name, owner_name, phone), order_items(*, product:products(product_name, sku_code))')
            .order('created_at', { ascending: false });
        if (filter !== 'all') query = query.eq('status', filter);
        const { data } = await query;
        if (data) setOrders(data as unknown as Order[]);
        setLoading(false);
    }, [supabase, filter]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const updateStatus = async (orderId: string, status: string) => {
        await supabase.from('orders').update({ status }).eq('id', orderId);
        fetchOrders();
        if (selectedOrder?.id === orderId) setSelectedOrder(null);
    };

    const statusFilters = ['all', 'pending', 'accepted', 'rejected', 'delivered'];

    return (
        <DashboardLayout role="super_admin">
            <div className="animate-fade-in">
                <div className="page-header">
                    <h1 className="page-title">Orders</h1>
                </div>

                <div className="flex gap-2 mb-4 flex-wrap">
                    {statusFilters.map(s => (
                        <button
                            key={s}
                            onClick={() => { setFilter(s); setLoading(true); }}
                            className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="space-y-3">
                        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
                    </div>
                ) : orders.length === 0 ? (
                    <div className="empty-state"><p>No orders found</p></div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Retailer</th>
                                    <th>Amount</th>
                                    <th>Items</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order.id}>
                                        <td className="font-mono text-xs">{order.id.slice(0, 8)}</td>
                                        <td className="font-medium">{(order as unknown as { retailer: { business_name: string } }).retailer?.business_name || '—'}</td>
                                        <td className="font-semibold">₹{Number(order.total_amount).toLocaleString('en-IN')}</td>
                                        <td>{order.order_items?.length || 0}</td>
                                        <td><span className={`badge badge-${order.status}`}>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span></td>
                                        <td className="text-xs text-[var(--text-muted)]">{new Date(order.created_at).toLocaleDateString('en-IN')}</td>
                                        <td>
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => setSelectedOrder(order)} className="btn btn-ghost btn-sm" title="View"><Eye className="w-3.5 h-3.5" /></button>
                                                {order.status === 'pending' && (
                                                    <>
                                                        <button onClick={() => updateStatus(order.id, 'accepted')} className="btn btn-ghost btn-sm text-green-600" title="Accept"><Check className="w-3.5 h-3.5" /></button>
                                                        <button onClick={() => updateStatus(order.id, 'rejected')} className="btn btn-ghost btn-sm text-red-500" title="Reject"><XIcon className="w-3.5 h-3.5" /></button>
                                                    </>
                                                )}
                                                {order.status === 'accepted' && (
                                                    <button onClick={() => updateStatus(order.id, 'delivered')} className="btn btn-ghost btn-sm text-blue-600" title="Mark Delivered"><Truck className="w-3.5 h-3.5" /></button>
                                                )}
                                            </div>
                                        </td>
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
                                <div><span className="text-[var(--text-muted)]">Order ID:</span> <span className="font-mono">{selectedOrder.id.slice(0, 8)}</span></div>
                                <div><span className="text-[var(--text-muted)]">Status:</span> <span className={`badge badge-${selectedOrder.status} ml-1`}>{selectedOrder.status}</span></div>
                                <div><span className="text-[var(--text-muted)]">Total:</span> <span className="font-semibold">₹{Number(selectedOrder.total_amount).toLocaleString('en-IN')}</span></div>
                                <div><span className="text-[var(--text-muted)]">Date:</span> {new Date(selectedOrder.created_at).toLocaleString('en-IN')}</div>
                            </div>
                            {selectedOrder.notes && <div><span className="text-[var(--text-muted)]">Notes:</span> {selectedOrder.notes}</div>}
                            <h4 className="font-semibold pt-2">Items</h4>
                            <div className="table-container">
                                <table>
                                    <thead><tr><th>Product</th><th>SKU</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
                                    <tbody>
                                        {selectedOrder.order_items?.map(item => (
                                            <tr key={item.id}>
                                                <td>{(item as unknown as { product: { product_name: string } }).product?.product_name}</td>
                                                <td className="font-mono text-xs">{(item as unknown as { product: { sku_code: string } }).product?.sku_code}</td>
                                                <td>{item.quantity}</td>
                                                <td>₹{Number(item.unit_price).toLocaleString('en-IN')}</td>
                                                <td className="font-semibold">₹{Number(item.total_price).toLocaleString('en-IN')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {selectedOrder.status === 'pending' && (
                                <div className="flex gap-2 pt-2">
                                    <button onClick={() => updateStatus(selectedOrder.id, 'accepted')} className="btn btn-success flex-1"><Check className="w-4 h-4" /> Accept</button>
                                    <button onClick={() => updateStatus(selectedOrder.id, 'rejected')} className="btn btn-danger flex-1"><XIcon className="w-4 h-4" /> Reject</button>
                                </div>
                            )}
                            {selectedOrder.status === 'accepted' && (
                                <button onClick={() => updateStatus(selectedOrder.id, 'delivered')} className="btn btn-primary w-full"><Truck className="w-4 h-4" /> Mark Delivered</button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
