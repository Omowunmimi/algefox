'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
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

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

// ─── Component ────────────────────────────────────────────────────────────────

export function MultipleChoice({
  question,
  onAnswer,
  disabled = false,
  selectedAnswer = null,
  isCorrect = null,
}: QuestionComponentProps) {
  const options = question.options ?? [];
  const answered = selectedAnswer !== null;

  function getOptionState(option: string) {
    if (!answered) return 'default';
    const isCorrectAnswer = option === question.correctAnswer;
    const isSelected = option === selectedAnswer;
    if (isCorrectAnswer) return 'correct';
    if (isSelected && !isCorrectAnswer) return 'wrong';
    return 'neutral';
  }

  function getOptionClasses(state: string) {
    switch (state) {
      case 'correct':
        return 'border-success bg-success-bg';
      case 'wrong':
        return 'border-error bg-error-bg';
      case 'neutral':
        return 'border-gray-200 bg-white opacity-60';
      default:
        return 'border-gray-200 bg-white hover:border-primary hover:bg-primary-lighter';
    }
  }

  function getLabelClasses(state: string) {
    switch (state) {
      case 'correct':
        return 'bg-success text-white';
      case 'wrong':
        return 'bg-error text-white';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 400, damping: 28 } },
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Question text */}
      <p className="font-display text-xl font-semibold text-gray-900 leading-snug px-1">
        {renderMathText(question.questionText)}
      </p>

      {/* Options grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {options.map((option, index) => {
          const state = getOptionState(option);
          const isCorrectAnswer = option === question.correctAnswer;
          const isSelected = option === selectedAnswer;
          const canTap = !disabled && !answered;

          return (
            <motion.button
              key={option}
              variants={itemVariants}
              whileTap={canTap ? { y: 4, boxShadow: 'none' } : undefined}
              style={canTap ? { boxShadow: 'var(--shadow-physical)' } : undefined}
              disabled={disabled || answered}
              onClick={() => !disabled && !answered && onAnswer(option)}
              className={cn(
                'relative flex items-center gap-3 rounded-2xl border-2 p-4 min-h-[56px] text-left',
                'transition-colors duration-150 cursor-pointer select-none',
                getOptionClasses(state),
                (disabled || answered) && 'cursor-default',
              )}
            >
              {/* Option label circle */}
              <span
                className={cn(
                  'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                  'font-display font-bold text-sm transition-colors duration-150',
                  getLabelClasses(state),
                )}
              >
                {OPTION_LABELS[index] ?? String.fromCharCode(65 + index)}
              </span>

              {/* Option text */}
              <span className="font-ui text-base text-gray-800 flex-1">
                {renderMathText(option)}
              </span>

              {/* Feedback icon */}
              {answered && isCorrectAnswer && (
                <span className="ml-auto text-success font-bold text-lg">✓</span>
              )}
              {answered && isSelected && !isCorrectAnswer && (
                <span className="ml-auto text-error font-bold text-lg">✗</span>
              )}
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
