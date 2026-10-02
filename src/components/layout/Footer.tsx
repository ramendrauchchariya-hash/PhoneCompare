import { Link } from 'react-router-dom';
import { Smartphone, Twitter, Facebook, Instagram, Youtube, Github } from 'lucide-react';

export default function Footer() {
  const footerLinks = [
    { label: 'About', to: '/about' },
    { label: 'Contact', to: '/contact' },
    { label: 'Privacy Policy', to: '/privacy' },
    { label: 'Terms of Service', to: '/terms' },
    { label: 'Disclaimer', to: '/disclaimer' },
    { label: 'Affiliate Disclosure', to: '/disclaimer#affiliate' },
  ];

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mt-16 pb-20 md:pb-0">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
                <Smartphone className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                Phone<span className="text-blue-600">Compare</span>
              </span>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-4">
              Compare specifications, features and prices across India's leading online stores.
              Find the right smartphone at the right price.
            </p>
            <div className="flex gap-3">
              {[Twitter, Facebook, Instagram, Youtube, Github].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600 transition-colors"
                  aria-label="Social link"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Discover</h4>
            <ul className="space-y-2">
              <li><Link to="/phones" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">All Smartphones</Link></li>
              <li><Link to="/deals" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Today's Deals</Link></li>
              <li><Link to="/brands" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">All Brands</Link></li>
              <li><Link to="/compare" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Compare Phones</Link></li>
              <li><Link to="/favorites" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Favorites</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
            Prices and availability may change frequently. Prices shown on this website are for informational and comparison purposes.
            Please verify the final price, availability, delivery charges and terms on the retailer's website before purchasing.
          </p>
          <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
            © {new Date().getFullYear()} PhoneCompare. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
