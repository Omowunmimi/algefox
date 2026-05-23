'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { useGameStore } from '@/stores/useGameStore';

export function AchievementToast() {
  const pendingToasts = useGameStore((s) => s.pendingToasts);
  const dismissToast = useGameStore((s) => s.dismissToast);

  const current = pendingToasts[0] ?? null;

  useEffect(() => {
    if (!current) return;
    const timer = setTimeout(() => {
      dismissToast();
    }, 3500);
    return () => clearTimeout(timer);
  }, [current, dismissToast]);

  return (
    <div className="fixed top-4 left-4 right-4 z-50 flex justify-center pointer-events-none">
      <div className="w-full max-w-sm pointer-events-auto">
        <AnimatePresence mode="wait">
          {current && (
            <motion.div
              key={current.achievement.id}
              initial={{ y: -80, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -60, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="bg-white border-2 border-gold rounded-2xl p-4"
              style={{ boxShadow: 'var(--shadow-physical-gold)' }}
              onClick={dismissToast}
              role="alert"
              aria-live="assertive"
            >
              {/* Row 1: header label */}
              <p className="font-display text-sm font-bold text-gold mb-2">
                🏆 Achievement Unlocked!
              </p>

              {/* Row 2: icon + title */}
              <div className="flex items-center gap-3 mb-2">
                <span
                  className="text-3xl shrink-0"
                  aria-hidden="true"
                >
                  {current.achievement.icon}
                </span>
                <span className="font-display text-lg font-semibold text-gray-900">
                  {current.achievement.title}
                </span>
              </div>

              {/* Row 3: XP badge */}
              <Badge variant="gold" size="sm">
                +{current.xpGained} XP
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
