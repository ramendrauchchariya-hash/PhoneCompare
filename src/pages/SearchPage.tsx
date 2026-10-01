import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Star, GitCompare } from 'lucide-react';
import type { Phone } from '@/types';
import { searchPhones, getLowestPriceForPhone } from '@/services/phoneService';
import { formatPrice } from '@/utils/format';
import { useCompare } from '@/contexts/CompareContext';
import EmptyState from '@/components/ui/EmptyState';
import { PhoneGridSkeleton } from '@/components/ui/Skeleton';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<Phone[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const data = await searchPhones(query, 50);
        setResults(data);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Search className="w-6 h-6" />
          Search Results
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {loading ? 'Searching...' : `${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"`}
        </p>
      </div>

      {loading ? (
        <PhoneGridSkeleton count={8} />
      ) : results.length === 0 ? (
        <EmptyState
          title={query ? `No results for "${query}"` : 'Start typing to search'}
          description={query ? 'Try different keywords like "iPhone", "Samsung", "5G", or "Snapdragon".' : 'Use the search bar above to find phones.'}
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {results.map((phone) => {
            const { price } = getLowestPriceForPhone(phone);
            const inCompare = isInCompare(phone.slug);
            return (
              <Link
                key={phone.id}
                to={`/phones/${phone.slug}`}
                className="group rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
                  {phone.images?.[0]?.image_url ? (
                    <img src={phone.images[0].image_url} alt={phone.name} loading="lazy" className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
                  ) : (
                    <Search className="w-12 h-12 text-gray-300" />
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{phone.brand?.name}</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">{phone.name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-300">{phone.rating.toFixed(1)}</span>
                  </div>
                  {price !== null && <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{formatPrice(price)}</p>}
                  <button
                    onClick={(e) => { e.preventDefault(); inCompare ? removeFromCompare(phone.slug) : addToCompare(phone.slug); }}
                    className={`mt-2 w-full flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition-colors ${
                      inCompare ? 'bg-blue-600 text-white' : 'border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    <GitCompare className="w-3 h-3" /> {inCompare ? 'Added' : 'Compare'}
                  </button>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
