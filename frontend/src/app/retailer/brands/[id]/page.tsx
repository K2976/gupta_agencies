'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { createClient } from '@/lib/supabase/client';
import { useCart } from '@/lib/cart-context';
import type { Product, Brand } from '@/lib/types';
import { ShoppingBag, ArrowLeft, FileText, Search, ChevronRight } from 'lucide-react';

export default function BrandProductsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const supabase = createClient();
    const { totalItems } = useCart();
    const [brand, setBrand] = useState<Brand | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        async function load() {
            const [brandRes, productsRes] = await Promise.all([
                supabase.from('brands').select('*').eq('id', id).single(),
                supabase
                    .from('products')
                    .select('*, skus(id, mrp, dealer_price, is_active)')
                    .eq('brand_id', id)
                    .eq('is_active', true)
                    .order('name'),
            ]);
            if (brandRes.data) setBrand(brandRes.data);
            if (productsRes.data) {
                // Compute sku_count and price range for each product
                const enriched = productsRes.data.map((p: Product & { skus?: Array<{ id: string; mrp: number; dealer_price: number; is_active: boolean }> }) => {
                    const activeSkus = (p.skus || []).filter(s => s.is_active);
                    return {
                        ...p,
                        sku_count: activeSkus.length,
                        min_price: activeSkus.length > 0 ? Math.min(...activeSkus.map(s => Number(s.dealer_price))) : 0,
                        max_price: activeSkus.length > 0 ? Math.max(...activeSkus.map(s => Number(s.dealer_price))) : 0,
                    };
                });
                setProducts(enriched);
            }
            setLoading(false);
        }
        load();
    }, [supabase, id]);

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardLayout role="retailer">
            <div className="animate-fade-in">
                <div className="page-header">
                    <div className="flex items-center gap-3">
                        <Link href="/retailer/brands" className="p-2 hover:bg-gray-100 rounded-lg">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="page-title">{brand?.name || 'Loading...'}</h1>
                            <p className="text-sm text-[var(--text-muted)]">{products.length} products</p>
                        </div>
                    </div>
                    {brand?.pdf_url && (
                        <a href={brand.pdf_url} target="_blank" rel="noreferrer" className="btn btn-secondary">
                            <FileText className="w-4 h-4" /> View Price List (PDF)
                        </a>
                    )}
                </div>

                <div className="relative max-w-md mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input className="input pl-9" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>

                {loading ? (
                    <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state"><p>No products found</p></div>
                ) : (
                    <div className="space-y-2">
                        {filtered.map(product => (
                            <Link
                                key={product.id}
                                href={`/retailer/products/${product.id}`}
                                className="card flex items-center justify-between gap-3 py-4 px-4 hover:border-blue-300 transition-all"
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm">{product.name}</p>
                                    {product.description && (
                                        <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-1">{product.description}</p>
                                    )}
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-xs text-[var(--text-muted)]">
                                            {product.sku_count} variant{product.sku_count !== 1 ? 's' : ''}
                                        </span>
                                        {product.min_price !== undefined && product.min_price > 0 && (
                                            <span className="text-sm font-bold text-blue-600">
                                                ₹{product.min_price.toLocaleString('en-IN')}
                                                {product.max_price !== product.min_price && ` — ₹${product.max_price?.toLocaleString('en-IN')}`}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />
                            </Link>
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
