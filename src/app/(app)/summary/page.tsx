'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, ChevronLeft } from 'lucide-react';

import { useBookStore } from '@/lib/store/book.store';
import { useBooks } from '@/lib/hooks/use-books';
import { useCategories } from '@/lib/hooks/use-categories';
import { useTransactions } from '@/lib/hooks/use-transactions';
import { DateRangeType, DateRange, getDateRange } from '@/lib/utils/date';

import { EmptyState } from '@/components/ui/empty-state';
import { SummarySkeleton } from '@/components/ui/page-skeletons';
import { DateFilter } from '@/components/summary/DateFilter';
import { SummaryCards } from '@/components/summary/SummaryCards';
import { CategoryBreakdown } from '@/components/summary/CategoryBreakdown';
import { Button } from '@/components/ui/button';

export default function SummaryPage() {
  const router = useRouter();
  
  const { activeBookId } = useBookStore();
  const { data: books } = useBooks();
  const { data: categories } = useCategories();
  const { data: rawTransactions, isLoading } = useTransactions(activeBookId);

  const activeBook = (books || []).find(b => b.id === activeBookId);

  const [dateType, setDateType] = useState<DateRangeType>('this_month');
  const [currentRange, setCurrentRange] = useState<DateRange>(getDateRange('this_month'));

  if (!activeBookId) {
    return (
      <EmptyState 
        title="No Cash Book Selected"
        description="Please select or create a cash book to view your summary."
        actionLabel="Go to Books"
        onAction={() => router.push('/books')}
      />
    );
  }

  const handleRangeChange = (range: DateRange, type: DateRangeType) => {
    setCurrentRange(range);
    setDateType(type);
  };

  // Fetch transactions locked to selected ISO range
  const startDateMs = currentRange.startDate.getTime();
  const endDateMs = currentRange.endDate.getTime();
  
  const transactions = (rawTransactions || []).filter(tx => {
    const txDate = new Date(tx.date).getTime();
    return txDate >= startDateMs && txDate <= endDateMs;
  });

  // Quick summary calculate
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6 fade-in max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors lg:hidden"
          >
            <ChevronLeft className="w-6 h-6 text-surface-600 dark:text-surface-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">Insights</h1>
            <p className="text-sm text-surface-500">Analyze your ledger distribution and cashflow.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <DateFilter 
            currentRange={currentRange}
            currentType={dateType}
            onRangeChange={handleRangeChange}
          />
          {/* Action to download reports - placeholder for Phase 7 */}
          <Button variant="outline" className="gap-2 hidden sm:flex shrink-0">
            <BookOpen className="w-4 h-4" />
            Full Report
          </Button>
        </div>
      </div>

      <SummaryCards income={totalIncome} expense={totalExpense} currency={activeBook?.currency} />

      {isLoading ? (
        <SummarySkeleton />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mt-6">
          <CategoryBreakdown
            transactions={transactions as any}
            categories={categories as any || []}
            type="expense"
            currency={activeBook?.currency}
          />
          <CategoryBreakdown
            transactions={transactions as any}
            categories={categories as any || []}
            type="income"
            currency={activeBook?.currency}
          />
        </div>
      )}
    </div>
  );
}
