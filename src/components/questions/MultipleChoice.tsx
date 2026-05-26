'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { InlineMath } from 'react-katex';
import { cn } from '@/lib/utils/cn';
import type { QuestionInstance } from '@/types/lesson.types';

// ─── Math rendering ────────────────────────────────────────────────────────────

function renderMathText(text: string): ReactNode {
  if (!text.includes('$')) return text;
  const parts = text.split(/(\$[^$]+\$)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('$') && part.endsWith('$')) {
          return <InlineMath key={i} math={part.slice(1, -1)} />;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

// ─── Vertical fraction renderer ────────────────────────────────────────────────
// Detects "a/b" patterns and renders them as stacked fractions

function renderOptionContent(option: string): ReactNode {
  // Check for simple fraction like "1/2", "3/4" etc.
  const fractionMatch = option.match(/^(\d+)\/(\d+)$/);
  if (fractionMatch) {
    return (
      <div className="flex flex-col items-center leading-none">
        <span className="font-display text-2xl font-bold text-gray-900">{fractionMatch[1]}</span>
        <div className="w-full h-[3px] rounded-full bg-gray-800 my-1" />
        <span className="font-display text-2xl font-bold text-gray-900">{fractionMatch[2]}</span>
      </div>
    );
  }
  // Default: inline math or plain text
  return (
    <span className="font-display text-xl font-bold text-gray-900">
      {renderMathText(option)}
    </span>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuestionComponentProps {
  question: QuestionInstance;
  onAnswer: (answer: string) => void;   // called on selection (or on submit via parent)
  disabled?: boolean;
  selectedAnswer?: string | null;       // currently highlighted option
  submittedAnswer?: string | null;      // answer that was actually submitted (for correct/wrong display)
  isCorrect?: boolean | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MultipleChoice({
  question,
  onAnswer,
  disabled = false,
  selectedAnswer = null,
  submittedAnswer = null,
  isCorrect: _isCorrect = null,
}: QuestionComponentProps) {
  const options = question.options ?? [];
  const isSubmitted = submittedAnswer !== null;

  function getState(option: string) {
    if (!isSubmitted) return selectedAnswer === option ? 'selected' : 'idle';
    if (option === question.correctAnswer) return 'correct';
    if (option === submittedAnswer) return 'wrong';
    return 'dim';
  }

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 380, damping: 28 } },
  };

  return (
    <motion.div
      className="flex flex-col gap-2.5 w-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {options.map((option) => {
        const state = getState(option);
        const canTap = !disabled && !isSubmitted;

        const borderColor =
          state === 'correct'  ? '#10B981' :
          state === 'wrong'    ? '#F43F5E' :
          state === 'selected' ? '#8A2BE2' : '#E5E7EB';

        const bgColor =
          state === 'correct'  ? '#ECFDF5' :
          state === 'wrong'    ? '#FFF1F2' :
          state === 'selected' ? '#F5F0FF' :
          state === 'dim'      ? '#FAFAFA' : '#FFFFFF';

        const radioFill =
          state === 'selected' ? '#8A2BE2' :
          state === 'correct'  ? '#10B981' :
          state === 'wrong'    ? '#F43F5E' : 'transparent';

        const radioStroke =
          state === 'selected' || state === 'correct' || state === 'wrong'
            ? 'transparent'
            : '#D1D5DB';

        return (
          <motion.button
            key={option}
            variants={itemVariants}
            onClick={() => canTap && onAnswer(option)}
            disabled={disabled || isSubmitted}
            className={cn(
              'relative w-full flex items-center gap-4 rounded-2xl border-2 text-left transition-colors duration-150',
              canTap ? 'cursor-pointer active:scale-[0.99]' : 'cursor-default',
              state === 'dim' && 'opacity-40',
            )}
            style={{
              borderColor,
              background: bgColor,
              padding: '16px 20px',
            }}
            whileTap={canTap ? { scale: 0.985 } : undefined}
          >
            {/* Radio circle */}
            <div
              className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors"
              style={{ borderColor: radioStroke || radioFill, background: radioFill }}
            >
              {(state === 'selected' || state === 'correct' || state === 'wrong') && (
                <div className="w-2.5 h-2.5 rounded-full bg-white" />
              )}
            </div>

            {/* Option content */}
            <div className="flex-1 flex items-center justify-start">
              {renderOptionContent(option)}
            </div>

            {/* Post-submit icon */}
            {state === 'correct' && (
              <span className="ml-auto text-success font-bold text-lg">✓</span>
            )}
            {state === 'wrong' && (
              <span className="ml-auto text-error font-bold text-lg">✗</span>
            )}
          </motion.button>
        );
      })}
    </motion.div>
  );
}
