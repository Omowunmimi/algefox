'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';

// ─── Types ────────────────────────────────────────────────────────────────────

interface HintBubbleProps {
  hints: string[];
  currentHintIndex: number;  // which hints have been revealed (-1 = none)
  onRevealHint: () => void;  // called when user taps "Show Hint"
}

// ─── Component ────────────────────────────────────────────────────────────────

export function HintBubble({ hints, currentHintIndex, onRevealHint }: HintBubbleProps) {
  if (!hints || hints.length === 0) return null;

  const hasRevealed = currentHintIndex >= 0;
  const revealedHints = hints.slice(0, currentHintIndex + 1);
  const hasMoreHints = currentHintIndex < hints.length - 1;

  return (
    <div className="flex flex-col gap-2">
      {/* Show hint button — only visible when none revealed yet */}
      {!hasRevealed && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRevealHint}
          leftIcon={<span>💡</span>}
          className="self-start"
        >
          Show hint
        </Button>
      )}

      {/* Revealed hints */}
      <AnimatePresence>
        {hasRevealed && (
          <motion.div
            key="hint-card"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={cn(
              'bg-secondary-lighter border-l-4 border-secondary rounded-xl p-3',
              'flex flex-col gap-2',
            )}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-base">💡</span>
              <span className="font-ui text-xs font-semibold text-secondary uppercase tracking-wider">
                Hint{revealedHints.length > 1 ? 's' : ''}
              </span>
            </div>

            {revealedHints.map((hint, i) => (
              <motion.p
                key={i}
                initial={i === revealedHints.length - 1 ? { opacity: 0, x: -8 } : false}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                className="font-ui text-sm text-secondary-darker leading-relaxed"
              >
                {revealedHints.length > 1 && (
                  <span className="font-bold mr-1">{i + 1}.</span>
                )}
                {hint}
              </motion.p>
            ))}

            {/* Show another hint */}
            {hasMoreHints && (
              <button
                onClick={onRevealHint}
                className={cn(
                  'self-start font-ui text-xs font-semibold text-secondary',
                  'underline underline-offset-2 hover:opacity-70 transition-opacity',
                  'mt-1',
                )}
              >
                Show another hint
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
