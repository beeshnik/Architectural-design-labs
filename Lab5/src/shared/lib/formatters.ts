import { format } from 'date-fns';

/**
 * Форматирование даты и времени
 */
export function formatDateTime(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return format(date, 'dd.MM.yyyy HH:mm');
}

/**
 * Форматирование только даты
 */
export function formatDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return format(date, 'dd.MM.yyyy');
}

/**
 * Форматирование числа как валюты
 */
export function formatCurrency(value: string | number, decimals: number = 2): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Форматирование числа с разделителями тысяч
 */
export function formatNumber(value: string | number, decimals: number = 2): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Форматирование P&L с цветом (положительное/отрицательное)
 */
export function formatPnL(value: string | number): { text: string; isPositive: boolean; isNegative: boolean } {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  const isPositive = num > 0;
  const isNegative = num < 0;
  
  return {
    text: formatCurrency(num, 2),
    isPositive,
    isNegative,
  };
}

/**
 * Форматирование процента
 */
export function formatPercent(value: string | number, decimals: number = 2): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('ru-RU', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num / 100);
}
