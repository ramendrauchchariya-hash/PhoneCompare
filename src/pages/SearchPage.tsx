import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import type { Phone } from '@/types';
import { searchPhones } from '@/services/phoneService';
import EmptyState from '@/components/ui/EmptyState';
import { PhoneGridSkeleton } from '@/components/ui/Skeleton';
import PhoneGrid from '@/components/phone/PhoneGrid';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<Phone[]>([]);
  const [loading, setLoading] = useState(true);

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
        <PhoneGrid phones={results} />
      )}
    </div>
  );
}
