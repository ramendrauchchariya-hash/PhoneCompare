import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Tag, Store, IndianRupee, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import supabase from '@/lib/supabase';
import { formatPrice, timeAgo } from '@/utils/format';

interface DashboardStats {
  totalPhones: number;
  publishedPhones: number;
  totalBrands: number;
  totalStores: number;
  priceRecords: number;
  recentlyUpdatedPrices: number;
}

interface RecentPhone {
  id: string;
  name: string;
  slug: string;
  status: string;
  created_at: string;
}

interface RecentPrice {
  id: string;
  price: number;
  last_checked_at: string;
  store: { name: string };
  variant: { phone: { name: string; slug: string } };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({ totalPhones: 0, publishedPhones: 0, totalBrands: 0, totalStores: 0, priceRecords: 0, recentlyUpdatedPrices: 0 });
  const [recentPhones, setRecentPhones] = useState<RecentPhone[]>([]);
  const [recentPrices, setRecentPrices] = useState<RecentPrice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [phonesRes, publishedRes, brandsRes, storesRes, pricesRes, recentPhonesRes, recentPricesRes] = await Promise.all([
          supabase.from('phones').select('id', { count: 'exact', head: true }),
          supabase.from('phones').select('id', { count: 'exact', head: true }).eq('status', 'published'),
          supabase.from('brands').select('id', { count: 'exact', head: true }),
          supabase.from('stores').select('id', { count: 'exact', head: true }),
          supabase.from('store_prices').select('id', { count: 'exact', head: true }),
          supabase.from('phones').select('id, name, slug, status, created_at').order('created_at', { ascending: false }).limit(5),
          supabase.from('store_prices').select('id, price, last_checked_at, store:stores(name), variant:phone_variants(phone:phones(name, slug))').order('updated_at', { ascending: false }).limit(5),
        ]);

        setStats({
          totalPhones: phonesRes.count ?? 0,
          publishedPhones: publishedRes.count ?? 0,
          totalBrands: brandsRes.count ?? 0,
          totalStores: storesRes.count ?? 0,
          priceRecords: pricesRes.count ?? 0,
          recentlyUpdatedPrices: 0,
        });
        setRecentPhones(recentPhonesRes.data ?? []);
        setRecentPrices(recentPricesRes.data as unknown as RecentPrice[] ?? []);
      } catch (err) {
        console.error('Dashboard load failed:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const statCards = [
    { label: 'Total Phones', value: stats.totalPhones, icon: Smartphone, to: '/admin/phones', color: 'blue' },
    { label: 'Published', value: stats.publishedPhones, icon: TrendingUp, to: '/admin/phones', color: 'green' },
    { label: 'Brands', value: stats.totalBrands, icon: Tag, to: '/admin/brands', color: 'amber' },
    { label: 'Stores', value: stats.totalStores, icon: Store, to: '/admin/stores', color: 'purple' },
    { label: 'Price Records', value: stats.priceRecords, icon: IndianRupee, to: '/admin/prices', color: 'blue' },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map((card) => (
          <Link key={card.label} to={card.to} className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hover:shadow-lg transition-all">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl mb-3 ${colorMap[card.color]}`}>
              <card.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? '—' : card.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent phones */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Recently Added Phones
          </h2>
          <div className="space-y-2">
            {recentPhones.map((phone) => (
              <Link key={phone.id} to={`/admin/phones/${phone.id}/edit`} className="flex items-center justify-between rounded-xl p-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{phone.name}</p>
                  <p className="text-xs text-gray-400">{timeAgo(phone.created_at)}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${phone.status === 'published' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                  {phone.status}
                </span>
              </Link>
            ))}
            {recentPhones.length === 0 && !loading && <p className="text-sm text-gray-400 text-center py-4">No phones yet</p>}
          </div>
        </div>

        {/* Recent price updates */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <IndianRupee className="w-4 h-4" /> Recently Updated Prices
          </h2>
          <div className="space-y-2">
            {recentPrices.map((price) => (
              <div key={price.id} className="flex items-center justify-between rounded-xl p-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{price.variant?.phone?.name}</p>
                  <p className="text-xs text-gray-400">{price.store?.name} • {timeAgo(price.last_checked_at)}</p>
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white flex-shrink-0 ml-2">{formatPrice(price.price)}</p>
              </div>
            ))}
            {recentPrices.length === 0 && !loading && <p className="text-sm text-gray-400 text-center py-4">No price updates yet</p>}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> Quick Actions
        </h2>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/phones/new" className="rounded-xl bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors">Add Phone</Link>
          <Link to="/admin/brands" className="rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Manage Brands</Link>
          <Link to="/admin/stores" className="rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Manage Stores</Link>
          <Link to="/admin/prices" className="rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Manage Prices</Link>
        </div>
      </div>
    </div>
  );
}
