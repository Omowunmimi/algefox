'use client';

import React from 'react';
import { X, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
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
      style={{ boxShadow: '0 2px 0 0 rgba(0,0,0,0.10)' }}
    >
      <span className="text-base leading-none">{icon}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LessonHeader({
  current,
  total,
  hearts,
  sectionTitle,
  onClose,
}: LessonHeaderProps) {
  const progressPercent = total > 0 ? ((current - 1) / total) * 100 : 0;

  return (
    <header className={cn('fixed top-0 left-0 right-0 z-50 bg-white shadow-sm')}>
      {/* Utility bar */}
      <div className="px-4 pt-3 pb-2">
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
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #8A2BE2, #5B1483)' }}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Hearts pill */}
          <div className="flex-shrink-0">
            <LessonStatPill
              icon={<Heart size={14} fill="#F43F5E" stroke="#E11D48" strokeWidth={0.5} />}
              value={hearts}
            />
          </div>
        </div>

        {/* Sub-row: question counter + section */}
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
    </header>
  );
}
