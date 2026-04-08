'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FileText, Calendar as CalendarIcon, ChevronLeft } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
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
  
  const { activeBookId } = useBookStore();
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
  const [note, setNote] = useState('');

  // Hydrate form if editing
  useEffect(() => {
    if (editId && transactions) {
      const tx = transactions.find((t) => t.id === editId);
      if (tx) {
        setType(tx.type as TransactionType);
        setAmount(tx.amount);
        setCategoryId(tx.categoryId);
        setDate(new Date(tx.date));
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
    icon: c.icon, // Passing string icon name, would need a mapper in production
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

      {/* Book Context Note */}
      <div className="bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-800 rounded-xl p-3 text-sm flex items-center justify-between">
        <span className="text-surface-500">Adding to Ledger:</span>
        <span className="font-semibold text-surface-900 dark:text-surface-50">
          {activeBook?.name || 'Loading...'}
        </span>
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
          <NumberInput 
            value={amount} 
            onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0.00"
          />
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
          
          {/* Mock Time Display */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-surface-900 dark:text-surface-50">
              Time
            </label>
            <div className="w-full h-12 flex items-center px-4 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900 text-surface-500 cursor-not-allowed text-sm">
              {format(date, 'hh:mm a')}
            </div>
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
