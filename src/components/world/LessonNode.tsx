'use client';

import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

export type NodeState = 'locked' | 'upcoming' | 'current' | 'completed';

interface LessonNodeProps {
  state: NodeState;
  milestoneLevel: number;
  isBoss?: boolean;
  nodeGradient: [string, string];
  shadowColor: string;
  onClick?: () => void;
}

const NODE_SIZE = 64;
const BOSS_SIZE = 76;
const RADIUS    = 18; // rounded square corner radius

/* ── Star icon SVG ───────────────────────────────────────────── */

function StarIcon({ size, fill, stroke }: { size: number; fill: string; stroke?: string }) {
  const s = size * 0.52;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={fill} stroke={stroke ?? 'none'} strokeWidth="1.5">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

/* ── Crown icon ──────────────────────────────────────────────── */

function CrownIcon({ size, fill }: { size: number; fill: string }) {
  const s = size * 0.48;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={fill}>
      <path d="M3 18h18v2H3zm16-6l-4-4-3 3-3-3-4 4V7l4 4 3-3 3 3 4-4v5z" />
    </svg>
  );
}

/* ── Check icon ──────────────────────────────────────────────── */

function CheckIcon({ size }: { size: number }) {
  const s = size * 0.46;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

/* ── Locked ──────────────────────────────────────────────────── */

function LockedNode({ size }: { size: number }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="flex items-center justify-center"
        style={{
          width: size,
          height: size,
          borderRadius: RADIUS,
          background: 'linear-gradient(135deg, #D1D5DB, #9CA3AF)',
          boxShadow: '0 4px 0 0 #6B7280',
          opacity: 0.55,
        }}
      >
        <Lock size={Math.round(size * 0.38)} color="white" strokeWidth={2.5} />
      </div>
    </div>
  );
}

/* ── Completed ───────────────────────────────────────────────── */

function CompletedNode({ size, onClick }: { size: number; onClick?: () => void }) {
  return (
    <motion.div
      className="flex flex-col items-center gap-1.5 cursor-pointer"
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.06, transition: { type: 'spring', stiffness: 450, damping: 20 } }}
    >
      <div
        className="flex items-center justify-center relative"
        style={{
          width: size,
          height: size,
          borderRadius: RADIUS,
          background: 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)',
          boxShadow: '0 4px 0 0 #4B5563',
        }}
      >
        {/* Gold star on gray base = "completed" Figma style */}
        <StarIcon size={size} fill="#FCD34D" />

        {/* Sparkle pips */}
        {[{ x: -7, y: -9 }, { x: 9, y: -7 }, { x: -5, y: 9 }].map((pos, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-amber-300"
            style={{ left: `calc(50% + ${pos.x}px)`, top: `calc(50% + ${pos.y}px)` }}
            animate={{ scale: [0, 1.2, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.7, ease: 'easeInOut' }}
          />
        ))}
      </div>
    </motion.div>
  );
}

/* ── Current ─────────────────────────────────────────────────── */

function CurrentNode({ size, isBoss, nodeGradient, shadowColor, onClick }: {
  size: number;
  isBoss: boolean;
  nodeGradient: [string, string];
  shadowColor: string;
  onClick?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      {/* Pulsing outer ring */}
      <div className="relative flex items-center justify-center" style={{ width: size + 20, height: size + 20 }}>
        <motion.div
          className="absolute rounded-[22px]"
          style={{
            inset: 0,
            background: `${nodeGradient[0]}30`,
            borderRadius: RADIUS + 6,
          }}
          animate={{ scale: [0.88, 1.22, 0.88], opacity: [0.8, 0, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute"
          style={{
            width: size + 8,
            height: size + 8,
            borderRadius: RADIUS + 3,
            border: `3px solid ${nodeGradient[0]}70`,
          }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        />

        {/* Main button */}
        <motion.button
          className="absolute flex items-center justify-center"
          style={{
            width: size,
            height: size,
            borderRadius: RADIUS,
            background: `linear-gradient(135deg, ${nodeGradient[0]}, ${nodeGradient[1]})`,
            boxShadow: `0 6px 0 0 ${shadowColor}, 0 8px 24px ${nodeGradient[0]}40`,
            border: '3px solid rgba(255,255,255,0.45)',
          }}
          onClick={onClick}
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          whileTap={{ y: 6, boxShadow: 'none', scale: 0.93 }}
        >
          {isBoss
            ? <CrownIcon size={size} fill="white" />
            : <StarIcon size={size} fill="#FCD34D" stroke="#D97706" />
          }
        </motion.button>
      </div>

      {/* "GO!" label */}
      <motion.div
        className="rounded-full px-3 py-0.5 flex items-center gap-1"
        style={{
          background: `linear-gradient(135deg, ${nodeGradient[0]}, ${nodeGradient[1]})`,
          boxShadow: `0 2px 0 0 ${shadowColor}`,
        }}
        animate={{ scale: [1, 1.07, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="font-display text-[12px] font-bold text-white">
          {isBoss ? '⭐ BOSS!' : '▶ GO!'}
        </span>
      </motion.div>
    </div>
  );
}

/* ── Upcoming ────────────────────────────────────────────────── */

function UpcomingNode({ size, nodeGradient, shadowColor }: {
  size: number;
  milestoneLevel: number;
  nodeGradient: [string, string];
  shadowColor: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="flex items-center justify-center"
        style={{
          width: size,
          height: size,
          borderRadius: RADIUS,
          background: `linear-gradient(135deg, ${nodeGradient[0]}45, ${nodeGradient[1]}45)`,
          boxShadow: `0 3px 0 0 ${shadowColor}44`,
          border: '3px solid rgba(255,255,255,0.22)',
          opacity: 0.7,
        }}
      >
        <StarIcon size={size} fill="rgba(255,255,255,0.45)" />
      </div>
    </div>
  );
}

/* ── Main export ─────────────────────────────────────────────── */

export function LessonNode({
  state,
  milestoneLevel,
  isBoss = false,
  nodeGradient,
  shadowColor,
  onClick,
}: LessonNodeProps) {
  const size = isBoss ? BOSS_SIZE : NODE_SIZE;

  switch (state) {
    case 'locked':
      return <LockedNode size={size} />;
    case 'completed':
      return <CompletedNode size={size} onClick={onClick} />;
    case 'current':
      return (
        <CurrentNode
          size={size}
          isBoss={isBoss}
          nodeGradient={nodeGradient}
          shadowColor={shadowColor}
          onClick={onClick}
        />
      );
    case 'upcoming':
      return (
        <UpcomingNode
          size={size}
          milestoneLevel={milestoneLevel}
          nodeGradient={nodeGradient}
          shadowColor={shadowColor}
        />
      );
  }
}
