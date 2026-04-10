import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

import { Book, Category, Transaction } from '@/generated/client';

interface GenerateReportOptions {
  book: Book;
  transactions: Transaction[];
  categories: Category[];
  startDate: Date;
  endDate: Date;
  dateRangeLabel: string;
  categoryFilterName?: string;
}

// ASCII-safe currency code mapping for PDF (jsPDF can't render Unicode symbols like ৳, ₹, ﷼)
const PDF_CURRENCY_LABELS: Record<string, string> = {
  BDT: 'BDT', USD: '$', EUR: 'EUR', GBP: 'GBP', INR: 'INR',
  JPY: 'JPY', CNY: 'CNY', AUD: 'A$', CAD: 'C$', SAR: 'SAR',
  AED: 'AED', MYR: 'RM', SGD: 'S$',
};

// Format number with commas, always 2 decimal places, ASCII only
function fmtNum(n: number): string {
  const parts = Math.abs(n).toFixed(2).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

function fmtAmount(amount: number, currency: string, signed = false): string {
  const label = PDF_CURRENCY_LABELS[currency] || currency;
  const num = fmtNum(amount);
  if (signed) {
    const sign = amount < 0 ? '-' : '+';
    return `${sign} ${label} ${fmtNum(Math.abs(amount))}`;
  }
  return `${label} ${num}`;
}

export const generateReportPdf = ({
  book,
  transactions,
  categories,
  startDate,
  endDate,
  dateRangeLabel,
  categoryFilterName,
}: GenerateReportOptions) => {
  const doc = new jsPDF('p', 'pt', 'a4');
  const cur = book.currency || 'BDT';

  // PDF Meta
  doc.setProperties({
    title: `${book.name} - Expense Report`,
    subject: 'Financial Ledger Statement',
    author: 'Daily Expense Manager',
  });

  // Calculate totals
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  // Header Section
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text('Financial Report', 40, 50);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text(`Generated on ${format(new Date(), 'MMM dd, yyyy hh:mm a')}`, 40, 65);

  // Book Information
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text(`Ledger: ${book.name}`, 40, 95);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(55, 65, 81);
  let periodText = `Period: ${format(startDate, 'MMM dd, yyyy')} - ${format(endDate, 'MMM dd, yyyy')} (${dateRangeLabel})`;
  if (categoryFilterName && categoryFilterName !== 'All Categories') {
    periodText += ` | Category: ${categoryFilterName}`;
  }
  doc.text(periodText, 40, 110);

  // Summary Block
  doc.setFillColor(249, 250, 251);
  doc.setDrawColor(229, 231, 235);
  doc.roundedRect(40, 125, 515, 60, 4, 4, 'FD');

  const labelY = 145;
  const valueY = 168;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text('Total Income', 60, labelY);
  doc.text('Total Expense', 240, labelY);
  doc.text('Net Balance', 430, labelY);

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');

  doc.setTextColor(16, 185, 129);
  doc.text(`+ ${fmtAmount(totalIncome, cur)}`, 60, valueY);

  doc.setTextColor(249, 115, 22);
  doc.text(`- ${fmtAmount(totalExpense, cur)}`, 240, valueY);

  doc.setTextColor(netBalance < 0 ? 249 : 16, netBalance < 0 ? 115 : 185, netBalance < 0 ? 22 : 129);
  doc.text(`${netBalance < 0 ? '-' : '+'} ${fmtAmount(Math.abs(netBalance), cur)}`, 430, valueY);

  // Table data
  const tableData = transactions.map((t) => {
    const isExpense = t.type === 'expense';
    const cat = categories.find((c) => c.id === t.categoryId);
    return [
      format(t.date, 'MMM dd, yyyy'),
      cat?.name || 'Uncategorized',
      t.type.toUpperCase(),
      t.note || '-',
      fmtAmount(isExpense ? -t.amount : t.amount, cur, true),
    ];
  });

  // Render Table
  autoTable(doc, {
    startY: 210,
    head: [['Date', 'Category', 'Type', 'Note', 'Amount']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [243, 244, 246],
      textColor: [55, 65, 81],
      fontStyle: 'bold',
      halign: 'left',
    },
    bodyStyles: {
      textColor: [75, 85, 99],
      font: 'helvetica',
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 100 },
      2: { cellWidth: 60 },
      3: { cellWidth: 175 },
      4: { cellWidth: 100, halign: 'right', fontStyle: 'bold' },
    },
    didParseCell: function (data) {
      if (data.section === 'body' && data.column.index === 4) {
        const rawText = data.cell.raw as string;
        if (rawText.startsWith('+')) {
          data.cell.styles.textColor = [16, 185, 129];
        } else if (rawText.startsWith('-')) {
          data.cell.styles.textColor = [249, 115, 22];
        }
      }
    },
    margin: { top: 210, right: 40, bottom: 40, left: 40 },
    showHead: 'everyPage',
  });

  // Save
  const filename = `Report_${book.name.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`;
  doc.save(filename);
};
