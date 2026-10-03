import type { Phone } from '@/types';
import { getLowestVariantPrice } from '@/services/phoneService';
import type { FilterState } from '@/components/phone/FilterSidebar';

export type SortOption = 'relevance' | 'price-low' | 'price-high' | 'newest' | 'popular' | 'rating' | 'discount';

/**
 * Apply all client-side filters to a list of phones.
 * Pipeline: brand → price → features → specs
 */
export function applyPhoneFilters(phones: Phone[], filters: FilterState, categorySlug?: string): Phone[] {
  let result = phones;

  // Brand filter (handles multiple brands)
  if (filters.brandIds.length > 0) {
    result = result.filter((p) => filters.brandIds.includes(p.brand_id));
  }

  // Price filter: use lowest variant price
  if (filters.minPrice !== null || filters.maxPrice !== null) {
    result = result.filter((p) => {
      const lowest = getLowestVariantPrice(p);
      if (lowest === null) return false;
      if (filters.minPrice !== null && lowest < filters.minPrice) return false;
      if (filters.maxPrice !== null && lowest > filters.maxPrice) return false;
      return true;
    });
  }

  // Feature filters
  if (filters.has5g) result = result.filter((p) => p.has_5g);
  if (filters.hasNfc) result = result.filter((p) => p.has_nfc);
  if (filters.wirelessCharging) result = result.filter((p) => p.wireless_charging === 'Yes');
  if (filters.minRating > 0) result = result.filter((p) => Number(p.rating) >= filters.minRating);

  // Spec filters
  if (filters.chipsetBrand) result = result.filter((p) => p.chipset_brand === filters.chipsetBrand);
  if (filters.refreshRate) result = result.filter((p) => p.refresh_rate?.includes(filters.refreshRate));
  if (filters.os) result = result.filter((p) => p.os?.toLowerCase().includes(filters.os.toLowerCase()));
  if (filters.minBattery !== null) {
    result = result.filter((p) => {
      const m = p.battery_capacity?.match(/(\d+)/);
      return m && parseInt(m[1]) >= filters.minBattery!;
    });
  }

  return result;
}

/**
 * Sort phones by the given sort option.
 */
export function sortPhones(phones: Phone[], sort: SortOption): Phone[] {
  const sorted = [...phones];
  switch (sort) {
    case 'price-low':
      sorted.sort((a, b) => {
        const aPrice = getLowestVariantPrice(a);
        const bPrice = getLowestVariantPrice(b);
        if (aPrice === null && bPrice === null) return 0;
        if (aPrice === null) return 1;
        if (bPrice === null) return -1;
        return aPrice - bPrice;
      });
      break;
    case 'price-high':
      sorted.sort((a, b) => {
        const aPrice = getLowestVariantPrice(a);
        const bPrice = getLowestVariantPrice(b);
        if (aPrice === null && bPrice === null) return 0;
        if (aPrice === null) return 1;
        if (bPrice === null) return -1;
        return bPrice - aPrice;
      });
      break;
    case 'newest':
      sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      break;
    case 'popular':
      sorted.sort((a, b) => (b.review_count ?? 0) - (a.review_count ?? 0));
      break;
    case 'rating':
      sorted.sort((a, b) => Number(b.rating) - Number(a.rating));
      break;
    case 'discount':
      sorted.sort((a, b) => {
        const aPrice = getLowestVariantPrice(a);
        const bPrice = getLowestVariantPrice(b);
        if (aPrice === null && bPrice === null) return 0;
        if (aPrice === null) return 1;
        if (bPrice === null) return -1;
        return bPrice - aPrice;
      });
      break;
    case 'relevance':
    default:
      sorted.sort((a, b) => Number(b.rating) - Number(a.rating));
      break;
  }
  return sorted;
}

/**
 * Paginate an already filtered+sorted array.
 */
export function paginatePhones<T>(items: T[], page: number, pageSize: number): T[] {
  const startIndex = (page - 1) * pageSize;
  return items.slice(startIndex, startIndex + pageSize);
}

/**
 * Clamp current page to valid range based on total results.
 */
export function clampPage(page: number, totalPages: number): number {
  if (totalPages === 0) return 1;
  if (page < 1) return 1;
  if (page > totalPages) return totalPages;
  return page;
}
