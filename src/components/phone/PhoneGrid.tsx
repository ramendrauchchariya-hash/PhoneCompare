import type { Phone } from '@/types';
import PhoneCard from './PhoneCard';
import { PhoneGridSkeleton } from '@/components/ui/Skeleton';

interface PhoneGridProps {
  phones: Phone[];
  loading?: boolean;
  loadingCount?: number;
}

export default function PhoneGrid({ phones, loading, loadingCount = 8 }: PhoneGridProps) {
  if (loading) {
    return <PhoneGridSkeleton count={loadingCount} />;
  }

  if (phones.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {phones.map((phone) => (
        <PhoneCard key={phone.id} phone={phone} />
      ))}
    </div>
  );
}
