'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { Plus, Edit2, Trash2, ArrowUpRight, ArrowDownRight, Search, FileText, BookOpen, ChevronDown, Check } from 'lucide-react';
import * as Icons from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { BottomSheet } from '@/components/ui/bottom-sheet';

import { useBookStore } from '@/lib/store/book.store';
import { useBooks } from '@/lib/hooks/use-books';
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

  const activeBook = (books || []).find(b => b.id === activeBookId);

  const allTransactions = rawTransactions || [];

  // Filter 
  const filtered = allTransactions.filter(tx => {
    if (!searchQuery) return true;
    const cat = (categories || []).find((c: any) => c.id === tx.categoryId);
    const q = searchQuery.toLowerCase();
    return (
      (tx.note && tx.note.toLowerCase().includes(q)) || 
      (cat && cat.name.toLowerCase().includes(q)) ||
      tx.amount.toString().includes(q)
    );
  });

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
    return <div className="flex h-[50vh] items-center justify-center"><p className="text-surface-500">Loading transactions...</p></div>;
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
    <div className="space-y-6 fade-in max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">Transactions</h1>
          <p className="text-sm text-surface-500">View and manage ledger entries.</p>
        </div>

        <Button onClick={() => router.push('/transactions/add')} className="gap-2 hidden sm:flex shrink-0">
          <Plus className="w-4 h-4" />
          Add New
        </Button>
      </div>

      {/* Book Selector + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative">
          <button
            onClick={() => setIsBookSelectorOpen(!isBookSelectorOpen)}
            className="w-full sm:w-auto flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900/50 hover:bg-surface-100 dark:hover:bg-surface-800/50 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/30 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase font-semibold text-surface-400 tracking-wider leading-none mb-0.5">Cash Book</p>
              <p className="text-sm font-medium text-surface-900 dark:text-surface-50 truncate max-w-[160px]">
                {activeBook?.name || 'Select a book'}
              </p>
            </div>
            <ChevronDown className={`w-4 h-4 text-surface-400 flex-shrink-0 transition-transform ${isBookSelectorOpen ? 'rotate-180' : ''}`} />
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
                            Balance: ৳ {book.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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

        <Input
          placeholder="Search notes, categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search className="w-4 h-4" />}
          className="flex-1"
        />
      </div>

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
        <div className="py-12 text-center text-surface-500">
          No matches found for "{searchQuery}"
        </div>
      ) : (
        <div className="space-y-8">
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
              <div key={dateStr} className="space-y-3">
                {/* Date Header */}
                <div className="flex items-center justify-between border-b border-surface-200 dark:border-surface-800 pb-2">
                  <h3 className="font-semibold text-sm text-surface-900 dark:text-surface-50">
                    {dateLabel}
                  </h3>
                  <p className={`text-sm font-semibold tabular-nums ${dayTotal < 0 ? 'text-expense-600 dark:text-expense-400' : 'text-income-600 dark:text-income-400'}`}>
                    {dayTotal > 0 ? '+' : ''}{dayTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                {/* Daily List */}
                <div className="bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-800 rounded-2xl overflow-hidden">
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
                        className={`flex items-center justify-between p-4 cursor-pointer hover:bg-surface-100/50 dark:hover:bg-surface-800/50 transition-colors touch-target ${
                          idx !== groupedTransactions[dateStr].length - 1 ? 'border-b border-surface-200 dark:border-surface-800' : ''
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${category?.color || 'bg-surface-400'}`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-surface-900 dark:text-surface-50 capitalize">
                              {category?.name || 'Uncategorized'}
                            </p>
                            {tx.note && (
                              <p className="text-xs text-surface-500 line-clamp-1 max-w-[150px] sm:max-w-xs mt-0.5">
                                {tx.note}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <p className={`font-bold tabular-nums ${isExpense ? 'text-surface-900 dark:text-surface-50' : 'text-income-600 dark:text-income-400'}`}>
                            {isExpense ? '-' : '+'}৳ {tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-[10px] text-surface-400 font-medium">
                            {format(new Date(tx.date), 'hh:mm a')}
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
        className="fixed bottom-24 right-4 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center sm:hidden z-40 active:scale-95 transition-transform"
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
                ৳ {selectedTx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
