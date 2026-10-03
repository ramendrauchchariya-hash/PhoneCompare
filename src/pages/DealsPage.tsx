import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Tag, ExternalLink, Zap, Smartphone } from 'lucide-react';
import type { Phone, Brand, Store } from '@/types';
import { fetchPhones, fetchBrands, fetchStores, mapPhoneForCard, getLowestVariantPrice } from '@/services/phoneService';
import { formatPrice } from '@/utils/format';
import Badge from '@/components/ui/Badge';
import { PhoneGridSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';

export default function DealsPage() {
  const [phones, setPhones] = useState<Phone[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<'price-low' | 'newest'>('price-low');
  const [brandFilter, setBrandFilter] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        const [b, s] = await Promise.all([fetchBrands(), fetchStores()]);
        setBrands(b);
        setStores(s);
        const { phones: data } = await fetchPhones({ limit: 100 });
        setPhones(data);
      } catch (err) {
        console.error('Failed to load deals:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const deals = useMemo(() => {
    let result = phones.map((phone) => {
      const card = mapPhoneForCard(phone);
      return { phone, ...card };
    }).filter((d) => d.lowestPrice !== null);

    if (brandFilter) {
      result = result.filter((d) => d.phone.brand_id === brandFilter);
    }

    if (sort === 'price-low') {
      result.sort((a, b) => (a.lowestPrice ?? 0) - (b.lowestPrice ?? 0));
    } else {
      result.sort((a, b) => new Date(b.phone.created_at).getTime() - new Date(a.phone.created_at).getTime());
    }

    return result;
  }, [phones, sort, brandFilter]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-2 mb-2">
        <Tag className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Today's Deals</h1>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Best prices across Indian online stores. Updated regularly.
      </p>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value)}
          className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="price-low">Lowest Price</option>
          <option value="newest">Newest</option>
        </select>
      </div>

      {loading ? (
        <PhoneGridSkeleton count={8} />
      ) : deals.length === 0 ? (
        <EmptyState title="No deals found" description="Check back later for new deals." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {deals.map((d) => (
            <Link
              key={d.phone.id}
              to={`/phones/${d.phone.slug}`}
              className="group rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden hover:shadow-lg transition-all"
            >
              <div className="flex gap-4 p-4">
                <div className="w-24 h-24 flex-shrink-0 rounded-xl bg-gray-50 dark:bg-gray-900 overflow-hidden flex items-center justify-center">
                  {d.imageUrl ? (
                    <img src={d.imageUrl} alt={d.phone.name} loading="lazy" className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
                  ) : (
                    <Smartphone className="w-10 h-10 text-gray-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{d.brandName}</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">{d.phone.name}</p>
                  <div className="mt-1">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{formatPrice(d.lowestPrice)}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
