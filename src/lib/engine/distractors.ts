/**
 * Distractor generation for multiple-choice questions.
 * Produces plausible wrong answers that reflect common student errors.
 */

import { gcd, simplifyFraction, randInt, shuffle } from '@/lib/utils/math';

type AnswerDomain = 'integer' | 'fraction' | 'expression' | 'text';

/* ── helpers ───────────────────────────────────────────────────────────────── */

function uniqueAdd(pool: Set<string>, candidate: string, exclude: string): void {
  const c = candidate.trim();
  if (c !== exclude && c !== '') pool.add(c);
}

/** Parse "a/b" → [a, b] or null if not a fraction string. */
function parseFraction(s: string): [number, number] | null {
  const m = s.match(/^(-?\d+)\/(-?\d+)$/);
  if (!m) return null;
  return [parseInt(m[1], 10), parseInt(m[2], 10)];
}

/** Render simplified fraction as string; whole numbers become e.g. "2". */
function renderFraction(num: number, den: number): string {
  const [n, d] = simplifyFraction(num, den);
  return d === 1 ? `${n}` : `${n}/${d}`;
}

/* ── integer domain ─────────────────────────────────────────────────────────── */

function integerDistractors(correct: string, count: number): string[] {
  const val = parseInt(correct, 10);
  const pool = new Set<string>();

  // near misses: ±1, ±2, ±3, ±4, ±5
  for (let delta = 1; delta <= 10 && pool.size < count * 3; delta++) {
    uniqueAdd(pool, `${val + delta}`, correct);
    if (val - delta >= 0) uniqueAdd(pool, `${val - delta}`, correct);
  }
  // double and half
  uniqueAdd(pool, `${val * 2}`, correct);
  if (val > 1 && val % 2 === 0) uniqueAdd(pool, `${val / 2}`, correct);
  // random valid offset
  const offset = randInt(2, 8);
  uniqueAdd(pool, `${val + offset}`, correct);
  uniqueAdd(pool, `${Math.max(0, val - offset)}`, correct);

  const arr = shuffle([...pool]);
  return arr.slice(0, count);
}

/* ── fraction domain ────────────────────────────────────────────────────────── */

function fractionDistractors(correct: string, count: number): string[] {
  const parsed = parseFraction(correct);
  if (!parsed) return integerDistractors(correct, count);

  const [n, d] = parsed;
  const pool = new Set<string>();

  // flip: b/a
  if (n !== 0) uniqueAdd(pool, renderFraction(d, n), correct);
  // numerator ± 1
  uniqueAdd(pool, renderFraction(n + 1, d), correct);
  if (n > 1) uniqueAdd(pool, renderFraction(n - 1, d), correct);
  // denominator ± 1
  uniqueAdd(pool, renderFraction(n, d + 1), correct);
  if (d > 2) uniqueAdd(pool, renderFraction(n, d - 1), correct);
  // common student error: "add denominators" style — give unsimplified
  const g = gcd(Math.abs(n), Math.abs(d));
  if (g > 1) {
    // unsimplified form as wrong option
    uniqueAdd(pool, `${n * 2}/${d * 2}`, correct);
  }
  // wrong simplification: numerator only doubled
  uniqueAdd(pool, renderFraction(n * 2, d), correct);
  // add-denominators-style error
  if (d + 1 !== 0) uniqueAdd(pool, `${n}/${d + 2}`, correct);
  // near whole-number
  uniqueAdd(pool, renderFraction(n + d, d), correct);

  // fallback integers if pool is thin
  if (pool.size < count) {
    for (let i = 1; i <= 5 && pool.size < count; i++) {
      uniqueAdd(pool, `${i}/${d}`, correct);
      uniqueAdd(pool, `${n}/${d + i}`, correct);
    }
  }

  const arr = shuffle([...pool]);
  return arr.slice(0, count);
}

/* ── expression domain ──────────────────────────────────────────────────────── */

function expressionDistractors(correct: string, count: number): string[] {
  const pool = new Set<string>();

  // Try to find a leading coefficient pattern like "3x" or "3x + 6"
  const coeffMatch = correct.match(/^(-?\d+)([a-z])/);
  if (coeffMatch) {
    const coef = parseInt(coeffMatch[1], 10);
    const varChar = coeffMatch[2];
    // wrong coefficient
    uniqueAdd(pool, correct.replace(`${coef}${varChar}`, `${coef + 1}${varChar}`), correct);
    uniqueAdd(pool, correct.replace(`${coef}${varChar}`, `${coef - 1}${varChar}`), correct);
    uniqueAdd(pool, correct.replace(`${coef}${varChar}`, `${coef * 2}${varChar}`), correct);
  }

  // sign flip on constant term
  const signFlip = correct
    .replace(' + ', ' − ')
    .replace(' - ', ' + ');
  uniqueAdd(pool, signFlip, correct);

  // append common wrong suffixes
  uniqueAdd(pool, `${correct} + 1`, correct);
  uniqueAdd(pool, `${correct} - 1`, correct);
  uniqueAdd(pool, `2(${correct})`, correct);

  // fallback if still thin
  const letters = ['x', 'y', 'n', 'a'];
  for (const l of letters) {
    if (pool.size >= count) break;
    uniqueAdd(pool, `${randInt(2, 9)}${l}`, correct);
  }

  const arr = shuffle([...pool]);
  return arr.slice(0, count);
}

/* ── text domain ────────────────────────────────────────────────────────────── */

const TEXT_FOILS = [
  'unit fraction',
  'proper fraction',
  'improper fraction',
  'mixed number',
  'equivalent fraction',
  'numerator',
  'denominator',
  'whole number',
  'decimal',
  'percentage',
];

function textDistractors(correct: string, count: number): string[] {
  const pool = TEXT_FOILS.filter(t => t !== correct.toLowerCase());
  shuffle(pool);
  return pool.slice(0, count);
}

/* ── public API ─────────────────────────────────────────────────────────────── */

/**
 * Generates `count` unique distractors that are NOT equal to correctAnswer.
 *
 * @param correctAnswer - the right answer (string form)
 * @param count         - how many distractors to generate (usually 3)
 * @param domain        - the answer type, affects distractor generation strategy
 * @returns array of distractor strings (length === count)
 */
export function generateDistractors(
  correctAnswer: string,
  count: number,
  domain: AnswerDomain = 'integer',
): string[] {
  let candidates: string[];

  switch (domain) {
    case 'fraction':
      candidates = fractionDistractors(correctAnswer, count);
      break;
    case 'expression':
      candidates = expressionDistractors(correctAnswer, count);
      break;
    case 'text':
      candidates = textDistractors(correctAnswer, count);
      break;
    default:
      candidates = integerDistractors(correctAnswer, count);
  }

  // Guarantee exactly `count` entries: fill with random integers if needed
  const seen = new Set<string>([correctAnswer, ...candidates]);
  let fill = 1;
  while (candidates.length < count) {
    const fallback = domain === 'fraction'
      ? `${fill}/${randInt(2, 9)}`
      : `${fill * randInt(2, 20)}`;
    if (!seen.has(fallback)) {
      candidates.push(fallback);
      seen.add(fallback);
    }
    fill++;
    if (fill > 200) break; // safety guard
  }

  return candidates.slice(0, count);
}
