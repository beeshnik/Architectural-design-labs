import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Объединяет классы Tailwind с помощью clsx и tailwind-merge
 * Предотвращает конфликты классов и упрощает условное применение стилей
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
