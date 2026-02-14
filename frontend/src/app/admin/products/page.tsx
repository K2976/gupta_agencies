'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { createClient } from '@/lib/supabase/client';
import type { Product, Brand } from '@/lib/types';
import { Plus, Pencil, Trash2, Upload, X, Search } from 'lucide-react';

export default function ProductsPage() {
    const supabase = createClient();
    const [products, setProducts] = useState<(Product & { brands?: { name: string } })[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editProduct, setEditProduct] = useState<Product | null>(null);
    const [form, setForm] = useState({
        brand_id: '', sku_code: '', product_name: '', mrp: '', dealer_price: '', is_active: true,
    });
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const fetchProducts = useCallback(async () => {
        let query = supabase
            .from('products')
            .select('*, brands(name)')
            .order('product_name');
        if (search) {
            query = query.or(`product_name.ilike.%${search}%,sku_code.ilike.%${search}%`);
        }
        const { data } = await query;
        if (data) setProducts(data);
        setLoading(false);
    }, [supabase, search]);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);
    useEffect(() => {
        supabase.from('brands').select('id, name').eq('is_active', true).order('name').then(({ data }) => {
            if (data) setBrands(data as Brand[]);
        });
    }, [supabase]);

    const openCreate = () => {
        setEditProduct(null);
        setForm({ brand_id: brands[0]?.id || '', sku_code: '', product_name: '', mrp: '', dealer_price: '', is_active: true });
        setShowModal(true);
    };

    const openEdit = (p: Product) => {
        setEditProduct(p);
        setForm({
            brand_id: p.brand_id, sku_code: p.sku_code, product_name: p.product_name,
            mrp: String(p.mrp), dealer_price: String(p.dealer_price), is_active: p.is_active,
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.product_name.trim() || !form.sku_code.trim()) return;
        setSaving(true);
        const row = {
            brand_id: form.brand_id, sku_code: form.sku_code, product_name: form.product_name,
            mrp: parseFloat(form.mrp) || 0, dealer_price: parseFloat(form.dealer_price) || 0, is_active: form.is_active,
        };
        if (editProduct) {
            await supabase.from('products').update(row).eq('id', editProduct.id);
        } else {
            await supabase.from('products').insert(row);
        }
        setSaving(false);
        setShowModal(false);
        fetchProducts();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this product?')) return;
        await supabase.from('products').delete().eq('id', id);
        fetchProducts();
    };

    const handleCSVUpload = async (file: File) => {
        setUploading(true);
        const text = await file.text();
        const lines = text.split('\n').filter(l => l.trim());
        const rows = [];
        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
            if (cols.length >= 5) {
                rows.push({
                    brand_id: cols[0], sku_code: cols[1], product_name: cols[2],
                    mrp: parseFloat(cols[3]) || 0, dealer_price: parseFloat(cols[4]) || 0, is_active: true,
                });
            }
        }
        if (rows.length > 0) {
            const { error } = await supabase.from('products').insert(rows);
            if (error) alert('Import error: ' + error.message);
            else alert(`${rows.length} products imported successfully.`);
            fetchProducts();
        }
        setUploading(false);
    };

    return (
        <DashboardLayout role="super_admin">
            <div className="animate-fade-in">
                <div className="page-header">
                    <h1 className="page-title">Products (SKUs)</h1>
                    <div className="flex items-center gap-2">
                        <label className="btn btn-secondary cursor-pointer">
                            <Upload className="w-4 h-4" /> {uploading ? 'Importing...' : 'CSV Import'}
                            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => e.target.files?.[0] && handleCSVUpload(e.target.files[0])} />
                        </label>
                        <button onClick={openCreate} className="btn btn-primary">
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
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}
                    </div>
                ) : products.length === 0 ? (
                    <div className="empty-state">
                        <p className="text-lg mb-1">No products found</p>
                        <p className="text-sm">Add products or import via CSV.</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>SKU Code</th>
                                    <th>Product Name</th>
                                    <th>Brand</th>
                                    <th>MRP</th>
                                    <th>Dealer Price</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(p => (
                                    <tr key={p.id}>
                                        <td className="font-mono text-xs">{p.sku_code}</td>
                                        <td className="font-medium">{p.product_name}</td>
                                        <td className="text-[var(--text-secondary)]">{p.brands?.name || '—'}</td>
                                        <td>₹{Number(p.mrp).toLocaleString('en-IN')}</td>
                                        <td className="font-semibold">₹{Number(p.dealer_price).toLocaleString('en-IN')}</td>
                                        <td>
                                            <span className={`badge ${p.is_active ? 'badge-accepted' : 'badge-rejected'}`}>
                                                {p.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => openEdit(p)} className="btn btn-ghost btn-sm"><Pencil className="w-3.5 h-3.5" /></button>
                                                <button onClick={() => handleDelete(p.id)} className="btn btn-ghost btn-sm text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">{editProduct ? 'Edit Product' : 'Add Product'}</h3>
                            <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="label">Brand</label>
                                <select className="input" value={form.brand_id} onChange={e => setForm({ ...form, brand_id: e.target.value })}>
                                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="label">SKU Code</label>
                                <input className="input" value={form.sku_code} onChange={e => setForm({ ...form, sku_code: e.target.value })} />
                            </div>
                            <div>
                                <label className="label">Product Name</label>
                                <input className="input" value={form.product_name} onChange={e => setForm({ ...form, product_name: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="label">MRP (₹)</label>
                                    <input className="input" type="number" step="0.01" value={form.mrp} onChange={e => setForm({ ...form, mrp: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label">Dealer Price (₹)</label>
                                    <input className="input" type="number" step="0.01" value={form.dealer_price} onChange={e => setForm({ ...form, dealer_price: e.target.value })} />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="p_active" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 rounded" />
                                <label htmlFor="p_active" className="text-sm">Active</label>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setShowModal(false)} className="btn btn-secondary flex-1">Cancel</button>
                                <button onClick={handleSave} disabled={saving} className="btn btn-primary flex-1">
                                    {saving ? 'Saving...' : editProduct ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
