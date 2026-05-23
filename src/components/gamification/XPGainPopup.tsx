'use client';

import { Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface XPGainPopupProps {
  xp: number;
  visible: boolean;
  onComplete?: () => void;
}

export function XPGainPopup({ xp, visible, onComplete }: XPGainPopupProps) {
  if (!visible) return null;

  return (
    <motion.div
      initial={{ y: 0, opacity: 1 }}
      animate={{ y: -60, opacity: 0 }}
      transition={{ duration: 1.5, ease: 'easeOut' }}
      onAnimationComplete={onComplete}
      className="absolute inset-x-0 flex justify-center pointer-events-none"
      aria-hidden="true"
    >
      <div className="flex items-center gap-1 font-display text-xl font-bold text-gold">
        <Zap className="w-5 h-5 shrink-0 fill-gold text-gold" />
        <span>+{xp} XP</span>
      </div>
    </motion.div>
  );
}
