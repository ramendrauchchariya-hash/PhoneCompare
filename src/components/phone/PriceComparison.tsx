import { useEffect, useState } from 'react';
import { Check, X, ExternalLink, Zap, Clock, RefreshCw, Radio } from 'lucide-react';
import type { Phone, StorePrice } from '@/types';
import { formatPrice, timeAgo, discountPercent, getPriceFreshness, freshnessLabel, freshnessColor, minutesSince } from '@/utils/format';
import Badge from '@/components/ui/Badge';

interface PriceComparisonProps {
  phone: Phone;
  variantId: string | null;
}

export default function PriceComparison({ phone, variantId }: PriceComparisonProps) {
  const variant = phone.variants?.find((v) => v.id === variantId) ?? phone.variants?.[0];
  const [refreshKey, setRefreshKey] = useState(0);

  // Auto-refresh freshness indicators every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => setRefreshKey((k) => k + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  if (!variant) {
    return (
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">No price data available for this phone.</p>
      </div>
    );
  }

  const prices = variant.store_prices ?? [];
  if (prices.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">No store prices available for this variant.</p>
      </div>
    );
  }

  // Use refreshKey to force re-render of freshness indicators
  void refreshKey;

  const sorted = [...prices].sort((a, b) => a.price - b.price);
  const lowest = sorted[0];
  const highest = sorted[sorted.length - 1];
  const priceDiff = highest.price - lowest.price;

  // Determine overall freshness
  const mostRecentCheck = sorted.reduce((latest, sp) => {
    return new Date(sp.last_checked_at) > new Date(latest) ? sp.last_checked_at : latest;
  }, sorted[0].last_checked_at);
  const overallFreshness = getPriceFreshness(mostRecentCheck);
  const overallMins = minutesSince(mostRecentCheck);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Compare Prices</h3>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${freshnessColor(overallFreshness)}`}>
            {overallFreshness === 'live' ? <Radio className="w-3 h-3 animate-pulse" /> : <Clock className="w-3 h-3" />}
            {freshnessLabel(overallFreshness)}
          </span>
          <span className="text-xs text-gray-400">
            Updated {overallMins < 1 ? 'just now' : `${overallMins} min ago`}
          </span>
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="p-1 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            title="Refresh prices"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Lowest price highlight */}
      <div className="mb-4 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 p-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="text-xs text-green-700 dark:text-green-400 font-medium flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" /> Lowest Price
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatPrice(lowest.price)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">at {lowest.store?.name}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            {priceDiff > 0 && (
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400">Save up to</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">{formatPrice(priceDiff)}</p>
              </div>
            )}
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${freshnessColor(getPriceFreshness(lowest.last_checked_at))}`}>
              {getPriceFreshness(lowest.last_checked_at) === 'live' && <Radio className="w-2.5 h-2.5 animate-pulse" />}
              {freshnessLabel(getPriceFreshness(lowest.last_checked_at))}
            </span>
          </div>
        </div>
      </div>

      {/* Price table */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-700">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800 text-left text-xs text-gray-500 dark:text-gray-400">
              <th className="px-4 py-3 font-medium">Store</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium hidden sm:table-cell">Availability</th>
              <th className="px-4 py-3 font-medium hidden sm:table-cell">Freshness</th>
              <th className="px-4 py-3 font-medium text-right">Deal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {sorted.map((sp: StorePrice) => {
              const isLowest = sp.id === lowest.id;
              const discount = discountPercent(sp.mrp, sp.price);
              const freshness = getPriceFreshness(sp.last_checked_at);
              const mins = minutesSince(sp.last_checked_at);
              return (
                <tr key={sp.id} className={isLowest ? 'bg-green-50/50 dark:bg-green-900/10' : ''}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{sp.store?.name}</span>
                      {isLowest && <Badge variant="success">Best</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <span className={`text-sm font-bold ${isLowest ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                        {formatPrice(sp.price)}
                      </span>
                      {sp.mrp && sp.mrp > sp.price && (
                        <span className="block text-xs text-gray-400 line-through">{formatPrice(sp.mrp)}</span>
                      )}
                    </div>
                    {discount > 0 && <Badge variant="error" className="mt-1">-{discount}%</Badge>}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {sp.availability === 'In Stock' ? (
                      <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                        <Check className="w-3.5 h-3.5" /> In Stock
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-red-500">
                        <X className="w-3.5 h-3.5" /> {sp.availability}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div className="flex flex-col gap-0.5">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium w-fit ${freshnessColor(freshness)}`}>
                        {freshness === 'live' && <Radio className="w-2.5 h-2.5 animate-pulse" />}
                        {freshnessLabel(freshness)}
                      </span>
                      <span className="text-xs text-gray-400">{mins < 1 ? 'just now' : `${mins} min ago`}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <a
                      href={sp.product_url || sp.affiliate_url || sp.store?.website || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg bg-blue-600 text-white px-3 py-1.5 text-xs font-medium hover:bg-blue-700 transition-colors"
                    >
                      View Deal <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
        Prices are checked periodically and freshness is shown based on the last update time. Prices shown are for informational purposes — please verify the final price on the retailer's website.
      </p>
    </div>
  );
}
