'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';
import type { MascotExpression } from '@/types/gamification.types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FeedbackOverlayProps {
  isVisible: boolean;
  isCorrect: boolean;
  explanation: string;
  correctAnswer?: string;
  onContinue: () => void;
  mascotExpression?: MascotExpression;
}

// ─── Ayo phrases ──────────────────────────────────────────────────────────────

const CORRECT_PHRASES = [
  "Ehen! That's right! 🎉",
  'Yes yes yes! You got it! ⭐',
  'Correct! Sharp student! 🦊',
  "Let's go! That's it! 🔥",
];

const INCORRECT_PHRASES = [
  "No wahala — here's the trick:",
  "Almost! Let's see how:",
  "Don't worry, let's break it down:",
  'Oya, check this out:',
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FeedbackOverlay({
  isVisible,
  isCorrect,
  explanation,
  correctAnswer,
  onContinue,
}: FeedbackOverlayProps) {
  // Stable random phrases per render (only changes when isVisible flips on)
  const ayoPhrase = useMemo(
    () => (isCorrect ? pickRandom(CORRECT_PHRASES) : pickRandom(INCORRECT_PHRASES)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isVisible, isCorrect],
  );

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="feedback-overlay"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 400, damping: 40 }}
          className={cn(
            'fixed bottom-0 left-0 right-0 z-40',
            'border-t-4',
            isCorrect
              ? 'bg-success-bg border-success'
              : 'bg-error-bg border-error',
          )}
        >
          <div className="p-6 pb-safe flex flex-col gap-3 max-w-lg mx-auto">
            {/* Header */}
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'font-display text-xl font-bold',
                  isCorrect ? 'text-success' : 'text-error',
                )}
              >
                {isCorrect ? '✓ Correct!' : '✗ Not quite'}
              </span>
            </div>

            {/* Ayo speech */}
            <p
              className={cn(
                'font-ui text-sm font-semibold',
                isCorrect ? 'text-success-dark' : 'text-error',
              )}
            >
              {ayoPhrase}
            </p>

            {/* Correct answer box (only when wrong) */}
            {!isCorrect && correctAnswer && (
              <div
                className={cn(
                  'rounded-xl border-2 border-error bg-white px-4 py-2',
                )}
              >
                <span className="font-ui text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  The answer is:
                </span>
                <p className="font-display text-base font-bold text-gray-900 mt-0.5">
                  {correctAnswer}
                </p>
              </div>
            )}

            {/* Explanation */}
            {explanation && (
              <p className="font-ui text-sm text-gray-700 leading-relaxed">
                {explanation}
              </p>
            )}

            {/* Continue button */}
            <Button
              variant={isCorrect ? 'success' : 'outline'}
              size="lg"
              fullWidth
              onClick={onContinue}
              className={cn(
                !isCorrect && 'border-error text-error hover:bg-error hover:text-white',
              )}
            >
              {isCorrect ? 'Continue →' : 'Got it →'}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
