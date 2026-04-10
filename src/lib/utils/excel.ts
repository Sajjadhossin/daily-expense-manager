import * as XLSX from 'xlsx';
import { format } from 'date-fns';

import { Book, Category, Transaction } from '@/generated/client';

interface GenerateExcelOptions {
  book: Book;
  transactions: Transaction[];
  categories: Category[];
  startDate: Date;
  endDate: Date;
  dateRangeLabel: string;
  categoryFilterName?: string;
}

export const generateReportExcel = ({
  book,
  transactions,
  categories,
  startDate,
  endDate,
  dateRangeLabel,
  categoryFilterName,
}: GenerateExcelOptions) => {
  const cur = book.currency || 'BDT';

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  // Summary rows
  const summaryData = [
    ['Financial Report - Daily Expense Manager'],
    [`Ledger: ${book.name}`],
    [`Period: ${format(startDate, 'MMM dd, yyyy')} - ${format(endDate, 'MMM dd, yyyy')} (${dateRangeLabel})`],
    ...(categoryFilterName && categoryFilterName !== 'All Categories'
      ? [`Category: ${categoryFilterName}`]
      : []),
    [`Generated: ${format(new Date(), 'MMM dd, yyyy hh:mm a')}`],
    [],
    ['Total Income', 'Total Expense', 'Net Balance', 'Currency'],
    [totalIncome, totalExpense, netBalance, cur],
    [],
    ['Date', 'Time', 'Category', 'Type', 'Amount', 'Note'],
  ];

  // Transaction rows
  const txRows = transactions.map((t) => {
    const cat = categories.find((c) => c.id === t.categoryId);
    return [
      format(new Date(t.date), 'yyyy-MM-dd'),
      t.time || format(new Date(t.date), 'HH:mm'),
      cat?.name || 'Uncategorized',
      t.type.charAt(0).toUpperCase() + t.type.slice(1),
      t.type === 'expense' ? -t.amount : t.amount,
      t.note || '',
    ];
  });

  const allRows = [...summaryData, ...txRows];

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(allRows);

  // Column widths
  ws['!cols'] = [
    { wch: 14 }, // Date
    { wch: 8 },  // Time
    { wch: 16 }, // Category
    { wch: 10 }, // Type
    { wch: 14 }, // Amount
    { wch: 30 }, // Note
  ];

  // Format amount cells as numbers
  const headerRowCount = summaryData.length;
  txRows.forEach((_, i) => {
    const cellRef = XLSX.utils.encode_cell({ r: headerRowCount + i, c: 4 });
    if (ws[cellRef]) {
      ws[cellRef].t = 'n';
      ws[cellRef].z = '#,##0.00';
    }
  });

  // Summary amount cells
  const summaryAmountRow = 7; // 0-indexed row for [totalIncome, totalExpense, netBalance]
  [0, 1, 2].forEach((c) => {
    const cellRef = XLSX.utils.encode_cell({ r: summaryAmountRow, c });
    if (ws[cellRef]) {
      ws[cellRef].t = 'n';
      ws[cellRef].z = '#,##0.00';
    }
  });

  // Create workbook and save
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Transactions');

  const filename = `Report_${book.name.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`;
  XLSX.writeFile(wb, filename);
};
