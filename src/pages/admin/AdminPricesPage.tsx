import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import supabase from '@/lib/supabase';
import { useToast } from '@/contexts/ToastContext';
import { formatPrice, discountPercent, timeAgo } from '@/utils/format';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';

interface PriceRecord {
  id: string;
  price: number;
  mrp: number | null;
  availability: string;
  source: string;
  last_checked_at: string;
  store: { id: string; name: string } | null;
  variant: { id: string; ram: string | null; storage: string | null; phone: { id: string; name: string; slug: string } } | null;
}

export default function AdminPricesPage() {
  const { showToast } = useToast();
  const [prices, setPrices] = useState<PriceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PriceRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [phones, setPhones] = useState<{ id: string; name: string }[]>([]);
  const [stores, setStores] = useState<{ id: string; name: string }[]>([]);
  const [variants, setVariants] = useState<{ id: string; ram: string | null; storage: string | null; phone_id: string }[]>([]);
  const [form, setForm] = useState({ phone_id: '', variant_id: '', store_id: '', price: '', mrp: '', availability: 'In Stock', product_url: '', source: 'manual' });

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('store_prices').select('id, price, mrp, availability, source, last_checked_at, store:stores(id, name), variant:phone_variants(id, ram, storage, phone:phones(id, name, slug))').order('updated_at', { ascending: false });
    const { data } = await query;
    let filtered = (data ?? []) as unknown as PriceRecord[];
    if (search) {
      filtered = filtered.filter((p) => p.variant?.phone?.name?.toLowerCase().includes(search.toLowerCase()));
    }
    setPrices(filtered);
    setLoading(false);
  }, [search]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    (async () => {
      const [{ data: ph }, { data: st }] = await Promise.all([
        supabase.from('phones').select('id, name').order('name'),
        supabase.from('stores').select('id, name').order('name'),
      ]);
      setPhones(ph ?? []);
      setStores(st ?? []);
    })();
  }, []);

  useEffect(() => {
    if (form.phone_id) {
      supabase.from('phone_variants').select('id, ram, storage, phone_id').eq('phone_id', form.phone_id).then(({ data }) => setVariants(data ?? []));
    } else {
      setVariants([]);
    }
  }, [form.phone_id]);

  const openAdd = () => { setEditing(null); setForm({ phone_id: '', variant_id: '', store_id: '', price: '', mrp: '', availability: 'In Stock', product_url: '', source: 'manual' }); setShowForm(true); };

  const save = async () => {
    if (!form.variant_id || !form.store_id || !form.price) { showToast('Phone, store, and price are required', 'error'); return; }
    try {
      if (editing) {
        const { error } = await supabase.from('store_prices').update({
          price: Number(form.price), mrp: form.mrp ? Number(form.mrp) : null, availability: form.availability,
          product_url: form.product_url, source: form.source, last_checked_at: new Date().toISOString(),
        }).eq('id', editing.id);
        if (error) throw error;
        showToast('Price updated', 'success');
      } else {
        const { error } = await supabase.from('store_prices').insert({
          variant_id: form.variant_id, store_id: form.store_id, price: Number(form.price),
          mrp: form.mrp ? Number(form.mrp) : null, availability: form.availability,
          product_url: form.product_url, source: form.source, last_checked_at: new Date().toISOString(),
        });
        if (error) throw error;
        showToast('Price added', 'success');
      }
      setShowForm(false); load();
    } catch (err) {
      console.error(err);
      showToast('Failed to save price', 'error');
    }
  };

  const del = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from('store_prices').delete().eq('id', deleteTarget);
    if (error) showToast('Failed to delete price', 'error');
    else { showToast('Price deleted', 'success'); load(); }
    setDeleteTarget(null);
  };

  const inputClass = 'w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-white';

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Prices</h1>
        <button onClick={openAdd} className="flex items-center gap-2 rounded-xl bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" /> Add Price
        </button>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by phone name..." className={inputClass + ' pl-9'} />
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />)}</div>
      ) : prices.length === 0 ? (
        <EmptyState title="No prices yet" description="Add your first price record." action={<button onClick={openAdd} className="rounded-xl bg-blue-600 text-white px-4 py-2 text-sm">Add Price</button>} />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-700">
          <table className="w-full">
            <thead><tr className="bg-gray-50 dark:bg-gray-800 text-left text-xs text-gray-500 dark:text-gray-400">
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium hidden sm:table-cell">Variant</th>
              <th className="px-4 py-3 font-medium">Store</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">MRP</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">Updated</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {prices.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{p.variant?.phone?.name ?? '—'}</td>
                  <td className="px-4 py-3 hidden sm:table-cell text-sm text-gray-600 dark:text-gray-300">{p.variant?.ram} {p.variant?.storage}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{p.store?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-400 line-through">{p.mrp ? formatPrice(p.mrp) : '—'}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-400">{timeAgo(p.last_checked_at)}</td>
                  <td className="px-4 py-3"><div className="flex items-center justify-end gap-1">
                    <button onClick={() => { setEditing(p); setForm({ phone_id: p.variant?.phone?.id ?? '', variant_id: p.variant?.id ?? '', store_id: p.store?.id ?? '', price: String(p.price), mrp: p.mrp ? String(p.mrp) : '', availability: p.availability, product_url: '', source: p.source }); setShowForm(true); }} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteTarget(p.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="w-4 h-4" /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Price' : 'Add Price'}>
        <div className="space-y-3">
          <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Phone</label>
            <select value={form.phone_id} onChange={(e) => setForm({ ...form, phone_id: e.target.value, variant_id: '' })} className={inputClass} disabled={!!editing}>
              <option value="">Select phone</option>
              {phones.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Variant</label>
            <select value={form.variant_id} onChange={(e) => setForm({ ...form, variant_id: e.target.value })} className={inputClass} disabled={!!editing || !form.phone_id}>
              <option value="">Select variant</option>
              {variants.map((v) => <option key={v.id} value={v.id}>{v.ram} {v.storage}</option>)}
            </select>
          </div>
          <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Store</label>
            <select value={form.store_id} onChange={(e) => setForm({ ...form, store_id: e.target.value })} className={inputClass} disabled={!!editing}>
              <option value="">Select store</option>
              {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Price (₹) *</label><input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={inputClass} /></div>
            <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">MRP (₹)</label><input type="number" value={form.mrp} onChange={(e) => setForm({ ...form, mrp: e.target.value })} className={inputClass} /></div>
          </div>
          {form.price && form.mrp && <p className="text-xs text-gray-500">Discount: {discountPercent(Number(form.mrp), Number(form.price))}%</p>}
          <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Availability</label><select value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })} className={inputClass}><option>In Stock</option><option>Out of Stock</option></select></div>
          <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Product URL</label><input type="text" value={form.product_url} onChange={(e) => setForm({ ...form, product_url: e.target.value })} className={inputClass} placeholder="https://..." /></div>
          <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Source</label><select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className={inputClass}><option value="manual">Manual</option><option value="api">API</option><option value="affiliate_feed">Affiliate Feed</option><option value="import">Import</option></select></div>
          <div className="flex gap-2 pt-2">
            <button onClick={save} className="flex-1 rounded-xl bg-blue-600 text-white py-2 text-sm font-medium hover:bg-blue-700">Save</button>
            <button onClick={() => setShowForm(false)} className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-600 dark:text-gray-300">Cancel</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} title="Delete Price" message="Are you sure you want to delete this price record?" onConfirm={del} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
