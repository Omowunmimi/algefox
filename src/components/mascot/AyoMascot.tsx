'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { MascotExpression } from '@/types/gamification.types';
import { cn } from '@/lib/utils/cn';

/* ── Types ─────────────────────────────────────────────────── */

interface AyoMascotProps {
  expression?: MascotExpression;
  size?: number;
  className?: string;
  animated?: boolean;
}

/* ── Expression config ─────────────────────────────────────── */

interface EyeConfig {
  /** 'circle' | 'happy-arc' | 'closed-arc' | 'wide' | 'small' | 'squint' */
  shape: 'circle' | 'happy-arc' | 'closed-arc' | 'wide' | 'small' | 'squint';
  /** Pupil visible (only for circle / wide) */
  pupil?: boolean;
  /** Extra pupil radius multiplier for wide eyes */
  pupilScale?: number;
}

interface MouthConfig {
  /** 'neutral-smile' | 'big-smile' | 'grin' | 'frown' | 'o-shape' | 'flat' */
  shape: 'neutral-smile' | 'big-smile' | 'grin' | 'frown' | 'o-shape' | 'flat';
}

interface BrowConfig {
  left?: 'raised' | 'worried' | 'none';
  right?: 'raised' | 'worried' | 'none';
}

interface ExpressionConfig {
  leftEye: EyeConfig;
  rightEye: EyeConfig;
  mouth: MouthConfig;
  brows: BrowConfig;
  extras?: 'sparkles' | 'dots' | null;
}

const EXPRESSIONS: Record<MascotExpression, ExpressionConfig> = {
  idle: {
    leftEye: { shape: 'circle', pupil: true },
    rightEye: { shape: 'circle', pupil: true },
    mouth: { shape: 'neutral-smile' },
    brows: {},
    extras: null,
  },
  happy: {
    leftEye: { shape: 'happy-arc' },
    rightEye: { shape: 'happy-arc' },
    mouth: { shape: 'big-smile' },
    brows: {},
    extras: null,
  },
  excited: {
    leftEye: { shape: 'wide', pupil: true, pupilScale: 1.3 },
    rightEye: { shape: 'wide', pupil: true, pupilScale: 1.3 },
    mouth: { shape: 'grin' },
    brows: { left: 'raised', right: 'raised' },
    extras: null,
  },
  celebrating: {
    leftEye: { shape: 'closed-arc' },
    rightEye: { shape: 'closed-arc' },
    mouth: { shape: 'grin' },
    brows: {},
    extras: 'sparkles',
  },
  thinking: {
    leftEye: { shape: 'small', pupil: true },
    rightEye: { shape: 'circle', pupil: true },
    mouth: { shape: 'flat' },
    brows: { right: 'raised' },
    extras: 'dots',
  },
  encouraging: {
    leftEye: { shape: 'squint', pupil: true },
    rightEye: { shape: 'squint', pupil: true },
    mouth: { shape: 'big-smile' },
    brows: {},
    extras: null,
  },
  sad: {
    leftEye: { shape: 'happy-arc' },
    rightEye: { shape: 'happy-arc' },
    mouth: { shape: 'frown' },
    brows: { left: 'worried', right: 'worried' },
    extras: null,
  },
  surprised: {
    leftEye: { shape: 'wide', pupil: true, pupilScale: 1 },
    rightEye: { shape: 'wide', pupil: true, pupilScale: 1 },
    mouth: { shape: 'o-shape' },
    brows: { left: 'raised', right: 'raised' },
    extras: null,
  },
};

/* ── Sub-renderers ─────────────────────────────────────────── */

/** Eye at center (cx, cy). eyeR = base radius. */
function renderEye(
  cx: number,
  cy: number,
  config: EyeConfig,
  eyeR: number = 5,
): React.ReactNode {
  const pupilR = 2.5 * (config.pupilScale ?? 1);
  const flip = cx < 60 ? 1 : -1; // left eye vs right (unused currently)

  switch (config.shape) {
    case 'circle':
      return (
        <g>
          <circle cx={cx} cy={cy} r={eyeR} fill="#FFFFFF" />
          {config.pupil && (
            <circle cx={cx} cy={cy} r={pupilR} fill="#3D2000" />
          )}
        </g>
      );

    case 'wide':
      return (
        <g>
          <circle cx={cx} cy={cy} r={eyeR + 1.5} fill="#FFFFFF" />
          {config.pupil && (
            <circle cx={cx} cy={cy} r={pupilR} fill="#3D2000" />
          )}
        </g>
      );

    case 'small':
      return (
        <g>
          <circle cx={cx} cy={cy} r={eyeR - 1.5} fill="#FFFFFF" />
          {config.pupil && (
            <circle cx={cx} cy={cy} r={pupilR - 0.5} fill="#3D2000" />
          )}
        </g>
      );

    /* Happy-arc: upward crescent (closed at bottom) */
    case 'happy-arc':
      return (
        <g>
          {/* White almond base */}
          <ellipse cx={cx} cy={cy} rx={eyeR} ry={eyeR * 0.75} fill="#FFFFFF" />
          {/* Orange overlay on bottom half to create squint illusion */}
          <path
            d={`M ${cx - eyeR} ${cy} A ${eyeR} ${eyeR * 0.75} 0 0 1 ${cx + eyeR} ${cy} Z`}
            fill="#F97316"
          />
          {/* Arc stroke as the visible eye line */}
          <path
            d={`M ${cx - eyeR} ${cy} A ${eyeR} ${eyeR * 0.75} 0 0 0 ${cx + eyeR} ${cy}`}
            stroke="#3D2000"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      );

    /* Closed-arc: joy squint — just a downward arc */
    case 'closed-arc':
      return (
        <path
          d={`M ${cx - eyeR} ${cy} A ${eyeR} ${eyeR * 0.7} 0 0 1 ${cx + eyeR} ${cy}`}
          stroke="#3D2000"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      );

    /* Squint: smaller oval with pupil */
    case 'squint':
      return (
        <g>
          <ellipse cx={cx} cy={cy} rx={eyeR} ry={eyeR * 0.6} fill="#FFFFFF" />
          {config.pupil && (
            <circle cx={cx} cy={cy} r={pupilR - 0.5} fill="#3D2000" />
          )}
        </g>
      );

    default:
      return null;
  }
}

/** Eyebrow above (cx, cy) — brow sits ~9px above eye center */
function renderBrow(
  cx: number,
  cy: number,
  type: 'raised' | 'worried',
  side: 'left' | 'right',
): React.ReactNode {
  const by = cy - 9;
  const w = 8;
  if (type === 'raised') {
    // Slightly arched upward stroke
    const tilt = side === 'left' ? -2 : 2;
    return (
      <path
        d={`M ${cx - w / 2} ${by + tilt} Q ${cx} ${by - 3} ${cx + w / 2} ${by + tilt}`}
        stroke="#92400E"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    );
  }
  // worried: tilted inward-down
  const inwardY = side === 'left' ? by + 2 : by + 2;
  const outerY = side === 'left' ? by - 2 : by - 2;
  const leftX = cx - w / 2;
  const rightX = cx + w / 2;
  return (
    <line
      x1={side === 'left' ? leftX : leftX}
      y1={side === 'left' ? outerY : inwardY}
      x2={side === 'left' ? rightX : rightX}
      y2={side === 'left' ? inwardY : outerY}
      stroke="#92400E"
      strokeWidth="2"
      strokeLinecap="round"
    />
  );
}

/** Mouth shapes — muzzle center at (60, 85) */
function renderMouth(config: MouthConfig): React.ReactNode {
  // Mouth sits on the muzzle oval, baseline around y=89-92
  switch (config.shape) {
    case 'neutral-smile':
      // Gentle upward arc
      return (
        <path
          d="M 52 90 Q 60 95 68 90"
          stroke="#3D2000"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
      );

    case 'big-smile':
      // Wider smile
      return (
        <path
          d="M 49 89 Q 60 97 71 89"
          stroke="#3D2000"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
      );

    case 'grin':
      // Open mouth with white teeth row
      return (
        <g>
          {/* Outer mouth shape */}
          <path
            d="M 48 88 Q 60 100 72 88"
            stroke="#3D2000"
            strokeWidth="1.5"
            fill="#3D2000"
          />
          {/* Teeth strip */}
          <rect x="51" y="88" width="18" height="6" rx="2" fill="#FFFFFF" />
          {/* Tooth dividers */}
          <line x1="57" y1="88" x2="57" y2="94" stroke="#E5E7EB" strokeWidth="0.8" />
          <line x1="63" y1="88" x2="63" y2="94" stroke="#E5E7EB" strokeWidth="0.8" />
        </g>
      );

    case 'frown':
      // Inverted arc
      return (
        <path
          d="M 52 93 Q 60 88 68 93"
          stroke="#3D2000"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
      );

    case 'o-shape':
      // Open-mouth oval
      return (
        <ellipse
          cx={60}
          cy={91}
          rx={6}
          ry={5}
          fill="#3D2000"
          stroke="#3D2000"
          strokeWidth="0.5"
        />
      );

    case 'flat':
      // Straight line
      return (
        <line
          x1={53}
          y1={91}
          x2={67}
          y2={91}
          stroke="#3D2000"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      );

    default:
      return null;
  }
}

/** 5-point star centered at (cx, cy) with outer radius r */
function Star({
  cx,
  cy,
  r,
  fill,
}: {
  cx: number;
  cy: number;
  r: number;
  fill: string;
}) {
  const pts: string[] = [];
  for (let i = 0; i < 5; i++) {
    const outerAngle = (Math.PI / 2) * 3 + (i * (2 * Math.PI)) / 5;
    const innerAngle = outerAngle + Math.PI / 5;
    pts.push(`${cx + r * Math.cos(outerAngle)},${cy + r * Math.sin(outerAngle)}`);
    pts.push(
      `${cx + (r * 0.42) * Math.cos(innerAngle)},${cy + (r * 0.42) * Math.sin(innerAngle)}`,
    );
  }
  return <polygon points={pts.join(' ')} fill={fill} />;
}

/** Sparkles scattered around the head area */
function Sparkles() {
  const sparklePositions = [
    { cx: 15, cy: 35, r: 4 },
    { cx: 108, cy: 42, r: 3.5 },
    { cx: 22, cy: 72, r: 3 },
    { cx: 100, cy: 78, r: 4 },
  ];
  return (
    <g>
      {sparklePositions.map((pos, i) => (
        <Star key={i} cx={pos.cx} cy={pos.cy} r={pos.r} fill="#F59E0B" />
      ))}
    </g>
  );
}

/** Thinking dots above head */
function ThinkingDots() {
  return (
    <g>
      {[0, 1, 2].map((i) => (
        <circle
          key={i}
          cx={78 + i * 8}
          cy={22}
          r={2.5}
          fill="#F97316"
          opacity={0.7}
        />
      ))}
    </g>
  );
}

/* ── Static body elements ──────────────────────────────────── */

function FoxBody() {
  return (
    <g>
      {/* ── Ears (rendered behind head) ── */}
      {/* Left ear outer */}
      <path
        d="M 22 52 L 30 12 L 44 48"
        fill="#F97316"
        stroke="#92400E"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Left ear inner */}
      <path d="M 27 47 L 31 22 L 40 44" fill="#FED7AA" />

      {/* Right ear outer */}
      <path
        d="M 98 52 L 90 12 L 76 48"
        fill="#F97316"
        stroke="#92400E"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Right ear inner */}
      <path d="M 93 47 L 89 22 L 80 44" fill="#FED7AA" />

      {/* ── Head ── */}
      <circle
        cx={60}
        cy={65}
        r={42}
        fill="#F97316"
        stroke="#92400E"
        strokeWidth="1.5"
      />

      {/* Cheek shading (subtle darker patches) */}
      <ellipse cx={35} cy={75} rx={10} ry={7} fill="#EA580C" opacity={0.25} />
      <ellipse cx={85} cy={75} rx={10} ry={7} fill="#EA580C" opacity={0.25} />

      {/* ── Muzzle / snout ── */}
      <ellipse
        cx={60}
        cy={83}
        rx={18}
        ry={13}
        fill="#FDE68A"
        stroke="#92400E"
        strokeWidth="1"
      />

      {/* Nose */}
      <ellipse cx={60} cy={77} rx={3.5} ry={2.5} fill="#3D2000" />

      {/* ── Blazer body ── */}
      {/* Main body rectangle */}
      <rect
        x={22}
        y={102}
        width={76}
        height={54}
        rx={10}
        fill="#1E1B4B"
      />
      {/* Curved bottom overlap (fox body is wider at hips) */}
      <ellipse cx={60} cy={155} rx={40} ry={8} fill="#1E1B4B" />

      {/* Left lapel */}
      <path
        d="M 60 108 L 42 118 L 46 145 L 56 145 L 56 120 Z"
        fill="#2D2A6E"
      />
      {/* Right lapel */}
      <path
        d="M 60 108 L 78 118 L 74 145 L 64 145 L 64 120 Z"
        fill="#2D2A6E"
      />

      {/* Shirt / collar glimpse */}
      <path
        d="M 54 107 L 60 115 L 66 107"
        fill="#FFFFFF"
        stroke="#E5E7EB"
        strokeWidth="0.5"
      />

      {/* ── Tie ── */}
      <path
        d="M 57 115 L 60 113 L 63 115 L 61.5 132 L 60 135 L 58.5 132 Z"
        fill="#F59E0B"
        stroke="#D97706"
        strokeWidth="0.7"
      />
      {/* Tie knot */}
      <ellipse cx={60} cy={115} rx={3} ry={2} fill="#D97706" />

      {/* ── Star badge on left lapel ── */}
      <Star cx={46} cy={122} r={5} fill="#F59E0B" />

      {/* ── Highlight on head (specular) ── */}
      <ellipse
        cx={48}
        cy={45}
        rx={9}
        ry={6}
        fill="#FED7AA"
        opacity={0.45}
        transform="rotate(-20 48 45)"
      />
    </g>
  );
}

/* ── Face elements with expression ────────────────────────── */

function FaceElements({ expression }: { expression: MascotExpression }) {
  const config = EXPRESSIONS[expression];

  const LEFT_EYE = { cx: 45, cy: 58 };
  const RIGHT_EYE = { cx: 75, cy: 58 };

  return (
    <g>
      {/* Extras behind eyes */}
      {config.extras === 'sparkles' && <Sparkles />}
      {config.extras === 'dots' && <ThinkingDots />}

      {/* Eyebrows */}
      {config.brows.left && config.brows.left !== 'none' &&
        renderBrow(LEFT_EYE.cx, LEFT_EYE.cy, config.brows.left, 'left')}
      {config.brows.right && config.brows.right !== 'none' &&
        renderBrow(RIGHT_EYE.cx, RIGHT_EYE.cy, config.brows.right, 'right')}

      {/* Eyes */}
      {renderEye(LEFT_EYE.cx, LEFT_EYE.cy, config.leftEye)}
      {renderEye(RIGHT_EYE.cx, RIGHT_EYE.cy, config.rightEye)}

      {/* Mouth */}
      {renderMouth(config.mouth)}
    </g>
  );
}

/* ── Main component ────────────────────────────────────────── */

export function AyoMascot({
  expression = 'idle',
  size = 120,
  className,
  animated = false,
}: AyoMascotProps) {
  // Maintain 120:160 aspect ratio
  const height = Math.round(size * (160 / 120));

  const floatVariants = {
    float: {
      y: [0, -4, 0],
      transition: {
        duration: 2.5,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    },
    still: { y: 0 },
  };

  const faceVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.15, ease: 'easeInOut' as const },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.15, ease: 'easeInOut' as const },
    },
  };

  return (
    <svg
      viewBox="0 0 120 160"
      width={size}
      height={height}
      className={cn('select-none', className)}
      aria-label={`Ayo the Fox — ${expression}`}
      role="img"
    >
      <motion.g
        variants={floatVariants}
        animate={animated ? 'float' : 'still'}
        initial={false}
      >
        {/* Static body (ears, head, blazer, etc.) */}
        <FoxBody />

        {/* Animated face layer */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.g
            key={expression}
            variants={faceVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <FaceElements expression={expression} />
          </motion.g>
        </AnimatePresence>
      </motion.g>
    </svg>
  );
}
