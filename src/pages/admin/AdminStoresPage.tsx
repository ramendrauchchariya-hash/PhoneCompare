import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import supabase from '@/lib/supabase';
import { useToast } from '@/contexts/ToastContext';
import { slugify } from '@/utils/format';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';
import type { Store } from '@/types';

export default function AdminStoresPage() {
  const { showToast } = useToast();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Store | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', website: '', affiliate_url: '', is_active: true, display_order: 0 });

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('stores').select('*').order('display_order');
    setStores(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(null); setForm({ name: '', slug: '', website: '', affiliate_url: '', is_active: true, display_order: 0 }); setShowForm(true); };
  const openEdit = (s: Store) => { setEditing(s); setForm({ name: s.name, slug: s.slug, website: s.website || '', affiliate_url: s.affiliate_url || '', is_active: s.is_active, display_order: s.display_order }); setShowForm(true); };

  const save = async () => {
    if (!form.name.trim()) { showToast('Name is required', 'error'); return; }
    const slug = form.slug || slugify(form.name);
    try {
      if (editing) {
        const { error } = await supabase.from('stores').update({ ...form, slug }).eq('id', editing.id);
        if (error) throw error;
        showToast('Store updated', 'success');
      } else {
        const { error } = await supabase.from('stores').insert({ ...form, slug });
        if (error) throw error;
        showToast('Store added', 'success');
      }
      setShowForm(false); load();
    } catch { showToast('Failed to save store', 'error'); }
  };

  const del = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from('stores').delete().eq('id', deleteTarget);
    if (error) showToast('Failed to delete store', 'error');
    else { showToast('Store deleted', 'success'); load(); }
    setDeleteTarget(null);
  };

  const inputClass = 'w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-white';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Stores</h1>
        <button onClick={openAdd} className="flex items-center gap-2 rounded-xl bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" /> Add Store
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />)}</div>
      ) : stores.length === 0 ? (
        <EmptyState title="No stores yet" description="Add your first store." action={<button onClick={openAdd} className="rounded-xl bg-blue-600 text-white px-4 py-2 text-sm">Add Store</button>} />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-700">
          <table className="w-full">
            <thead><tr className="bg-gray-50 dark:bg-gray-800 text-left text-xs text-gray-500 dark:text-gray-400">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium hidden sm:table-cell">Website</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {stores.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{s.name}</td>
                  <td className="px-4 py-3 hidden sm:table-cell text-sm text-blue-600 truncate max-w-48">{s.website}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${s.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>{s.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td className="px-4 py-3"><div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteTarget(s.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="w-4 h-4" /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Store' : 'Add Store'} size="sm">
        <div className="space-y-3">
          <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Name *</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: editing ? form.slug : slugify(e.target.value) })} className={inputClass} /></div>
          <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Website</label><input type="text" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className={inputClass} placeholder="https://..." /></div>
          <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Affiliate URL</label><input type="text" value={form.affiliate_url} onChange={(e) => setForm({ ...form, affiliate_url: e.target.value })} className={inputClass} placeholder="https://..." /></div>
          <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Display Order</label><input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} className={inputClass} /></div>
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded border-gray-300 text-blue-600" /><span className="text-sm text-gray-700 dark:text-gray-300">Active</span></label>
          <div className="flex gap-2 pt-2">
            <button onClick={save} className="flex-1 rounded-xl bg-blue-600 text-white py-2 text-sm font-medium hover:bg-blue-700">Save</button>
            <button onClick={() => setShowForm(false)} className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-600 dark:text-gray-300">Cancel</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} title="Delete Store" message="This will delete the store and all its price records." onConfirm={del} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
