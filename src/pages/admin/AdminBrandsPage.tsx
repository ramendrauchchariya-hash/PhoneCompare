import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import supabase from '@/lib/supabase';
import { useToast } from '@/contexts/ToastContext';
import { slugify } from '@/utils/format';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';
import type { Brand } from '@/types';

export default function AdminBrandsPage() {
  const { showToast } = useToast();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', country: '', is_active: true, display_order: 0 });

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('brands').select('*').order('display_order');
    setBrands(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(null); setForm({ name: '', slug: '', description: '', country: '', is_active: true, display_order: 0 }); setShowForm(true); };
  const openEdit = (b: Brand) => { setEditing(b); setForm({ name: b.name, slug: b.slug, description: b.description || '', country: b.country || '', is_active: b.is_active, display_order: b.display_order }); setShowForm(true); };

  const save = async () => {
    if (!form.name.trim()) { showToast('Name is required', 'error'); return; }
    const slug = form.slug || slugify(form.name);
    try {
      if (editing) {
        const { error } = await supabase.from('brands').update({ ...form, slug }).eq('id', editing.id);
        if (error) throw error;
        showToast('Brand updated', 'success');
      } else {
        const { error } = await supabase.from('brands').insert({ ...form, slug });
        if (error) throw error;
        showToast('Brand added', 'success');
      }
      setShowForm(false);
      load();
    } catch (err) {
      console.error(err);
      showToast('Failed to save brand', 'error');
    }
  };

  const del = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from('brands').delete().eq('id', deleteTarget);
    if (error) showToast('Failed to delete brand', 'error');
    else { showToast('Brand deleted', 'success'); load(); }
    setDeleteTarget(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Brands</h1>
        <button onClick={openAdd} className="flex items-center gap-2 rounded-xl bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" /> Add Brand
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />)}</div>
      ) : brands.length === 0 ? (
        <EmptyState title="No brands yet" description="Add your first brand." action={<button onClick={openAdd} className="rounded-xl bg-blue-600 text-white px-4 py-2 text-sm">Add Brand</button>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {brands.map((b) => (
            <div key={b.id} className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{b.name}</p>
                <p className="text-xs text-gray-400">{b.country} • {b.is_active ? 'Active' : 'Inactive'}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => setDeleteTarget(b.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Brand' : 'Add Brand'} size="sm">
        <div className="space-y-3">
          <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Name *</label><input type="text" value={form.name} onChange={(e) => { setForm({ ...form, name: e.target.value, slug: editing ? form.slug : slugify(e.target.value) }); }} className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-white" /></div>
          <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Slug</label><input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-white" /></div>
          <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Country</label><input type="text" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-white" /></div>
          <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-white" /></div>
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded border-gray-300 text-blue-600" /><span className="text-sm text-gray-700 dark:text-gray-300">Active</span></label>
          <div className="flex gap-2 pt-2">
            <button onClick={save} className="flex-1 rounded-xl bg-blue-600 text-white py-2 text-sm font-medium hover:bg-blue-700">Save</button>
            <button onClick={() => setShowForm(false)} className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-600 dark:text-gray-300">Cancel</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} title="Delete Brand" message="This will delete the brand and all its phones." onConfirm={del} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
