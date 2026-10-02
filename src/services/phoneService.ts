import supabase from '@/lib/supabase';
import type { Brand, Phone, PhoneVariant, StorePrice, Store, Category, Review, PriceHistory, PhoneImage, PhoneColor } from '@/types';

function toNum(v: number | string | null | undefined): number | null {
  if (v === null || v === undefined) return null;
  const n = typeof v === 'number' ? v : parseFloat(v);
  return isNaN(n) ? null : n;
}

// Reusable select string for phone listings: includes brand, images, and variants
const PHONE_CARD_SELECT = '*, brand:brands(*), images:phone_images(image_url, alt_text, display_order), variants:phone_variants(id, ram, storage, color, price, availability)';

// Normalize variants: convert numeric-string prices to real numbers and sort images
function normalizePhone<T extends Phone>(phone: T): T {
  if (phone.images) {
    phone.images = [...phone.images].sort((a, b) => a.display_order - b.display_order);
  }
  if (phone.variants) {
    phone.variants = phone.variants.map((v) => ({
      ...v,
      price: toNum(v.price),
    }));
  }
  return phone;
}

// ===== Reusable card mapper =====
export interface PhoneCardData {
  id: string;
  name: string;
  slug: string;
  brandName: string | null;
  brandSlug: string | null;
  imageUrl: string | null;
  lowestPrice: number | null;
  hasMultipleVariants: boolean;
  rating: number;
  reviewCount: number;
  has5G: boolean;
  isFeatured: boolean;
  isTrending: boolean;
}

export function mapPhoneForCard(phone: Phone): PhoneCardData {
  const images = phone.images ?? [];
  const imageUrl = images.length > 0 ? images[0].image_url : null;

  const variantPrices = (phone.variants ?? [])
    .map((v) => toNum(v.price))
    .filter((p): p is number => p !== null && p > 0);

  const lowestPrice = variantPrices.length > 0 ? Math.min(...variantPrices) : null;

  return {
    id: phone.id,
    name: phone.name,
    slug: phone.slug,
    brandName: phone.brand?.name ?? null,
    brandSlug: phone.brand?.slug ?? null,
    imageUrl,
    lowestPrice,
    hasMultipleVariants: (phone.variants?.length ?? 0) > 1,
    rating: Number(phone.rating) || 0,
    reviewCount: phone.review_count ?? 0,
    has5G: phone.has_5g ?? false,
    isFeatured: phone.is_featured ?? false,
    isTrending: phone.is_trending ?? false,
  };
}

// Get the lowest variant price (not store price) — used for card display and price filtering
export function getLowestVariantPrice(phone: Phone): number | null {
  const prices = (phone.variants ?? [])
    .map((v) => toNum(v.price))
    .filter((p): p is number => p !== null && p > 0);
  return prices.length > 0 ? Math.min(...prices) : null;
}

// ===== Brands =====
export async function fetchBrands(): Promise<Brand[]> {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchBrandBySlug(slug: string): Promise<Brand | null> {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// ===== Categories =====
export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

// ===== Stores =====
export async function fetchStores(): Promise<Store[]> {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

// ===== Phones =====
export async function fetchPhones(opts?: {
  brandId?: string;
  categorySlug?: string;
  search?: string;
  limit?: number;
  offset?: number;
  orderBy?: string;
  ascending?: boolean;
  minPrice?: number;
  maxPrice?: number;
  has5g?: boolean;
  minRating?: number;
  status?: string;
}): Promise<{ phones: Phone[]; total: number }> {
  let query = supabase
    .from('phones')
    .select(PHONE_CARD_SELECT, { count: 'exact' });

  if (opts?.status) {
    query = query.eq('status', opts.status);
  } else {
    query = query.eq('status', 'published');
  }

  if (opts?.brandId) query = query.eq('brand_id', opts.brandId);
  if (opts?.search) {
    query = query.or(`name.ilike.%${opts.search}%,model_number.ilike.%${opts.search}%,processor.ilike.%${opts.search}%,description.ilike.%${opts.search}%`);
  }
  if (opts?.has5g) query = query.eq('has_5g', true);
  if (opts?.minRating) query = query.gte('rating', opts.minRating);

  const orderField = opts?.orderBy || 'created_at';
  const ascending = opts?.ascending ?? false;
  query = query.order(orderField, { ascending });

  if (opts?.limit) {
    query = query.range(opts.offset ?? 0, (opts.offset ?? 0) + opts.limit - 1);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  let phones = (data ?? []).map(normalizePhone);

  // Category filter requires post-fetch join
  if (opts?.categorySlug) {
    const { data: catData } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', opts.categorySlug)
      .maybeSingle();
    if (catData) {
      const { data: pcData } = await supabase
        .from('phone_categories')
        .select('phone_id')
        .eq('category_id', catData.id);
      const phoneIds = (pcData ?? []).map((pc) => pc.phone_id);
      phones = phones.filter((p) => phoneIds.includes(p.id));
    }
  }

  return { phones, total: count ?? 0 };
}

export async function fetchPhoneBySlug(slug: string): Promise<Phone | null> {
  const { data, error } = await supabase
    .from('phones')
    .select('*, brand:brands(*)')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  // Fetch related data in parallel
  const [imagesRes, variantsRes, colorsRes, categoriesRes] = await Promise.all([
    supabase.from('phone_images').select('*').eq('phone_id', data.id).order('display_order', { ascending: true }),
    supabase.from('phone_variants').select('*').eq('phone_id', data.id).order('price', { ascending: true }),
    supabase.from('phone_colors').select('*').eq('phone_id', data.id).order('display_order', { ascending: true }),
    supabase.from('phone_categories').select('category:categories(*)').eq('phone_id', data.id),
  ]);

  data.images = imagesRes.data ?? [];
  data.variants = (variantsRes.data ?? []).map((v: PhoneVariant) => ({
    ...v,
    price: toNum(v.price),
  }));
  data.colors = colorsRes.data ?? [];
  data.categories = (categoriesRes.data ?? []).map((c) => c.category).filter(Boolean);

  // Fetch store prices for all variants
  if (data.variants && data.variants.length > 0) {
    const variantIds = data.variants.map((v: PhoneVariant) => v.id);
    const { data: prices } = await supabase
      .from('store_prices')
      .select('*, store:stores(*)')
      .in('variant_id', variantIds);
    const pricesByVariant = (prices ?? []).reduce<Record<string, StorePrice[]>>((acc, p) => {
      const converted: StorePrice = {
        ...p,
        price: toNum(p.price) ?? 0,
        mrp: toNum(p.mrp),
      };
      if (!acc[p.variant_id]) acc[p.variant_id] = [];
      acc[p.variant_id].push(converted);
      return acc;
    }, {});
    data.variants = data.variants.map((v: PhoneVariant) => ({
      ...v,
      store_prices: pricesByVariant[v.id] ?? [],
    }));
  }

  return data;
}

export async function fetchFeaturedPhones(): Promise<Phone[]> {
  const { data, error } = await supabase
    .from('phones')
    .select(PHONE_CARD_SELECT)
    .eq('status', 'published')
    .eq('is_featured', true)
    .order('rating', { ascending: false })
    .limit(8);
  if (error) throw error;
  return (data ?? []).map(normalizePhone);
}

export async function fetchTrendingPhones(): Promise<Phone[]> {
  const { data, error } = await supabase
    .from('phones')
    .select(PHONE_CARD_SELECT)
    .eq('status', 'published')
    .eq('is_trending', true)
    .order('rating', { ascending: false })
    .limit(8);
  if (error) throw error;
  return (data ?? []).map(normalizePhone);
}

export async function fetchRecentPhones(): Promise<Phone[]> {
  const { data, error } = await supabase
    .from('phones')
    .select(PHONE_CARD_SELECT)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(8);
  if (error) throw error;
  return (data ?? []).map(normalizePhone);
}

export async function searchPhones(query: string, limit = 10): Promise<Phone[]> {
  const { data, error } = await supabase
    .from('phones')
    .select(PHONE_CARD_SELECT)
    .eq('status', 'published')
    .or(`name.ilike.%${query}%,model_number.ilike.%${query}%,processor.ilike.%${query}%`)
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(normalizePhone);
}

// ===== Store Prices =====
export async function fetchStorePricesForVariant(variantId: string): Promise<StorePrice[]> {
  const { data, error } = await supabase
    .from('store_prices')
    .select('*, store:stores(*)')
    .eq('variant_id', variantId)
    .order('price', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((p) => ({ ...p, price: toNum(p.price) ?? 0, mrp: toNum(p.mrp) }));
}

// ===== Price History =====
export async function fetchPriceHistory(variantId: string): Promise<PriceHistory[]> {
  const { data, error } = await supabase
    .from('price_history')
    .select('*, store:stores(name)')
    .eq('variant_id', variantId)
    .order('recorded_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((p) => ({ ...p, price: toNum(p.price) ?? 0 }));
}

// ===== Reviews =====
export async function fetchReviews(phoneId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('phone_id', phoneId)
    .eq('is_approved', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ===== Helper: get lowest store price for a phone =====
export function getLowestPriceForPhone(phone: Phone): { price: number | null; storeName: string | null; storeSlug: string | null } {
  if (!phone.variants || phone.variants.length === 0) return { price: null, storeName: null, storeSlug: null };
  let lowest: number | null = null;
  let storeName: string | null = null;
  let storeSlug: string | null = null;
  for (const variant of phone.variants) {
    if (!variant.store_prices) continue;
    for (const sp of variant.store_prices) {
      const price = toNum(sp.price);
      if (price === null) continue;
      if (lowest === null || price < lowest) {
        lowest = price;
        storeName = sp.store?.name ?? null;
        storeSlug = sp.store?.slug ?? null;
      }
    }
  }
  return { price: lowest, storeName, storeSlug };
}

export function getStartingPrice(phone: Phone): number | null {
  if (!phone.variants || phone.variants.length === 0) return null;
  const prices = phone.variants.map((v) => toNum(v.price)).filter((p): p is number => p !== null);
  if (prices.length === 0) return null;
  return Math.min(...prices);
}

// Reusable: get display price for the detail page, considering both store prices and variant prices
export function getDisplayPrice(phone: Phone, selectedVariantId: string | null): {
  price: number | null;
  source: 'store' | 'variant' | null;
  storeName: string | null;
  hasStorePrices: boolean;
} {
  const variants = phone.variants ?? [];
  const selected = selectedVariantId
    ? variants.find((v) => v.id === selectedVariantId) ?? variants[0]
    : variants[0];

  // Try selected variant's store prices first
  if (selected && selected.store_prices && selected.store_prices.length > 0) {
    let lowest: number | null = null;
    let storeName: string | null = null;
    for (const sp of selected.store_prices) {
      const price = toNum(sp.price);
      if (price === null || price <= 0) continue;
      if (lowest === null || price < lowest) {
        lowest = price;
        storeName = sp.store?.name ?? null;
      }
    }
    if (lowest !== null) {
      return { price: lowest, source: 'store', storeName, hasStorePrices: true };
    }
  }

  // Fallback to selected variant's own price
  if (selected) {
    const variantPrice = toNum(selected.price);
    if (variantPrice !== null && variantPrice > 0) {
      const hasStorePrices = (selected.store_prices?.length ?? 0) > 0;
      return { price: variantPrice, source: 'variant', storeName: null, hasStorePrices };
    }
  }

  // No selected variant: try all store prices, then all variant prices
  let lowestStore: number | null = null;
  let storeName: string | null = null;
  let anyStorePrices = false;
  for (const v of variants) {
    if (v.store_prices) {
      for (const sp of v.store_prices) {
        anyStorePrices = true;
        const price = toNum(sp.price);
        if (price === null || price <= 0) continue;
        if (lowestStore === null || price < lowestStore) {
          lowestStore = price;
          storeName = sp.store?.name ?? null;
        }
      }
    }
  }
  if (lowestStore !== null) {
    return { price: lowestStore, source: 'store', storeName, hasStorePrices: anyStorePrices };
  }

  // Fallback to lowest variant price across all variants
  const variantPrices = variants
    .map((v) => toNum(v.price))
    .filter((p): p is number => p !== null && p > 0);
  if (variantPrices.length > 0) {
    return { price: Math.min(...variantPrices), source: 'variant', storeName: null, hasStorePrices: anyStorePrices };
  }

  return { price: null, source: null, storeName: null, hasStorePrices: anyStorePrices };
}

export function getLowestStorePriceForVariant(variant: PhoneVariant): StorePrice | null {
  if (!variant.store_prices || variant.store_prices.length === 0) return null;
  return variant.store_prices.reduce((min, sp) => (toNum(sp.price)! < toNum(min.price)! ? sp : min), variant.store_prices[0]);
}

export function getAllStorePricesForPhone(phone: Phone): { store: Store; price: number; mrp: number | null; variant: PhoneVariant; lastChecked: string }[] {
  const results: { store: Store; price: number; mrp: number | null; variant: PhoneVariant; lastChecked: string }[] = [];
  if (!phone.variants) return results;
  for (const variant of phone.variants) {
    if (!variant.store_prices) continue;
    for (const sp of variant.store_prices) {
      if (sp.store) {
        results.push({ store: sp.store, price: toNum(sp.price) ?? 0, mrp: toNum(sp.mrp), variant, lastChecked: sp.last_checked_at });
      }
    }
  }
  return results.sort((a, b) => a.price - b.price);
}
