/**
 * Math utility helpers for question generation and answer validation.
 */

/** Returns a random integer in [min, max] inclusive. */
export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Picks a random element from an array. */
export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Shuffles an array in place (Fisher-Yates). Returns the array. */
export function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Greatest common divisor (Euclidean algorithm). */
export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
}

/** Least common multiple. */
export function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b);
}

/** Simplifies a fraction — returns [numerator, denominator]. */
export function simplifyFraction(num: number, den: number): [number, number] {
  if (den === 0) throw new Error('Denominator cannot be zero');
  const sign = den < 0 ? -1 : 1;
  const g = gcd(Math.abs(num), Math.abs(den));
  return [(sign * num) / g, (sign * den) / g];
}

/** Formats a fraction as a LaTeX string. */
export function fracTeX(num: number, den: number): string {
  if (den === 1) return `${num}`;
  const [n, d] = simplifyFraction(num, den);
  return `\\frac{${n}}{${d}}`;
}

/** Adds two fractions — returns simplified [num, den]. */
export function addFractions(
  n1: number, d1: number,
  n2: number, d2: number,
): [number, number] {
  const common = lcm(d1, d2);
  const num = n1 * (common / d1) + n2 * (common / d2);
  return simplifyFraction(num, common);
}

/** Multiplies two fractions — returns simplified [num, den]. */
export function multiplyFractions(
  n1: number, d1: number,
  n2: number, d2: number,
): [number, number] {
  return simplifyFraction(n1 * n2, d1 * d2);
}

/** Checks if a number is prime. */
export function isPrime(n: number): boolean {
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return false;
  }
  return true;
}

/** Generates an array of unique random integers in [min, max]. */
export function uniqueRandInts(count: number, min: number, max: number): number[] {
  if (max - min + 1 < count) throw new Error('Range too small for unique values');
  const set = new Set<number>();
  while (set.size < count) set.add(randInt(min, max));
  return [...set];
}

/** Evaluates a simple numeric expression safely (no eval). */
export function safeEval(expr: string): number {
  // Only allow numbers, operators, parentheses, spaces
  if (!/^[0-9+\-*/().\s]+$/.test(expr)) {
    throw new Error(`Unsafe expression: ${expr}`);
  }
  // Use Function constructor as a controlled alternative to eval
  return Function(`"use strict"; return (${expr})`)() as number;
}

/** Rounds to a given number of decimal places. */
export function round(value: number, decimals = 2): number {
  return Math.round(value * 10 ** decimals) / 10 ** decimals;
}

/** Returns true if two numeric answers are within tolerance of each other. */
export function approxEqual(a: number, b: number, tolerance = 0.001): boolean {
  return Math.abs(a - b) <= tolerance;
}
