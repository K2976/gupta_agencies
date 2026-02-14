import type { DashboardStats } from '@/lib/types';
import { Package, ShoppingBag, Users, ClipboardList, TrendingUp, Clock } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    gradient?: string;
}

export function StatCard({ label, value, icon, gradient }: StatCardProps) {
    return (
        <div className="stat-card" style={{
            background: gradient || 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
        }}>
            <div className="flex items-center justify-between relative z-10">
                <div>
                    <p className="text-xs font-medium text-white/70 mb-1">{label}</p>
                    <p className="text-2xl font-bold">{value ?? 0}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center">
                    {icon}
                </div>
            </div>
        </div>
    );
}

export function AdminStatCards({ stats }: { stats: DashboardStats }) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                label="Orders Today"
                value={stats.total_orders_today ?? 0}
                icon={<ShoppingBag className="w-5 h-5" />}
                gradient="linear-gradient(135deg, #3b82f6, #2563eb)"
            />
            <StatCard
                label="This Month"
                value={stats.orders_this_month ?? 0}
                icon={<TrendingUp className="w-5 h-5" />}
                gradient="linear-gradient(135deg, #8b5cf6, #7c3aed)"
            />
            <StatCard
                label="Pending Orders"
                value={stats.pending_orders ?? 0}
                icon={<Clock className="w-5 h-5" />}
                gradient="linear-gradient(135deg, #f59e0b, #d97706)"
            />
            <StatCard
                label="Total Retailers"
                value={stats.total_retailers ?? 0}
                icon={<Users className="w-5 h-5" />}
                gradient="linear-gradient(135deg, #10b981, #059669)"
            />
        </div>
    );
}

export function RecentOrdersTable({ orders }: { orders: DashboardStats['recent_orders'] }) {
    if (!orders || orders.length === 0) {
        return <div className="empty-state"><p>No recent orders</p></div>;
    }

    return (
        <div className="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Retailer</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order.id}>
                            <td className="font-mono text-xs">{order.id.slice(0, 8)}...</td>
                            <td>{order.retailer_name || '—'}</td>
                            <td className="font-semibold">₹{Number(order.total_amount).toLocaleString('en-IN')}</td>
                            <td>
                                <span className={`badge badge-${order.status}`}>
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                            </td>
                            <td className="text-xs text-[var(--text-muted)]">
                                {new Date(order.created_at).toLocaleDateString('en-IN')}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
