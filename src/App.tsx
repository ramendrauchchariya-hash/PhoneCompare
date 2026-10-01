import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

// User pages
import HomePage from '@/pages/HomePage';
import PhonesPage from '@/pages/PhonesPage';
import PhoneDetailsPage from '@/pages/PhoneDetailsPage';
import ComparePage from '@/pages/ComparePage';
import DealsPage from '@/pages/DealsPage';
import BrandsPage from '@/pages/BrandsPage';
import BrandDetailPage from '@/pages/BrandDetailPage';
import SearchPage from '@/pages/SearchPage';
import FavoritesPage from '@/pages/FavoritesPage';
import { AboutPage, ContactPage, PrivacyPage, TermsPage, DisclaimerPage } from '@/pages/StaticPages';

// Admin pages
import AdminLoginPage from '@/pages/admin/AdminLoginPage';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminPhonesPage from '@/pages/admin/AdminPhonesPage';
import AdminPhoneForm from '@/pages/admin/AdminPhoneForm';
import AdminBrandsPage from '@/pages/admin/AdminBrandsPage';
import AdminStoresPage from '@/pages/admin/AdminStoresPage';
import AdminPricesPage from '@/pages/admin/AdminPricesPage';
import AdminCategoriesPage from '@/pages/admin/AdminCategoriesPage';
import AdminReviewsPage from '@/pages/admin/AdminReviewsPage';
import AdminSettingsPage from '@/pages/admin/AdminSettingsPage';

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function AdminProtected({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) return <Navigate to="/admin/login" replace />;
  return <AdminLayout>{children}</AdminLayout>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* User routes with MainLayout */}
        <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
        <Route path="/phones" element={<MainLayout><PhonesPage /></MainLayout>} />
        <Route path="/phones/:slug" element={<MainLayout><PhoneDetailsPage /></MainLayout>} />
        <Route path="/compare" element={<MainLayout><ComparePage /></MainLayout>} />
        <Route path="/compare/:phones" element={<MainLayout><ComparePage /></MainLayout>} />
        <Route path="/deals" element={<MainLayout><DealsPage /></MainLayout>} />
        <Route path="/brands" element={<MainLayout><BrandsPage /></MainLayout>} />
        <Route path="/brand/:slug" element={<MainLayout><BrandDetailPage /></MainLayout>} />
        <Route path="/search" element={<MainLayout><SearchPage /></MainLayout>} />
        <Route path="/favorites" element={<MainLayout><FavoritesPage /></MainLayout>} />
        <Route path="/about" element={<MainLayout><AboutPage /></MainLayout>} />
        <Route path="/contact" element={<MainLayout><ContactPage /></MainLayout>} />
        <Route path="/privacy" element={<MainLayout><PrivacyPage /></MainLayout>} />
        <Route path="/terms" element={<MainLayout><TermsPage /></MainLayout>} />
        <Route path="/disclaimer" element={<MainLayout><DisclaimerPage /></MainLayout>} />

        {/* Admin login (no layout) */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Admin routes with AdminLayout */}
        <Route path="/admin" element={<AdminProtected><AdminDashboard /></AdminProtected>} />
        <Route path="/admin/phones" element={<AdminProtected><AdminPhonesPage /></AdminProtected>} />
        <Route path="/admin/phones/new" element={<AdminProtected><AdminPhoneForm /></AdminProtected>} />
        <Route path="/admin/phones/:id/edit" element={<AdminProtected><AdminPhoneForm /></AdminProtected>} />
        <Route path="/admin/brands" element={<AdminProtected><AdminBrandsPage /></AdminProtected>} />
        <Route path="/admin/stores" element={<AdminProtected><AdminStoresPage /></AdminProtected>} />
        <Route path="/admin/prices" element={<AdminProtected><AdminPricesPage /></AdminProtected>} />
        <Route path="/admin/categories" element={<AdminProtected><AdminCategoriesPage /></AdminProtected>} />
        <Route path="/admin/reviews" element={<AdminProtected><AdminReviewsPage /></AdminProtected>} />
        <Route path="/admin/settings" element={<AdminProtected><AdminSettingsPage /></AdminProtected>} />

        {/* 404 */}
        <Route path="*" element={<MainLayout><div className="mx-auto max-w-3xl px-4 py-16 text-center"><h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">404</h1><p className="text-sm text-gray-500 dark:text-gray-400">Page not found</p></div></MainLayout>} />
      </Routes>
    </BrowserRouter>
  );
}
