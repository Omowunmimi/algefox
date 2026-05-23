import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind CSS classes safely, resolving conflicts.
 * Use this everywhere instead of raw string concatenation.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
