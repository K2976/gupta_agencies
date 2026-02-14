'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { createClient } from '@/lib/supabase/client';
import { useCart } from '@/lib/cart-context';
import type { Product, Brand } from '@/lib/types';
import { ShoppingBag, Plus, Minus, ArrowLeft, FileText, Search } from 'lucide-react';

export default function BrandProductsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const supabase = createClient();
    const { items, addItem, updateQuantity, removeItem, totalItems } = useCart();
    const [brand, setBrand] = useState<Brand | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        async function load() {
            const [brandRes, productsRes] = await Promise.all([
                supabase.from('brands').select('*').eq('id', id).single(),
                supabase.from('products').select('*').eq('brand_id', id).eq('is_active', true).order('product_name'),
            ]);
            if (brandRes.data) setBrand(brandRes.data);
            if (productsRes.data) setProducts(productsRes.data);
            setLoading(false);
        }
        load();
    }, [supabase, id]);

    const filtered = products.filter(p =>
        p.product_name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku_code.toLowerCase().includes(search.toLowerCase())
    );

    const getCartQty = (productId: string) => {
        const item = items.find(i => i.product.id === productId);
        return item?.quantity ?? 0;
    };

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
                        {filtered.map(product => {
                            const qty = getCartQty(product.id);
                            return (
                                <div key={product.id} className="card flex items-center justify-between gap-3 py-3 px-4">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm leading-tight">{product.product_name}</p>
                                        <p className="text-xs text-[var(--text-muted)] mt-0.5">{product.sku_code}</p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs text-[var(--text-muted)] line-through">MRP ₹{Number(product.mrp).toLocaleString('en-IN')}</span>
                                            <span className="text-sm font-bold text-blue-600">₹{Number(product.dealer_price).toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {qty > 0 ? (
                                            <div className="flex items-center gap-0 bg-blue-50 rounded-lg">
                                                <button
                                                    onClick={() => qty === 1 ? removeItem(product.id) : updateQuantity(product.id, qty - 1)}
                                                    className="w-9 h-9 flex items-center justify-center rounded-l-lg hover:bg-blue-100 transition-colors"
                                                >
                                                    <Minus className="w-4 h-4 text-blue-600" />
                                                </button>
                                                <span className="w-8 text-center font-semibold text-sm text-blue-700">{qty}</span>
                                                <button
                                                    onClick={() => updateQuantity(product.id, qty + 1)}
                                                    className="w-9 h-9 flex items-center justify-center rounded-r-lg hover:bg-blue-100 transition-colors"
                                                >
                                                    <Plus className="w-4 h-4 text-blue-600" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => addItem(product, brand?.name || '')}
                                                className="btn btn-primary btn-sm"
                                            >
                                                <Plus className="w-4 h-4" /> Add
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
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
