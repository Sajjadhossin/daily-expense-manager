'use client';

import { useState } from 'react';
import { Calendar, ChevronDown, Check } from 'lucide-react';
import * as PopoverPrimitive from "@radix-ui/react-popover";

import { DateRangeType, DateRange, getDateRange } from '@/lib/utils/date';
import { DatePicker } from '@/components/ui/date-picker';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const PRESETS: { label: string; value: DateRangeType }[] = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'This Week', value: 'this_week' },
  { label: 'This Month', value: 'this_month' },
  { label: 'Last Month', value: 'last_month' },
  { label: 'Custom Range', value: 'custom' },
];

interface DateFilterProps {
  currentRange: DateRange;
  onRangeChange: (range: DateRange, type: DateRangeType) => void;
  currentType: DateRangeType;
}

export function DateFilter({ currentRange, onRangeChange, currentType }: DateFilterProps) {
  const [open, setOpen] = useState(false);
  const [tempStart, setTempStart] = useState<Date | undefined>(currentRange.startDate);
  const [tempEnd, setTempEnd] = useState<Date | undefined>(currentRange.endDate);

  const handleSelectPreset = (val: DateRangeType) => {
    if (val !== 'custom') {
      const newRange = getDateRange(val);
      onRangeChange(newRange, val);
      setOpen(false);
    }
  };

  const handleApplyCustom = () => {
    if (tempStart && tempEnd) {
      if (tempStart > tempEnd) {
        // swap if inverted
        const range = getDateRange('custom', tempEnd, tempStart);
        onRangeChange(range, 'custom');
      } else {
        const range = getDateRange('custom', tempStart, tempEnd);
        onRangeChange(range, 'custom');
      }
      setOpen(false);
    }
  };

  const displayString = 
    currentType === 'custom' 
      ? `${format(currentRange.startDate, 'MMM d')} - ${format(currentRange.endDate, 'MMM d')}`
      : currentRange.label;

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          className="flex h-10 items-center gap-2 rounded-xl bg-surface-100 dark:bg-surface-800 px-4 py-2 text-sm font-medium text-surface-900 dark:text-surface-50 transition-colors hover:bg-surface-200 dark:hover:bg-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <Calendar className="h-4 w-4 shrink-0 text-primary-600 dark:text-primary-400" />
          <span className="truncate">{displayString}</span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="end"
          sideOffset={8}
          className="z-50 w-[300px] overflow-hidden rounded-2xl border border-surface-200 bg-surface-50 p-2 shadow-xl dark:border-surface-800 dark:bg-surface-900 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2"
        >
          <div className="flex flex-col gap-1">
            {PRESETS.map((p) => (
              <button
                key={p.value}
                onClick={() => {
                  if (p.value !== 'custom') {
                    handleSelectPreset(p.value);
                  } else {
                    setTempStart(currentRange.startDate);
                    setTempEnd(currentRange.endDate);
                    onRangeChange({ ...currentRange, label: 'Custom' }, 'custom');
                  }
                }}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors",
                  p.value === 'custom' && currentType === 'custom'
                    ? "bg-surface-100 font-medium text-surface-900 dark:bg-surface-800 dark:text-surface-50"
                    : p.value !== 'custom' && currentType === p.value
                    ? "bg-primary-50 font-medium text-primary-700 dark:bg-primary-950/50 dark:text-primary-300"
                    : "text-surface-600 hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-800"
                )}
              >
                <span>{p.label}</span>
                {currentType === p.value && <Check className="h-4 w-4" />}
              </button>
            ))}

            {/* Custom Range Expansion */}
            {currentType === 'custom' && (
              <div className="mt-2 space-y-3 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-100 dark:bg-surface-800/50 p-3">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-surface-500 uppercase tracking-wide">Start Date</span>
                  <DatePicker value={tempStart} onChange={setTempStart} className="h-10 bg-white dark:bg-surface-900" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-surface-500 uppercase tracking-wide">End Date</span>
                  <DatePicker value={tempEnd} onChange={setTempEnd} className="h-10 bg-white dark:bg-surface-900" />
                </div>
                <Button 
                  size="sm" 
                  className="w-full mt-2" 
                  disabled={!tempStart || !tempEnd}
                  onClick={handleApplyCustom}
                >
                  Apply Range
                </Button>
              </div>
            )}
            
            {/* If clicking custom preset but it's not currently active */}
            {currentType !== 'custom' && (
              <button
                onClick={() => {
                  setTempStart(currentRange.startDate);
                  setTempEnd(currentRange.endDate);
                  onRangeChange(currentRange, 'custom');
                }}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-surface-600 hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-800 transition-colors"
                style={{ display: 'none' }} // Hidden visually but handled logic wise above via selection mapping
              >
              </button>
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
