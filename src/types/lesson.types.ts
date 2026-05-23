import type { QuestionType } from './database.types';

/**
 * Lesson engine types — runtime structures (not DB rows).
 */

/* ── Generated question instance ──────────────────────────── */
export interface QuestionInstance {
  /** Template ID this was generated from */
  templateId: string;
  /** Question type determines which component renders it */
  type: QuestionType;
  /** Rendered question text (params substituted in) */
  questionText: string;
  /** LaTeX-rendered expression if needed */
  questionLatex?: string;
  /** The correct answer as a string */
  correctAnswer: string;
  /** Distractors for multiple choice / match pairs */
  options?: string[];
  /** Items to order / drag */
  items?: DragItem[];
  /** Rendered explanation (params substituted in) */
  explanation: string;
  /** Optional hints array */
  hints: string[];
  /** The params used to generate this instance (for logging) */
  generatedParams: Record<string, number | string>;
  /** Visual data for fraction_visual type */
  visualData?: FractionVisualData;
  /** Pair data for match_pairs type */
  pairs?: MatchPair[];
  /** Difficulty band 1–5 */
  difficultyBand: 1 | 2 | 3 | 4 | 5;
}

export interface DragItem {
  id: string;
  label: string;
  value: string;
}

export interface MatchPair {
  id: string;
  left: string;
  right: string;
}

export interface FractionVisualData {
  numerator: number;
  denominator: number;
  /** 'pie' | 'bar' | 'number_line' */
  displayMode: 'pie' | 'bar' | 'number_line';
}

/* ── Lesson session state ──────────────────────────────────── */
export type LessonPhase =
  | 'loading'
  | 'question'
  | 'feedback_correct'
  | 'feedback_incorrect'
  | 'lesson_complete'
  | 'hearts_empty'
  | 'paused';

export interface LessonSessionState {
  sessionId: string | null;
  sectionId: string;
  sectionTitle: string;
  level: number;
  phase: LessonPhase;
  /** Full queue including retries */
  questionQueue: QuestionInstance[];
  currentIndex: number;
  /** Answers recorded this session */
  answers: AttemptRecord[];
  xpEarned: number;
  heartsLost: number;
  startedAt: number; // Date.now()
  /** IDs of failed questions that still need a retry */
  pendingRetries: string[]; // templateIds
}

export interface AttemptRecord {
  templateId: string;
  userAnswer: string;
  isCorrect: boolean;
  timeTakenMs: number;
  hintUsed: boolean;
  attemptNumber: number;
}

/* ── Lesson result (passed to reward screen) ───────────────── */
export interface LessonResult {
  sectionId: string;
  sectionTitle: string;
  level: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number; // 0–1
  xpEarned: number;
  heartsLost: number;
  timeTakenSeconds: number;
  isPerfect: boolean;
  isFirstCompletion: boolean;
  newAchievements: string[]; // achievement slugs
}

/* ── Progress ──────────────────────────────────────────────── */
export interface SectionProgress {
  sectionId: string;
  sectionSlug: string;
  sectionTitle: string;
  currentLevel: number;
  highestLevel: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  /** 0–1 representing progress within current level band */
  progressPercent: number;
}

export interface UnitProgress {
  unitId: string;
  unitTitle: string;
  subject: 'fractions' | 'algebra';
  sections: SectionProgress[];
  totalLevelsCompleted: number;
}
