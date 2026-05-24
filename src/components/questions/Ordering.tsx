'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import type { QuestionInstance, DragItem } from '@/types/lesson.types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuestionComponentProps {
  question: QuestionInstance;
  onAnswer: (answer: string) => void;
  disabled?: boolean;
  selectedAnswer?: string | null;
  isCorrect?: boolean | null;
}

// ─── Shuffle ──────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ─── Chip animation variants ──────────────────────────────────────────────────

const chipVariants = {
  initial: { opacity: 0, scale: 0.85 },
  animate: { opacity: 1, scale: 1, transition: { type: 'spring' as const, stiffness: 400, damping: 26 } },
  exit: { opacity: 0, scale: 0.85, transition: { duration: 0.15 } },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function Ordering({
  question,
  onAnswer,
  disabled = false,
  selectedAnswer = null,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isCorrect: _isCorrect = null,
}: QuestionComponentProps) {
  const items: DragItem[] = useMemo(() => question.items ?? [], [question.items]);

  const [pool, setPool] = useState<DragItem[]>([]);
  const [answer, setAnswer] = useState<DragItem[]>([]);
  // Flash state for feedback: null | 'correct' | 'wrong'
  const [flash, setFlash] = useState<'correct' | 'wrong' | null>(null);

  // Initialise on mount / question change
  useEffect(() => {
    setPool(shuffle(items));
    setAnswer([]);
    setFlash(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.templateId]);

  const moveToAnswer = useCallback((item: DragItem) => {
    if (disabled) return;
    setPool((prev) => prev.filter((p) => p.id !== item.id));
    setAnswer((prev) => [...prev, item]);
  }, [disabled]);

  const moveToPool = useCallback((item: DragItem) => {
    if (disabled) return;
    setAnswer((prev) => prev.filter((a) => a.id !== item.id));
    setPool((prev) => [...prev, item]);
  }, [disabled]);

  const allPlaced = pool.length === 0 && answer.length === items.length;

  const handleCheck = useCallback(() => {
    if (!allPlaced || disabled) return;
    const userOrder = answer.map((a) => a.id).join(',');
    const correct = question.correctAnswer;
    if (userOrder === correct) {
      setFlash('correct');
      setTimeout(() => onAnswer(userOrder), 500);
    } else {
      setFlash('wrong');
      // Reset after flash
      setTimeout(() => {
        setPool(shuffle(items));
        setAnswer([]);
        setFlash(null);
      }, 800);
    }
  }, [allPlaced, disabled, answer, question.correctAnswer, items, onAnswer]);

  const answered = selectedAnswer !== null;

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Instruction */}
      <p className="font-ui text-sm text-gray-500 text-center">
        Tap items in the correct order.
      </p>

      {/* Item pool */}
      <div>
        <p className="font-ui text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
          Items
        </p>
        <div className="min-h-14 bg-gray-50 rounded-2xl p-2 flex flex-wrap gap-2 border-2 border-gray-100">
          <AnimatePresence mode="popLayout">
            {pool.map((item) => (
              <motion.button
                key={item.id}
                layoutId={`chip-${item.id}`}
                variants={chipVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                whileTap={!disabled ? { y: 2, scale: 0.96 } : undefined}
                style={!disabled ? { boxShadow: 'var(--shadow-physical)' } : undefined}
                disabled={disabled}
                onClick={() => moveToAnswer(item)}
                className={cn(
                  'bg-white border-2 border-gray-200 rounded-xl px-4 py-3 font-ui text-sm text-gray-700',
                    'min-h-12 select-none transition-colors duration-150',
                  disabled ? 'cursor-default' : 'cursor-pointer hover:border-primary hover:bg-primary-lighter',
                )}
              >
                {item.label}
              </motion.button>
            ))}
          </AnimatePresence>
          {pool.length === 0 && (
            <span className="font-ui text-sm text-gray-300 m-auto">All placed</span>
          )}
        </div>
      </div>

      {/* Answer row */}
      <div>
        <p className="font-ui text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
          Your order
        </p>
        <motion.div
          animate={
            flash === 'correct'
              ? { backgroundColor: 'var(--color-success-bg, #dcfce7)' }
              : flash === 'wrong'
              ? { backgroundColor: 'var(--color-error-bg, #fee2e2)' }
              : { backgroundColor: '#f3f4f6' }
          }
          transition={{ duration: 0.25 }}
          className={cn(
              'min-h-14 rounded-2xl p-2 flex flex-wrap gap-2 border-2',
            flash === 'correct' ? 'border-success' : flash === 'wrong' ? 'border-error' : 'border-gray-200',
          )}
        >
          <AnimatePresence mode="popLayout">
            {answer.map((item, index) => (
              <motion.button
                key={item.id}
                layoutId={`chip-${item.id}`}
                variants={chipVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                whileTap={!disabled && !flash ? { y: 2, scale: 0.96 } : undefined}
                disabled={disabled || !!flash}
                onClick={() => !flash && moveToPool(item)}
                className={cn(
                    'border-2 rounded-xl px-4 py-3 font-ui text-sm min-h-12 select-none',
                  'transition-colors duration-150 flex items-center gap-1.5',
                  flash === 'correct'
                    ? 'bg-success-bg border-success text-success-dark cursor-default'
                    : flash === 'wrong'
                    ? 'bg-error-bg border-error text-error-dark cursor-default'
                    : 'bg-primary-lighter border-primary text-primary-dark cursor-pointer hover:bg-primary hover:text-white',
                )}
              >
                <span className="font-display font-bold text-xs opacity-50">{index + 1}</span>
                {item.label}
              </motion.button>
            ))}
          </AnimatePresence>
          {answer.length === 0 && (
            <span className="font-ui text-sm text-gray-300 m-auto">Tap items above to order them</span>
          )}
        </motion.div>
      </div>

      {/* Check button */}
      {!answered && (
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!allPlaced || disabled || !!flash}
          onClick={handleCheck}
        >
          Check
        </Button>
      )}
    </div>
  );
}
