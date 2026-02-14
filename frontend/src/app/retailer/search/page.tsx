'use client';

import { useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { createClient } from '@/lib/supabase/client';
import { useCart } from '@/lib/cart-context';
import type { Product } from '@/lib/types';
import { Search as SearchIcon, ShoppingBag, Plus, Minus } from 'lucide-react';

interface SearchResult extends Product {
    brand_name: string;
}

export default function SearchPage() {
    const supabase = createClient();
    const { items, addItem, updateQuantity, removeItem, totalItems } = useCart();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (q: string) => {
        setQuery(q);
        if (q.length < 2) { setResults([]); setSearched(false); return; }
        setLoading(true);
        setSearched(true);

        const { data } = await supabase.rpc('search_products', { search_query: q });
        if (data) setResults(data as SearchResult[]);
        setLoading(false);
    };

    const getCartQty = (productId: string) => items.find(i => i.product.id === productId)?.quantity ?? 0;

    return (
        <DashboardLayout role="retailer">
            <div className="animate-fade-in">
                <div className="page-header"><h1 className="page-title">Search</h1></div>

                <div className="relative max-w-xl mb-6">
                    <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                    <input
                        className="input pl-11 text-base"
                        placeholder="Search by product name, SKU code, or brand..."
                        value={query}
                        onChange={e => handleSearch(e.target.value)}
                        autoFocus
                        style={{ minHeight: '52px', fontSize: '1rem' }}
                    />
                </div>

                {loading ? (
                    <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
                ) : searched && results.length === 0 ? (
                    <div className="empty-state"><p>No results for &quot;{query}&quot;</p></div>
                ) : (
                    <div className="space-y-2">
                        {results.map(product => {
                            const qty = getCartQty(product.id);
                            return (
                                <div key={product.id} className="card flex items-center justify-between gap-3 py-3 px-4">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm">{product.product_name}</p>
                                        <p className="text-xs text-[var(--text-muted)]">{product.brand_name} · {product.sku_code}</p>
                                        <div className="flex items-center gap-3 mt-0.5">
                                            <span className="text-xs text-[var(--text-muted)] line-through">₹{Number(product.mrp).toLocaleString('en-IN')}</span>
                                            <span className="text-sm font-bold text-blue-600">₹{Number(product.dealer_price).toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>
                                    {qty > 0 ? (
                                        <div className="flex items-center bg-blue-50 rounded-lg">
                                            <button onClick={() => qty === 1 ? removeItem(product.id) : updateQuantity(product.id, qty - 1)}
                                                className="w-9 h-9 flex items-center justify-center rounded-l-lg hover:bg-blue-100">
                                                <Minus className="w-4 h-4 text-blue-600" />
                                            </button>
                                            <span className="w-8 text-center font-semibold text-sm text-blue-700">{qty}</span>
                                            <button onClick={() => updateQuantity(product.id, qty + 1)}
                                                className="w-9 h-9 flex items-center justify-center rounded-r-lg hover:bg-blue-100">
                                                <Plus className="w-4 h-4 text-blue-600" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button onClick={() => addItem(product as unknown as Product, product.brand_name)} className="btn btn-primary btn-sm">
                                            <Plus className="w-4 h-4" /> Add
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {totalItems > 0 && (
                <Link href="/retailer/cart" className="floating-cart"><ShoppingBag className="w-5 h-5" /> {totalItems} items</Link>
            )}
        </DashboardLayout>
    );
}
