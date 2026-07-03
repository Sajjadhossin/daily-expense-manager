import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
  subDays,
} from 'date-fns';

export type DateRangeType =
  | 'all'
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'this_month'
  | 'last_month'
  | 'custom';

export interface DateRange {
  startDate: Date;
  endDate: Date;
  label: string;
}

export const getDateRange = (type: DateRangeType, customStart?: Date, customEnd?: Date): DateRange => {
  const now = new Date();

  switch (type) {
    case 'all':
      return {
        startDate: new Date(0), // Epoch — captures every past transaction
        endDate: new Date(9999, 11, 31, 23, 59, 59), // Far future — captures any post-dated entry
        label: 'All Time',
      };
    case 'today':
      return {
        startDate: startOfDay(now),
        endDate: endOfDay(now),
        label: 'Today',
      };
    case 'yesterday': {
      const yesterday = subDays(now, 1);
      return {
        startDate: startOfDay(yesterday),
        endDate: endOfDay(yesterday),
        label: 'Yesterday',
      };
    }
    case 'this_week':
      return {
        startDate: startOfWeek(now, { weekStartsOn: 1 }), // Assuming Monday start
        endDate: endOfWeek(now, { weekStartsOn: 1 }),
        label: 'This Week',
      };
    case 'this_month':
      return {
        startDate: startOfMonth(now),
        endDate: endOfMonth(now),
        label: 'This Month',
      };
    case 'last_month': {
      const lastMonth = subMonths(now, 1);
      return {
        startDate: startOfMonth(lastMonth),
        endDate: endOfMonth(lastMonth),
        label: 'Last Month',
      };
    }
    case 'custom':
      if (!customStart || !customEnd) {
        throw new Error('Custom date range requires both start and end dates');
      }
      return {
        startDate: startOfDay(customStart),
        endDate: endOfDay(customEnd),
        label: 'Custom',
      };
    default:
      return {
        startDate: startOfMonth(now),
        endDate: endOfMonth(now),
        label: 'This Month',
      };
  }
};
