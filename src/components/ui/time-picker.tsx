'use client';

import * as React from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimePickerProps {
  value: string; // "HH:mm" 24h format
  onChange: (value: string) => void;
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const PERIODS = ['AM', 'PM'] as const;

export function TimePicker({ value, onChange }: TimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const parse = (v: string) => {
    const [h24, m] = v.split(':').map(Number);
    const period: 'AM' | 'PM' = h24 >= 12 ? 'PM' : 'AM';
    const h12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;
    return { hour: h12, minute: m, period };
  };

  const { hour, minute, period } = parse(value);

  const commit = (h: number, m: number, p: string) => {
    let h24 = h;
    if (p === 'AM' && h === 12) h24 = 0;
    else if (p === 'PM' && h !== 12) h24 = h + 12;
    onChange(`${String(h24).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  };

  const formatDisplay = () =>
    `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full h-12 flex items-center gap-3 px-4 rounded-xl border text-sm transition-colors text-left',
          'bg-surface-50 dark:bg-surface-900/50 text-surface-900 dark:text-surface-50',
          isOpen
            ? 'border-primary-500 ring-2 ring-primary-500'
            : 'border-surface-200 dark:border-surface-800'
        )}
      >
        <Clock className="w-4 h-4 text-surface-400" />
        <span className="font-medium tabular-nums">{formatDisplay()}</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div
            className="absolute top-full left-0 right-0 mt-2 z-40 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-xl overflow-hidden"
            style={{ backgroundColor: 'var(--bg-card)' }}
          >
            <div className="flex items-stretch h-48 relative">
              {/* Selection highlight bar */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-10 bg-primary-50 dark:bg-primary-950/30 border-y border-primary-200 dark:border-primary-800/50 pointer-events-none z-0" />

              {/* Hour */}
              <ScrollColumn
                items={HOURS}
                selected={hour}
                onSelect={(h) => commit(h, minute, period)}
                format={(v) => String(v).padStart(2, '0')}
              />

              <div className="flex items-center justify-center w-4 z-10">
                <span className="text-lg font-bold text-surface-400">:</span>
              </div>

              {/* Minute */}
              <ScrollColumn
                items={MINUTES}
                selected={minute}
                onSelect={(m) => commit(hour, m, period)}
                format={(v) => String(v).padStart(2, '0')}
              />

              {/* AM/PM */}
              <ScrollColumn
                items={[...PERIODS]}
                selected={period}
                onSelect={(p) => commit(hour, minute, p)}
                format={(v) => String(v)}
              />
            </div>

            <div className="p-3 pt-0">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold active:scale-[0.98] transition-transform"
              >
                Done
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ScrollColumn<T extends string | number>({
  items,
  selected,
  onSelect,
  format,
}: {
  items: T[];
  selected: T;
  onSelect: (item: T) => void;
  format: (item: T) => string;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const itemRefs = React.useRef<Map<number, HTMLButtonElement>>(new Map());
  const isScrolling = React.useRef(false);
  const scrollTimeout = React.useRef<ReturnType<typeof setTimeout>>(undefined);

  // Scroll selected item into view on mount and when selected changes
  React.useEffect(() => {
    const idx = items.indexOf(selected);
    const el = itemRefs.current.get(idx);
    if (el && containerRef.current) {
      const container = containerRef.current;
      const scrollTop = el.offsetTop - container.offsetHeight / 2 + el.offsetHeight / 2;
      container.scrollTo({ top: scrollTop, behavior: 'smooth' });
    }
  }, [selected, items]);

  // Snap to nearest item after scroll ends
  const handleScroll = () => {
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    isScrolling.current = true;

    scrollTimeout.current = setTimeout(() => {
      isScrolling.current = false;
      if (!containerRef.current) return;

      const container = containerRef.current;
      const centerY = container.scrollTop + container.offsetHeight / 2;

      let closestIdx = 0;
      let closestDist = Infinity;

      itemRefs.current.forEach((el, idx) => {
        const itemCenter = el.offsetTop + el.offsetHeight / 2;
        const dist = Math.abs(centerY - itemCenter);
        if (dist < closestDist) {
          closestDist = dist;
          closestIdx = idx;
        }
      });

      const item = items[closestIdx];
      if (item !== selected) {
        onSelect(item);
      }
    }, 80);
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto no-scrollbar relative z-10"
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {/* Top spacer */}
      <div className="h-[76px]" />

      {items.map((item, idx) => {
        const isSelected = item === selected;
        return (
          <button
            key={String(item)}
            type="button"
            ref={(el) => {
              if (el) itemRefs.current.set(idx, el);
              else itemRefs.current.delete(idx);
            }}
            onClick={() => onSelect(item)}
            className={cn(
              'w-full h-10 flex items-center justify-center text-sm tabular-nums transition-all',
              isSelected
                ? 'font-bold text-primary-700 dark:text-primary-300 scale-105'
                : 'font-medium text-surface-400 dark:text-surface-500 hover:text-surface-600 dark:hover:text-surface-300'
            )}
          >
            {format(item)}
          </button>
        );
      })}

      {/* Bottom spacer */}
      <div className="h-[76px]" />
    </div>
  );
}
