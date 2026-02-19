'use client';

import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { createClient } from '@/lib/supabase/client';
import type { Brand } from '@/lib/types';
import { Plus, Pencil, Trash2, FileText, Upload, X } from 'lucide-react';

export default function BrandsPage() {
    const supabase = createClient();
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editBrand, setEditBrand] = useState<Brand | null>(null);
    const [form, setForm] = useState({ name: '', is_active: true });
    const [saving, setSaving] = useState(false);

    const fetchBrands = useCallback(async () => {
        const { data } = await supabase
            .from('brands')
            .select('*')
            .order('name');
        if (data) setBrands(data);
        setLoading(false);
    }, [supabase]);

    useEffect(() => { fetchBrands(); }, [fetchBrands]);

    const openCreate = () => {
        setEditBrand(null);
        setForm({ name: '', is_active: true });
        setShowModal(true);
    };

    const openEdit = (brand: Brand) => {
        setEditBrand(brand);
        setForm({ name: brand.name, is_active: brand.is_active });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.name.trim()) return;
        setSaving(true);
        if (editBrand) {
            await supabase.from('brands').update({ name: form.name, is_active: form.is_active }).eq('id', editBrand.id);
        } else {
            await supabase.from('brands').insert({ name: form.name, is_active: form.is_active });
        }
        setSaving(false);
        setShowModal(false);
        fetchBrands();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this brand? All linked products will also be removed.')) return;
        await supabase.from('brands').delete().eq('id', id);
        fetchBrands();
    };

    const handlePdfUpload = async (brandId: string, file: File) => {
        const path = `${brandId}/${file.name}`;
        const { error } = await supabase.storage.from('brand-pdfs').upload(path, file, { upsert: true });
        if (error) { alert('Upload failed: ' + error.message); return; }
        const { data: urlData } = supabase.storage.from('brand-pdfs').getPublicUrl(path);
        await supabase.from('brands').update({ pdf_url: urlData.publicUrl }).eq('id', brandId);
        fetchBrands();
    };

    const handleLogoUpload = async (brandId: string, file: File) => {
        const path = `${brandId}/${file.name}`;
        const { error } = await supabase.storage.from('brand-logos').upload(path, file, { upsert: true });
        if (error) { alert('Upload failed: ' + error.message); return; }
        const { data: urlData } = supabase.storage.from('brand-logos').getPublicUrl(path);
        await supabase.from('brands').update({ logo_url: urlData.publicUrl }).eq('id', brandId);
        fetchBrands();
    };

    return (
        <DashboardLayout role="super_admin">
            <div className="animate-fade-in">
                <div className="page-header">
                    <h1 className="page-title">Brands</h1>
                    <button onClick={openCreate} className="btn btn-primary">
                        <Plus className="w-4 h-4" /> Add Brand
                    </button>
                </div>

                {loading ? (
                    <div className="space-y-3">
                        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
                    </div>
                ) : brands.length === 0 ? (
                    <div className="empty-state">
                        <p className="text-lg mb-1">No brands yet</p>
                        <p className="text-sm">Add your first brand to get started.</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Brand Name</th>
                                    <th>Status</th>
                                    <th>PDF</th>
                                    <th>Logo</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {brands.map(brand => (
                                    <tr key={brand.id}>
                                        <td className="font-medium">{brand.name}</td>
                                        <td>
                                            <span className={`badge ${brand.is_active ? 'badge-accepted' : 'badge-rejected'}`}>
                                                {brand.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                {brand.pdf_url && (
                                                    <a href={brand.pdf_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs flex items-center gap-1">
                                                        <FileText className="w-3.5 h-3.5" /> View
                                                    </a>
                                                )}
                                                <label className="btn btn-ghost btn-sm cursor-pointer">
                                                    <Upload className="w-3.5 h-3.5" /> Upload
                                                    <input type="file" accept=".pdf" className="hidden" onChange={e => e.target.files?.[0] && handlePdfUpload(brand.id, e.target.files[0])} />
                                                </label>
                                            </div>
                                        </td>
                                        <td>
                                            {brand.logo_url ? (
                                                <label className="relative group cursor-pointer inline-block">
                                                    <img
                                                        src={brand.logo_url}
                                                        alt={brand.name}
                                                        className="w-10 h-10 rounded-full object-contain bg-white border border-[var(--border-color)] shadow-sm"
                                                    />
                                                    <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Pencil className="w-3.5 h-3.5 text-white" />
                                                    </div>
                                                    <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleLogoUpload(brand.id, e.target.files[0])} />
                                                </label>
                                            ) : (
                                                <label className="btn btn-ghost btn-sm cursor-pointer">
                                                    <Upload className="w-3.5 h-3.5" /> Upload
                                                    <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleLogoUpload(brand.id, e.target.files[0])} />
                                                </label>
                                            )}
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => openEdit(brand)} className="btn btn-ghost btn-sm"><Pencil className="w-3.5 h-3.5" /></button>
                                                <button onClick={() => handleDelete(brand.id)} className="btn btn-ghost btn-sm text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">{editBrand ? 'Edit Brand' : 'Add Brand'}</h3>
                            <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="label">Brand Name</label>
                                <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Enter brand name" />
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="active" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 rounded" />
                                <label htmlFor="active" className="text-sm">Active</label>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setShowModal(false)} className="btn btn-secondary flex-1">Cancel</button>
                                <button onClick={handleSave} disabled={saving} className="btn btn-primary flex-1">
                                    {saving ? 'Saving...' : editBrand ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
