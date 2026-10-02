import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Smartphone } from 'lucide-react';
import type { Brand } from '@/types';
import { fetchBrands } from '@/services/phoneService';

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBrands().then(setBrands).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">All Brands</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Browse smartphones by your favorite brands.</p>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              to={`/brand/${brand.slug}`}
              className="group flex flex-col items-center justify-center rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 transition-all"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 group-hover:from-blue-50 group-hover:to-blue-100 dark:group-hover:from-blue-900/30 dark:group-hover:to-blue-800/30 transition-colors mb-3">
                <Smartphone className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{brand.name}</span>
              {brand.country && <span className="text-xs text-gray-400 mt-0.5">{brand.country}</span>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
