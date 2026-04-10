'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { LogOut, Moon, ChevronRight, BookOpen, Tags, FileBarChart } from 'lucide-react';

import { signOut } from 'next-auth/react';
import { useProfile } from '@/lib/hooks/use-profile';
import { useToast } from '@/components/ui/toast';
import { useTheme } from '@/lib/providers';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useState } from 'react';

export default function SettingsPage() {
  const router = useRouter();
  const toast = useToast();
  const { data: user } = useProfile();
  const { theme, toggleTheme } = useTheme();
  
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = async () => {
    toast.success('Logging out...');
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className="space-y-6 fade-in max-w-2xl">
      <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">Settings</h1>

      {/* Profile Summary — tappable on mobile */}
      <button
        onClick={() => router.push('/profile')}
        className="w-full bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-800 rounded-2xl p-4 flex items-center gap-4 text-left hover:bg-surface-100/50 dark:hover:bg-surface-800/50 transition-colors active:scale-[0.99]"
      >
        {user?.image || user?.avatarUrl ? (
          <Image
            src={user.image || user.avatarUrl!}
            alt={user.name || 'User'}
            width={56}
            height={56}
            className="w-14 h-14 rounded-full object-cover ring-2 ring-primary-200 dark:ring-primary-800"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 text-xl font-bold">
            {user?.name?.charAt(0) || 'U'}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-lg text-surface-900 dark:text-surface-50">
            {user?.name || 'User'}
          </h2>
          <p className="text-sm text-surface-500 truncate">
            {user?.email || 'No contact info'}
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-surface-400 flex-shrink-0" />
      </button>

      {/* Quick Access — pages not in mobile bottom nav */}
      <div className="lg:hidden">
        <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2 px-1">
          Quick Access
        </p>
        <div className="bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-800 rounded-2xl overflow-hidden">
          {[
            { href: '/books', label: 'Cash Books', desc: 'Manage your books', icon: BookOpen },
            { href: '/categories', label: 'Categories', desc: 'Income & expense categories', icon: Tags },
            { href: '/summary', label: 'Summary', desc: 'Overview & analytics', icon: FileBarChart },
          ].map((item, i, arr) => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`w-full p-4 flex items-center gap-3 text-left hover:bg-surface-100/50 dark:hover:bg-surface-800/50 transition-colors active:scale-[0.99] ${
                i < arr.length - 1 ? 'border-b border-surface-200 dark:border-surface-800' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/30 flex items-center justify-center">
                <item.icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-surface-900 dark:text-surface-50">{item.label}</p>
                <p className="text-xs text-surface-500">{item.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-surface-400 flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Appearance */}
      <div className="space-y-4">
        <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider px-1">
          Preferences
        </p>
        <div className="bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-800 rounded-2xl overflow-hidden">
          <div className="p-4 flex items-center justify-between hover:bg-surface-100/50 dark:hover:bg-surface-800/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-surface-200 dark:bg-surface-800 flex items-center justify-center">
                <Moon className="w-5 h-5 text-surface-600 dark:text-surface-400" />
              </div>
              <div>
                <p className="font-medium text-sm text-surface-900 dark:text-surface-50">Dark Mode</p>
                <p className="text-xs text-surface-500">Enable dark theme globally</p>
              </div>
            </div>
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
    </div>
  );
}
