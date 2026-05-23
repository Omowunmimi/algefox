'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface PathNodeProps {
  sectionId: string;
  sectionSlug: string;
  sectionTitle: string;
  subject: 'fractions' | 'algebra';
  currentLevel: number;
  isUnlocked: boolean;
  isActive: boolean;
  position: 'left' | 'right' | 'center';
}

function FractionIcon() {
  return (
    <div className="flex flex-col items-center leading-none select-none">
      <span className="text-white font-display font-bold text-lg leading-none">1</span>
      <div className="w-5 h-0.5 bg-white my-0.5 rounded-full" />
      <span className="text-white font-display font-bold text-lg leading-none">2</span>
    </div>
  );
}

function AlgebraIcon() {
  return (
    <span className="text-white font-display font-bold text-2xl select-none leading-none">
      x
    </span>
  );
}

export function PathNode({
  sectionId,
  sectionSlug,
  sectionTitle,
  subject,
  currentLevel,
  isUnlocked,
  isActive,
  position,
}: PathNodeProps) {
  const router = useRouter();

  const isFractions = subject === 'fractions';
  const bgColor = isFractions ? 'bg-primary' : 'bg-secondary';
  const shadowColor = isFractions
    ? 'var(--shadow-physical-primary)'
    : 'var(--shadow-physical-secondary)';

  function handleClick() {
    if (!isUnlocked) return;
    router.push(`/lesson/${sectionSlug}/${currentLevel}`);
  }

  const alignClass =
    position === 'left'
      ? 'self-start ml-6'
      : position === 'right'
        ? 'self-end mr-6'
        : 'self-center';

  return (
    <div className={cn('flex flex-col items-center gap-2', alignClass)}>
      {/* "You are here" indicator */}
      {isActive && (
        <div className="flex items-center gap-1 bg-gold text-white text-xs font-ui font-bold px-2 py-0.5 rounded-full">
          <span>You are here</span>
        </div>
      )}

      {/* Circle node */}
      <motion.button
        onClick={handleClick}
        disabled={!isUnlocked}
        whileHover={isUnlocked ? { scale: 1.05 } : undefined}
        whileTap={isUnlocked ? { scale: 0.95, y: 4, boxShadow: 'none' } : undefined}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={
          isUnlocked
            ? { boxShadow: shadowColor }
            : undefined
        }
        className={cn(
          'relative rounded-full flex items-center justify-center shrink-0 transition-all',
          'w-20 h-20',
          isUnlocked
            ? cn(bgColor, 'cursor-pointer')
            : 'bg-gray-200 cursor-not-allowed',
          isActive && 'ring-4 ring-offset-2',
          isActive && isFractions ? 'ring-primary/50' : isActive ? 'ring-secondary/50' : '',
        )}
        aria-label={
          isUnlocked
            ? `${sectionTitle} — Level ${currentLevel}`
            : `${sectionTitle} — Locked`
        }
      >
        {/* Pulsing ring for active */}
        {isActive && (
          <span
            className={cn(
              'absolute inset-0 rounded-full opacity-50',
              isFractions ? 'bg-primary' : 'bg-secondary',
            )}
            style={{ animation: 'breathe 3s ease-in-out infinite' }}
          />
        )}

        {/* Icon */}
        {isUnlocked ? (
          isFractions ? <FractionIcon /> : <AlgebraIcon />
        ) : (
          <Lock className="w-7 h-7 text-gray-400" />
        )}
      </motion.button>

      {/* Label below */}
      <div className="flex flex-col items-center gap-0.5 text-center max-w-[96px]">
        <span
          className={cn(
            'font-ui text-xs font-semibold leading-tight line-clamp-2 text-center',
            isUnlocked ? 'text-gray-700' : 'text-gray-400',
          )}
        >
          {sectionTitle}
        </span>
        <span
          className={cn(
            'font-ui text-[10px] font-bold px-1.5 py-0.5 rounded-full',
            isUnlocked
              ? isFractions
                ? 'bg-primary-light text-primary-darker'
                : 'bg-secondary-light text-secondary-darker'
              : 'bg-gray-100 text-gray-400',
          )}
        >
          Lv.{currentLevel}
        </span>
      </div>
    </div>
  );
}
