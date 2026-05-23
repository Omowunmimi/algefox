/**
 * Core question generation engine for AlgeFox.
 * Instantiates QuestionTemplate rows into concrete QuestionInstance objects.
 */

import type { QuestionTemplate, GeneratorOptions, ParamSchema } from '@/types/question.types';
import type { QuestionInstance } from '@/types/lesson.types';
import {
  randInt,
  pick,
  shuffle,
  simplifyFraction,
  gcd,
  lcm,
  addFractions,
  multiplyFractions,
} from '@/lib/utils/math';
import { getDifficultyBand, getQuestionsForLevel } from './difficulty';
import { generateDistractors } from './distractors';

/* ── Parameter generation ─────────────────────────────────────────────────── */

/**
 * Generates concrete parameter values from a ParamSchema.
 * Respects constraints: min, max, exclude, nonzero, positive, options.
 */
function generateParams(schema: ParamSchema): Record<string, number | string> {
  const params: Record<string, number | string> = {};

  for (const [key, constraint] of Object.entries(schema)) {
    if (constraint.type === 'choice') {
      const opts = constraint.options ?? [];
      params[key] = pick(opts as (string | number)[]);
      continue;
    }

    // int or float
    const min = constraint.min ?? 1;
    const max = constraint.max ?? 10;
    const exclude = new Set(constraint.exclude ?? []);
    if (constraint.nonzero) exclude.add(0);

    let value: number;
    let attempts = 0;
    do {
      if (constraint.type === 'float') {
        value = Math.random() * (max - min) + min;
        value = Math.round(value * 100) / 100;
      } else {
        value = randInt(min, max);
      }
      attempts++;
      if (attempts > 500) {
        // Give up and just take min
        value = min;
        break;
      }
    } while (
      exclude.has(value) ||
      (constraint.positive === true && value <= 0)
    );

    params[key] = value;
  }

  return params;
}

/* ── Template interpolation ───────────────────────────────────────────────── */

/**
 * Interpolates {{paramName}} placeholders in a template string with actual values.
 * Supports simple arithmetic expressions like {{a+b}} by evaluating them safely.
 */
function interpolate(template: string, params: Record<string, number | string>): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (_, expr: string) => {
    const trimmed = expr.trim();
    // Direct param lookup
    if (trimmed in params) return String(params[trimmed]);

    // Try arithmetic evaluation with substituted params
    try {
      let substituted = trimmed;
      // Replace param names with their values (longest names first to avoid partial matches)
      const sortedKeys = Object.keys(params).sort((a, b) => b.length - a.length);
      for (const k of sortedKeys) {
        substituted = substituted.replace(
          new RegExp(`\\b${k}\\b`, 'g'),
          String(params[k]),
        );
      }
      // Only allow safe numeric expressions
      if (/^[0-9+\-*/().\s]+$/.test(substituted)) {
        const result = Function(`"use strict"; return (${substituted})`)() as number;
        return String(Math.round(result * 10000) / 10000);
      }
    } catch {
      // Fall through to return raw expression
    }
    return `{{${expr}}}`;
  });
}

/* ── Answer evaluation ─────────────────────────────────────────────────────── */

/**
 * Evaluates an answer formula with the given params.
 *
 * The formula is a JavaScript expression, e.g. "a + b", "a / b", "(a+c)/b".
 * For fraction answers the formula evaluates to a "n/d" simplified string.
 * For integer answers it returns the integer as a string.
 *
 * Special fraction keywords supported:
 *   add(n1,d1,n2,d2)      → add two fractions, returns simplified "n/d"
 *   mul(n1,d1,n2,d2)      → multiply two fractions
 *   simplify(n,d)         → simplify fraction
 */
function evaluateAnswer(
  formula: string,
  params: Record<string, number | string>,
): string {
  try {
    // Handle quoted string formulas: '"{{a+b}}x"' or '"some literal"'
    // These are templates that produce string results; interpolate then strip quotes.
    if (/^".*"$/.test(formula.trim())) {
      const inner = formula.trim().slice(1, -1); // strip outer double-quotes
      return interpolate(inner, params);
    }

    // Substitute all param names
    let expr = formula;
    const sortedKeys = Object.keys(params).sort((a, b) => b.length - a.length);
    for (const k of sortedKeys) {
      expr = expr.replace(new RegExp(`\\b${k}\\b`, 'g'), String(params[k]));
    }

    // Helper to evaluate a string arg that may be arithmetic like "3*2" or "-1"
    const evalArg = (s: string): number => {
      const trimmed = s.trim();
      if (/^-?[\d.]+$/.test(trimmed)) return Number(trimmed);
      if (/^[0-9+\-*/().\s]+$/.test(trimmed)) {
        return Function(`"use strict"; return (${trimmed})`)() as number;
      }
      return NaN;
    };

    // Handle special fraction helpers
    if (/add\s*\(/.test(expr)) {
      expr = expr.replace(
        /add\s*\(\s*([^,)]+)\s*,\s*([^,)]+)\s*,\s*([^,)]+)\s*,\s*([^,)]+)\s*\)/g,
        (_, rawN1, rawD1, rawN2, rawD2) => {
          const [rn, rd] = addFractions(
            evalArg(rawN1), evalArg(rawD1), evalArg(rawN2), evalArg(rawD2),
          );
          return rd === 1 ? `${rn}` : `${rn}/${rd}`;
        },
      );
    }

    if (/mul\s*\(/.test(expr)) {
      expr = expr.replace(
        /mul\s*\(\s*([^,)]+)\s*,\s*([^,)]+)\s*,\s*([^,)]+)\s*,\s*([^,)]+)\s*\)/g,
        (_, rawN1, rawD1, rawN2, rawD2) => {
          const [rn, rd] = multiplyFractions(
            evalArg(rawN1), evalArg(rawD1), evalArg(rawN2), evalArg(rawD2),
          );
          return rd === 1 ? `${rn}` : `${rn}/${rd}`;
        },
      );
    }

    if (/simplify\s*\(/.test(expr)) {
      expr = expr.replace(
        /simplify\s*\(\s*([^,)]+)\s*,\s*([^,)]+)\s*\)/g,
        (_, rawN, rawD) => {
          const [rn, rd] = simplifyFraction(evalArg(rawN), evalArg(rawD));
          return rd === 1 ? `${rn}` : `${rn}/${rd}`;
        },
      );
    }

    // If the expression resolves to a plain "n/d" string already, return it
    if (/^-?\d+\/-?\d+$/.test(expr.trim())) {
      const [numStr, denStr] = expr.trim().split('/');
      const [rn, rd] = simplifyFraction(Number(numStr), Number(denStr));
      return rd === 1 ? `${rn}` : `${rn}/${rd}`;
    }

    // If it's a string result (e.g. expression formulas), return it directly
    if (/[a-zA-Z]/.test(expr)) {
      return expr.trim();
    }

    // Pure numeric expression — evaluate
    if (/^[0-9+\-*/().\s]+$/.test(expr)) {
      const raw = Function(`"use strict"; return (${expr})`)() as number;

      // Check if the formula itself contained "/" and result looks fractional
      if (formula.includes('/') && !Number.isInteger(raw)) {
        // Express as simplified fraction
        const denom = 10000;
        const approxNum = Math.round(raw * denom);
        const g = gcd(Math.abs(approxNum), denom);
        const [rn, rd] = simplifyFraction(approxNum / g, denom / g);
        return rd === 1 ? `${rn}` : `${rn}/${rd}`;
      }

      return String(Math.round(raw * 10000) / 10000);
    }

    // Fallback: return the substituted expression as-is
    return expr.trim();
  } catch (err) {
    console.error('[generator] evaluateAnswer error:', err, { formula, params });
    return '';
  }
}

/* ── Domain detection ─────────────────────────────────────────────────────── */

type AnswerDomain = 'integer' | 'fraction' | 'expression' | 'text';

function detectDomain(answer: string): AnswerDomain {
  if (/^-?\d+\/-?\d+$/.test(answer)) return 'fraction';
  if (/^-?\d+$/.test(answer)) return 'integer';
  if (/[a-z]/i.test(answer)) return 'expression';
  return 'text';
}

/* ── Single question generation ───────────────────────────────────────────── */

let _instanceCounter = 0;

/**
 * Generates a single question instance from a template.
 */
export function generateQuestion(
  template: QuestionTemplate,
  options?: GeneratorOptions,
): QuestionInstance {
  const params = generateParams(template.paramSchema);

  const questionText = interpolate(template.templateText, params);
  const correctAnswer = evaluateAnswer(template.answerFormula, params);
  const explanation = interpolate(template.explanationTemplate, params);
  const band = options?.forceBand ?? template.difficultyBand;

  let instanceOptions: string[] | undefined;

  if (template.type === 'multiple_choice') {
    const domain = detectDomain(correctAnswer);
    const distractorCount = options?.distractorCount ?? 3;
    const distractors = generateDistractors(correctAnswer, distractorCount, domain);
    instanceOptions = shuffle([correctAnswer, ...distractors]);
  }

  if (template.type === 'true_false') {
    instanceOptions = ['True', 'False'];
  }

  _instanceCounter++;

  return {
    templateId: template.id,
    type: template.type,
    questionText,
    correctAnswer,
    options: instanceOptions,
    explanation,
    hints: template.hints,
    generatedParams: params,
    difficultyBand: band,
  };
}

/* ── Lesson generation ────────────────────────────────────────────────────── */

/**
 * Generates a full lesson (array of question instances).
 *
 * Selects templates appropriate for the level's difficulty band.
 * Shuffles order. Always returns `count` questions (default 10).
 * Falls back to adjacent bands if not enough templates at target band.
 */
export function generateLesson(
  templates: QuestionTemplate[],
  level: number,
  count?: number,
  options?: GeneratorOptions,
): QuestionInstance[] {
  const targetBand = options?.forceBand ?? getDifficultyBand(level);
  const totalCount = count ?? getQuestionsForLevel(level);
  const activeTemplates = templates.filter(t => t.isActive);

  // Priority order: target band first, then adjacent bands, then all
  const bandOrder: (1 | 2 | 3 | 4 | 5)[] = [
    targetBand,
    Math.max(1, targetBand - 1) as 1 | 2 | 3 | 4 | 5,
    Math.min(5, targetBand + 1) as 1 | 2 | 3 | 4 | 5,
    Math.max(1, targetBand - 2) as 1 | 2 | 3 | 4 | 5,
    Math.min(5, targetBand + 2) as 1 | 2 | 3 | 4 | 5,
  ];

  // Deduplicate while preserving order
  const seenBands = new Set<number>();
  const orderedBands = bandOrder.filter(b => {
    if (seenBands.has(b)) return false;
    seenBands.add(b);
    return true;
  });

  const pool: QuestionTemplate[] = [];
  for (const band of orderedBands) {
    const bandTemplates = activeTemplates.filter(t => t.difficultyBand === band);
    pool.push(...bandTemplates);
    if (pool.length >= totalCount) break;
  }

  // If still not enough, use all active templates
  if (pool.length === 0) pool.push(...activeTemplates);

  // Shuffle the pool and pick up to `totalCount` templates
  const shuffledPool = shuffle([...pool]);

  // Generate instances — if fewer templates than needed, cycle through them
  const instances: QuestionInstance[] = [];
  for (let i = 0; i < totalCount; i++) {
    const template = shuffledPool[i % shuffledPool.length];
    instances.push(generateQuestion(template, options));
  }

  return instances;
}
