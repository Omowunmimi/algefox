'use client';

import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface StreakBadgeProps {
  streak: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

function getFlameColor(streak: number): string {
  if (streak === 0)  return '#9CA3AF';   // gray
  if (streak <= 2)   return '#8A2BE2';   // primary purple
  if (streak <= 6)   return '#F97316';   // orange
  if (streak <= 29)  return '#EA580C';   // deep orange
  return '#DC2626';                       // red-hot
}

export function StreakBadge({ streak, size = 'sm', showLabel }: StreakBadgeProps) {
  const displayLabel = showLabel ?? size === 'lg';
  const color = getFlameColor(streak);

  if (size === 'lg') {
    return (
      <div className="flex flex-col items-center gap-0.5" style={{ color }}>
        <div className="flex items-center gap-1">
          <Flame size={32} fill={color} stroke={color} strokeWidth={0.5} />
          <span className="font-display font-bold text-4xl leading-none">{streak}</span>
        </div>
        {displayLabel && (
          <span className="font-ui text-sm font-semibold opacity-80">
            {streak === 1 ? 'day streak' : 'days streak'}
          </span>
        )}
      </div>
    );
  }

  if (size === 'md') {
    return (
      <div className="flex items-center gap-1" style={{ color }}>
        <Flame size={22} fill={color} stroke={color} strokeWidth={0.5} />
        <span className="font-display font-bold text-xl leading-none">{streak}</span>
        {displayLabel && (
          <span className="font-ui text-xs font-semibold opacity-80">
            {streak === 1 ? 'day' : 'days'}
          </span>
        )}
      </div>
    );
  }

  // sm
  return (
    <div
      className={cn('inline-flex items-center gap-0.5 font-ui font-semibold text-sm')}
      style={{ color }}
      aria-label={`${streak} day streak`}
    >
      <Flame size={16} fill={color} stroke={color} strokeWidth={0.5} />
      <span className="font-display font-bold leading-none">{streak}</span>
      {displayLabel && (
        <span className="text-xs opacity-80">{streak === 1 ? 'day' : 'days'}</span>
      )}
    </div>
  );
}
