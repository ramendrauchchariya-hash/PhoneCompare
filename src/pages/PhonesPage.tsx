import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import type { Brand, Phone } from '@/types';
import { fetchBrands, fetchPhones, getLowestVariantPrice } from '@/services/phoneService';
import { FilterSidebar, FilterDrawer, defaultFilters, type FilterState } from '@/components/phone/FilterSidebar';
import PhoneGrid from '@/components/phone/PhoneGrid';
import Pagination from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';
import { PhoneGridSkeleton } from '@/components/ui/Skeleton';

const PER_PAGE = 12;

type SortOption = 'relevance' | 'price-low' | 'price-high' | 'newest' | 'popular' | 'rating' | 'discount';

export default function PhonesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [phones, setPhones] = useState<Phone[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortOption>('relevance');
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [filterOpen, setFilterOpen] = useState(false);

  const categorySlug = searchParams.get('category') || undefined;

  useEffect(() => {
    fetchBrands().then(setBrands).catch(console.error);
  }, []);

  const loadPhones = useCallback(async () => {
    setLoading(true);
    try {
      const opts: Parameters<typeof fetchPhones>[0] = {
        limit: PER_PAGE,
        offset: (page - 1) * PER_PAGE,
        categorySlug,
      };

      switch (sort) {
        case 'newest': opts.orderBy = 'created_at'; opts.ascending = false; break;
        case 'popular': opts.orderBy = 'review_count'; opts.ascending = false; break;
        case 'rating': opts.orderBy = 'rating'; opts.ascending = false; break;
        default: opts.orderBy = 'created_at'; opts.ascending = false;
      }

      if (filters.brandIds.length === 1) opts.brandId = filters.brandIds[0];
      if (filters.has5g) opts.has5g = true;
      if (filters.minRating) opts.minRating = filters.minRating;

      const { phones: data, total: count } = await fetchPhones(opts);

      let filtered = data;

      // Client-side filters for fields not directly queryable
      if (filters.brandIds.length > 1) {
        filtered = filtered.filter((p) => filters.brandIds.includes(p.brand_id));
      }

      // Price filter: use lowest variant price (numeric comparison)
      if (filters.minPrice !== null || filters.maxPrice !== null) {
        filtered = filtered.filter((p) => {
          const lowest = getLowestVariantPrice(p);
          if (lowest === null) return false;
          if (filters.minPrice !== null && lowest < filters.minPrice) return false;
          if (filters.maxPrice !== null && lowest > filters.maxPrice) return false;
          return true;
        });
      }

      if (filters.hasNfc) filtered = filtered.filter((p) => p.has_nfc);
      if (filters.wirelessCharging) filtered = filtered.filter((p) => p.wireless_charging === 'Yes');
      if (filters.chipsetBrand) filtered = filtered.filter((p) => p.chipset_brand === filters.chipsetBrand);
      if (filters.refreshRate) filtered = filtered.filter((p) => p.refresh_rate?.includes(filters.refreshRate));
      if (filters.os) filtered = filtered.filter((p) => p.os?.toLowerCase().includes(filters.os.toLowerCase()));
      if (filters.minBattery) {
        filtered = filtered.filter((p) => {
          const m = p.battery_capacity?.match(/(\d+)/);
          return m && parseInt(m[1]) >= filters.minBattery!;
        });
      }

      // Price sort: sort by lowest variant price
      if (sort === 'price-low' || sort === 'price-high') {
        filtered.sort((a, b) => {
          const aPrice = getLowestVariantPrice(a);
          const bPrice = getLowestVariantPrice(b);
          if (aPrice === null && bPrice === null) return 0;
          if (aPrice === null) return 1;
          if (bPrice === null) return -1;
          return sort === 'price-low' ? aPrice - bPrice : bPrice - aPrice;
        });
      }

      setPhones(filtered);
      setTotal(count ?? 0);
    } catch (err) {
      console.error('Failed to load phones:', err);
    } finally {
      setLoading(false);
    }
  }, [page, sort, filters, categorySlug]);

  useEffect(() => {
    loadPhones();
  }, [loadPhones]);

  const totalPages = Math.ceil(total / PER_PAGE);
  const activeFilterCount = [
    filters.brandIds.length > 0,
    filters.minPrice !== null,
    filters.has5g,
    filters.hasNfc,
    filters.wirelessCharging,
    filters.minRating > 0,
    filters.chipsetBrand !== '',
    filters.refreshRate !== '',
    filters.os !== '',
    filters.minBattery !== null,
    categorySlug,
  ].filter(Boolean).length;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Smartphones</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {loading ? 'Loading...' : `${total} phone${total !== 1 ? 's' : ''} found`}
          {categorySlug && ` in ${categorySlug.replace(/-/g, ' ')}`}
        </p>
      </div>

      <div className="flex gap-6">
        <FilterSidebar brands={brands} filters={filters} onChange={setFilters} onClear={() => setFilters(defaultFilters)} />

        <div className="flex-1 min-w-0">
          {/* Sort bar */}
          <div className="flex items-center justify-between mb-4 gap-2">
            <button
              onClick={() => setFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm text-gray-600 dark:text-gray-300"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && <span className="bg-blue-600 text-white text-xs rounded-full px-1.5 py-0.5">{activeFilterCount}</span>}
            </button>

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-gray-400 hidden sm:block">Sort by</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="relevance">Relevance</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest</option>
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {categorySlug && (
                <button onClick={() => { setSearchParams({}); }} className="flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 text-xs font-medium">
                  {categorySlug} <X className="w-3 h-3" />
                </button>
              )}
              {filters.brandIds.map((id) => {
                const brand = brands.find((b) => b.id === id);
                return brand ? (
                  <button key={id} onClick={() => setFilters({ ...filters, brandIds: filters.brandIds.filter((b) => b !== id) })} className="flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 text-xs font-medium">
                    {brand.name} <X className="w-3 h-3" />
                  </button>
                ) : null;
              })}
              {filters.has5g && (
                <button onClick={() => setFilters({ ...filters, has5g: false })} className="flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 text-xs font-medium">
                  5G <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {loading ? (
            <PhoneGridSkeleton count={8} />
          ) : phones.length === 0 ? (
            <EmptyState
              title="No phones found"
              description="Try adjusting your filters or search for something else."
              action={<button onClick={() => { setFilters(defaultFilters); setSearchParams({}); }} className="rounded-xl bg-blue-600 text-white px-4 py-2 text-sm font-medium">Clear all filters</button>}
            />
          ) : (
            <>
              <PhoneGrid phones={phones} />
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
        </div>
      </div>

      <FilterDrawer open={filterOpen} onClose={() => setFilterOpen(false)} brands={brands} filters={filters} onChange={setFilters} onClear={() => setFilters(defaultFilters)} />
    </div>
  );
}
