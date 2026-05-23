'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

/* ── Types ─────────────────────────────────────────────────── */

interface SpeechBubbleProps {
  message: string;
  variant?: 'default' | 'celebration' | 'hint' | 'error';
  className?: string;
  onDismiss?: () => void;
  showDismiss?: boolean;
}

/* ── Variant styles ────────────────────────────────────────── */

const VARIANT_CLASSES: Record<NonNullable<SpeechBubbleProps['variant']>, string> = {
  default:
    'bg-white border-2 border-gray-200 shadow-md',
  celebration:
    'bg-amber-50 border-2 border-amber-400 shadow-md',
  hint:
    'bg-indigo-50 border-2 border-indigo-400 shadow-md',
  error:
    'bg-red-50 border-2 border-red-400 shadow-md',
};

/* ── Component ─────────────────────────────────────────────── */

export function SpeechBubble({
  message,
  variant = 'default',
  className,
  onDismiss,
  showDismiss,
}: SpeechBubbleProps) {
  const hasDismiss = showDismiss || Boolean(onDismiss);

  return (
    <AnimatePresence>
      <motion.div
        role="status"
        aria-live="polite"
        initial={{ opacity: 0, scale: 0.8, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 4 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={cn(
          'relative max-w-xs rounded-2xl p-4',
          VARIANT_CLASSES[variant],
          className,
        )}
      >
        {/* Dismiss button */}
        {hasDismiss && onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss message"
            className={cn(
              'absolute right-2 top-2 flex h-5 w-5 items-center justify-center',
              'rounded-full text-xs text-gray-400 transition-colors',
              'hover:bg-gray-100 hover:text-gray-600',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
            )}
          >
            &times;
          </button>
        )}

        {/* Message text */}
        <p
          className={cn(
            'text-sm leading-relaxed text-gray-800',
            hasDismiss && onDismiss && 'pr-5',
          )}
        >
          {message}
        </p>

        {/* Tail / pointer pointing upward-left toward the mascot */}
        <TailPointer variant={variant} />
      </motion.div>
    </AnimatePresence>
  );
}

/* ── Tail pointer ──────────────────────────────────────────── */

/** A small CSS-triangle tail on the left side of the bubble, pointing left. */
function TailPointer({
  variant,
}: {
  variant: NonNullable<SpeechBubbleProps['variant']>;
}) {
  // Border color matches the variant
  const borderColor: Record<typeof variant, string> = {
    default: '#E5E7EB',       // gray-200
    celebration: '#FBBF24',  // amber-400
    hint: '#818CF8',          // indigo-400
    error: '#F87171',         // red-400
  };

  const bgColor: Record<typeof variant, string> = {
    default: '#FFFFFF',
    celebration: '#FFFBEB',   // amber-50
    hint: '#EEF2FF',          // indigo-50
    error: '#FEF2F2',         // red-50
  };

  return (
    <span
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: '-10px',
        top: '16px',
        width: 0,
        height: 0,
        borderTop: '6px solid transparent',
        borderBottom: '6px solid transparent',
        borderRight: `10px solid ${borderColor[variant]}`,
        // Inner layered triangle to show bg color
      }}
    >
      {/* Inner fill triangle — sits on top to match bubble bg */}
      <span
        style={{
          position: 'absolute',
          left: '2px',
          top: '-5px',
          width: 0,
          height: 0,
          borderTop: '5px solid transparent',
          borderBottom: '5px solid transparent',
          borderRight: `9px solid ${bgColor[variant]}`,
        }}
      />
    </span>
  );
}
