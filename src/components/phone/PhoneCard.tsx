import { Link } from 'react-router-dom';
import { Star, Heart, GitCompare, Signal, Zap } from 'lucide-react';
import type { Phone } from '@/types';
import { useCompare } from '@/contexts/CompareContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { getLowestPriceForPhone, getStartingPrice } from '@/services/phoneService';
import { formatPrice, discountPercent } from '@/utils/format';
import Badge from '@/components/ui/Badge';

export default function PhoneCard({ phone }: { phone: Phone }) {
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const { toggleFavorite, isFavorite } = useFavorites();
  const inCompare = isInCompare(phone.slug);
  const isFav = isFavorite(phone.id);

  const { price: lowestPrice, storeName } = getLowestPriceForPhone(phone);
  const startingPrice = getStartingPrice(phone);
  const imageUrl = phone.images?.[0]?.image_url;
  const discount = lowestPrice && startingPrice ? discountPercent(startingPrice, lowestPrice) : 0;

  return (
    <div className="group relative rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 flex flex-col">
      {/* Top badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        {phone.has_5g && <Badge variant="info"><Signal className="w-3 h-3" /> 5G</Badge>}
        {discount > 0 && <Badge variant="error">-{discount}%</Badge>}
      </div>

      {/* Favorite button */}
      <button
        onClick={(e) => { e.preventDefault(); toggleFavorite(phone.id); }}
        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-400 hover:text-red-500 transition-colors"
        aria-label="Toggle favorite"
      >
        <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
      </button>

      <Link to={`/phones/${phone.slug}`} className="block">
        {/* Image */}
        <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={phone.name}
              loading="lazy"
              className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-20 h-32 rounded-xl bg-gray-200 dark:bg-gray-700" />
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{phone.brand?.name}</p>
        <Link to={`/phones/${phone.slug}`}>
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug mb-1 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {phone.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{phone.rating.toFixed(1)}</span>
          <span className="text-xs text-gray-400">({phone.review_count})</span>
        </div>

        {/* Price */}
        <div className="mb-2">
          {lowestPrice !== null ? (
            <>
              <p className="text-xs text-gray-400">From</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{formatPrice(lowestPrice)}</p>
              {storeName && (
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-green-500" />
                  Lowest at {storeName}
                </p>
              )}
            </>
          ) : startingPrice ? (
            <>
              <p className="text-xs text-gray-400">Starting from</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{formatPrice(startingPrice)}</p>
            </>
          ) : (
            <p className="text-sm text-gray-400">Price not available</p>
          )}
        </div>

        {/* Variant info */}
        {phone.variants && phone.variants.length > 0 && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            {phone.variants[0].ram} + {phone.variants[0].storage}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <button
            onClick={() => (inCompare ? removeFromCompare(phone.slug) : addToCompare(phone.slug))}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-medium transition-colors ${
              inCompare
                ? 'bg-blue-600 text-white'
                : 'border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            {inCompare ? 'Added' : 'Compare'}
          </button>
          <Link
            to={`/phones/${phone.slug}`}
            className="flex-1 flex items-center justify-center rounded-xl bg-gray-900 dark:bg-white dark:text-gray-900 text-white py-2 text-xs font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
