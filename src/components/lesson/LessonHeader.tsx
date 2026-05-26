'use client';

import { X, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

interface LessonHeaderProps {
  current: number;
  total: number;
  hearts: number;
  maxHearts: number;
  sectionTitle: string;
  onClose: () => void;
}

function Hearts({ count, max }: { count: number; max: number }) {
  return (
    <div className="flex items-center gap-0.5 flex-shrink-0">
      {Array.from({ length: max }, (_, i) => (
        <Heart
          key={i}
          size={18}
          fill={i < count ? '#F43F5E' : '#E5E7EB'}
          stroke={i < count ? '#E11D48' : '#D1D5DB'}
          strokeWidth={0.5}
        />
      ))}
    </div>
  );
}

export function LessonHeader({
  current,
  total,
  hearts,
  maxHearts,
  sectionTitle,
  onClose,
}: LessonHeaderProps) {
  const progressPercent = total > 0 ? ((current - 1) / total) * 100 : 0;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      {/* Main row */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Quit lesson"
          className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 border border-gray-200 transition-colors"
        >
          <X size={18} strokeWidth={2.5} />
        </button>

        {/* Title + count */}
        <div className="flex-1 min-w-0">
          <p className="font-display text-sm font-bold text-gray-800 truncate">
            Lesson {current} · {sectionTitle}
          </p>
        </div>

        {/* Current / total */}
        <span className="font-display text-sm font-bold text-gray-700 flex-shrink-0 tabular-nums">
          {current} / {total}
        </span>

        {/* Hearts */}
        <Hearts count={hearts} max={maxHearts} />
      </div>

      {/* Full-width progress bar */}
      <div className="w-full h-2" style={{ background: '#EDE9FE' }}>
        <motion.div
          className="h-full"
          style={{ background: 'linear-gradient(90deg, #8A2BE2, #7C3AED)' }}
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
    </header>
  );
}
