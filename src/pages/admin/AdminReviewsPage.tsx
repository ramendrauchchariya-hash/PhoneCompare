import { useEffect, useState, useCallback } from 'react';
import { Check, X, Star } from 'lucide-react';
import supabase from '@/lib/supabase';
import { useToast } from '@/contexts/ToastContext';
import { timeAgo } from '@/utils/format';
import EmptyState from '@/components/ui/EmptyState';

interface ReviewRecord {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  pros: string | null;
  cons: string | null;
  is_approved: boolean;
  author_name: string | null;
  created_at: string;
  phone: { name: string; slug: string } | null;
}

export default function AdminReviewsPage() {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('reviews').select('id, rating, title, body, pros, cons, is_approved, author_name, created_at, phone:phones(name, slug)').order('created_at', { ascending: false });
    if (filter === 'pending') query = query.eq('is_approved', false);
    if (filter === 'approved') query = query.eq('is_approved', true);
    const { data } = await query;
    setReviews((data ?? []) as unknown as ReviewRecord[]);
    setLoading(false);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const toggleApprove = async (id: string, current: boolean) => {
    const { error } = await supabase.from('reviews').update({ is_approved: !current }).eq('id', id);
    if (error) showToast('Failed to update review', 'error');
    else { showToast(current ? 'Review unapproved' : 'Review approved', 'success'); load(); }
  };

  const del = async (id: string) => {
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) showToast('Failed to delete review', 'error');
    else { showToast('Review deleted', 'success'); load(); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Reviews</h1>

      <div className="flex gap-2 mb-4">
        {(['all', 'pending', 'approved'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}>{f}</button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />)}</div>
      ) : reviews.length === 0 ? (
        <EmptyState title="No reviews" description="No reviews match this filter." />
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex items-center gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />)}</div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{r.author_name}</span>
                    <span className="text-xs text-gray-400">{timeAgo(r.created_at)}</span>
                    {r.is_approved ? <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Approved</span> : <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Pending</span>}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{r.phone?.name}</p>
                  {r.title && <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{r.title}</p>}
                  {r.body && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{r.body}</p>}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => toggleApprove(r.id, r.is_approved)} className={`p-2 rounded-lg ${r.is_approved ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20' : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'}`} title={r.is_approved ? 'Unapprove' : 'Approve'}>
                    {r.is_approved ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                  </button>
                  <button onClick={() => del(r.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" title="Delete"><X className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
