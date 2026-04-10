'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { LogOut, Moon, ChevronRight, ChevronLeft, BookOpen, Tags, FileBarChart, Info, Coins, Check, Search, X } from 'lucide-react';

import { signOut } from 'next-auth/react';
import { useProfile } from '@/lib/hooks/use-profile';
import { useBookStore } from '@/lib/store/book.store';
import { useBooks, useUpdateBook } from '@/lib/hooks/use-books';
import { useToast } from '@/components/ui/toast';
import { useTheme } from '@/lib/providers';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { getSupportedCurrencies, getCurrencySymbol } from '@/lib/utils/currency';
import { useState, useMemo, useRef, useEffect } from 'react';

export default function SettingsPage() {
  const router = useRouter();
  const toast = useToast();
  const { data: user } = useProfile();
  const { theme, toggleTheme } = useTheme();
  
  const { activeBookId } = useBookStore();
  const { data: books } = useBooks();
  const updateBook = useUpdateBook();
  const activeBook = (books || []).find(b => b.id === activeBookId);

  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [currencySearch, setCurrencySearch] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const currencies = getSupportedCurrencies();
  const filteredCurrencies = useMemo(() => {
    if (!currencySearch.trim()) return currencies;
    const q = currencySearch.toLowerCase();
    return currencies.filter(
      (c) => c.value.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.symbol.includes(q)
    );
  }, [currencies, currencySearch]);

  useEffect(() => {
    if (showCurrencyPicker && searchInputRef.current) {
      searchInputRef.current.focus();
    }
    if (!showCurrencyPicker) setCurrencySearch('');
  }, [showCurrencyPicker]);

  const handleCurrencyChange = async (currency: string) => {
    if (!activeBookId || !activeBook) return;
    try {
      await updateBook.mutateAsync({ id: activeBookId, data: { name: activeBook.name, currency } });
      toast.success(`Currency changed to ${currency}`);
    } catch {
      toast.error('Failed to update currency');
    }
    setShowCurrencyPicker(false);
  };

  const handleLogout = async () => {
    toast.success('Logging out...');
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className="space-y-6 fade-in max-w-2xl">
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.back()}
          className="p-1.5 -ml-1.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors lg:hidden"
        >
          <ChevronLeft className="w-5 h-5 text-surface-600 dark:text-surface-400" />
        </button>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">Settings</h1>
      </div>

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

          {/* Currency */}
          <div className="border-t border-surface-200 dark:border-surface-800">
            <button
              onClick={() => activeBook && setShowCurrencyPicker(true)}
              className="w-full p-4 flex items-center justify-between hover:bg-surface-100/50 dark:hover:bg-surface-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface-200 dark:bg-surface-800 flex items-center justify-center">
                  <Coins className="w-5 h-5 text-surface-600 dark:text-surface-400" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm text-surface-900 dark:text-surface-50">Currency</p>
                  <p className="text-xs text-surface-500">
                    {activeBook ? `${getCurrencySymbol(activeBook.currency)} ${activeBook.currency}` : 'Select a book first'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-surface-400 flex-shrink-0" />
            </button>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider px-1">
          About
        </p>
        <div className="bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-800 rounded-2xl overflow-hidden">
          <button
            onClick={() => router.push('/about')}
            className="w-full p-4 flex items-center gap-3 text-left hover:bg-surface-100/50 dark:hover:bg-surface-800/50 transition-colors active:scale-[0.99]"
          >
            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/30 flex items-center justify-center">
              <Info className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-surface-900 dark:text-surface-50">About & Credits</p>
              <p className="text-xs text-surface-500">App info, developer, tech stack</p>
            </div>
            <ChevronRight className="w-4 h-4 text-surface-400 flex-shrink-0" />
          </button>
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

      {/* Currency Picker Modal */}
      {showCurrencyPicker && activeBook && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCurrencyPicker(false)} />
          <div className="relative w-full sm:max-w-md bg-white dark:bg-surface-900 rounded-t-2xl sm:rounded-2xl max-h-[80vh] flex flex-col animate-in slide-in-from-bottom duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50">Select Currency</h3>
              <button
                onClick={() => setShowCurrencyPicker(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              >
                <X className="w-5 h-5 text-surface-500" />
              </button>
            </div>

            {/* Search */}
            <div className="px-4 pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search currency..."
                  value={currencySearch}
                  onChange={(e) => setCurrencySearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-surface-50 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Currency List */}
            <div className="flex-1 overflow-y-auto px-2 pb-4">
              {filteredCurrencies.length === 0 ? (
                <p className="text-center text-sm text-surface-400 py-8">No currencies found</p>
              ) : (
                filteredCurrencies.map((c) => {
                  const isActive = c.value === activeBook.currency;
                  return (
                    <button
                      key={c.value}
                      onClick={() => handleCurrencyChange(c.value)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${
                        isActive
                          ? 'bg-primary-50 dark:bg-primary-950/30'
                          : 'hover:bg-surface-100 dark:hover:bg-surface-800/50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold ${
                        isActive
                          ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300'
                          : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400'
                      }`}>
                        {c.symbol}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${
                          isActive
                            ? 'text-primary-700 dark:text-primary-300'
                            : 'text-surface-900 dark:text-surface-50'
                        }`}>
                          {c.value}
                        </p>
                        <p className="text-xs text-surface-500 truncate">{c.name}</p>
                      </div>
                      {isActive && (
                        <Check className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

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
