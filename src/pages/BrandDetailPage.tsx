import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Smartphone } from 'lucide-react';
import type { Brand, Phone } from '@/types';
import { fetchBrandBySlug, fetchPhones } from '@/services/phoneService';
import PhoneGrid from '@/components/phone/PhoneGrid';
import EmptyState from '@/components/ui/EmptyState';
import { PhoneGridSkeleton } from '@/components/ui/Skeleton';

export default function BrandDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [phones, setPhones] = useState<Phone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    (async () => {
      try {
        const b = await fetchBrandBySlug(slug);
        setBrand(b);
        if (b) {
          const { phones: data } = await fetchPhones({ brandId: b.id, limit: 50 });
          setPhones(data);
        }
      } catch (err) {
        console.error('Failed to load brand:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (!loading && !brand) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState title="Brand not found" description="This brand doesn't exist." action={<Link to="/brands" className="rounded-xl bg-blue-600 text-white px-4 py-2 text-sm">View all brands</Link>} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <nav className="flex items-center gap-2 text-xs text-gray-400 mb-4">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <ChevronLeft className="w-3 h-3 rotate-180" />
        <Link to="/brands" className="hover:text-blue-600">Brands</Link>
        <ChevronLeft className="w-3 h-3 rotate-180" />
        <span className="text-gray-600 dark:text-gray-300">{brand?.name}</span>
      </nav>

      <div className="flex items-center gap-4 mb-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
          <Smartphone className="w-8 h-8 text-gray-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{brand?.name}</h1>
          {brand?.country && <p className="text-sm text-gray-500 dark:text-gray-400">{brand.country}</p>}
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{phones.length} phone{phones.length !== 1 ? 's' : ''} available</p>
        </div>
      </div>

      {loading ? <PhoneGridSkeleton count={8} /> : phones.length === 0 ? (
        <EmptyState title="No phones yet" description={`No phones from ${brand?.name} are currently listed.`} />
      ) : (
        <PhoneGrid phones={phones} />
      )}
    </div>
  );
}
