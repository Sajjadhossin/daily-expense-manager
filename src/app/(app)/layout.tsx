'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Plus,
  FileBarChart,
  Settings,
  BookOpen,
  Tags,
  Trash2,
  User,
  ChevronLeft,
  X,
  TrendingUp,
  TrendingDown,
  LogOut,
} from 'lucide-react';
import { AuthGuard } from '@/components/auth/auth-guard';
import { signOut } from 'next-auth/react';
import { useProfile } from '@/lib/hooks/use-profile';
import { useBooks } from '@/lib/hooks/use-books';
import { useBookStore } from '@/lib/store/book.store';

/* ============================================
   Navigation Items
   ============================================ */
const mobileNavItems = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '#add', label: 'Add', icon: Plus, isAction: true },
  { href: '/reports', label: 'Reports', icon: FileBarChart },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const sidebarNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/books', label: 'Books', icon: BookOpen },
  { href: '/categories', label: 'Categories', icon: Tags },
  { href: '/reports', label: 'Reports', icon: FileBarChart },
  { href: '/summary', label: 'Summary', icon: FileBarChart },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/profile', label: 'Profile', icon: User },
];

/* ============================================
   Mobile Bottom Navigation
   ============================================ */
function MobileBottomNav({ onAddClick }: { onAddClick: () => void }) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t lg:hidden"
      style={{
        background: 'var(--nav-bg)',
        borderColor: 'var(--nav-border)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div className="flex items-center justify-around px-2 pb-safe">
        {mobileNavItems.map((item) => {
          const isActive = item.href !== '#add' && pathname.startsWith(item.href);
          const Icon = item.icon;

          if (item.isAction) {
            return (
              <button
                key={item.href}
                onClick={onAddClick}
                className="flex flex-col items-center justify-center -mt-5"
                aria-label="Add transaction"
              >
                <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center shadow-lg shadow-primary-500/30 active:scale-95 transition-transform">
                  <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-2 px-3 touch-target transition-colors ${isActive
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-surface-400 dark:text-surface-500'
                }`}
            >
              <Icon className="w-5 h-5 mb-0.5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/* ============================================
   Desktop Sidebar
   ============================================ */
function DesktopSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const { data: user } = useProfile();
  const { data: books } = useBooks();
  const { activeBookId } = useBookStore();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const activeBook = (books || []).find(b => b.id === activeBookId);

  return (
    <aside
      className={`hidden lg:flex flex-col fixed top-0 left-0 h-full z-40 border-r transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-[260px]'
        }`}
      style={{
        background: 'var(--bg-card)',
        borderColor: 'var(--border-color)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="overflow-hidden"
          >
            <h1 className="font-bold text-sm whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
              Daily Expense
            </h1>
            <p className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
              Manager
            </p>
          </motion.div>
        )}
        <button
          onClick={onToggle}
          className="ml-auto p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft
            className={`w-4 h-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
            style={{ color: 'var(--text-secondary)' }}
          />
        </button>
      </div>

      {/* Active Book Indicator */}
      <div className="px-4 py-3 border-b border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-900/20">
        <Link href="/books" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-surface-200 dark:bg-surface-800 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 transition-colors">
            <BookOpen className="w-4 h-4 text-surface-600 dark:text-surface-400 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden flex-1">
              <p className="text-[10px] uppercase font-semibold text-surface-400 tracking-wider">Active Book</p>
              <p className="text-sm font-medium text-surface-900 dark:text-surface-50 truncate transition-colors group-hover:text-primary-600 dark:group-hover:text-primary-400">
                {activeBook?.name || 'No Book Selected'}
              </p>
            </div>
          )}
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {sidebarNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive
                  ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300'
                  : 'hover:bg-surface-100 dark:hover:bg-surface-800'
                }`}
              style={!isActive ? { color: 'var(--text-secondary)' } : undefined}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 ${isActive ? '' : 'group-hover:text-primary-600 dark:group-hover:text-primary-400'
                  }`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm font-medium whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
              {isActive && !collapsed && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Add Transaction Button & Logout */}
      <div className="p-3 border-t space-y-2" style={{ borderColor: 'var(--border-color)' }}>
        <Link
          href="/transactions/add"
          className={`flex items-center gap-3 px-3 py-3 rounded-xl gradient-primary text-white font-medium transition-all hover:shadow-lg hover:shadow-primary-500/25 active:scale-[0.98] ${collapsed ? 'justify-center' : ''
            }`}
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
          {!collapsed && <span className="text-sm">Add Transaction</span>}
        </Link>
        <button
          onClick={handleLogout}
          className={`flex w-full items-center gap-3 px-3 py-3 rounded-xl border border-expense-200 dark:border-expense-800 bg-expense-50 dark:bg-expense-900/10 text-expense-600 dark:text-expense-400 font-medium transition-all hover:bg-expense-100 dark:hover:bg-expense-900/30 active:scale-[0.98] ${collapsed ? 'justify-center' : ''
            }`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm whitespace-nowrap">Log Out</span>}
        </button>
      </div>
    </aside>
  );
}

/* ============================================
   Add Actions Bottom Sheet
   ============================================ */
function AddActionsSheet({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-50 lg:hidden"
          />
          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl p-6 pb-safe lg:hidden"
            style={{ background: 'var(--bg-card)' }}
          >
            {/* Drag handle */}
            <div className="w-10 h-1 rounded-full bg-surface-300 dark:bg-surface-600 mx-auto mb-6" />

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                Add Transaction
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/transactions/add?type=income"
                onClick={onClose}
                className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-income-200 dark:border-income-800 bg-income-50 dark:bg-income-950/30 hover:bg-income-100 dark:hover:bg-income-900/30 transition-all active:scale-[0.97]"
              >
                <div className="w-14 h-14 rounded-2xl gradient-income flex items-center justify-center">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-income-700 dark:text-income-300 text-sm">
                    Add Income
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    Cash In
                  </p>
                </div>
              </Link>

              <Link
                href="/transactions/add?type=expense"
                onClick={onClose}
                className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-expense-200 dark:border-expense-800 bg-expense-50 dark:bg-expense-950/30 hover:bg-expense-100 dark:hover:bg-expense-900/30 transition-all active:scale-[0.97]"
              >
                <div className="w-14 h-14 rounded-2xl gradient-expense flex items-center justify-center">
                  <TrendingDown className="w-7 h-7 text-white" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-expense-700 dark:text-expense-300 text-sm">
                    Add Expense
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    Cash Out
                  </p>
                </div>
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ============================================
   App Layout (Authenticated Shell)
   ============================================ */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showAddSheet, setShowAddSheet] = useState(false);

  return (
    <AuthGuard>
      <div className="flex min-h-dvh">
        {/* Desktop Sidebar */}
        <DesktopSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main Content */}
        <main
          className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'
            } pb-24 lg:pb-8`}
        >
          <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-8 py-4 lg:py-6">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav onAddClick={() => setShowAddSheet(true)} />

        {/* Add Actions Bottom Sheet */}
        <AddActionsSheet isOpen={showAddSheet} onClose={() => setShowAddSheet(false)} />
      </div>
    </AuthGuard>
  );
}
