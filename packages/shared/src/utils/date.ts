// packages/shared/src/utils/date.ts
// Date, currency and number formatting utilities used across all services.

import {
  format,
  formatDistance,
  formatDistanceToNow,
  isValid,
  parseISO,
  parse,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  addDays,
  addMonths,
  addYears,
  subDays,
  subMonths,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  isBefore,
  isAfter,
  isSameDay,
  isWithinInterval,
} from 'date-fns';

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

export const DEFAULT_DATE_FORMAT = 'yyyy-MM-dd';
export const DEFAULT_DATETIME_FORMAT = "yyyy-MM-dd'T'HH:mm:ss";
export const DISPLAY_DATE_FORMAT = 'dd MMM yyyy';
export const DISPLAY_DATETIME_FORMAT = 'dd MMM yyyy, HH:mm';
export const DISPLAY_TIME_FORMAT = 'HH:mm:ss';

// ─────────────────────────────────────────────────────────────
// Date Formatting
// ─────────────────────────────────────────────────────────────

/**
 * Format a date value to a string using the given format pattern.
 * Returns an empty string if the date is invalid.
 */
export function formatDate(
  date: Date | string | number | null | undefined,
  formatStr: string = DISPLAY_DATE_FORMAT,
): string {
  if (date == null) {
    return '';
  }
  const d = toDate(date);
  if (!isValid(d)) {
    return '';
  }
  return format(d, formatStr);
}

/**
 * Format a date as a relative human-readable string, e.g. "3 days ago".
 * When `addSuffix` is false the suffix is omitted.
 */
export function formatDateRelative(
  date: Date | string | number | null | undefined,
  baseDate: Date = new Date(),
  addSuffix = true,
): string {
  if (date == null) {
    return '';
  }
  const d = toDate(date);
  if (!isValid(d)) {
    return '';
  }
  return formatDistance(d, baseDate, { addSuffix });
}

/**
 * Format a date as "X ago" relative to now.
 */
export function formatDateFromNow(
  date: Date | string | number | null | undefined,
  addSuffix = true,
): string {
  if (date == null) {
    return '';
  }
  const d = toDate(date);
  if (!isValid(d)) {
    return '';
  }
  return formatDistanceToNow(d, { addSuffix });
}

/**
 * Format a Date object to ISO 8601 string (UTC).
 */
export function formatISO(date: Date | string | number | null | undefined): string {
  if (date == null) {
    return '';
  }
  const d = toDate(date);
  if (!isValid(d)) {
    return '';
  }
  return d.toISOString();
}

// ─────────────────────────────────────────────────────────────
// Currency & Number Formatting
// ─────────────────────────────────────────────────────────────

export interface FormatCurrencyOptions {
  locale?: string;
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  notation?: 'standard' | 'compact' | 'scientific' | 'engineering';
}

/**
 * Format a numeric value as a currency string.
 *
 * @example
 * formatCurrency(1234567.89, { locale: 'en-US', currency: 'USD' })
 * // → '$1,234,567.89'
 */
export function formatCurrency(
  value: number | null | undefined,
  options: FormatCurrencyOptions = {},
): string {
  if (value == null || !isFinite(value)) {
    return '';
  }
  const {
    locale = 'en-US',
    currency = 'USD',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    notation = 'standard',
  } = options;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
    notation,
  }).format(value);
}

export interface FormatNumberOptions {
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  notation?: 'standard' | 'compact' | 'scientific' | 'engineering';
  unit?: string;
}

/**
 * Format a raw number with locale-aware thousands separators and optional unit.
 */
export function formatNumber(
  value: number | null | undefined,
  options: FormatNumberOptions = {},
): string {
  if (value == null || !isFinite(value)) {
    return '';
  }
  const {
    locale = 'en-US',
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    notation = 'standard',
    unit,
  } = options;

  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
    notation,
  }).format(value);

  return unit ? `${formatted} ${unit}` : formatted;
}

/**
 * Format a value as a percentage string.
 *
 * @param value   – number between 0 and 100
 * @param decimals – number of decimal places (default 1)
 */
export function formatPercentage(
  value: number | null | undefined,
  decimals = 1,
  locale = 'en-US',
): string {
  if (value == null || !isFinite(value)) {
    return '';
  }
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

// ─────────────────────────────────────────────────────────────
// Parsing
// ─────────────────────────────────────────────────────────────

/**
 * Parse a date string using the given format pattern.
 * Falls back to ISO parsing when no format is provided.
 */
export function parseDate(
  dateStr: string | null | undefined,
  formatStr?: string,
  referenceDate: Date = new Date(),
): Date | null {
  if (!dateStr) {
    return null;
  }
  try {
    const d = formatStr ? parse(dateStr, formatStr, referenceDate) : parseISO(dateStr);
    return isValid(d) ? d : null;
  } catch {
    return null;
  }
}

/**
 * Coerce a Date | string | number to a Date object.
 */
export function toDate(value: Date | string | number): Date {
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === 'string') {
    return parseISO(value);
  }
  return new Date(value);
}

// ─────────────────────────────────────────────────────────────
// Range helpers
// ─────────────────────────────────────────────────────────────

export interface DateRange {
  start: Date;
  end: Date;
}

export function getDateRangeForPeriod(
  period: 'today' | 'yesterday' | 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'this_year' | 'last_30_days' | 'last_90_days',
  referenceDate: Date = new Date(),
): DateRange {
  const ref = referenceDate;
  switch (period) {
    case 'today':
      return { start: startOfDay(ref), end: endOfDay(ref) };
    case 'yesterday': {
      const y = subDays(ref, 1);
      return { start: startOfDay(y), end: endOfDay(y) };
    }
    case 'this_week': {
      // ISO week: Monday start
      const day = ref.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      const monday = addDays(startOfDay(ref), diff);
      return { start: monday, end: endOfDay(addDays(monday, 6)) };
    }
    case 'last_week': {
      const day = ref.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      const thisMonday = addDays(startOfDay(ref), diff);
      const lastMonday = subDays(thisMonday, 7);
      return { start: lastMonday, end: endOfDay(addDays(lastMonday, 6)) };
    }
    case 'this_month':
      return { start: startOfMonth(ref), end: endOfMonth(ref) };
    case 'last_month': {
      const lm = subMonths(ref, 1);
      return { start: startOfMonth(lm), end: endOfMonth(lm) };
    }
    case 'this_year':
      return { start: startOfYear(ref), end: endOfYear(ref) };
    case 'last_30_days':
      return { start: startOfDay(subDays(ref, 29)), end: endOfDay(ref) };
    case 'last_90_days':
      return { start: startOfDay(subDays(ref, 89)), end: endOfDay(ref) };
    default:
      return { start: startOfDay(ref), end: endOfDay(ref) };
  }
}

// Re-export date-fns utilities that are commonly needed by consumers
export {
  isValid,
  isBefore,
  isAfter,
  isSameDay,
  isWithinInterval,
  addDays,
  addMonths,
  addYears,
  subDays,
  subMonths,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
};
