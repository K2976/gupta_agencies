'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import {
    LayoutDashboard, Package, ShoppingBag, Users, ClipboardList,
    Search, LogOut, Menu, X, Package2, Sun, Moon
} from 'lucide-react';
import type { UserRole } from '@/lib/types';

interface NavItem {
    href: string;
    label: string;
    icon: React.ReactNode;
}

const navConfig: Record<UserRole, NavItem[]> = {
    super_admin: [
        { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
        { href: '/admin/brands', label: 'Brands', icon: <Package className="w-5 h-5" /> },
        { href: '/admin/products', label: 'Products', icon: <ShoppingBag className="w-5 h-5" /> },
        { href: '/admin/orders', label: 'Orders', icon: <ClipboardList className="w-5 h-5" /> },
        { href: '/admin/users', label: 'Users', icon: <Users className="w-5 h-5" /> },
    ],
    salesman: [
        { href: '/salesman', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
        { href: '/salesman/retailers', label: 'My Retailers', icon: <Users className="w-5 h-5" /> },
        { href: '/salesman/orders', label: 'Orders', icon: <ClipboardList className="w-5 h-5" /> },
    ],
    retailer: [
        { href: '/retailer', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
        { href: '/retailer/brands', label: 'Browse Brands', icon: <Package className="w-5 h-5" /> },
        { href: '/retailer/search', label: 'Search', icon: <Search className="w-5 h-5" /> },
        { href: '/retailer/orders', label: 'My Orders', icon: <ClipboardList className="w-5 h-5" /> },
        { href: '/retailer/cart', label: 'Cart', icon: <ShoppingBag className="w-5 h-5" /> },
    ],
};

export default function DashboardLayout({
    children,
    role,
}: {
    children: React.ReactNode;
    role: UserRole;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();
    const { profile, signOut } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const items = navConfig[role] || [];
    const roleLabel = role === 'super_admin' ? 'Super Admin' : role === 'salesman' ? 'Salesman' : 'Retailer';

    const handleSignOut = async () => {
        await signOut();
        window.location.href = '/';
    };

    return (
        <div className="min-h-screen bg-[var(--bg-secondary)]">
            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                {/* Toggle button at top */}
                <div className={`sidebar-toggle-area ${sidebarOpen ? '' : 'justify-center'}`}>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="sidebar-toggle-btn"
                        title={sidebarOpen ? 'Collapse menu' : 'Expand menu'}
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                </div>

                {/* Branding — visible only when expanded */}
                <div className={`sidebar-brand ${sidebarOpen ? '' : 'hidden'}`}>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
                        >
                            <Package2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-white leading-tight">Gupta Agencies</h2>
                            <span className="text-xs text-gray-400">{roleLabel}</span>
                        </div>
                    </div>
                </div>

                {/* Nav links */}
                <nav className="flex-1 p-2 space-y-0.5">
                    {items.map(item => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`sidebar-link ${pathname === item.href ? 'active' : ''} ${sidebarOpen ? '' : 'justify-center'}`}
                            title={!sidebarOpen ? item.label : undefined}
                        >
                            <span className="shrink-0">{item.icon}</span>
                            {sidebarOpen && <span>{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                {/* Footer — visible only when expanded */}
                <div className={`p-3 border-t border-white/10 ${sidebarOpen ? '' : 'hidden'}`}>
                    <div className="px-3 py-2 mb-2">
                        <p className="text-xs text-gray-400 truncate">{profile?.owner_name || 'User'}</p>
                        <p className="text-xs text-gray-500 truncate">{profile?.email}</p>
                    </div>
                    <button onClick={toggleTheme} className="sidebar-link w-full text-gray-300 hover:text-white hover:bg-white/5 mb-1">
                        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    </button>
                    <button onClick={handleSignOut} className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>

                {/* Collapsed footer — icons only */}
                <div className={`border-t border-white/10 flex flex-col items-center gap-1 py-3 ${sidebarOpen ? 'hidden' : ''}`}>
                    <button onClick={toggleTheme} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors" title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}>
                        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                    <button onClick={handleSignOut} className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors" title="Sign Out">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </aside>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Main content */}
            <div className={`main-content min-h-screen transition-[margin] duration-300`}>
                {/* Mobile top bar */}
                <header className="sticky top-0 z-20 backdrop-blur-lg border-b border-[var(--border-color)] md:hidden" style={{ background: 'var(--bg-primary)' }}>
                    <div className="flex items-center justify-between px-4 h-14">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 -ml-2 rounded-lg hover:bg-gray-100">
                            <Menu className="w-5 h-5" />
                        </button>
                        <span className="text-sm font-semibold">Gupta Agencies</span>
                        <div className="w-9" />
                    </div>
                </header>

                <main className="p-4 sm:p-6 lg:p-8 max-w-7xl">
                    {children}
                </main>
            </div>

            {/* Mobile close sidebar button */}
            {sidebarOpen && (
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="fixed top-4 right-4 z-50 p-2 rounded-lg bg-white/10 text-white md:hidden"
                >
                    <X className="w-5 h-5" />
                </button>
            )}
        </div>
    );
}
