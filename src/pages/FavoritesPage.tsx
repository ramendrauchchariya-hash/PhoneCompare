import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import type { Phone } from '@/types';
import supabase from '@/lib/supabase';
import { useFavorites } from '@/contexts/FavoritesContext';
import EmptyState from '@/components/ui/EmptyState';
import PhoneGrid from '@/components/phone/PhoneGrid';
import { PhoneGridSkeleton } from '@/components/ui/Skeleton';

const FAVORITES_SELECT = '*, brand:brands(*), images:phone_images(image_url, alt_text, display_order), variants:phone_variants(id, ram, storage, color, price, availability)';

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
          .select(FAVORITES_SELECT)
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
        <PhoneGridSkeleton count={4} />
      ) : (
        <PhoneGrid phones={phones} />
      )}
    </div>
  );
}
