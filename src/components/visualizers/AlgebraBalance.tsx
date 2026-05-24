'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AlgebraBalanceProps {
  leftExpression: string;
  rightExpression: string;
  balanced: boolean;
  className?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SVG_WIDTH = 280;
const SVG_HEIGHT = 200;

// Stand/pivot geometry
const PIVOT_X = SVG_WIDTH / 2;
const PIVOT_Y = 110;

// Beam geometry (half-length from pivot)
const BEAM_HALF = 100;

// Pan geometry
const PAN_RX = 32; // horizontal radius of pan oval
const PAN_RY = 12; // vertical radius
const PAN_DROP = 36; // how far below beam end the pan hangs
const STRING_LENGTH = PAN_DROP - PAN_RY;

// Color tokens
const COLOR_BALANCED = '#10B981'; // success green
const COLOR_UNBALANCED = '#6B7280'; // gray
const COLOR_STAND = '#6B7280';
const TILT_DEG = 12;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Strips simple LaTeX delimiters ($...$) so we can display raw math text.
 * A full KaTeX render is out of scope here.
 */
function stripLatex(expr: string): string {
  return expr.replace(/\$+/g, '').trim();
}

/**
 * Rotates a point (px, py) around pivot (ox, oy) by angleDeg degrees.
 */
function rotatePoint(
  px: number,
  py: number,
  ox: number,
  oy: number,
  angleDeg: number
): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = px - ox;
  const dy = py - oy;
  return {
    x: ox + dx * cos - dy * sin,
    y: oy + dx * sin + dy * cos,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AlgebraBalance({
  leftExpression,
  rightExpression,
  balanced,
  className,
}: AlgebraBalanceProps): React.ReactElement {
  const beamColor = balanced ? COLOR_BALANCED : COLOR_UNBALANCED;
  const tiltAngle = balanced ? 0 : TILT_DEG;

  // Beam endpoints in unrotated space (relative to pivot)
  const leftBeamEndRaw = { x: PIVOT_X - BEAM_HALF, y: PIVOT_Y };
  const rightBeamEndRaw = { x: PIVOT_X + BEAM_HALF, y: PIVOT_Y };

  // After tilt (left side down = positive angle)
  const leftBeamEnd = rotatePoint(
    leftBeamEndRaw.x,
    leftBeamEndRaw.y,
    PIVOT_X,
    PIVOT_Y,
    tiltAngle
  );
  const rightBeamEnd = rotatePoint(
    rightBeamEndRaw.x,
    rightBeamEndRaw.y,
    PIVOT_X,
    PIVOT_Y,
    tiltAngle
  );

  // Pan centers (below beam ends)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _leftPanCenter = { x: leftBeamEnd.x, y: leftBeamEnd.y + PAN_DROP };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _rightPanCenter = { x: rightBeamEnd.x, y: rightBeamEnd.y + PAN_DROP };

  const leftLabel = stripLatex(leftExpression);
  const rightLabel = stripLatex(rightExpression);

  return (
    <div
      className={cn('inline-flex flex-col items-center gap-1', className)}
      aria-label={`Algebra balance: ${leftExpression} ${balanced ? '=' : '≠'} ${rightExpression}`}
    >
      <svg
        width={SVG_WIDTH}
        height={SVG_HEIGHT}
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        role="img"
        aria-hidden="true"
        style={{ overflow: 'visible' }}
      >
        {/* ── Stand (triangle/base) ── */}
        {/* Vertical pole */}
        <rect
          x={PIVOT_X - 4}
          y={PIVOT_Y}
          width={8}
          height={60}
          fill={COLOR_STAND}
          rx={2}
        />
        {/* Triangle base */}
        <polygon
          points={`${PIVOT_X - 36},${PIVOT_Y + 60} ${PIVOT_X + 36},${PIVOT_Y + 60} ${PIVOT_X},${PIVOT_Y}`}
          fill={COLOR_STAND}
        />
        {/* Base bar */}
        <rect
          x={PIVOT_X - 44}
          y={PIVOT_Y + 58}
          width={88}
          height={10}
          rx={4}
          fill={COLOR_STAND}
        />

        {/* ── Beam (animated tilt) ── */}
        <motion.g
          initial={{ rotate: 0 }}
          animate={{ rotate: tiltAngle }}
          transition={{
            type: 'spring' as const,
            stiffness: 120,
            damping: 18,
          }}
          style={{ originX: `${PIVOT_X}px`, originY: `${PIVOT_Y}px` }}
        >
          {/* Beam bar */}
          <line
            x1={PIVOT_X - BEAM_HALF}
            y1={PIVOT_Y}
            x2={PIVOT_X + BEAM_HALF}
            y2={PIVOT_Y}
            stroke={beamColor}
            strokeWidth={6}
            strokeLinecap="round"
          />

          {/* Pivot circle */}
          <circle
            cx={PIVOT_X}
            cy={PIVOT_Y}
            r={8}
            fill={beamColor}
            stroke="white"
            strokeWidth={2}
          />

          {/* Left string */}
          <line
            x1={PIVOT_X - BEAM_HALF}
            y1={PIVOT_Y}
            x2={PIVOT_X - BEAM_HALF}
            y2={PIVOT_Y + STRING_LENGTH}
            stroke="#9CA3AF"
            strokeWidth={1.5}
          />

          {/* Right string */}
          <line
            x1={PIVOT_X + BEAM_HALF}
            y1={PIVOT_Y}
            x2={PIVOT_X + BEAM_HALF}
            y2={PIVOT_Y + STRING_LENGTH}
            stroke="#9CA3AF"
            strokeWidth={1.5}
          />

          {/* Left pan */}
          <ellipse
            cx={PIVOT_X - BEAM_HALF}
            cy={PIVOT_Y + PAN_DROP}
            rx={PAN_RX}
            ry={PAN_RY}
            fill="white"
            stroke="#D1D5DB"
            strokeWidth={2}
          />
          {/* Left expression */}
          <text
            x={PIVOT_X - BEAM_HALF}
            y={PIVOT_Y + PAN_DROP + 4}
            textAnchor="middle"
            fontSize={13}
            fontWeight="600"
            fill="#374151"
            fontFamily="inherit"
          >
            {leftLabel}
          </text>

          {/* Right pan */}
          <ellipse
            cx={PIVOT_X + BEAM_HALF}
            cy={PIVOT_Y + PAN_DROP}
            rx={PAN_RX}
            ry={PAN_RY}
            fill="white"
            stroke="#D1D5DB"
            strokeWidth={2}
          />
          {/* Right expression */}
          <text
            x={PIVOT_X + BEAM_HALF}
            y={PIVOT_Y + PAN_DROP + 4}
            textAnchor="middle"
            fontSize={13}
            fontWeight="600"
            fill="#374151"
            fontFamily="inherit"
          >
            {rightLabel}
          </text>
        </motion.g>

        {/* ── Balanced badge ── */}
        {balanced && (
          <g>
            <circle
              cx={PIVOT_X}
              cy={PIVOT_Y - 24}
              r={14}
              fill={COLOR_BALANCED}
            />
            <text
              x={PIVOT_X}
              y={PIVOT_Y - 19}
              textAnchor="middle"
              fontSize={14}
              fill="white"
              fontFamily="inherit"
            >
              ✓
            </text>
          </g>
        )}
      </svg>

      {/* Equation label below */}
      <p className="text-sm font-medium text-gray-600 text-center">
        {leftLabel}
        <span className={cn('mx-2 font-bold', balanced ? 'text-emerald-500' : 'text-gray-400')}>
          {balanced ? '=' : '≠'}
        </span>
        {rightLabel}
      </p>
    </div>
  );
}
