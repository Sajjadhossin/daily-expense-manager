const CURRENCY_MAP: Record<string, { symbol: string; code: string; locale: string; name: string }> = {
  BDT: { symbol: '৳', code: 'BDT', locale: 'en-IN', name: 'Bangladeshi Taka' },
  USD: { symbol: '$', code: 'USD', locale: 'en-US', name: 'US Dollar' },
  EUR: { symbol: '€', code: 'EUR', locale: 'de-DE', name: 'Euro' },
  GBP: { symbol: '£', code: 'GBP', locale: 'en-GB', name: 'British Pound' },
  INR: { symbol: '₹', code: 'INR', locale: 'en-IN', name: 'Indian Rupee' },
  JPY: { symbol: '¥', code: 'JPY', locale: 'ja-JP', name: 'Japanese Yen' },
  CNY: { symbol: '¥', code: 'CNY', locale: 'zh-CN', name: 'Chinese Yuan' },
  AUD: { symbol: 'A$', code: 'AUD', locale: 'en-AU', name: 'Australian Dollar' },
  CAD: { symbol: 'C$', code: 'CAD', locale: 'en-CA', name: 'Canadian Dollar' },
  SAR: { symbol: '﷼', code: 'SAR', locale: 'ar-SA', name: 'Saudi Riyal' },
  AED: { symbol: 'د.إ', code: 'AED', locale: 'ar-AE', name: 'UAE Dirham' },
  MYR: { symbol: 'RM', code: 'MYR', locale: 'ms-MY', name: 'Malaysian Ringgit' },
  SGD: { symbol: 'S$', code: 'SGD', locale: 'en-SG', name: 'Singapore Dollar' },
};

function getCurrencyInfo(currency: string) {
  return CURRENCY_MAP[currency] || CURRENCY_MAP.BDT;
}

/** Get the symbol for a currency code */
export function getCurrencySymbol(currency: string): string {
  return getCurrencyInfo(currency).symbol;
}

/** Format an amount with currency symbol: ৳ 1,234.56 */
export function formatCurrency(amount: number, currency: string = 'BDT'): string {
  const info = getCurrencyInfo(currency);
  const formatted = Math.abs(amount).toLocaleString(info.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const sign = amount < 0 ? '-' : '';
  return `${sign}${info.symbol} ${formatted}`;
}

/** Format with sign prefix: +৳ 1,234.56 or -৳ 1,234.56 */
export function formatSignedCurrency(amount: number, currency: string = 'BDT'): string {
  const info = getCurrencyInfo(currency);
  const formatted = Math.abs(amount).toLocaleString(info.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const sign = amount < 0 ? '-' : '+';
  return `${sign}${info.symbol} ${formatted}`;
}

/** Format for PDF (uses code instead of symbol for compatibility): + Tk 1,234.56 */
export function formatCurrencyForPdf(amount: number, currency: string = 'BDT'): string {
  const info = getCurrencyInfo(currency);
  const formatted = Math.abs(amount).toLocaleString(info.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const sign = amount < 0 ? '-' : '+';
  return `${sign} ${info.code} ${formatted}`;
}

/** Compact format for tight spaces: -৳1,000 or +৳1.5k */
export function formatCompactCurrency(amount: number, currency: string = 'BDT'): string {
  const info = getCurrencyInfo(currency);
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '+';

  let formatted: string;
  if (abs >= 100000) {
    formatted = (abs / 1000).toFixed(abs % 1000 === 0 ? 0 : 1) + 'k';
  } else if (abs % 1 === 0) {
    formatted = abs.toLocaleString(info.locale, { maximumFractionDigits: 0 });
  } else {
    formatted = abs.toLocaleString(info.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  return `${sign}${info.symbol}${formatted}`;
}

/** Get all supported currency codes */
export function getSupportedCurrencies(): { value: string; label: string; symbol: string; name: string }[] {
  return Object.entries(CURRENCY_MAP).map(([code, info]) => ({
    value: code,
    label: `${info.symbol} ${code}`,
    symbol: info.symbol,
    name: info.name,
  }));
}
