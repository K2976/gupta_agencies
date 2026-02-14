'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { AdminStatCards, RecentOrdersTable } from '@/components/dashboard/StatCards';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';
import type { DashboardStats } from '@/lib/types';

export default function AdminDashboard() {
    const { profile } = useAuth();
    const [stats, setStats] = useState<DashboardStats>({});
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchStats() {
            const { data } = await supabase.rpc('get_admin_dashboard');
            if (data) setStats(data);
            setLoading(false);
        }
        fetchStats();
    }, [supabase]);

    return (
        <DashboardLayout role="super_admin">
            <div className="animate-fade-in">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Dashboard</h1>
                        <p className="text-sm text-[var(--text-muted)] mt-0.5">
                            Welcome back, {profile?.owner_name || 'Admin'}
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="skeleton h-24 rounded-xl" />
                        ))}
                    </div>
                ) : (
                    <AdminStatCards stats={stats} />
                )}

                <div className="mt-8">
                    <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
                    {loading ? (
                        <div className="skeleton h-48 rounded-xl" />
                    ) : (
                        <RecentOrdersTable orders={stats.recent_orders} />
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
