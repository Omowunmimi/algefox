'use client';

import { X } from 'lucide-react';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { HeartDisplay } from '@/components/gamification/HeartDisplay';
import { cn } from '@/lib/utils/cn';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LessonHeaderProps {
  current: number;      // current question number (1-indexed)
  total: number;        // total questions
  hearts: number;       // current hearts
  maxHearts: number;
  sectionTitle: string;
  onClose: () => void;  // shows "quit lesson?" confirmation
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

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50',
        'bg-white shadow-sm',
        'px-4 pt-3 pb-2',
      )}
    >
      {/* Main row: close | progress bar | hearts */}
      <div className="flex items-center gap-3">
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Quit lesson"
          className={cn(
            'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
            'text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors duration-150',
          )}
        >
          <X size={20} strokeWidth={2.5} />
        </button>

        {/* Progress bar (flex-1 to fill space) */}
        <div className="flex-1">
          <ProgressBar
            value={progressPercent}
            variant="primary"
            size="thin"
            animated
          />
        </div>

        {/* Heart display */}
        <div className="flex-shrink-0">
          <HeartDisplay hearts={hearts} maxHearts={maxHearts} size="sm" />
        </div>
      </div>

      {/* Sub-row: counter + section title */}
      <div className="flex items-center justify-center gap-2 mt-1">
        <span className="font-ui text-xs text-gray-400">
          {current} / {total}
        </span>
        {sectionTitle && (
          <>
            <span className="text-gray-300 text-xs">·</span>
            <span className="font-ui text-xs text-gray-400 truncate max-w-[160px]">
              {sectionTitle}
            </span>
          </>
        )}
      </div>
    </header>
  );
}
