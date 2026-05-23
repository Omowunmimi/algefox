'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import type { QuestionInstance, MatchPair } from '@/types/lesson.types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuestionComponentProps {
  question: QuestionInstance;
  onAnswer: (answer: string) => void;
  disabled?: boolean;
  selectedAnswer?: string | null;
  isCorrect?: boolean | null;
}

// ─── Color palette for matched pairs ─────────────────────────────────────────

const PAIR_COLORS = [
  { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-700' },
  { bg: 'bg-purple-100', border: 'border-purple-400', text: 'text-purple-700' },
  { bg: 'bg-green-100', border: 'border-green-400', text: 'text-green-700' },
  { bg: 'bg-amber-100', border: 'border-amber-400', text: 'text-amber-700' },
];

// ─── Shuffle helper ───────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MatchPairs({
  question,
  onAnswer,
  disabled = false,
  selectedAnswer = null,
  isCorrect = null,
}: QuestionComponentProps) {
  const pairs: MatchPair[] = question.pairs ?? [];

  // Shuffled right-column items (stable after mount)
  const [rightItems, setRightItems] = useState<string[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  // Map: left text → right text
  const [matches, setMatches] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    setRightItems(shuffle(pairs.map((p) => p.right)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.templateId]);

  const leftItems = pairs.map((p) => p.left);

  // Build reverse map: right → left (for quick look-up)
  const rightToLeft = new Map<string, string>();
  matches.forEach((right, left) => rightToLeft.set(right, left));

  // Index of a left item in the matches (for color assignment)
  const leftIndex = (left: string) => leftItems.indexOf(left);

  // Which color index does this matched left item get?
  const colorForLeft = (left: string): number => {
    let idx = 0;
    for (const [key] of matches) {
      if (key === left) return idx % PAIR_COLORS.length;
      idx++;
    }
    return 0;
  };

  const handleLeftTap = useCallback(
    (left: string) => {
      if (disabled) return;
      // If already matched → unmatch
      if (matches.has(left)) {
        setMatches((prev) => {
          const next = new Map(prev);
          next.delete(left);
          return next;
        });
        setSelectedLeft(null);
        return;
      }
      // Toggle selection
      setSelectedLeft((prev) => (prev === left ? null : left));
    },
    [disabled, matches],
  );

  const handleRightTap = useCallback(
    (right: string) => {
      if (disabled) return;
      // If this right item is already matched → remove that match
      if (rightToLeft.has(right)) {
        const existingLeft = rightToLeft.get(right)!;
        setMatches((prev) => {
          const next = new Map(prev);
          next.delete(existingLeft);
          return next;
        });
        setSelectedLeft(null);
        return;
      }
      // Need a left selected first
      if (!selectedLeft) return;
      setMatches((prev) => {
        const next = new Map(prev);
        next.set(selectedLeft, right);
        return next;
      });
      setSelectedLeft(null);
    },
    [disabled, rightToLeft, selectedLeft],
  );

  const allMatched = matches.size === pairs.length;

  const handleSubmit = useCallback(() => {
    if (!allMatched || disabled) return;
    // Serialize as sorted JSON array of {left, right} pairs
    const sorted = [...matches.entries()]
      .map(([left, right]) => ({ left, right }))
      .sort((a, b) => a.left.localeCompare(b.left));
    onAnswer(JSON.stringify(sorted));
  }, [allMatched, disabled, matches, onAnswer]);

  // After submit — check correctness per pair
  const answered = selectedAnswer !== null;

  function getPairResult(left: string): 'correct' | 'wrong' | 'unmatched' | null {
    if (!answered) return null;
    const matchedRight = matches.get(left);
    if (!matchedRight) return 'unmatched';
    const correctPair = pairs.find((p) => p.left === left);
    return matchedRight === correctPair?.right ? 'correct' : 'wrong';
  }

  function getLeftClasses(left: string) {
    const result = getPairResult(left);
    if (result === 'correct') return 'border-success bg-success-bg';
    if (result === 'wrong') return 'border-error bg-error-bg';
    if (selectedLeft === left) return 'border-primary bg-primary-lighter';
    if (matches.has(left)) {
      const color = colorForLeft(left);
      const c = PAIR_COLORS[color];
      return cn(c.bg, c.border, c.text);
    }
    return 'border-gray-200 bg-white hover:border-primary hover:bg-primary-lighter';
  }

  function getRightClasses(right: string) {
    const pairedLeft = rightToLeft.get(right);
    if (answered) {
      // Find if this right belongs to a correct or wrong match
      if (pairedLeft) {
        const result = getPairResult(pairedLeft);
        if (result === 'correct') return 'border-success bg-success-bg';
        if (result === 'wrong') return 'border-error bg-error-bg';
      }
      return 'border-gray-200 bg-white opacity-60';
    }
    if (pairedLeft) {
      const color = colorForLeft(pairedLeft);
      const c = PAIR_COLORS[color];
      return cn(c.bg, c.border, c.text);
    }
    // Highlight as potential match target when a left is selected
    if (selectedLeft) {
      return 'border-secondary bg-secondary-lighter hover:border-secondary hover:bg-secondary-lighter cursor-pointer';
    }
    return 'border-gray-200 bg-white hover:border-primary hover:bg-primary-lighter';
  }

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.04 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 400, damping: 28 } },
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Instruction */}
      <p className="font-ui text-sm text-gray-500 text-center">
        Tap a left item, then tap the matching right item.
      </p>

      {/* Two-column grid */}
      <motion.div
        className="grid grid-cols-2 gap-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Left column */}
        <div className="flex flex-col gap-2">
          {leftItems.map((left) => {
            const canTap = !disabled;
            const result = getPairResult(left);
            return (
              <motion.button
                key={left}
                variants={itemVariants}
                whileTap={canTap && !answered ? { scale: 0.97 } : undefined}
                disabled={disabled && !answered}
                onClick={() => !answered && handleLeftTap(left)}
                className={cn(
                  'relative rounded-xl border-2 p-3 min-h-[48px] text-center font-ui text-sm',
                  'transition-colors duration-150 select-none',
                  getLeftClasses(left),
                  answered ? 'cursor-default' : 'cursor-pointer',
                )}
              >
                {left}
                {answered && result === 'correct' && (
                  <span className="absolute top-1 right-1 text-success text-xs font-bold">✓</span>
                )}
                {answered && result === 'wrong' && (
                  <span className="absolute top-1 right-1 text-error text-xs font-bold">✗</span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Right column (shuffled) */}
        <div className="flex flex-col gap-2">
          {rightItems.map((right) => {
            const pairedLeft = rightToLeft.get(right);
            const result = pairedLeft ? getPairResult(pairedLeft) : null;
            return (
              <motion.button
                key={right}
                variants={itemVariants}
                whileTap={!disabled && !answered ? { scale: 0.97 } : undefined}
                disabled={disabled && !answered}
                onClick={() => !answered && handleRightTap(right)}
                className={cn(
                  'relative rounded-xl border-2 p-3 min-h-[48px] text-center font-ui text-sm',
                  'transition-colors duration-150 select-none',
                  getRightClasses(right),
                  answered ? 'cursor-default' : 'cursor-pointer',
                )}
              >
                {right}
                {answered && result === 'correct' && (
                  <span className="absolute top-1 right-1 text-success text-xs font-bold">✓</span>
                )}
                {answered && result === 'wrong' && (
                  <span className="absolute top-1 right-1 text-error text-xs font-bold">✗</span>
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Submit */}
      {!answered && (
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!allMatched || disabled}
          onClick={handleSubmit}
        >
          Check Answers
        </Button>
      )}
    </div>
  );
}
