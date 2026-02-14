'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { createClient } from '@/lib/supabase/client';
import { useCart } from '@/lib/cart-context';
import type { SKU, Product, Brand } from '@/lib/types';
import { ShoppingBag, Plus, Minus, ArrowLeft, Search } from 'lucide-react';

export default function ProductSKUsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const supabase = createClient();
    const { items, addItem, updateQuantity, removeItem, totalItems } = useCart();
    const [product, setProduct] = useState<Product | null>(null);
    const [brand, setBrand] = useState<Brand | null>(null);
    const [skus, setSKUs] = useState<SKU[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        async function load() {
            // Fetch product with brand info
            const { data: productData } = await supabase
                .from('products')
                .select('*, brands(*)')
                .eq('id', id)
                .single();

            if (productData) {
                setProduct(productData);
                setBrand(productData.brands as Brand);
            }

            // Fetch SKUs for this product
            const { data: skuData } = await supabase
                .from('skus')
                .select('*')
                .eq('product_id', id)
                .eq('is_active', true)
                .order('dealer_price');

            if (skuData) setSKUs(skuData);
            setLoading(false);
        }
        load();
    }, [supabase, id]);

    const filtered = skus.filter(s =>
        s.variant_label.toLowerCase().includes(search.toLowerCase()) ||
        s.sku_code.toLowerCase().includes(search.toLowerCase())
    );

    const getCartQty = (skuId: string) => {
        const item = items.find(i => i.sku.id === skuId);
        return item?.quantity ?? 0;
    };

    return (
        <DashboardLayout role="retailer">
            <div className="animate-fade-in">
                <div className="page-header">
                    <div className="flex items-center gap-3">
                        <Link
                            href={brand ? `/retailer/brands/${brand.id}` : '/retailer/brands'}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <p className="text-xs text-[var(--text-muted)]">{brand?.name}</p>
                            <h1 className="page-title">{product?.name || 'Loading...'}</h1>
                            <p className="text-sm text-[var(--text-muted)]">{skus.length} variant{skus.length !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                </div>

                {product?.description && (
                    <p className="text-sm text-[var(--text-secondary)] mb-4">{product.description}</p>
                )}

                {skus.length > 4 && (
                    <div className="relative max-w-md mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                        <input className="input pl-9" placeholder="Search variants..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                )}

                {loading ? (
                    <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state"><p>No variants found</p></div>
                ) : (
                    <div className="space-y-2">
                        {filtered.map(sku => {
                            const qty = getCartQty(sku.id);
                            return (
                                <div key={sku.id} className="card flex items-center justify-between gap-3 py-3 px-4">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm leading-tight">{sku.variant_label}</p>
                                        <p className="text-xs text-[var(--text-muted)] mt-0.5">{sku.sku_code}{sku.case_size ? ` · Case: ${sku.case_size}` : ''}</p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs text-[var(--text-muted)] line-through">MRP ₹{Number(sku.mrp).toLocaleString('en-IN')}</span>
                                            <span className="text-sm font-bold text-blue-600">₹{Number(sku.dealer_price).toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {qty > 0 ? (
                                            <div className="flex items-center gap-0 bg-blue-50 rounded-lg">
                                                <button
                                                    onClick={() => qty === 1 ? removeItem(sku.id) : updateQuantity(sku.id, qty - 1)}
                                                    className="w-9 h-9 flex items-center justify-center rounded-l-lg hover:bg-blue-100 transition-colors"
                                                >
                                                    <Minus className="w-4 h-4 text-blue-600" />
                                                </button>
                                                <span className="w-8 text-center font-semibold text-sm text-blue-700">{qty}</span>
                                                <button
                                                    onClick={() => updateQuantity(sku.id, qty + 1)}
                                                    className="w-9 h-9 flex items-center justify-center rounded-r-lg hover:bg-blue-100 transition-colors"
                                                >
                                                    <Plus className="w-4 h-4 text-blue-600" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => addItem(sku, product?.name || '', brand?.name || '')}
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
