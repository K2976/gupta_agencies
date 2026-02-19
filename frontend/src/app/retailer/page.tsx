'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { StatCard, RecentOrdersTable } from '@/components/dashboard/StatCards';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';
import type { Brand, DashboardStats } from '@/lib/types';
import { useCart } from '@/lib/cart-context';
import { ShoppingBag, Clock, Package, RotateCcw } from 'lucide-react';

export default function RetailerDashboard() {
    const { profile } = useAuth();
    const { totalItems } = useCart();
    const supabase = createClient();
    const [stats, setStats] = useState<DashboardStats>({});
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            if (!profile) return;
            const [dashRes, brandsRes] = await Promise.all([
                supabase.rpc('get_retailer_dashboard', { retailer_uuid: profile.id }),
                supabase.from('brands').select('*').eq('is_active', true).order('name'),
            ]);
            if (dashRes.data) setStats(dashRes.data);
            if (brandsRes.data) setBrands(brandsRes.data);
            setLoading(false);
        }
        load();
    }, [supabase, profile]);

    return (
        <DashboardLayout role="retailer">
            <div className="animate-fade-in">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Dashboard</h1>
                        <p className="text-sm text-[var(--text-muted)] mt-0.5">
                            Welcome, {profile?.owner_name} — {profile?.business_name}
                        </p>
                    </div>
                </div>

                {/* Stats */}
                {loading ? (
                    <div className="grid grid-cols-2 gap-4">
                        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard label="Total Orders" value={stats.total_orders ?? 0} icon={<ShoppingBag className="w-5 h-5" />} gradient="linear-gradient(135deg, #3b82f6, #2563eb)" />
                        <StatCard label="Pending" value={stats.pending_orders ?? 0} icon={<Clock className="w-5 h-5" />} gradient="linear-gradient(135deg, #f59e0b, #d97706)" />
                        <StatCard label="Brands" value={brands.length} icon={<Package className="w-5 h-5" />} gradient="linear-gradient(135deg, #8b5cf6, #7c3aed)" />
                        <StatCard label="Cart Items" value={totalItems} icon={<ShoppingBag className="w-5 h-5" />} gradient="linear-gradient(135deg, #10b981, #059669)" />
                    </div>
                )}

                {/* Quick Actions */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                    <Link href="/retailer/brands" className="card flex items-center gap-3 hover:border-blue-300 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                            <Package className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="font-semibold text-sm">Browse Brands</p>
                            <p className="text-xs text-[var(--text-muted)]">View products</p>
                        </div>
                    </Link>
                    <Link href="/retailer/orders" className="card flex items-center gap-3 hover:border-blue-300 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                            <RotateCcw className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="font-semibold text-sm">Reorder</p>
                            <p className="text-xs text-[var(--text-muted)]">Previous orders</p>
                        </div>
                    </Link>
                </div>

                {/* Brand Grid */}
                <div className="mt-8">
                    <h2 className="text-lg font-semibold mb-4">Brands</h2>
                    {loading ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                            {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                            {brands.map(brand => (
                                <Link
                                    key={brand.id}
                                    href={`/retailer/brands/${brand.id}`}
                                    className="card text-center py-4 px-2 hover:border-blue-300 transition-all hover:-translate-y-0.5"
                                >
                                    {brand.logo_url ? (
                                        <img
                                            src={brand.logo_url}
                                            alt={brand.name}
                                            className="w-12 h-12 rounded-full mx-auto mb-2 object-contain shadow-sm bg-white"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-lg font-bold"
                                            style={{
                                                background: `linear-gradient(135deg, hsl(${brand.name.charCodeAt(0) * 3}, 70%, 55%), hsl(${brand.name.charCodeAt(0) * 3 + 40}, 70%, 45%))`,
                                                color: 'white',
                                            }}
                                        >
                                            {brand.name.charAt(0)}
                                        </div>
                                    )}
                                    <p className="text-xs font-medium leading-tight">{brand.name}</p>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Orders */}
                <div className="mt-8">
                    <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
                    {loading ? <div className="skeleton h-32 rounded-xl" /> : <RecentOrdersTable orders={stats.recent_orders} />}
                </div>
            </div>

            {/* Floating cart */}
            {totalItems > 0 && (
                <Link href="/retailer/cart" className="floating-cart">
                    <ShoppingBag className="w-5 h-5" />
                    {totalItems} items
                </Link>
            )}
        </DashboardLayout>
    );
}
