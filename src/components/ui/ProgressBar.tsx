'use client';

import { HTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

// ─── Types ────────────────────────────────────────────────────────────────────

type ProgressVariant = 'primary' | 'secondary' | 'gold' | 'success';
type ProgressSize = 'thin' | 'normal' | 'thick';

interface ProgressBarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  value: number;
  variant?: ProgressVariant;
  size?: ProgressSize;
  label?: string;
  showPercent?: boolean;
  animated?: boolean;
  className?: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const fillClasses: Record<ProgressVariant, string> = {
  primary:   'bg-primary',
  secondary: 'bg-secondary',
  gold:      'bg-gold',
  success:   'bg-success',
};

const sizeClasses: Record<ProgressSize, string> = {
  thin:   'h-2',
  normal: 'h-4',
  thick:  'h-6',
};

// ─── Component ────────────────────────────────────────────────────────────────

function ProgressBar({
  value,
  variant = 'primary',
  size = 'normal',
  label,
  showPercent = false,
  animated = true,
  className,
  ...rest
}: ProgressBarProps) {
  // Clamp value to [0, 100]
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn('flex flex-col gap-1.5', className)} {...rest}>
      {/* Header row */}
      {(label || showPercent) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className="font-ui text-sm font-semibold text-gray-700">
              {label}
            </span>
          )}
          {showPercent && (
            <span className="font-ui text-sm font-semibold text-gray-500 ml-auto">
              {Math.round(clamped)}%
            </span>
          )}
        </div>
      )}

      {/* Track */}
      <div
        className={cn(
          'w-full rounded-full bg-gray-200 overflow-hidden',
          sizeClasses[size],
        )}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {/* Fill */}
        <motion.div
          className={cn('h-full rounded-full', fillClasses[variant])}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={
            animated
              ? { type: 'spring', stiffness: 100, damping: 20 }
              : { duration: 0 }
          }
        />
      </div>
    </div>
  );
}

export { ProgressBar };
export type { ProgressBarProps, ProgressVariant, ProgressSize };
