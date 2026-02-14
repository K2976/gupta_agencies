'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { StatCard, RecentOrdersTable } from '@/components/dashboard/StatCards';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';
import type { DashboardStats } from '@/lib/types';
import { Users, ShoppingBag, TrendingUp, Clock } from 'lucide-react';

export default function SalesmanDashboard() {
    const { profile } = useAuth();
    const [stats, setStats] = useState<DashboardStats>({});
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchStats() {
            if (!profile) return;
            const { data } = await supabase.rpc('get_salesman_dashboard', { salesman_uuid: profile.id });
            if (data) setStats(data);
            setLoading(false);
        }
        fetchStats();
    }, [supabase, profile]);

    return (
        <DashboardLayout role="salesman">
            <div className="animate-fade-in">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Dashboard</h1>
                        <p className="text-sm text-[var(--text-muted)] mt-0.5">Welcome, {profile?.owner_name}</p>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 gap-4">
                        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard label="My Retailers" value={stats.total_retailers ?? 0} icon={<Users className="w-5 h-5" />} gradient="linear-gradient(135deg, #3b82f6, #2563eb)" />
                        <StatCard label="Orders Today" value={stats.total_orders_today ?? 0} icon={<ShoppingBag className="w-5 h-5" />} gradient="linear-gradient(135deg, #8b5cf6, #7c3aed)" />
                        <StatCard label="This Month" value={stats.orders_this_month ?? 0} icon={<TrendingUp className="w-5 h-5" />} gradient="linear-gradient(135deg, #10b981, #059669)" />
                        <StatCard label="Pending" value={stats.pending_orders ?? 0} icon={<Clock className="w-5 h-5" />} gradient="linear-gradient(135deg, #f59e0b, #d97706)" />
                    </div>
                )}

                <div className="mt-8">
                    <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
                    {loading ? <div className="skeleton h-48 rounded-xl" /> : <RecentOrdersTable orders={stats.recent_orders} />}
                </div>
            </div>
        </DashboardLayout>
    );
}
