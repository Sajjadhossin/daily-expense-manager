'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { format, isToday, isYesterday, parseISO, startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { Plus, Edit2, Trash2, ArrowUpRight, ArrowDownRight, Search, FileText, BookOpen, ChevronDown, Check, Filter, X } from 'lucide-react';
import * as Icons from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { BottomSheet } from '@/components/ui/bottom-sheet';

import { TransactionsSkeleton } from '@/components/ui/page-skeletons';
import { useBookStore } from '@/lib/store/book.store';
import { useBooks } from '@/lib/hooks/use-books';
import { formatCurrency, formatSignedCurrency, formatCompactCurrency, getCurrencySymbol } from '@/lib/utils/currency';
import { useTransactions, useDeleteTransaction } from '@/lib/hooks/use-transactions';
import { useCategories } from '@/lib/hooks/use-categories';
import { Transaction } from '../../../generated/client';

export default function TransactionsPage() {
  const router = useRouter();
  
  const { activeBookId, setActiveBook } = useBookStore();
  const { data: books } = useBooks();
  const { data: categories } = useCategories();
  const { data: rawTransactions, isLoading } = useTransactions(activeBookId);
  const deleteTransaction = useDeleteTransaction();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBookSelectorOpen, setIsBookSelectorOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategoryId, setFilterCategoryId] = useState<string>('all');
  const [filterDateRange, setFilterDateRange] = useState<string>('all');

  const activeBook = (books || []).find(b => b.id === activeBookId);

  const allTransactions = rawTransactions || [];

  const activeFilterCount = [
    filterType !== 'all',
    filterCategoryId !== 'all',
    filterDateRange !== 'all',
  ].filter(Boolean).length;

  const clearFilters = () => {
    setFilterType('all');
    setFilterCategoryId('all');
    setFilterDateRange('all');
    setSearchQuery('');
  };

  // Get date range bounds
  const getFilterDateBounds = () => {
    const now = new Date();
    switch (filterDateRange) {
      case 'today': return { start: startOfDay(now), end: endOfDay(now) };
      case 'yesterday': return { start: startOfDay(subDays(now, 1)), end: endOfDay(subDays(now, 1)) };
      case 'this_week': return { start: startOfWeek(now, { weekStartsOn: 0 }), end: endOfWeek(now, { weekStartsOn: 0 }) };
      case 'this_month': return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'last_month': return { start: startOfMonth(subMonths(now, 1)), end: endOfMonth(subMonths(now, 1)) };
      default: return null;
    }
  };

  // Combined filter
  const filtered = useMemo(() => {
    const dateBounds = getFilterDateBounds();

    return allTransactions.filter(tx => {
      // Type filter
      if (filterType !== 'all' && tx.type !== filterType) return false;

      // Category filter
      if (filterCategoryId !== 'all' && tx.categoryId !== filterCategoryId) return false;

      // Date range filter
      if (dateBounds) {
        const txDate = new Date(tx.date);
        if (txDate < dateBounds.start || txDate > dateBounds.end) return false;
      }

      // Text search
      if (searchQuery) {
        const cat = (categories || []).find((c: any) => c.id === tx.categoryId);
        const q = searchQuery.toLowerCase();
        const matchesText =
          (tx.note && tx.note.toLowerCase().includes(q)) ||
          (cat && cat.name.toLowerCase().includes(q)) ||
          tx.amount.toString().includes(q);
        if (!matchesText) return false;
      }

      return true;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allTransactions, filterType, filterCategoryId, filterDateRange, searchQuery, categories]);

  // Group by Date helper
  const groupedTransactions = filtered.reduce((groups: Record<string, Transaction[]>, tx) => {
    const dateStr = format(new Date(tx.date), 'yyyy-MM-dd');
    if (!groups[dateStr]) {
      groups[dateStr] = [];
    }
    groups[dateStr].push(tx);
    return groups;
  }, {});

  const dates = Object.keys(groupedTransactions).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  // Delete Action
  const handleDelete = async () => {
    if (selectedTx) {
      try {
        await deleteTransaction.mutateAsync(selectedTx.id);
        setIsDeleteDialogOpen(false);
        setIsActionsOpen(false);
        setSelectedTx(null);
      } catch (error) {
        console.error("Failed to delete", error);
      }
    }
  };

  if (isLoading) {
    return <TransactionsSkeleton />;
  }

  // Click Action
  const handleTransactionClick = (tx: Transaction) => {
    setSelectedTx(tx);
    setIsActionsOpen(true);
  };

  const handleEdit = () => {
    if (selectedTx) {
      router.push(`/transactions/add?edit=${selectedTx.id}&type=${selectedTx.type}`);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 fade-in max-w-4xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-surface-50">Transactions</h1>
          <p className="text-xs sm:text-sm text-surface-500">View and manage ledger entries.</p>
        </div>

        <Button onClick={() => router.push('/transactions/add')} className="gap-2 hidden sm:flex shrink-0">
          <Plus className="w-4 h-4" />
          Add New
        </Button>
      </div>

      {/* Book Selector + Search + Filter */}
      <div className="space-y-2">
        {/* Book Selector */}
        <div className="relative">
          <button
            onClick={() => setIsBookSelectorOpen(!isBookSelectorOpen)}
            className="w-full h-9 sm:h-12 flex items-center gap-2 px-2.5 sm:px-4 rounded-lg sm:rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900/50 hover:bg-surface-100 dark:hover:bg-surface-800/50 transition-colors text-left"
          >
            <BookOpen className="w-4 h-4 text-primary-600 dark:text-primary-400 shrink-0" />
            <p className="text-xs sm:text-sm font-medium text-surface-900 dark:text-surface-50 truncate flex-1">
              {activeBook?.name || 'Select a book'}
            </p>
            <ChevronDown className={`w-3.5 h-3.5 text-surface-400 shrink-0 transition-transform ${isBookSelectorOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown */}
          {isBookSelectorOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setIsBookSelectorOpen(false)} />
              <div
                className="absolute top-full left-0 right-0 sm:right-auto sm:min-w-[240px] mt-2 z-40 rounded-xl border border-surface-200 dark:border-surface-800 shadow-lg overflow-hidden"
                style={{ backgroundColor: 'var(--bg-card)' }}
              >
                {(books || []).length === 0 ? (
                  <div className="p-4 text-center">
                    <p className="text-sm text-surface-500 mb-3">No books yet</p>
                    <Button size="sm" onClick={() => { setIsBookSelectorOpen(false); router.push('/books'); }}>
                      Create Book
                    </Button>
                  </div>
                ) : (
                  <div className="py-1 max-h-64 overflow-y-auto">
                    {(books || []).map((book) => (
                      <button
                        key={book.id}
                        onClick={() => {
                          setActiveBook(book.id);
                          setIsBookSelectorOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                          book.id === activeBookId
                            ? 'bg-primary-50 dark:bg-primary-950/30'
                            : 'hover:bg-surface-100 dark:hover:bg-surface-800/50'
                        }`}
                      >
                        <BookOpen className={`w-4 h-4 flex-shrink-0 ${
                          book.id === activeBookId
                            ? 'text-primary-600 dark:text-primary-400'
                            : 'text-surface-400'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${
                            book.id === activeBookId
                              ? 'text-primary-700 dark:text-primary-300'
                              : 'text-surface-900 dark:text-surface-50'
                          }`}>
                            {book.name}
                          </p>
                          <p className="text-xs text-surface-500 tabular-nums">
                            Balance: {formatCurrency(book.balance, book.currency)}
                          </p>
                        </div>
                        {book.id === activeBookId && (
                          <Check className="w-4 h-4 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Search + Filter row */}
        <div className="flex items-stretch gap-2">
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-3.5 h-3.5" />}
            className="flex-1 !h-9 sm:!h-12 text-xs sm:text-sm"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-2.5 sm:px-4 h-9 sm:h-12 rounded-lg sm:rounded-xl border text-xs sm:text-sm font-medium transition-colors shrink-0 ${
              activeFilterCount > 0
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-300'
                : 'border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900/50 text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800/50'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full gradient-primary text-white text-[9px] sm:text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="rounded-2xl border border-surface-200 dark:border-surface-800 p-4 space-y-4" style={{ backgroundColor: 'var(--bg-card)' }}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-surface-900 dark:text-surface-50">Filters</p>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Type Filter */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-surface-500">Type</p>
            <div className="flex gap-2">
              {(['all', 'income', 'expense'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    filterType === t
                      ? t === 'income'
                        ? 'bg-income-100 dark:bg-income-900/30 text-income-700 dark:text-income-300'
                        : t === 'expense'
                        ? 'bg-expense-100 dark:bg-expense-900/30 text-expense-700 dark:text-expense-300'
                        : 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'bg-surface-100 dark:bg-surface-800 text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
                  }`}
                >
                  {t === 'all' ? 'All' : t === 'income' ? 'Income' : 'Expense'}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-surface-500">Date Range</p>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'All Time' },
                { value: 'today', label: 'Today' },
                { value: 'yesterday', label: 'Yesterday' },
                { value: 'this_week', label: 'This Week' },
                { value: 'this_month', label: 'This Month' },
                { value: 'last_month', label: 'Last Month' },
              ].map((d) => (
                <button
                  key={d.value}
                  onClick={() => setFilterDateRange(d.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    filterDateRange === d.value
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'bg-surface-100 dark:bg-surface-800 text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-surface-500">Category</p>
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
              <button
                onClick={() => setFilterCategoryId('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filterCategoryId === 'all'
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'bg-surface-100 dark:bg-surface-800 text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
                }`}
              >
                All
              </button>
              {(categories || [])
                .filter((c: any) => filterType === 'all' || c.type === filterType)
                .map((cat: any) => (
                  <button
                    key={cat.id}
                    onClick={() => setFilterCategoryId(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      filterCategoryId === cat.id
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                        : 'bg-surface-100 dark:bg-surface-800 text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter Summary Bar */}
      {activeBookId && (searchQuery || activeFilterCount > 0) && filtered.length > 0 && (
        <div className="flex items-center justify-between px-3 py-2 rounded-lg sm:rounded-xl bg-primary-50 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-800/50">
          <p className="text-xs font-medium text-primary-700 dark:text-primary-300">
            {filtered.length} transaction{filtered.length !== 1 ? 's' : ''} found
          </p>
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        </div>
      )}

      {!activeBookId ? (
        <EmptyState
          icon={<BookOpen className="w-9 h-9 text-primary-500 dark:text-primary-400" />}
          title="No Cash Book Selected"
          description="Select a cash book from the dropdown above to view your transactions."
          actionLabel={(books || []).length === 0 ? 'Create a Book' : undefined}
          onAction={(books || []).length === 0 ? () => router.push('/books') : undefined}
        />
      ) : allTransactions.length === 0 ? (
        <EmptyState
          title="No transactions yet"
          description="Your ledger is completely empty. Start logging your income or expenses."
          actionLabel="Add Transaction"
          onAction={() => router.push('/transactions/add')}
        />
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-surface-500">
            {searchQuery || activeFilterCount > 0
              ? 'No transactions match your filters.'
              : 'No transactions found.'}
          </p>
          {(searchQuery || activeFilterCount > 0) && (
            <button
              onClick={clearFilters}
              className="mt-3 text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-5 sm:space-y-8">
          {dates.map((dateStr) => {
            const dateObj = parseISO(dateStr);
            let dateLabel = format(dateObj, 'MMM dd, yyyy');
            if (isToday(dateObj)) dateLabel = 'Today';
            else if (isYesterday(dateObj)) dateLabel = 'Yesterday';

            // Calculate daily total
            const dayTotal = groupedTransactions[dateStr].reduce((sum, tx) => {
              return tx.type === 'income' ? sum + tx.amount : sum - tx.amount;
            }, 0);

            return (
              <div key={dateStr} className="space-y-2">
                {/* Date Header */}
                <div className="flex items-center justify-between border-b border-surface-200 dark:border-surface-800 pb-1.5">
                  <h3 className="font-semibold text-xs sm:text-sm text-surface-900 dark:text-surface-50">
                    {dateLabel}
                  </h3>
                  <p className={`text-xs sm:text-sm font-semibold tabular-nums ${dayTotal < 0 ? 'text-expense-600 dark:text-expense-400' : 'text-income-600 dark:text-income-400'}`}>
                    <span className="sm:hidden">{formatCompactCurrency(dayTotal, activeBook?.currency)}</span>
                    <span className="hidden sm:inline">{formatSignedCurrency(dayTotal, activeBook?.currency)}</span>
                  </p>
                </div>

                {/* Daily List */}
                <div className="bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-800 rounded-xl sm:rounded-2xl overflow-hidden">
                  {groupedTransactions[dateStr].map((tx, idx) => {
                    const category = (categories || []).find((c: any) => c.id === tx.categoryId);
                    const isExpense = tx.type === 'expense';
                    
                    // Safely grab lucide icon or fallback
                    const IconComponent = category?.icon && (Icons as any)[category.icon] 
                      ? (Icons as any)[category.icon] 
                      : FileText;

                    return (
                      <div 
                        key={tx.id}
                        onClick={() => handleTransactionClick(tx)}
                        className={`flex items-center justify-between px-2.5 py-2.5 sm:p-4 cursor-pointer hover:bg-surface-100/50 dark:hover:bg-surface-800/50 transition-colors ${
                          idx !== groupedTransactions[dateStr].length - 1 ? 'border-b border-surface-200 dark:border-surface-800' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center text-white shrink-0 ${category?.color || 'bg-surface-400'}`}>
                            <IconComponent className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-xs sm:text-sm text-surface-900 dark:text-surface-50 capitalize truncate">
                              {category?.name || 'Uncategorized'}
                            </p>
                            <p className="text-[10px] sm:text-xs text-surface-500 truncate mt-0.5">
                              {format(new Date(tx.date), 'hh:mm a')}
                              {tx.note && ` · ${tx.note}`}
                            </p>
                          </div>
                        </div>

                        <div className="text-right pl-1 shrink-0">
                          <p className={`font-bold text-xs sm:text-sm tabular-nums ${isExpense ? 'text-surface-900 dark:text-surface-50' : 'text-income-600 dark:text-income-400'}`}>
                            <span className="sm:hidden">{formatCompactCurrency(isExpense ? -tx.amount : tx.amount, activeBook?.currency)}</span>
                            <span className="hidden sm:inline">{formatSignedCurrency(isExpense ? -tx.amount : tx.amount, activeBook?.currency)}</span>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Action Button for Mobile */}
      <button 
        onClick={() => router.push('/transactions/add')}
        className="fixed bottom-28 right-4 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center sm:hidden z-40 active:scale-95 transition-transform"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Transaction Action Sheet (Tap to Edit/Delete) */}
      <BottomSheet 
        isOpen={isActionsOpen} 
        onClose={() => setIsActionsOpen(false)}
      >
        {selectedTx && (
          <div className="space-y-6">
            <div className="text-center pb-4 border-b border-surface-100 dark:border-surface-800">
              <p className="text-sm font-medium text-surface-500 uppercase tracking-wider mb-2">Options</p>
              <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-50">
                {formatCurrency(selectedTx.amount, activeBook?.currency)}
              </h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                size="lg" 
                className="gap-2 h-14"
                onClick={handleEdit}
              >
                <Edit2 className="w-5 h-5" />
                Edit
              </Button>
              <Button 
                variant="destructive" 
                size="lg" 
                className="gap-2 h-14"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="w-5 h-5" />
                Delete
              </Button>
            </div>
            
            <p className="text-xs text-center text-surface-400 mt-4">
              Logged on {format(new Date(selectedTx.date), 'MMM dd, yyyy')}
            </p>
          </div>
        )}
      </BottomSheet>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Transaction"
        description="Are you sure you want to delete this transaction? This action will immediately adjust your cash book balance."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
