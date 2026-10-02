import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import supabase from '@/lib/supabase';
import { useToast } from '@/contexts/ToastContext';
import { slugify } from '@/utils/format';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';
import type { Category } from '@/types';

export default function AdminCategoriesPage() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', icon: '', display_order: 0 });

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('categories').select('*').order('display_order');
    setCategories(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.name.trim()) { showToast('Name is required', 'error'); return; }
    const slug = form.slug || slugify(form.name);
    try {
      if (editing) {
        const { error } = await supabase.from('categories').update({ ...form, slug }).eq('id', editing.id);
        if (error) throw error;
        showToast('Category updated', 'success');
      } else {
        const { error } = await supabase.from('categories').insert({ ...form, slug });
        if (error) throw error;
        showToast('Category added', 'success');
      }
      setShowForm(false); load();
    } catch { showToast('Failed to save category', 'error'); }
  };

  const del = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from('categories').delete().eq('id', deleteTarget);
    if (error) showToast('Failed to delete category', 'error');
    else { showToast('Category deleted', 'success'); load(); }
    setDeleteTarget(null);
  };

  const inputClass = 'w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-white';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
        <button onClick={() => { setEditing(null); setForm({ name: '', slug: '', description: '', icon: '', display_order: 0 }); setShowForm(true); }} className="flex items-center gap-2 rounded-xl bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-20 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />)}</div>
      ) : categories.length === 0 ? (
        <EmptyState title="No categories yet" description="Add your first category." />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categories.map((c) => (
            <div key={c.id} className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 group">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-gray-900 dark:text-white text-sm">{c.name}</p>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditing(c); setForm({ name: c.name, slug: c.slug, description: c.description || '', icon: c.icon || '', display_order: c.display_order }); setShowForm(true); }} className="p-1 rounded text-gray-400 hover:text-blue-600"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setDeleteTarget(c.id)} className="p-1 rounded text-gray-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <p className="text-xs text-gray-400">{c.slug}</p>
            </div>
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Category' : 'Add Category'} size="sm">
        <div className="space-y-3">
          <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Name *</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: editing ? form.slug : slugify(e.target.value) })} className={inputClass} /></div>
          <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Slug</label><input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={inputClass} /></div>
          <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className={inputClass} /></div>
          <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Display Order</label><input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} className={inputClass} /></div>
          <div className="flex gap-2 pt-2">
            <button onClick={save} className="flex-1 rounded-xl bg-blue-600 text-white py-2 text-sm font-medium hover:bg-blue-700">Save</button>
            <button onClick={() => setShowForm(false)} className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-600 dark:text-gray-300">Cancel</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} title="Delete Category" message="Are you sure?" onConfirm={del} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
