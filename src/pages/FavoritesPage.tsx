import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import type { Phone } from '@/types';
import supabase from '@/lib/supabase';
import { getLowestPriceForPhone } from '@/services/phoneService';
import { formatPrice } from '@/utils/format';
import { useFavorites } from '@/contexts/FavoritesContext';
import EmptyState from '@/components/ui/EmptyState';

export default function FavoritesPage() {
  const { favorites } = useFavorites();
  const [phones, setPhones] = useState<Phone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (favorites.length === 0) {
        setPhones([]);
        setLoading(false);
        return;
      }
      try {
        const { data } = await supabase
          .from('phones')
          .select('*, brand:brands(*)')
          .in('id', favorites)
          .eq('status', 'published');
        setPhones(data ?? []);
      } catch (err) {
        console.error('Failed to load favorites:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [favorites]);

  if (!loading && favorites.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          icon={<Heart className="w-16 h-16" />}
          title="No favorites yet"
          description="Tap the heart icon on any phone to save it here for quick access."
          action={<Link to="/phones" className="rounded-xl bg-blue-600 text-white px-4 py-2.5 text-sm font-medium">Browse phones</Link>}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
        <Heart className="w-6 h-6 text-red-500" />
        Your Favorites
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{phones.length} saved phone{phones.length !== 1 ? 's' : ''}</p>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {phones.map((phone) => {
            const { price } = getLowestPriceForPhone(phone);
            return (
              <Link key={phone.id} to={`/phones/${phone.slug}`} className="group rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden hover:shadow-lg transition-all">
                <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
                  {phone.images?.[0]?.image_url ? (
                    <img src={phone.images[0].image_url} alt={phone.name} loading="lazy" className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
                  ) : null}
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{phone.brand?.name}</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">{phone.name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-300">{Number(phone.rating).toFixed(1)}</span>
                  </div>
                  {price !== null && <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{formatPrice(price)}</p>}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
