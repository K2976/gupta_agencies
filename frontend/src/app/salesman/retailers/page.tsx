'use client';

import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';
import type { UserProfile } from '@/lib/types';
import { Plus, Pencil, X } from 'lucide-react';

export default function SalesmanRetailersPage() {
    const { profile } = useAuth();
    const supabase = createClient();
    const [retailers, setRetailers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editRetailer, setEditRetailer] = useState<UserProfile | null>(null);
    const [form, setForm] = useState({
        email: '', password: '', owner_name: '', business_name: '', phone: '', address: '', gst: '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const fetchRetailers = useCallback(async () => {
        if (!profile) return;
        const { data } = await supabase
            .from('users')
            .select('*')
            .eq('assigned_salesman_id', profile.id)
            .eq('role', 'retailer')
            .order('owner_name');
        if (data) setRetailers(data);
        setLoading(false);
    }, [supabase, profile]);

    useEffect(() => { fetchRetailers(); }, [fetchRetailers]);

    const openCreate = () => {
        setEditRetailer(null);
        setForm({ email: '', password: '', owner_name: '', business_name: '', phone: '', address: '', gst: '' });
        setError('');
        setShowModal(true);
    };

    const openEdit = (r: UserProfile) => {
        setEditRetailer(r);
        setForm({
            email: r.email, password: '', owner_name: r.owner_name,
            business_name: r.business_name || '', phone: r.phone || '', address: r.address || '', gst: r.gst || '',
        });
        setError('');
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.owner_name.trim()) return;
        setSaving(true);
        setError('');

        if (editRetailer) {
            await supabase.from('users').update({
                owner_name: form.owner_name, business_name: form.business_name,
                phone: form.phone, address: form.address, gst: form.gst,
            }).eq('id', editRetailer.id);
        } else {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form, role: 'retailer', assigned_salesman_id: profile?.id,
                }),
            });
            const result = await res.json();
            if (!res.ok) { setError(result.error); setSaving(false); return; }
        }
        setSaving(false);
        setShowModal(false);
        fetchRetailers();
    };

    return (
        <DashboardLayout role="salesman">
            <div className="animate-fade-in">
                <div className="page-header">
                    <h1 className="page-title">My Retailers</h1>
                    <button onClick={openCreate} className="btn btn-primary"><Plus className="w-4 h-4" /> Add Retailer</button>
                </div>

                {loading ? (
                    <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
                ) : retailers.length === 0 ? (
                    <div className="empty-state"><p className="text-lg mb-1">No retailers yet</p><p className="text-sm">Create your first retailer account.</p></div>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                        {retailers.map(r => (
                            <div key={r.id} className="card">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-semibold">{r.owner_name}</h3>
                                        <p className="text-sm text-[var(--text-secondary)]">{r.business_name}</p>
                                        <p className="text-xs text-[var(--text-muted)] mt-1">{r.phone}</p>
                                        <p className="text-xs text-[var(--text-muted)]">{r.email}</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className={`badge ${r.is_active ? 'badge-accepted' : 'badge-rejected'}`}>
                                            {r.is_active ? 'Active' : 'Disabled'}
                                        </span>
                                        <button onClick={() => openEdit(r)} className="btn btn-ghost btn-sm"><Pencil className="w-3.5 h-3.5" /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">{editRetailer ? 'Edit Retailer' : 'Add Retailer'}</h3>
                            <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
                        </div>
                        {error && <div className="mb-3 p-2 rounded bg-red-50 text-red-600 text-sm">{error}</div>}
                        <div className="space-y-3">
                            {!editRetailer && (
                                <>
                                    <div><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                                    <div><label className="label">Password</label><input className="input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
                                </>
                            )}
                            <div><label className="label">Owner Name</label><input className="input" value={form.owner_name} onChange={e => setForm({ ...form, owner_name: e.target.value })} /></div>
                            <div><label className="label">Business Name</label><input className="input" value={form.business_name} onChange={e => setForm({ ...form, business_name: e.target.value })} /></div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                                <div><label className="label">GST</label><input className="input" value={form.gst} onChange={e => setForm({ ...form, gst: e.target.value })} /></div>
                            </div>
                            <div><label className="label">Address</label><input className="input" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setShowModal(false)} className="btn btn-secondary flex-1">Cancel</button>
                                <button onClick={handleSave} disabled={saving} className="btn btn-primary flex-1">{saving ? 'Saving...' : editRetailer ? 'Update' : 'Create'}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
