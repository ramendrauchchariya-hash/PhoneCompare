import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import type { Brand, Phone } from '@/types';
import { fetchBrands, fetchPhones } from '@/services/phoneService';
import { FilterSidebar, FilterDrawer, defaultFilters, type FilterState } from '@/components/phone/FilterSidebar';
import PhoneGrid from '@/components/phone/PhoneGrid';
import Pagination from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';
import { PhoneGridSkeleton } from '@/components/ui/Skeleton';
import { applyPhoneFilters, sortPhones, paginatePhones, clampPage, type SortOption } from '@/utils/phoneFilters';

const PER_PAGE = 12;

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
];

export default function PhonesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [allPhones, setAllPhones] = useState<Phone[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  // Read state from URL params (source of truth)
  const categorySlug = searchParams.get('category') || undefined;
  const pageFromUrl = parseInt(searchParams.get('page') || '1') || 1;
  const sortFromUrl = (searchParams.get('sort') || 'relevance') as SortOption;
  const brandSlugsFromUrl = searchParams.get('brands') || '';

  // Filters state — derived from URL on first load, then managed locally
  const [filters, setFilters] = useState<FilterState>(() => {
    const params = new URLSearchParams(window.location.search);
    const brandSlugs = params.get('brands');
    const minPrice = params.get('minPrice');
    const maxPrice = params.get('maxPrice');
    const has5g = params.get('has5g') === '1';
    const hasNfc = params.get('hasNfc') === '1';
    const wireless = params.get('wireless') === '1';
    return {
      ...defaultFilters,
      minPrice: minPrice ? Number(minPrice) : null,
      maxPrice: maxPrice ? Number(maxPrice) : null,
      has5g,
      hasNfc,
      wirelessCharging: wireless,
    };
  });

  // Sync brand IDs from URL slug names once brands are loaded
  const brandsLoadedRef = useRef(false);
  useEffect(() => {
    if (brands.length === 0 || brandsLoadedRef.current) return;
    brandsLoadedRef.current = true;
    if (brandSlugsFromUrl) {
      const slugs = brandSlugsFromUrl.split(',').filter(Boolean);
      const ids = brands.filter((b) => slugs.includes(b.slug)).map((b) => b.id);
      if (ids.length > 0) {
        setFilters((prev) => ({ ...prev, brandIds: ids }));
      }
    }
  }, [brands, brandSlugsFromUrl]);

  // Fetch all phones once (no server-side pagination)
  const loadPhones = useCallback(async () => {
    setLoading(true);
    try {
      const opts: Parameters<typeof fetchPhones>[0] = {
        limit: 1000,
        categorySlug,
      };
      const { phones: data } = await fetchPhones(opts);
      setAllPhones(data);
    } catch (err) {
      console.error('Failed to load phones:', err);
    } finally {
      setLoading(false);
    }
  }, [categorySlug]);

  useEffect(() => {
    fetchBrands().then(setBrands).catch(console.error);
  }, []);

  useEffect(() => {
    loadPhones();
  }, [loadPhones]);

  // Pipeline: filter → sort → paginate (all client-side)
  const filteredPhones = useMemo(() => applyPhoneFilters(allPhones, filters, categorySlug), [allPhones, filters, categorySlug]);
  const sortedPhones = useMemo(() => sortPhones(filteredPhones, sortFromUrl), [filteredPhones, sortFromUrl]);
  const totalPages = Math.ceil(sortedPhones.length / PER_PAGE);
  const currentPage = clampPage(pageFromUrl, totalPages);
  const visiblePhones = useMemo(() => paginatePhones(sortedPhones, currentPage, PER_PAGE), [sortedPhones, currentPage]);

  // Update URL when page or sort changes
  const updateUrl = useCallback((updates: { page?: number; sort?: SortOption; brands?: string }) => {
    const params = new URLSearchParams(searchParams);
    if (updates.page !== undefined) {
      if (updates.page > 1) params.set('page', String(updates.page));
      else params.delete('page');
    }
    if (updates.sort !== undefined) {
      if (updates.sort !== 'relevance') params.set('sort', updates.sort);
      else params.delete('sort');
    }
    if (updates.brands !== undefined) {
      if (updates.brands) params.set('brands', updates.brands);
      else params.delete('brands');
    }
    setSearchParams(params, { replace: false });
  }, [searchParams, setSearchParams]);

  // Handle filter changes — always reset to page 1
  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    // Sync brand slugs to URL
    const brandSlugs = newFilters.brandIds.length > 0
      ? brands.filter((b) => newFilters.brandIds.includes(b.id)).map((b) => b.slug).join(',')
      : '';
    const params = new URLSearchParams(searchParams);
    if (brandSlugs) params.set('brands', brandSlugs);
    else params.delete('brands');
    if (newFilters.minPrice !== null) params.set('minPrice', String(newFilters.minPrice));
    else params.delete('minPrice');
    if (newFilters.maxPrice !== null) params.set('maxPrice', String(newFilters.maxPrice));
    else params.delete('maxPrice');
    if (newFilters.has5g) params.set('has5g', '1'); else params.delete('has5g');
    if (newFilters.hasNfc) params.set('hasNfc', '1'); else params.delete('hasNfc');
    if (newFilters.wirelessCharging) params.set('wireless', '1'); else params.delete('wireless');
    // Always reset page to 1 on filter change
    params.delete('page');
    setSearchParams(params, { replace: false });
  }, [brands, searchParams, setSearchParams]);

  const handleSortChange = useCallback((newSort: SortOption) => {
    updateUrl({ sort: newSort, page: 1 });
  }, [updateUrl]);

  const handlePageChange = useCallback((newPage: number) => {
    updateUrl({ page: newPage });
    // Scroll to top of results on page change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [updateUrl]);

  const handleClearFilters = useCallback(() => {
    setFilters(defaultFilters);
    setSearchParams({}, { replace: false });
  }, [setSearchParams]);

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
          {loading ? 'Loading...' : `${filteredPhones.length} phone${filteredPhones.length !== 1 ? 's' : ''} found`}
          {categorySlug && ` in ${categorySlug.replace(/-/g, ' ')}`}
        </p>
      </div>

      <div className="flex gap-6">
        <FilterSidebar brands={brands} filters={filters} onChange={handleFilterChange} onClear={handleClearFilters} />

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
                value={sortFromUrl}
                onChange={(e) => handleSortChange(e.target.value as SortOption)}
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
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
                  <button key={id} onClick={() => handleFilterChange({ ...filters, brandIds: filters.brandIds.filter((b) => b !== id) })} className="flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 text-xs font-medium">
                    {brand.name} <X className="w-3 h-3" />
                  </button>
                ) : null;
              })}
              {filters.has5g && (
                <button onClick={() => handleFilterChange({ ...filters, has5g: false })} className="flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 text-xs font-medium">
                  5G <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {loading ? (
            <PhoneGridSkeleton count={8} />
          ) : visiblePhones.length === 0 ? (
            <EmptyState
              title="No phones found"
              description="Try adjusting your filters or search for something else."
              action={<button onClick={handleClearFilters} className="rounded-xl bg-blue-600 text-white px-4 py-2 text-sm font-medium">Clear all filters</button>}
            />
          ) : (
            <>
              <PhoneGrid phones={visiblePhones} />
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </>
          )}
        </div>
      </div>

      <FilterDrawer open={filterOpen} onClose={() => setFilterOpen(false)} brands={brands} filters={filters} onChange={handleFilterChange} onClear={handleClearFilters} />
    </div>
  );
}
