'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { createClient } from '@/lib/supabase/client';
import type { Product, SKU, Brand } from '@/lib/types';
import { Plus, Pencil, Trash2, Upload, X, Search, ChevronDown, ChevronRight } from 'lucide-react';

export default function ProductsPage() {
    const supabase = createClient();
    const [products, setProducts] = useState<(Product & { brand_name?: string; brand_logo?: string | null; skus?: SKU[] })[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

    // Product modal
    const [showProductModal, setShowProductModal] = useState(false);
    const [editProduct, setEditProduct] = useState<Product | null>(null);
    const [productForm, setProductForm] = useState({ brand_id: '', name: '', description: '', is_active: true });
    const [savingProduct, setSavingProduct] = useState(false);

    // SKU modal
    const [showSkuModal, setShowSkuModal] = useState(false);
    const [editSku, setEditSku] = useState<SKU | null>(null);
    const [skuParentId, setSkuParentId] = useState('');
    const [skuForm, setSkuForm] = useState({ sku_code: '', variant_label: '', case_size: '', mrp: '', dealer_price: '', is_active: true });
    const [savingSku, setSavingSku] = useState(false);

    const [uploading, setUploading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const fetchProducts = useCallback(async () => {
        let query = supabase
            .from('products')
            .select('*, brands(name, logo_url), skus(*)')
            .order('name');
        if (search) {
            query = query.or(`name.ilike.%${search}%`);
        }
        const { data } = await query;
        if (data) {
            setProducts(data.map((p: Record<string, unknown>) => ({
                ...p,
                brand_name: (p.brands as { name: string; logo_url?: string } | null)?.name || '',
                brand_logo: (p.brands as { name: string; logo_url?: string } | null)?.logo_url || null,
            })) as (Product & { brand_name?: string; brand_logo?: string | null; skus?: SKU[] })[]);
        }
        setLoading(false);
    }, [supabase, search]);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);
    useEffect(() => {
        supabase.from('brands').select('id, name').eq('is_active', true).order('name').then(({ data }) => {
            if (data) setBrands(data as Brand[]);
        });
    }, [supabase]);

    // Product CRUD
    const openCreateProduct = () => {
        setEditProduct(null);
        setProductForm({ brand_id: brands[0]?.id || '', name: '', description: '', is_active: true });
        setShowProductModal(true);
    };

    const openEditProduct = (p: Product) => {
        setEditProduct(p);
        setProductForm({ brand_id: p.brand_id, name: p.name, description: p.description || '', is_active: p.is_active });
        setShowProductModal(true);
    };

    const handleSaveProduct = async () => {
        if (!productForm.name.trim()) return;
        setSavingProduct(true);
        const row = { brand_id: productForm.brand_id, name: productForm.name, description: productForm.description || null, is_active: productForm.is_active };
        if (editProduct) {
            await supabase.from('products').update(row).eq('id', editProduct.id);
        } else {
            await supabase.from('products').insert(row);
        }
        setSavingProduct(false);
        setShowProductModal(false);
        fetchProducts();
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm('Delete this product and all its SKUs?')) return;
        await supabase.from('products').delete().eq('id', id);
        fetchProducts();
    };

    // SKU CRUD
    const openCreateSku = (productId: string) => {
        setEditSku(null);
        setSkuParentId(productId);
        setSkuForm({ sku_code: '', variant_label: '', case_size: '', mrp: '', dealer_price: '', is_active: true });
        setShowSkuModal(true);
    };

    const openEditSku = (sku: SKU) => {
        setEditSku(sku);
        setSkuParentId(sku.product_id);
        setSkuForm({
            sku_code: sku.sku_code, variant_label: sku.variant_label,
            case_size: sku.case_size || '', mrp: String(sku.mrp), dealer_price: String(sku.dealer_price),
            is_active: sku.is_active,
        });
        setShowSkuModal(true);
    };

    const handleSaveSku = async () => {
        if (!skuForm.sku_code.trim() || !skuForm.variant_label.trim()) return;
        setSavingSku(true);
        const row = {
            product_id: skuParentId, sku_code: skuForm.sku_code, variant_label: skuForm.variant_label,
            case_size: skuForm.case_size || null, mrp: parseFloat(skuForm.mrp) || 0,
            dealer_price: parseFloat(skuForm.dealer_price) || 0, is_active: skuForm.is_active,
        };
        if (editSku) {
            await supabase.from('skus').update(row).eq('id', editSku.id);
        } else {
            await supabase.from('skus').insert(row);
        }
        setSavingSku(false);
        setShowSkuModal(false);
        fetchProducts();
    };

    const handleDeleteSku = async (id: string) => {
        if (!confirm('Delete this SKU?')) return;
        await supabase.from('skus').delete().eq('id', id);
        fetchProducts();
    };

    // CSV Upload for SKUs
    const handleCSVUpload = async (file: File) => {
        setUploading(true);
        const text = await file.text();
        const lines = text.split('\n').filter(l => l.trim());
        const rows = [];
        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
            if (cols.length >= 6) {
                rows.push({
                    product_id: cols[0], sku_code: cols[1], variant_label: cols[2],
                    case_size: cols[3] || null, mrp: parseFloat(cols[4]) || 0,
                    dealer_price: parseFloat(cols[5]) || 0, is_active: true,
                });
            }
        }
        if (rows.length > 0) {
            const { error } = await supabase.from('skus').insert(rows);
            if (error) alert('Import error: ' + error.message);
            else alert(`${rows.length} SKUs imported successfully.`);
            fetchProducts();
        }
        setUploading(false);
    };

    return (
        <DashboardLayout role="super_admin">
            <div className="animate-fade-in">
                <div className="page-header">
                    <h1 className="page-title">Products & SKUs</h1>
                    <div className="flex items-center gap-2">
                        <label className="btn btn-secondary cursor-pointer">
                            <Upload className="w-4 h-4" /> {uploading ? 'Importing...' : 'CSV Import'}
                            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => e.target.files?.[0] && handleCSVUpload(e.target.files[0])} />
                        </label>
                        <button onClick={openCreateProduct} className="btn btn-bw">
                            <Plus className="w-4 h-4" /> Add Product
                        </button>
                    </div>
                </div>

                <div className="mb-4">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                        <input className="input pl-9" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
                ) : products.length === 0 ? (
                    <div className="empty-state">
                        <p className="text-lg mb-1">No products found</p>
                        <p className="text-sm">Add products and their SKU variants.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {products.map(p => {
                            const isOpen = expandedProduct === p.id;
                            const activeSkus = (p.skus || []).filter(s => s.is_active);
                            return (
                                <div key={p.id} className="card overflow-hidden">
                                    <div className="flex items-center justify-between py-2 px-1 cursor-pointer" onClick={() => setExpandedProduct(isOpen ? null : p.id)}>
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            {isOpen ? <ChevronDown className="w-4 h-4 text-[var(--text-muted)] shrink-0" /> : <ChevronRight className="w-4 h-4 text-[var(--text-muted)] shrink-0" />}
                                            {p.brand_logo ? (
                                                <img src={p.brand_logo} alt={p.brand_name || ''} className="w-8 h-8 rounded-full object-contain bg-white border border-[var(--border-color)] shrink-0" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                                                    style={{
                                                        background: `linear-gradient(135deg, hsl(${(p.brand_name || 'X').charCodeAt(0) * 3}, 65%, 55%), hsl(${(p.brand_name || 'X').charCodeAt(0) * 3 + 40}, 65%, 45%))`,
                                                        color: 'white',
                                                    }}
                                                >
                                                    {(p.brand_name || '?').charAt(0)}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-semibold text-sm">{p.name}</p>
                                                <p className="text-xs text-[var(--text-muted)]">{p.brand_name} · {activeSkus.length} SKU{activeSkus.length !== 1 ? 's' : ''}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                            <span className={`badge ${p.is_active ? 'badge-accepted' : 'badge-rejected'}`}>
                                                {p.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                            <button onClick={() => openEditProduct(p)} className="btn btn-ghost btn-sm"><Pencil className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => handleDeleteProduct(p.id)} className="btn btn-ghost btn-sm text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </div>
                                    </div>

                                    {isOpen && (
                                        <div className="border-t border-[var(--border-color)] pt-2 pb-1 px-1">
                                            {(p.skus || []).length === 0 ? (
                                                <p className="text-sm text-[var(--text-muted)] py-2 pl-7">No SKUs yet</p>
                                            ) : (
                                                <div className="table-container">
                                                    <table>
                                                        <thead><tr><th>SKU Code</th><th>Variant</th><th>Case</th><th>MRP</th><th>DLP</th><th>Status</th><th></th></tr></thead>
                                                        <tbody>
                                                            {(p.skus || []).map(sku => (
                                                                <tr key={sku.id}>
                                                                    <td className="font-mono text-xs">{sku.sku_code}</td>
                                                                    <td>{sku.variant_label}</td>
                                                                    <td className="text-xs text-[var(--text-muted)]">{sku.case_size || '—'}</td>
                                                                    <td>₹{Number(sku.mrp).toLocaleString('en-IN')}</td>
                                                                    <td className="font-semibold">₹{Number(sku.dealer_price).toLocaleString('en-IN')}</td>
                                                                    <td><span className={`badge ${sku.is_active ? 'badge-accepted' : 'badge-rejected'}`}>{sku.is_active ? 'Active' : 'Inactive'}</span></td>
                                                                    <td>
                                                                        <div className="flex items-center gap-1">
                                                                            <button onClick={() => openEditSku(sku)} className="btn btn-ghost btn-sm"><Pencil className="w-3 h-3" /></button>
                                                                            <button onClick={() => handleDeleteSku(sku.id)} className="btn btn-ghost btn-sm text-red-500"><Trash2 className="w-3 h-3" /></button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                            <button onClick={() => openCreateSku(p.id)} className="btn btn-secondary btn-sm mt-2 ml-7">
                                                <Plus className="w-3.5 h-3.5" /> Add SKU
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Product Modal */}
            {showProductModal && (
                <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">{editProduct ? 'Edit Product' : 'Add Product'}</h3>
                            <button onClick={() => setShowProductModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="label">Brand</label>
                                <select className="input" value={productForm.brand_id} onChange={e => setProductForm({ ...productForm, brand_id: e.target.value })}>
                                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="label">Product Name</label>
                                <input className="input" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} placeholder="e.g. Standard Epoxy Adhesive" />
                            </div>
                            <div>
                                <label className="label">Description</label>
                                <input className="input" value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} placeholder="Optional description" />
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="p_active" checked={productForm.is_active} onChange={e => setProductForm({ ...productForm, is_active: e.target.checked })} className="w-4 h-4 rounded" />
                                <label htmlFor="p_active" className="text-sm">Active</label>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setShowProductModal(false)} className="btn btn-secondary flex-1">Cancel</button>
                                <button onClick={handleSaveProduct} disabled={savingProduct} className="btn btn-primary flex-1">
                                    {savingProduct ? 'Saving...' : editProduct ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* SKU Modal */}
            {showSkuModal && (
                <div className="modal-overlay" onClick={() => setShowSkuModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">{editSku ? 'Edit SKU' : 'Add SKU'}</h3>
                            <button onClick={() => setShowSkuModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="label">SKU Code</label>
                                <input className="input" value={skuForm.sku_code} onChange={e => setSkuForm({ ...skuForm, sku_code: e.target.value })} placeholder="e.g. ARL-STD-5G" />
                            </div>
                            <div>
                                <label className="label">Variant Label</label>
                                <input className="input" value={skuForm.variant_label} onChange={e => setSkuForm({ ...skuForm, variant_label: e.target.value })} placeholder="e.g. 5g" />
                            </div>
                            <div>
                                <label className="label">Case Size</label>
                                <input className="input" value={skuForm.case_size} onChange={e => setSkuForm({ ...skuForm, case_size: e.target.value })} placeholder="e.g. 24x20" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="label">MRP (₹)</label>
                                    <input className="input" type="number" step="0.01" value={skuForm.mrp} onChange={e => setSkuForm({ ...skuForm, mrp: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label">Dealer Price (₹)</label>
                                    <input className="input" type="number" step="0.01" value={skuForm.dealer_price} onChange={e => setSkuForm({ ...skuForm, dealer_price: e.target.value })} />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="s_active" checked={skuForm.is_active} onChange={e => setSkuForm({ ...skuForm, is_active: e.target.checked })} className="w-4 h-4 rounded" />
                                <label htmlFor="s_active" className="text-sm">Active</label>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setShowSkuModal(false)} className="btn btn-secondary flex-1">Cancel</button>
                                <button onClick={handleSaveSku} disabled={savingSku} className="btn btn-primary flex-1">
                                    {savingSku ? 'Saving...' : editSku ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
