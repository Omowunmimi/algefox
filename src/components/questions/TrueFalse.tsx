'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { InlineMath } from 'react-katex';
// import 'katex/dist/katex.min.css';
import { cn } from '@/lib/utils/cn';
import type { QuestionInstance } from '@/types/lesson.types';

// ─── Math text helper ─────────────────────────────────────────────────────────

function renderMathText(text: string): ReactNode {
  if (!text.includes('$')) return text;
  const parts = text.split(/(\$[^$]+\$)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('$') && part.endsWith('$')) {
          const latex = part.slice(1, -1);
          return <InlineMath key={i} math={latex} />;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuestionComponentProps {
  question: QuestionInstance;
  onAnswer: (answer: string) => void;
  disabled?: boolean;
  selectedAnswer?: string | null;
  isCorrect?: boolean | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TrueFalse({
  question,
  onAnswer,
  disabled = false,
  selectedAnswer = null,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isCorrect: _isCorrect = null,
}: QuestionComponentProps) {
  const answered = selectedAnswer !== null;
  // correctAnswer is 'True' or 'False'
  const correct = question.correctAnswer;

  function getButtonState(value: 'True' | 'False') {
    if (!answered) return 'default';
    const isCorrectAnswer = value === correct;
    const isSelected = value === selectedAnswer;
    if (isCorrectAnswer) return 'correct';
    if (isSelected) return 'wrong';
    return 'neutral';
  }

  function getTrueClasses(state: string) {
    switch (state) {
      case 'correct':
        return 'bg-success border-success text-white';
      case 'wrong':
        return 'bg-error border-error text-white';
      case 'neutral':
        return 'bg-success-light border-success text-success-darker opacity-50';
      default:
        // default styling: green-ish
        return 'bg-success-light border-success text-success-dark hover:bg-success hover:text-white';
    }
  }

  function getFalseClasses(state: string) {
    switch (state) {
      case 'correct':
        return 'bg-success border-success text-white';
      case 'wrong':
        return 'bg-error border-error text-white';
      case 'neutral':
        return 'bg-error-light border-error text-error-dark opacity-50';
      default:
        // default styling: rose-ish
        return 'bg-error-bg border-error-light text-error hover:bg-error hover:text-white';
    }
  }

  const trueState = getButtonState('True');
  const falseState = getButtonState('False');
  const canTap = !disabled && !answered;

  return (
    <motion.div
      className="flex flex-col gap-6 w-full"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
    >
      {/* Statement */}
      <p className="font-display text-xl font-semibold text-gray-900 leading-snug px-1 text-center">
        {renderMathText(question.questionText)}
      </p>

      {/* True / False buttons */}
      <div className="flex gap-4">
        {/* TRUE */}
        <motion.button
          whileTap={canTap ? { y: 4, boxShadow: 'none' } : undefined}
          style={canTap ? { boxShadow: 'var(--shadow-physical-success)' } : undefined}
          disabled={disabled || answered}
          onClick={() => canTap && onAnswer('True')}
          className={cn(
            'flex-1 min-h-[80px] rounded-2xl border-2 font-display font-bold text-2xl',
            'transition-all duration-150 select-none flex items-center justify-center gap-2',
            getTrueClasses(trueState),
            (disabled || answered) && 'cursor-default',
          )}
        >
          {answered && trueState === 'correct' && <span>✓</span>}
          {answered && trueState === 'wrong' && <span>✗</span>}
          TRUE
        </motion.button>

        {/* FALSE */}
        <motion.button
          whileTap={canTap ? { y: 4, boxShadow: 'none' } : undefined}
          style={canTap ? { boxShadow: 'var(--shadow-physical-error)' } : undefined}
          disabled={disabled || answered}
          onClick={() => canTap && onAnswer('False')}
          className={cn(
            'flex-1 min-h-[80px] rounded-2xl border-2 font-display font-bold text-2xl',
            'transition-all duration-150 select-none flex items-center justify-center gap-2',
            getFalseClasses(falseState),
            (disabled || answered) && 'cursor-default',
          )}
        >
          {answered && falseState === 'correct' && <span>✓</span>}
          {answered && falseState === 'wrong' && <span>✗</span>}
          FALSE
        </motion.button>
      </div>
    </motion.div>
  );
}
