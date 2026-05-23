'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NumberLineProps {
  min?: number;
  max?: number;
  value: number;
  step?: number;
  width?: number;
  showTicks?: boolean;
  color?: string;
  className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Formats a number as a fraction string if step is a simple fraction,
 * otherwise formats as a decimal (trimming trailing zeros).
 */
function formatLabel(value: number, step: number): string {
  // Try to express value as a fraction based on step precision
  const precision = 1e-9;
  const denominator = Math.round(1 / step);

  if (denominator > 1 && Math.abs(denominator - 1 / step) < precision) {
    const numerator = Math.round(value * denominator);
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    const g = gcd(Math.abs(numerator), denominator);
    const reducedNum = numerator / g;
    const reducedDen = denominator / g;

    if (reducedDen === 1) return String(reducedNum);
    return `${reducedNum}/${reducedDen}`;
  }

  // Fall back to decimal, strip trailing zeros
  return parseFloat(value.toFixed(10)).toString();
}

/**
 * Maps a value in [min, max] to an x position in the SVG.
 */
function valueToX(value: number, min: number, max: number, lineStart: number, lineEnd: number): number {
  const ratio = (value - min) / (max - min);
  return lineStart + ratio * (lineEnd - lineStart);
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NumberLine({
  min = 0,
  max = 1,
  value,
  step = 0.25,
  width = 280,
  showTicks = true,
  color = 'var(--color-primary)',
  className,
}: NumberLineProps): React.ReactElement {
  const safeMin = min;
  const safeMax = max > min ? max : min + 1;
  const safeStep = step > 0 ? step : 0.25;
  const safeValue = Math.max(safeMin, Math.min(value, safeMax));

  // SVG layout constants
  const svgHeight = 80;
  const lineY = 52; // y of the horizontal line
  const lineStart = 20;
  const lineEnd = width - 20;
  const tickHeight = 10; // half-height of tick marks
  const dotRadius = 8;
  const labelYAboveDot = lineY - dotRadius - 8; // label above dot

  // Generate tick positions
  const ticks: number[] = [];
  const epsilon = safeStep * 0.001;
  for (let t = safeMin; t <= safeMax + epsilon; t = Math.round((t + safeStep) * 1e10) / 1e10) {
    ticks.push(t);
  }

  const dotX = valueToX(safeValue, safeMin, safeMax, lineStart, lineEnd);
  const minDotX = valueToX(safeMin, safeMin, safeMax, lineStart, lineEnd);

  const dotLabel = formatLabel(safeValue, safeStep);

  return (
    <div
      className={cn('inline-block', className)}
      aria-label={`Number line, value ${safeValue}`}
    >
      <svg
        width={width}
        height={svgHeight}
        viewBox={`0 0 ${width} ${svgHeight}`}
        role="img"
        aria-hidden="true"
      >
        {/* Horizontal line */}
        <line
          x1={lineStart}
          y1={lineY}
          x2={lineEnd}
          y2={lineY}
          stroke="#9CA3AF"
          strokeWidth={2}
          strokeLinecap="round"
        />

        {/* Arrow heads */}
        <polygon
          points={`${lineEnd},${lineY} ${lineEnd - 7},${lineY - 4} ${lineEnd - 7},${lineY + 4}`}
          fill="#9CA3AF"
        />

        {/* Tick marks and labels */}
        {showTicks &&
          ticks.map((tick) => {
            const tickX = valueToX(tick, safeMin, safeMax, lineStart, lineEnd);
            const label = formatLabel(tick, safeStep);
            return (
              <g key={tick}>
                <line
                  x1={tickX}
                  y1={lineY - tickHeight}
                  x2={tickX}
                  y2={lineY + tickHeight}
                  stroke="#6B7280"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                />
                <text
                  x={tickX}
                  y={lineY + tickHeight + 14}
                  textAnchor="middle"
                  fontSize={10}
                  fill="#6B7280"
                  fontFamily="inherit"
                >
                  {label}
                </text>
              </g>
            );
          })}

        {/* Animated dot */}
        <motion.circle
          cx={dotX}
          cy={lineY}
          r={dotRadius}
          fill={color}
          initial={{ cx: minDotX }}
          animate={{ cx: dotX }}
          transition={{
            type: 'spring' as const,
            stiffness: 200,
            damping: 24,
            duration: 0.6,
          }}
        />

        {/* Label above dot — also animated */}
        <motion.text
          x={dotX}
          y={labelYAboveDot}
          textAnchor="middle"
          fontSize={12}
          fontWeight="600"
          fill={color}
          fontFamily="inherit"
          initial={{ x: minDotX, opacity: 0 }}
          animate={{ x: dotX, opacity: 1 }}
          transition={{
            type: 'spring' as const,
            stiffness: 200,
            damping: 24,
            duration: 0.6,
          }}
        >
          {dotLabel}
        </motion.text>
      </svg>
    </div>
  );
}
