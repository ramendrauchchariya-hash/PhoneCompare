import { type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Smartphone, Tag, Store, IndianRupee, Layers, MessageSquare, Settings, LogOut, Home, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/phones', label: 'Phones', icon: Smartphone },
  { to: '/admin/brands', label: 'Brands', icon: Tag },
  { to: '/admin/stores', label: 'Stores', icon: Store },
  { to: '/admin/prices', label: 'Prices', icon: IndianRupee },
  { to: '/admin/categories', label: 'Categories', icon: Layers },
  { to: '/admin/reviews', label: 'Reviews', icon: MessageSquare },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, signOut, isAdmin } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    showToast('Signed out successfully', 'success');
    navigate('/admin/login');
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">You need admin access to view this page.</p>
          <Link to="/admin/login" className="rounded-xl bg-blue-600 text-white px-4 py-2.5 text-sm font-medium">Sign in as admin</Link>
        </div>
      </div>
    );
  }

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Sidebar - desktop */}
      <aside className="hidden md:flex w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white text-sm font-bold">PC</div>
            <span className="font-bold text-gray-900 dark:text-white">Admin Panel</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive(item.to)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-1">
          <Link to="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Home className="w-4 h-4" /> View Site
          </Link>
          <button onClick={handleSignOut} className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
          <p className="px-3 pt-2 text-xs text-gray-400 truncate">{user?.email}</p>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <span className="font-bold text-gray-900 dark:text-white">Admin Panel</span>
              <button onClick={() => setSidebarOpen(false)} className="text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => (
                <Link key={item.to} to={item.to} onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive(item.to) ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}>
                  <item.icon className="w-4 h-4" /> {item.label}
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-1">
              <Link to="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-600 dark:text-gray-300"><Home className="w-4 h-4" /> View Site</Link>
              <button onClick={handleSignOut} className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-600"><LogOut className="w-4 h-4" /> Sign Out</button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden sticky top-0 z-30 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg text-gray-600 dark:text-gray-300"><Menu className="w-5 h-5" /></button>
          <span className="font-semibold text-gray-900 dark:text-white">Admin</span>
          <Link to="/" className="p-2 rounded-lg text-gray-600 dark:text-gray-300"><Home className="w-5 h-5" /></Link>
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
