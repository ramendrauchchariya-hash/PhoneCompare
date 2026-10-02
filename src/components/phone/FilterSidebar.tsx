import { SlidersHorizontal, X, Star } from 'lucide-react';
import type { Brand } from '@/types';

export interface FilterState {
  brandIds: string[];
  minPrice: number | null;
  maxPrice: number | null;
  has5g: boolean;
  hasNfc: boolean;
  wirelessCharging: boolean;
  minRating: number;
  processor: string;
  chipsetBrand: string;
  minBattery: number | null;
  minDisplaySize: number | null;
  refreshRate: string;
  os: string;
  releaseYear: string;
}

export const defaultFilters: FilterState = {
  brandIds: [],
  minPrice: null,
  maxPrice: null,
  has5g: false,
  hasNfc: false,
  wirelessCharging: false,
  minRating: 0,
  processor: '',
  chipsetBrand: '',
  minBattery: null,
  minDisplaySize: null,
  refreshRate: '',
  os: '',
  releaseYear: '',
};

interface FilterPanelProps {
  brands: Brand[];
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onClear: () => void;
}

const priceRanges = [
  { label: 'Under ₹15,000', min: 0, max: 15000 },
  { label: '₹15,000 - ₹25,000', min: 15000, max: 25000 },
  { label: '₹25,000 - ₹40,000', min: 25000, max: 40000 },
  { label: '₹40,000 - ₹60,000', min: 40000, max: 60000 },
  { label: '₹60,000 - ₹1,00,000', min: 60000, max: 100000 },
  { label: '₹1,00,000+', min: 100000, max: null as number | null },
];

const refreshRates = ['60Hz', '90Hz', '120Hz', '144Hz'];
const osOptions = ['Android', 'iOS'];
const chipsetBrands = ['Qualcomm', 'MediaTek', 'Samsung', 'Apple', 'Google'];

function FilterPanel({ brands, filters, onChange, onClear }: FilterPanelProps) {
  const toggleBrand = (id: string) => {
    const brandIds = filters.brandIds.includes(id)
      ? filters.brandIds.filter((b) => b !== id)
      : [...filters.brandIds, id];
    onChange({ ...filters, brandIds });
  };

  const setPriceRange = (min: number, max: number | null) => {
    onChange({ ...filters, minPrice: min, maxPrice: max });
  };

  const activeCount = [
    filters.brandIds.length > 0,
    filters.minPrice !== null,
    filters.has5g,
    filters.hasNfc,
    filters.wirelessCharging,
    filters.minRating > 0,
    filters.processor !== '',
    filters.chipsetBrand !== '',
    filters.minBattery !== null,
    filters.refreshRate !== '',
    filters.os !== '',
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeCount > 0 && (
            <span className="text-xs font-normal text-blue-600">{activeCount} active</span>
          )}
        </h3>
        {activeCount > 0 && (
          <button onClick={onClear} className="text-xs text-blue-600 hover:underline">
            Clear all
          </button>
        )}
      </div>

      {/* Brand */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Brand</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
          {brands.map((brand) => (
            <label key={brand.id} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.brandIds.includes(brand.id)}
                onChange={() => toggleBrand(brand.id)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                {brand.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Price Range</h4>
        <div className="space-y-2">
          {priceRanges.map((range) => {
            const isActive = filters.minPrice === range.min && filters.maxPrice === range.max;
            return (
              <button
                key={range.label}
                onClick={() => isActive ? onChange({ ...filters, minPrice: null, maxPrice: null }) : setPriceRange(range.min, range.max)}
                className={`block w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {range.label}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice ?? ''}
            onChange={(e) => onChange({ ...filters, minPrice: e.target.value ? Number(e.target.value) : null })}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice ?? ''}
            onChange={(e) => onChange({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : null })}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Quick filters */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Features</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={filters.has5g} onChange={(e) => onChange({ ...filters, has5g: e.target.checked })} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">5G Support</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={filters.hasNfc} onChange={(e) => onChange({ ...filters, hasNfc: e.target.checked })} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">NFC</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={filters.wirelessCharging} onChange={(e) => onChange({ ...filters, wirelessCharging: e.target.checked })} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Wireless Charging</span>
          </label>
        </div>
      </div>

      {/* Rating */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Min Rating</h4>
        <div className="flex gap-1">
          {[0, 3, 4, 4.5].map((r) => (
            <button
              key={r}
              onClick={() => onChange({ ...filters, minRating: r })}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filters.minRating === r
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {r > 0 && <Star className="w-3 h-3 fill-amber-400 text-amber-400" />}
              {r === 0 ? 'All' : `${r}+`}
            </button>
          ))}
        </div>
      </div>

      {/* Chipset Brand */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Chipset Brand</h4>
        <div className="flex flex-wrap gap-2">
          {chipsetBrands.map((c) => (
            <button
              key={c}
              onClick={() => onChange({ ...filters, chipsetBrand: filters.chipsetBrand === c ? '' : c })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filters.chipsetBrand === c
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Refresh Rate */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Refresh Rate</h4>
        <div className="flex flex-wrap gap-2">
          {refreshRates.map((r) => (
            <button
              key={r}
              onClick={() => onChange({ ...filters, refreshRate: filters.refreshRate === r ? '' : r })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filters.refreshRate === r
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* OS */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Operating System</h4>
        <div className="flex flex-wrap gap-2">
          {osOptions.map((o) => (
            <button
              key={o}
              onClick={() => onChange({ ...filters, os: filters.os === o ? '' : o })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filters.os === o
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {o}
            </button>
          ))}
        </div>
      </div>

      {/* Battery */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Min Battery (mAh)</h4>
        <div className="flex flex-wrap gap-2">
          {[4000, 5000, 6000].map((b) => (
            <button
              key={b}
              onClick={() => onChange({ ...filters, minBattery: filters.minBattery === b ? null : b })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filters.minBattery === b
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {b}+
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FilterSidebar(props: FilterPanelProps) {
  return (
    <aside className="hidden lg:block w-64 flex-shrink-0">
      <div className="sticky top-20 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
        <FilterPanel {...props} />
      </div>
    </aside>
  );
}

export function FilterDrawer({ open, onClose, ...props }: FilterPanelProps & { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="lg:hidden fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white dark:bg-gray-900 p-5 animate-slide-up">
        <div className="flex items-center justify-between mb-4 sticky top-0 bg-white dark:bg-gray-900 pb-2">
          <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>
        <FilterPanel {...props} />
        <button
          onClick={onClose}
          className="w-full mt-6 rounded-xl bg-blue-600 text-white py-3 font-medium"
        >
          Show Results
        </button>
      </div>
    </div>
  );
}
