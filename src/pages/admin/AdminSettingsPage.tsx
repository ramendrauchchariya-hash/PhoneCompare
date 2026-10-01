import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Shield, Mail, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminSettingsPage() {
  const { user, signOut } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    showToast('Signed out successfully', 'success');
    navigate('/admin/login');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>

      <div className="max-w-2xl space-y-6">
        {/* Account info */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4" /> Admin Account
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Role</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Administrator</p>
              </div>
            </div>
          </div>
        </div>

        {/* Site info */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Site Information</h2>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p><strong className="text-gray-900 dark:text-white">Site Name:</strong> PhoneCompare</p>
            <p><strong className="text-gray-900 dark:text-white">Market:</strong> India</p>
            <p><strong className="text-gray-900 dark:text-white">Currency:</strong> INR (₹)</p>
            <p><strong className="text-gray-900 dark:text-white">Database:</strong> Supabase (PostgreSQL)</p>
          </div>
        </div>

        {/* Price disclaimer */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Price Update Settings</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Prices are currently updated manually through the admin dashboard. The architecture supports
            automated price feeds (API, affiliate feed, import) for future integration.
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">Price Sources</span>
              <span className="text-gray-900 dark:text-white">Manual, API, Affiliate Feed, Import</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">Auto Update</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Not configured</span>
            </div>
          </div>
        </div>

        {/* Sign out */}
        <div className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10 p-5">
          <h2 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">Sign Out</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Sign out of the admin dashboard.</p>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex items-center gap-2 rounded-xl bg-red-600 text-white px-4 py-2 text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            <LogOut className="w-4 h-4" /> {signingOut ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      </div>
    </div>
  );
}
