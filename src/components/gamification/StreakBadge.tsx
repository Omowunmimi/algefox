'use client';

import { cn } from '@/lib/utils/cn';

interface StreakBadgeProps {
  streak: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

function getStreakColor(streak: number): string {
  if (streak === 0)   return 'text-gray-400';
  if (streak <= 2)    return 'text-primary';
  if (streak <= 6)    return 'text-orange-500';
  if (streak <= 29)   return 'text-orange-600';
  return 'text-red-500';
}

export function StreakBadge({ streak, size = 'sm', showLabel }: StreakBadgeProps) {
  const displayLabel = showLabel ?? size === 'lg';
  const color = getStreakColor(streak);

  if (size === 'lg') {
    return (
      <div className={cn('flex flex-col items-center gap-0.5', color)}>
        <div className="flex items-center gap-1">
          <span className="text-3xl leading-none" aria-hidden="true">🔥</span>
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
      <div className={cn('flex items-center gap-1', color)}>
        <span className="text-xl leading-none" aria-hidden="true">🔥</span>
        <span className="font-display font-bold text-xl leading-none">{streak}</span>
        {displayLabel && (
          <span className="font-ui text-xs font-semibold opacity-80">
            {streak === 1 ? 'day' : 'days'}
          </span>
        )}
      </div>
    );
  }

  // sm — compact inline badge
  return (
    <div
      className={cn(
        'inline-flex items-center gap-0.5 font-ui font-semibold text-sm',
        color,
      )}
      aria-label={`${streak} day streak`}
    >
      <span className="leading-none" aria-hidden="true">🔥</span>
      <span className="font-display font-bold leading-none">{streak}</span>
      {displayLabel && (
        <span className="text-xs opacity-80">{streak === 1 ? 'day' : 'days'}</span>
      )}
    </div>
  );
}
