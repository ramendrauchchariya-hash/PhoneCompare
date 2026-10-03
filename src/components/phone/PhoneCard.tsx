import { Link } from 'react-router-dom';
import { Star, Heart, GitCompare, Signal, Smartphone, Monitor, Camera, Battery, MemoryStick } from 'lucide-react';
import type { Phone } from '@/types';
import { useCompare } from '@/contexts/CompareContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { mapPhoneForCard } from '@/services/phoneService';
import { formatPrice } from '@/utils/format';

function SpecChip({ icon: Icon, label }: { icon: typeof Monitor; label: string | null }) {
  if (!label) return null;
  return (
    <span className="pc-spec-chip">
      <Icon className="w-3 h-3 text-pc-500 dark:text-pc-400" />
      {label}
    </span>
  );
}

export default function PhoneCard({ phone }: { phone: Phone }) {
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const { toggleFavorite, isFavorite } = useFavorites();
  const inCompare = isInCompare(phone.slug);
  const isFav = isFavorite(phone.id);

  const card = mapPhoneForCard(phone);

  const ramStorage = phone.variants?.[0]
    ? `${phone.variants[0].ram ?? ''} / ${phone.variants[0].storage ?? ''}`
    : null;
  const displaySize = phone.display_size ?? null;
  const mainCamera = phone.main_camera ?? null;
  const battery = phone.battery_capacity ?? null;

  return (
    <div className="pc-card pc-card-hover group relative overflow-hidden flex flex-col">
      {/* Top badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        {card.has5G && <span className="pc-badge bg-pc-50 dark:bg-pc-900/30 text-pc-600 dark:text-pc-400"><Signal className="w-3 h-3" /> 5G</span>}
        {card.isFeatured && <span className="pc-badge bg-warning-50 dark:bg-warning-100/10 text-warning-600 dark:text-warning-500">Featured</span>}
      </div>

      {/* Favorite button */}
      <button
        onClick={(e) => { e.preventDefault(); toggleFavorite(phone.id); }}
        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 dark:bg-midnight-500/80 backdrop-blur-sm text-titanium-400 hover:text-danger-500 transition-colors"
        aria-label="Toggle favorite"
      >
        <Heart className={`w-4 h-4 ${isFav ? 'fill-danger-500 text-danger-500' : ''}`} />
      </button>

      <Link to={`/phones/${phone.slug}`} className="block">
        {/* Image */}
        <div className="aspect-square pc-image-area flex items-center justify-center p-6">
          {card.imageUrl ? (
            <img
              src={card.imageUrl}
              alt={phone.name}
              loading="lazy"
              className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <Smartphone className="w-16 h-16 text-titanium-300 dark:text-titanium-600" />
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-titanium-500 dark:text-titanium-400 mb-0.5">{card.brandName}</p>
        <Link to={`/phones/${phone.slug}`}>
          <h3 className="font-semibold text-titanium-900 dark:text-titanium-50 text-sm leading-snug mb-1 line-clamp-2 hover:text-pc-600 dark:hover:text-pc-400 transition-colors">
            {phone.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs font-medium text-titanium-700 dark:text-titanium-300">{card.rating.toFixed(1)}</span>
          <span className="text-xs text-titanium-400">({card.reviewCount})</span>
        </div>

        {/* Quick spec chips */}
        <div className="flex flex-wrap gap-1 mb-2">
          <SpecChip icon={MemoryStick} label={ramStorage} />
          <SpecChip icon={Monitor} label={displaySize} />
          <SpecChip icon={Camera} label={mainCamera} />
          <SpecChip icon={Battery} label={battery} />
        </div>

        {/* Price */}
        <div className="mb-2">
          {card.lowestPrice !== null ? (
            <>
              {card.hasMultipleVariants && <p className="text-xs text-titanium-400">From</p>}
              <p className="text-lg font-bold text-titanium-900 dark:text-titanium-50">{formatPrice(card.lowestPrice)}</p>
            </>
          ) : (
            <p className="text-sm text-titanium-400">Price not available</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <button
            onClick={() => (inCompare ? removeFromCompare(phone.slug) : addToCompare(phone.slug))}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-pc py-2 text-xs font-medium transition-colors ${
              inCompare
                ? 'bg-pc-600 text-white'
                : 'border border-titanium-200 dark:border-titanium-600 text-titanium-600 dark:text-titanium-300 hover:bg-titanium-50 dark:hover:bg-midnight-700'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            {inCompare ? 'Added' : 'Compare'}
          </button>
          <Link
            to={`/phones/${phone.slug}`}
            className="flex-1 flex items-center justify-center rounded-pc bg-titanium-900 dark:bg-titanium-50 dark:text-titanium-900 text-white py-2 text-xs font-medium hover:bg-titanium-800 dark:hover:bg-titanium-100 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
