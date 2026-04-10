import { ArrowDownRight, ArrowUpRight, Wallet } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { formatCurrency, formatSignedCurrency } from '@/lib/utils/currency';

interface SummaryCardsProps {
  income: number;
  expense: number;
  currency?: string;
}

export function SummaryCards({ income, expense, currency = 'BDT' }: SummaryCardsProps) {
  const netBalance = income - Math.abs(expense);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Income Card */}
      <Card className="p-5 flex items-center gap-4 bg-income-50/50 dark:bg-income-950/10 border-income-100 dark:border-income-900/30">
        <div className="w-12 h-12 rounded-full gradient-income flex items-center justify-center text-white shrink-0 shadow-lg shadow-income-500/20">
          <ArrowUpRight className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-surface-500 mb-0.5">Total Income</p>
          <p className="text-2xl font-bold tabular-nums text-income-700 dark:text-income-300">
            {formatCurrency(income, currency)}
          </p>
        </div>
      </Card>

      {/* Expense Card */}
      <Card className="p-5 flex items-center gap-4 bg-expense-50/50 dark:bg-expense-950/10 border-expense-100 dark:border-expense-900/30">
        <div className="w-12 h-12 rounded-full gradient-expense flex items-center justify-center text-white shrink-0 shadow-lg shadow-expense-500/20">
          <ArrowDownRight className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-surface-500 mb-0.5">Total Expense</p>
          <p className="text-2xl font-bold tabular-nums text-expense-700 dark:text-expense-300">
            {formatCurrency(expense, currency)}
          </p>
        </div>
      </Card>

      {/* Net Balance Card */}
      <Card className="p-5 flex items-center gap-4 bg-primary-50/50 dark:bg-primary-950/10 border-primary-100 dark:border-primary-900/30">
        <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary-500/20">
          <Wallet className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-surface-500 mb-0.5">Net Flow</p>
          <p className={`text-2xl font-bold tabular-nums ${
            netBalance < 0 ? 'text-expense-600 dark:text-expense-400' : 'text-primary-700 dark:text-primary-300'
          }`}>
            {formatSignedCurrency(netBalance, currency)}
          </p>
        </div>
      </Card>
    </div>
  );
}
