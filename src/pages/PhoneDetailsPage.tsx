import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, GitCompare, ExternalLink, Heart, ChevronLeft, Zap, Clock, Check, MessageSquare } from 'lucide-react';
import type { Phone, Review, PriceHistory as PriceHistoryType } from '@/types';
import { fetchPhoneBySlug, fetchPhones, fetchReviews, fetchPriceHistory, getLowestPriceForPhone, getStartingPrice } from '@/services/phoneService';
import { formatPrice, timeAgo, discountPercent, getPriceFreshness, freshnessLabel, freshnessColor, minutesSince } from '@/utils/format';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import PriceComparison from '@/components/phone/PriceComparison';
import SpecificationTable from '@/components/phone/SpecificationTable';
import PriceHistoryChart from '@/components/phone/PriceHistoryChart';
import PhoneGrid from '@/components/phone/PhoneGrid';
import { useCompare } from '@/contexts/CompareContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useToast } from '@/contexts/ToastContext';
import EmptyState from '@/components/ui/EmptyState';
import { Radio } from 'lucide-react';

export default function PhoneDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { showToast } = useToast();

  const [phone, setPhone] = useState<Phone | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryType[]>([]);
  const [historyRange, setHistoryRange] = useState<'7d' | '30d' | '3m' | '6m' | '1y'>('30d');
  const [relatedPhones, setRelatedPhones] = useState<Phone[]>([]);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(false);
    setSelectedImageIdx(0);
    (async () => {
      try {
        const data = await fetchPhoneBySlug(slug);
        if (!data) {
          setError(true);
          return;
        }
        setPhone(data);
        if (data.variants && data.variants.length > 0) {
          setSelectedVariantId(data.variants[0].id);
        }
        // Load reviews, price history, related phones in parallel
        const [revs, hist] = await Promise.all([
          fetchReviews(data.id),
          fetchPriceHistory(data.variants?.[0]?.id ?? ''),
        ]);
        setReviews(revs);
        setPriceHistory(hist);

        // Related phones: same brand
        const { phones: related } = await fetchPhones({ brandId: data.brand_id, limit: 4 });
        setRelatedPhones(related.filter((p) => p.id !== data.id).slice(0, 4));
      } catch (err) {
        console.error('Failed to load phone:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  // Update price history when variant changes
  useEffect(() => {
    if (!selectedVariantId || !phone) return;
    fetchPriceHistory(selectedVariantId).then(setPriceHistory).catch(console.error);
  }, [selectedVariantId, phone]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          <div className="space-y-4">
            <div className="h-4 w-20 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
            <div className="h-8 w-3/4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
            <div className="h-6 w-1/2 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
            <div className="h-10 w-1/3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
            <div className="h-20 w-full bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !phone) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          title="Phone not found"
          description="The phone you're looking for doesn't exist or may have been removed."
          action={<Button to="/phones">Browse all phones</Button>}
        />
      </div>
    );
  }

  const { price: lowestPrice, storeName, storeSlug } = getLowestPriceForPhone(phone);
  const startingPrice = getStartingPrice(phone);
  const inCompare = isInCompare(phone.slug);
  const isFav = isFavorite(phone.id);
  const images = phone.images ?? [];
  const variants = phone.variants ?? [];
  const selectedVariant = variants.find((v) => v.id === selectedVariantId) ?? variants[0];
  const discount = lowestPrice && startingPrice ? discountPercent(startingPrice, lowestPrice) : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 md:py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-400 mb-4">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <ChevronLeft className="w-3 h-3 rotate-180" />
        <Link to="/phones" className="hover:text-blue-600">Smartphones</Link>
        <ChevronLeft className="w-3 h-3 rotate-180" />
        <Link to={`/brand/${phone.brand?.slug}`} className="hover:text-blue-600">{phone.brand?.name}</Link>
        <ChevronLeft className="w-3 h-3 rotate-180" />
        <span className="text-gray-600 dark:text-gray-300">{phone.name}</span>
      </nav>

      {/* Top section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8">
        {/* Image gallery */}
        <div>
          <div className="aspect-square rounded-2xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-8 overflow-hidden">
            {images[selectedImageIdx] ? (
              <img src={images[selectedImageIdx].image_url} alt={images[selectedImageIdx].alt_text || phone.name} className="w-full h-full object-contain" />
            ) : (
              <div className="w-20 h-32 rounded-xl bg-gray-200 dark:bg-gray-700" />
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImageIdx(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-xl border-2 overflow-hidden transition-colors ${
                    i === selectedImageIdx ? 'border-blue-500' : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <img src={img.image_url} alt={img.alt_text || ''} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link to={`/brand/${phone.brand?.slug}`} className="text-sm text-blue-600 hover:underline">{phone.brand?.name}</Link>
            {phone.has_5g && <Badge variant="info">5G</Badge>}
            {phone.is_featured && <Badge variant="accent">Featured</Badge>}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{phone.name}</h1>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{phone.rating.toFixed(1)}</span>
            </div>
            <span className="text-sm text-gray-400">{phone.review_count} reviews</span>
            {phone.release_date && <span className="text-sm text-gray-400">| Released {phone.release_date}</span>}
          </div>

          {/* Price */}
          <div className="rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 p-4 mb-4">
            <div className="flex items-end justify-between flex-wrap gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs text-green-700 dark:text-green-400 font-medium flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" /> Lowest Price
                  </p>
                  {selectedVariant?.store_prices && selectedVariant.store_prices.length > 0 && (() => {
                    const mostRecent = selectedVariant.store_prices!.reduce((latest, sp) =>
                      new Date(sp.last_checked_at) > new Date(latest) ? sp.last_checked_at : latest,
                      selectedVariant.store_prices![0].last_checked_at
                    );
                    const freshness = getPriceFreshness(mostRecent);
                    const mins = minutesSince(mostRecent);
                    return (
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${freshnessColor(freshness)}`}>
                        {freshness === 'live' && <Radio className="w-2.5 h-2.5 animate-pulse" />}
                        {freshnessLabel(freshness)} • {mins < 1 ? 'now' : `${mins}m ago`}
                      </span>
                    );
                  })()}
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{lowestPrice !== null ? formatPrice(lowestPrice) : 'N/A'}</p>
                {storeName && <p className="text-xs text-gray-500 dark:text-gray-400">at {storeName}</p>}
              </div>
              {startingPrice && lowestPrice && discount > 0 && (
                <div className="text-right">
                  <p className="text-xs text-gray-400">MRP {formatPrice(startingPrice)}</p>
                  <Badge variant="error">-{discount}%</Badge>
                </div>
              )}
            </div>
          </div>

          {/* Colors */}
          {phone.colors && phone.colors.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Colors</p>
              <div className="flex flex-wrap gap-2">
                {phone.colors.map((color) => (
                  <div key={color.id} className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-1.5">
                    {color.hex_code && (
                      <span className="w-4 h-4 rounded-full border border-gray-200 dark:border-gray-600" style={{ backgroundColor: color.hex_code }} />
                    )}
                    <span className="text-xs text-gray-600 dark:text-gray-300">{color.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Variants */}
          {variants.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Variant</p>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                      v.id === selectedVariantId
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {v.ram} + {v.storage}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={inCompare ? 'primary' : 'outline'}
              fullWidth
              onClick={() => {
                if (inCompare) {
                  removeFromCompare(phone.slug);
                  showToast('Removed from comparison', 'info');
                } else {
                  addToCompare(phone.slug);
                  showToast('Added to comparison', 'success');
                }
              }}
            >
              <GitCompare className="w-4 h-4" />
              {inCompare ? 'In Comparison' : 'Compare'}
            </Button>
            <Button
              variant="outline"
              onClick={() => { toggleFavorite(phone.id); showToast(isFav ? 'Removed from favorites' : 'Added to favorites', 'success'); }}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
          </div>

          {/* Best deal button */}
          {selectedVariant?.store_prices && selectedVariant.store_prices.length > 0 && (
            <a
              href={selectedVariant.store_prices.sort((a, b) => a.price - b.price)[0].product_url || selectedVariant.store_prices[0].store?.website || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-green-600 text-white py-3 font-medium hover:bg-green-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View Best Deal at {selectedVariant.store_prices.sort((a, b) => a.price - b.price)[0].store?.name}
            </a>
          )}
        </div>
      </div>

      {/* Price comparison */}
      <section className="mb-8">
        <PriceComparison phone={phone} variantId={selectedVariantId} />
      </section>

      {/* Price history */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Price History</h3>
        <div className="flex gap-2 mb-4">
          {(['7d', '30d', '3m', '6m', '1y'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setHistoryRange(r)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                historyRange === r
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {r === '7d' ? '7 days' : r === '30d' ? '30 days' : r === '3m' ? '3 months' : r === '6m' ? '6 months' : '1 year'}
            </button>
          ))}
        </div>
        <PriceHistoryChart data={priceHistory} range={historyRange} />
      </section>

      {/* Specifications */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Specifications</h3>
        <SpecificationTable phone={phone} />
      </section>

      {/* Description */}
      {phone.description && (
        <section className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">About {phone.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{phone.description}</p>
        </section>
      )}

      {/* Reviews */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          User Reviews ({reviews.length})
        </h3>
        {reviews.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No reviews yet. Be the first to review!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{review.author_name}</span>
                  <span className="text-xs text-gray-400">{timeAgo(review.created_at)}</span>
                </div>
                {review.title && <p className="font-medium text-gray-900 dark:text-white text-sm mb-1">{review.title}</p>}
                {review.body && <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{review.body}</p>}
                {(review.pros || review.cons) && (
                  <div className="flex flex-wrap gap-4 text-xs">
                    {review.pros && <span className="text-green-600 dark:text-green-400 flex items-center gap-1"><Check className="w-3 h-3" /> {review.pros}</span>}
                    {review.cons && <span className="text-red-500 flex items-center gap-1"><span className="w-3 h-3 inline-flex items-center justify-center text-xs">—</span> {review.cons}</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Related phones */}
      {relatedPhones.length > 0 && (
        <section className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Related Phones</h3>
          <PhoneGrid phones={relatedPhones} />
        </section>
      )}

      {/* Sticky mobile action bar */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 z-30 border-t border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg px-4 py-3 flex gap-2">
        <button
          onClick={() => {
            if (inCompare) { removeFromCompare(phone.slug); showToast('Removed from comparison', 'info'); }
            else { addToCompare(phone.slug); showToast('Added to comparison', 'success'); }
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-medium transition-colors ${
            inCompare ? 'bg-blue-600 text-white' : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
          }`}
        >
          <GitCompare className="w-4 h-4" />
          {inCompare ? 'Added' : 'Compare'}
        </button>
        {selectedVariant?.store_prices && selectedVariant.store_prices.length > 0 && (
          <a
            href={selectedVariant.store_prices.sort((a, b) => a.price - b.price)[0].product_url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-green-600 text-white py-2.5 text-sm font-medium"
          >
            <Zap className="w-4 h-4" />
            Best Deal
          </a>
        )}
      </div>
    </div>
  );
}
