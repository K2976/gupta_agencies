'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { createClient } from '@/lib/supabase/client';
import { useCart } from '@/lib/cart-context';
import type { Brand } from '@/lib/types';
import { ShoppingBag, FileText, Search } from 'lucide-react';

export default function RetailerBrandsPage() {
    const supabase = createClient();
    const { totalItems } = useCart();
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        supabase.from('brands').select('*').eq('is_active', true).order('name')
            .then(({ data }) => { if (data) setBrands(data); setLoading(false); });
    }, [supabase]);

    const filtered = brands.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <DashboardLayout role="retailer">
            <div className="animate-fade-in">
                <div className="page-header">
                    <h1 className="page-title">Brands</h1>
                </div>

                <div className="relative max-w-md mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input className="input pl-9" placeholder="Search brands..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-40 rounded-xl" />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state"><p>No brands found</p></div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filtered.map(brand => (
                            <div key={brand.id} className="card text-center py-6 hover:border-blue-300 transition-all hover:-translate-y-1">
                                <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold shadow-sm"
                                    style={{
                                        background: `linear-gradient(135deg, hsl(${brand.name.charCodeAt(0) * 3}, 65%, 55%), hsl(${brand.name.charCodeAt(0) * 3 + 40}, 65%, 45%))`,
                                        color: 'white',
                                    }}
                                >
                                    {brand.name.charAt(0)}
                                </div>
                                <h3 className="font-semibold text-sm mb-3">{brand.name}</h3>
                                <div className="flex flex-col gap-2 px-2">
                                    <Link href={`/retailer/brands/${brand.id}`} className="btn btn-primary btn-sm w-full">
                                        View Products
                                    </Link>
                                    {brand.pdf_url && (
                                        <a href={brand.pdf_url} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm w-full">
                                            <FileText className="w-3.5 h-3.5" /> Price List PDF
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {totalItems > 0 && (
                <Link href="/retailer/cart" className="floating-cart">
                    <ShoppingBag className="w-5 h-5" /> {totalItems} items
                </Link>
            )}
        </DashboardLayout>
    );
}
