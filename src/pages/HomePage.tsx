import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, TrendingUp, Clock, Sparkles, ArrowRight, Smartphone } from 'lucide-react';
import type { Brand, Phone, Category } from '@/types';
import { fetchBrands, fetchCategories, fetchFeaturedPhones, fetchTrendingPhones, fetchRecentPhones, mapPhoneForCard } from '@/services/phoneService';
import { formatPrice } from '@/utils/format';
import PhoneGrid from '@/components/phone/PhoneGrid';
import Badge from '@/components/ui/Badge';
import { PhoneGridSkeleton } from '@/components/ui/Skeleton';

export default function HomePage() {
  const navigate = useNavigate();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Phone[]>([]);
  const [trending, setTrending] = useState<Phone[]>([]);
  const [recent, setRecent] = useState<Phone[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [b, c, f, t, r] = await Promise.all([
          fetchBrands(),
          fetchCategories(),
          fetchFeaturedPhones(),
          fetchTrendingPhones(),
          fetchRecentPhones(),
        ]);
        setBrands(b);
        setCategories(c);
        setFeatured(f);
        setTrending(t);
        setRecent(r);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const categoryIcons: Record<string, string> = {
    'under-15000': '₹15K',
    '15000-25000': '₹25K',
    '25000-40000': '₹40K',
    '40000-60000': '₹60K',
    '60000-plus': '₹60K+',
    'best-camera': 'Camera',
    'best-gaming': 'Gaming',
    'best-battery': 'Battery',
    '5g-phones': '5G',
    'flagship': 'Flag',
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-blue-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950/20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-200/20 dark:bg-blue-900/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-blue-200/20 dark:bg-blue-900/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight text-balance">
              Find the right smartphone at the right price.
            </h1>
            <p className="mt-4 text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-xl">
              Compare specifications, features and prices across India's leading online stores.
            </p>

            <form onSubmit={handleSearch} className="mt-8 relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search iPhone 17, Samsung S26, OnePlus..."
                className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-12 pr-4 py-4 text-base shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors">
                Search
              </button>
            </form>

            <div className="mt-4 flex flex-wrap gap-2">
              {['iPhone 17', 'Samsung S26', 'OnePlus 13', '5G', 'Snapdragon'].map((s) => (
                <button
                  key={s}
                  onClick={() => navigate(`/search?q=${encodeURIComponent(s)}`)}
                  className="rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:border-blue-400 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Popular Brands */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Popular Brands</h2>
          <Link to="/brands" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              to={`/brand/${brand.slug}`}
              className="group flex flex-col items-center justify-center rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 transition-all"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 group-hover:from-blue-50 group-hover:to-blue-100 dark:group-hover:from-blue-900/30 dark:group-hover:to-blue-800/30 transition-colors">
                <Smartphone className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
              </div>
              <span className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">{brand.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Categories */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Popular Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/phones?category=${cat.slug}`}
              className="group rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold">
                  {categoryIcons[cat.slug] || '★'}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {cat.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Today's Deals */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Today's Deals
          </h2>
          <Link to="/deals" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {loading ? (
          <PhoneGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trending.slice(0, 4).map((phone) => {
              const card = mapPhoneForCard(phone);
              return (
                <Link key={phone.id} to={`/phones/${phone.slug}`} className="group rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden hover:shadow-lg transition-all">
                  <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
                    {card.imageUrl ? (
                      <img src={card.imageUrl} alt={phone.name} loading="lazy" className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
                    ) : (
                      <Smartphone className="w-12 h-12 text-gray-300" />
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{card.brandName}</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">{phone.name}</p>
                    {card.lowestPrice !== null && (
                      <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{formatPrice(card.lowestPrice)}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Trending */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Trending Phones
          </h2>
          <Link to="/phones" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {loading ? <PhoneGridSkeleton count={8} /> : <PhoneGrid phones={trending} />}
      </section>

      {/* Recently Added */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-400" />
            Recently Added
          </h2>
          <Link to="/phones" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {loading ? <PhoneGridSkeleton count={4} /> : <PhoneGrid phones={recent.slice(0, 4)} />}
      </section>
    </div>
  );
}
