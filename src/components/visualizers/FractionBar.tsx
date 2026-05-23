'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FractionBarProps {
  numerator: number;
  denominator: number;
  width?: number;
  height?: number;
  color?: string;
  animated?: boolean;
  showLabel?: boolean;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FractionBar({
  numerator,
  denominator,
  width = 240,
  height = 48,
  color = 'var(--color-primary)',
  animated = true,
  showLabel = true,
  className,
}: FractionBarProps): React.ReactElement {
  const safeNumerator = Math.max(0, Math.min(numerator, denominator));
  const safeDenominator = Math.max(1, denominator);

  // Gap between segments (px)
  const gap = 2;
  const radius = 8;

  // Each segment width, accounting for gaps between segments
  // Total gaps = (denominator - 1) * gap
  const totalGaps = (safeDenominator - 1) * gap;
  const segmentWidth = (width - totalGaps) / safeDenominator;

  const slideInVariants = {
    hidden: { scaleX: 0, originX: 0 },
    visible: (i: number) => ({
      scaleX: 1,
      originX: 0,
      transition: {
        delay: i * 0.06,
        duration: 0.35,
        ease: 'easeOut' as const,
      },
    }),
  } as const;

  return (
    <div
      className={cn('inline-flex items-center gap-3', className)}
      aria-label={`Fraction bar ${safeNumerator}/${safeDenominator}`}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-hidden="true"
      >
        {/* Clipping path for rounded outer corners */}
        <defs>
          <clipPath id={`bar-clip-${safeDenominator}-${safeNumerator}`}>
            <rect
              x={0}
              y={0}
              width={width}
              height={height}
              rx={radius}
              ry={radius}
            />
          </clipPath>
        </defs>

        {/* Background (empty bar) */}
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          rx={radius}
          ry={radius}
          fill="white"
          stroke="#D1D5DB"
          strokeWidth={1.5}
        />

        {/* Segments */}
        <g clipPath={`url(#bar-clip-${safeDenominator}-${safeNumerator})`}>
          {Array.from({ length: safeDenominator }, (_, i) => {
            const isFilled = i < safeNumerator;
            const x = i * (segmentWidth + gap);

            if (!isFilled) {
              // Empty segments — just white (already covered by background)
              // Draw separators for empty segments
              return null;
            }

            if (animated) {
              return (
                <motion.rect
                  key={i}
                  x={x}
                  y={0}
                  width={segmentWidth}
                  height={height}
                  fill={color}
                  initial="hidden"
                  animate="visible"
                  custom={i}
                  variants={slideInVariants}
                  style={{ transformOrigin: `${x}px center` }}
                />
              );
            }

            return (
              <rect
                key={i}
                x={x}
                y={0}
                width={segmentWidth}
                height={height}
                fill={color}
              />
            );
          })}

          {/* Gap separators between all segments */}
          {Array.from({ length: safeDenominator - 1 }, (_, i) => {
            const x = (i + 1) * (segmentWidth + gap) - gap;
            return (
              <rect
                key={`gap-${i}`}
                x={x}
                y={0}
                width={gap}
                height={height}
                fill="white"
              />
            );
          })}
        </g>

        {/* Outer border (re-drawn on top for crispness) */}
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          rx={radius}
          ry={radius}
          fill="none"
          stroke="#D1D5DB"
          strokeWidth={1.5}
        />
      </svg>

      {showLabel && (
        <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
          {safeNumerator}/{safeDenominator}
        </span>
      )}
    </div>
  );
}
