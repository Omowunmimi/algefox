import type { QuestionType } from './database.types';

/**
 * Question template and generation types.
 */

/* ── Parameter schema ──────────────────────────────────────── */
export interface ParamConstraint {
  type: 'int' | 'float' | 'choice';
  /** For int/float */
  min?: number;
  max?: number;
  /** Exclude these specific values */
  exclude?: number[];
  /** For choice type */
  options?: (string | number)[];
  /** Must be nonzero? */
  nonzero?: boolean;
  /** Must be positive? */
  positive?: boolean;
}

export type ParamSchema = Record<string, ParamConstraint>;

/* ── Template DB row (local representation) ────────────────── */
export interface QuestionTemplate {
  id: string;
  sectionId: string;
  type: QuestionType;
  difficultyBand: 1 | 2 | 3 | 4 | 5;
  /** Template with {{param}} placeholders */
  templateText: string;
  paramSchema: ParamSchema;
  /** JS-evaluable formula string, e.g. "a + b" */
  answerFormula: string;
  /** Template for explanation text */
  explanationTemplate: string;
  hints: string[];
  isActive: boolean;
}

/* ── Generator options ─────────────────────────────────────── */
export interface GeneratorOptions {
  /** Force specific difficulty band instead of auto-scaling */
  forceBand?: 1 | 2 | 3 | 4 | 5;
  /** Seed for reproducible generation (testing) */
  seed?: number;
  /** Number of distractor options to generate for MC */
  distractorCount?: number;
}

/* ── Distractor generation strategies ─────────────────────── */
export type DistractorStrategy =
  | 'near_miss'       // answer ± small delta
  | 'common_error'    // typical student mistake
  | 'random_valid'    // valid but wrong value from same domain
  | 'sign_flip';      // negate the answer

/* ── Content seeding ───────────────────────────────────────── */
export interface SectionSeedData {
  sectionSlug: string;
  templates: Omit<QuestionTemplate, 'id' | 'sectionId'>[];
}
