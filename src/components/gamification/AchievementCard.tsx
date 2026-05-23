'use client';

import { Lock } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';
import type { Achievement } from '@/types/gamification.types';

interface AchievementCardProps {
  achievement: Achievement;
  compact?: boolean;
}

export function AchievementCard({ achievement, compact = false }: AchievementCardProps) {
  const { title, description, icon, xpReward, earned } = achievement;

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'flex items-center justify-center rounded-full text-2xl shrink-0',
            'w-10 h-10',
            earned ? 'bg-gold-lighter' : 'bg-gray-100 grayscale opacity-60',
          )}
          aria-hidden="true"
        >
          {icon}
        </span>
        <span className="flex-1 min-w-0">
          <span className="font-display text-sm font-semibold text-gray-900 block truncate">
            {title}
          </span>
        </span>
        <Badge variant="gold" size="sm">
          +{xpReward} XP
        </Badge>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-white rounded-2xl p-4 border-2 transition-all',
        earned
          ? 'border-gold bg-gold-lighter/30'
          : 'border-gray-200 opacity-60 grayscale',
      )}
      style={earned ? { boxShadow: 'var(--shadow-physical-gold)' } : undefined}
    >
      {/* Icon circle */}
      <div className="relative w-16 h-16 mx-auto mb-3">
        <div
          className={cn(
            'w-16 h-16 rounded-full flex items-center justify-center text-3xl',
            earned ? 'bg-gold-lighter' : 'bg-gray-100',
          )}
          aria-hidden="true"
        >
          {icon}
        </div>
        {!earned && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30">
            <Lock className="w-6 h-6 text-white" />
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="font-display text-lg font-semibold text-gray-900 text-center mb-1">
        {title}
      </h3>

      {/* Description */}
      <p className="font-ui text-sm text-gray-600 text-center mb-3">
        {description}
      </p>

      {/* XP badge */}
      <div className="flex justify-center">
        <Badge variant="gold" size="sm">
          +{xpReward} XP
        </Badge>
      </div>
    </div>
  );
}
