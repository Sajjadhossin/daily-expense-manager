'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import * as Icons from 'lucide-react';
import { FileText } from 'lucide-react';

import { Category, CategoryType } from '@/types/book';
import { Transaction } from '@/types/transaction';
import { Card } from '@/components/ui/card';

interface CategoryBreakdownProps {
  transactions: Transaction[];
  categories: Category[];
  type: CategoryType;
}

export function CategoryBreakdown({ transactions, categories, type }: CategoryBreakdownProps) {
  const data = useMemo(() => {
    // Filter transactions by type
    const filteredTxs = transactions.filter((t) => t.type === type);
    
    // Group and aggregate by categoryId
    const sums: Record<string, number> = {};
    filteredTxs.forEach(tx => {
      sums[tx.categoryId] = (sums[tx.categoryId] || 0) + tx.amount;
    });

    // Map to array for Recharts
    const result = Object.entries(sums)
      .map(([catId, amount]) => {
        const cat = categories.find(c => c.id === catId);
        return {
          id: catId,
          name: cat?.name || 'Uncategorized',
          value: amount,
          // Convert standard tailwind bg colors to hex approx for the chart
          // Recharts requires raw hex/rgb values, we'll try to map standard ones:
          color: getHexForTwColor(cat?.color || 'bg-surface-500'),
          icon: cat?.icon,
        };
      })
      .sort((a, b) => b.value - a.value); // largest first

    return result;
  }, [transactions, categories, type]);

  const total = useMemo(() => data.reduce((acc, curr) => acc + curr.value, 0), [data]);

  if (data.length === 0) {
    return (
      <Card className="p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
        <div className="w-16 h-16 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-surface-400" />
        </div>
        <p className="font-semibold text-surface-900 dark:text-surface-50">No data available</p>
        <p className="text-sm text-surface-500 max-w-[200px]">
          There are no {type} records for this period.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="font-bold text-surface-900 dark:text-surface-50 mb-6 capitalize">
        {type} Breakdown
      </h3>
      
      <div className="flex flex-col md:flex-row gap-8 items-center">
        {/* Chart */}
        <div className="relative w-48 h-48 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                stroke="none"
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any) => [`৳ ${Number(value || 0).toLocaleString()}`, 'Total']}
                contentStyle={{ borderRadius: '12px', border: 'none', background: 'var(--bg-card)', color: 'var(--text-primary)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                itemStyle={{ fontWeight: 'bold' }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Inner Total */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] font-bold uppercase tracking-widest text-surface-400">Total</span>
            <span className="text-lg font-bold text-surface-900 dark:text-surface-50 truncate max-w-[100px]">
              {total >= 1000 ? `${(total / 1000).toFixed(1)}k` : total}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 w-full space-y-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
          {data.map((entry) => {
            const percentage = ((entry.value / total) * 100).toFixed(1);
            const IconComponent = entry.icon && (Icons as any)[entry.icon] 
              ? (Icons as any)[entry.icon] 
              : FileText;

            return (
              <div key={entry.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm"
                    style={{ backgroundColor: entry.color }}
                  >
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-surface-900 dark:text-surface-50 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {entry.name}
                    </p>
                    <p className="text-[10px] text-surface-500 font-medium">
                      {percentage}%
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold tabular-nums text-surface-900 dark:text-surface-50">
                    ৳ {entry.value.toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

// Minimal utility to map Tailwind standard backgrounds generated earlier into Hex equivalents for Recharts SVG renders
function getHexForTwColor(twClass: string): string {
  const map: Record<string, string> = {
    'bg-emerald-500': '#10b981',
    'bg-blue-500': '#3b82f6',
    'bg-indigo-500': '#6366f1',
    'bg-pink-500': '#ec4899',
    'bg-orange-500': '#f97316',
    'bg-yellow-500': '#eab308',
    'bg-purple-500': '#a855f7',
    'bg-cyan-500': '#06b6d4',
    'bg-rose-500': '#f43f5e',
    'bg-red-500': '#ef4444',
    'bg-gray-500': '#6b7280',
    'bg-primary-500': '#14b8a6', // Teal 500
    'bg-income-500': '#10b981',
    'bg-expense-500': '#f97316',
  };
  return map[twClass] || '#9ca3af'; // default gray-400
}
