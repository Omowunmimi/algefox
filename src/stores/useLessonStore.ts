'use client';

import { create } from 'zustand';
import type { LessonPhase, QuestionInstance, AttemptRecord } from '@/types/lesson.types';

/* ── State ─────────────────────────────────────────────────── */
interface LessonState {
  /* Session identity */
  sessionId: string | null;
  sectionId: string | null;
  sectionTitle: string;
  level: number;

  /* Phase drives which UI renders */
  phase: LessonPhase;

  /* Question queue */
  questionQueue: QuestionInstance[];
  currentIndex: number;

  /* Results */
  answers: AttemptRecord[];
  xpEarned: number;
  heartsLost: number;

  /* Timing */
  startedAt: number | null;
  questionStartedAt: number | null;

  /* Retry tracking */
  pendingRetries: string[];

  /* Hint state for current question */
  currentHintIndex: number;
  hintUsedThisQuestion: boolean;

  /* Actions */
  initSession: (params: {
    sessionId: string;
    sectionId: string;
    sectionTitle: string;
    level: number;
    questions: QuestionInstance[];
  }) => void;

  setPhase: (phase: LessonPhase) => void;
  submitAnswer: (answer: string) => void;
  advanceQuestion: () => void;
  useHint: () => void;
  loseHeart: () => void;
  addXp: (amount: number) => void;
  queueRetry: (templateId: string) => void;
  appendRetryQuestions: (questions: QuestionInstance[]) => void;
  resetLesson: () => void;
}

/* ── Computed helpers ──────────────────────────────────────── */
const initialState = {
  sessionId: null,
  sectionId: null,
  sectionTitle: '',
  level: 1,
  phase: 'loading' as LessonPhase,
  questionQueue: [] as QuestionInstance[],
  currentIndex: 0,
  answers: [] as AttemptRecord[],
  xpEarned: 0,
  heartsLost: 0,
  startedAt: null,
  questionStartedAt: null,
  pendingRetries: [] as string[],
  currentHintIndex: -1,
  hintUsedThisQuestion: false,
};

/* ── Store ─────────────────────────────────────────────────── */
export const useLessonStore = create<LessonState>()((set, get) => ({
  ...initialState,

  initSession: ({ sessionId, sectionId, sectionTitle, level, questions }) =>
    set({
      ...initialState,
      sessionId,
      sectionId,
      sectionTitle,
      level,
      questionQueue: questions,
      phase: 'question',
      startedAt: Date.now(),
      questionStartedAt: Date.now(),
    }),

  setPhase: (phase) => set({ phase }),

  submitAnswer: (answer) => {
    const { currentIndex, questionQueue, questionStartedAt, hintUsedThisQuestion, answers } =
      get();
    const q = questionQueue[currentIndex];
    if (!q) return;

    const isCorrect = answer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
    const timeTakenMs = questionStartedAt ? Date.now() - questionStartedAt : 0;

    // Count previous attempts at this template
    const previousAttempts = answers.filter((a) => a.templateId === q.templateId).length;

    const record: AttemptRecord = {
      templateId: q.templateId,
      userAnswer: answer,
      isCorrect,
      timeTakenMs,
      hintUsed: hintUsedThisQuestion,
      attemptNumber: previousAttempts + 1,
    };

    set((state) => ({
      answers: [...state.answers, record],
      phase: isCorrect ? 'feedback_correct' : 'feedback_incorrect',
    }));
  },

  advanceQuestion: () => {
    const { currentIndex, questionQueue } = get();
    const nextIndex = currentIndex + 1;

    if (nextIndex >= questionQueue.length) {
      set({ phase: 'lesson_complete' });
    } else {
      set({
        currentIndex: nextIndex,
        phase: 'question',
        questionStartedAt: Date.now(),
        currentHintIndex: -1,
        hintUsedThisQuestion: false,
      });
    }
  },

  useHint: () =>
    set((state) => ({
      currentHintIndex: state.currentHintIndex + 1,
      hintUsedThisQuestion: true,
    })),

  loseHeart: () =>
    set((state) => ({ heartsLost: state.heartsLost + 1 })),

  addXp: (amount) =>
    set((state) => ({ xpEarned: state.xpEarned + amount })),

  queueRetry: (templateId) =>
    set((state) => ({
      pendingRetries: [...state.pendingRetries, templateId],
    })),

  appendRetryQuestions: (questions) =>
    set((state) => ({
      questionQueue: [...state.questionQueue, ...questions],
      pendingRetries: [],
    })),

  resetLesson: () => set(initialState),
}));

/* ── Selectors ─────────────────────────────────────────────── */
export const selectCurrentQuestion = (s: LessonState): QuestionInstance | null =>
  s.questionQueue[s.currentIndex] ?? null;

// selectProgress removed — use individual primitives to avoid infinite-loop snapshots

export const selectAccuracy = (s: LessonState) => {
  if (s.answers.length === 0) return 1;
  const correct = s.answers.filter((a) => a.isCorrect).length;
  return correct / s.answers.length;
};
