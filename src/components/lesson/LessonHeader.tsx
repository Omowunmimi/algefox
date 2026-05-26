'use client';

import React from 'react';
import { X, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { FoxyImage } from '@/components/mascot/FoxyImage';
import { cn } from '@/lib/utils/cn';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LessonHeaderProps {
  current: number;      // current question number (1-indexed)
  total: number;        // total questions
  hearts: number;       // current hearts
  maxHearts: number;
  sectionTitle: string;
  onClose: () => void;
}

// ─── Stat Pill ────────────────────────────────────────────────────────────────

function LessonStatPill({ icon, value }: { icon: React.ReactNode; value: string | number }) {
  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white font-display text-sm font-bold text-gray-800"
      style={{ boxShadow: '0 2px 0 0 rgba(0,0,0,0.12)' }}
    >
      <span className="text-base leading-none">{icon}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

// ─── Encouraging phrases ──────────────────────────────────────────────────────

const PHRASES = [
  "You've got this! 💪",
  "Stay sharp! ⚡",
  "Keep going! 🚀",
  "You're doing great! 🦊",
];

function getPhrase(current: number) {
  return PHRASES[(current - 1) % PHRASES.length];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LessonHeader({
  current,
  total,
  hearts,
  maxHearts,
  sectionTitle,
  onClose,
}: LessonHeaderProps) {
  const progressPercent = total > 0 ? ((current - 1) / total) * 100 : 0;
  const phrase = getPhrase(current);

  return (
    <header className={cn('fixed top-0 left-0 right-0 z-50 flex flex-col')}>
      {/* ── Row 1: utility bar (white bg) ── */}
      <div className="bg-white border-b border-gray-100 px-4 pt-3 pb-2">
        <div className="flex items-center gap-3">
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Quit lesson"
            className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors border-2 border-gray-200"
          >
            <X size={18} strokeWidth={2.5} />
          </button>

          {/* Progress bar */}
          <div className="flex-1 relative">
            <div
              className="w-full rounded-full overflow-hidden bg-gray-100"
              style={{ height: '10px' }}
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${current} of ${total} questions`}
            >
              <motion.div
                className="h-full rounded-full bg-gold"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Stat pills */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <LessonStatPill
              icon={<Heart size={14} fill="#F43F5E" stroke="#E11D48" strokeWidth={0.5} />}
              value={hearts}
            />
          </div>
        </div>

        {/* Sub-row: counter */}
        <div className="flex items-center justify-center gap-2 mt-1.5">
          <span className="font-ui text-xs font-bold text-gray-500">
            Question <span className="text-primary font-black">{current}</span> of {total}
          </span>
          {sectionTitle && (
            <>
              <span className="text-gray-300 text-xs">·</span>
              <span className="font-ui text-xs text-gray-400 truncate max-w-[140px]">{sectionTitle}</span>
            </>
          )}
        </div>
      </div>

      {/* ── Row 2: dark purple mascot section ── */}
      <div
        className="relative overflow-hidden flex items-end px-5 pb-0"
        style={{
          background: 'linear-gradient(160deg, #5B1483 0%, #8A2BE2 100%)',
          minHeight: '100px',
        }}
      >
        {/* Confetti dots */}
        {[
          { x: '12%', y: '20%', color: '#FCD34D', size: 8 },
          { x: '80%', y: '15%', color: '#F97316', size: 6 },
          { x: '65%', y: '60%', color: '#34D399', size: 7 },
          { x: '20%', y: '65%', color: '#F472B6', size: 5 },
          { x: '88%', y: '50%', color: '#FCD34D', size: 9 },
          { x: '45%', y: '10%', color: '#60A5FA', size: 6 },
        ].map((dot, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{ left: dot.x, top: dot.y, width: dot.size, height: dot.size, background: dot.color }}
            animate={{ y: [0, -5, 0], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2 + i * 0.3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
          />
        ))}

        {/* Mascot */}
        <motion.div
          className="relative z-10 -mb-2"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <FoxyImage expression="excited" size={88} />
        </motion.div>

        {/* Speech bubble */}
        <div
          className="relative z-10 ml-3 mb-5 px-4 py-2.5 rounded-2xl bg-white max-w-[200px]"
          style={{ boxShadow: '0 3px 12px rgba(0,0,0,0.15)' }}
        >
          {/* Tail pointing left */}
          <span
            className="absolute -left-2 top-4"
            aria-hidden="true"
            style={{
              width: 0,
              height: 0,
              borderTop: '7px solid transparent',
              borderBottom: '7px solid transparent',
              borderRight: '9px solid white',
            }}
          />
          <p className="font-ui text-sm font-semibold text-gray-800">{phrase}</p>
        </div>
      </div>
    </header>
  );
}
