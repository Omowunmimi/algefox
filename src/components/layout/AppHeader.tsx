'use client';

import { useUserStore } from '@/stores/useUserStore';
import { useStreakStore } from '@/stores/useStreakStore';
import { StreakBadge } from '@/components/gamification/StreakBadge';
import { HeartDisplay } from '@/components/gamification/HeartDisplay';
import { XPDisplay } from '@/components/gamification/XPDisplay';

export function AppHeader() {
  const stats = useUserStore((s) => s.stats);
  const currentStreak = useStreakStore((s) => s.currentStreak);

  const hearts = stats?.hearts ?? 0;
  const maxHearts = stats?.maxHearts ?? 5;
  const totalXp = stats?.totalXp ?? 0;
  const level = stats?.level ?? 1;

  return (
    <header className="sticky top-0 z-10 bg-white shadow-sm">
      <div
        className="flex items-center gap-3 px-4"
        style={{ height: '52px' }}
      >
        {/* Left: Streak */}
        <div className="shrink-0">
          <StreakBadge streak={currentStreak} size="sm" />
        </div>

        {/* Center: XP progress */}
        <div className="flex-1 min-w-0">
          <XPDisplay totalXp={totalXp} level={level} />
        </div>

        {/* Right: Hearts */}
        <div className="shrink-0">
          <HeartDisplay hearts={hearts} maxHearts={maxHearts} size="sm" />
        </div>
      </div>
    </header>
  );
}
