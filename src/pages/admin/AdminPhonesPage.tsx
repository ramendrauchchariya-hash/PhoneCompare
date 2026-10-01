import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2, Eye, EyeOff, Copy } from 'lucide-react';
import supabase from '@/lib/supabase';
import { useToast } from '@/contexts/ToastContext';
import { timeAgo } from '@/utils/format';
import Badge from '@/components/ui/Badge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';

interface AdminPhone {
  id: string;
  name: string;
  slug: string;
  status: string;
  is_featured: boolean;
  is_trending: boolean;
  rating: number;
  created_at: string;
  brand: { name: string }[] | null;
}

export default function AdminPhonesPage() {
  const { showToast } = useToast();
  const [phones, setPhones] = useState<AdminPhone[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const loadPhones = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('phones').select('id, name, slug, status, is_featured, is_trending, rating, created_at, brand:brands(name)').order('created_at', { ascending: false });
    if (statusFilter) query = query.eq('status', statusFilter);
    if (search) query = query.ilike('name', `%${search}%`);
    const { data, error } = await query;
    if (error) {
      showToast('Failed to load phones', 'error');
    } else {
      setPhones(data ?? []);
    }
    setLoading(false);
  }, [search, statusFilter, showToast]);

  useEffect(() => { loadPhones(); }, [loadPhones]);

  const toggleStatus = async (id: string, current: string) => {
    const newStatus = current === 'published' ? 'unpublished' : 'published';
    const { error } = await supabase.from('phones').update({ status: newStatus }).eq('id', id);
    if (error) {
      showToast('Failed to update status', 'error');
    } else {
      showToast(`Phone ${newStatus === 'published' ? 'published' : 'unpublished'}`, 'success');
      loadPhones();
    }
  };

  const duplicatePhone = async (phone: AdminPhone) => {
    const { data } = await supabase.from('phones').select('*').eq('id', phone.id).single();
    if (!data) return;
    const { id, created_at, updated_at, slug, name, ...rest } = data;
    const newPhone = { ...rest, name: `${name} (Copy)`, slug: `${slug}-copy-${Date.now()}`, status: 'draft' };
    const { error } = await supabase.from('phones').insert(newPhone);
    if (error) {
      showToast('Failed to duplicate phone', 'error');
    } else {
      showToast('Phone duplicated successfully', 'success');
      loadPhones();
    }
  };

  const deletePhone = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from('phones').delete().eq('id', deleteTarget);
    if (error) {
      showToast('Failed to delete phone', 'error');
    } else {
      showToast('Phone deleted', 'success');
      loadPhones();
    }
    setDeleteTarget(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Phones</h1>
        <Link to="/admin/phones/new" className="flex items-center gap-2 rounded-xl bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" /> Add Phone
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search phones..."
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-white"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="unpublished">Unpublished</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />)}
        </div>
      ) : phones.length === 0 ? (
        <EmptyState title="No phones found" description="Add your first phone to get started." action={<Link to="/admin/phones/new" className="rounded-xl bg-blue-600 text-white px-4 py-2 text-sm font-medium">Add Phone</Link>} />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-700">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 text-left text-xs text-gray-500 dark:text-gray-400">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Brand</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Rating</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Added</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {phones.map((phone) => (
                <tr key={phone.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{phone.name}</p>
                    <div className="flex gap-1 mt-0.5">
                      {phone.is_featured && <Badge variant="info">Featured</Badge>}
                      {phone.is_trending && <Badge variant="accent">Trending</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-sm text-gray-600 dark:text-gray-300">{phone.brand?.[0]?.name}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${phone.status === 'published' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : phone.status === 'draft' ? 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                      {phone.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-600 dark:text-gray-300">{Number(phone.rating).toFixed(1)}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-400">{timeAgo(phone.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => toggleStatus(phone.id, phone.status)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20" title={phone.status === 'published' ? 'Unpublish' : 'Publish'}>
                        {phone.status === 'published' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button onClick={() => duplicatePhone(phone)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700" title="Duplicate">
                        <Copy className="w-4 h-4" />
                      </button>
                      <Link to={`/admin/phones/${phone.id}/edit`} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20" title="Edit">
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button onClick={() => setDeleteTarget(phone.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Phone"
        message="Are you sure you want to delete this phone? This will also delete all its variants, prices, and images. This action cannot be undone."
        onConfirm={deletePhone}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
