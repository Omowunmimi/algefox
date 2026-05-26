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

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

// ─── Component ────────────────────────────────────────────────────────────────

export function MultipleChoice({
  question,
  onAnswer,
  disabled = false,
  selectedAnswer = null,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isCorrect: _isCorrect = null,
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
        return 'border-gray-100 bg-white opacity-50';
      default:
        return 'border-gray-200 bg-white hover:border-primary hover:bg-primary-lighter active:scale-[0.98]';
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
      <motion.div
        className="flex flex-col gap-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {options.map((option, index) => {
          const state = getOptionState(option);
          const isCorrectAnswer = option === question.correctAnswer;
          const isSelected = option === selectedAnswer;
          const canTap = !disabled && !answered;

          /* Border / background per state */
          const borderColor =
            state === 'correct' ? '#10B981' :
            state === 'wrong'   ? '#F43F5E' :
            state === 'default' ? (isSelected ? '#8A2BE2' : '#E5E7EB') : '#E5E7EB';

          const bgColor =
            state === 'correct' ? '#ECFDF5' :
            state === 'wrong'   ? '#FFF1F2' :
            state === 'default' ? (isSelected ? '#F5F0FF' : '#FFFFFF') : '#FFFFFF';

          return (
            <motion.button
              key={option}
              variants={itemVariants}
              whileTap={canTap ? { scale: 0.985, y: 2 } : undefined}
              disabled={disabled || answered}
              onClick={() => !disabled && !answered && onAnswer(option)}
              className={cn(
                'relative w-full flex items-center gap-3 rounded-2xl border-2 text-left select-none',
                'transition-colors duration-150',
                (disabled || answered) ? 'cursor-default' : 'cursor-pointer',
                state === 'neutral' && 'opacity-50',
              )}
              style={{
                borderColor,
                background: bgColor,
                padding: '18px 16px',
                boxShadow: canTap ? '0 3px 0 0 #D1D5DB' : 'none',
              }}
            >
              {/* Option label */}
              <span
                className={cn(
                  'shrink-0 w-9 h-9 rounded-full flex items-center justify-center',
                  'font-display font-bold text-sm transition-colors duration-150',
                  getLabelClasses(state),
                )}
              >
                {OPTION_LABELS[index] ?? String.fromCharCode(65 + index)}
              </span>

              {/* Option text — big and bold like the reference */}
              <span className="font-display text-xl font-bold text-gray-900 flex-1">
                {renderMathText(option)}
              </span>

              {/* Feedback icon */}
              {answered && isCorrectAnswer && (
                <span className="ml-auto font-bold text-xl" style={{ color: '#10B981' }}>✓</span>
              )}
              {answered && isSelected && !isCorrectAnswer && (
                <span className="ml-auto font-bold text-xl" style={{ color: '#F43F5E' }}>✗</span>
              )}
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
