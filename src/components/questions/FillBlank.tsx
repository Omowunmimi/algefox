'use client';

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import type { QuestionInstance } from '@/types/lesson.types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuestionComponentProps {
  question: QuestionInstance;
  onAnswer: (answer: string) => void;
  disabled?: boolean;
  selectedAnswer?: string | null;
  submittedAnswer?: string | null;
  isCorrect?: boolean | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FillBlank({
  question,
  onAnswer,
  disabled = false,
  selectedAnswer = null,
  submittedAnswer = null,
}: QuestionComponentProps) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // When the parent resets (new question), clear local input
  useEffect(() => {
    if (selectedAnswer === null && submittedAnswer === null) {
      setInputValue('');
    }
  }, [selectedAnswer, submittedAnswer]);

  // Auto-focus on mount
  useEffect(() => {
    if (!disabled && submittedAnswer === null) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [disabled, submittedAnswer]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (disabled || submittedAnswer !== null) return;
    const value = e.target.value;
    setInputValue(value);
    // Keep parent in sync so the BottomBar "Check" activates
    onAnswer(value);
  }

  // Show the submitted value if answered, otherwise the live input
  const displayValue = submittedAnswer !== null ? submittedAnswer : inputValue;

  const borderStyle =
    submittedAnswer !== null
      ? { borderColor: '#D1D5DB' }
      : selectedAnswer && selectedAnswer.trim()
      ? { borderColor: '#8A2BE2' }
      : { borderColor: '#E5E7EB' };

  return (
    <motion.div
      className="flex flex-col w-full"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
    >
      {/* Answer input */}
      <input
        ref={inputRef}
        type="text"
        value={displayValue}
        onChange={handleChange}
        disabled={disabled || submittedAnswer !== null}
        placeholder="Type your answer here..."
        className={cn(
          'w-full border-2 rounded-2xl px-4 py-5',
          'text-center font-display text-2xl font-bold text-gray-900',
          'transition-colors duration-150 outline-none bg-white',
          'placeholder:text-gray-300 placeholder:font-ui placeholder:text-base placeholder:font-normal',
          (disabled || submittedAnswer !== null) && 'cursor-default opacity-80',
        )}
        style={borderStyle}
      />
    </motion.div>
  );
}
