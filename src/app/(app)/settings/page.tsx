'use client';

import { useRouter } from 'next/navigation';
import { LogOut, User as UserIcon, Shield, Bell, Moon, ChevronLeft } from 'lucide-react';

import { useAuthStore } from '@/lib/store/auth.store';
import { useToast } from '@/components/ui/toast';
import { useTheme } from '@/lib/providers';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useState } from 'react';

export default function SettingsPage() {
  const router = useRouter();
  const toast = useToast();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showWipeDialog, setShowWipeDialog] = useState(false);

  const handleLogout = () => {
    // Clear cookies for middleware
    document.cookie = 'dem-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    
    // Clear zustand store
    logout();
    toast.success('Logged out successfully');
    router.push('/');
  };

  const handleSyncCloud = () => {
    toast.success('Successfully synced with cloud backup!');
  };

  const handleWipeData = () => {
    localStorage.clear();
    setShowWipeDialog(false);
    toast.success('Local data completely wiped.');
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  };

  return (
    <div className="space-y-6 fade-in max-w-2xl">
      <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">Settings</h1>

      {/* Profile Summary */}
      <div className="bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-800 rounded-2xl p-4 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 text-xl font-bold">
          {user?.name?.charAt(0) || 'U'}
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-lg text-surface-900 dark:text-surface-50">
            {user?.name || 'User'}
          </h2>
          <p className="text-sm text-surface-500">
            {user?.email || 'No contact info'}
          </p>
        </div>
      </div>

      {/* Setting Groups */}
      <div className="space-y-4">
        
        {/* Appearance */}
        <div className="bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-800 rounded-2xl overflow-hidden">
          <div className="p-4 flex items-center justify-between border-b border-surface-200 dark:border-surface-800 last:border-0 hover:bg-surface-100/50 dark:hover:bg-surface-800/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-surface-200 dark:bg-surface-800 flex items-center justify-center">
                <Moon className="w-5 h-5 text-surface-600 dark:text-surface-400" />
              </div>
              <div>
                <p className="font-medium text-surface-900 dark:text-surface-50">Dark Mode</p>
                <p className="text-xs text-surface-500">Enable dark theme globally</p>
              </div>
            </div>
            {/* Simple toggle switch */}
            <button
              onClick={toggleTheme}
              className={`w-12 h-6 rounded-full relative transition-colors ${
                theme === 'dark' ? 'bg-primary-500' : 'bg-surface-300 dark:bg-surface-600'
              }`}
            >
              <div 
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${
                  theme === 'dark' ? 'left-[calc(100%-1.375rem)]' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Mock Cloud Sync */}
        <div className="bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-800 rounded-2xl overflow-hidden mt-4">
          <div 
            onClick={handleSyncCloud}
            className="p-4 flex items-center justify-between border-b border-surface-200 dark:border-surface-800 last:border-0 hover:bg-surface-100/50 dark:hover:bg-surface-800/50 transition-colors cursor-pointer touch-target"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="font-medium text-surface-900 dark:text-surface-50">Sync to Cloud</p>
                <p className="text-xs text-surface-500">Back up your ledger securely</p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="hidden sm:block">Sync Now</Button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-8 space-y-3">
          <h3 className="text-xs font-semibold text-expense-500 uppercase tracking-wider ml-1">Danger Zone</h3>
          <div className="bg-expense-50 dark:bg-expense-950/20 border border-expense-200 dark:border-expense-900/50 rounded-2xl overflow-hidden">
            <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-bold text-expense-600 dark:text-expense-400">Wipe Local Data</p>
                <p className="text-sm text-expense-600/80 dark:text-expense-400/80 max-w-sm mt-0.5">
                  Permanently delete all books, transactions, and settings stored on this device.
                </p>
              </div>
              <Button 
                variant="destructive" 
                className="shrink-0"
                onClick={() => setShowWipeDialog(true)}
              >
                Delete Everything
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <div className="pt-4">
        <Button 
          variant="destructive" 
          className="w-full gap-2"
          onClick={() => setShowLogoutDialog(true)}
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </Button>
      </div>

      {/* Confirm Logout Modal */}
      <ConfirmDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={handleLogout}
        title="Log Out"
        description="Are you sure you want to log out of your cash book?"
        confirmText="Log Out"
        variant="danger"
      />
      {/* Confirm Wipe Modal */}
      <ConfirmDialog
        isOpen={showWipeDialog}
        onClose={() => setShowWipeDialog(false)}
        onConfirm={handleWipeData}
        title="Wipe ALL Data?"
        description="WARNING: This will instantly and permanently delete all your cash ledgers, categories, and transactions mapped to this device's memory. This action cannot be undone."
        confirmText="Yes, Wipe Data"
        variant="danger"
      />
    </div>
  );
}
