'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { Plus, ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Clock, ArrowRight, FileText, ChevronLeft } from 'lucide-react';
import * as Icons from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { useSession } from 'next-auth/react';
import { useBookStore } from '@/lib/store/book.store';
import { useBooks } from '@/lib/hooks/use-books';
import { useCategories } from '@/lib/hooks/use-categories';
import { useTransactions } from '@/lib/hooks/use-transactions';
import { getDateRange } from '@/lib/utils/date';
import { formatCurrency, formatSignedCurrency } from '@/lib/utils/currency';
import { EmptyState } from '@/components/ui/empty-state';
import { DashboardSkeleton } from '@/components/ui/page-skeletons';
import { SummaryCards } from '@/components/summary/SummaryCards';


export default function DashboardPage() {
  const router = useRouter();
  
  const { data: session } = useSession();
  const user = session?.user;

  const { activeBookId } = useBookStore();

  const { data: books, isLoading: booksLoading } = useBooks();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: transactions, isLoading: transactionsLoading } = useTransactions(activeBookId);

  const isLoading = booksLoading || categoriesLoading || (activeBookId ? transactionsLoading : false);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const activeBook = books?.find((b) => b.id === activeBookId) || books?.[0];

  // If no book active or existing
  if (!activeBook) {
    return (
      <EmptyState 
        title="Welcome to Daily Expense Manager"
        description="Let's get started by creating or selecting a cash book to organize your finances."
        actionLabel="Go to Books"
        onAction={() => router.push('/books')}
      />
    );
  }

  // ---- RECENT TRANSACTIONS ----
  const allTransactions = transactions || [];
  const recentTxs = allTransactions.slice(0, 5); // Last 5

  // ---- THIS MONTH SUMMARY ----
  const thisMonthRange = getDateRange('this_month');
  const thisMonthTxs = allTransactions.filter(tx => {
    const txDate = parseISO(tx.date.toString());
    return txDate >= thisMonthRange.startDate && txDate <= thisMonthRange.endDate;
  });

  const thisMonthIncome = thisMonthTxs
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const thisMonthExpense = thisMonthTxs
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6 lg:space-y-8 fade-in max-w-5xl">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-surface-900 dark:text-surface-50">
            Welcome, {user?.name?.split(' ')[0] || 'User'} 👋
          </h1>
          <div className="text-sm text-surface-500 mt-1 flex items-center gap-2">
            Currently managing 
            <Badge variant="secondary" className="px-2 py-0.5 rounded-lg text-xs font-semibold">
              {activeBook.name}
            </Badge>
          </div>
        </div>

        {/* Quick Actions Desktop */}
        <div className="hidden sm:flex items-center gap-3">
          <Button 
            variant="outline"
            className="gap-2 border-expense-200 text-expense-600 hover:bg-expense-50 dark:border-expense-900/50 dark:text-expense-400 dark:hover:bg-expense-900/20"
            onClick={() => router.push('/transactions/add?type=expense')}
          >
            <ArrowDownRight className="w-4 h-4" />
            Add Expense
          </Button>
          <Button 
            className="gap-2 bg-income-600 hover:bg-income-700 text-white"
            onClick={() => router.push('/transactions/add?type=income')}
          >
            <ArrowUpRight className="w-4 h-4" />
            Add Income
          </Button>
        </div>
      </div>

      {/* Main Ledger Status */}
      <Card className="relative overflow-hidden p-6 md:p-8 bg-primary-600 dark:bg-primary-700 text-white border-none shadow-2xl shadow-primary-600/25">
        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/[0.06] rounded-full" />
        <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-white/[0.04] rounded-full" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                <Icons.Wallet className="w-4 h-4 text-white" />
              </div>
              <p className="text-white/90 font-bold text-xs uppercase tracking-[0.15em]">
                Ledger Balance
              </p>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tabular-nums tracking-tight text-white">
              {formatCurrency(activeBook.balance, activeBook.currency)}
            </h2>
            <p className="text-white/60 text-xs sm:text-sm mt-2 max-w-xs leading-relaxed">
              Available funds in {activeBook.name}.
            </p>
          </div>

          <div className="w-full md:w-[280px] shrink-0 grid grid-cols-2 md:grid-cols-1 gap-3">
            <div className="rounded-xl bg-white dark:bg-surface-800 p-3.5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-income-100 dark:bg-income-900/30 flex items-center justify-center">
                  <TrendingUp className="w-3 h-3 text-income-600 dark:text-income-400" />
                </div>
                <span className="text-xs text-surface-500 dark:text-surface-400 font-medium">Month In</span>
              </div>
              <p className="text-sm font-bold text-income-600 dark:text-income-400 tabular-nums">
                {formatSignedCurrency(thisMonthIncome, activeBook.currency)}
              </p>
            </div>
            <div className="rounded-xl bg-white dark:bg-surface-800 p-3.5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-expense-100 dark:bg-expense-900/30 flex items-center justify-center">
                  <TrendingDown className="w-3 h-3 text-expense-600 dark:text-expense-400" />
                </div>
                <span className="text-xs text-surface-500 dark:text-surface-400 font-medium">Month Out</span>
              </div>
              <p className="text-sm font-bold text-expense-600 dark:text-expense-400 tabular-nums">
                {formatSignedCurrency(-thisMonthExpense, activeBook.currency)}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Modular Desktop-Only Sub-Summary */}
      <div className="hidden lg:block">
        <h3 className="font-bold text-surface-900 dark:text-surface-50 mb-3 ml-1">Current Month Overview</h3>
        <SummaryCards income={thisMonthIncome} expense={thisMonthExpense} currency={activeBook.currency} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Quick Actions strictly Mobile */}
        <div className="lg:hidden grid grid-cols-2 gap-3">
          <Button 
            size="lg"
            variant="outline"
            className="gap-2 h-14 border-expense-200 text-expense-600 hover:bg-expense-50 dark:border-expense-900/50 dark:text-expense-400 dark:hover:bg-expense-900/20 shadow-sm"
            onClick={() => router.push('/transactions/add?type=expense')}
          >
            <TrendingDown className="w-5 h-5" />
            Expense
          </Button>
          <Button 
            size="lg"
            className="gap-2 h-14 bg-income-600 hover:bg-income-700 text-white shadow-sm shadow-income-600/20"
            onClick={() => router.push('/transactions/add?type=income')}
          >
            <TrendingUp className="w-5 h-5" />
            Income
          </Button>
        </div>

        {/* Recent Transactions Focus */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-surface-900 dark:text-surface-50 text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-500" />
              Recent Transactions
            </h3>
            {recentTxs.length > 0 && (
              <Link 
                href="/transactions" 
                className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1 group"
              >
                View All
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </div>

          <Card className="overflow-hidden">
            {recentTxs.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-4 text-surface-400">
                  <FileText className="w-8 h-8" />
                </div>
                <p className="font-semibold text-surface-900 dark:text-surface-50">No recent activity</p>
                <p className="text-sm text-surface-500 mt-1 mb-4">You haven't added any transactions yet.</p>
                <Button size="sm" onClick={() => router.push('/transactions/add')}>
                  Add First Transaction
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-surface-100 dark:divide-surface-800/50">
                {recentTxs.map((tx) => {
                  const category = (categories || []).find((c: any) => c.id === tx.categoryId);
                  const isExpense = tx.type === 'expense';
                  const IconComponent = category?.icon && (Icons as any)[category.icon] 
                    ? (Icons as any)[category.icon] 
                    : FileText;

                  return (
                    <div 
                      key={tx.id}
                      onClick={() => router.push('/transactions')}
                      className="p-4 flex items-center justify-between hover:bg-surface-50/50 dark:hover:bg-surface-900/50 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 ${category?.color || 'bg-surface-400'}`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1 overflow-hidden">
                          <p className="font-semibold text-sm text-surface-900 dark:text-surface-50 capitalize truncate">
                            {category?.name || 'Uncategorized'}
                          </p>
                          <p className="text-xs text-surface-500 truncate mt-0.5">
                            {format(new Date(tx.date), 'MMM dd, hh:mm a')}
                            {tx.note && ` · ${tx.note}`}
                          </p>
                        </div>
                      </div>

                      <div className="text-right pl-2 shrink-0">
                        <p className={`font-bold text-sm tabular-nums ${isExpense ? 'text-surface-900 dark:text-surface-50' : 'text-income-600 dark:text-income-400'}`}>
                          {formatSignedCurrency(isExpense ? -tx.amount : tx.amount, activeBook.currency)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Action Suggestion Module */}
        <div className="space-y-4">
          <h3 className="font-bold text-surface-900 dark:text-surface-50 text-lg">Quick Links</h3>
          <div className="grid grid-cols-1 gap-3">
            {[
              { title: 'Reports', desc: 'Dive into analytics', href: '/reports', color: 'bg-indigo-50 dark:bg-indigo-950/20', text: 'text-indigo-600 dark:text-indigo-400', icon: 'FileBarChart' },
              { title: 'Summary', desc: 'Overview of your finances', href: '/summary', color: 'bg-violet-50 dark:bg-violet-950/20', text: 'text-violet-600 dark:text-violet-400', icon: 'PieChart' },
              { title: 'Categories', desc: 'Manage your ledger tags', href: '/categories', color: 'bg-emerald-50 dark:bg-emerald-950/20', text: 'text-emerald-600 dark:text-emerald-400', icon: 'Tags' },
              { title: 'Books', desc: 'Switch or add ledgers', href: '/books', color: 'bg-rose-50 dark:bg-rose-950/20', text: 'text-rose-600 dark:text-rose-400', icon: 'Wallet' },
            ].map((link, i) => {
              const IconComp = (Icons as any)[link.icon] || FileText;
              return (
                <Link 
                  key={i} 
                  href={link.href}
                  className="flex items-center justify-between p-4 rounded-2xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900/50 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${link.color} ${link.text}`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-surface-900 dark:text-surface-50 text-sm">
                        {link.title}
                      </p>
                      <p className="text-xs text-surface-500">
                        {link.desc}
                      </p>
                    </div>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-surface-400 rotate-180 group-hover:text-surface-600 dark:group-hover:text-surface-200 transition-colors" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
