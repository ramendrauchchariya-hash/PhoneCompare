import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { Search, Sun, Moon, Menu, X, Smartphone, GitCompare, Home, Tag, LayoutGrid, Heart, Shield } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useCompare } from '@/contexts/CompareContext';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { compareList } = useCompare();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/phones', label: 'Smartphones', icon: Smartphone },
    { to: '/compare', label: 'Compare', icon: GitCompare, badge: compareList.length },
    { to: '/deals', label: 'Deals', icon: Tag },
    { to: '/brands', label: 'Brands', icon: LayoutGrid },
  ];

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
                <Smartphone className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white hidden sm:block">
                Phone<span className="text-blue-600">Compare</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                  {link.badge ? (
                    <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full bg-blue-600 text-white">
                      {link.badge}
                    </span>
                  ) : null}
                </Link>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>

              <Link
                to="/favorites"
                className="hidden sm:flex p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Favorites"
              >
                <Heart className="w-5 h-5" />
              </Link>

              <Link
                to="/admin"
                className="hidden sm:flex p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Admin"
              >
                <Shield className="w-5 h-5" />
              </Link>

              <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setSearchOpen(false)}>
          <div className="mx-auto max-w-2xl pt-20 px-4" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search smartphones, brands or specifications..."
                className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-12 pr-4 py-4 text-base shadow-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              />
            </form>
            <div className="mt-3 flex flex-wrap gap-2">
              {['iPhone 17', 'Samsung S26', 'OnePlus 13', '5G', 'Snapdragon', '5000mAh'].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    navigate(`/search?q=${encodeURIComponent(s)}`);
                    setSearchOpen(false);
                  }}
                  className="rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:border-blue-400 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="absolute right-0 top-0 h-full w-72 bg-white dark:bg-gray-900 shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8">
              <span className="text-lg font-bold text-gray-900 dark:text-white">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                  {link.badge ? (
                    <span className="ml-auto inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full bg-blue-600 text-white">
                      {link.badge}
                    </span>
                  ) : null}
                </Link>
              ))}
              <Link
                to="/favorites"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Heart className="w-5 h-5" />
                Favorites
              </Link>
              <Link
                to="/admin"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Shield className="w-5 h-5" />
                Admin
              </Link>
            </nav>
          </div>
        </div>
      )}

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg">
        <div className="flex items-center justify-around h-16">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="relative flex flex-col items-center justify-center gap-0.5 px-2 py-1 text-xs text-gray-500 dark:text-gray-400"
            >
              <link.icon className="w-5 h-5" />
              <span className="text-[10px]">{link.label}</span>
              {link.badge ? (
                <span className="absolute top-0 right-1 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold rounded-full bg-blue-600 text-white">
                  {link.badge}
                </span>
              ) : null}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
