/**
 * AlgeFox question generation engine — public API barrel.
 *
 * Usage:
 *   import { generateQuestion, generateLesson, getDifficultyBand } from '@/lib/engine';
 */

export { getDifficultyBand, getQuestionsForLevel, getBaseXpForBand } from './difficulty';
export type { DifficultyBand } from './difficulty';

export { generateDistractors } from './distractors';

export { generateQuestion, generateLesson } from './generator';
