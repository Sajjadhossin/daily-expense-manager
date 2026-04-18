'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { ArrowDownToLine, FileText, FileSpreadsheet, ChevronLeft } from 'lucide-react';

import { useBookStore } from '@/lib/store/book.store';
import { useBooks } from '@/lib/hooks/use-books';
import { useCategories } from '@/lib/hooks/use-categories';
import { useTransactions } from '@/lib/hooks/use-transactions';

import { DateRangeType, DateRange, getDateRange } from '@/lib/utils/date';
import { generateReportPdf } from '@/lib/utils/pdf';
import { generateReportExcel } from '@/lib/utils/excel';
import { formatSignedCurrency } from '@/lib/utils/currency';

import { EmptyState } from '@/components/ui/empty-state';
import { ReportsSkeleton } from '@/components/ui/page-skeletons';
import { DateFilter } from '@/components/summary/DateFilter';
import { SummaryCards } from '@/components/summary/SummaryCards';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import * as Icons from 'lucide-react';

export default function ReportsPage() {
  const router = useRouter();
  
  const { activeBookId } = useBookStore();
  const { data: books } = useBooks();
  const { data: categories } = useCategories(activeBookId);
  const { data: rawTransactions, isLoading } = useTransactions(activeBookId);

  const [dateType, setDateType] = useState<DateRangeType>('this_month');
  const [currentRange, setCurrentRange] = useState<DateRange>(getDateRange('this_month'));
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const activeBook = (books || []).find(b => b.id === activeBookId);

  if (!activeBookId || !activeBook) {
    return (
      <EmptyState 
        title="No Cash Book Selected"
        description="Please select or create a cash book to generate reports."
        actionLabel="Go to Books"
        onAction={() => router.push('/books')}
      />
    );
  }

  const handleRangeChange = (range: DateRange, type: DateRangeType) => {
    setCurrentRange(range);
    setDateType(type);
  };

  // Format category options for the Select dropdown
  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...(categories || []).map(c => {
      const Icon = (Icons as any)[c.icon];
      return {
        value: c.id,
        label: c.name,
        icon: Icon ? <Icon className="w-4 h-4" /> : undefined
      };
    })
  ];

  // Fetch transactions spanning exactly the bounds
  const startDateMs = currentRange.startDate.getTime();
  const endDateMs = currentRange.endDate.getTime();
  
  let transactions = (rawTransactions || []).filter(tx => {
    const txDate = new Date(tx.date).getTime();
    return txDate >= startDateMs && txDate <= endDateMs;
  });

  // Apply Category Filter
  if (selectedCategory !== 'all') {
    transactions = transactions.filter(t => t.categoryId === selectedCategory);
  }

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const exportOptions = {
    book: activeBook as any,
    transactions: transactions as any,
    categories: categories as any || [],
    startDate: currentRange.startDate,
    endDate: currentRange.endDate,
    dateRangeLabel: currentRange.label,
    categoryFilterName: selectedCategory === 'all' ? 'All Categories' : (categories || []).find(c => c.id === selectedCategory)?.name,
  };

  const handleExportPDF = () => generateReportPdf(exportOptions);
  const handleExportExcel = () => generateReportExcel(exportOptions);

  return (
    <div className="space-y-6 fade-in max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="p-1.5 -ml-1.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors lg:hidden"
          >
            <ChevronLeft className="w-5 h-5 text-surface-600 dark:text-surface-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">Reports</h1>
            <p className="text-sm text-surface-500">View and export tabular statements.</p>
          </div>
        </div>
        
        <div className="hidden sm:flex items-center gap-2">
          <Button
            className="gap-2 shrink-0 bg-primary-600 outline-none hover:bg-primary-700 text-white"
            onClick={handleExportPDF}
            disabled={transactions.length === 0}
          >
            <ArrowDownToLine className="w-4 h-4 text-white" />
            PDF
          </Button>
          <Button
            variant="outline"
            className="gap-2 shrink-0"
            onClick={handleExportExcel}
            disabled={transactions.length === 0}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Excel
          </Button>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row sm:items-stretch gap-3">
        <div className="w-full sm:w-[200px]">
          <Select
            options={categoryOptions}
            value={selectedCategory}
            onChange={setSelectedCategory}
            placeholder="Filter Category"
          />
        </div>
        <DateFilter
          currentRange={currentRange}
          currentType={dateType}
          onRangeChange={handleRangeChange}
        />
        <div className="flex gap-2 sm:hidden">
          <Button
            className="flex-1 gap-2 bg-primary-600 outline-none hover:bg-primary-700 text-white"
            onClick={handleExportPDF}
            disabled={transactions.length === 0}
          >
            <ArrowDownToLine className="w-4 h-4 text-white" />
            PDF
          </Button>
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={handleExportExcel}
            disabled={transactions.length === 0}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Excel
          </Button>
        </div>
      </div>

      <SummaryCards income={totalIncome} expense={totalExpense} currency={activeBook?.currency} />

      {/* Tabular Data View */}
      <Card className="mt-6 overflow-hidden">
        {isLoading ? (
           <ReportsSkeleton />
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-4 text-surface-400">
              <FileText className="w-8 h-8" />
            </div>
            <p className="font-semibold text-surface-900 dark:text-surface-50">No tabular data</p>
            <p className="text-sm text-surface-500 mt-1 max-w-xs">There are no records found within this specific date boundary.</p>
          </div>
        ) : (
          <>
            {/* Mobile: Card List */}
            <div className="sm:hidden divide-y divide-surface-100 dark:divide-surface-800/40">
              {transactions.map((tx) => {
                const cat = (categories || []).find((c) => c.id === tx.categoryId);
                const isExpense = tx.type === 'expense';
                return (
                  <div key={tx.id} className="p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${cat?.color || 'bg-surface-400'}`} />
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-surface-900 dark:text-surface-50 capitalize truncate">
                          {cat?.name || 'Uncategorized'}
                        </p>
                        <p className="text-xs text-surface-500 mt-0.5">
                          {format(new Date(tx.date), 'MMM dd')} · {format(new Date(tx.date), 'hh:mm a')}
                          {tx.note && <span className="ml-1">· {tx.note}</span>}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`font-bold text-sm tabular-nums ${isExpense ? 'text-surface-900 dark:text-surface-50' : 'text-income-600 dark:text-income-400'}`}>
                        {formatSignedCurrency(isExpense ? -tx.amount : tx.amount, activeBook?.currency)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop: Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-50/50 dark:bg-surface-800/20 border-b border-surface-200 dark:border-surface-800">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-surface-900 dark:text-surface-200">Date/Time</th>
                    <th className="px-4 py-3 font-semibold text-surface-900 dark:text-surface-200">Category</th>
                    <th className="px-4 py-3 font-semibold text-surface-900 dark:text-surface-200">Note</th>
                    <th className="px-4 py-3 font-semibold text-surface-900 dark:text-surface-200 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100 dark:divide-surface-800/40">
                  {transactions.map((tx) => {
                    const cat = (categories || []).find((c) => c.id === tx.categoryId);
                    const isExpense = tx.type === 'expense';
                    return (
                      <tr key={tx.id} className="hover:bg-surface-50/30 dark:hover:bg-surface-800/10 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <p className="font-medium text-surface-900 dark:text-surface-50">
                            {format(new Date(tx.date), 'MMM dd, yyyy')}
                          </p>
                          <p className="text-xs text-surface-500 mt-0.5">{format(new Date(tx.date), 'hh:mm a')}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${cat?.color || 'bg-surface-400'}`} />
                            <span className="font-medium capitalize text-surface-900 dark:text-surface-100">
                              {cat?.name || 'Uncategorized'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 max-w-[200px]">
                          <p className="truncate text-surface-600 dark:text-surface-400">
                            {tx.note || <span className="opacity-50">—</span>}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <p className={`font-bold tabular-nums ${isExpense ? 'text-surface-900 dark:text-surface-50' : 'text-income-600 dark:text-income-400'}`}>
                            {formatSignedCurrency(isExpense ? -tx.amount : tx.amount, activeBook?.currency)}
                          </p>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-surface-400 mt-1">
                            {tx.type}
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>
      
      {/* End Footer Note */}
      <div className="mt-8 text-center px-4">
         <p className="text-sm text-surface-400 dark:text-surface-600">
            Export generated reports for safekeeping or third-party audits.
         </p>
      </div>
    </div>
  );
}
