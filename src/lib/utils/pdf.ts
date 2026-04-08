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
  doc.setTextColor(17, 24, 39); // Tailwind gray-900
  doc.text('Financial Report', 40, 50);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128); // Tailwind gray-500
  doc.text(`Generated on ${format(new Date(), 'MMM dd, yyyy hh:mm a')}`, 40, 65);

  // Book Information
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text(`Ledger: ${book.name}`, 40, 95);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(55, 65, 81); // Tailwind gray-700
  let periodText = `Period: ${format(startDate, 'MMM dd, yyyy')} - ${format(endDate, 'MMM dd, yyyy')} (${dateRangeLabel})`;
  if (categoryFilterName && categoryFilterName !== 'All Categories') {
    periodText += ` | Category: ${categoryFilterName}`;
  }
  doc.text(periodText, 40, 110);
  
  // Render Summary Block
  doc.setFillColor(249, 250, 251); // Gray 50
  doc.setDrawColor(229, 231, 235); // Gray 200
  doc.roundedRect(40, 125, 515, 60, 4, 4, 'FD');

  const summaryY = 145;
  const summaryLineY = 165;
  
  // Totals column drawing
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128); // Gray 500
  doc.text('Total Income', 60, summaryY);
  doc.text('Total Expense', 250, summaryY);
  doc.text('Net Balance', 440, summaryY);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129); // Emerald 500 for Income
  doc.text(`+ Tk ${totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 60, summaryLineY);

  doc.setTextColor(249, 115, 22); // Orange 500 for Expense
  doc.text(`- Tk ${totalExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 250, summaryLineY);

  doc.setTextColor(netBalance < 0 ? 249 : 16, netBalance < 0 ? 115 : 185, netBalance < 0 ? 22 : 129); 
  // Custom ternary for Net Color (Emerald vs Orange)
  doc.text(`${netBalance < 0 ? '-' : '+'} Tk ${Math.abs(netBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 440, summaryLineY);

  // Parse transactions into array of arrays for AutoTable
  const tableData = transactions.map((t) => {
    const isExpense = t.type === 'expense';
    const cat = categories.find((c) => c.id === t.categoryId);
    const dateFormatted = format(t.date, 'MMM dd, yyyy');
    const amountFormatted = `${isExpense ? '-' : '+'} Tk ${t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    
    return [
      dateFormatted,
      cat?.name || 'Uncategorized',
      t.type.toUpperCase(),
      t.note || '-',
      amountFormatted,
    ];
  });

  // Render Table
  autoTable(doc, {
    startY: 210,
    head: [['Date', 'Category', 'Type', 'Note', 'Amount']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [243, 244, 246], // Gray 100
      textColor: [55, 65, 81], // Gray 700
      fontStyle: 'bold',
      halign: 'left',
    },
    bodyStyles: {
      textColor: [75, 85, 99], // Gray 600
    },
    columnStyles: {
      0: { cellWidth: 80 }, // Date
      1: { cellWidth: 100 }, // Category
      2: { cellWidth: 70 }, // Type
      3: { cellWidth: 160 }, // Note
      4: { cellWidth: 105, halign: 'right', fontStyle: 'bold' }, // Amount
    },
    didParseCell: function (data) {
      if (data.section === 'body' && data.column.index === 4) {
        // Colorize amount cells based on text content '+' or '-'
        const rawText = data.cell.raw as string;
        if (rawText.startsWith('+')) {
          data.cell.styles.textColor = [16, 185, 129]; // Income Green
        } else if (rawText.startsWith('-')) {
          data.cell.styles.textColor = [249, 115, 22]; // Expense Orange
        }
      }
    },
    margin: { top: 210, right: 40, bottom: 40, left: 40 },
    showHead: 'everyPage',
  });

  // Save the PDF
  const filename = `Report_${book.name.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`;
  doc.save(filename);
};
