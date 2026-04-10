'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FileText, ChevronLeft, BookOpen, ChevronDown, Check } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { Calculator } from '@/components/ui/calculator';
import { DatePicker } from '@/components/ui/date-picker';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';

import { useBookStore } from '@/lib/store/book.store';
import { useBooks } from '@/lib/hooks/use-books';
import { useCategories } from '@/lib/hooks/use-categories';
import { useTransactions, useCreateTransaction, useUpdateTransaction } from '@/lib/hooks/use-transactions';
import { Transaction } from '@/generated/client';

type TransactionType = 'income' | 'expense';

function TransactionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  
  const { activeBookId, setActiveBook } = useBookStore();
  const { data: books } = useBooks();
  const { data: categories } = useCategories();
  const { data: transactions } = useTransactions(activeBookId);

  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();

  const editId = searchParams.get('edit');
  const initialType = (searchParams.get('type') as TransactionType) || 'expense';

  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState<number | ''>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [date, setDate] = useState<Date>(new Date());
  const [time, setTime] = useState<string>(format(new Date(), 'HH:mm'));
  const [note, setNote] = useState('');
  const [isBookSelectorOpen, setIsBookSelectorOpen] = useState(false);

  // Hydrate form if editing
  useEffect(() => {
    if (editId && transactions) {
      const tx = transactions.find((t) => t.id === editId);
      if (tx) {
        setType(tx.type as TransactionType);
        setAmount(tx.amount);
        setCategoryId(tx.categoryId);
        setDate(new Date(tx.date));
        setTime(tx.time || format(new Date(tx.date), 'HH:mm'));
        setNote(tx.note || '');
      }
    }
  }, [editId, transactions]);

  const activeBook = (books || []).find((b) => b.id === activeBookId);
  const availableCategories = (categories || []).filter((c) => c.type === type).sort((a, b) => a.order - b.order);

  // Map categories for Select component
  const categoryOptions = availableCategories.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const handleSave = async () => {
    if (!activeBook) {
      toast.error('No cash book selected');
      return;
    }
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!categoryId) {
      toast.error('Please select a category');
      return;
    }

    try {
      if (editId) {
        await updateTransaction.mutateAsync({
          id: editId,
          data: {
            type,
            amount: Number(amount),
            date: date.toISOString(),
            time,
            note,
            categoryId,
          }
        });
        toast.success('Transaction updated successfully');
      } else {
        await createTransaction.mutateAsync({
          bookId: activeBook.id,
          categoryId,
          type,
          amount: Number(amount),
          date: date.toISOString(),
          time,
          note,
        });
        toast.success('Transaction added successfully');
      }

      router.back();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save transaction');
    }
  };

  return (
    <div className="space-y-6 fade-in max-w-xl mx-auto pb-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="p-2 -ml-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-surface-600 dark:text-surface-400" />
        </button>
        <h1 className="text-xl font-bold text-surface-900 dark:text-surface-50">
          {editId ? 'Edit Transaction' : 'New Transaction'}
        </h1>
      </div>

      {/* Book Selector */}
      <div className="relative">
        <button
          onClick={() => setIsBookSelectorOpen(!isBookSelectorOpen)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900/50 hover:bg-surface-100 dark:hover:bg-surface-800/50 transition-colors"
        >
          <div className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-950/30 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-4.5 h-4.5 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-[10px] uppercase font-semibold text-surface-400 tracking-wider leading-none mb-0.5">Adding to Ledger</p>
            <p className="text-sm font-medium text-surface-900 dark:text-surface-50 truncate">
              {activeBook?.name || 'Select a book'}
            </p>
          </div>
          <ChevronDown className={`w-4 h-4 text-surface-400 flex-shrink-0 transition-transform ${isBookSelectorOpen ? 'rotate-180' : ''}`} />
        </button>

        {isBookSelectorOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setIsBookSelectorOpen(false)} />
            <div
              className="absolute top-full left-0 right-0 mt-2 z-40 rounded-xl border border-surface-200 dark:border-surface-800 shadow-lg overflow-hidden"
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

      {/* Type Toggle */}
      <div className="flex p-1 bg-surface-100 dark:bg-surface-800 rounded-xl">
        <button
          onClick={() => setType('income')}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
            type === 'income' 
              ? 'bg-white dark:bg-surface-900 text-income-600 dark:text-income-400 shadow-sm' 
              : 'text-surface-500 hover:text-surface-900 dark:hover:text-surface-50'
          }`}
        >
          Income
        </button>
        <button
          onClick={() => setType('expense')}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
            type === 'expense' 
              ? 'bg-white dark:bg-surface-900 text-expense-600 dark:text-expense-400 shadow-sm' 
              : 'text-surface-500 hover:text-surface-900 dark:hover:text-surface-50'
          }`}
        >
          Expense
        </button>
      </div>

      <div className="space-y-6">
        {/* Amount Input */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-surface-900 dark:text-surface-50">
            Amount
          </label>
          <div className="relative">
            <NumberInput
              value={amount}
              onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="0.00"
              className="pr-14"
            />
            <Calculator
              initialValue={amount}
              onConfirm={(val) => setAmount(val)}
            />
          </div>
        </div>

        {/* Category Select */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-surface-900 dark:text-surface-50">
            Category
          </label>
          <Select
            options={categoryOptions}
            value={categoryId}
            onChange={setCategoryId}
            placeholder="Select a category..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Date Picker */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-surface-900 dark:text-surface-50">
              Date
            </label>
            <DatePicker 
              value={date} 
              onChange={(d) => d && setDate(d)} 
            />
          </div>
          
          {/* Time Input */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-surface-900 dark:text-surface-50">
              Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full h-12 flex items-center px-4 rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
            />
          </div>
        </div>

        {/* Note Input */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-surface-900 dark:text-surface-50">
            Note <span className="text-surface-500 font-normal">(Optional)</span>
          </label>
          <Input 
            placeholder="Add some details..." 
            value={note}
            onChange={(e) => setNote(e.target.value)}
            icon={<FileText className="w-4 h-4" />}
          />
        </div>

        <Button 
          size="lg" 
          className="w-full h-14" 
          onClick={handleSave}
          isLoading={createTransaction.isPending || updateTransaction.isPending}
        >
          {editId ? 'Save Changes' : 'Save Transaction'}
        </Button>
      </div>
    </div>
  );
}

export default function AddTransactionPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-surface-500">Loading form...</div>}>
      <TransactionForm />
    </Suspense>
  );
}
