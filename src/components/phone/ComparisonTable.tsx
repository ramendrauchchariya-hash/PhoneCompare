import { Link } from 'react-router-dom';
import { X, Plus, Star, Check, Minus, Share2 } from 'lucide-react';
import type { Phone } from '@/types';
import { getLowestPriceForPhone, getStartingPrice } from '@/services/phoneService';
import { formatPrice } from '@/utils/format';

interface ComparisonTableProps {
  phones: Phone[];
  onRemove: (slug: string) => void;
  onAdd: () => void;
}

export default function ComparisonTable({ phones, onRemove, onAdd }: ComparisonTableProps) {
  const specRows: { label: string; get: (p: Phone) => string | null | undefined; highlight?: boolean }[] = [
    { label: 'Lowest Price', get: (p) => { const lp = getLowestPriceForPhone(p); return lp.price !== null ? formatPrice(lp.price) : 'N/A'; }, highlight: true },
    { label: 'Starting Price', get: (p) => { const sp = getStartingPrice(p); return sp !== null ? formatPrice(sp) : 'N/A'; } },
    { label: 'Rating', get: (p) => `${Number(p.rating).toFixed(1)} (${p.review_count} reviews)`, highlight: true },
    { label: 'Display', get: (p) => [p.display_size, p.display_type].filter(Boolean).join(', ') },
    { label: 'Resolution', get: (p) => p.resolution },
    { label: 'Refresh Rate', get: (p) => p.refresh_rate },
    { label: 'Processor', get: (p) => p.processor },
    { label: 'Chipset', get: (p) => p.chipset_brand },
    { label: 'RAM', get: (p) => p.ram_options?.replace(/[\[\]"]/g, '').replace(/,/g, ', ') },
    { label: 'Storage', get: (p) => p.storage_options?.replace(/[\[\]"]/g, '').replace(/,/g, ', ') },
    { label: 'Battery', get: (p) => p.battery_capacity },
    { label: 'Charging', get: (p) => p.charging_speed },
    { label: 'Main Camera', get: (p) => p.main_camera },
    { label: 'Front Camera', get: (p) => p.front_camera },
    { label: '5G', get: (p) => (p.has_5g ? 'Yes' : 'No'), highlight: true },
    { label: 'NFC', get: (p) => (p.has_nfc ? 'Yes' : 'No') },
    { label: 'Wireless Charging', get: (p) => p.wireless_charging },
    { label: 'Weight', get: (p) => p.weight },
    { label: 'OS', get: (p) => p.os },
    { label: 'Water Resistance', get: (p) => p.water_resistance },
    { label: 'Dimensions', get: (p) => p.dimensions },
    { label: 'Release Date', get: (p) => p.release_date },
  ];

  const handleShare = () => {
    const slugs = phones.map((p) => p.slug).join('-vs-');
    const url = `${window.location.origin}/compare/${slugs}`;
    navigator.clipboard?.writeText(url);
  };

  return (
    <div>
      {/* Action bar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Comparing {phones.length} of 4 phones
        </p>
        <div className="flex gap-2">
          {phones.length > 1 && (
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Share2 className="w-4 h-4" /> Share
            </button>
          )}
          {phones.length < 4 && (
            <button
              onClick={onAdd}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 text-white px-3 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Phone
            </button>
          )}
        </div>
      </div>

      {/* Comparison table */}
      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-white dark:bg-gray-900 w-32 min-w-32 p-3 text-left text-xs font-medium text-gray-400">
                Specification
              </th>
              {phones.map((phone) => (
                <th key={phone.id} className="p-3 align-top min-w-48">
                  <div className="relative">
                    <button
                      onClick={() => onRemove(phone.slug)}
                      className="absolute -top-1 -right-1 p-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Remove phone"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <Link to={`/phones/${phone.slug}`} className="block">
                      <div className="aspect-square bg-gray-50 dark:bg-gray-800 rounded-xl mb-2 overflow-hidden">
                        {phone.images?.[0]?.image_url ? (
                          <img src={phone.images[0].image_url} alt={phone.name} className="w-full h-full object-contain p-2" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Plus className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{phone.brand?.name}</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">{phone.name}</p>
                    </Link>
                  </div>
                </th>
              ))}
              {phones.length < 4 && (
                <th className="p-3 align-top min-w-48">
                  <button
                    onClick={onAdd}
                    className="w-full aspect-square rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
                  >
                    <Plus className="w-8 h-8" />
                  </button>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {specRows.map((row, ri) => (
              <tr key={row.label} className={ri % 2 === 0 ? 'bg-gray-50/50 dark:bg-gray-800/30' : ''}>
                <td className="sticky left-0 z-10 bg-inherit p-3 text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {row.label}
                </td>
                {phones.map((phone) => {
                  const value = row.get(phone);
                  const isYes = value === 'Yes';
                  const isNo = value === 'No';
                  return (
                    <td key={phone.id} className={`p-3 text-sm ${row.highlight ? 'font-semibold' : ''} text-gray-900 dark:text-white`}>
                      {isYes ? (
                        <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                          <Check className="w-4 h-4" /> Yes
                        </span>
                      ) : isNo ? (
                        <span className="inline-flex items-center gap-1 text-gray-400">
                          <Minus className="w-4 h-4" /> No
                        </span>
                      ) : (
                        value || '—'
                      )}
                    </td>
                  );
                })}
                {phones.length < 4 && <td className="p-3" />}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
