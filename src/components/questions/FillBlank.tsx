'use client';

import { ReactNode, useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { InlineMath } from 'react-katex';
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

export function FillBlank({
  question,
  onAnswer,
  disabled = false,
  selectedAnswer = null,
  isCorrect = null,
}: QuestionComponentProps) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const answered = selectedAnswer !== null;

  // Auto-focus on mount
  useEffect(() => {
    if (!disabled && !answered) {
      inputRef.current?.focus();
    }
  }, [disabled, answered]);

  function handleSubmit() {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    onAnswer(trimmed);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !answered && !disabled) {
      handleSubmit();
    }
  }

  function getInputBorderClass() {
    if (!answered) return 'border-gray-200 focus:border-primary';
    if (isCorrect === true) return 'border-success bg-success-bg';
    if (isCorrect === false) return 'border-error bg-error-bg';
    return 'border-gray-200';
  }

  const canSubmit = !disabled && !answered && inputValue.trim().length > 0;

  return (
    <motion.div
      className="flex flex-col gap-5 w-full"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
    >
      {/* Question text */}
      <p className="font-display text-xl font-semibold text-gray-900 leading-snug px-1">
        {renderMathText(question.questionText)}
      </p>

      {/* Input field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={answered ? (selectedAnswer ?? '') : inputValue}
          onChange={(e) => !answered && !disabled && setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || answered}
          placeholder="Type your answer..."
          className={cn(
            'w-full border-2 rounded-xl px-4 py-4 min-h-14',
            'text-center font-display text-2xl text-gray-900',
            'transition-colors duration-150 outline-none',
            'placeholder:text-gray-300 placeholder:font-ui placeholder:text-base',
            getInputBorderClass(),
            (disabled || answered) && 'cursor-default',
          )}
        />

        {/* Feedback badge */}
        {answered && (
          <span
            className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2',
              'font-bold text-xl',
              isCorrect === true ? 'text-success' : 'text-error',
            )}
          >
            {isCorrect === true ? '✓' : '✗'}
          </span>
        )}
      </div>

      {/* Feedback text */}
      {answered && (
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'text-center font-ui font-semibold text-base',
            isCorrect === true ? 'text-success' : 'text-error',
          )}
        >
          {isCorrect === true
            ? 'Correct! Well done!'
            : `The correct answer is: ${question.correctAnswer}`}
        </motion.p>
      )}

      {/* Check Answer button */}
      {!answered && (
        <motion.button
          whileTap={canSubmit ? { y: 4, boxShadow: 'none' } : undefined}
          style={canSubmit ? { boxShadow: 'var(--shadow-physical-primary)' } : undefined}
          disabled={!canSubmit}
          onClick={handleSubmit}
          className={cn(
            'w-full min-h-14 rounded-2xl font-display font-bold text-lg',
            'transition-all duration-150 select-none',
            canSubmit
              ? 'bg-primary text-white cursor-pointer'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed',
          )}
        >
          Check Answer
        </motion.button>
      )}
    </motion.div>
  );
}
