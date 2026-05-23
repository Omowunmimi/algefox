'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FractionPieProps {
  numerator: number;
  denominator: number;
  size?: number;
  color?: string;
  animated?: boolean;
  className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Converts polar coordinates (angle in degrees, radius, center) to SVG x/y.
 * Angle 0 = 12 o'clock, increases clockwise.
 */
function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number
): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

/**
 * Builds an SVG arc path for a single sector (wedge) of a circle.
 */
function buildSectorPath(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  // Determine if the arc sweeps more than 180 degrees
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`,
    'Z',
  ].join(' ');
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FractionPie({
  numerator,
  denominator,
  size = 120,
  color = 'var(--color-primary)',
  animated = true,
  className,
}: FractionPieProps): React.ReactElement {
  // Guard against invalid input
  const safeNumerator = Math.max(0, Math.min(numerator, denominator));
  const safeDenominator = Math.max(1, denominator);

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 4; // leave a small margin for stroke visibility

  const sectorAngle = 360 / safeDenominator;

  const sectors = Array.from({ length: safeDenominator }, (_, i) => {
    const startAngle = i * sectorAngle;
    const endAngle = startAngle + sectorAngle;
    const isFilled = i < safeNumerator;
    return { startAngle, endAngle, isFilled, index: i };
  });

  const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: (i: number) => ({
      opacity: 1,
      transition: {
        delay: i * 0.08,
        duration: 0.3,
        ease: 'easeOut' as const,
      },
    }),
  } as const;

  return (
    <div className={cn('inline-flex flex-col items-center gap-2', className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-label={`Fraction ${safeNumerator}/${safeDenominator} pie chart`}
        role="img"
      >
        {/* Empty background circle */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="white"
          stroke="#D1D5DB"
          strokeWidth={1}
        />

        {/* Render each sector */}
        {sectors.map(({ startAngle, endAngle, isFilled, index }) => {
          const path = buildSectorPath(cx, cy, r, startAngle, endAngle);

          if (animated && isFilled) {
            return (
              <motion.path
                key={index}
                d={path}
                fill={color}
                stroke="white"
                strokeWidth={1.5}
                initial="hidden"
                animate="visible"
                custom={index}
                variants={fadeInVariants}
              />
            );
          }

          return (
            <path
              key={index}
              d={path}
              fill={isFilled ? color : 'white'}
              stroke="white"
              strokeWidth={1.5}
            />
          );
        })}

        {/* Dividing lines between all sectors (drawn on top) */}
        {sectors.map(({ startAngle, index }) => {
          const lineEnd = polarToCartesian(cx, cy, r, startAngle);
          return (
            <line
              key={`line-${index}`}
              x1={cx}
              y1={cy}
              x2={lineEnd.x}
              y2={lineEnd.y}
              stroke="#D1D5DB"
              strokeWidth={1}
            />
          );
        })}

        {/* Outer circle border on top of sectors */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#D1D5DB"
          strokeWidth={1.5}
        />
      </svg>

      {/* Fraction label */}
      <span
        className="text-sm font-semibold text-gray-700"
        aria-hidden="true"
      >
        {safeNumerator}/{safeDenominator}
      </span>
    </div>
  );
}
