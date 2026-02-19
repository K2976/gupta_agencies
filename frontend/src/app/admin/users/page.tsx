'use client';

import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { createClient } from '@/lib/supabase/client';
import type { UserProfile } from '@/lib/types';
import { Plus, Pencil, UserX, UserCheck, X } from 'lucide-react';

export default function UsersPage() {
    const supabase = createClient();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [showModal, setShowModal] = useState(false);
    const [editUser, setEditUser] = useState<UserProfile | null>(null);
    const [salesmen, setSalesmen] = useState<UserProfile[]>([]);
    const [form, setForm] = useState({
        email: '', password: '', role: 'retailer' as string,
        owner_name: '', business_name: '', phone: '', address: '', gst: '',
        assigned_salesman_id: '' as string,
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const fetchUsers = useCallback(async () => {
        let query = supabase.from('users').select('*').order('created_at', { ascending: false });
        if (roleFilter !== 'all') query = query.eq('role', roleFilter);
        const { data } = await query;
        if (data) setUsers(data);
        setLoading(false);
    }, [supabase, roleFilter]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    useEffect(() => {
        supabase.from('users').select('id, owner_name, business_name').eq('role', 'salesman').eq('is_active', true)
            .then(({ data }) => { if (data) setSalesmen(data as UserProfile[]); });
    }, [supabase]);

    const openCreate = () => {
        setEditUser(null);
        setForm({ email: '', password: '', role: 'retailer', owner_name: '', business_name: '', phone: '', address: '', gst: '', assigned_salesman_id: '' });
        setError('');
        setShowModal(true);
    };

    const openEdit = (u: UserProfile) => {
        setEditUser(u);
        setForm({
            email: u.email, password: '', role: u.role, owner_name: u.owner_name,
            business_name: u.business_name || '', phone: u.phone || '', address: u.address || '',
            gst: u.gst || '', assigned_salesman_id: u.assigned_salesman_id || '',
        });
        setError('');
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.email.trim()) return;
        // For salesman, owner_name is optional — use email prefix as fallback
        const finalOwnerName = form.owner_name.trim() || form.email.split('@')[0];
        setSaving(true);
        setError('');

        if (editUser) {
            const updates: Record<string, unknown> = {
                owner_name: finalOwnerName, business_name: form.business_name || null,
                phone: form.phone || null, address: form.address || null, gst: form.gst || null,
            };
            if (form.role === 'retailer' && form.assigned_salesman_id) {
                updates.assigned_salesman_id = form.assigned_salesman_id;
            }
            await supabase.from('users').update(updates).eq('id', editUser.id);
        } else {
            if (!form.password || form.password.length < 6) {
                setError('Password must be at least 6 characters');
                setSaving(false);
                return;
            }
            // Create user via API route (uses service role key)
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, owner_name: finalOwnerName }),
            });
            const result = await res.json();
            if (!res.ok) {
                setError(result.error || 'Failed to create user');
                setSaving(false);
                return;
            }
        }
        setSaving(false);
        setShowModal(false);
        fetchUsers();
    };

    const toggleActive = async (user: UserProfile) => {
        await supabase.from('users').update({ is_active: !user.is_active }).eq('id', user.id);
        fetchUsers();
    };

    const roles = ['all', 'super_admin', 'salesman', 'retailer'];

    return (
        <DashboardLayout role="super_admin">
            <div className="animate-fade-in">
                <div className="page-header">
                    <h1 className="page-title">Users</h1>
                    <button onClick={openCreate} className="btn btn-primary"><Plus className="w-4 h-4" /> Add User</button>
                </div>

                <div className="flex gap-2 mb-4 flex-wrap">
                    {roles.map(r => (
                        <button key={r} onClick={() => { setRoleFilter(r); setLoading(true); }}
                            className={`btn btn-sm ${roleFilter === r ? (r === 'all' ? 'btn-primary' : `btn-filter-${r}`) : 'btn-secondary'}`}>
                            {r === 'all' ? 'All' : r.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
                ) : users.length === 0 ? (
                    <div className="empty-state"><p>No users found</p></div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr><th>Name</th><th>Email</th><th>Role</th><th>Business</th><th>Phone</th><th>Status</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id}>
                                        <td className="font-medium">{u.owner_name}</td>
                                        <td className="text-sm">{u.email}</td>
                                        <td><span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{
                                            background: u.role === 'super_admin' ? '#ede9fe' : u.role === 'salesman' ? '#dbeafe' : '#dcfce7',
                                            color: u.role === 'super_admin' ? '#6d28d9' : u.role === 'salesman' ? '#1d4ed8' : '#15803d',
                                        }}>{u.role.replace('_', ' ')}</span></td>
                                        <td className="text-sm text-[var(--text-secondary)]">{u.business_name || '—'}</td>
                                        <td className="text-sm">{u.phone || '—'}</td>
                                        <td>
                                            <span className={`badge ${u.is_active ? 'badge-accepted' : 'badge-rejected'}`}>
                                                {u.is_active ? 'Active' : 'Disabled'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => openEdit(u)} className="btn btn-ghost btn-sm"><Pencil className="w-3.5 h-3.5" /></button>
                                                <button onClick={() => toggleActive(u)} className="btn btn-ghost btn-sm" title={u.is_active ? 'Disable' : 'Enable'}>
                                                    {u.is_active ? <UserX className="w-3.5 h-3.5 text-red-500" /> : <UserCheck className="w-3.5 h-3.5 text-green-600" />}
                                                </button>
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
                            <h3 className="text-lg font-semibold">{editUser ? 'Edit User' : 'Add User'}</h3>
                            <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
                        </div>
                        {error && <div className="mb-3 p-2 rounded bg-red-50 text-red-600 text-sm">{error}</div>}
                        <div className="space-y-3">
                            {!editUser && (
                                <>
                                    <div>
                                        <label className="label">Role</label>
                                        <select className="input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                                            <option value="retailer">Retailer</option>
                                            <option value="salesman">Salesman</option>
                                            <option value="super_admin">Super Admin</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="label">Email</label>
                                        <input className="input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="label">Password</label>
                                        <input className="input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                                    </div>
                                </>
                            )}
                            <div>
                                <label className="label">{form.role === 'retailer' || editUser?.role === 'retailer' ? 'Owner Name' : 'Name'}</label>
                                <input className="input" placeholder={form.role !== 'retailer' ? 'Optional — uses email prefix' : ''} value={form.owner_name} onChange={e => setForm({ ...form, owner_name: e.target.value })} />
                            </div>
                            {(form.role === 'retailer' || editUser?.role === 'retailer') && (
                                <div>
                                    <label className="label">Business Name</label>
                                    <input className="input" value={form.business_name} onChange={e => setForm({ ...form, business_name: e.target.value })} />
                                </div>
                            )}
                            <div className={form.role === 'retailer' || editUser?.role === 'retailer' ? 'grid grid-cols-2 gap-3' : ''}>
                                <div>
                                    <label className="label">Phone</label>
                                    <input className="input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                                </div>
                                {(form.role === 'retailer' || editUser?.role === 'retailer') && (
                                    <div>
                                        <label className="label">GST (optional)</label>
                                        <input className="input" value={form.gst} onChange={e => setForm({ ...form, gst: e.target.value })} />
                                    </div>
                                )}
                            </div>
                            {(form.role === 'retailer' || editUser?.role === 'retailer') && (
                                <div>
                                    <label className="label">Address</label>
                                    <input className="input" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                                </div>
                            )}
                            {(form.role === 'retailer' || editUser?.role === 'retailer') && (
                                <div>
                                    <label className="label">Assigned Salesman</label>
                                    <select className="input" value={form.assigned_salesman_id} onChange={e => setForm({ ...form, assigned_salesman_id: e.target.value })}>
                                        <option value="">Select salesman</option>
                                        {salesmen.map(s => <option key={s.id} value={s.id}>{s.owner_name} {s.business_name ? `(${s.business_name})` : ''}</option>)}
                                    </select>
                                </div>
                            )}
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setShowModal(false)} className="btn btn-secondary flex-1">Cancel</button>
                                <button onClick={handleSave} disabled={saving} className="btn btn-primary flex-1">
                                    {saving ? 'Saving...' : editUser ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
